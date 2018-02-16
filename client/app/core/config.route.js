(function () {
  'use strict';

  angular.module('app')
    .config(['$stateProvider', '$urlRouterProvider', 'RestangularProvider', '$mdDateLocaleProvider',
      function ($stateProvider, $urlRouterProvider, RestangularProvider, $mdDateLocaleProvider) {

        RestangularProvider
          .setBaseUrl('/api/')
          .setRestangularFields({id: '_id'});

        $mdDateLocaleProvider.formatDate = function (date) {
          return moment(date).format('DD/MM/YYYY');
        };
      }
    ])
    .config(['$stateProvider', '$urlRouterProvider', 'permissions', routesConfig]);

  function routesConfig($stateProvider, $urlRouterProvider, permissions) {

    // $urlRouterProvider
    //   .otherwise('/login');

    $stateProvider.state('customers', {
      url: '/customers',
      abstract: true,
      template: '<ui-view/>'
    });

    $stateProvider.state('customers.list', {
      url: '/list',
      templateUrl: 'app/customers/list/list.html',
      controller: 'CustomerListCtrl',
      resolve: {},
      data: {}
    });

    $stateProvider.state('customers.create', {
      url: '/create/:id',
      params: {scheduleCtrl: null, scheduleCalendar: null},
      templateUrl: 'app/customers/create/create.html',
      controller: 'CustomerCreateCtrl',
      resolve: {
        Customer: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            if (!_.isEmpty($stateParams.id))
              return Restangular.one('customers', $stateParams.id).get();
            else
              return {};
          }],
        States: ['Restangular',
          function (Restangular) {
            return Restangular.all('states').getList();
          }
        ]
      },
      data: {
        permissions: {
          only: permissions.createCustomer,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('customers.view', {
      url: '/view/:id',
      params: {arrayOfSearch: null, soughtString: null, vehicleId: null},
      templateUrl: 'app/customers/view/view.html',
      controller: 'CustomerViewAndEditCtrl',
      resolve: {
        Customer: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            return Restangular.one('customers', $stateParams.id).get();
          }]
      },
      data: {
        permissions: {
          only: permissions.read,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });
  }
})();
