/**
 * Created by atomicavocado on 13/12/16.
 */
(function () {
  'use strict';

  angular.module('app')
    .controller('EmployeesEditCtrl', ['$scope', 'Restangular', '$state', 'generalUtils', 'permissionHelper', 'Branches', 'Employee', EmployeesEditCtrl]);

  function EmployeesEditCtrl($scope, Restangular, $state, generalUtils, permissionHelper, Branches, Employee) {
    amplitude.getInstance().logEvent('Entrou na página edição de funcionário');
    $scope.ctrl = {
      titleView: 'Editar Funcionário',
      fullname: Employee.name + ' ' + Employee.lastname,
      roles: permissionHelper.getRoles(),
      selectedRole: permissionHelper.getRoles()[_.findIndex(permissionHelper.getRoles(), ['identifier', Employee.role])],
      branches:  Branches,
      selectedBranches: _.intersectionBy(Branches, Employee.branches, '_id'),
      disableSaveButton: false
    };

    $scope.ctrl.copyAvailbleBranchesToselect = angular.copy($scope.ctrl.selectedBranches);
    $scope.form = Employee;

    if (!_.isEmpty($scope.form.birthDate)) {
      $scope.ctrl.birthDate = moment($scope.form.birthDate, 'YYYY-MM-DD').format('DDMMYYYY');
    }

    $scope.cancelForm = function (e) {
      amplitude.getInstance().logEvent('Cancelou a edição de funcionário');
      $state.go('employees.list');
    };

    function branchesWasModified() {
      return ($scope.ctrl.selectedBranches.length !== $scope.ctrl.copyAvailbleBranchesToselect.length);
    }

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
              });
            $scope.ctrl.disableSaveButton = false;
            return
          } else {
            $scope.form.birthDate = moment($scope.ctrl.birthDate, 'DD/MM/YYYY').toISOString();
          }
        }

        if (branchesWasModified()) {
          var branchChanges = [], wasAdded = false;

          if ($scope.ctrl.selectedBranches.length > $scope.ctrl.copyAvailbleBranchesToselect.length){
            branchChanges = _.differenceBy($scope.ctrl.selectedBranches, $scope.ctrl.copyAvailbleBranchesToselect, '_id');
            wasAdded = true;
          }

          if ($scope.ctrl.selectedBranches.length < $scope.ctrl.copyAvailbleBranchesToselect.length){
            branchChanges = _.differenceBy($scope.ctrl.copyAvailbleBranchesToselect, $scope.ctrl.selectedBranches, '_id');
            wasAdded = false;
          }

          _.forEach(branchChanges, function(change) {
            (wasAdded)
              ? $scope.form.branches.push(change)
              : $scope.form.branches.splice(
                $scope.form.branches.indexOf(
                  _.find($scope.form.branches, function(branch){ return branch._id.toString() === change._id.toString()})
                )
                , 1
              );
          });
        }

        $scope.form.branches = _.map(Employee.branches, '_id');
        $scope.form.role = $scope.ctrl.selectedRole.identifier;

        $scope.form.save().then(function () {
            generalUtils.hideLoader();
            generalUtils.onSuccess(
              'Sucesso!',
              'Funcionário editado com sucesso!',
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
                message = 'Erro ao efetivar a edição do cadastro';
            }

            generalUtils.onError(
              'Ops!',
              message,
              'Confirmar',
              function (isConfirm) {
                amplitude.getInstance().logEvent('Não foi possível editar do funcionário');
              });
            $scope.ctrl.disableSaveButton = false;
          });
      }
    };
  }
})();
