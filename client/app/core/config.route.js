(function () {
  'use strict';

  angular.module('app')
    .config(['$stateProvider', '$urlRouterProvider', 'RestangularProvider', '$mdDateLocaleProvider', '$httpProvider', 'localStorageServiceProvider', '$analyticsProvider', 'NotificationProvider',
      function ($stateProvider, $urlRouterProvider, RestangularProvider, $mdDateLocaleProvider, $httpProvider, localStorageServiceProvider, $analyticsProvider, NotificationProvider) {

        NotificationProvider.setOptions({
          startTop: 20,
          startRight: 10,
          verticalSpacing: 20,
          horizontalSpacing: 20,
          positionX: 'right',
          positionY: 'top',
          closeOnClick: true
        });

        localStorageServiceProvider.setPrefix('automobi-crm');

        RestangularProvider
          .setBaseUrl('/api/')
          .setRestangularFields({id: '_id'});

        $mdDateLocaleProvider.formatDate = function (date) {
          return moment(date).format('DD/MM/YYYY');
        };

        $analyticsProvider.virtualPageviews(false);
      }
    ])
    .config(['$stateProvider', '$urlRouterProvider', 'permissions', routesConfig]);

  function routesConfig($stateProvider, $urlRouterProvider, permissions) {
    var routes, setRoutes;

    $urlRouterProvider
      .otherwise('/login');

    $stateProvider.state('private', {
      controller: 'PrivateCtrl',
      templateUrl: 'app/private.html',
      abstract: true,
      resolve: {
        Branches: ['Restangular', 'localStorageService',
          function (Restangular, localStorageService) {
            var id = localStorageService.get('authentication').staff;
            return Restangular.all('staffs/' + id + '/branches').getList().then(function (restangularized) {
              return restangularized.plain();
            });
          }]
      }
    });

    $stateProvider.state('login', {
      url: '/login',
      templateUrl: 'app/login/login.html',
      controller: 'LoginCtrl'
    });

    $stateProvider.state('forgotPassword', {
      url: '/forgot-password',
      templateUrl: 'app/login/forgot-password.html',
      controller: 'ForgotPasswordCtrl'
    });

    $stateProvider.state('resetPassword', {
      url: '/resetPassword/:code',
      templateUrl: 'app/login/reset.html',
      controller: 'ResetPasswordCtrl'
    });

    $stateProvider.state('dashboard', {
      parent: 'private',
      url: '/dashboard',
      controller: 'DashboardCtrl',
      templateUrl: 'app/dashboard/dashboard.html',
      resolve: {
        Vehicles: ['Restangular',
          function (Restangular) {
            return Restangular.one('vehicles').customGET('count');
          }],
        Schedules: ['Restangular',
          function (Restangular) {
            return Restangular.one('schedules').customGET('today/count');
          }],
        Customers: ['Restangular',
          function (Restangular) {
            return Restangular.one('customers').customGET('count');
          }],
        MobileCustomers: ['Restangular',
          function (Restangular) {
            return Restangular.one('customers').customGET('mobile/count');
          }],
        SurveyQuestions: ['Restangular',
          function (Restangular) {
            return Restangular.one('surveys').customGET('questions');
          }],
      },
      data: {
        permissions: {
          only: permissions.read
        }
      }
    });

    $stateProvider.state('customers', {
      parent: 'private',
      url: '/customers',
      abstract: true,
      template: '<ui-view/>'
    });

    $stateProvider.state('customers.list', {
      url: '/list',
      templateUrl: 'app/customers/list/list.html',
      controller: 'CustomerListCtrl',
      resolve: {
        Customers: ['Restangular',
          function (Restangular) {
            return Restangular.one('customers?page=1').get();
          }
        ]
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

    $stateProvider.state('customers.import', {
        url: '/import',
        templateUrl: 'app/customers/import/import.html',
        controller: 'CustomerImportCtrl',
        data: {
          permissions: {
            only: permissions.createCustomer,
            redirectTo: ['generalUtils', function (generalUtils) {
              generalUtils.hideLoader();
              return 'dashboard';
            }]
          }
        }
      }
    );

    $stateProvider.state('vehicles', {
      parent: 'private',
      url: '/vehicles',
      abstract: true,
      template: '<ui-view/>'
    });

    $stateProvider.state('vehicles.list', {
      url: '/list',
      templateUrl: 'app/vehicles/list/list.html',
      controller: 'VehicleListCtrl',
      resolve: {
        Vehicles: ['Restangular',
          function (Restangular) {
            return Restangular.one('vehicles?page=1').get();
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

    $stateProvider.state('vehicles.create', {
      url: '/create/:id',
      templateUrl: 'app/vehicles/create.html',
      controller: 'VehicleCreateCtrl',
      resolve: {
        User: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            return Restangular.one('customers', $stateParams.id).get();
          }
        ],
        Brands: ['Restangular',
          function (Restangular) {
            return Restangular.all('vehicles/brands').getList();
          }]
      },
      data: {
        permissions: {
          only: permissions.createVehicle,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('vehicles.view', {
      url: '/view/:id',
      params: {arrayOfSearch: null, soughtString: null},
      templateUrl: 'app/vehicles/view.html',
      controller: 'VehicleViewAndEditCtrl',
      resolve: {
        Vehicle: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            return Restangular.one('vehicles', $stateParams.id).get();
          }
        ],
        Brands: ['Restangular',
          function (Restangular) {
            return Restangular.all('vehicles/brands').getList();
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


    $stateProvider.state('schedulerequests', {
      parent: 'private',
      url: '/schedulerequests',
      params: {status: null},
      templateUrl: 'app/schedules/requests/list/schedule-request-list.html',
      controller: 'ScheduleRequestListCtrl',
      resolve: {
        ScheduleRequests: ['Restangular',
          function (Restangular) {
            return Restangular.all('scheduleRequests').getList({status: 'requested'});
          }
        ]
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

    $stateProvider.state('schedulerequests.view', {
      parent: 'private',
      url: '/schedulerequests/view/:id',
      templateUrl: 'app/schedules/requests/view/schedule-request-view.html',
      controller: 'ScheduleRequestViewCtrl',
      resolve: {
        ScheduleRequest: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            return Restangular.one('scheduleRequests', $stateParams.id).get();
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

    $stateProvider.state('schedulerequests.update', {
      parent: 'private',
      url: '/schedulerequests/update/:id',
      templateUrl: 'app/schedules/requests/update/schedule-request-update.html',
      controller: 'ScheduleRequestUpdateCtrl',
      resolve: {
        ScheduleRequest: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            return Restangular.one('scheduleRequests', $stateParams.id).get();
          }],
        Services: ['Restangular', 'localStorageService',
          function (Restangular, localStorageService) {
            var id = localStorageService.get('authentication').branch;
            return Restangular.all('branches/' + id + '/services').getList();
          }],
        BranchSettings: ['Restangular',
          function (Restangular) {
            return Restangular.one('branch/scheduleSettings').get();
          }],
        Partner: ['Restangular', 'localStorageService',
          function (Restangular, localStorageService) {
            var id = localStorageService.get('authentication').partner;
            return Restangular.one('partners', id).get();
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

    $stateProvider.state('schedules', {
      parent: 'private',
      url: '/schedules',
      templateUrl: 'app/schedules/scheduled/list/schedule-list.html',
      controller: 'ScheduleListCtrl',
      resolve: {
        Schedules: ['Restangular',
          function (Restangular) {
            return Restangular.one('schedules?page=1').get({status: 'pending'});
          }
        ]
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

    $stateProvider.state('scheduleview', {
      parent: 'private',
      url: '/scheduleview/:id',
      templateUrl: 'app/schedules/scheduled/view/view.html',
      controller: 'ScheduleViewController',
      resolve: {
        Schedule: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            return Restangular.one('schedules', $stateParams.id).get();
          }
        ]
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

    $stateProvider.state('schedule-edit', {
      parent: 'private',
      url: '/schedule-edit/:idSchedule',
      templateUrl: 'app/schedules/scheduled/edit/schedule-edit.html',
      controller: 'ScheduleEditCtrl',
      resolve: {
        Customer: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            if (!$stateParams.id)
              return Restangular.all('customers').getList();
            else
              return Restangular.one('customers', $stateParams.id).get();
          }],
        Vehicle: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            if (!_.isEmpty($stateParams.id)) return Restangular.one('vehicles', $stateParams.idCustomer.idVehicle).get();
            else return {};
          }],
        Services: ['Restangular', 'localStorageService',
          function (Restangular, localStorageService) {
            var id = localStorageService.get('authentication').branch;
            return Restangular.all('branches/' + id + '/services').getList();
          }],
        BranchSettings: ['Restangular',
          function (Restangular) {
            return Restangular.one('branch/scheduleSettings').get();
          }],
        Schedule: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            return Restangular.one('schedules', $stateParams.idSchedule).get();
          }
        ],
        Relationships: ['Restangular',
          function (Restangular) {
            return Restangular.all('relationships').getList();
          }],
        Partner: ['Restangular', 'localStorageService',
          function (Restangular, localStorageService) {
            var id = localStorageService.get('authentication').partner;
            return Restangular.one('partners', id).get();
          }]
      },
      data: {
        permissions: {
          only: permissions.editSchedule,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('schedulecreate', {
      parent: 'private',
      url: '/schedulecreate/',
      params: {id: null, vehicleId: null, scheduleCtrl: null, scheduleCalendar: null, customerCreated: null},
      templateUrl: 'app/schedules/scheduled/create/create.html',
      controller: 'CreateScheduleCtrl',
      resolve: {
        Customer: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            if ($stateParams.id)
              return Restangular.one('customers', $stateParams.id).get();
          }
        ],
        Services: ['Restangular', 'localStorageService',
          function (Restangular, localStorageService) {
            var id = localStorageService.get('authentication').branch;
            return Restangular.all('branches/' + id + '/services').getList();
          }],
        BranchSettings: ['Restangular',
          function (Restangular) {
            return Restangular.one('branch/scheduleSettings').get();
          }],
        Schedule: ['Restangular',
          function (Restangular) {
            return Restangular.one('schedules');
          }],
        Relationships: ['Restangular',
          function (Restangular) {
            return Restangular.all('relationships').getList();
          }],
        Partner: ['Restangular', 'localStorageService',
          function (Restangular, localStorageService) {
            var id = localStorageService.get('authentication').partner;
            return Restangular.one('partners', id).get();
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

    $stateProvider.state('campaigns', {
      parent: 'private',
      url: '/campaigns',
      abstract: true,
      template: '<ui-view/>'
    });

    $stateProvider.state('campaigns.matches', {
      url: '/matches',
      templateUrl: 'app/campaigns/matches.html',
      controller: 'MatchesListCtrl',
      resolve: {
        Matches: ['Restangular',
          function (Restangular) {
            return Restangular.all('analysis/matches').getList();
          }
        ]
      },
      data: {
        permissions: {
          only: permissions.createEmployee,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('campaigns.report', {
      url: '/list',
      templateUrl: 'app/campaigns/report.html',
      controller: 'ReportController',
      resolve: {
        Campaigns: ['Restangular',
          function (Restangular) {
            return Restangular.all('campaigns').getList();
          }
        ]
      },
      data: {
        permissions: {
          only: permissions.requestAnalysis,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('campaigns.create', {
      url: '/create',
      templateUrl: 'app/campaigns/create.html',
      controller: 'CampaignCreateController',
      resolve: {
        Campaign: ['Restangular',
          function (Restangular) {
            return Restangular.one('campaigns');
          }],
        PartnerLogo: ['Restangular',
          function (Restangular) {
            var local = localStorage.getItem('automobi-crm.authentication');
            var partner = JSON.parse(local).partner;
            return Restangular.one('partners', partner).one('logo').get();
          }]
      },
      data: {
        permissions: {
          only: permissions.requestAnalysis,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('campaigns.details', {
      url: '/:id',
      templateUrl: 'app/campaigns/details.html',
      controller: 'CampaignDetailsController',
      resolve: {
        Campaign: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            return Restangular.one('campaigns', $stateParams.id).get();
          }]
      },
      data: {
        permissions: {
          only: permissions.requestAnalysis,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('employees', {
      parent: 'private',
      url: '/employees',
      abstract: true,
      template: '<ui-view/>'
    });

    $stateProvider.state('employees.list', {
      url: '/list',
      templateUrl: 'app/employees/list.html',
      controller: 'EmployeesListCtrl',
      resolve: {
        Employees: ['Restangular',
          function (Restangular) {
            return Restangular.all('staffs').getList();
          }
        ]
      },
      data: {
        permissions: {
          only: permissions.createEmployee,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('employees.create', {
      url: '/create',
      templateUrl: 'app/employees/create.html',
      controller: 'EmployeesCreateCtrl',
      resolve: {
        Branches: ['Restangular',
          function (Restangular) {
            return Restangular.all('branches').getList();
          }
        ]
      },
      data: {
        permissions: {
          only: permissions.createEmployee,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('employees.edit', {
      url: '/edit/:id',
      templateUrl: 'app/employees/edit.html',
      controller: 'EmployeesEditCtrl',
      resolve: {
        Employee: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            return Restangular.one('staffs', $stateParams.id).get();
          }
        ],
        Branches: ['Restangular',
          function (Restangular) {
            return Restangular.all('branches').getList();
          }
        ]
      },
      data: {
        permissions: {
          only: permissions.createEmployee,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('employees.detail', {
      url: '/detail/:id',
      templateUrl: 'app/employees/detail.html',
      controller: 'EmployeesDetailCtrl',
      resolve: {
        Employee: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            return Restangular.one('staffs', $stateParams.id).get();
          }]
      },
      data: {
        permissions: {
          only: permissions.readEmployee,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('settings', {
      parent: 'private',
      url: '/settings',
      abstract: true,
      template: '<ui-view/>'
    });

    $stateProvider.state('survey', {
      parent: 'private',
      url: '/survey',
      abstract: true,
      template: '<ui-view/>'
    });

    $stateProvider.state('survey.list', {
      url: '/list?surveyId&surveyQuestion',
      templateUrl: 'app/survey/list/list.html',
      controller: 'SurveyCommentListCtrl',
      resolve: {
        SurveyQuestions: ['Restangular',
          function (Restangular) {
            return Restangular.all('surveys/questions').getList();
          }
        ]

      },
      data: {
        permissions: {
          only: permissions.readSurvey,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('settings.servicesUpload', {
      url: '/services-upload',
      templateUrl: 'app/settings/upload-services.html',
      controller: 'ServicesUploadCtrl',
      resolve: {
        Services: ['Restangular',
          function (Restangular) {
            return Restangular.all('service').getList();
          }
        ]
      },
      data: {
        permissions: {
          only: permissions.settings,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('settings.partnerList', {
      url: '/partner-list',
      templateUrl: 'app/settings/partner/list/partner-list.html',
      controller: 'PartnerListCtrl',
      resolve: {
        Partners: ['Restangular',
          function (Restangular) {
            return Restangular.all('partners').getList();
          }
        ]
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

    $stateProvider.state('settings.partnerCreate', {
      url: '/partner-create',
      templateUrl: 'app/settings/partner/create/create.html',
      controller: 'PartnerCreateCtrl',
      resolve: {
        Partner: ['Restangular',
          function (Restangular) {
            return Restangular.one('partners');
          }],
        States: ['Restangular',
          function (Restangular) {
            return Restangular.all('states').getList();
          }],
        Services: ['Restangular',
          function (Restangular) {
            return Restangular.all('services').getList();
          }],
        Brands: ['Restangular',
          function (Restangular) {
            return Restangular.all('public/vehicles/brands').getList();
          }]
      },
      data: {
        permissions: {
          only: permissions.createPartner,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('settings.partnerEdit', {
      url: '/partner-edit/:id',
      templateUrl: 'app/settings/partner/edit/partner-edit.html',
      controller: 'PartnerEditCtrl',
      resolve: {
        Partner: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            return Restangular.one('partners', $stateParams.id).get();
          }],
        States: ['Restangular',
          function (Restangular) {
            return Restangular.all('states').getList();
          }
        ],
        Services: ['Restangular',
          function (Restangular) {
            return Restangular.all('services').getList();
          }
        ],
        FilteredBrands: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            return Restangular.all('vehicles/brands').customGET('', {
              partner: $stateParams.id,
              filterBrandsPartner: true
            });
          }
        ],
        Brands: ['Restangular',
          function (Restangular) {
            return Restangular.all('public/vehicles/brands').getList();
          }
        ]
      },
      data: {
        permissions: {
          only: permissions.updatePartner,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('settings.partnerView', {
      url: '/partner-view/:id',
      templateUrl: 'app/settings/partner/view/partner-view.html',
      controller: 'PartnerViewCtrl',
      resolve: {
        Partner: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            return Restangular.one('partners', $stateParams.id).get();
          }]
      },
      data: {
        permissions: {
          only: permissions.readPartner,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('settings.branchEdit', {
      url: '/branch',
      templateUrl: 'app/settings/branch/edit.html',
      controller: 'EditBranchCtrl',
      resolve: {
        BranchSettings: ['Restangular',
          function (Restangular) {
            return Restangular.one('branch/settings').get();
          }]
      },
      data: {
        permissions: {
          only: permissions.readPartner,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('rules', {
      url: '/rules/report',
      templateUrl: 'app/rules/report.html',
      controller: 'RulesReportCtrl',
      parent: 'private',
      resolve: {
        Relationships: ['Restangular',
          function (Restangular) {
            return Restangular.all('relationships').getList();
          }]
      },
      data: {
        permissions: {
          only: permissions.viewRules,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('chat', {
      url: '/chat',
      templateUrl: 'app/chat/list-conversations.html',
      params: {fromChatDirective: false, chat: null},
      controller: 'ChatCtrl',
      parent: 'private',
      resolve: {
        OpenChats: ['Restangular',
          function (Restangular) {
            return Restangular.all('chat/open').getList();
          }],
        MyChats: ['Restangular',
          function (Restangular) {
            return Restangular.all('chat/my').getList();
          }],
        ClosedChats: ['Restangular',
          function (Restangular) {
            return Restangular.all('chat/closed').getList();
          }]
      },
    });

    $stateProvider.state('chat.view', {
      url: '/view/:id',
      templateUrl: 'app/chat/view.html',
      params: {fromChatList: false},
      controller: 'ViewChatCtrl',
      resolve: {
        ListChats: ['Restangular',
          function (Restangular) {
            return Restangular.all('chat').getList();
          }],
        Chat: ['Restangular', '$stateParams',
          function (Restangular, $stateParams) {
            return Restangular.one('chat', $stateParams.id).get();
          }]
      }
    });

    $stateProvider.state('bugs', {
      parent: 'private',
      url: '/bugs',
      abstract: true,
      template: '<ui-view/>'
    });

    $stateProvider.state('bugs.tickets', {
      url: '/tickets',
      templateUrl: 'app/bugs/ticket/list/ticket-list.html',
      controller: 'bugsTicketsList',
      resolve: {
        Bugs: ['Restangular',
          function (Restangular) {
            return Restangular.all('bugs').getList();
          }
        ]
      },
      data: {
        permissions: {
          only: permissions.bugs,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });

    $stateProvider.state('bugs.faq', {
      url: '/view',
      templateUrl: 'app/bugs/faq/faq.html',
      controller: 'bugsFaqView'
    });

    $stateProvider.state('notifications', {
      url: '/notifications',
      templateUrl: 'app/notifications/view.html',
      parent: 'private'
    });

    $stateProvider.state('metabase', {
      parent: 'private',
      url: '/metabase',
      abstract: true,
      template: '<ui-view/>'
    });

    $stateProvider.state('metabase.operations', {
      url: '/operations',
      templateUrl: 'app/metabase/operations.html',
      controller: 'metabaseOperationsCtrl',
      data: {
        permissions: {
          only: permissions.metabase,
          redirectTo: ['generalUtils', function (generalUtils) {
            generalUtils.hideLoader();
            return 'dashboard';
          }]
        }
      }
    });



  }
})
();
