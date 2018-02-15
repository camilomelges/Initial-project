/**
 * Created by keyboard99 on 8/1/17.
 */
(function () {
  'use strict';

  angular.module('app')
    .controller('UpdateKmModalCtrl', ['$scope', '$filter', 'Vehicle', 'Restangular', '$stateParams', '$state', '$uibModalInstance', 'generalUtils', UpdateKmModalCtrl]);

  function UpdateKmModalCtrl($scope, $filter, Vehicle, Restangular, $stateParams, $state, $uibModalInstance, generalUtils) {

    $scope.close = function () {
      $uibModalInstance.close({reason: 'cancel'});
    };

    $scope.ctrl = {
      isWaiting: false
    };

    $scope.updateKm = function (form_constraints) {
      if(!form_constraints.$valid) return ;
      amplitude.getInstance().logEvent('Clicou para salvar a quilometragem de veículo');
      generalUtils.startLoader();
      $scope.ctrl.isWaiting = true;

      var requestBody = {
        km: ($scope.updatedKm) ? $scope.updatedKm.toString() : undefined,
        vehicleId: Vehicle._id
      };

      Restangular.all("/vehicles/updatekm").customPUT(requestBody).then(function (success) {
        $scope.ctrl.isWaiting = false;
        generalUtils.hideLoader();
        $uibModalInstance.close({reason: 'update', km: success.km, lastKmUpdate: success.lastKmUpdate});
      }, function (error) {
        $scope.ctrl.isWaiting = false;
        generalUtils.hideLoader();
        $uibModalInstance.close({reason: 'error-update'});
      });
    }
  }

})();
