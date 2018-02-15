(function () {
  'use strict';

  angular.module('app')
    .controller('LayoutCtrl', ['$rootScope', '$uibModal', '$scope', '$state', 'localStorageService', 'generalUtils', 'socket', 'toastHelper', 'showNotifications', LayoutCtrl]);

  function LayoutCtrl($rootScope, $uibModal, $scope, $state, localStorageService, generalUtils, socket, toastHelper, showNotifications) {

    $scope.ctrl = localStorageService.get('displayables');
    $scope.authentication = localStorageService.get('authentication');

    if ($scope.ctrl.email.includes("automobi.com.br"))
      $scope.chatActive = true;
    else
      $scope.chatActive = $scope.authentication.modules.chat;

    _.extend($scope.ctrl, {
      matchComplete: false
    });

    socket.removeAllListeners('analysisComplete');
    socket.removeAllListeners('analysisError');
    socket.removeAllListeners('errStartNewCampaign');
    socket.removeAllListeners('startNewCampaignComplete');
    socket.removeAllListeners('startNewCampaign');
    socket.removeAllListeners('SLA_scheduleRequest');
    socket.removeAllListeners('SLA_noShow');


    socket.on('SLA_scheduleRequest', function (data) {
      if (!data.status && !data.payload.leftTime) return;
      showNotifications.show(data.status, data.payload)
    });

    socket.on('analysisComplete', function (data) {
      $rootScope.$emit('analysisComplete', data);
    });

    $scope.reportBug = function () {
      amplitude.getInstance().logEvent('Clicou em reportar um bug');
      var modal = $uibModal.open({
        templateUrl: 'app/report-bug/report-bug.html',
        controller: 'ReportBugCtrl',
        controllerAs: 'ctrl',
        size: 'md'
      });
    };

    socket.on('analysisError', function (err) {
      generalUtils.hideLoader();
      var config = {
        content: 'Ocorreu um erro ao analisar seu arquivo, por favor tente novamente!',
        actionText: 'Tentar novamente',
        delay: 6000
      };
      toastHelper.toastAction(config).then(function (response) {
        if (response === 'ok') {
          $state.reload();
        }
      });
    });

    socket.on('errStartNewCampaign', function (err) {
      generalUtils.hideLoader();
      var config = {
        content: 'Ocorreu um erro ao iniciar a campanha, por favor tente novamente!',
        actionText: 'Tentar novamente',
        delay: 6000
      };
      toastHelper.toastAction(config).then(function (response) {
        if (response === 'ok') {
          $state.go('campaigns.matches');
        }
      });
    });

    socket.on('startNewCampaignComplete', function (data) {
      generalUtils.hideLoader();
      $scope.toggleBadge('campaignResult', true);
      var config = {
        content: 'Campanha anunciada com sucesso!',
        actionText: 'Ver relatório',
        delay: 2000
      };
      toastHelper.toastAction(config).then(function (response) {
        if (response === 'ok') {
          $state.go('campaigns.report');
        }
      });
    });

    socket.on('startNewCampaign', function (data) {
      generalUtils.startLoader();
      var config = {
        content: 'Disparando campanha...',
      };
      toastHelper.toastSimple(config);
    });

    $scope.toggleBadge = function (location, isActive) {
      var currentDisplayables = localStorageService.get('displayables');
      switch (location) {
        case 'campaignAnalysis':
          localStorageService.set('displayables', _.extend(currentDisplayables, {
            badges: {
              'campaignAnalysis': isActive
            }
          }));
          $scope.ctrl = localStorageService.get('displayables');
          break;
        case 'campaignResult':
          localStorageService.set('displayables', _.extend(currentDisplayables, {
            badges: {
              'campaignResult': isActive
            }
          }));
          $scope.ctrl = localStorageService.get('displayables');
          break;

      }
    };

    if (!$scope.authentication || !$scope.authentication.scheduleModule) {
      $scope.logoff();
    }
  }

})();
