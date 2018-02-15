/**
 * Created by atomicavocado on 19/01/17.
 */

(function () {
  'use strict';
  angular.module('app')
    .controller('CampaignDetailsController', ['$scope', 'Campaign', CampaignDetailsController]);

  function CampaignDetailsController($scope, Campaign) {
    $scope.ctrl = {
      'id': Campaign.shortid,
      'date': moment(Campaign.dateCreate).locale('pt-BR').format('LLL'),
      'currentTab': 'notConverted',
      'showing': [],
      'converted': [],
      'notConverted': []
    };
    _.forEach(Campaign.clients, function(client) {
      if (client.didSchedule) {
        $scope.ctrl.converted.push(client)
      } else {
        $scope.ctrl.notConverted.push(client)
      }
    });

    $scope.ctrl.showing = $scope.ctrl.notConverted;

    $scope.showConverted = function(){
      $scope.ctrl.currentTab = 'converted';
      $scope.ctrl.showing = $scope.ctrl.converted;
    };

    $scope.showNotConverted = function(){
      $scope.ctrl.currentTab = 'notConverted';
      $scope.ctrl.showing = $scope.ctrl.notConverted;
    };
  }
})();
