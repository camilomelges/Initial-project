(function () {
  'use strict';

  angular.module('app')
    .directive('removeVehicle', function () {
      return {
        restrict: 'E',
        replace: true,
        scope: true,
        bindToController: {
          'value': '=value'
        },
        controllerAs: 'dv',
        templateUrl: 'app/vehicles/remove/directive/remove-vehicle.directive.html',
        controller: ['$scope', 'Restangular', 'generalUtils', '$state', removeVehicle]
      }
    });

  function removeVehicle($scope, Restangular, generalUtils, $state) {

    if (!$scope.value) return;

    $scope.ctrl.disableDeleteButton = false;

    $scope.removeVehicle = function () {
      $scope.ctrl.disableDeleteButton = true;
      amplitude.getInstance().logEvent('Clicou em excluir veículo');
      swal({
          title: "Deseja remover este veículo?",
          text: "Ao remover este veículo não será possível recuperá-lo.",
          type: "warning",
          showCancelButton: true,
          confirmButtonText: "Sim, remover agora!",
          cancelButtonText: 'Cancelar',
          closeOnConfirm: false
        },
        function(isConfirm){
          if (isConfirm) {
            Restangular.one("vehicles", $scope.dv.value).remove().then(function (data) {
              amplitude.getInstance().logEvent('Clicou em confirmar exclusão do veículo');
              if (data.success){
                generalUtils.onSuccess('Veículo removido!', 'Seu veículo foi removido com sucesso.', 'Confirmar', '', function (isConfirm) {

                  $state.reload();
                })
              }
            }, function (err) {
              var errorMessaage = (err.status === 400) ?'Não é possivel deletar um veículo com serviços em aberto.'
                : err.data.message;
              generalUtils.onError('Ops!', errorMessaage, 'Confirmar', function (isConfirm) {
                amplitude.getInstance().logEvent('Clicou em confirmar erro na exclusão do veículo');
              })
            });
          $scope.ctrl.disableDeleteButton = false;
          }else{
              amplitude.getInstance().logEvent('Clicou em cancelar exclusão do veículo');
            }
        });
      $scope.ctrl.disableDeleteButton = false;
    }
  }
})();
