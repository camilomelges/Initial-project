/**
 * Created by keyboard99 on 5/5/17.
 */

(function () {
  'use strict';

  angular.module('app')
    .controller('ScheduleEditCtrl', ['$location', '$anchorScroll', '$timeout', '$rootScope', '$scope', 'Restangular', '$state', 'Customer', 'Schedule', 'Vehicle', 'Services', 'BranchSettings', 'generalUtils', 'Relationships', 'permissions', '$uibModal',
      'Notification', 'environment', 'originList', 'constantScheduleStatus', 'Partner', 'localStorageService', ScheduleEditCtrl]);

  function ScheduleEditCtrl($location, $anchorScroll, $timeout, $rootScope, $scope, Restangular, $state, Customer, Schedule, Vehicle, Services, BranchSettings, generalUtils, Relationships, permissions, $uibModal,
                            Notification, environment, originList, constantScheduleStatus, Partner, localStorageService) {
    var operationWeekend = Partner.operationWeekend ? Partner.operationWeekend : {saturday: true, sunday: false};
    $scope.authentication = localStorageService.get('authentication');

    amplitude.getInstance().logEvent('Entrou na página de edição de agendamento');
    if (Schedule.status && constantScheduleStatus.includes(Schedule.status)) {
      $state.go('schedules');
    }

    $scope.originList = originList;
    $scope.permissions = permissions;

    Customer = _.isEmpty(Customer) ? undefined : Customer;

    //TODO MVP save origin schedule - Lince Agendamento Online MVP
    var sources = [];
    _.map(Relationships, function (v) {
      _.forEach(v.campaigns, function (campaign) {
        campaign['nameRelationship'] = v.name;
        campaign['idRelationship'] = v._id;

        sources.push(campaign);
      });
    });

    $scope.generateYearsStringByMonth = generalUtils.generateYearsStringByMonth;

    $scope.ctrl = {
      splitedEmail: generalUtils.verifyEmailStaff(),
      selectedEmail: false,
      customerArray: Schedule.customer ? [Schedule.customer] : [],
      selectedService: undefined,
      isWaiting: false,
      error: {
        date: false,
        hour: false
      },
      vehicleArray: Schedule.customer.vehicles ? [Schedule.customer.vehicles] : [],
      selectedCustomer: Schedule.customer,
      selectedVehicle: Schedule.idVehicle,
      selectedHour: Schedule.hour,
      note: Schedule.observation,
      originSchedules: originList,
      selectedOrigin: _.find(originList, function (origin) {
        return origin.value === Schedule.origin;
      }),
      Relationships: sources,
      schedule: Schedule,
      services: angular.copy(Services),
      servicesWithoutDetails: Schedule.services,
      servicesDetailed: generateServiceString(_.concat(Schedule.servicesDetails, filterServicesDuplicates())),
      searchType: 'name',
      searchField: '',
      searchClient: !Schedule.customer,
      showVehicleForm: false,
      btnVehicle: 'Novo veículo',
      btnAddVehicle: false,
      timeOptions: generateTimeOptions(),
      km: Schedule.inspection ? Schedule.inspection.km : '',
      timeValid: true,
      vehicleForm: {},
      saveFormButton: 'Salvar edição',
      title: '',
      disableCancelButton: false
    };

    if (Schedule.status === "pending") {
      $scope.ctrl.title = 'Editar agendamento';
      $scope.ctrl.saveFormButton = 'Salvar';
    }
    if (Schedule.status === "no-show") {
      $scope.ctrl.title = 'Agendar novamente';
      $scope.ctrl.saveFormButton = 'Reagendar';
    }

    function generateServiceString(services) {
      return _.map(services, function (service) {
        if (service.type === 'inspection' && service.inspectionTime)
          service.inspectionTimeString = $scope.generateYearsStringByMonth(service.inspectionTime);

        return service;
      });
    }

    function getVehicleImage() {
      $scope.ctrl.vehicleImageUri = generalUtils.getVehicleImage(environment, $scope.ctrl.selectedVehicle);
    };

    $scope.toggleVehicle = function () {
      amplitude.getInstance().logEvent('Selecionou um veículo');
      if (!$scope.ctrl.selectedCustomer && _.isEmpty($scope.ctrl.selectedCustomer.vehicles)) return;
      $scope.disableNotMarkedError();
      getVehicleImage();
    };

    function disableChoiseVehicleLockedError() {
      $scope.ctrl.vehicleLockedError = false;
    };

    $scope.disableNotMarkedError = function () {
      if (!$scope.ctrl.vehicleMarkedToSchedule) disableChoiseVehicleLockedError();
      $scope.ctrl.vehicleNotMarkedToScheduleError = false;
    };

    function disableNotServiceError() {
      $scope.ctrl.notServiceAddedError = false;
    };

    $scope.choiseVehicle = function (vehicle) {
      if ($scope.ctrl.vehicleMarkedToSchedule) return $scope.ctrl.vehicleLockedError = true;
      $scope.ctrl.selectedVehicle = vehicle;
      $scope.ctrl.idVehicle = vehicle._id;
      $scope.ctrl.vehicleMarkedToSchedule = false;
      $scope.disableNotMarkedError();
      getVehicleImage();
    };


    if ($scope.ctrl.selectedVehicle) {
      $scope.ctrl.vehicleMarkedToSchedule = true;
      $scope.toggleVehicle();
    }

    function filterServicesDuplicates() {
      return _.filter(Schedule.services, function (service) {
        if (!_.find(Schedule.servicesDetails, function (serviceDetail) {
            return serviceDetail.name === service.name;
          })) return service;
      });
    }

    $scope.ctrl.services = _.map($scope.ctrl.services, function (service) {
      if (!_.find($scope.ctrl.servicesDetailed, function (scheduleService) {
          if (!scheduleService.service) return scheduleService._id.toString() === service._id.toString();
          return scheduleService.service.toString() === service._id.toString();
        })) return service;
    });

    $scope.serviceSelected = function () {
      hideInspection();
      hideDiagnostic();
      if (!$scope.ctrl.selectedService) return $scope.cancelAddService();
      if ($scope.ctrl.selectedService.name.includes('Revisão'))
        return $scope.ctrl.inspectionSelected = true;

      if ($scope.ctrl.selectedService.name.includes('Diagnóstico'))
        return $scope.ctrl.diagnosticSelected = true;
    };

    function hideDiagnostic() {
      $scope.ctrl.diagnosticSelected = false;
      $scope.ctrl.selectedService.diagnosticObservation = undefined;
    };

    function hideInspection() {
      $scope.ctrl.inspectionSelected = false;
      $scope.ctrl.inspectionParameter = undefined;
      $scope.ctrl.selectedService.inspectionKm = undefined;
      $scope.ctrl.selectedService.inspectionTime = undefined;
    }

    $scope.addService = function (form) {
      $scope.ctrl.serviceForm = form;
      if (!form.$valid) return;
      disableNotServiceError();

      ($scope.ctrl.selectedService.name.includes('Revisão')) ? $scope.ctrl.selectedService.type = 'inspection' :
        $scope.ctrl.selectedService.type = 'other';

      ($scope.ctrl.selectedService.name.includes('Diagnóstico')) ? $scope.ctrl.selectedService.type = 'diagnostic' :
        $scope.ctrl.selectedService.type = 'other';

      if ($scope.ctrl.selectedService.type === 'inspection')
        $scope.ctrl.selectedService.inspectionTimeString = $scope.generateYearsStringByMonth($scope.ctrl.selectedService.inspectionTime);

      $scope.ctrl.servicesDetailed.push(angular.copy($scope.ctrl.selectedService));
      $scope.ctrl.servicesWithoutDetails.push($scope.ctrl.selectedService);
      $scope.ctrl.services.splice($scope.ctrl.services.indexOf(
        $scope.ctrl.selectedService
      ), 1);

      $scope.cancelAddService();
    };

    $scope.removeService = function (index, selectedService) {
      $scope.ctrl.services.unshift(_.find(Services, function (service) {
        if (!selectedService.service) return selectedService._id.toString() === service._id.toString();
        return service._id.toString() === selectedService.service.toString();
      }));

      var serviceIdIndex = $scope.ctrl.servicesWithoutDetails.indexOf(
        _.find($scope.ctrl.servicesWithoutDetails, function (service) {
          if (service.service) return (service.service.toString()) === (selectedService.service.toString());
          if (service._id && selectedService._id) return (service._id.toString()) === selectedService._id.toString();
          if (service._id) return (service._id.toString()) === selectedService.service.toString();
        })
      );
      if (serviceIdIndex !== undefined) $scope.ctrl.servicesWithoutDetails.splice(serviceIdIndex, 1);
      $scope.ctrl.servicesDetailed.splice(index, 1);
    };

    $scope.cancelAddService = function () {
      $scope.ctrl.inspectionParameter = undefined;
      $scope.ctrl.inspectionSelected = false;
      if ($scope.ctrl.serviceForm) $scope.ctrl.serviceForm.$submitted = false;
      if (!$scope.ctrl.selectedService) return;
      $scope.ctrl.selectedService.durationTime = undefined;
      $scope.ctrl.selectedService.inspectionKm = undefined;
      $scope.ctrl.selectedService.inspectionTime = undefined;
      delete $scope.ctrl.selectedService;
      delete $scope.ctrl.inspectionSelected;
    };

    $scope.updateKmModal = function () {
      amplitude.getInstance().logEvent('Clicou em atualizar kilometragem');
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/schedules/scheduled/update-km-modal.html',
        backdrop: 'static',
        controller: 'UpdateKmModalCtrl',
        size: 'md',
        resolve: {
          Vehicle: [function () {
            return $scope.ctrl.selectedVehicle || {};
          }]
        }
      });

      modalInstance.result.then(function (data) {
        switch (data.reason) {
          case 'update':
            $scope.ctrl.selectedVehicle.km = data.km;
            $scope.ctrl.selectedVehicle.lastKmUpdate = data.lastKmUpdate;
            Notification.success({
              message: 'Quilometragem atualizada! :)',
              closeOnClick: true,
              delay: 1500
            });
            break;
          case 'error-update':
            Notification.error({
              message: 'Não foi possível atualizar a quilometragem :(',
              closeOnClick: true,
              delay: 1500
            });
            break;
        }
      })
    };

    $scope.updateInspectionModal = function () {
      amplitude.getInstance().logEvent('Clicou em atualizar data de revisão');
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/schedules/scheduled/update-inspection-modal.html',
        backdrop: 'static',
        controller: 'UpdateInspectionModalCtrl',
        size: 'md',
        resolve: {
          Vehicle: [function () {
            return $scope.ctrl.selectedVehicle || {};
          }]
        }
      });

      modalInstance.result.then(function (data) {
        switch (data.reason) {
          case 'update':
            if (!$scope.ctrl.selectedVehicle.inspection) $scope.ctrl.selectedVehicle.inspection = {};
            $scope.ctrl.selectedVehicle.inspection.km = data.km;
            $scope.ctrl.selectedVehicle.inspection.date = data.date;
            Notification.success({
              message: 'Data de revisão atualizada! :)',
              closeOnClick: true,
              delay: 1500
            });
            break;
          case 'error-update':
            Notification.error({
              message: 'Não foi possível atualizar a data de revisão :(',
              closeOnClick: true,
              delay: 1500
            });
            break;
        }
      })
    };

    $scope.toggleHour = function () {
      amplitude.getInstance().logEvent('Clicou em trocar horário do agendamento');
      $scope.ctrl.selectedHour = undefined;
    };

    $scope.oSchedule = function () {
      amplitude.getInstance().logEvent('Clicou em editar origem do agendamento');
    };

    $scope.calendar = {
      dateOptions: {
        formatYear: 'yy',
        initDate: null,
        minDate: new Date(),
        maxDate: moment().add(2, "year"),
        startingDay: 0,
        dateDisabled: function (data) {
          var date = data.date,
            mode = data.mode;
          return mode === 'day' && (date.getDay() === 0 && !operationWeekend.sunday) || (date.getDay() === 6 && !operationWeekend.saturday);
        }
      },
      format: 'dd/MM/yyyy',
      altInputFormats: ['d!/M!/yyyy'],
      selectedDate: new Date(Schedule.dateISO)
    };

    var dateManipulate = moment(new Date()).add(1, "days");

    if ($scope.authentication.partner === "590a2aca42742a46648299eb") {
      var dateManipulate = moment(new Date()).add(1, "days");

      if (dateManipulate.isoWeekday() === 7) {
        $scope.calendar.dateOptions.minDate = moment().add(4, 'days');
        $scope.calendar.dateOptions.initDate = new Date(moment().add(4, 'days'));

      } else if (dateManipulate.isoWeekday() === 6) {
        $scope.calendar.dateOptions.minDate = moment().add(5, 'days');
        $scope.calendar.dateOptions.initDate = new Date(moment().add(5, 'days'));

      } else if (dateManipulate.isoWeekday() === 5) {
        $scope.calendar.dateOptions.minDate = moment().add(6, 'days');
        $scope.calendar.dateOptions.initDate = new Date(moment().add(6, 'days'));

      } else {
        $scope.calendar.dateOptions.minDate = moment().add(3, 'days');
        $scope.calendar.dateOptions.initDate = new Date(moment().add(3, 'days'));
      }
    }

    $scope.clearCalendar = function () {
      $scope.calendar.selectedDate = null;
    };

    // Disable weekend selection
    $scope.disabledCalendar = function (date, mode) {
      return mode === 'day' && (date.getDay() === 0 && !operationWeekend.sunday) || (date.getDay() === 6 && !operationWeekend.saturday);
    };

    $scope.setDate = function (year, month, day) {
      $scope.calendar.selectedDate = new Date(year, month, day);
    };

    $scope.inspectionIsSelected = function () {
      return !_.isEmpty(_.find($scope.ctrl.servicesDetailed, {name: 'Revisão'}))
    };

    $scope.emptyField = function (val) {
      $scope.ctrl.searchField = '';
    };

    $scope.checkError = function (error) {
      switch (error) {
        case 'date' :
          if($scope.calendar.selectedDate) $scope.ctrl.error.date = false;
          break;
        case 'hour':
          if($scope.ctrl.selectedHour) $scope.ctrl.error.hour = false;
          break;
      }
    };

    $scope.saveSchedule = function () {
      amplitude.getInstance().logEvent('Clicou em salvar edição do agendamento');
      const END_WEEK_ERROR = "Não é possível agendar para o final de semana, verifique a data selecionada e tente novamente!";
      const PASSED_HOUR_ERROR = "Não é possível agendar em horas passadas, verifique a hora selecionada e tente novamente!";
      const PASSED_DATE_ERROR = "Não é possível agendar em datas passadas, verifique a data selecionada e tente novamente!";
      const FORM_REQUIRED_ERROR = "Verifique se o formulário está devidamente preenchido e tente novamente!";

      if (!$scope.calendar.selectedDate) $scope.ctrl.error.date = true;
      if (!$scope.ctrl.selectedHour) $scope.ctrl.error.hour = true;

      if (
        !$scope.ctrl.selectedCustomer ||
        !$scope.ctrl.selectedCustomer._id ||
        !$scope.ctrl.selectedVehicle ||
        !$scope.ctrl.selectedVehicle._id ||
        !$scope.ctrl.servicesDetailed ||
        !$scope.ctrl.vehicleMarkedToSchedule ||
        _.isEmpty($scope.ctrl.servicesDetailed) ||
        !$scope.calendar.selectedDate ||
        !$scope.ctrl.selectedHour
      ) {
        if (!$scope.ctrl.vehicleMarkedToSchedule) $scope.ctrl.vehicleNotMarkedToScheduleError = true;
        if (_.isEmpty($scope.ctrl.servicesDetailed)) $scope.ctrl.notServiceAddedError = true;

        return generalUtils.onError('Ops', FORM_REQUIRED_ERROR, 'OK', function (isConfirm) {
        });
      }


      var schedule = angular.copy(Schedule);

      var selectedDate = moment(new Date($scope.calendar.selectedDate)).format("DD/MM/YYYY");
      var actualDate = moment(new Date()).format("DD/MM/YYYY");

      var fullHour = $scope.ctrl.selectedHour;
      var hour = parseInt(fullHour ? fullHour.split(":")[0] : 0);
      var minutes = parseInt(fullHour ? fullHour.split(":")[1] : 0);

      if (($scope.calendar.selectedDate.getDay() === 0 && !operationWeekend.sunday) || ($scope.calendar.selectedDate.getDay() === 6 && !operationWeekend.saturday))
        return generalUtils.onError('Ops', END_WEEK_ERROR, 'OK', function (isConfirm) {
        });

      var hackDate = new Date($scope.calendar.selectedDate);
      hackDate.setHours(23);
      hackDate.setMinutes(59);
      if (moment(hackDate) < moment(new Date())) return generalUtils.onError('Ops', PASSED_DATE_ERROR, 'OK', function (isConfirm) {
      });

      if (selectedDate === actualDate) {
        if (hour < new Date().getHours())
          return generalUtils.onError('Ops', PASSED_HOUR_ERROR, 'OK', function (isConfirm) {
          });

        if ((hour === new Date().getHours() || hour < new Date().getHours()) && minutes < new Date().getMinutes())
          return generalUtils.onError('Ops', PASSED_HOUR_ERROR, 'OK', function (isConfirm) {
          });
      }

      schedule.date = $scope.calendar.selectedDate;
      schedule.hour = $scope.ctrl.selectedHour;
      schedule.customer = $scope.ctrl.selectedCustomer._id;
      schedule.idVehicle = $scope.ctrl.selectedVehicle;
      if ($scope.inspection && !_.isEmpty($scope.ctrl.km))
        schedule.inspection = {km: $scope.ctrl.km};
      schedule.services = _.map($scope.ctrl.servicesWithoutDetails, '_id');
      schedule.servicesDetails = _.map($scope.ctrl.servicesDetailed, function (service) {
        if (service.type) return {
          service: (service._id) ? service._id : service.service,
          name: service.name,
          durationTime: service.durationTime,
          type: service.type,
          inspectionKm: (service.inspectionKm) ? service.inspectionKm : undefined,
          inspectionTime: (service.inspectionTime) ? service.inspectionTime : undefined,
          diagnosticObservation: (service.diagnosticObservation) ? service.diagnosticObservation : undefined
        }
      }).filter(function (item) {
        return item !== undefined;
      });
      schedule.observation = $scope.ctrl.note;
      schedule.origin = $scope.ctrl.selectedOrigin.name;
      schedule.status = 'pending';

      generalUtils.startLoader();
      $scope.ctrl.isWaiting = true;

      Restangular.all("/schedules/" + schedule._id).customPUT(schedule)
        .then(function (vehicle) {
          $scope.ctrl.isWaiting = false;
          generalUtils.hideLoader();
          generalUtils.onSuccess("Sucesso!",
            "Seu agendamento foi alterado com sucesso.",
            "",
            "",
            function (isConfirm) {
              amplitude.getInstance().logEvent('Clicou em agendamento editado com sucesso!');
              if (Schedule.status === "no-show") return $state.go('schedules')
              $state.go('scheduleview', {id: schedule._id});
            })

        }, function (err) {
          $scope.ctrl.isWaiting = false;

          amplitude.getInstance().logEvent('Não foi possível editar o agendamento');
          generalUtils.hideLoader();
          $scope.ctrl.isWaiting = false;
          if (err.data.code === '1') return generalUtils.onError("Ops!", err.data.message, "Confirmar", function (isConfirm) {
          });
          generalUtils.onError("Ops!", "Não foi possível alterar seu agendamento.", "Confirmar", function (isConfirm) {
          });
        });
    };

    $scope.cancelSchedule = function () {
      $scope.ctrl.disableCancelButton = true;
      if (Schedule.status !== 'no-show') return $state.go('scheduleview', {id: Schedule._id});
      $state.go('schedules');
    };

    $scope.hasServices = function () {
      return (!_.isEmpty($scope.ctrl.servicesDetailed) || !!($scope.inspection && !_.isEmpty($scope.ctrl.km)));
    };

    // Functions ADD VEHICLE
    $scope.toggleVehicleForm = function () {
      $scope.ctrl.showVehicleForm = !$scope.ctrl.showVehicleForm;

      if ($scope.ctrl.showVehicleForm) {
        $scope.ctrl.btnVehicle = 'Cancelar veículo';
        requestBrandsVehicles();
      } else {
        $scope.ctrl.btnVehicle = 'Novo veículo';
      }
    };

    function requestBrandsVehicles() {
      $scope.ctrl.brands = [{
        name: 'Carregando',
        _id: '1'
      }];
      $scope.ctrl.brand = $scope.ctrl.brands[0];

      Restangular.all('vehicles/brands').getList().then(function (data) {
        $scope.ctrl.brands = [];
        $scope.ctrl.brands = data;
      }, function (err) {
        $scope.ctrl.brands = [];
      });
    }

    $scope.brandChange = function (brand) {
      if (!brand)
        return;

      $scope.ctrl.model = [{
        _id: '1',
        name: 'Carregando...'
      }];

      $scope.ctrl.vehicleForm['idBrand'] = brand._id;
      $scope.ctrl.vehicleForm['brand'] = brand.name;
      $scope.ctrl.yearFab = '';
      $scope.ctrl.yearModel = '';
      Restangular.one('vehicles/name?brand=' + $scope.ctrl.vehicleForm.idBrand).getList().then(function (data) {
        $scope.ctrl.models = [];
        $scope.ctrl.models = data;
      }, function (err) {
        $scope.ctrl.models = [];
      });
    };

    $scope.modelChange = function (model) {
      if (!model)
        return;

      $scope.ctrl.yearModel = '';
      $scope.ctrl.yearFab = '';
      $scope.ctrl.vehicleForm['idName'] = model._id;
      $scope.ctrl.vehicleForm['name'] = model.name;


      Restangular.one('vehicles/year?idVehicle=' + $scope.ctrl.vehicleForm.idName).getList().then(function (data) {
        $scope.ctrl.yearsFab = data;
      }, function (err) {
        $scope.ctrl.yearsFab = [];
      });
    };

    $scope.yearFabChange = function (year) {
      if (!year)
        return;

      $scope.ctrl.specifications = [{
        '_id': '1',
        'name': 'Carregando...'
      }];
      $scope.ctrl.vehicleForm['year'] = year;
      Restangular.one('vehicles/specifications?idVehicle=' + $scope.ctrl.vehicleForm.idName + '&model=' + $scope.ctrl.vehicleForm.year).getList().then(function (data) {
        $scope.ctrl.specifications = data;
      }, function (err) {
        $scope.ctrl.specifications = [];
      });

      var yearModel = [];
      yearModel.push(year);
      yearModel.push((parseInt(year) + 1));
      $scope.ctrl.yearsModel = yearModel;
    };

    $scope.yearModelChange = function (year) {
      $scope.ctrl.vehicleForm['model'] = year;
    };

    $scope.specificationChange = function (specification) {
      if (!specification) return;

      $scope.ctrl.vehicleForm['specification'] = specification.name;
      $scope.ctrl.vehicleForm['idSpecification'] = specification._id;
    };

    $scope.canSubmitVehicle = function () {
      return $scope.form_vehicle.$valid;
    };

    function resetFormVehicle() {
      $scope.ctrl.showVehicleForm = false;
      $scope.ctrl.btnVehicle = 'Novo veículo';
      $scope.ctrl.vehicleForm['plate'] = '';
      $scope.ctrl.vehicleForm['km'] = '';
      $scope.ctrl.brand = '';
      $scope.ctrl.brands = [];
      $scope.ctrl.model = '';
      $scope.ctrl.models = [];
      $scope.ctrl.specification = '';
      $scope.ctrl.specifications = [];
      $scope.ctrl.yearFab = '';
      $scope.ctrl.yearsFab = [];
      $scope.ctrl.yearModel = '';
      $scope.ctrl.yearsModel = [];
    }

    $scope.saveVehicle = function (idCustomer) {
      $scope.ctrl.vehicleForm['idCustomer'] = idCustomer;
      $scope.ctrl.vehicleForm['plate'] = generalUtils.validatePlate($scope.ctrl.vehicleForm.plate);
      $scope.ctrl.vehicleForm['year'] = generalUtils.validateYear($scope.ctrl.vehicleForm.year);
      $scope.ctrl.vehicleForm['model'] = generalUtils.validateYear($scope.ctrl.vehicleForm.model);
      $scope.ctrl.vehicleForm['km'] = generalUtils.validateKilometer($scope.ctrl.vehicleForm.km);


      Restangular.all('vehicles').post($scope.ctrl.vehicleForm).then(function (data) {
        $scope.ctrl.selectedCustomer.vehicles.push(data);
        $scope.ctrl.selectedVehicle = data;
        resetFormVehicle();
        generalUtils.hideLoader();

        generalUtils.onSuccess(
          'Sucesso!',
          'Veículo cadastrado na plataforma!',
          'Confirmar',
          '',
          function (isConfirm) {

          });
      }, function (err) {
        var message = "Todos os campos são obrigatórios";
        generalUtils.hideLoader();

        switch (err.data.message.code) {
          case 450:
            message = "Ano de fabricação maior que ano do modelo";
            break;
          case 451:
            message = "Ano do modelo incompatível com ano de fabricação";
            break;
          case 452:
            message = "Ano de fabricação incorreto";
            break;
          case 453:
            message = "Ano de fabricação incorreto";
            break;
          case 454:
            message = "Ano do modelo incorreto";
            break;
          case 455:
            message = "Ano do modelo incorreto";
            break;
        }
        generalUtils.onError(
          'Ops!',
          message,
          'Confirmar',
          function (isConfirm) {
          });
      });
    };
    // FIM FUNCTIONS ADD VEHICLE

    $scope.dataIsEmpty = function () {
      return _.isEmpty($scope.form.date) && _.isEmpty($scope.form.hour);
    };

    function generateTimeOptions() {
      return generalUtils.breakIntervalInMinutes(BranchSettings.startTime, BranchSettings.endTime, BranchSettings.interval);
    }


    $scope.toggleVehicleForm = function () {
      $scope.ctrl.btnAddVehicle = !$scope.ctrl.btnAddVehicle;
    };


    $scope.$on('vehicleCreated', function (observer, data) {
      $location.hash("top");
      $anchorScroll();

      if ($scope.ctrl.selectedCustomer._id === data.idCustomer._id) {
        generalUtils.startLoader();
        $timeout(function () {
          $scope.ctrl.btnAddVehicle = !$scope.ctrl.btnAddVehicle;
          $scope.ctrl.selectedCustomer.vehicles.push(data);
          $scope.ctrl.selectedVehicle = data;
          $scope.ctrl.vehicleMarkedToSchedule = false;
          getVehicleImage();
          generalUtils.hideLoader();
        }, 1500);

      }
    });
  }

})();
