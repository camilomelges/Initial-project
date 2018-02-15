(function () {
  'use strict';

  angular.module('app')
    .controller('VehicleListCtrl', ['$state', '$scope', '$rootScope', '$filter', 'Restangular', 'Vehicles',
      '$uibModal', 'generalUtils', 'permissions', 'docValidator', VehicleListCtrl])

  function VehicleListCtrl($state, $scope, $rootScope, $filter, Restangular, Vehicles,
                           $uibModal, generalUtils, permissions, docValidator) {
    amplitude.getInstance().logEvent('Entrou na página listagem de veículos')
    $scope.permissions = permissions;
    $scope.ctrl = {
      soughtString: '',
      vehicleList: Vehicles.docs || [],
      totalItems: Vehicles.total,
      limit: Vehicles.limit,
      currentPage: 1,
      searchReturnedEmpty: '',
      disableScheduleButton: false,
      disableViewVehicle: false,
      orderByVehicle: true,
      orderByPlate: true,
      orderBySpecification: true,
      orderByYear: true,
      orderByModel: true
    };

    function populateListWithPreviousParams() {
      if (
        $rootScope.previousState.name === 'customers.view'
        && $rootScope.previousParams.arrayOfSearch
        && $rootScope.previousParams.arrayOfSearch.list.length > 0
        && $rootScope.previousParams.arrayOfSearch.type === 'vehicle'
      ) {
        $scope.ctrl.vehicleList = $rootScope.previousParams.arrayOfSearch.list;
        $scope.ctrl.totalItems = $rootScope.previousParams.arrayOfSearch.list.length;
      }
    };

    populateListWithPreviousParams();

    $rootScope.$on('searchVehicle', function (event, data) {
      if (_.isEmpty(data.docs)) $scope.ctrl.searchReturnedEmpty = true;
      $scope.ctrl.soughtString = data.search;
      $scope.ctrl.vehicleList = data.docs;
      $scope.ctrl.totalItems = data.total;
      $scope.ctrl.limit = data.limit;
    });

    $scope.customerView = function (customerId, vehicleId) {
      $scope.ctrl.disableViewVehicle = true;
      amplitude.getInstance().logEvent('Clicou em visualizar veículo, Vehicles/list');
      $state.go('customers.view', {
        id: customerId,
        arrayOfSearch: {list: $scope.ctrl.vehicleList, type: 'vehicle'},
        soughtString: $scope.ctrl.soughtString,
        vehicleId: vehicleId
      })
    };

    $scope.schedule = function (customerId, vehicleId) {
      $scope.ctrl.disableScheduleButton = true;
      amplitude.getInstance().logEvent('Clicou em agendar, Vehicles/list');
      $state.go('schedulecreate', {
        id: customerId,
        vehicleId: vehicleId
      });
    };

    $scope.customerFind = function () {
      amplitude.getInstance().logEvent('Clicou em buscar cliente, Vehicles/list');
      var validateSearch = docValidator.validate($scope.ctrl.searchCustomer);

      if (!validateSearch.valid)
        return generalUtils.onError('Ops', 'Verifique se o CNPJ ou CPF está correto e tente novamente!', 'Confirmar', function (isConfirm) {
          amplitude.getInstance().logEvent('Clicou em confirmar erro ao buscar cliente');
        });

      var data = validateSearch.type !== 'name' ? generalUtils.formatCPForCNPJ($scope.ctrl.searchCustomer) : $scope.ctrl.searchCustomer;
      var queryString = validateSearch.type === 'cpf' || validateSearch.type === 'cnpj' ? 'doc' : 'name';

      Restangular.one('customers?type=' + queryString + '&value=' + data).get().then(function (data) {


        $scope.ctrl.vehicleList = data[0].vehicles;
        prepareListVehicles();

      }, function (err) {
        $scope.ctrl.vehicleList = [];
      });

    };

    function getVehicles() {
      var orderBy = $scope.ctrl.orderBy || 'name';
      var orderType = $scope.ctrl.orderType || 'asc';
      Restangular.one('vehicles?page=' + $scope.ctrl.currentPage + '&orderBy=' + orderBy + '&orderType=' + orderType).get().then(function (data) {
        $scope.ctrl.vehicleList = data.docs;
        $scope.ctrl.totalItems = data.total;
        $scope.ctrl.limit = data.limit;
      }, function (err) {
        $scope.ctrl.vehicleList = [];
      });
    }

    $scope.orderByVehicle = function () {
      $scope.ctrl.orderByVehicle = !$scope.ctrl.orderByVehicle;
      if ($scope.ctrl.orderByVehicle) {
        $scope.ctrl.orderBy = 'name';
        $scope.ctrl.orderType = 'asc';
        getVehicles();
      }
      if (!$scope.ctrl.orderByVehicle) {
        $scope.ctrl.orderBy = 'name';
        $scope.ctrl.orderType = 'desc';
        getVehicles();
      }
      $scope.ctrl.orderByPlate = true;
    };

    $scope.orderByPlate = function () {
      $scope.ctrl.orderByPlate = !$scope.ctrl.orderByPlate;
      if ($scope.ctrl.orderByPlate) {
        $scope.ctrl.orderBy = 'plate';
        $scope.ctrl.orderType = 'asc';
        getVehicles();
      }
      if (!$scope.ctrl.orderByPlate) {
        $scope.ctrl.orderBy = 'plate';
        $scope.ctrl.orderType = 'desc';
        getVehicles();
      }
      $scope.ctrl.orderByVehicle = true;
    };

    $scope.orderBySpecification = function () {
      $scope.ctrl.orderBySpecification = !$scope.ctrl.orderBySpecification;
      if ($scope.ctrl.orderBySpecification) {
        $scope.ctrl.orderBy = 'specification';
        $scope.ctrl.orderType = 'asc';
        getVehicles();
      }
      if (!$scope.ctrl.orderBySpecification) {
        $scope.ctrl.orderBy = 'specification';
        $scope.ctrl.orderType = 'desc';
        getVehicles();
      }
      $scope.ctrl.orderByVehicle = true;
    };

    $scope.orderByYear = function () {
      $scope.ctrl.orderByYear = !$scope.ctrl.orderByYear;
      if ($scope.ctrl.orderByYear) {
        $scope.ctrl.orderBy = 'year';
        $scope.ctrl.orderType = 'asc';
        getVehicles();
      }
      if (!$scope.ctrl.orderByYear) {
        $scope.ctrl.orderBy = 'year';
        $scope.ctrl.orderType = 'desc';
        getVehicles();
      }
      $scope.ctrl.orderByVehicle = true;
    };

    $scope.orderByModel = function () {
      $scope.ctrl.orderByModel = !$scope.ctrl.orderByModel;
      if ($scope.ctrl.orderByModel) {
        $scope.ctrl.orderBy = 'model';
        $scope.ctrl.orderType = 'asc';
        getVehicles();
      }
      if (!$scope.ctrl.orderByModel) {
        $scope.ctrl.orderBy = 'model';
        $scope.ctrl.orderType = 'desc';
        getVehicles();
      }
      $scope.ctrl.orderByVehicle = true;
    };

    $scope.paginate = function () {
      getVehicles();
    };
  }
})();
