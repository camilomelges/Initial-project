(function () {
  'use strict';

  angular
    .module('io-socket', ['environment'])
    .factory('socket', ["$rootScope", "io", "generalUtils", "authService", "toastHelper", 'environment',
      function ($rootScope, io, generalUtils, authService, toastHelper, environment) {
        var socket,
          events = {},
          that = {};

        var connectionParams = {
          server: environment.get().socket
        };


        var addCallback = function (name, callback) {
          var event = events[name],
            wrappedCallback = wrapCallback(callback);

          if (!event) {
            event = events[name] = [];
          }

          event.push({callback: callback, wrapper: wrappedCallback});
          return wrappedCallback;
        };

        var removeCallback = function (name, callback) {
          var event = events[name],
            wrappedCallback;

          if (event) {
            for (var i = event.length - 1; i >= 0; i--) {
              if (event[i].callback === callback) {
                wrappedCallback = event[i].wrapper;
                event.slice(i, 1);
                break;
              }
            }
          }
          return wrappedCallback;
        };

        var removeAllCallbacks = function (name) {
          delete events[name];
        };

        var wrapCallback = function (callback) {
          var wrappedCallback = angular.noop;

          if (callback) {
            wrappedCallback = function () {
              var args = arguments;
              $rootScope.$apply(function () {
                callback.apply(socket, args);
              });
            };
          }
          return wrappedCallback;
        };

        var listener = function (name, callback) {
          return {
            bindTo: function (scope) {
              if (scope != null) {
                scope.$on('$destroy', function () {
                  that.removeListener(name, callback);
                });
              }
            }
          };
        };

        function registerEvents() {
          socket.removeAllListeners('connect_error');
          socket.removeAllListeners('disconnect');
          socket.removeAllListeners('newMessage');
          socket.removeAllListeners('newSchedule');
          socket.removeAllListeners('analysisComplete');
          socket.removeAllListeners('analysisError');
          socket.removeAllListeners('errStartNewCampaign');
          socket.removeAllListeners('startNewCampaignComplete');
          socket.removeAllListeners('startNewCampaign');
          socket.removeAllListeners('SLA_scheduleRequest');
          socket.removeAllListeners('newScheduleRequest');
          socket.removeAllListeners('removeChatFromOtherAttendants');
          socket.removeAllListeners('newSchedulefromCRM');
          socket.removeAllListeners('SLA_noShow');

          socket.on("connect_error", function () {
            generalUtils.hideLoader();
            toastHelper.toastBadSocketConnection();
          });
          socket.on('disconnect', function () {
            generalUtils.hideLoader();
            toastHelper.toastBadSocketConnection();
          });
        }

        $rootScope.$on('logOff', function () {
          socket.emit('logOff');
        });

        that = {
          connect: function (server) {
            socket = io.connect(server)
          },
          connectNameSpace: function (params, callback) {
            _.extend(connectionParams, params);
            socket = io.connect(connectionParams.server + "/" + connectionParams.namespace, {
              query: {
                namespace: connectionParams.namespace,
                room: connectionParams.room,
                token: connectionParams.token
              },
              'sync disconnect on unload': true
            });

            registerEvents();
            socket.on('connect', function () {
              generalUtils.hideLoader();
              callback();
            });

            socket.on('reconnect', function () {
              generalUtils.hideLoader();
              if (authService.verifyUser()) {
                socket.emit('logOff');
                socket.emit('logOn');
              }
              toastHelper.toastConnectionSuccessful();
              callback();
            });
          },
          on: function (name, callback) {
            socket.on(name, addCallback(name, callback));
            return listener(name, callback);
          },
          once: function (name, callback) {
            socket.once(name, addCallback(name, callback));
            return listener(name, callback);
          },
          removeListener: function (name, callback) {
            socket.removeListener(name, removeCallback(name, callback));
          },
          removeAllListeners: function (name) {
            socket.removeAllListeners(name);
            removeAllCallbacks(name);
          },
          emit: function (name, data, callback) {
            if (callback) {
              socket.emit(name, data, wrapCallback(callback));
            }
            else {
              socket.emit(name, data);
            }
          }
        };

        return that;
      }])
    .factory('io', function () {
      return io;
    });

}());
