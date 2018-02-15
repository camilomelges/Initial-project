(function () {
  'use strict';

  angular.module('app')
    .controller('LoginCtrl', ['$rootScope', '$scope', 'Restangular', '$state', 'localStorageService', 'generalUtils', 'permissionHelper', 'authService', 'socket', 'environment', '$q', '$http', 'showNotifications', LoginCtrl]);

  function LoginCtrl($rootScope, $scope, Restangular, $state, localStorageService, generalUtils, permissionHelper, authService, socket, environment, $q, $http, showNotifications) {
    $scope.ctrl = {
      branches: '',
      selectedBranch: '',
      email: '',
      password: ''
    };

    var loginData = '';

    $scope.login = function (valid) {
      if (valid) {
        generalUtils.startLoader();
        var credentials = {
          email: $scope.ctrl.email,
          password: $scope.ctrl.password
        };

        authService.login(credentials).then(function (user) {
          loginData = user;
          _.map(user.branches, function (value) {
            value['fullBranchName'] = value.companyName + ' - ' + value.partner.companyName;
          });

          $scope.ctrl.branches = user.branches;
          generalUtils.hideLoader();
        }, function (err) {
          generalUtils.hideLoader();
          var message = '';

          switch (err.status) {
            case 404:
              message = 'Not Found';
              break;
            case 409:
              message = 'Usuário / Senha inválidos';
              break;
            default:
              message = 'Usuário / Senha inválidos';
          }

          generalUtils.onError(
            'Ops!',
            message,
            'Confirmar',
            function (isConfirm) {

            });
        });
      }
    };

    $scope.setupAuth = function (valid) {
      generalUtils.startLoader();
      if (valid) {
        var authentication = {
          'staff': loginData._id,
          'cpf': loginData.cpf,
          'token': loginData.token,
          'branch': $scope.ctrl.selectedBranch._id,
          'partner': $scope.ctrl.selectedBranch.partner._id,
          'role': loginData.role,
          'scheduleModule': $scope.ctrl.selectedBranch.partner.scheduleModule,
          'modules': $scope.ctrl.selectedBranch.partner.modules,
          'pendingActions': loginData.pendingActions
        };

        socket.connectNameSpace({
          namespace: authentication.partner,
          room: authentication.branch,
          token: authentication.token
        }, function () {
          socket.emit('logOn');

          var displayables = {
            'fullname': loginData.name + ' ' + loginData.lastname,
            'branchName': $scope.ctrl.selectedBranch.companyName,
            'partnerName': $scope.ctrl.selectedBranch.partner.companyName,
            'email': $scope.ctrl.email
          };

          function getSidebarValue() {
            return loginData._crmConfig && typeof loginData._crmConfig.isMenuCollapsed === 'boolean' ?
              loginData._crmConfig.isMenuCollapsed : false;
          }

          var configs = {
            'isMenuCollapsed': getSidebarValue()
          };

          $rootScope.$broadcast('isMenuCollapsed', getSidebarValue());

          permissionHelper.setRole(authentication, displayables);

          localStorageService.set('configs', configs);
          localStorageService.set('displayables', displayables);
          localStorageService.set('authentication', authentication);

          Restangular.setDefaultHeaders({
            'authorization': authentication.token,
            'branch': authentication.branch,
            'partner': authentication.partner,
            'staff': authentication.staff
          }).setDefaultHttpFields({
              'authorization': authentication.token,
              'branch': authentication.branch,
              'partner': authentication.partner
            });

          getSLABranch(authentication.branch).then(function (response) {
            _.forEach(response.data.payload, function (key, value) {
              var status = value.toString();
              value = response.data.payload[value];

              if (_.isEmpty(value)) return;

              _.forEach(value, function (scheduleRequest) {
                showNotifications.show(status, scheduleRequest);
              })
            });

            Restangular.all('chat').getList().then(function (res) {
              var chats = Restangular.stripRestangular(res);

              chats = _.chain(chats).filter(chats, function (v) {
                return v.unreadInCRM
              })
                .map(chats, function (chat) {
                  var newChat = {
                    type: 'chat',
                    body: chat.lastMessage
                  };
                  _.extend(newChat.body, {chatId: chat._id});
                  chat = newChat;
                  return newChat;
                }).value();

              if (!_.isEmpty(chats)) {
                localStorageService.set('notificationCount', chats.length);
                localStorageService.set('notificationList', JSON.stringify(chats));
              }

              amplitude.getInstance().logEvent('Usuário logou no sistema');
              $state.go('dashboard');

            }, function (err) {
              generalUtils.hideLoader();
              console.log(err);
            })
          });
        });
      } else {
        generalUtils.hideLoader();
      }
    };

    function getSLABranch(branchID) {
      var deferred = $q.defer();

      $http({
        method: 'GET',
        url: environment.get().sla + '/sla/branch/' + branchID
      }).then(function (data) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    }

    $scope.backFromSelectUnity = function () {
      authService.logoff();
      loginData = '';
      $state.reload();
    }

  }

})();
