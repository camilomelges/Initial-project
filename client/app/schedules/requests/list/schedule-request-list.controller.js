/**
 * Created by atomicavocado on 18/04/17.
 */
(function () {
  'use strict';

  angular.module('app')
    .controller('ScheduleRequestListCtrl', ['$state','localStorageService', 'authService', '$scope', '$stateParams', 'permissions', 'generalUtils', 'ScheduleRequests', 'Restangular', 'socket', ScheduleRequestListCtrl]);

  function ScheduleRequestListCtrl($state, localStorageService, authService, $scope, $stateParams, permissions, generalUtils, ScheduleRequests, Restangular, socket) {
    $scope.authentication = localStorageService.get('authentication');
    $scope.displayables = localStorageService.get('displayables');
    if (!$scope.authentication.scheduleModule || $scope.authentication.scheduleModule !== 'schedulerequest') {
      generalUtils.onError(
        'Aviso!',
        'Você não possui permissão para acessar esta página, você será redirecionado para página principal.',
        'Confirmar',
        function (isConfirm) {
          $state.go('dashboard');
        });
    }

    amplitude.getInstance().logEvent('Entrou na página solicitações de agendamentos');
    _.forEach(ScheduleRequests, function (request) {
      request.services = _.map(request.services, 'name');
    });

    $scope.permissions = permissions;
    $scope.ctrl = {
      currentRequests: ScheduleRequests,
      statusFilter: 'requested',
      dateFilter: '',
      showDateField: 'false',
      disableScheduleButton: false
    };

    if ($stateParams.status) {
      $scope.ctrl.statusFilter = $stateParams.status;
      getScheduleRequests();
    }

    $scope.set_color = function (scheduleRequest) {
      if (!scheduleRequest) return;
      var leftTime = scheduleRequest.leftTime;

      if (leftTime <= 10 && leftTime > 5) return 'warning';
      if (leftTime <= 5 && leftTime >= 1) return 'danger';
      if (leftTime === 0) return 'now';

    };

    socket.on('SLA_scheduleRequest', function (data) {
      var index;
      var scheduleRequest = _.find($scope.ctrl.currentRequests, function (value, key) {
        if (value._id === data.payload._id) {
          index = key;
          return value
        }
      });
      if (scheduleRequest) {
        $scope.ctrl.currentRequests[index].leftTime = data.payload.leftTime;
      }
    });

    socket.on('newScheduleRequest', function (data) {
      amplitude.getInstance().logEvent('Nova solicitação de agendamento', data.payload);
      data.payload.services = _.map(data.payload.services, 'name');
      $scope.ctrl.currentRequests.push(data.payload);
      $scope.ctrl.currentRequests = _.orderBy($scope.ctrl.currentRequests, ['leftTime'], ['asc']);

    });

    socket.on('SLA_scheduleRequestPending', function (data) {
      var index;
      var scheduleRequest = _.find($scope.ctrl.currentRequests, function (value, key) {
        if (value._id === data.payload._id) {
          index = key;
          return value
        }
      });
      if (scheduleRequest) {
        $scope.ctrl.currentRequests[index] = data.payload;
        $scope.filterByStatus($scope.ctrl.statusFilter);
      }
    });


    function getScheduleRequests() {
      generalUtils.startLoader();
      Restangular.all('scheduleRequests')
        .getList({status: $scope.ctrl.statusFilter, date: $scope.ctrl.dateFilter})
        .then(function (scheduleRequests) {
          generalUtils.hideLoader();
          _.forEach(scheduleRequests, function (request) {
            request.services = _.map(request.services, 'name');

            if (request.deadlocks && request.deadlocks.length > -1) {
              var deadlock = request.deadlocks[request.deadlocks.length - 1];

              if (deadlock && deadlock.callAgainAt) {
                request.callMeAt.date = deadlock.callAgainAt.date ? deadlock.callAgainAt.date : request.callMeAt.date;
                request.callMeAt.time = deadlock.callAgainAt.time ? deadlock.callAgainAt.time : request.callMeAt.time;
              }
            }
          });
          $scope.ctrl.currentRequests = scheduleRequests;
        });
    }

    $scope.filterByStatus = function (status) {
      $scope.ctrl.statusFilter = status;
      getScheduleRequests()
    };

    $scope.filterByDate = function () {
      amplitude.getInstance().logEvent('Selecionou o dia');
      $scope.ctrl.dateFilter = moment($scope.calendar.selectedDate).format('YYYY-MM-DD');
      getScheduleRequests()
    };

    $scope.showAllDates = function () {
      amplitude.getInstance().logEvent('Clicou em mostrar todas as datas');
      $scope.ctrl.dateFilter = '';
      $scope.calendar.selectedDate = '';
      getScheduleRequests()
    };

    $scope.calendar = {
      dateOptions: {
        formatYear: 'yy',
        startingDay: 1
      },
      format: 'dd/MM/yyyy',
      altInputFormats: ['d!/M!/yyyy'],
      selectedDate: '',
      minDate: new Date()
    };

    $scope.clearCalendar = function () {
      $scope.calendar.selectedDate = null;
    };

    $scope.setDate = function (year, month, day) {
      $scope.calendar.selectedDate = new Date(year, month, day);
    };

    $scope.schedule = function(idScheduleResquest) {
      $scope.ctrl.disableScheduleButton = true;
      var action = {
        type: 'scheduleRequest',
        branch: $scope.authentication.branch,
        stateRoute: 'schedulerequests.update',
        idAction: idScheduleResquest.id
      };

      function addToLocalStorage(action) {
        var actionAddedToLocalStorage = _.find($scope.authentication.pendingActions, function(action) {
          return action.branch._id === $scope.authentication.branch;
        });

        if (!actionAddedToLocalStorage) {
          $scope.authentication.pendingActions.push(action);
          localStorageService.set('authentication', $scope.authentication);
        }
        amplitude.getInstance().logEvent('Atendente esta pendente na solicitação', action);
      }

      Restangular.all('staffs/' + $scope.authentication.staff + '/pendingActions').customPOST(action)
        .then(function(data) {
          addToLocalStorage(data);
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
