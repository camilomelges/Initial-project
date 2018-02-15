(function () {
  'use strict';

  angular.module('app')
    .directive('searchBox', function () {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          'sourceType': '@sourceType',
          'placeholder': '@placeholder',
        },
        templateUrl: 'app/search-box/search-box.directive.html',
        controller: ['$scope', '$rootScope', '$timeout', 'Restangular', 'generalUtils',
          '$state', SearchBoxDirectiveCtrl]
      }
    });

  function SearchBoxDirectiveCtrl($scope, $rootScope, $timeout, Restangular, generalUtils, $state) {

    $scope.ctrl = {
      placeholder: ($scope.placeholder) ? $scope.placeholder : 'Digite para pesquisar',
      searchString: ''
    };

    function populateSearchWithPreviousParams() {
      if($rootScope.previousState.name == 'customers.view' && $rootScope.previousParams.soughtString != null) {
        $scope.ctrl.searchString = $rootScope.previousParams.soughtString;
        $scope.search();
      }
    };

    function validateRequiredParameters () {
      if (!$scope.sourceType) return console.error(
        'Warning! searchType is required was not informed.'
      );
    }

    function searchAccordingSourceType (searchType, callback) {
      switch (searchType) {

        case 'customer':
          Restangular.one('customers?search=' + $scope.ctrl.searchString + '&page=1').get().then(function(customers) {
            callback(null, customers);

          }, function(err) {console.error(err); callback(err, []);
          });
          break;

        case 'vehicle':
          Restangular.one('vehicles?search=' + $scope.ctrl.searchString + '&page=1').get().then(function(vehicles) {
            callback(null, vehicles);

          }, function(err) {console.error(err); callback(err, []);
          });
          break;

        default:
          callback(null, []);
      }
    }

    $scope.search = function () {
      validateRequiredParameters();
      $timeout(function(){
        var search = {string: $scope.ctrl.searchString};

        amplitude.getInstance().logEvent('Realizou uma busca, Search-box', search);

        generalUtils.startLoader();

        searchAccordingSourceType($scope.sourceType, function(err, data) {
          generalUtils.hideLoader();
          data.search = $scope.ctrl.searchString;
          if ($scope.sourceType === 'customer') $rootScope.$broadcast('searchCustomer', data);
          if ($scope.sourceType === 'vehicle') $rootScope.$broadcast('searchVehicle', data);
        });

      }, 500);
    }

    populateSearchWithPreviousParams();

  }
})();
