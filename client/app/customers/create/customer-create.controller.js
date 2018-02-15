(function () {
  'use strict';

  angular.module('app')
    .controller('CustomerCreateCtrl', ['$location', '$anchorScroll', 'environment', '$rootScope', '$scope', 'Restangular', 'States', '$state', 'generalUtils', 'Customer', '$analytics', CustomerCreateCtrl])

  function CustomerCreateCtrl($location, $anchorScroll, environment, $rootScope, $scope, Restangular, States, $state, generalUtils, Customer, $analytics) {
    amplitude.getInstance().logEvent('Entrou na página de criação de cliente');

    $scope.ctrl = {
      error: {
        fullname: false,
        companyName: false,
        phone: false,
        email: false
      },
      disableSaveButton: false,
      emailPattern: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      // CUSTOMER
      fullname: '',

      // CONFIG VIEW
      titleView: "Novo cliente",
      personTypes: [{
        person: "Pessoa Fisica",
        type: 'physical'
      }, {
        person: "Pessoa Juridica",
        type: 'legal'
      }],
      states: States,
      isEdit: false,
      vehicleImageUri: '',
      selectedVehicle: undefined,
      selectedIndex: undefined,

      // VEHICLE
      addVehicle: false,
      btnVehicle: 'Novo carro',
      brands: [],
      models: [],
      specifications: [],
      yearModel: [],
      yearFab: []
    };

    $scope.vehicleForm = {};
    $scope.customerForm = {};

    $scope.calendar = {
      dateOptions: {
        formatYear: 'yy',
        maxDate: new Date(),
        startingDay: 0
      },
      format: 'dd/MM/yyyy',
      altInputFormats: ['d!/M!/yyyy']
    };

    $scope.vehiclesList = [];
    $scope.customerForm.personType = $scope.ctrl.personTypes[0];

    $scope.saveVehicleToList = function (vehicle_form) {
      $scope.ctrl.disableSaveButton = true;
      $scope.ctrl.vehicle_form = vehicle_form;
      if (vehicle_form.$valid) {
        $scope.ctrl.btnAddVehicle = !$scope.ctrl.btnAddVehicle;

        $scope.vehicleForm.lastKmUpdate = ($scope.vehicleForm.km) ? $scope.vehicleForm.lastKmUpdate = new Date() : $scope.vehicleForm.lastKmUpdate = undefined;

        ($scope.ctrl.selectedIndex !== undefined) ? $scope.vehiclesList[$scope.ctrl.selectedIndex] = $scope.vehicleForm : $scope.vehiclesList.push(_.clone($scope.vehicleForm));

        $scope.choiseVehicle($scope.vehiclesList[$scope.vehiclesList.length - 1]);
        clearVehicleForm();
      } else {
        $scope.ctrl.disableSaveButton = false;
        return showError();
      }
      $scope.ctrl.disableSaveButton = false;
      $location.hash("top");
      $anchorScroll();
    };

    $scope.dateChanged = function () {
      if ($scope.ctrl.vehicle_form && $scope.ctrl.vehicle_form.inspection_date) {
        ($scope.vehicleForm.inspection && $scope.vehicleForm.inspection.date > moment()) ?
          $scope.ctrl.vehicle_form.inspection_date.$error.dateGraterThenToday = true :
          $scope.ctrl.vehicle_form.inspection_date.$error.dateGraterThenToday = false;
      }

      if ($scope.ctrl.vehicle_form && $scope.ctrl.vehicle_form.purchase_date) {

        ($scope.vehicleForm.purchaseDate > moment()) ?
          $scope.ctrl.vehicle_form.purchase_date.$error.dateGraterThenToday = true :
          $scope.ctrl.vehicle_form.purchase_date.$error.dateGraterThenToday = false;
      }
    }

    $scope.cancelVehicleForm = function () {
      clearVehicleForm();
      $scope.ctrl.btnAddVehicle = false;
      $scope.choiseVehicle($scope.vehiclesList[$scope.vehiclesList.length - 1]);
    };

    function getVehicleImage() {
      $scope.ctrl.vehicleImageUri = generalUtils.getVehicleImage(environment, $scope.ctrl.selectedVehicle);
    };

    $scope.choiseVehicle = function (vehicle) {

      $scope.ctrl.selectedVehicle = vehicle;
      $scope.ctrl.selectedIndex = $scope.vehiclesList.indexOf(vehicle);
      getVehicleImage();
    };

    $scope.dropVehicleFromList = function () {
      $scope.vehiclesList.splice($scope.ctrl.selectedIndex, 1);
      $scope.ctrl.selectedVehicle = $scope.vehiclesList[0];
      getVehicleImage();
      if ($scope.vehiclesList.length == 0) {
        $scope.ctrl.selectedVehicle = false;
      }
    };

    $scope.editVehicle = function () {
      requestBrandsVehicles(function () {

        $scope.ctrl.brand = _.find($scope.ctrl.brands, function (brand) {
          return $scope.ctrl.selectedVehicle.brand === brand.name;
        });

        $scope.brandChange($scope.ctrl.brand, function () {
          $scope.ctrl.model = _.find($scope.ctrl.models, function (model) {
            return $scope.ctrl.selectedVehicle.name === model.name;
          });
          $scope.modelChange($scope.ctrl.model, function () {
            generalUtils.startLoader();
            $scope.ctrl.yearFab = _.find($scope.ctrl.yearsFab, function (yearFab) {
              return $scope.ctrl.selectedVehicle.year === yearFab;
            });
            $scope.yearFabChange($scope.ctrl.yearFab, function () {
              $scope.ctrl.yearModel = _.find($scope.ctrl.yearsModel, function (yearModel) {
                return $scope.ctrl.selectedVehicle.model === yearModel;
              });
              $scope.ctrl.specification = _.find($scope.ctrl.specifications, function (specification) {
                generalUtils.hideLoader();
                return $scope.ctrl.selectedVehicle.specification === specification.name;
              });
            });
          });
        });
      });

      $scope.ctrl.btnAddVehicle = true;
      $scope.ctrl.specification = $scope.ctrl.selectedVehicle.specification;
      $scope.ctrl.yearModel = $scope.ctrl.selectedVehicle.yearModel;
      $scope.ctrl.yearFab = $scope.ctrl.selectedVehicle.yearFab;
      $scope.ctrl.specifications = $scope.ctrl.selectedVehicle.specification;
      $scope.vehicleForm = $scope.ctrl.selectedVehicle;
    };

    $scope.showVehicleForm = function () {
      $scope.ctrl.selectedVehicle = undefined;
      $scope.ctrl.selectedIndex = undefined;
      $scope.ctrl.btnAddVehicle = true;

      if ($scope.ctrl.btnAddVehicle) {
        amplitude.getInstance().logEvent('Clicou em adicionar veículo');
        $scope.ctrl.btnVehicle = 'Cancelar';
        requestBrandsVehicles(function () {

          $scope.ctrl.brand = _.find($scope.ctrl.brands, function (brand) {
            return $scope.vehicleForm.brand === brand.name;
          });
        });
      } else {
        amplitude.getInstance().logEvent('Clicou em cancelar inclusão do veículo');
        $scope.ctrl.btnVehicle = 'Novo carro';
      }
    };

    function clearVehicleForm() {
      $scope.ctrl.specification = undefined;
      $scope.ctrl.brands = undefined;
      $scope.ctrl.models = undefined;
      $scope.ctrl.yearModel = undefined;
      $scope.ctrl.yearFab = undefined;
      $scope.ctrl.specification = undefined;
      $scope.vehicleForm = {};
    };

    if (!_.isEmpty(Customer)) {
      $scope.customerForm = Customer;
      $scope.ctrl.titleView = 'Editar cliente';
      $scope.ctrl.isEdit = true;

      if (!_.isEmpty($scope.customerForm.companyName)) {
        $scope.ctrl.personId = $scope.ctrl.personTypes[1];
        $scope.personId = $scope.ctrl.personId.personId;
      } else {
        $scope.ctrl.personId = $scope.ctrl.personTypes[0];
        $scope.personId = $scope.ctrl.personId.personId;
      }

      $scope.ctrl.birthDate = $scope.calendar.birthDate ?
        moment($scope.calendar.birthDate, 'YYYY-MM-DD').format('DD/MM/YYYY') : '';


      $scope.ctrl.fullname = generalUtils.concatFullName([$scope.customerForm.name, $scope.customerForm.lastname]);

      $scope.ctrl.state = _.find($scope.ctrl.states, {
        _id: $scope.customerForm.idState
      });

      if ($scope.ctrl.state)
        requestCities($scope.ctrl.state, function () {
          $scope.ctrl.city = _.find($scope.ctrl.cities, {
            _id: $scope.customerForm.idCity
          })
        });
    }

    // Functions ADD VEHICLE
    function requestBrandsVehicles(callback) {
      $scope.ctrl.brands = [{
        name: 'Carregando',
        _id: '1'
      }];
      $scope.ctrl.brand = $scope.ctrl.brands[0];
      generalUtils.startLoader();
      Restangular.all('vehicles/brands').getList().then(function (data) {
        generalUtils.hideLoader();
        $scope.ctrl.brands = data;
        if ($scope.ctrl.brands && $scope.ctrl.brands.length < 2) {
          $scope.ctrl.brand = $scope.ctrl.brands[0];
          $scope.brandChange($scope.ctrl.brands[0]);
        }

        if (callback) callback();
      }, function (err) {
        $scope.ctrl.brands = [];
        if (callback) callback();
      });
    };

    $scope.brandChange = function (brand, callback) {
      if (!brand) return;

      $scope.ctrl.model = [{
        _id: '1',
        name: 'Carregando...'
      }];

      $scope.vehicleForm.idBrand = brand._id;
      $scope.vehicleForm.brand = brand.name;
      $scope.ctrl.specification = '';
      $scope.ctrl.yearFab = '';
      $scope.ctrl.yearModel = '';
      generalUtils.startLoader();
      Restangular.one('vehicles/name?brand=' + $scope.vehicleForm.idBrand).getList().then(function (data) {
        generalUtils.hideLoader();
        $scope.ctrl.models = [];
        $scope.ctrl.models = data;
        if (callback && typeof callback === 'function') callback();
      }, function (err) {
        $scope.ctrl.models = [];
        if (callback && typeof callback === 'function') callback();
      });
    };

    $scope.modelChange = function (model, callback) {
      if (!model) return;

      $scope.ctrl.yearModel = '';
      $scope.ctrl.yearFab = '';
      $scope.vehicleForm.idName = model._id;
      $scope.vehicleForm.name = model.name;

      generalUtils.startLoader();
      Restangular.one('vehicles/year?idVehicle=' + $scope.vehicleForm.idName).getList().then(function (data) {
        generalUtils.hideLoader();
        // $scope.ctrl.yearsFab = [];
        $scope.ctrl.yearsFab = data;
        if (callback && typeof callback === 'function') callback();
      }, function (err) {
        $scope.ctrl.yearsFab = [];
        if (callback && typeof callback === 'function') callback();
      });
      /* var yearsFab = [];
       var minimumYear = 1888;
       var maximumYear = moment().format('YYYY');
       for (var i = maximumYear; i >= minimumYear; i--) {
       yearsFab.push(parseInt(i));
       }
       $scope.ctrl.yearsFab = yearsFab;*/
    };

    $scope.yearFabChange = function (year, callback) {
      if (!year) return;

      $scope.ctrl.specifications = [{
        '_id': '1',
        'name': 'Carregando...'
      }];
      $scope.vehicleForm.year = year;
      Restangular.one('vehicles/specifications?idVehicle=' + $scope.vehicleForm.idName + '&model=' + $scope.vehicleForm.year).getList().then(function (data) {
        $scope.ctrl.specifications = data;
        if (callback && typeof callback === 'function') callback();
      }, function (err) {
        $scope.ctrl.specifications = [];
        if (callback && typeof callback === 'function') callback();
      });

      var yearModel = [];
      yearModel.push(year);
      yearModel.push((parseInt(year) + 1));
      $scope.ctrl.yearsModel = yearModel;
    };

    $scope.yearModelChange = function (year) {
      $scope.vehicleForm.model = year;
    };

    $scope.specificationChange = function (specification) {
      $scope.vehicleForm.specification = specification.name;
      $scope.vehicleForm.idSpecification = specification._id;
    };


    // Functions ADD CUSTOMER
    $scope.switchTypePerson = function (person) {
      $scope.customerForm.doc = '';
      $scope.customerForm.name = '';
      $scope.customerForm.lastname = '';
      $scope.customerForm.companyName = '';
      $scope.calendar.birthDate = '';
      $scope.ctrl.birthDate = '';
    };

    $scope.stateChange = function () {
      if (!$scope.customerForm.state) return;
      requestCities($scope.customerForm.state);
    };

    $scope.canSubmitVehicle = function () {
      return $scope.form_constraints.$valid || $scope.ctrl.addVehicle;
    };

    function requestCities(state, callback) {
      $scope.ctrl.cities = [{
        name: 'Carregando...',
        _id: ''
      }];
      $scope.customerForm.city = $scope.ctrl.cities[0];
      $scope.customerForm.idState = state._id;

      Restangular.one('states', $scope.customerForm.idState).getList('cities').then(function (data) {
        $scope.ctrl.cities = [];
        $scope.ctrl.cities = data;

        if (callback && typeof(callback) === 'function') {
          callback();
        }
      }, function (err) {
        $scope.ctrl.cities = [];
        if (callback && typeof(callback) === 'function') {
          callback();
        }
      });
    };

    $scope.cityChange = function (city) {
      if (!city) return;

      $scope.customerForm.city = city.name;
      $scope.customerForm.idCity = city._id;
    };

    $scope.cancelForm = function (e) {
      amplitude.getInstance().logEvent('Clicou em cancelar edição de funcionário');
      if (!_.isEmpty(Customer._id)) {
        $state.go('customers.view', {
          id: Customer._id
        });
      } else {
        $state.go('customers.list');
      }
    };

    $scope.validateDate = function () {
      $scope.ctrl.birthDate = $scope.calendar.birthDate ?
        moment($scope.calendar.birthDate, 'YYYY-MM-DD').format('DD/MM/YYYY') : '';

      amplitude.getInstance().logEvent('Clicou em salvar edição do funcionário');
      var message = '';
      if (!$scope.ctrl.birthDate) {
        $scope.customerForm.birthDate = '';
        return submitForm();
      }
      if (!moment($scope.ctrl.birthDate, 'DD/MM/YYYY').isValid()) {
        message = 'Data Inválida'
      } else if ($scope.ctrl.personId.personId === 1 && !generalUtils.dateIsValid($scope.ctrl.birthDate, 'birthdate')) {
        message = 'Cliente deve ter mais de 18 anos.'
      } else if ($scope.ctrl.personId.personId === 2 && !generalUtils.dateIsValid($scope.ctrl.birthDate, 'foundation')) {
        message = 'Empresa não pode ter data de criação no futuro.'
      } else {
        $scope.customerForm.birthDate = moment($scope.ctrl.birthDate, 'DD/MM/YYYY').toISOString();
        return submitForm();
      }

      generalUtils.onError(
        'Ops!',
        message,
        'Confirmar',
        function (isConfirm) {
        });
    };

    function formValidate() {
      var isValid = true;
      if (!$scope.customerForm.fullname && !$scope.customerForm.companyName) {
        switch ($scope.customerForm.personType.type) {
          case 'physical':
            $scope.ctrl.error.fullname = true;
            break;
          case 'legal':
            $scope.ctrl.error.companyName = true;
            break;
        }
        isValid = false;
      }
      if (!$scope.customerForm.phone) {
        $scope.ctrl.error.phone = true;
        isValid = false;
      }
      if ($scope.customerForm.email) {
        isValid = $scope.ctrl.emailPattern.test($scope.customerForm.email);
        if (!isValid) $scope.ctrl.error.email = true;
      }
      return isValid;
    };

    $scope.checkError = function (property) {
      if (!property) return;
      switch (property) {
        case 'fullname':
          if (property !== '') $scope.ctrl.error.fullname = false;
          break;
        case 'companyName':
          if (property !== '') $scope.ctrl.error.companyName = false;
          break;
        case 'phone':
          if (property !== '') $scope.ctrl.error.phone = false;
          break;
        case 'email':
          if ($scope.ctrl.emailPattern.test($scope.customerForm.email))
            $scope.ctrl.error.email = false;
          break;
      }
      ;
    };

    function showError() {
      generalUtils.onError(
        'Ops!',
        'Preencha os campos obrigatórios',
        'Confirmar',
        function (isConfirm) {
        });
    };

    $scope.submitForm = function () {
      $scope.ctrl.disableSaveButton = true;
      if (!formValidate()) {
        $scope.ctrl.disableSaveButton = false;
        return showError();
      }
      ;
      $scope.ctrl.disableSaveButton = true;
      generalUtils.startLoader();
      generalUtils.splitFullName($scope.customerForm.fullname, function (splitName) {
        $scope.customerForm.name = splitName[0];
        $scope.customerForm.lastname = splitName[1];
      });

      if ($scope.customerForm.personType.type === 'physical')
        $scope.customerForm.doc = generalUtils.formatCPF($scope.customerForm.doc);
      else
        $scope.customerForm.doc = generalUtils.formatCNPJ($scope.customerForm.doc);

      var customer = angular.copy($scope.customerForm);

      ($scope.customerForm.state && $scope.customerForm.state.name) ? customer.state = $scope.customerForm.state.name : customer.state = undefined;
      ($scope.customerForm.city && $scope.customerForm.city.name) ? customer.city = $scope.customerForm.city.name : customer.city = undefined;

      customer.type = $scope.customerForm.personType.type;
      delete customer.personType;

      if ($scope.ctrl.isEdit) {
        customer.save().then(function (data) {
          $scope.ctrl.disableSaveButton = false;
          generalUtils.onSuccess('Sucesso!', 'Cliente atualizado com sucesso!', 'Confirmar', '', function (isConfirm) {
            amplitude.getInstance().logEvent('Cliente atualizado');
            $state.go('customers.view', {
              id: data._id
            });
          });
        }, function (err) {
          if (err) return generalUtils.onError('Ops!', err.data.message, 'Confirmar', function (isConfirm) {
            $scope.ctrl.disableSaveButton = false;
            generalUtils.hideLoader();
          });
        });
      } else {
        customer.vehicles = _.map($scope.vehiclesList, function (vehicle) {
          vehicle.plate = generalUtils.validatePlate(vehicle.plate);
          vehicle.year = generalUtils.validateYear(vehicle.year);
          vehicle.model = generalUtils.validateYear(vehicle.model);
          vehicle.km = generalUtils.validateKilometer(vehicle.km);
          return vehicle;
        });

        Restangular.all('customers').post(customer).then(
          function (data) {
            amplitude.getInstance().logEvent('Cadastrou cliente sem carro');
            $analytics.eventTrack('ClienteCadastrado');
            generalUtils.hideLoader();

            generalUtils.onSuccess(
              'Sucesso!',
              'Cliente cadastrado na plataforma!',
              $rootScope.previousState.name === "schedulecreate" ? 'Voltar para o agendamento' : 'Voltar para tela principal',
              '',
              function (isConfirm) {
                if (isConfirm) {
                  if ($rootScope.previousState.name === "schedulecreate") return $state.go('schedulecreate', {
                    scheduleCtrl: $state.params.scheduleCtrl,
                    scheduleCalendar: $state.params.scheduleCalendar,
                    customerCreated: data._id
                  });
                  $scope.ctrl.disableSaveButton = false;
                  $state.go('customers.list');
                }
              });
          },
          function (err) {
            generalUtils.hideLoader();
            var codeErr = err.data.message.code;
            var message = 'Erro ao salvar o usuário, tente novamente  ';

            if (err.data.message.code)
              switch (codeErr) {
                case 11000:
                  message = 'Este cpf já existe no banco, confira se você já possui cadastro ou tente novamente';
                  break;
                case 460:
                  message = 'Data de nascimento inválida';
                  break;
              }
            else
              switch (err.data.vehicle.message.code) {
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
            $scope.ctrl.disableSaveButton = false;
          });
      }
    };

  };

})();
