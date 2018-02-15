/**
 * Created by atomicavocado on 23/11/16.
 */
(function () {
  'use strict';

  angular.module('app')
    .controller('ResetPasswordCtrl', ['$scope', 'Restangular', '$state', '$stateParams'
      , 'generalUtils', 'localStorageService', ResetPasswordCtrl]);

  function ResetPasswordCtrl($scope, Restangular, $state, $stateParams
    , generalUtils, localStorageService) {

    $scope.ctrl = {
      password: '',
      verification: ''
    };
    localStorageService.clearAll();
    $scope.resetPassword = function (isValid) {
      if (isValid) {
        if ($scope.ctrl.password.length < 6 || $scope.ctrl.password.length > 12) {
          generalUtils.onError(
            'Ops!',
            'Senha deve ter entre 6 e 12 caracteres',
            'Confirmar',
            function (isConfirm) {
            });
          return;
        }
        if ($scope.ctrl.password !== $scope.ctrl.verification) {
          generalUtils.onError(
            'Ops!',
            'Sua senha e a sua confirmação de senha não são iguais.',
            'Confirmar',
            function (isConfirm) {
            });
          return;
        }

        generalUtils.startLoader();
        Restangular.one('forgot-password/', $stateParams.code).post('reset', {
          password: $scope.ctrl.password,
          confirmpassword: $scope.ctrl.verification
        }).then(
          function () {
            generalUtils.hideLoader();
            generalUtils.onSuccess(
              'Sucesso!',
              'Sua senha foi alterada com sucesso.',
              'Voltar para tela de login',
              '',
              function (isConfirm) {
                if (isConfirm)
                  $state.go('login');
              });
          },
          function (err) {
            generalUtils.hideLoader();
            var message = 'Seu token de alteração de senha expirou. Por favor peça outro token clicando em \'ESQUECI MINHA SENHA\' na tela de login.';

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
