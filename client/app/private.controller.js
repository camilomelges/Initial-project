(function () {
  'use strict';

  angular.module('app')
    .controller('PrivateCtrl', ['$rootScope', '$scope', 'Branches', PrivateCtrl]);

  function PrivateCtrl($rootScope, $scope, Branches) {
    $rootScope.staffBranches = Branches;
    $rootScope.changeBranch = {};

    $rootScope.$on('changeBranchStartEvent', function (event, data) {
      $scope.changeBranch['change'] = true;
      $scope.description = "Trocando de unidade";

      $scope.changeBranch['branchActual'] = data.branchActual;
      $scope.changeBranch['branchChanged'] = data.branchChanged;
    });

    $rootScope.$on('changeBranchFinishEvent', function (event, data) {
      $scope.changeBranch = {};
      $scope.description = "";
    });
  }
})();
