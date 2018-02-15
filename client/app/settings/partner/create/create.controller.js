/**
 * Created by atomicavocado on 17/02/17.
 */
(function () {
  'use strict';

  angular.module('app')
    .controller('PartnerCreateCtrl', ['$scope', '$state', 'generalUtils', 'Restangular', 'States',
      'Services', 'Brands', '$timeout', '$analytics', PartnerCreateCtrl]);

  function PartnerCreateCtrl($scope, $state, generalUtils, Restangular, States,
                             Services, Brands, $timeout, $analytics) {
    $timeout(function () {
      $analytics.pageTrack('partner/create');
      $analytics.eventTrack('NovoParceiro');
    }, 20000);

    $scope.form = {
      branches: []
    };

    $scope.ctrl = {
      states: States,
      services: Services,
      brands: Brands,
      branchFormButton: 'Adicionar Unidade',
      showBranchForm: false,
      disableSaveButton: false
    };

    $scope.removeBranch = function (index) {
      $scope.form.branches.splice(index,1);
    };

    $scope.toggleBranchForm = function () {
      $scope.ctrl.branchFormButton = $scope.ctrl.showBranchForm ? 'Adicionar Unidade' : 'Cancelar';
      $scope.ctrl.showBranchForm = !$scope.ctrl.showBranchForm
    };

    $scope.cancelForm = function () {
      $state.go('settings.partnerView', {id: $scope.form._id});
    };

    $scope.submitForm = function (valid) {
      $scope.ctrl.disableSaveButton = true;
      if ($scope.form.branches.length < 1){
        $scope.ctrl.disableSaveButton = false;
        return generalUtils.onError(
          'Ops',
          'Adicione pelo menos uma unidade para cadastrar um parceiro',
          'Confirmar',
          function (isConfirm) {
          }
        );
      };

      if (valid && $scope.form.branches.length > 0) {
        generalUtils.startLoader();
        $analytics.eventTrack('ParceiroCadastrado');
        $scope.form.brands = _.map($scope.form.brands, '_id');

        Restangular.all('partners').post($scope.form).then(function (data) {
            generalUtils.hideLoader();
            generalUtils.onSuccess(
              'Sucesso!',
              'Parceiro inserido na plataforma!',
              'Voltar para tela principal',
              '',
              function (isConfirm) {
                if (isConfirm)
                  $state.go('settings.partnerList');
              });
            $scope.ctrl.disableSaveButton = false;
          },
          function (err) {
            generalUtils.hideLoader();
            var message = '';

            switch (err.status) {
              case 404:
                message = 'Not Found';
                break;
              case 400:
                message = 'Bad Request';
                break;
              case 409:
                message = 'CNPJ da unidade já cadastrado no sistema.';
                break;
              default:
                message = 'Erro ao efetivar o cadastro';
            }

            generalUtils.onError(
              'Ops!',
              message,
              'Confirmar',
              function (isConfirm) {

              });
            $scope.ctrl.disableSaveButton = false;
          });
      }
    };
  }

})();
