/**
 * Created by atomicavocado on 16/01/17.
 */

(function () {
  'use strict';

  angular.module('app')
    .controller('EmployeesDetailCtrl', ['$scope', '$timeout', 'localStorageService', '$state', 'Employee', 'generalUtils', 'permissionHelper', EmployeesDetailCtrl]);

  function EmployeesDetailCtrl($scope, $timeout, localStorageService, $state, Employee, generalUtils, permissionHelper) {
    amplitude.getInstance().logEvent('Entrou na página detalhes de funcionário');
    $scope.ctrl = {
      'employee': Employee
    };

    $scope.ctrl.employee.role = permissionHelper.getRoleName($scope.ctrl.employee.role);

    $scope.showWarning = function() {
      generalUtils.alert(
        'Você tem certeza?',
        'Ao deletar este usuário ele não poderá ser recuperado e perderá todos seus acessos à ferramenta',
        'Confirmar',
        'Cancelar',
        function (isConfirm) {
          if (isConfirm){
            deleteUser()
          }
        });
    };

    function deleteUser() {
      amplitude.getInstance().logEvent('Clicou em excluir o funcionário');
      if ($scope.ctrl.employee.cpf == localStorageService.get('authentication').cpf) {
        $timeout(function() {
          generalUtils.onError(
            'Erro!',
            'Você não possui autorização para apagar este funcionário',
            'OK',
            function (isConfirm) {
              $state.reload();
            });
        }, 500);
      } else {
        Employee.remove().then(function(data) {
          $timeout(function() {
            generalUtils.onSuccess(
              'Sucesso',
              'O funcionário foi apagado com sucesso',
              'Retornar à lista de funcionários',
              '',
              function (isConfirm) {
                amplitude.getInstance().logEvent('Funcionário excluido com sucesso');
                $state.go('employees.list');
              });
          }, 500);
        }, function(err) {
          $timeout(function() {
            generalUtils.onError(
              'Erro!',
              'Não foi possível apagar o cadastro deste funcionário',
              'OK',
              function (isConfirm) {
                amplitude.getInstance().logEvent('Não foi possível apagar o funcionário');
                $state.reload();
              });
          }, 500);
        });
      }
    }

  }

})();
