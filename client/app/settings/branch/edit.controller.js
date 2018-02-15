/**
 * Created by atomicavocado on 10/02/17.
 */

(function() {
  'use strict';

  angular.module('app')
    .controller('EditBranchCtrl', ['$scope', 'generalUtils', 'timezonesBrazil', 'BranchSettings', EditBranchCtrl]);

  function EditBranchCtrl($scope, generalUtils, timezonesBrazil, BranchSettings) {
    $scope.ctrl = {
      settings: BranchSettings,
      dateStart: moment('28-03-1990 ' + BranchSettings.scheduleSettings.startTime, 'DD-MM-YYYY HH:mm').toDate(),
      dateEnd: moment('28-03-1990 ' + BranchSettings.scheduleSettings.endTime, 'DD-MM-YYYY HH:mm').toDate(),
      lunchStart: moment('28-03-1990 ' + BranchSettings.scheduleSettings.startLunch, 'DD-MM-YYYY HH:mm').toDate(),
      lunchEnd: moment('28-03-1990 ' + BranchSettings.scheduleSettings.endLunch, 'DD-MM-YYYY HH:mm').toDate(),
      disableSaveButton: false,
      selectedTimezone: _.find(timezonesBrazil, function(timezone){return timezone === BranchSettings.timezone}),
      timezones: timezonesBrazil
    };

    $scope.saveBranch = function(valid) {
      $scope.ctrl.disableSaveButton = true;
      if (moment.preciseDiff($scope.ctrl.dateStart, $scope.ctrl.dateEnd, true).firstDateWasLater) {
        $scope.ctrl.disableSaveButton = false;
        return generalUtils.onError('Ops', 'Final do expediente não pode ser anterior ao início do expediente', 'Confirmar', function(isConfirm) {});
      };

      if (moment
        .preciseDiff($scope.ctrl.dateStart, $scope.ctrl.lunchStart, true)
        .firstDateWasLater) {
        return generalUtils.onError('Ops',
          'Início do intervalo de almoço não pode ser anterior ao início do expediente',
          'Confirmar',
          function(isConfirm) {});
        $scope.ctrl.disableSaveButton = false;
      };

      if (moment
        .preciseDiff($scope.ctrl.lunchEnd, $scope.ctrl.dateEnd, true)
        .firstDateWasLater) {
        return generalUtils.onError('Ops',
          'Final do intervalo de almoço não pode ser posterior ao final do expediente',
          'Confirmar',
          function(isConfirm) {});
        $scope.ctrl.disableSaveButton = false;
      }

      if (moment
        .preciseDiff($scope.ctrl.lunchStart, $scope.ctrl.lunchEnd, true)
        .firstDateWasLater){
                return generalUtils.onError('Ops',
                  'Final do intervalo de almoço não pode ser anterior ao início do intervalo de almoço',
                  'Confirmar',
                  function(isConfirm) {});
              $scope.ctrl.disableSaveButton = false;
            }

      if (!valid) {
        $scope.ctrl.disableSaveButton = false;
        return generalUtils.onError('Ops', 'Informações inválidas, verifique e tente novamente.', 'Confirmar', function(isConfirm) {});
      }
      $scope.ctrl.settings.scheduleSettings.startTime = moment($scope.ctrl.dateStart).format("HH:mm");
      $scope.ctrl.settings.scheduleSettings.endTime = moment($scope.ctrl.dateEnd).format("HH:mm");
      $scope.ctrl.settings.scheduleSettings.startLunch = moment($scope.ctrl.lunchStart).format("HH:mm");
      $scope.ctrl.settings.scheduleSettings.endLunch = moment($scope.ctrl.lunchEnd).format("HH:mm");
      $scope.ctrl.settings.timezone = $scope.ctrl.selectedTimezone;
      generalUtils.startLoader();
      $scope.ctrl.settings.save().then(function(data) {
        generalUtils.hideLoader();
        generalUtils.onSuccess('Sucesso!',
          'Suas alterações foram salvas com sucesso.',
          'OK',
          '',
          function(isConfirm) {})
        $scope.ctrl.disableSaveButton = false;
      }, function(err) {
        generalUtils.hideLoader();
        return generalUtils.onError('Ops',
          'Não foi possível salvar suas alterações',
          'Confirmar',
          function(isConfirm) {});
        $scope.ctrl.disableSaveButton = false;
      });
    }

  }

})();
