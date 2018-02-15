/**
 * Created by atomicavocado on 16/02/17.
 */

(function () {
  'use strict';

  angular.module('app')
    .directive('branchFormDirective', function () {
      return {
        restrict: 'E',
        replace: true,
        scope: true,
        bindToController: {
          'value': '=value',
          'toggle': '=toggle'
        },
        controllerAs: 'dv',
        templateUrl: 'app/settings/partner/create/branch-form.html',
        controller: ['$scope', 'Restangular', 'generalUtils', branchFormDirective]
      }
    });

  function branchFormDirective($scope, Restangular, generalUtils) {
    $scope.branchForm = {};

    function clearServiceFields() {
      delete $scope.branchForm.serviceSelected;
    };

    $scope.requestCities = function () {
      $scope.ctrl.cities = [{name: 'Carregando...', _id: ''}];

      Restangular.one('states', $scope.branchForm.state._id).getList('cities').then(function (data) {
        $scope.ctrl.cities = data;
      }, function (err) {
        $scope.ctrl.cities = [{name: 'Erro ao carregar cidades', _id: ''}];
      });
    };

    $scope.returnBranch = function(branch_form) {
      if (!branch_form.$valid) return generalUtils.onError('Ops',
        'Formulário inválido. Preencha todos os campos corretamente e tente novamente.',
        'Confirmar',
        function (isConfirm) {}
        );

      if (moment
          .preciseDiff($scope.branchForm.scheduleSettings.startTime, $scope.branchForm.scheduleSettings.endTime, true)
          .firstDateWasLater)
        return generalUtils.onError('Ops',
          'Final do expediente não pode ser anterior ao início do expediente',
          'Confirmar', function (isConfirm) {});

      if (moment
          .preciseDiff($scope.branchForm.scheduleSettings.startTime, $scope.branchForm.scheduleSettings.startLunch, true)
          .firstDateWasLater)
        return generalUtils.onError('Ops',
          'Início do intervalo de almoço não pode ser anterior ao início do expediente',
          'Confirmar', function (isConfirm) {});

      if (moment
          .preciseDiff($scope.branchForm.scheduleSettings.endLunch, $scope.branchForm.scheduleSettings.endTime, true)
          .firstDateWasLater)
        return generalUtils.onError('Ops',
          'Final do intervalo de almoço não pode ser posterior ao final do expediente',
          'Confirmar', function (isConfirm) {});

      if (moment
          .preciseDiff($scope.branchForm.scheduleSettings.startLunch, $scope.branchForm.scheduleSettings.endLunch, true)
          .firstDateWasLater)
        return generalUtils.onError('Ops',
          'Final do intervalo de almoço não pode ser anterior ao início do intervalo de almoço',
          'Confirmar', function (isConfirm) {});

      $scope.branchForm.cnpj = generalUtils.formatCNPJ($scope.branchForm.cnpj);
      $scope.branchForm.idState = $scope.branchForm.state._id;
      $scope.branchForm.idCity = $scope.branchForm.city._id;
      $scope.branchForm.servicesString = _.map($scope.branchForm.services, 'name').join(', ');
      $scope.branchForm.scheduleSettings.startTime = moment($scope.branchForm.scheduleSettings.startTime).format("HH:mm");
      $scope.branchForm.scheduleSettings.endTime = moment($scope.branchForm.scheduleSettings.endTime).format("HH:mm");
      $scope.branchForm.scheduleSettings.startLunch = moment($scope.branchForm.scheduleSettings.startLunch).format("HH:mm");
      $scope.branchForm.scheduleSettings.endLunch = moment($scope.branchForm.scheduleSettings.endLunch).format("HH:mm");
      $scope.form.branches.push($scope.branchForm);
      $scope.branchForm = {};
      branch_form.$submitted = false;
      $scope.toggleBranchForm();
    };
  }
})();
