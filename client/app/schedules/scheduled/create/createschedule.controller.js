/**
 * Created by atomicavocado on 03/02/17.
 */

(function () {
  'use strict';

  angular.module('app')

    .controller('CreateScheduleCtrl', ['$location', '$anchorScroll', '$timeout', '$rootScope', '$scope', 'Restangular',
      '$state', '$stateParams', 'Customer', 'Schedule', 'Services', 'Partner', 'BranchSettings', 'generalUtils',
      'Relationships', 'permissions', '$uibModal', 'Notification', 'originList', 'localStorageService', 'environment', CreateScheduleCtrl]);

  function CreateScheduleCtrl($location, $anchorScroll, $timeout, $rootScope, $scope, Restangular,
                              $state, $stateParams, Customer, Schedule, Services, Partner, BranchSettings, generalUtils,
                              Relationships, permissions, $uibModal, Notification, originList, localStorageService, environment) {

    var operationWeekend = Partner.operationWeekend ? Partner.operationWeekend : {saturday: true, sunday: false};
    $scope.authentication = localStorageService.get('authentication');

    amplitude.getInstance().logEvent('Entrou na página criação de agendamento');

    function formatPhoneCustomerArray(customerArray) {
      return _.map(customerArray, function (customer) {
        customer.phone =  generalUtils.formatPhone(customer.phone);
        return customer;
      });
    }

    $scope.originList = originList;
    $scope.permissions = permissions;
    $scope.ctrl = {
      servicesDetailed: [],
      inspectionSelected: false,
      diagnosticSelected: false,
      splitedEmail: generalUtils.verifyEmailStaff(),
      selectedEmail: false,
      customerArray: [],
      selectedCustomer: !(Customer && Customer instanceof Array) ? Customer : undefined,
      vehicleImageUri: '',
      isWaiting: false,
      error: {
        date: false,
        hour: false
      },
      vehicleMarkedToSchedule: false,
      originSchedules: originList,
      selectedService: undefined,
      selectedOrigin: _.find(originList, function (origin) {
        return origin.name === 'CRM';
      }),
      serviceForm: undefined,
      Relationships: sources,
      schedule: Schedule,
      services: angular.copy(Services),
      servicesId: [],
      searchType: 'name',
      searchField: '',
      searchClient: !Customer,
      btnVehicle: 'Novo veículo',
      btnAddVehicle: false,
      timeOptions: generateTimeOptions(),
      timeValid: true,
      vehicleForm: {
        purchaseDate: ''
      }
    };

    $scope.calendar = {
      dateOptions: {
        formatYear: 'yy',
        initDate: null,
        minDate: new Date(),
        maxDate: moment().add(2, 'year'),
        startingDay: 0,
        dateDisabled: function (data) {
          var date = data.date,
            mode = data.mode;
          return mode === 'day' && (date.getDay() === 0 && !operationWeekend.sunday) || (date.getDay() === 6 && !operationWeekend.saturday);
        }
      },
      format: 'dd/MM/yyyy',
      altInputFormats: ['d!/M!/yyyy'],
      selectedDate: ''
    };

    

    var previous = {
      state: $rootScope.previousState,
      params: $rootScope.previousParams
    };

    //TODO MVP save origin schedule - Lince Agendamento Online MVP
    var sources = [];
    _.map(Relationships, function (v) {
      _.forEach(v.campaigns, function (campaign) {
        campaign['nameRelationship'] = v.name;
        campaign['idRelationship'] = v._id;

        sources.push(campaign);
      });
    });

    $scope.refreshListWithSearch = function (search) {
      if (!search) return $scope.ctrl.customerArray = [];
      if (search.length < 3) return $scope.ctrl.customerArray = [];
      generalUtils.startLoader();

      $timeout(function(){
        Restangular.one('customers?search=' + search).get().then(function(customers) {
          $scope.ctrl.customerArray = formatPhoneCustomerArray(customers);
          generalUtils.hideLoader();

        }, function(err) {
          $scope.ctrl.customerArray = [];
          generalUtils.hideLoader();
        });
      }, 500);
    };

    $scope.toggleVehicleForm = function () {
      $scope.ctrl.btnAddVehicle = !$scope.ctrl.btnAddVehicle;
    };

    $scope.backToChat = function () {
      $state.go('chat.view', {
        id: previous.params.id
      })
    };

    $scope.customerCreate = function () {
      amplitude.getInstance().logEvent('Clicou em cadastrar novo cliente');
      var scheduleCtrl = angular.copy($scope.ctrl);

      delete scheduleCtrl.customerArray;
      $state.go('customers.create', {
        scheduleCtrl: $scope.ctrl,
        scheduleCalendar: $scope.calendar,
      });
    };

    $scope.toggleClient = function () {
      amplitude.getInstance().logEvent('Clicou em trocar em trocar cliente');
      $scope.ctrl.selectedCustomer = undefined;
      $scope.ctrl.selectedVehicle = undefined;
      $scope.ctrl.searchClient = !$scope.ctrl.searchClient;
      $scope.ctrl.vehicleMarkedToSchedule = false;
      $scope.ctrl.vehicleLockedError = false;
      $scope.ctrl.vehicleNotMarkedToScheduleError = false;
    };

    function getVehicleImage() {
      $scope.ctrl.vehicleImageUri = generalUtils.getVehicleImage(environment, $scope.ctrl.selectedVehicle);
    }

    $scope.toggleVehicle = function () {
      if (!$scope.ctrl.selectedCustomer && _.isEmpty($scope.ctrl.selectedCustomer.vehicles)) return;
      if ($stateParams.vehicleId) {
        var vehicleIdFoundAtVehicleList = _.find($scope.ctrl.selectedCustomer.vehicles, function(vehicle){
          return vehicle._id === $stateParams.vehicleId
        });
        $scope.ctrl.selectedCustomer.vehicles = generalUtils.moveArrayElementFromTo(
          $scope.ctrl.selectedCustomer.vehicles,
          $scope.ctrl.selectedCustomer.vehicles.indexOf(vehicleIdFoundAtVehicleList),
          0
        )
      }
      $scope.ctrl.selectedVehicle = $scope.ctrl.selectedCustomer.vehicles[0];
      $scope.disableNotMarkedError();
      getVehicleImage();
    };


    function disableChoiseVehicleLockedError() {
      $scope.ctrl.vehicleLockedError = false;
    }

    $scope.disableNotMarkedError = function () {
      if (!$scope.ctrl.vehicleMarkedToSchedule) disableChoiseVehicleLockedError();
      $scope.ctrl.vehicleNotMarkedToScheduleError = false;
    };

    function disableNotServiceError() {
      $scope.ctrl.notServiceAddedError = false;
    }

    $scope.choiseVehicle = function (vehicle) {
      if ($scope.ctrl.vehicleMarkedToSchedule) return $scope.ctrl.vehicleLockedError = true;
      $scope.ctrl.selectedVehicle = vehicle;
      $scope.ctrl.vehicleMarkedToSchedule = false;
      $scope.disableNotMarkedError();
      getVehicleImage();
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
      amplitude.getInstance().logEvent('Clicou em trocar horário de agendamento');
      $scope.ctrl.selectedHour = undefined;
    };

    $scope.clearCalendar = function () {
      $scope.calendar.selectedDate = null;
    };

    $scope.disabledCalendar = function (date, mode) {
      return mode === 'day' && (date.getDay() === 0 && !operationWeekend.sunday) || (date.getDay() === 6 && !operationWeekend.saturday);
    };

    $scope.setDate = function (year, month, day) {
      $scope.calendar.selectedDate = new Date(year, month, day);
    };

    $scope.inspectionIsSelected = function () {
      return !_.isEmpty(_.find($scope.ctrl.servicesDetailed, {name: 'Revisão'}))
    };

    $scope.clearInspectionParameter = function () {
      switch ($scope.ctrl.inspectionParameter) {
        case 'inspection_param_km':
          $scope.ctrl.selectedService.inspectionTime = '';
          break;
        case 'inspection_param_time':
          $scope.ctrl.selectedService.inspectionKm = '';
          break;
      }
    };

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
      hideDiagnostic();
    };

    $scope.addService = function (form) {
      $scope.ctrl.serviceForm = form;
      if (!form.$valid) return;
      disableNotServiceError();

      ($scope.ctrl.selectedService.name.includes('Revisão')) ? $scope.ctrl.selectedService.type = 'inspection' :
        $scope.ctrl.selectedService.type = 'other';

      if ($scope.ctrl.selectedService.type === 'inspection')
        $scope.ctrl.selectedService.inspectionTimeString = generalUtils.generateYearsStringByMonth($scope.ctrl.selectedService.inspectionTime);

      ($scope.ctrl.selectedService.name.includes('Diagnóstico')) ? $scope.ctrl.selectedService.type = 'diagnostic' :
        $scope.ctrl.selectedService.type = 'other';

      $scope.ctrl.servicesDetailed.push(angular.copy($scope.ctrl.selectedService));
      $scope.ctrl.servicesId.push($scope.ctrl.selectedService._id);
      $scope.ctrl.services.splice($scope.ctrl.services.indexOf(
        $scope.ctrl.selectedService
      ), 1);

      $scope.cancelAddService();
    };

    $scope.removeService = function (index, selectedService) {
      $scope.ctrl.services.unshift(_.find(Services, function (service) {
        return service._id.toString() === selectedService._id.toString();
      }));
      var serviceIdIndex = _.find($scope.ctrl.servicesId, function (serviceId) {
        return serviceId.toString() === selectedService._id.toString();
      });

      $scope.ctrl.servicesDetailed.splice(index, 1);
      $scope.ctrl.servicesId.splice(serviceIdIndex, 1);
    };

    $scope.cancelAddService = function () {
      $scope.ctrl.inspectionParameter = undefined;
      $scope.ctrl.inspectionSelected = false;
      delete $scope.ctrl.inspectionSelected;
      if ($scope.ctrl.serviceForm) $scope.ctrl.serviceForm.$submitted = false;
      if (!$scope.ctrl.selectedService) return;
      $scope.ctrl.selectedService.durationTime = undefined;
      $scope.ctrl.selectedService.inspectionKm = undefined;
      $scope.ctrl.selectedService.inspectionTime = undefined;
      delete $scope.ctrl.selectedService;
    };

    $scope.emptyField = function (val) {
      amplitude.getInstance().logEvent('Clicou em ' + $scope.ctrl.searchType);
      $scope.ctrl.searchField = '';
    };

    $scope.escolherCliente = function () {
      amplitude.getInstance().logEvent('Selecionou o cliente');
    };

    $scope.customerFind = function (keypress, $event) {
      amplitude.getInstance().logEvent('Clicou em buscar clientes');
      if (keypress)
        if ($event.keyCode !== 13)
          return;

      var value = '';
      if ($scope.ctrl.searchType === 'doc') value = generalUtils.formatCPForCNPJ($scope.ctrl.searchField);
      else value = $scope.ctrl.searchField;
      var query = 'customers?type=' + $scope.ctrl.searchType + '&value=' + value;
      Restangular.all(query).getList().then(function (data) {
        $scope.ctrl.searchClient = false;
        $scope.ctrl.customerArray = data;
      }, function (err) {
        $scope.ctrl.selectedCustomer = null;
        generalUtils.onError('Ops', 'Nenhum cliente foi encontrado. Verifique e tente novamente.', 'OK', function () {
        });
      });
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

    $scope.cancelSchedule = function () {
      $state.go('schedules');
    };

    $scope.saveSchedule = function () {
      amplitude.getInstance().logEvent('Clicou no botão de salvar agendamento');

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

      var schedule = Schedule;
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
      schedule.idVehicle = $scope.ctrl.selectedVehicle._id;
      if ($scope.inspection && !_.isEmpty($scope.ctrl.km)) schedule.inspection = {km: $scope.ctrl.km};
      schedule.services = $scope.ctrl.servicesId;
      schedule.servicesDetails = _.map($scope.ctrl.servicesDetailed, function (selectedService) {
        return {
          service: selectedService._id,
          name: selectedService.name,
          durationTime: selectedService.durationTime,
          type: selectedService.type,
          inspectionKm: (selectedService.inspectionKm) ? selectedService.inspectionKm : undefined,
          inspectionTime: (selectedService.inspectionTime) ? selectedService.inspectionTime : undefined,
          diagnosticObservation: (selectedService.diagnosticObservation) ? selectedService.diagnosticObservation : undefined
        }
      });
      schedule.observation = $scope.ctrl.note;
      schedule.origin = $scope.ctrl.selectedOrigin && $scope.ctrl.selectedOrigin.value ? $scope.ctrl.selectedOrigin.value : "CRM";

      generalUtils.startLoader();
      $scope.ctrl.isWaiting = true;
      schedule.save().then(function (data) {
        generalUtils.hideLoader();
        $scope.ctrl.isWaiting = false;
        generalUtils.onSuccess("Sucesso!",
          "Seu agendamento foi criado com sucesso.",
          "OK",
          "",
          function (isConfirm) {
            amplitude.getInstance().logEvent('Clicou em confirmar a inclusão do agendamento');
            if (previous.state.name === "chat.view") {
              $state.go('chat.view', {
                id: previous.params.id
              })
            } else {
              $state.go('schedules')
            }
          })
      }, function (err) {
        generalUtils.hideLoader();
        $scope.ctrl.isWaiting = false;
        if (err.data.code === '1') return generalUtils.onError("Ops!", err.data.message, "Confirmar", function (isConfirm) {
        });
        generalUtils.onError("Ops!", "Não foi possível criar o agendamento.", "Confirmar", function (isConfirm) {
        });
      });
    };

    $scope.hasServices = function () {
      return (!_.isEmpty($scope.ctrl.servicesDetailed) || ($scope.inspection && !_.isEmpty($scope.ctrl.km)));
    };

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
      $scope.ctrl.vehicleForm['purchaseDate'] = '';
      $scope.ctrl.yearsModel = [];
    }

    $scope.clickVehicle = function () {
      amplitude.getInstance().logEvent('Selecionou um veículo');
    };

    $scope.saveVehicle = function (idCustomer) {
      amplitude.getInstance().logEvent('Clicou em salvar novo veículo');
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

    $scope.dataIsEmpty = function () {
      return _.isEmpty($scope.form.date) && _.isEmpty($scope.form.hour);
    };

    function generateTimeOptions() {
      return generalUtils.breakIntervalInMinutes(BranchSettings.startTime, BranchSettings.endTime, BranchSettings.interval);
    }


    if ($state.params.scheduleCtrl && $state.params.scheduleCalendar) {
      $scope.ctrl = _.extend($scope.ctrl, $state.params.scheduleCtrl);
      $scope.calendar = _.extend($scope.calendar, $state.params.scheduleCalendar);

      $scope.ctrl.selectedCustomer = _.find($scope.ctrl.customerArray, function (customer) {
        return customer._id === $state.params.customerCreated;
      });
    }

    if ($scope.ctrl.selectedCustomer) $scope.toggleVehicle();
    if (previous.state.name === "chat.view") {
      $scope.returnPage = 'chat'
    }

    $scope.$on('vehicleCreated', function (observer, data) {
      $location.hash("top");
      $anchorScroll();

      if ($scope.ctrl.selectedCustomer._id === data.idCustomer._id) {
        generalUtils.startLoader();
        $timeout(function () {
          $scope.ctrl.btnAddVehicle = !$scope.ctrl.btnAddVehicle;
          $scope.ctrl.selectedCustomer.vehicles.push(data);
          $scope.ctrl.selectedVehicle = data;
          getVehicleImage();
          generalUtils.hideLoader();
        }, 1500);

      }
    });
  }

})();
