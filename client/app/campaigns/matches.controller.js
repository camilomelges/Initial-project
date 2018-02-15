/**
 * Created by atomicavocado on 05/01/17.
 */
(function () {
  'use strict';

  angular.module('app')
    .controller('MatchesListCtrl', ['$scope', '$uibModal', 'Matches', 'Restangular', '$state', 'generalUtils', 'toastHelper', MatchesListCtrl]);

  function MatchesListCtrl($scope, $uibModal, Matches, Restangular, $state, generalUtils, toastHelper) {
    $scope.ctrl = {
      'matchesList': Matches
    };

    $scope.config = {
      itemsPerPage: 15,
      maxPages: 8,
      paginatorLabels: {
        stepBack: '‹',
        stepAhead: '›',
        jumpBack: '«',
        jumpAhead: '»',
        first: 'Início',
        last: 'Fim'
      },
      fillLastPage: false
    };

    $scope.openModal = function (size) {

      var confirmationModal = $uibModal.open({
        animation: true,
        templateUrl: 'app/utils/confirmation-modal.html',
        controller: 'ConfirmationModalCtrl',
        size: size,
        resolve: {
          Title: function () {
            return 'Atenção!'
          },
          Message: function () {
            return 'Ao clicar em confirmar, o sistema irá disparar SMS e e-mail para todos clientes listados.'
          }
        }
      });


      confirmationModal.result.then(function (data) {
        if (_.isEmpty(data)) {
          return;
        }
        switch (data.reason) {
          case 'confirmed':
            generalUtils.startLoader();
            Restangular
              .all('campaigns')
              .post()
              .then(
                function (data) {
                  // generalUtils.hideLoader();
                  var config = {
                    content: 'Disparando anúncios...'
                  };
                  toastHelper.toastSimple(config);
                  // $state.go('campaigns.report');
                }, function (err) {
                  handleErrorSendCampaign(err);
                });
            break;
        }
      });
    };

    function handleErrorSendCampaign(err) {
      generalUtils.onError("Ops!", err.data.message, "Confirmar", function (isConfirm) {

      });
    }
  }

})();
