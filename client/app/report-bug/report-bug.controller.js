/**
 * Created by monking1911 on 02/01/18.
 */

(function() {
  'use strict';

  angular.module('app')
    .controller('ReportBugCtrl', ['$scope', '$state', '$uibModalInstance', 'generalUtils', 'localStorageService', 'Restangular', ReportBugCtrl]);

  function ReportBugCtrl($scope, $state, $uibModalInstance, generalUtils, localStorageService, Restangular) {

    $scope.ctrl = {
      bug: {
        page: undefined,
        summary: undefined,
        hour: ((new Date().toString()).split(' '))[4],
        date: new Date()
      },
      authentication: localStorageService.get('authentication')
    };

    $scope.calendar = {
      dateOptions: {
        formatYear: 'yy',
        initDate: null,
        minDate: new Date(),
        maxDate: moment().add(2, 'year'),
        startingDay: 0
      },
      format: 'dd/MM/yyyy',
      altInputFormats: ['d!/M!/yyyy'],
      selectedDate: new Date()
    };

    $scope.submit = function(form) {
      if (!form.$valid) return;

      $scope.ctrl.bug.summary = form.summary.$modelValue;
      (form.date && form.date.$modelValue != '') ? $scope.ctrl.bug.date = form.date.$modelValue: $scope.ctrl.bug.date = undefined;
      form.page ? $scope.ctrl.bug.page = form.page.$modelValue : $scope.ctrl.bug.page = undefined;
      form.hour ? $scope.ctrl.bug.hour = form.hour.$modelValue : $scope.ctrl.bug.hour = undefined;
      $scope.ctrl.bug.branch = $scope.ctrl.authentication.branch;
      $scope.ctrl.bug.partner = $scope.ctrl.authentication.partner;

      $uibModalInstance.dismiss('cancel');
      postBug($scope.ctrl.bug);
    };

    function postBug(bug) {
      Restangular.one('bugs').customPOST(bug).then(function(data) {
        generalUtils.onSuccess(
          'Sucesso!',
          'Nossa equipe verificará o mais rapido possível!',
          'Confirmar',
          '',
          function(isConfirm) {
            if ($state.current.name === 'bugs.tickets') $state.reload();
          });
      }, function(err) {
        generalUtils.onError(
          'Ops',
          'Ocorreu um erro :x, entre em contato conosco!',
          'Confirmar',
          function(isConfirm) {});
      });
    };

    $scope.cancel = function(form) {
      $uibModalInstance.dismiss('cancel');
    };
  };
})();