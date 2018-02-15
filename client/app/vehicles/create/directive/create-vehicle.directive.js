(function () {
  'use strict';

  angular.module('app')
    .directive('createVehicle', function () {
      return {
        restrict: 'E',
        replace: true,
        scope: true,
        bindToController: {
          'customerId': '=customerId',
          'reload': '=reload',
          'showCancelButton': '=showCancelButton',
          'show': '=show'
        },
        controllerAs: 'dv',
        templateUrl: 'app/vehicles/create/directive/create-vehicle-directive.html',
        controller: ['$rootScope', '$scope', 'Restangular', 'generalUtils', '$state', createVehicle]
      }
    });

  function createVehicle($rootScope, $scope, Restangular, generalUtils, $state) {
    if ($scope.dv.showCancelButton) $scope.showCancelButton = $scope.dv.showCancelButton;

    $scope.ctrl = {
      brands: [],
      models: [],
      specifications: [],
      disableSaveButton: false
    };
    $scope.vehicleForm = {};
    $scope.calendar = {
      dateOptions: {
        formatYear: 'yy',
        maxDate: new Date(),
        startingDay: 0
      },
      format: 'dd/MM/yyyy',
      altInputFormats: ['d!/M!/yyyy']
    };


    $scope.cancel = function () {
      $scope.dv.show = false;
    };

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

        if (callback && typeof callback === 'function') callback();
      }, function (err) {
        $scope.ctrl.brands = [];
        if (callback && typeof callback === 'function') callback();
      });
    }

    requestBrandsVehicles();

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
      $scope.ctrl.model = '';
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

    $scope.saveVehicle = function (vehicle_form) {
      $scope.ctrl.disableSaveButton = true;
      $scope.ctrl.vehicle_form = vehicle_form;
      if (vehicle_form.$valid) {
        $scope.ctrl.btnAddVehicle = !$scope.ctrl.btnAddVehicle;
        $scope.vehicleForm.lastKmUpdate = ($scope.vehicleForm.km) ? $scope.vehicleForm.lastKmUpdate = new Date() : $scope.vehicleForm.lastKmUpdate = undefined;

        saveVehicle($scope.dv.customerId, function (err, data) {
          if (err) {
            $scope.ctrl.disableSaveButton = false;
            return console.log(err);
          }


          if ($scope.dv.reload) {
            $scope.ctrl.disableSaveButton = false;
            $state.reload();
          }

          $rootScope.$broadcast('vehicleCreated', data.plain());
        });

      } else {
        $scope.ctrl.disableSaveButton = false;
        return showError();
      }
    };

    function saveVehicle(idCustomer, callback) {
      $scope.ctrl.disableSaveButton = true;
      amplitude.getInstance().logEvent('Clicou em salvar veículo');
      $scope.vehicleForm.idCustomer = idCustomer;
      $scope.vehicleForm.plate = generalUtils.validatePlate($scope.vehicleForm.plate);
      $scope.vehicleForm.year = generalUtils.validateYear($scope.vehicleForm.year);
      $scope.vehicleForm.model = generalUtils.validateYear($scope.vehicleForm.model);
      $scope.vehicleForm.km = generalUtils.validateKilometer($scope.vehicleForm.km);


      Restangular.all('vehicles').post($scope.vehicleForm).then(function (data) {
        generalUtils.hideLoader();
        generalUtils.onSuccess(
          'Sucesso!',
          'Veículo cadastrado na plataforma!',
          'Confirmar',
          '',
          function (isConfirm) {
            callback(null, data);
          });
        $scope.ctrl.disableSaveButton = false;
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
            $scope.ctrl.disableSaveButton = false;
            callback(err);
          });
      });
    }

    function showError() {
      generalUtils.onError(
        'Ops!',
        'Preencha os campos obrigatórios',
        'Confirmar',
        function (isConfirm) {
        });
    }
  }
})();
