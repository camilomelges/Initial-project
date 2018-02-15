/**
 * Created by keyboard99 on 8/1/17.
 */
(function () {
  'use strict';

  angular.module('app')
    .controller('CustomerDetailsModalCtrl', ['$scope', '$filter', 'Customer', 'Restangular', '$stateParams', '$state', '$uibModalInstance', 'generalUtils', CustomerDetailsModalCtrl]);

  function CustomerDetailsModalCtrl($scope, $filter, Customer, Restangular, $stateParams, $state, $uibModalInstance, generalUtils) {

    $scope.customer = Customer;
    if ($scope.customer.doc) $scope.customer.typePerson = generalUtils.typePerson($scope.customer.doc);
    if ($scope.customer.birthDate) $scope.customer.birthDate = moment($scope.customer.birthDate).format('DD/MM/YYYY');
    $scope.close = function () {
      $uibModalInstance.close({reason: 'closeButton'});
    }

  }

})();
