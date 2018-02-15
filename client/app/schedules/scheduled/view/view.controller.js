(function () {
  'use strict';

  angular.module('app')
    .controller('ScheduleViewController', ['$scope', '$filter', 'Restangular', '$q', '$timeout', 'WizardHandler', '$stateParams', '$state', 'Schedule',
      '$uibModal', 'environment', 'permissions', 'generalUtils', ScheduleViewController]);

  function ScheduleViewController($scope, $filter, Restangular, $q, $timeout, WizardHandler, $stateParams, $state, Schedule, $uibModal,
                                  environment, permissions, generalUtils) {
    $scope.permissions = permissions;
    $scope.generateYearsStringByMonth = generalUtils.generateYearsStringByMonth;
    $scope.ctrl = {
      schedule: Schedule,
      splitedEmail: generalUtils.verifyEmailStaff(),
      selectedCustomer: Schedule.customer,
      selectedVehicle: Schedule.idVehicle,
      disableChangeButton: false,
      servicesDetailed: generateServiceString(_.concat(Schedule.servicesDetails, filterServicesDuplicates()))
    };

    function generateServiceString (services) {
      return _.map(services, function (service) {
        if (service.type === 'inspection' && service.inspectionTime)
          service.inspectionTimeString =  $scope.generateYearsStringByMonth(service.inspectionTime);

        return service;
      });
    }

    function getVehicleImage() {
      $scope.ctrl.vehicleImageUri = generalUtils.getVehicleImage(environment, $scope.ctrl.selectedVehicle);
    };

    if ($scope.ctrl.selectedVehicle) getVehicleImage();

    function filterServicesDuplicates () {
      return _.filter(Schedule.services, function (service) {
        if (!_.find(Schedule.servicesDetails, function (serviceDetail) {
            return serviceDetail.name === service.name;
          })) return service;
      });
    }

    $scope.generateYearsStringByMonth = generalUtils.generateYearsStringByMonth;

    $scope.change = function (e) {
      $scope.ctrl.disableChangeButton = true;
      changeSchedule($scope.ctrl.schedule._id);
    };

    $scope.editar = function(e) {
      $scope.ctrl.disableScheduleButton = true;
      $state.go('schedule-edit', {idSchedule:$scope.ctrl.schedule._id, idCustomer:$scope.ctrl.schedule.customer._id});
    };

    $scope.cancel = function (e) {
      $state.go('schedules');
    };

    _.map($scope.ctrl.inspection, function (value) {
      value = 'Revisão de ' + value.toString();
      return value;
    });

    $scope.inspectionChange = function (inspection) {
      inspection = JSON.parse(inspection);
      $scope.form.inspection = inspection;
    };


    function onError(title, text) {
      swal({
        title: title,
        text: text,
        type: "error",
        confirmButtonText: "Confirmar"
      })
    }

    function onSuccess(title, text) {
      swal({
        title: title,
        text: text,
        type: "success",
        confirmButtonText: "Voltar para tela principal",
        closeOnConfirm: true,
        closeOnCancel: true
      }, function (isConfirm) {
        if (isConfirm) {
          $state.go('schedules');
        }
      });
    }

    function editSchedule(idSchedule){}

    function changeSchedule(idSchedule) {
      var modal = $uibModal.open({
        animation: true,
        templateUrl: 'app/schedules/scheduled/view/modal-change.html',
        controller: 'ModalChangeCtrl',
        controllerAs: 'ctrl',
        size: 'md',
        resolve: {
          Schedule: ['Restangular',
            function (Restangular) {
              return Restangular.one('schedules', idSchedule).get();
            }
          ]
        }
      });
      modal.result.then(function () {
        $scope.ctrl.disableChangeButton = false;
      }, function(){
        $scope.ctrl.disableChangeButton = false;
      });
    }
  }
})();
