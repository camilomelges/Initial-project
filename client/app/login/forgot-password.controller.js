/**
 * Created by atomicavocado on 23/11/16.
 */
(function () {
  'use strict';

  angular.module('app')
    .controller('ForgotPasswordCtrl', ['$scope', 'Restangular', '$state', 'generalUtils', ForgotPasswordCtrl]);

  function ForgotPasswordCtrl($scope, Restangular, $state, generalUtils) {

    $scope.forgotPassword = function (isValid) {
      if (isValid) {
        generalUtils.startLoader();

        Restangular.all('forgot-password').post({email: $scope.email}).then(
          function () {
            generalUtils.hideLoader();
            generalUtils.onSuccess(
              'Sucesso!',
              'Instruções para recuperação de senha foram enviadas para o seu e-mail.',
              'Voltar para tela de login',
              '',
              function (isConfirm) {
                if (isConfirm)
                  $state.go('login');
              });
          },
          function (err) {
            generalUtils.hideLoader();
            var message = 'Esse e-mail não está cadastrado em nosso sistema.';

            generalUtils.onError(
              'Ops!',
              message,
              'Confirmar',
              function (isConfirm) {

              });
          });
      }
    }

  }
})();
