(function () {
  'use strict';

  angular.module('app')
    .directive('customerEdit', function () {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          'customer': '=customer',
          'toggle': '=toggle',
        },
        templateUrl: 'app/customers/edit/directive/customer-edit-directive.html',
        controller: ['$scope', '$rootScope', 'Restangular', 'generalUtils', '$state', EditCustomerDirectiveCtrl]
      }
    });

  function EditCustomerDirectiveCtrl($scope, $rootScope, Restangular, generalUtils, $state) {

    if (!$scope.customer && !$scope.toggle) return;

    function getStates() {
      Restangular.all('states').getList().then(function (states) {
        $scope.ctrl.states = states;

        if ($scope.ctrl.customer && $scope.ctrl.customer.idState) {
          $scope.ctrl.customer.state = _.find(states, function (state) {
            return state._id === $scope.ctrl.customer.idState
          });
          getCities();
        }

      }, function (err) {
        console.log('Error to get states', err);
      });
    };

    function getCities() {
      Restangular.one('states', $scope.ctrl.customer.idState).getList('cities').then(function (cities) {
        $scope.ctrl.cities = cities;

        if ($scope.ctrl.customer && $scope.ctrl.customer.city) {
          $scope.ctrl.customer.city = _.find(cities, function (city) {
            return city.name === $scope.ctrl.customer.city
          });
        }

      }, function (err) {
        $scope.ctrl.cities = [];
        console.log('error to get cities', err);
      });
    };

    $scope.ctrl = {
      customer: angular.copy($scope.customer),
      personTypes: [{
        person: "Pessoa Fisica",
        type: 'physical'
      }, {
        person: "Pessoa Juridica",
        type: 'legal'
      }],
      states: getStates(),
      isWaiting: false
    };

    $scope.stateChange = function () {
      if (!$scope.ctrl.customer.state) return;
      $scope.ctrl.customer.idState = $scope.ctrl.customer.state._id;
      getCities();
    };

    if ($scope.ctrl.customer && $scope.ctrl.customer.birthDate)
      $scope.ctrl.customer.birthDate = new Date($scope.ctrl.customer.birthDate);

    $scope.calendar = {
      dateOptions: {
        formatYear: 'yy',
        maxDate: new Date(),
        startingDay: 0
      },
      format: 'dd/MM/yyyy',
      altInputFormats: ['d!/M!/yyyy']
    };

    var docType = generalUtils.checkIfIsCpfOrCnpj($scope.customer.doc);

    switch (docType) {
      case 'cpf':
        $scope.ctrl.customer.personType = $scope.ctrl.personTypes[0];
        break;
      case 'cnpj':
        $scope.ctrl.customer.personType = $scope.ctrl.personTypes[1];
        break;
    }
    $scope.ctrl.customer.personType = ($scope.ctrl.customer.type === 'physical' ||
      (!$scope.ctrl.customer.type && !docType)) ?
      $scope.ctrl.personTypes[0] : $scope.ctrl.personTypes[1];

    $scope.switchTypePerson = function(person) {
      $scope.ctrl.customer.doc = '';
      $scope.ctrl.customer.name = '';
      $scope.ctrl.customer.lastname = '';
      $scope.ctrl.customer.companyName = '';
      $scope.ctrl.customer.fullname = '';
      $scope.ctrl.customer.birthDate = '';
    };

    $scope.cancel = function () {
      $scope.ctrl.isWaiting = true;
      $scope.toggle = !$scope.toggle;
      $scope.ctrl.customer = angular.copy($scope.customer);

      var docType = generalUtils.checkIfIsCpfOrCnpj($scope.customer.doc);

      switch (docType) {
        case 'cpf':
          $scope.ctrl.customer.personType = $scope.ctrl.personTypes[0];
          break;
        case 'cnpj':
          $scope.ctrl.customer.personType = $scope.ctrl.personTypes[1];
          break;
      }
      $scope.ctrl.customer.personType = ($scope.ctrl.customer.type === 'physical' ||
        (!$scope.ctrl.customer.type && !docType)) ?
        $scope.ctrl.personTypes[0] : $scope.ctrl.personTypes[1];
    };

    $scope.save = function (edit_customer_form) {
      if (!edit_customer_form.$valid) return generalUtils.onError(
        'Ops!',
        'Preencha todos os campos obrigatórios',
        'Confirmar', function (isConfirm) {

      });
      $scope.ctrl.isWaiting = true;
      generalUtils.startLoader();
      generalUtils.splitFullName($scope.ctrl.customer.fullname, function(splitName) {
        $scope.ctrl.customer.name = splitName[0];
        $scope.ctrl.customer.lastname = splitName[1];
      });

      var customerPayload = angular.copy($scope.ctrl.customer);

      customerPayload.type = $scope.ctrl.customer.personType.type;
      if (customerPayload.state && customerPayload.city) {
        customerPayload.state = $scope.ctrl.customer.state.name;
        customerPayload.city = $scope.ctrl.customer.city.name;
      }

      Restangular.all("/customers/" + customerPayload._id).customPUT(customerPayload)
        .then(function (customer) {
          generalUtils.hideLoader();
          $scope.ctrl.isWaiting = false;

          generalUtils.onSuccess('Sucesso!', 'Informações alteradas com sucesso', 'Confirmar', '', function (isConfirm) {
            $rootScope.$broadcast('customerUpdated', customer.plain());
          });

      }, function (error) {
          generalUtils.hideLoader();
          $scope.ctrl.isWaiting = false;
          generalUtils.onError('Ops!', 'Erro ao salvar alterações, tente novamente', 'Confirmar', function (isConfirm) {

          });
      });
    }

  }
})();
