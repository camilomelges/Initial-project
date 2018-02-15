(function () {
  'use strict';

  angular.module('app')
    .controller('PartnerViewCtrl', ['$scope', 'Partner', 'generalUtils', 'localStorageService', PartnerViewCtrl]);

  function PartnerViewCtrl($scope, Partner, generalUtils) {
    $scope.ctrl = {
      'partner': Partner
    };
  }
})();
