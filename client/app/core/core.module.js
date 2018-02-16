(function () {
  'use strict';

  angular.module('app.core', [
    // Angular modules

    'ngAria', 'ngMessages'

    // 3rd Party Modules
    , 'ngMaterial', 'ui.router', 'ui.bootstrap', 'duScroll', 'textAngular'
  ])
    .run(['uibPaginationConfig', '$rootScope',
      function (uibPaginationConfig, $rootScope) {

        $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState, fromParams) {
          // get previous state
          $rootScope.previousState = fromState;
          $rootScope.previousParams = fromParams;

          // switch (toState.name) {
          //   case 'login':
          //   case 'forgotPassword':
          //     if (isLogged()) {
          //       evt.preventDefault();
          //       $timeout(function () {
          //         generalUtils.hideLoader();
          //         $state.go('dashboard');
          //       })
          //     }
          //     break;
          //   default:
          //     if (!isLogged()) {
          //       evt.preventDefault();
          //       $timeout(function () {
          //         generalUtils.hideLoader();
          //         $state.go('login');
          //       })
          //     }
          //     break;
          // }
        });

        $rootScope.$on('$stateChangeSuccess', function (evt, toState, toParams, fromState, fromParams) {
        });

        $rootScope.$on('$stateChangeError', function (evt, toState, toParams, fromState, fromParams, err) {
          // if (err.status)
          //   switch (err.status) {
          //     case 401:
          //     case 403:
          //     case 400:
          //     case 500:
          //       localStorageService.clearAll();
          //       $timeout(function () {
          //         generalUtils.hideLoader();
          //         $state.go('login');
          //       })
          //   }
        });

      }
    ]);
})();
