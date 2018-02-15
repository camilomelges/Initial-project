/**
 * Created by keyboard99 on 8/1/17.
 */
(function () {
  'use strict';

  angular.module('app')
    .controller('UpdateInspectionModalCtrl', ['$scope', '$filter', 'Vehicle', 'Restangular', '$stateParams', '$state', '$uibModalInstance', 'generalUtils', UpdateInspectionModalCtrl]);

  function UpdateInspectionModalCtrl($scope, $filter, Vehicle, Restangular, $stateParams, $state, $uibModalInstance, generalUtils) {

    $scope.calendar = {
      dateOptions: {
        formatYear: 'yy',
        format: 'dd/MM/yyyy',
        startingDay: 1,
        altInputFormats: ['dd/mm/yyyy'],
        maxDate: new Date()
      },
      selectedDate: ''
    };

    $scope.ctrl = {
      isWaiting: false
    };

    $scope.close = function () {
      $uibModalInstance.close({reason: 'cancel'});
    };

    $scope.dateChanged = function () {
      if($scope.ctrl.form_constraints) ($scope.calendar.selectedDate > moment()) ?
          $scope.ctrl.form_constraints.date.$error.dateGraterThenToday = true :
          $scope.ctrl.form_constraints.date.$error.dateGraterThenToday = false
    }

    $scope.updateKm = function (form_constraints) {
      $scope.ctrl.form_constraints = form_constraints;
      if ($scope.calendar.selectedDate > moment()) form_constraints.date.$error.dateGraterThenToday = true;
      if (!form_constraints.$valid) return ;
      amplitude.getInstance().logEvent('Clicou para salvar a revisão do veículo');
      generalUtils.startLoader();
      $scope.ctrl.isWaiting = true;

      var requestBody = {
        km: ($scope.updatedKm) ? $scope.updatedKm.toString() : undefined,
        date: $scope.calendar.selectedDate,
        vehicleId: Vehicle._id
      };

      Restangular.all("/vehicles/updateinspection").customPUT(requestBody).then(function (vehicle) {
        $scope.ctrl.isWaiting = false;
        generalUtils.hideLoader();
        $uibModalInstance.close({reason: 'update', km: vehicle.inspection.km, date: vehicle.inspection.date});
      }, function (error) {
        $scope.ctrl.isWaiting = false;
        generalUtils.hideLoader();
        $uibModalInstance.close({reason: 'error-update'});
      });
    }
  }

})();
