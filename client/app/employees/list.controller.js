/**
 * Created by atomicavocado on 25/11/16.
 */

(function () {
  'use strict';

  angular.module('app')
    .controller('EmployeesListCtrl', ['$scope', 'Restangular', '$state', 'Employees', 'generalUtils', '$timeout', '$analytics', EmployeesListCtrl]);

  function EmployeesListCtrl($scope, Restangular, $state, Employees, generalUtils, $timeout, $analytics) {
    $timeout(function () {
      amplitude.getInstance().logEvent('Entrou na página lista de funcionários');
      $analytics.pageTrack('employees/list');
      $analytics.eventTrack('ListaFuncionario');
    }, 5000);

    $scope.ctrl = {
      'employeesList': Employees,
      orderByName: true,
      orderByTel: true,
      orderByEmail: true,
      orderByBranches: true
    };

    $scope.editarFuncionario = function ()  {
      amplitude.getInstance().logEvent('Clicou em editar funcionário');
    }

    getEmployees();

    $scope.orderByName = function(){
      $scope.ctrl.orderByName = !$scope.ctrl.orderByName;
      if ($scope.ctrl.orderByName){
        $scope.ctrl.orderBy = 'fullname';
        $scope.ctrl.orderType = 'asc';
        getEmployees();
      }
      if (!$scope.ctrl.orderByName){
        $scope.ctrl.orderBy = 'fullname';
        $scope.ctrl.orderType = 'desc';
        getEmployees();
      }
      $scope.ctrl.orderByBranches = true;
      $scope.ctrl.orderByTel = true;
      $scope.ctrl.orderByEmail = true;
    };

    $scope.orderByTel = function(){
      $scope.ctrl.orderByTel = !$scope.ctrl.orderByTel;
      if ($scope.ctrl.orderByTel){
        $scope.ctrl.orderBy = 'phone';
        $scope.ctrl.orderType = 'asc';
        getEmployees();
      }
      if (!$scope.ctrl.orderByTel){
        $scope.ctrl.orderBy = 'phone';
        $scope.ctrl.orderType = 'desc';
        getEmployees();
      }
      $scope.ctrl.orderByBranches = true;
      $scope.ctrl.orderByName = true;
      $scope.ctrl.orderByEmail = true;
    };

    $scope.orderByEmail = function(){
      $scope.ctrl.orderByEmail = !$scope.ctrl.orderByEmail;
      if ($scope.ctrl.orderByEmail){
        $scope.ctrl.orderBy = 'email';
        $scope.ctrl.orderType = 'asc';
        getEmployees();
      }
      if (!$scope.ctrl.orderByEmail){
        $scope.ctrl.orderBy = 'email';
        $scope.ctrl.orderType = 'desc';
        getEmployees();
      }
      $scope.ctrl.orderByBranches = true;
      $scope.ctrl.orderByTel = true;
      $scope.ctrl.orderByName = true;
    };

    $scope.orderByBranches = function(){
      $scope.ctrl.orderByBranches = !$scope.ctrl.orderByBranches;
      if ($scope.ctrl.orderByBranches){
        $scope.ctrl.orderBy = 'qtBranches';
        $scope.ctrl.orderType = 'asc';
        getEmployees();
      }
      if (!$scope.ctrl.orderByBranches){
        $scope.ctrl.orderBy = 'qtBranches';
        $scope.ctrl.orderType = 'desc';
        getEmployees();
      }
      $scope.ctrl.orderByName = true;
      $scope.ctrl.orderByTel = true;
      $scope.ctrl.orderByEmail = true;
    };

    function getEmployees() {
      var orderBy = $scope.ctrl.orderBy || 'name'; 
      var orderType = $scope.ctrl.orderType || 'asc';
      Restangular.one('staffs?orderBy=' + orderBy + '&orderType=' + orderType).get().then(function(data) {
        $scope.ctrl.employeesList = data;
      }, function(err) {
        $scope.ctrl.employeesList = [];
      });
    }
  }

})();
