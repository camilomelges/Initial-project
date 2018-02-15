/**
 * Created by monking1911 on 02/01/18.
 */
(function() {
  'use strict';

  angular.module('app')
    .controller('bugsTicketsList', ['$scope', 'generalUtils', 'Restangular', 'Bugs', bugsTicketsList]);

  function bugsTicketsList($scope, generalUtils, Restangular, Bugs) {

    $scope.ctrl = {
      statusFilter: 'pending',
      bugs: Bugs ? Bugs : []
    };

    showBugsForStatus($scope.ctrl.statusFilter);

    $scope.filterByStatus = function(status) {
      amplitude.getInstance().logEvent('Clicou em ' + status);
      $scope.ctrl.statusFilter = status;
      showBugsForStatus($scope.ctrl.statusFilter);
    };

    function showBugsForStatus(status) {
      $scope.ctrl.bugs = Bugs;
      $scope.ctrl.bugs = _.filter($scope.ctrl.bugs, function(bug) {
        return bug.status.toString() === status.toString();
      });
    };

    $scope.alertForFinishBug = function (bug) {
      generalUtils.alert(
        'Atenção', 'Esse bug será finalizado!', 'CONFIRMAR', 'CANCELAR',
        function(isConfirm) {
          if (isConfirm) {
            setTimeout(finish(bug)), 1000;
          };
        });
    };

    function putFinishedBugInArray(data) {
      _.forEach(Bugs, function(bug, key) {
        if (bug._id.toString() === data._id.toString()) {
          Bugs[key] = data;
        };
      });
      showBugsForStatus($scope.ctrl.statusFilter);
    };

    function finish(bug) {
      Restangular.one('bug/', bug._id).customPUT(bug).then(function(data) {
        putFinishedBugInArray(data);
        generalUtils.onSuccess(
          'Sucesso!',
          'Bug finalizado!',
          'Confirmar',
          '',
          function(isConfirm) {});
      }, function(err) {
        generalUtils.onError(
          'Ops',
          'Ocorreu um erro :x, entre em contato conosco!',
          'Confirmar',
          function(isConfirm) {});
      });
    };
  };
})();