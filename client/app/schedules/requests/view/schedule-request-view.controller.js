/**
 * Created by atomicavocado on 18/04/17.
 */
(function () {
  'use strict';

  angular.module('app')
    .controller('ScheduleRequestViewCtrl', ['localStorageService', 'authService', '$scope', '$state', 'permissions', 'generalUtils', 'ScheduleRequest', 'Restangular', '$uibModal', ScheduleRequestViewCtrl]);

  function ScheduleRequestViewCtrl(localStorageService, authService, $scope, $state, permissions, generalUtils, ScheduleRequest, Restangular, $uibModal) {
    $scope.authentication = localStorageService.get('authentication');
    if (!$scope.authentication.scheduleModule || $scope.authentication.scheduleModule !== 'schedulerequest') {
      generalUtils.onError(
        'Aviso!',
        'Você não possui permissão para acessar esta página, você será redirecionado para página principal.',
        'Confirmar',
        function (isConfirm) {
          $state.go('dashboard');
        });
    }

    $scope.ctrl = {
      disableScheduleButton: false
    };

    switch (ScheduleRequest.status) {
      case 'requested':
        ScheduleRequest.statusName = 'Solicitado';
        break;
      case 'pending':
        ScheduleRequest.statusName = 'Pendente';
        break;
      case 'canceled':
        ScheduleRequest.statusName = 'Cancelado';
        break;
      case 'confirmed':
        ScheduleRequest.statusName = 'Finalizado';
        break;
    }

    var deadlock = ScheduleRequest.deadlocks[ScheduleRequest.deadlocks.length - 1];
    if (deadlock && deadlock.callAgainAt) {
      ScheduleRequest.callMeAt.date = deadlock.callAgainAt.date ? deadlock.callAgainAt.date : ScheduleRequest.callMeAt.date;
      ScheduleRequest.callMeAt.time = deadlock.callAgainAt.time ? deadlock.callAgainAt.time : ScheduleRequest.callMeAt.time;
    }

    $scope.notSaveSchedule = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/schedules/requests/update/status-change.html',
        controller: 'StatusChangeCtrl',
        controllerAs: 'ctrl',
        size: 'md',
        resolve: {
          ScheduleReasons: ['scheduleReasons',
            function (scheduleReasons) {
              return scheduleReasons;
            }
          ]
        }
      });

      modalInstance.result.then(function (result) {
        var update = {
          deadlock: {
            motive: result.reason.status,
            description: result.form.description
          }
        };

        if (result.form.executed) {
          var executed = {
            executed: {
              date: result.form.executed ? moment(new Date(result.form.executed.date)).format("YYYY-MM-DD") : result.form.executed,
              with: result.form.executed ? result.form.executed.with : result.form.executed
            }
          };
          _.assignIn(update.deadlock, executed);
        }


        if (result.form.callAgainAt) {
          var dateISO = moment(new Date(result.form.callAgainAt.date))
            .set("hour", result.form.callAgainAt.time.split(":")[0])
            .set("minute", result.form.callAgainAt.time.split(":")[1]);

          var callAgainAt = {
            callAgainAt: {
              date: moment(new Date(result.form.callAgainAt.date)).format("YYYY-MM-DD"),
              dateISO: dateISO,
              time: result.form.callAgainAt.time
            }
          };
          _.assignIn(update.deadlock, callAgainAt);
        }

        generalUtils.startLoader();
        Restangular.one("scheduleRequests", ScheduleRequest._id).customPUT(update).then(function (data) {
          generalUtils.hideLoader();
          generalUtils.onSuccess('Sucesso!', 'Solicitação atualizada com sucesso!', 'Confirmar', '', function (isConfirm) {
            $state.go('schedulerequests', {status: data.status});
          });

        }, function (err) {

          generalUtils.hideLoader();
          generalUtils.onError("Ops!", "Não foi possível alterar esta solicitação.", "Confirmar", function (isConfirm) {
          });

        });
      })
    };

    ScheduleRequest.services = _.map(ScheduleRequest.services, 'name');
    $scope.srequest = ScheduleRequest;
    $scope.permissions = permissions;

    $scope.backToList = function () {
      $state.go('schedulerequests');
    };

    $scope.schedule = function(idScheduleResquest) {
      $scope.ctrl.disableScheduleButton = true;
      var action = {
        type: 'scheduleRequest',
        branch: $scope.authentication.branch,
        stateRoute: 'schedulerequests.update',
        idAction: idScheduleResquest.id
      };

      function addToLocalStorage() {
        var actionAddedToLocalStorage = _.find($scope.authentication.pendingActions, function(action) {
          return action.branch === $scope.authentication.branch;
        });

        if (!actionAddedToLocalStorage) {
          $scope.authentication.pendingActions.push(action);
          localStorageService.set('authentication', $scope.authentication);
        }
        amplitude.getInstance().logEvent('Atendente esta pendente na solicitação', action);
      }

      Restangular.all('staffs/' + $scope.authentication.staff + '/pendingActions').customPOST(action)
        .then(function(data) {
          addToLocalStorage();
          $state.go('schedulerequests.update', idScheduleResquest);
        }, function(err) {
          if (err.status == 500) {
            $scope.ctrl.disableScheduleButton = false;
            generalUtils.onError("Ops!",
              "Ocorreu um erro, tente novamente em instantes!",
              "OK",
              "",
              function(isConfirm) {});
          }
          if (err.status == 400) {
            $scope.ctrl.disableScheduleButton = false;
            addToLocalStorage();
            $state.go('schedulerequests.update', idScheduleResquest);
          }
        });
    };
  }
})();
