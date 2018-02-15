(function () {
  'use strict';
  angular.module('app').controller('ToolbarCtrl', ['$timeout', '$rootScope', '$scope', '$window', '$state', 'Restangular', 'localStorageService', 'generalUtils', 'authService', 'socket', 'toastHelper', 'showNotifications', '$uibModal', ToolbarCtrl]);

  function ToolbarCtrl($timeout, $rootScope, $scope, $window, $state, Restangular, localStorageService, generalUtils, authService, socket, toastHelper, showNotifications, $uibModal) {
    $scope.ctrl = localStorageService.get('displayables');
    var staffId = localStorageService.get('authentication').staff;
    var branchId = localStorageService.get('authentication').branch;
    var configs = localStorageService.get('configs');
    $scope.notification = {
      list: [],
      count: 0
    };
    $rootScope.titleCount = 0;
    $rootScope.$watch('staffBranches', function (newVal, oldVal) {
      $scope.ctrl.staffBranches = newVal;
      $scope.ctrl.selectedBranch = _.find($scope.ctrl.staffBranches, function (branch) {
        return branch._id.toString() === branchId.toString();
      })
    });

    $scope.$watch('isMenuCollapsed', function (val) {
      if (typeof val !== 'boolean') return;
      var configs = localStorageService.get('configs') || {};
      configs['isMenuCollapsed'] = val;
      authService.updateConfigs(configs, function (err, data) {
        localStorageService.set('configs', data);
      });
    });
    $rootScope.$broadcast('isMenuCollapsed', configs && configs.isMenuCollapsed ? configs.isMenuCollapsed : false);

    $scope.logoff = function () {
      authService.logoff();
      $state.go('login');
    };

    $scope.changePassword = function () {
      generalUtils.startLoader();
      Restangular.all('forgot-password').post({
        email: $scope.ctrl.email
      }).then(function () {
        generalUtils.hideLoader();
        generalUtils.onSuccess('Sucesso!', 'Instruções para recuperação de senha foram enviadas para o seu e-mail.', 'Confirmar', '', function (isConfirm) {
        });
      }, function (err) {
        generalUtils.hideLoader();
        var message = 'Ocorreu um erro!';
        generalUtils.onError('Ops!', message, 'Confirmar', function (isConfirm) {
        });
      });
    };

    socket.removeAllListeners('newSurvey');
    socket.removeAllListeners('newMessage');
    socket.removeAllListeners('newSchedule');
    socket.removeAllListeners('newScheduleRequest');
    socket.removeAllListeners('finishedBug')


    $rootScope.$on('clearNotificationChat', function () {
      Restangular.one('staffs', staffId).customGET('notifications').then(function (data) {
        if ($state.includes("chat.view") && $state.params.id) {
          var notificationsToRemove = _.map(_.filter(data, function (notification) {
            return notification.body.chatId === $state.params.id;
          }), function (notification) {
            return notification ? notification._id : "";
          });

          if (notificationsToRemove.length > 0)
            Restangular
              .one('staffs/' + staffId + '/notifications/remove')
              .customPUT({ids: notificationsToRemove}).then(function (data) {
              $scope.notification.list = data;
              $scope.notification.count = data.length;
            });
        }
      });
    });

    function getNotificationList(callback) {
      Restangular.one('staffs', staffId).customGET('notifications').then(function (data) {
        if (!$state.includes("chat.view")) {
          $scope.notification.list = data;
          $scope.notification.count = data.length;
          if (callback && typeof callback === 'function') callback();
          return;
        }

        $rootScope.$emit('clearNotificationChat');
        if(callback && typeof callback === 'function') callback();
      });
    }

    getNotificationList();

    function removeNotification(notification, callback) {
      Restangular
        .one('staffs/' + staffId + '/notifications/' + notification._id)
        .remove().then(function (notification) {
        getNotificationList(callback);
      }, function (err) {
        getNotificationList();
      });
    }

    function callChangeBranchBroadcast(branchSelected, callback) {
      $rootScope.$broadcast('changeBranchStartEvent', {
        branchActual: $scope.ctrl.branchName + ' ' + $scope.ctrl.partnerName,
        branchChanged: branchSelected.companyName + ' ' + branchSelected.partner.companyName
      });

      var authentication = localStorageService.get('authentication');
      authentication.branch = branchSelected._id;
      authentication.partner = branchSelected.partner._id;
      authentication.scheduleModule = branchSelected.partner.scheduleModule;
      authentication.modules = branchSelected.partner.modules;

      localStorageService.set('authentication', authentication);

      var displayables = localStorageService.get('displayables');
      displayables.branchName = branchSelected.companyName;
      displayables.partnerName = branchSelected.partner.companyName;
      localStorageService.set('displayables', displayables);

      Restangular
        .setDefaultHeaders({
          'authorization': authentication.token,
          'branch': authentication.branch,
          'partner': authentication.partner,
          'staff': authentication.staff
        })
        .setDefaultHttpFields({
          'authorization': authentication.token,
          'branch': authentication.branch,
          'partner': authentication.partner
        });

      var pendingAction = _.find(authentication.pendingActions, function(action) {
        return (action.branch._id === authentication.branch);
      })

      if (!callback) pendingAction ? $state.go(pendingAction.stateRoute, {id: pendingAction.idAction})
        : $state.reload();

      (!pendingAction && $state.current.name == "schedulerequests.update")
        ? $state.go('schedulerequests'): $state.reload();

      (!pendingAction && $state.current.name == "schedulecreate")
        ? $state.go('schedules') : $state.reload();

      $timeout(function() {
        $rootScope.$broadcast('changeBranchFinishEvent');
        if (callback) {$state.reload(); callback()}
      }, 3000);

    }

    function confirmIfNotificationIsFromActualPartner(actualPartner, notificationPartner, callback) {
      if (actualPartner.toString() !== notificationPartner._id.toString()) {
        generalUtils.onWarning(
          'Atenção', 'Está noficação é do parceiro ' + notificationPartner.companyName + ' deseja trocar de unidade?'
          , 'Sim, eu quero', 'Não, deixe-me aqui',
          function (confirm) {
            if (!confirm) return;
            var availableBranchesFromPartner = _.filter($scope.ctrl.staffBranches, function(branch) {
              return branch.partner._id === notificationPartner._id;
            });

            callChangeBranchBroadcast(availableBranchesFromPartner[0], function () {
              callback();
            });
          });
      }
      else callback();
    }

    $scope.openNotification = function (notification) {
      var safeNotification = angular.copy(notification);
      var partnerId = localStorageService.get('authentication').partner;

      confirmIfNotificationIsFromActualPartner(partnerId, notification.partner, function () {
        removeNotification(notification, function () {
          switch (safeNotification.type) {
            case 'chat':
              requestChatFromAPI(safeNotification.body.customer);
              break;
            case 'schedulerequest':
              $state.go('schedulerequests.view', {id: safeNotification.body._id});
              break;
            case 'schedule':
              $state.go('scheduleview', {id: safeNotification.body._id});
              break;
            case 'bug':
              break;  
            case 'survey':
              $state.go('survey.list', {
                surveyId: safeNotification.body._id,
                surveyQuestion: safeNotification.body.question._id
              });
              break;
          }
        });
      });
    };

    $scope.clearAllNotifications = function () {
      var notificationsToRemove = _.map($scope.notification.list, function (notification) {
        return notification ? notification._id : '';
      });

      if (notificationsToRemove.length > 0)
        Restangular
          .one('staffs/' + staffId + '/notifications/remove')
          .customPUT({ids: notificationsToRemove}).then(function (data) {
          $scope.notification.list = data;
          $scope.notification.count = data.length;
        });
    };

    $scope.changeBranch = function(branchSelected) {
      if ($state.current.name == "schedulecreate") {
        generalUtils.onWarning(
          'Atenção', 'Este agendamento será descartado você realmente deseja trocar de unidade agora?',
          'CONFIRMAR', 'CANCELAR',
          function(confirm) {
            if (!confirm) return;
            callChangeBranchBroadcast(branchSelected);
          });
      } else {
        callChangeBranchBroadcast(branchSelected);
      };

    };

    function requestChatFromAPI(customer) {
      if (!customer) return;

      generalUtils.startLoader();
      Restangular.all('chat').post(customer).then(function (data) {
        generalUtils.hideLoader();

        var config = {
          content: 'Este cliente não está logado no aplicativo!',
          actionText: 'Confirmar',
          delay: 6000
        };

        if (data.err) return toastHelper.toastAction(config);
        confirmChatOpen(data, function () {
          $state.go('chat', {fromChatDirective: true, chat: data}).then(function () {
            getNotificationList();
          });
        });

      }, function (err) {
        generalUtils.hideLoader();
        generalUtils.onError('Ops!', err.data.message, 'Confirmar', function (isConfirm) {
        });
      });
    }

    function confirmChatOpen(chat, callback) {
      if (!chat) return;
      if (!chat.attendant) {
        generalUtils.onWarning(
          'Atenção', 'Você agora vai atender este cliente', 'CONFIRMAR', 'CANCELAR',
          function (confirm) {
            if (!confirm) return;

            callback();
          });

        return;
      }
      if (chat.attendant && chat.attendant._id !== staffId) {
        generalUtils.onWarning(
          'Atenção', 'Chat já em tratativa pelo ' + chat.attendant.name + ' ' + chat.attendant.lastname,
          'CONFIRMAR', '',
          function (confirm) {
          });

        return;
      }


      callback();
    }

    socket.on('newSchedule', function (data) {
      getNotificationList();
    });
    socket.on('newSurvey', function (data) {
      getNotificationList();
    });
    socket.on('newScheduleRequest', function (data) {
      getNotificationList();
    });
    socket.on('newMessage', function (data) {
      getNotificationList();
    });
    socket.on('finishedBug', function (data) {
      getNotificationList();
    });
  }
})();
