(function() {
  'use strict';
  angular.module('app').controller('CustomerListCtrl', ['$scope', '$rootScope', CustomerListCtrl]);
  function CustomerListCtrl($scope, $rootScope) {
    // $rootScope.$on('searchCustomer', function (event, data) {
    //   if (_.isEmpty(data.docs)) {
    //     $scope.ctrl.searchReturnedEmpty = true;
    //   }
    //   $scope.ctrl.soughtString = data.search;
    //   $scope.ctrl.customerList = data.docs;
    //   $scope.ctrl.totalItems = data.total;
    //   $scope.ctrl.limit = data.limit;
    //   if(!_.isEmpty(data.docs)) prepareListUser();
    // });
  }
})();
