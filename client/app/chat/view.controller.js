(function () {
  'use strict';

  angular.module('app')
    .controller('ViewChatCtrl', ['$scope', '$timeout', 'generalUtils', 'toastHelper', '$rootScope', 'localStorageService'
      , '$stateParams', 'Chat', 'Restangular', 'socket', '$state', '$uibModal', 'focus', ViewChatCtrl]);

  function ViewChatCtrl($scope, $timeout, generalUtils, toastHelper, $rootScope, localStorageService
    , $stateParams, Chat, Restangular, socket, $state, $uibModal, focus) {
    amplitude.getInstance().logEvent('Entrou em um chat');
    var staffId = localStorageService.get('authentication').staff;
    if (!Chat) return $state.go('chat');
    $rootScope.$emit('clearNotificationChat');

    $scope.ctrl = {
      disableChatButton: false,
      disableScheduleButton: false
    };

    function createType(item) {
      if (_.has(item, 'question')) {
        item.isTalk = false;
        item.type = 'talk-attendant';
      }
      if (_.has(item, 'closure')) {
        item.isTalk = false;
        item.type = 'closure';
      } else {
        item.isTalk = true;
        item.type = (item.origin.root === 'User') ? 'talk-user' : 'talk-attendant';
      }
      return item;
    }

    $scope.keyPressed = function ($event) {
      var enterCode = 13, tabCode = 9;
      var shiftPressed = $event.shiftKey;

      if ($event.keyCode === enterCode && $scope.newMessage.length > 0 && !shiftPressed) {
        $event.preventDefault();
        $scope.sendMessage();
      }

      if ($event.keyCode === tabCode || $event.which === tabCode) {
        $event.preventDefault();
        var s = $event.target.selectionStart;
        $event.target.value = $event.target.value.substring(0, $event.target.selectionStart)
          + "\t" + $event.target.value.substring($event.target.selectionEnd);
        $event.target.selectionEnd = s + 1;
      }
    };

    $scope.chatClick = function () {
      amplitude.getInstance().logEvent('Clicou em um chat');
    };

    function scrollChat() {
      var divChat = document.getElementById('mCSB_2');
      var heigth = (divChat) ? divChat.scrollHeight : 0;
      $(divChat).stop().animate({scrollTop: heigth}, '500', 'swing', function () {
      });
    };

    Chat.messages = Chat.messages ? _.map(Chat.messages, createType) : [];
    $scope.Chat = Chat;

    if ($scope.Chat.attendant) $rootScope.$broadcast("goToMyChatsTab");
    if ($stateParams.fromChatList) $rootScope.$broadcast("setAsRead", {chatId: $scope.Chat._id});

    $rootScope.$broadcast("removeNotificationForChat", Chat);
    $rootScope.$broadcast("refreshMyChats", Chat);
    $rootScope.$broadcast("selectedChat", Chat);

    function confirmReopenChat(chat, callback) {
      if (chat.isClosed) {
        generalUtils.onWarning(
          'Atenção', 'Você agora vai atender este cliente', 'CONFIRMAR', 'CANCELAR',
          function (confirm) {
            if (!confirm) return;

            callback();
          });
      } else if (!chat.isClosed) callback()
    }

    $scope.sendMessage = function () {
      amplitude.getInstance().logEvent('Clicou em enviar mensagem, Chat/view');
      var Message = Restangular.one('chat', $stateParams.id);

      if (_.isEmpty($scope.newMessage) || $scope.isSendMessage) return;

      confirmReopenChat($scope.Chat, function () {
        Message.content = $scope.newMessage;
        $scope.isSendMessage = true;

        Message.post().then(function (message) {
          $scope.isSendMessage = false;
          message = createType(message);
          //TODO: SOlução para não ficar com campo de data vazio
          message.dateCreate = new Date().toISOString();
          Chat.messages.push(message);

          if ($scope.Chat.isClosed) $rootScope.$broadcast('chatReopened', Chat);

          Chat.isClosed = false;
          $scope.newMessage = '';
          scrollChat();

          focus('messageSent');
          $rootScope.$emit('sendStaffMessage', message);
          $rootScope.$broadcast("refreshMyChats", Chat);

        }, function (err) {
          $scope.isSendMessage = false;
          $scope.isErrorSendMessage = true;
          $scope.isErrorSendMessageTimeout = false;
          $timeout(function () {
            $scope.isErrorSendMessage = false;
            $scope.isErrorSendMessageTimeout = true;
            focus('messageSent');

          }, 15000);
        });
      });
    };

    $scope.closeChat = function () {
      $scope.ctrl.disableChatButton = true;
      amplitude.getInstance().logEvent('Clicou em encerrar o chat');

      generalUtils.startLoader();
      var waitConfig = {
        content: 'Aguarde...',
        delay: 1500
      };

      var successConfig = {
        content: 'Você fechou essa conversa',
        delay: 2000
      };

      var errorConfig = {
        content: 'Erro ao fechar conversa',
        delay: 2000
      };

      toastHelper.toastSimple(waitConfig);

      Restangular.one('chat/' + $stateParams.id + '/close')
        .post()
        .then(function (message) {
          generalUtils.hideLoader();
          $scope.ctrl.disableChatButton = false;

          message = createType(message);
          //TODO: SOlução para não ficar com campo de data vazio
          message.dateCreate = new Date().toISOString();
          Chat.messages.push(message);
          Chat.lastMessage = message;
          Chat.isClosed = true;
          $scope.newMessage = '';
          scrollChat();

          $rootScope.$emit('refreshMyChats', message);
          toastHelper.toastSimple(successConfig);

          $rootScope.$broadcast("deselectedChat", Chat);
          $state.go('chat');

        }, function (err) {
          generalUtils.hideLoader();
          $scope.ctrl.disableChatButton = false;

          var config = {
            content: 'Não é possível encerrar um chat que já esteja encerrado ou que não possui mensagens.',
            delay: 15000
          };
          toastHelper.toastSimple(errorConfig);
        });
    };

    $scope.agendar = function (idCustomer) {
      $scope.ctrl.disableScheduleButton = true;
      amplitude.getInstance().logEvent('Clicou em agendar cliente, Chat/view');
      $state.go('schedulecreate', idCustomer);
    };

    $scope.cancel = function () {
      $rootScope.$broadcast("deselectedChat", Chat);
      amplitude.getInstance().logEvent('Clicou em fechar o chat, Chat/view');
      $state.go('chat');
    };

    $scope.openCustomerDetailsModal = function (size) {
      amplitude.getInstance().logEvent('Clicou em informações do cliente');
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/chat/customer-details-modal.html',
        controller: 'CustomerDetailsModalCtrl',
        size: 'lg',
        resolve: {
          Customer: [function () {
            return Restangular.one('customers', Chat.customer._id).get();
          }]
        }
      });
    };

    socket.on('newMessage', function (data) {
      var message = createType(data.payload);
      if ($state.params.id !== message.chatId) return;
      Chat.messages.push(message);
      Chat.lastMessage = data.payload;
      scrollChat();
    });

    setTimeout(function () {
      scrollChat()
    }.bind(this), 100);
  }

})();
