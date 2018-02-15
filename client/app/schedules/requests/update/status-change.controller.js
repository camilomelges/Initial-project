(function () {
  'use strict';

  angular.module('app')
    .controller('StatusChangeCtrl', ['$scope', 'Restangular', '$uibModalInstance', 'ScheduleReasons', 'generalUtils', '$uibModal', StatusChangeCtrl]);

  function StatusChangeCtrl($scope, Restangular, $uibModalInstance, ScheduleReasons, generalUtils, $uibModal) {
    $scope.ScheduleReasons = ScheduleReasons;
    $scope.reasonChange = function (reason) {
      $scope.showSelectDate = false;
      $scope.showFormReason = false;
      $scope.showDateAndWith = false;
      $scope.form = {};

      switch (reason.status) {
        case 'not-now':
        case 'call-later':
        case 'no-answer':
        case 'voicemail':
          $scope.showSelectDate = true;
          break;
        case 'nonexistent-phone':
          $scope.showDangerUpdate = true;
          break;
        case 'client-gave-up':
          $scope.showFormReason = true;
          break;
        case 'already-scheduled':
          $scope.showDateAndWith = true;
          break;
        default:
          break;
      }
    };
    $scope.calendar = {
      dateOptions: {
        formatYear: 'yy',
        startingDay: 1
      },
      format: 'dd/MM/yyyy',
      altInputFormats: ['d!/M!/yyyy'],
      minDate: new Date(),
      maxDate: new Date(2020, 5, 22)
    };
    $scope.openSelectHour = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/schedules/requests/update/select-hour.html',
        controller: 'SelectHourCtrl',
        controllerAs: 'ctrl',
        resolve: {
          BranchSettings: ['Restangular',
            function (Restangular) {
              return Restangular.one('branch/scheduleSettings').get();
            }]
        }
      });

      modalInstance.result.then(function (selectedHour) {
        $scope.form.callAgainAt.time = selectedHour;
      });
    };


    $scope.cancel = function (e) {
      e.preventDefault();
      $uibModalInstance.dismiss('cancel');
    };
    $scope.save = function (e) {
      e.preventDefault();
      $uibModalInstance.close({reason: $scope.reason, form: $scope.form});
    };
  }

})();
