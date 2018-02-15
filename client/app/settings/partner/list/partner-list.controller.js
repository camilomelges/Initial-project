(function () {
  'use strict';

  angular.module('app')
    .controller('PartnerListCtrl', ['$scope', 'Partners', 'Restangular', PartnerListCtrl])

  function PartnerListCtrl($scope, Partners, Restangular) {
    $scope.ctrl = {
      'partnerList': Partners,
      orderByCompanyName: true,
      orderByBranches: true
    };

    getPartners();

    $scope.orderByCompanyName = function(){
      $scope.ctrl.orderByCompanyName = !$scope.ctrl.orderByCompanyName;
      if ($scope.ctrl.orderByCompanyName){
        $scope.ctrl.orderBy = 'companyName';
        $scope.ctrl.orderType = 'asc';
        getPartners();
      }
      if (!$scope.ctrl.orderByCompanyName){
        $scope.ctrl.orderBy = 'companyName';
        $scope.ctrl.orderType = 'desc';
        getPartners();
      }
      $scope.ctrl.orderByBranches = true;
    };

    $scope.orderByBranches = function(){
      $scope.ctrl.orderByBranches = !$scope.ctrl.orderByBranches;
      if ($scope.ctrl.orderByBranches){
        $scope.ctrl.orderBy = 'qtBranches';
        $scope.ctrl.orderType = 'asc';
        getPartners();
      }
      if (!$scope.ctrl.orderByBranches){
        $scope.ctrl.orderBy = 'qtBranches';
        $scope.ctrl.orderType = 'desc';
        getPartners();
      }
      $scope.ctrl.orderByCompanyName = true;
    };
    
    function getPartners() {
      var orderBy = $scope.ctrl.orderBy || 'companyName';
      var orderType = $scope.ctrl.orderType || 'asc';
      Restangular.one('partners?orderBy=' + orderBy + '&orderType=' + orderType).get().then(function(data) {
        $scope.ctrl.partnerList = data;
      }, function(err) {
        $scope.ctrl.partnerList = [];
      });
    }
  }
})();
