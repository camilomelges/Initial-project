(function() {
  'use strict';

  angular.module('app')
    .controller('ScheduleListCtrl', ['$scope', '$uibModal', '$state', 'generalUtils', 'permissions', 'Schedules', 'Restangular', 'socket', ScheduleListCtrl]);

  function ScheduleListCtrl($scope, $uibModal, $state, generalUtils, permissions, Schedules, Restangular, socket) {
    amplitude.getInstance().logEvent('Entrou na página lista de agendamentos');
    $scope.permissions = permissions;
    $scope.ctrl = {
      schedules: Schedules.docs,
      totalItems: Schedules.total,
      limit: Schedules.limit,
      currentPage: 1,
      statusFilter: 'pending',
      dateFilter: '',
      showDateField: 'false',
      disableScheduleButton: false,
      disableChangeSchedule: false,
      disableViewSchedule: false,
      orderByScheduled: true,
      orderByCustomer: true,
      orderByVehicle: true,
      orderByPlate: true,
      orderByOrigin: true,
      orderByCreateAt: true,
      orderByFinished: true
    };

    function requestSchedules() {
      var orderBy = $scope.ctrl.orderBy || 'name'; 
      var orderType = $scope.ctrl.orderType || 'asc';
      generalUtils.startLoader();
      var query = {};
      if ($scope.ctrl.statusFilter == 'finished') {
        query = {
          status: $scope.ctrl.statusFilter,
          dateFinished: $scope.ctrl.dateFilter
        };
      } else {
        query = {
          status: $scope.ctrl.statusFilter,
          date: $scope.ctrl.dateFilter
        };
      }
      Restangular.one('schedules?page=' + $scope.ctrl.currentPage + '&orderBy=' + orderBy + '&orderType=' + orderType)
        .get(query)
        .then(function(schedules) {
          generalUtils.hideLoader();
          $scope.ctrl.schedules = schedules.docs;
          $scope.ctrl.totalItems = schedules.total;
          $scope.ctrl.limit = schedules.limit;
        });
    }

    function orderbyDateTime(array) {
      return _.orderBy(array, ['date', 'hour'], ['asc']);
    }

    $scope.viewSchedule = function(idSchedule){
      $scope.ctrl.disableViewSchedule = true;
      amplitude.getInstance().logEvent('Clicou em ver agendamento, Schedules/list', idSchedule);
      $state.go('scheduleview', idSchedule);
    };    

    $scope.paginate = function() {
      requestSchedules();
    }

    socket.on('newSchedule', function(data) {
      if (data.payload.vehicle) {
        var idVehicle = data.payload.vehicle;
        delete data.payload.vehicle;
        data.payload.idVehicle = idVehicle;
      }
      data.payload.services = _.map(data.payload.services, 'name');
      $scope.ctrl.schedules.push(data.payload);
      $scope.ctrl.schedules = orderbyDateTime($scope.ctrl.schedules);
      amplitude.getInstance().logEvent('Novo agendamento', data.payload);
    });

    socket.on('newSchedulefromCRM', function(data) {
      if (_.find($scope.ctrl.schedules, {
          _id: data.payload._id
        })) return;
      $scope.ctrl.schedules.push(data.payload);
      $scope.ctrl.schedules = orderbyDateTime($scope.ctrl.schedules);
      amplitude.getInstance().logEvent('Novo agendamento', data.payload);
    });

    socket.on('SLA_noShow', function(data) {
      var index;
      var scheduleNoShow = _.find($scope.ctrl.schedules, function(value, key) {
        if (value._id === data.payload._id) {
          index = key;
          return value
        }
      });
      if (scheduleNoShow) {
        $scope.ctrl.schedules[index] = data.payload;
        $scope.filterByStatus($scope.ctrl.statusFilter);
      }
      amplitude.getInstance().logEvent('Agendamento foi para NO-SHOW automaticamente', data.payload);
    });

    socket.on('SLA_toFinish', function(data) {
      var index;
      var scheduleFinished = _.find($scope.ctrl.schedules, function(value, key) {
        if (value._id === data.payload._id) {
          index = key;
          return value
        }
      });
      if (scheduleFinished) {
        $scope.ctrl.schedules[index] = data.payload;
        $scope.filterByStatus($scope.ctrl.statusFilter);
      }
      amplitude.getInstance().logEvent('Agendamento foi para FINISHED automaticamente', data.payload);
    });

    $scope.toService = function(item, index) {

      if (!item || index === undefined) return;

      generalUtils.startLoader();
      item.status = 'service';
      item = Restangular.copy(item);
      item.route = 'schedules';
      item.put().then(function(data) {
        var schedule = {id: data._id};
        amplitude.getInstance().logEvent('Agendamento foi para SERVICE', schedule);
        generalUtils.hideLoader();
        $scope.ctrl.schedules.splice(index, 1);
        generalUtils.onSuccess("Sucesso!",
          "Agendamento alterado para em serviço.",
          "OK",
          "",
          function(isConfirm) {})
      }, function(err) {
        generalUtils.hideLoader();
        if (err.data.code == '1') return generalUtils.onError("Ops!", err.data.message, "Confirmar", function(isConfirm) {});
        generalUtils.onError("Ops!", "Não foi possível alterar seu agendamento.", "Confirmar", function(isConfirm) {});
      });
    };

    $scope.filterByStatus = function(status) {
      amplitude.getInstance().logEvent('Clicou em ' + status);
      $scope.ctrl.statusFilter = status;
      $scope.ctrl.currentPage = 1;
      $scope.ctrl.dateFilter = '';
      $scope.calendar.selectedDate = '';
      requestSchedules()
    };

    $scope.filterByDate = function() {
      $scope.ctrl.dateFilter = moment($scope.calendar.selectedDate).format('YYYY-MM-DD');
      $scope.ctrl.currentPage = 1;
      requestSchedules()
    };

    $scope.showAllDates = function() {
      amplitude.getInstance().logEvent('Clicou em mostrar todas as datas');
      $scope.ctrl.dateFilter = '';
      $scope.calendar.selectedDate = '';
      $scope.ctrl.currentPage = 1;
      requestSchedules()
    };

    $scope.changeSchedule = function(idSchedule) {
      var schedule = {id: idSchedule};
      $scope.ctrl.disableChangeSchedule = true;
      amplitude.getInstance().logEvent('Clicou em alterar status do agendamento', schedule);
      var modal = $uibModal.open({
        animation: true,
        templateUrl: 'app/schedules/scheduled/view/modal-change.html',
        controller: 'ModalChangeCtrl',
        controllerAs: 'ctrl',
        size: 'md',
        resolve: {
          Schedule: ['Restangular',
            function(Restangular) {
              return Restangular.one('schedules', idSchedule).get();
            }
          ]
        }
      });
      modal.result.then(function () {
        $scope.ctrl.disableChangeSchedule = false;
      }, function(){
        $scope.ctrl.disableChangeSchedule = false;
      });
    };

    $scope.agendar = function(idVehicle) {
      $scope.ctrl.disableScheduleButton = true;
      amplitude.getInstance().logEvent('Clicou em novo agendamento');
      $state.go('schedulecreate', idVehicle);
    };

    $scope.cancel = function() {
      amplitude.getInstance().logEvent('Clicou em cancelar o agendamento');
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

    $scope.clearCalendar = function() {
      $scope.calendar.selectedDate = null;
    };

    $scope.setDate = function(year, month, day) {
      $scope.calendar.selectedDate = new Date(year, month, day);
    };

    $scope.orderByScheduled = function(){
      $scope.ctrl.orderByScheduled = !$scope.ctrl.orderByScheduled;
      if ($scope.ctrl.orderByScheduled){
        $scope.ctrl.orderBy = 'dateISO';
        $scope.ctrl.orderType = 'asc';
        requestSchedules();
      }
      if (!$scope.ctrl.orderByScheduled){
        $scope.ctrl.orderBy = 'dateISO';
        $scope.ctrl.orderType = 'desc';
        requestSchedules();
      }
      $scope.ctrl.orderByCustomer = true;
      $scope.ctrl.orderByVehicle = true;
      $scope.ctrl.orderByPlate = true;
      $scope.ctrl.orderByOrigin = true;
      $scope.ctrl.orderByCreateAt = true;
      $scope.ctrl.orderByFinished = true;
    };

    $scope.orderByCustomer = function(){
      $scope.ctrl.orderByCustomer = !$scope.ctrl.orderByCustomer;
      if ($scope.ctrl.orderByCustomer) 
        $scope.ctrl.schedules = _.orderBy($scope.ctrl.schedules, ['customer.fullname'], ['asc']);
      if (!$scope.ctrl.orderByCustomer)
        $scope.ctrl.schedules = _.orderBy($scope.ctrl.schedules, ['customer.fullname'], ['desc']);
      $scope.ctrl.orderByScheduled = true;
      $scope.ctrl.orderByVehicle = true;
      $scope.ctrl.orderByPlate = true;
      $scope.ctrl.orderByOrigin = true;
      $scope.ctrl.orderByCreateAt = true;
      $scope.ctrl.orderByFinished = true;
    };

    $scope.orderByVehicle = function(){
      $scope.ctrl.orderByVehicle = !$scope.ctrl.orderByVehicle;
      if ($scope.ctrl.orderByVehicle) 
        $scope.ctrl.schedules = _.orderBy($scope.ctrl.schedules, ['idVehicle.name'], ['asc']);
      if (!$scope.ctrl.orderByVehicle)
        $scope.ctrl.schedules = _.orderBy($scope.ctrl.schedules, ['idVehicle.name'], ['desc']);
      $scope.ctrl.orderByCustomer = true;
      $scope.ctrl.orderByScheduled = true;
      $scope.ctrl.orderByPlate = true;
      $scope.ctrl.orderByOrigin = true;
      $scope.ctrl.orderByCreateAt = true;
      $scope.ctrl.orderByFinished = true;
    };

    $scope.orderByPlate = function(){
      $scope.ctrl.orderByPlate = !$scope.ctrl.orderByPlate;
      if ($scope.ctrl.orderByPlate) 
        $scope.ctrl.schedules = _.orderBy($scope.ctrl.schedules, ['idVehicle.plate'], ['asc']);
      if (!$scope.ctrl.orderByPlate)
        $scope.ctrl.schedules = _.orderBy($scope.ctrl.schedules, ['idVehicle.plate'], ['desc']);
      $scope.ctrl.orderByCustomer = true;
      $scope.ctrl.orderByVehicle = true;
      $scope.ctrl.orderByScheduled = true
      $scope.ctrl.orderByOrigin = true;
      $scope.ctrl.orderByCreateAt = true;
      $scope.ctrl.orderByFinished = true;
    };

    $scope.orderByOrigin = function(){
      $scope.ctrl.orderByOrigin = !$scope.ctrl.orderByOrigin;
      if ($scope.ctrl.orderByOrigin){
        $scope.ctrl.orderBy = 'origin';
        $scope.ctrl.orderType = 'asc';
        requestSchedules();
      }
      if (!$scope.ctrl.orderByOrigin){
        $scope.ctrl.orderBy = 'origin';
        $scope.ctrl.orderType = 'desc';
        requestSchedules();
      }
      $scope.ctrl.orderByCustomer = true;
      $scope.ctrl.orderByVehicle = true;
      $scope.ctrl.orderByPlate = true;
      $scope.ctrl.orderByScheduled = true;
      $scope.ctrl.orderByCreateAt = true;
      $scope.ctrl.orderByFinished = true;
    };

    $scope.orderByCreateAt = function(){
      $scope.ctrl.orderByCreateAt = !$scope.ctrl.orderByCreateAt;
      if ($scope.ctrl.orderByCreateAt){
        $scope.ctrl.orderBy = 'createdAt';
        $scope.ctrl.orderType = 'asc';
        requestSchedules();
      }
      if (!$scope.ctrl.orderByCreateAt){
        $scope.ctrl.orderBy = 'createdAt';
        $scope.ctrl.orderType = 'desc';
        requestSchedules();
      }
      $scope.ctrl.orderByCustomer = true;
      $scope.ctrl.orderByVehicle = true;
      $scope.ctrl.orderByPlate = true;
      $scope.ctrl.orderByOrigin = true;
      $scope.ctrl.orderByScheduled = true;
      $scope.ctrl.orderByFinished = true;
    };

    $scope.orderByFinished = function(){
      $scope.ctrl.orderByFinished = !$scope.ctrl.orderByFinished;
      if ($scope.ctrl.orderByFinished == true){
        $scope.ctrl.orderBy = 'dateFinished';
        $scope.ctrl.orderType = 'asc';
        requestSchedules();
      }
      if (!$scope.ctrl.orderByFinished){
        $scope.ctrl.orderBy = 'dateFinished';
        $scope.ctrl.orderType = 'desc';
        requestSchedules();
      }
      $scope.ctrl.orderByCustomer = true;
      $scope.ctrl.orderByVehicle = true;
      $scope.ctrl.orderByPlate = true;
      $scope.ctrl.orderByOrigin = true;
      $scope.ctrl.orderByScheduled = true;
      $scope.ctrl.orderByCreateAt = true;
    };
  }
})();