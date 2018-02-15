/**
 * Created by atomicavocado on 23/11/16.
 */
(function () {
  'use strict';

  angular.module('app')
    .controller('RulesReportCtrl', ['$scope', 'Relationships', RulesReportCtrl]);

  function RulesReportCtrl($scope, Relationships) {

    _.map(Relationships, function (r) {
      r.dateCreate = moment(r.dateCreate).format('LLL');

      return r;
    });

    $scope.ctrl = {
      relationships: Relationships
    };
  }
})();
