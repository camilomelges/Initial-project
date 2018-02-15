(function () {
  'use strict';

  angular.module('app')
    .controller('SelectHourCtrl', ['$scope', '$filter', 'Restangular', '$stateParams', '$state', '$uibModalInstance', 'BranchSettings', 'generalUtils', SelectHourCtrl]);

  function SelectHourCtrl($scope, $filter, Restangular, $stateParams, $state, $uibModalInstance, BranchSettings, generalUtils) {
    $scope.BranchSettings = BranchSettings;
    $scope.form = {};
    $scope.ctrl = {
      timeOptions: generalUtils.generateTimeOptions(BranchSettings),
      timeValid: true,
      selectedHour: ""
    };

    $scope.$watch('ctrl.selectedHour', function (newValue, oldValue) {
      if (String(newValue) != '')
        $uibModalInstance.close(newValue);
    });
    $scope.cancel = function (e) {
      $uibModalInstance.dismiss('cancel');
    };
  }

})();
