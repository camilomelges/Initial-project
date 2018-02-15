(function () {
  'use strict';

  angular.module('app.core', [
    // Angular modules

    'ngAria', 'ngMessages'

    // Custom modules
    , 'app.layout', 'app.i18n'

    // 3rd Party Modules
    , 'ngMaterial', 'ui.router', 'ui.bootstrap', 'duScroll', 'io-socket', 'angulartics', 'angulartics.google.analytics', 'textAngular'
  ])
    .run(['uibPaginationConfig', '$rootScope', 'localStorageService', 'Restangular', '$state', 'generalUtils', 'permissionHelper', '$timeout', 'socket', 'toastHelper',
      function (uibPaginationConfig, $rootScope, localStorageService, Restangular, $state, generalUtils, permissionHelper, $timeout, socket, toastHelper) {

        uibPaginationConfig.previousText = "‹";
        uibPaginationConfig.nextText = "›";
        uibPaginationConfig.firstText = "«";
        uibPaginationConfig.lastText = "»";

        var authentication = localStorageService.get('authentication');
        Restangular.setErrorInterceptor(function (response) {
          if (response.status === 401) {
            localStorageService.clearAll();
            generalUtils.onError(
              'Ops',
              'Erro ao autenticar seu usuário. Por favor faça o login.',
              'Confirmar',
              function () {
                generalUtils.hideLoader();
                $state.go('login');
              });

            return false;
          } else if (response.status === 403) {
            localStorageService.clearAll();
            generalUtils.onError(
              'Ops',
              'Sua conta está temporariamente desativada, por favor contate nosso suporte.',
              'Confirmar',
              function () {
                generalUtils.hideLoader();
                $state.go('login');
              });

            return false;
          } else {
            return true;
          }
        });

        if (!_.isEmpty(authentication)) {
          permissionHelper.setRole(authentication, localStorageService.get('displayables'));
          Restangular.setDefaultHeaders({
            'authorization': authentication.token,
            'branch': authentication.branch,
            'partner': authentication.partner,
            'staff': authentication.staff
          })
            .setDefaultHttpFields({
              'authorization': authentication.token,
              'branch': authentication.branch,
              'partner': authentication.partner,
              'staff': authentication.staff
            });

          socket.connectNameSpace({
            namespace: authentication.partner.namespace ? authentication.partner.namespace : authentication.partner,
            room: authentication.branch,
            token: authentication.token
          }, function () {
            socket.emit('logOff');
            socket.emit('logOn');
          });
        }

        function isLogged() {
          var auth = localStorageService.get('authentication');

          if (!auth || !auth.token || !auth.branch || !auth.partner) {
            localStorageService.clearAll();
            return false;
          }
          return true;
        }

        function pendingActions() {
          var auth = localStorageService.get('authentication');
          if (auth.pendingActions.length > 0) {
            return true;
          }
          return false;
        }

        function checkModulesPermission(stateName, modules) {
          var authorized = true;

          if (stateName.includes('chat') && !modules.chat) authorized = false;

          if (!authorized) {
            generalUtils.onError(
              'Aviso!',
              'Você não possui permissão para acessar esta página, você será redirecionado para página principal.',
              'Confirmar',
              function (isConfirm) {
                $state.go('dashboard');
              });
          }
        };

        $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState, fromParams) {
          // auth of localStorage
          var auth = localStorageService.get('authentication');
          var displayables = localStorageService.get('displayables');
          amplitude.getInstance().logEvent('Entrou em ', toState);
          amplitude.getInstance().logEvent('Saiu de ', fromState);
          // get previous state
          $rootScope.previousState = fromState;
          $rootScope.previousParams = fromParams;
          // auth middleware
          // checking if auth and pendingActions exists
          if (auth && auth.pendingActions.length > 0) {
            var actionExists = _.find(auth.pendingActions, function (action) {
              return action.branch._id == auth.branch;
            });
          }

          // if action exists state to go for the action uai
          if (actionExists && toState.name != actionExists.stateRoute) {
            if (isLogged() && pendingActions()) {
              evt.preventDefault();
              $timeout(function () {
                generalUtils.hideLoader();
                $state.go(actionExists.stateRoute, {id: actionExists.idAction});
                var config = {
                  content: 'A solicitação deve ser cancelada ou agendada!',
                  actionText: 'Confirmar',
                  delay: 6000
                };
                return toastHelper.toastAction(config).then(function (response) {
                });
              });
            }
          }

          switch (toState.name) {
            case 'login':
            case 'forgotPassword':
              if (isLogged()) {
                evt.preventDefault();
                $timeout(function () {
                  generalUtils.hideLoader();
                  $state.go('dashboard');
                })
              }
              break;
            default:
              if (!isLogged() && toState.name != 'resetPassword') {
                evt.preventDefault();
                $timeout(function () {
                  generalUtils.hideLoader();
                  $state.go('login');
                })
              }
              break;
          }

          if (displayables && !displayables.email.includes("automobi.com.br"))
            if (auth && auth.modules) checkModulesPermission(toState.name, auth.modules)
        });

        $rootScope.$on('$stateChangeSuccess', function (evt, toState, toParams, fromState, fromParams) {

        });

        $rootScope.$on('$stateChangeError', function (evt, toState, toParams, fromState, fromParams, err) {
          if (err.status)
            switch (err.status) {
              case 401:
              case 403:
              case 400:
              case 500:
                localStorageService.clearAll();
                $timeout(function () {
                  generalUtils.hideLoader();
                  $state.go('login');
                })
            }
        });

      }
    ]);
})();
