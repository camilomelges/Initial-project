(function() {
  'use strict';

  angular.module('app')
    .controller('CustomerViewAndEditCtrl', ['$scope', 'Restangular', 'Customer', '$state', '$stateParams', 'generalUtils',
      'environment', 'permissions', 'anchorSmoothScroll', '$timeout', CustomerViewAndEditCtrl])

  function CustomerViewAndEditCtrl($scope, Restangular, Customer, $state, $stateParams, generalUtils,
                                   environment, permissions, anchorSmoothScroll, $timeout) {

    if (!$stateParams.id) return $state.go('customers.list');

    amplitude.getInstance().logEvent('Entrou na página de visualização de cliente customers/view/:id');

    $scope.permissions = permissions;

    function generateCustomerAddressString(customer) {
      var addressString = '';
      if (!customer) return addressString;

      if (customer.address) addressString += customer.address;
      if (customer.city && customer.address) addressString += ' , ' + customer.city;
      if (customer.city && !customer.address) addressString += customer.city;
      if (customer.state) addressString += ' , ' + customer.state;

      return addressString;
    };

    function mapCustomerInfoList(customer) {
      if (!customer) return [];

      return _.filter([
        {type: 'phone', value: generalUtils.formatPhone(customer.phone)},
        {type: 'email', value: customer.email},
        {type: 'doc', value: generalUtils.formatCPF(customer.doc)},
        {type: 'address', value: generateCustomerAddressString(customer)},
        {type: 'birthDate', value: (customer.birthDate) ? moment(customer.birthDate).format('DD/MM/YYYY') : ''},
      ], function (info) {
        return (info.value !== undefined && info.value !== '');
      })
    };

    $scope.applyCss = function (info) {
      switch (info.type) {
        case 'phone':
          return 'fa fa-phone';
        case 'email':
          return 'fa fa-envelope-o';
        case 'doc':
          return 'fa fa-id-card-o font-13';
        case 'address':
          return 'fa fa-map-marker m-r-5';
        case 'birthDate':
          return 'fa fa-gift';
      }
    };

    $scope.ctrl = {
      selectedCustomer: angular.copy(Customer),
      selectedVehicle: angular.copy(Customer.vehicle),
      vehicleImageUri: '',
      isEditingCustomer: false,
      isEditingVehicle: false,
      isCreatingVehicle: false,
      customerInfoList: mapCustomerInfoList(Customer),
      addVehicle: false,
      btnVehicle: 'Add veículo',
      hasPlusClass: true,
      brands: [],
      models: [],
      specifications: [],
      yearModel: [],
      yearFab: [],
      disableEditButton: false,
      disableScheduleButton: false,
      disableNewVehicle: false
    };

    if ($scope.ctrl.selectedCustomer) {
      _.extend($scope.ctrl.customer, {
        typePerson: generalUtils.typePerson($scope.ctrl.selectedCustomer) ?
          generalUtils.typePerson(Customer.doc) :
          "Não há registro",
        typeDoc: ($scope.ctrl.selectedCustomer.doc) ?
          generalUtils.typeDoc($scope.ctrl.selectedCustomer.doc) :
          "Não há registro",
        birthDate: ($scope.ctrl.selectedCustomer.birthDate) ?
          moment($scope.ctrl.selectedCustomer.birthDate).format('DD/MM/YYYY') : ''
      })
    }

    $scope.schedule = function(idCustomer){
      $scope.ctrl.disableScheduleButton = true;
      amplitude.getInstance().logEvent('Clicou em agendar, Customer/view');
      $state.go('schedulecreate', idCustomer);
    };

    function getVehicleImage() {
      $scope.ctrl.vehicleImageUri = generalUtils.getVehicleImage(environment, $scope.ctrl.selectedVehicle);
    };

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
      getVehicleImage();
    };

    $scope.choiseVehicle = function (vehicle) {
      if ($scope.ctrl.vehicleMarkedToSchedule) return;
      $scope.ctrl.selectedVehicle = vehicle;
      $scope.ctrl.vehicleMarkedToSchedule = false;
      getVehicleImage();
    };

    $scope.editVehicle = function () {
      amplitude.getInstance().logEvent('Clicou em editar veículo');
      $scope.ctrl.isEditingVehicle = true;
      $scope.ctrl.isEditingVehicle == true ? $scope.ctrl.disableEditButton = false
      : $scope.ctrl.disableEditButton = true;
    };

    $scope.createVehicle = function (idCustomer) {
      amplitude.getInstance().logEvent('Clicou em criar veículo');
      $state.go('customers.view', idCustomer)
      $scope.ctrl.isCreatingVehicle = true;
      $scope.ctrl.isCreatingVehicle == true ? $scope.ctrl.disableNewVehicle = true
      : $scope.ctrl.disableNewVehicle = false;
    }

    if ($scope.ctrl.selectedCustomer) $scope.toggleVehicle();

    $scope.editCustomer = function (e) {
      amplitude.getInstance().logEvent('Clicou em editar cliente');
      $scope.ctrl.isEditingCustomer = true;
      ($scope.ctrl.isEditingCustomer === true) ? $scope.ctrl.disableEditButton = false : $scope.ctrl.disableEditButton = true;
    };

    $scope.$on('vehicleUpdated', function (observer, data) {
      if ($scope.ctrl.selectedCustomer._id === data.idCustomer) {
        generalUtils.startLoader();
        $timeout(function () {
          var vehicle = _.find($scope.ctrl.selectedCustomer.vehicles, function(vehicle) {
            return vehicle._id === data._id;
          });
          $scope.ctrl.selectedCustomer.vehicles[$scope.ctrl.selectedCustomer.vehicles.indexOf(vehicle)] = data;
          $scope.ctrl.isEditingVehicle = false;
          $scope.choiseVehicle(data);
          generalUtils.hideLoader();
          anchorSmoothScroll.scrollTo('customer_info_row', 150);
        }, 1500);

      }
    });

    $scope.$on('customerUpdated', function (observer, data) {
      if ($scope.ctrl.selectedCustomer._id === data._id) {
        generalUtils.startLoader();
        $timeout(function () {
          $scope.ctrl.isEditingCustomer = false;
          data.vehicles = $scope.ctrl.selectedCustomer.vehicles;
          $scope.ctrl.selectedCustomer = data;
          $scope.ctrl.customerInfoList = mapCustomerInfoList(data);
          generalUtils.hideLoader();
          anchorSmoothScroll.scrollTo('customer_info_row', 150);
        }, 1500);
      }
    });
  }
})();

