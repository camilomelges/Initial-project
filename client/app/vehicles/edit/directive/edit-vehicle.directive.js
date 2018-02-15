(function () {
  'use strict';

  angular.module('app')
    .directive('editVehicle', function () {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          vehicle: '=vehicle',
          show: '=show'
        },
        templateUrl: 'app/vehicles/edit/directive/edit-vehicle.directive.html',
        controller: ['$rootScope', '$scope', 'Restangular', 'generalUtils', '$state', editVehicle]
      }
    });

  function editVehicle($rootScope, $scope, Restangular, generalUtils, $state) {

    if (!$scope.vehicle && !$scope.show) return;

    $scope.ctrl = {
      vehicle: angular.copy($scope.vehicle),
      isWaiting: false
    };

    $scope.calendar = {
      dateOptions: {
        formatYear: 'yy',
        maxDate: new Date(),
        startingDay: 0
      },
      format: 'dd/MM/yyyy',
      altInputFormats: ['d!/M!/yyyy']
    };

    if ($scope.ctrl.vehicle.plate)
      $scope.ctrl.vehicle.plate = $scope.ctrl.vehicle.plate.replace('-','');

    if ($scope.ctrl.vehicle.purchaseDate)
      $scope.ctrl.vehicle.purchaseDate = new Date($scope.ctrl.vehicle.purchaseDate);

    if ($scope.ctrl.vehicle.inspection && $scope.ctrl.vehicle.inspection.date)
      $scope.ctrl.vehicle.inspection.date = new Date($scope.ctrl.vehicle.inspection.date);

    function requestBrandsVehicles(callback) {
      generalUtils.startLoader();
      $scope.ctrl.brands = [{
        name: 'Carregando',
        _id: '1'
      }];

      Restangular.all('vehicles/brands').getList().then(function (brands) {
        generalUtils.hideLoader();
        $scope.ctrl.brands = brands;

        if ($scope.ctrl.vehicle.idBrand) {
          $scope.ctrl.vehicle.brand = _.find($scope.ctrl.brands, function (brand) {
            return $scope.ctrl.vehicle.brand === brand.name;
          });
          $scope.brandChange($scope.ctrl.vehicle.brand, true);
        }

        if (callback && typeof callback === 'function') callback();
      }, function (err) {
        $scope.ctrl.brands = [];
        if (callback && typeof callback === 'function') callback();
      });
    }

    requestBrandsVehicles();

    $scope.brandChange = function (brand, firstLoad) {
      if (!brand) return;

      $scope.ctrl.model = [{
        _id: '1',
        name: 'Carregando...'
      }];

      generalUtils.startLoader();
      Restangular.one('vehicles/name?brand=' + brand._id).getList().then(function (models) {
        generalUtils.hideLoader();
        $scope.ctrl.models = models;

        if ($scope.ctrl.vehicle.idName && firstLoad) {
          $scope.ctrl.vehicle.name = _.find($scope.ctrl.models, function (model) {
            return $scope.ctrl.vehicle.name === model.name;
          });

          $scope.modelChange($scope.ctrl.vehicle.name, true);
        } else {
          $scope.ctrl.vehicle.model = '';
          $scope.ctrl.vehicle.year = '';
          $scope.ctrl.vehicle.specification = '';
          $scope.ctrl.vehicle.name = '';
        }

      }, function (err) {
        $scope.ctrl.models = [];
      });
    };

    $scope.modelChange = function (model, firstLoad) {
      if (!model) return;
      generalUtils.startLoader();

      Restangular.one('vehicles/year?idVehicle=' + model._id).getList().then(function (yearsFab) {
        generalUtils.hideLoader();
        $scope.ctrl.yearsFab = yearsFab;

        if ($scope.ctrl.vehicle.model && firstLoad) {
          $scope.ctrl.vehicle.year = _.find($scope.ctrl.yearsFab, function (year) {
            return $scope.ctrl.vehicle.year === year;
          });
          $scope.yearFabChange($scope.ctrl.vehicle.year, true);
        }
        else {
          $scope.ctrl.vehicle.year = '';
          $scope.ctrl.vehicle.model = '';
          $scope.ctrl.vehicle.specification = '';
        }
      }, function (err) {
        $scope.ctrl.yearsFab = [];
      });
    };

    $scope.yearFabChange = function (year, firstLoad) {
      if (!year) return;

      $scope.ctrl.specifications = [{
        '_id': '1',
        'name': 'Carregando...'
      }];
      Restangular.one('vehicles/specifications?idVehicle=' + $scope.ctrl.vehicle.name._id + '&model=' + year).getList().then(function (specifications) {
        $scope.ctrl.specifications = specifications;

        if ($scope.ctrl.vehicle.idSpecification && firstLoad) {
          $scope.ctrl.vehicle.specification = _.find($scope.ctrl.specifications, function (specification) {
            return $scope.ctrl.vehicle.idSpecification === specification._id;
          });
        }
      }, function (err) {
        $scope.ctrl.specifications = [];
      });

      var yearModel = [];
      yearModel.push(year);
      yearModel.push((parseInt(year) + 1));
      $scope.ctrl.yearsModel = yearModel;

      if ($scope.ctrl.vehicle.model) {
        $scope.ctrl.vehicle.model = _.find($scope.ctrl.yearsModel, function (year) {
          return $scope.ctrl.vehicle.model === year;
        });
      }
    };

    $scope.cancel = function () {
      $scope.show = false;
    };

    $scope.save = function (vehicle_form) {
      $scope.ctrl.vehicle_form = vehicle_form;
      if (vehicle_form.$valid) {
        $scope.ctrl.vehicle.lastKmUpdate = ($scope.ctrl.vehicle.km)
          ? $scope.ctrl.vehicle.lastKmUpdate = new Date() : $scope.ctrl.vehicle.lastKmUpdate = undefined;

        updateVehicle(function (err, data) {
          if (err) return console.log(err);
        });

      } else {
        return showError();
      }
    };

    function updateVehicle(callback) {
      amplitude.getInstance().logEvent('Clicou em salvar veículo na edição');
      var vehiclePayload = angular.copy($scope.ctrl.vehicle);
      vehiclePayload.idBrand = vehiclePayload.brand._id;
      vehiclePayload.brand = vehiclePayload.brand.name;
      vehiclePayload.idName = vehiclePayload.name._id;
      vehiclePayload.name = vehiclePayload.name.name;
      vehiclePayload.idSpecification = vehiclePayload.specification._id;
      vehiclePayload.specification = vehiclePayload.specification.name;
      vehiclePayload.year = generalUtils.validateYear(vehiclePayload.year);
      vehiclePayload.model = generalUtils.validateYear(vehiclePayload.model);
      vehiclePayload.km = generalUtils.validateKilometer(vehiclePayload.km);
      $scope.ctrl.isWaiting = true;


      Restangular.all("/vehicles/" + vehiclePayload._id).customPUT(vehiclePayload)
        .then(function (vehicle) {
          $scope.ctrl.isWaiting = false;
          generalUtils.onSuccess('Sucesso!', 'Informações alteradas com sucesso', 'Confirmar', '', function (isConfirm) {

            $rootScope.$broadcast('vehicleUpdated', vehicle.plain());
          });

        }, function (err) {
          $scope.ctrl.isWaiting = false;
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
