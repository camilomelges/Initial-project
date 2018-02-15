(function () {
  'use strict';

  angular.module('app')
    .directive('newChat', function () {
      return {
        restrict: 'E',
        replace: true,
        scope: true,
        bindToController: {
          'value': '=value',
          'reload': '=reload'
        },
        controllerAs: 'dv',
        templateUrl: 'app/chat/directive/newChat.html',
        controller: ['$rootScope', '$scope', 'Restangular', 'generalUtils', '$timeout',
          '$state', 'toastHelper', 'localStorageService', newChat]
      }
    });

  function newChat($rootScope, $scope, Restangular, generalUtils, $timeout,
                   $state, toastHelper, localStorageService) {

    var staffId = localStorageService.get('authentication').staff,
        chatAttendantInfo = '';

    function confirmChatOpen(chat, callback) {
      if (!chat) return ;

      if (!chat.attendant){
        generalUtils.onWarning(
          'Atenção', 'Você agora vai atender este cliente', 'CONFIRMAR', 'CANCELAR',
          function (confirm) {
            if (!confirm) return;

            callback();
          });
      }
      else if (chat.attendant && chat.attendant._id !== staffId){
        generalUtils.onWarning(
          'Atenção', 'Chat já em tratativa pelo ' + chatAttendantInfo +
          ', aguarde o atendimento ser finalizado', 'CONFIRMAR', '',
          function (confirm) {
          });
      }
      else callback();
    }

    $scope.ctrl = {
      disableChatButton: false
    };

    $scope.newChat = function () {
      var customer = $scope.dv.value;
      var reload = $scope.dv.reload;

      $scope.ctrl.disableChatButton = true;
      generalUtils.startLoader();
      Restangular.all('chat').post(customer).then(function (data) {
        generalUtils.hideLoader();
        $scope.ctrl.disableChatButton = false;

        var config = {
          content: 'Este cliente não está logado no aplicativo!',
          actionText: 'Confirmar',
          delay: 6000
        };

        if (data.err) return toastHelper.toastAction(config).then(function (response) {});
        if (reload) $state.reload();

        if (data.attendant) chatAttendantInfo = data.attendant.name + ' ' + data.attendant.lastname;

        confirmChatOpen(data, function(){
          $state.go('chat', {fromChatDirective: true, chat: data});
        })

      }, function (err) {
        $scope.ctrl.disableChatButton = false;
        generalUtils.hideLoader();
        if (reload) $state.reload();
        generalUtils.onError('Ops!', err.data.message, 'Confirmar', function (isConfirm) {
        });
      });
    }
  }
})();
