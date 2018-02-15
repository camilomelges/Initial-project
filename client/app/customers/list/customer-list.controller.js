(function() {
  'use strict';

  angular.module('app')
    .controller('CustomerListCtrl', ['$scope', '$rootScope', 'Restangular', 'Customers',
      'generalUtils', '$state', 'permissions', 'docValidator', CustomerListCtrl])

  function CustomerListCtrl($scope, $rootScope, Restangular, Customers,
                            generalUtils, $state, permissions, docValidator) {
    amplitude.getInstance().logEvent('Entrou na página lista de clientes customers/list');
    $scope.ctrl = {
      soughtString: '',
      customerList: Customers.docs,
      totalItems: Customers.total,
      limit: Customers.limit,
      currentPage: 1,
      searchReturnedEmpty: false,
      disableCreateSchedule: false,
      disableCreateCustomer: false,
      disableViewCustomer: false,
      orderByName: true,
      orderByDoc: true,
      orderByTel: true,
      orderByEmail: true
    };

    function populateListWithPreviousParams() {
      if(
        $rootScope.previousState.name === 'customers.view'
        && $rootScope.previousParams.arrayOfSearch
        && $rootScope.previousParams.arrayOfSearch.list.length > 0
        && $rootScope.previousParams.arrayOfSearch.type === 'customer'
      ) {
        $scope.ctrl.customerList = $rootScope.previousParams.arrayOfSearch.list;
        $scope.ctrl.totalItems = $rootScope.previousParams.arrayOfSearch.list.length;
      }
    };

    populateListWithPreviousParams();

    $scope.schedule = function(customerId) {
      $scope.ctrl.disableCreateSchedule = true;
      amplitude.getInstance().logEvent('Clicou em agendar cliente');
      $state.go('schedulecreate', customerId);
    };

    $scope.newCustomer = function() {
      $scope.ctrl.disableCreateCustomer = true;
      amplitude.getInstance().logEvent('Clicou em novo cliente, Customer/list');
      $state.go('customers.create');
    };

    $scope.viewCustomer = function(idCustomer){
      $scope.ctrl.disableViewCustomer = true;
      amplitude.getInstance().logEvent('Clicou em ver cliente, Customer/list');
      $state.go('customers.view', {id: idCustomer.id,
       arrayOfSearch: {list: $scope.ctrl.customerList, type: 'customer'},
       soughtString: $scope.ctrl.soughtString
     });
    };

    $scope.permissions = permissions;

    prepareListUser();

    $rootScope.$on('searchCustomer', function (event, data) {
      if (_.isEmpty(data.docs)) {
        $scope.ctrl.searchReturnedEmpty = true;
      }
      $scope.ctrl.soughtString = data.search;
      $scope.ctrl.customerList = data.docs;
      $scope.ctrl.totalItems = data.total;
      $scope.ctrl.limit = data.limit;
      if(!_.isEmpty(data.docs)) prepareListUser();
    });

    function prepareListUser() {
      _.map($scope.ctrl.customerList, function(value) {
        value.location = value.city + ' - ' + value.state;

        if (value.companyName) value.fullname = value.companyName
        if (value.name && value.lastname) {
          value.fullname = value.name + ' ' + value.lastname;
        }
        else value.fullname = 'Não há registro';

        value.doc = value.doc !== "Não há registro" ? generalUtils.formatCPF(value.doc) : value.doc;
        value.doc = value.doc ? value.doc : "Não há registro";

        value.phone = value.phone !== "Não há registro" ? generalUtils.formatPhone(value.phone) : value.phone;
        value.phone = value.phone ? value.phone : "Não há registro";
        return value;
      });
    }

    $scope.orderByName = function(){
      $scope.ctrl.orderByName = !$scope.ctrl.orderByName;
      if ($scope.ctrl.orderByName){
        $scope.ctrl.orderBy = 'fullname';
        $scope.ctrl.orderType = 'asc';
        getCustomers();
      }
      if (!$scope.ctrl.orderByName){
        $scope.ctrl.orderBy = 'fullname';
        $scope.ctrl.orderType = 'desc';
        getCustomers();
      }
      $scope.ctrl.orderByDoc = true;
      $scope.ctrl.orderByTel = true;
      $scope.ctrl.orderByEmail = true;
    };

    $scope.orderByDoc = function(){
      $scope.ctrl.orderByDoc = !$scope.ctrl.orderByDoc;
      if ($scope.ctrl.orderByDoc){
        $scope.ctrl.orderBy = 'doc';
        $scope.ctrl.orderType = 'asc';
        getCustomers();
      }
      if (!$scope.ctrl.orderByDoc){
        $scope.ctrl.orderBy = 'doc';
        $scope.ctrl.orderType = 'desc';
        getCustomers();
      }
      $scope.ctrl.orderByName = true;
      $scope.ctrl.orderByTel = true;
      $scope.ctrl.orderByEmail = true;
    };

    $scope.orderByTel = function(){
      $scope.ctrl.orderByTel = !$scope.ctrl.orderByTel;
      if ($scope.ctrl.orderByTel){
        $scope.ctrl.orderBy = 'phone';
        $scope.ctrl.orderType = 'asc';
        getCustomers();
      }
      if (!$scope.ctrl.orderByTel){
        $scope.ctrl.orderBy = 'phone';
        $scope.ctrl.orderType = 'desc';
        getCustomers();
      }
      $scope.ctrl.orderByDoc = true;
      $scope.ctrl.orderByName = true;
      $scope.ctrl.orderByEmail = true;
    };

    $scope.orderByEmail = function(){
      $scope.ctrl.orderByEmail = !$scope.ctrl.orderByEmail;
      if ($scope.ctrl.orderByEmail){
        $scope.ctrl.orderBy = 'email';
        $scope.ctrl.orderType = 'asc';
        getCustomers();
      }
      if (!$scope.ctrl.orderByEmail){
        $scope.ctrl.orderBy = 'email';
        $scope.ctrl.orderType = 'desc';
        getCustomers();
      }
      $scope.ctrl.orderByDoc = true;
      $scope.ctrl.orderByTel = true;
      $scope.ctrl.orderByName = true;
    };

    function getCustomers() {
      var orderBy = $scope.ctrl.orderBy || 'fullname';
      var orderType = $scope.ctrl.orderType || 'asc';
      Restangular.one('customers?page=' + $scope.ctrl.currentPage + '&orderBy=' + orderBy + '&orderType=' + orderType).get().then(function(data) {
        $scope.ctrl.customerList = data.docs;
        $scope.ctrl.totalItems = data.total;
        $scope.ctrl.limit = data.limit;
        prepareListUser();
      }, function(err) {
        $scope.ctrl.customerList = [];
      });
    }

    $scope.paginate = function() {
        getCustomers()
    };


  }

})();
