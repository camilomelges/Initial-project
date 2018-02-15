(function () {
  'use strict';

  angular.module('app')
    .controller('PartnerEditCtrl', ['$scope', 'Partner', 'Brands', 'FilteredBrands', '$state', 'generalUtils',
      'States', 'Restangular', '$timeout', '$analytics', PartnerEditCtrl])

  function PartnerEditCtrl($scope, Partner, Brands, FilteredBrands, $state, generalUtils,
                           States, Restangular, $timeout, $analytics) {
    $timeout(function () {
      $analytics.pageTrack('partner/edit');
      $analytics.eventTrack('EditarParceiro');
    }, 20000);

    $scope.activeOptions = [
      {name: 'Ativo', value: true},
      {name: 'Inativo', value: false}
    ];

    $scope.form = Partner;
    $scope.ctrl = {
      states: States,
      active: _.find($scope.activeOptions, function(active) {
        return active.value === $scope.form.active
      })
    };

    $scope.ctrl.brands = Brands;
    $scope.form.brands = _.intersectionBy(Brands, FilteredBrands, '_id');

    $scope.ctrl.state = _.find($scope.ctrl.states, {_id: $scope.form.idState});

    if ($scope.ctrl.state)
      requestCities($scope.ctrl.state, function () {
        $scope.ctrl.city = _.find($scope.ctrl.cities, {_id: $scope.form.idCity})
      });

    $scope.activeOptionChange = function () {
      if (!$scope.ctrl.active.value){
        swal({
          title: 'Você tem certeza?',
          text: "Um parceiro desativado não receberá mais relatórios",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sim, desativar',
          cancelButtonText: 'Não, cancelar',
          confirmButtonClass: 'btn btn-success',
          cancelButtonClass: 'btn btn-danger',
          allowOutsideClick: false,
          buttonsStyling: false
        }, function (result) {
          if (!result) {
            $timeout(function(){
              $scope.ctrl.active = _.find($scope.activeOptions, function(active) {
                return active.value === true
              });
            },100);
          }
        });
      }
    };

    $scope.stateChange = function (state) {
      if (!state)
        return;

      requestCities(state);
    };

    function requestCities(state, callback) {

      $scope.ctrl.cities = [{name: 'Carregando...', _id: ''}];
      $scope.ctrl.city = $scope.ctrl.cities[0];

      $scope.form.state = state.name;
      $scope.form.stateInitials = state.initials;
      $scope.form.idState = state._id;

      Restangular.one('states', $scope.form.idState).getList('cities').then(function (data) {
        $scope.ctrl.cities = [];
        $scope.ctrl.cities = data;

        if (callback && typeof(callback) === 'function') {
          callback();
        }
      }, function (err) {
        $scope.ctrl.cities = [];
        if (callback && typeof(callback) === 'function') {
          callback();
        }
      });
    }

    $scope.cityChange = function (city) {
      if (!city)
        return;

      $scope.form.city = city.name;
      $scope.form.idCity = city._id;
    };


    $scope.cancelForm = function (e) {
      $state.go('settings.partnerView', {id: $scope.form._id});
    };

    $scope.showAddressForm = !!($scope.form.address || $scope.ctrl.city || $scope.ctrl.state);

    $scope.submitForm = function (valid) {
      if (valid) {
        generalUtils.startLoader();
        $scope.form.active = $scope.ctrl.active.value;

        $scope.form.save().then(function (data) {
            generalUtils.hideLoader();
            generalUtils.onSuccess(
              'Sucesso!',
              'Parceiro atualizado na plataforma!',
              'Voltar para tela principal',
              '',
              function (isConfirm) {
                if (isConfirm)
                  $state.go('settings.partnerView', {id: data._id});
              });
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
              default:
                message = 'Erro ao efetivar a edição';
            }

            generalUtils.onError(
              'Ops!',
              message,
              'Confirmar edição',
              function (isConfirm) {

              });
          });
      }
    };
  }

})();
