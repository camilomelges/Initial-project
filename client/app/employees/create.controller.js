/**
 * Created by atomicavocado on 23/11/16.
 */
(function () {
  'use strict';

  angular.module('app')
    .controller('EmployeesCreateCtrl', ['$scope', 'Restangular', '$state', 'Branches', 'generalUtils', 'permissionHelper', '$timeout', '$analytics', EmployeesCreateCtrl]);

  function EmployeesCreateCtrl($scope, Restangular, $state, Branches, generalUtils, permissionHelper, $timeout, $analytics) {
    $timeout(function () {
      amplitude.getInstance().logEvent('Entrou na página criação de funcionário');
      $analytics.pageTrack('employees/create');
      $analytics.eventTrack('NovoFuncionario');
    }, 20000);
    $scope.ctrl = {
      titleView: 'Cadastro de funcionário',
      branches: Branches,
      roles: permissionHelper.getRoles(),
      fullname: '',
      birthDate: '',
      selectedBranches: '',
      selectedRole: '',
      disableSaveButton: false
    };

    $scope.openChosenContext = function (el) {
      angular.element(el).triggerHandler('mousedown');
    };

    $scope.cancelForm = function (e) {
      amplitude.getInstance().logEvent('Cancelou a criação de funcionário');
      $state.go('employees.list');
    };

    $scope.submitForm = function (valid) {
      $scope.ctrl.disableSaveButton = true;
      if (valid) {
        generalUtils.startLoader();
        generalUtils.splitFullName($scope.ctrl.fullname, function (splitName) {
          $scope.form.name = splitName[0];
          $scope.form.lastname = splitName[1];
        });

        $scope.form.cpf = generalUtils.formatCPF($scope.form.cpf);


        if (!_.isEmpty($scope.ctrl.birthDate)) {
          if (!generalUtils.dateIsValid($scope.ctrl.birthDate, 'birthdate')) {
            generalUtils.hideLoader();
            generalUtils.onError(
              'Ops!',
              'Funcionário não pode ter menos de 18 anos.',
              'Confirmar',
              function (isConfirm) {
                amplitude.getInstance().logEvent('Erro funcionário não pode ter menos de 18 anos');
              });
            $scope.ctrl.disableSaveButton = false;
            return
          } else {
            $scope.form.birthDate = moment($scope.ctrl.birthDate, 'DD/MM/YYYY').toISOString();
          }
        }

        $scope.form.branches = _.map($scope.ctrl.selectedBranches, '_id');
        $scope.form.role = $scope.ctrl.selectedRole.identifier;


        $analytics.eventTrack('FuncionárioCadastrado');

        Restangular.all('staffs').post($scope.form).then(
          function () {
            generalUtils.hideLoader();
            generalUtils.onSuccess(
              'Sucesso!',
              'Funcionário cadastrado na plataforma!',
              'Voltar para tela principal',
              '',
              function (isConfirm) {
                if (isConfirm){
                  amplitude.getInstance().logEvent('Salvou a edição do funcionário');
                  $state.go('employees.list');
                }
              });
            $scope.ctrl.disableSaveButton = false;
          },
          function (err) {
            generalUtils.hideLoader();
            var message = '';

            switch (err.status) {
              case 404:
                message = 'Not Found';
                break;
              case 400:
                message = 'Bad Request';
                break;
              default:
                message = 'Erro ao efetivar o cadastro';
            }

            generalUtils.onError(
              'Ops!',
              message,
              'Confirmar',
              function (isConfirm) {
                amplitude.getInstance().logEvent('Falhou na criação do funcionário');
              });
            $scope.ctrl.disableSaveButton = false;
          });
      }


    };

  }
})();
