(function () {
  'use strict';

  angular.module("app")
    .directive('choiceItem', function () {
      return {
        restrict: 'A',
        replace: true,
        scope: {
          'choice': '=choice',
          'value': '=value'
        },
        link: function ($scope, elem, attrs) {
          $scope.$watch("choice", function (value) {
            elem.toggleClass('choice-active', value === $scope.value);
          });

          elem.addClass('choosable');
          elem.bind('click', function () {
            $scope.$apply(function () {
              $scope.choice = $scope.value;
            });
          });

          elem.on('$destroy', function () {
          });
        }
      }
    })
    .directive('chooseItem', function () {
      return {
        restrict: 'A',
        replace: true,
        scope: {
          'choice': '=choice',
          'value': '=value'
        },
        link: function ($scope, elem, attrs) {
          $scope.$watch("choice", function (value) {
            elem.toggleClass('active', (value ? value._id : '') === $scope.value._id);

            var el = angular.element(angular.element(angular.element(elem).children()[0]).children()[0]);
            el.toggleClass('fa-circle', (value ? value._id : '') === $scope.value._id);
          });

          elem.addClass('choosable');
          elem.bind('click', function () {
            $scope.$apply(function () {
              $scope.choice = $scope.value;
            });
          });

          elem.on('$destroy', function () {
          });
        }
      }
    })
    .directive('chooseHour', function () {
      return {
        restrict: 'A',
        replace: true,
        scope: {
          'choice': '=choice',
          'value': '=value'
        },
        link: function ($scope, elem, attrs) {
          $scope.$watch("choice", function (value) {
            elem.toggleClass('active', value === $scope.value);
          });

          elem.addClass('choosable');
          elem.bind('click', function () {
            $scope.$apply(function () {
              $scope.choice = $scope.value;
            });
          });

          elem.on('$destroy', function () {
          });
        }
      }
    });
})();
