(function () {
  'use strict';

  angular.module('app')
    .constant('chatTypeStrings', {
      OPEN_CHATS_STRING: 'openChats',
      MY_CHATS_STRING: 'myChats',
      CLOSED_CHATS_STRING: 'closedChats'
    })
    .controller('ChatCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'Restangular', 'localStorageService',
      'OpenChats', 'MyChats', 'ClosedChats', 'generalUtils', 'chatTypeStrings', 'socket', listChatCtrl]);


  function listChatCtrl($rootScope, $scope, $state, $stateParams, Restangular, localStorageService,
                        OpenChats, MyChats, ClosedChats, generalUtils, chatTypeStrings, socket) {

    amplitude.getInstance().logEvent('Entrou na tela Chat/list');

    $scope.ctrl = {
      openChatString: chatTypeStrings.OPEN_CHATS_STRING,
      myChatString: chatTypeStrings.MY_CHATS_STRING,
      closedChatString: chatTypeStrings.CLOSED_CHATS_STRING,
      activeTab: 'openChats'
    };

    $scope.openChats = _.map(angular.copy(OpenChats), generateLastMsg);
    $scope.myChats = _.map(angular.copy(MyChats), generateLastMsg);
    $scope.closedChats = _.map(angular.copy(ClosedChats), generateLastMsg);

    function markAsRead(id, listType, callback) {
      var chat = Restangular.one('chat/' + id + '/setRead');
      chat.readInCRM = true;
      chat.put().then(function () {
        refreshListChats(listType, function () {
          if (callback && typeof callback === 'function') callback();
        });
      });
    };

    function confirmChatOpen(listType, callback) {
      if (listType === chatTypeStrings.OPEN_CHATS_STRING) {
        generalUtils.onWarning(
          'Atenção', 'Você agora vai atender este cliente', 'CONFIRMAR', 'CANCELAR',
          function (confirm) {
            if (!confirm) return;

            callback();
          });
      }
      else callback();
    }

    $scope.openChat = function (chatId, listType) {
      confirmChatOpen(listType, function () {
        generalUtils.startLoader();
        markAsRead(chatId, listType, function () {
          $scope.ctrl.activeTab = chatTypeStrings.MY_CHATS_STRING;
          generalUtils.hideLoader();
          $state.go('chat.view', {id: chatId})
        });
      });
    };

    function checkMarkChatAsRead(chat, callback) {
      if (!chat.attendant) {
        markAsRead(chat._id, chatTypeStrings.OPEN_CHATS_STRING, function () {
          callback();
        });
      }
      else callback();
    }

    if ($stateParams.fromChatDirective && $stateParams.chat) {
      var chat = $stateParams.chat;
      var listType = (chat.attendant)
        ? chatTypeStrings.MY_CHATS_STRING : chatTypeStrings.OPEN_CHATS_STRING;

      generalUtils.startLoader();
      checkMarkChatAsRead(chat, function () {
        $scope.refId = chat.id;
        $scope.ctrl.activeTab = listType;
        generalUtils.hideLoader();
        $state.go('chat.view', {id: chat._id})
      });
    }

    function scrollChat() {
      var divChat = document.getElementById('mCSB_conversation');
      if (!divChat) return;
      var heigth = divChat.scrollHeight;
      $(divChat).stop().animate({scrollTop: -heigth}, '500', 'swing', function () {
      });
    }

    $scope.showMessageWhenNotSelected = function () {
      return ($state.current.name === 'chat');
    };

    $scope.listIsEmpty = function (isClosed, listType) {
      switch (listType) {
        case chatTypeStrings.OPEN_CHATS_STRING:
          return (_.filter($scope.openChats, {isClosed: isClosed}).length === 0);
          break;

        case chatTypeStrings.MY_CHATS_STRING :
          return (_.filter($scope.myChats, {isClosed: isClosed}).length === 0);
          break;

        case chatTypeStrings.CLOSED_CHATS_STRING :
          return (_.filter($scope.closedChats, {isClosed: isClosed}).length === 0);
          break;
      }
    };

    function generateLastMsg(item) {
      if (!item || !item.lastMessage) return item;

      var maxlength = 125;

      if (item.lastMessage.content && item.lastMessage.content.length > maxlength)
        item.lastMessage.content = (item.lastMessage.content.substring(0, maxlength) + "...");

      if (_.has(item.lastMessage, 'question')) {
        item.lastMsg = 'Finalizado';
      } else {
        item.lastMsg = item.lastMessage ? item.lastMessage.content : "";
      }
      return item;
    }

    function refreshListChats(listType, callback) {
      switch (listType) {
        case chatTypeStrings.OPEN_CHATS_STRING:
          OpenChats.getList().then(function (chats) {
            $scope.openChats = _.map(chats, generateLastMsg);

            if (callback && typeof callback === 'function') callback();
          });
          break;

        case chatTypeStrings.MY_CHATS_STRING :
          MyChats.getList().then(function (chats) {
            $scope.myChats = _.map(chats, generateLastMsg);

            if (callback && typeof callback === 'function') callback();
          });
          break;

        case chatTypeStrings.CLOSED_CHATS_STRING :
          ClosedChats.getList().then(function (chats) {
            $scope.closedChats = _.map(chats, generateLastMsg);

            if (callback && typeof callback === 'function') callback();
          });
          break;
      }
    }

    $scope.clickOpenChats = function () {
      amplitude.getInstance().logEvent('Clicou em chats abertos, Chat/list');
      refreshListChats(chatTypeStrings.OPEN_CHATS_STRING)
    };

    $scope.clickMyChats = function () {
      amplitude.getInstance().logEvent('Clicou em meus chats, Chat/list');
      refreshListChats(chatTypeStrings.MY_CHATS_STRING)
    };

    $scope.clickClosedChats = function () {
      amplitude.getInstance().logEvent('Clicou em chats fechados, Chat/list');
      refreshListChats(chatTypeStrings.CLOSED_CHATS_STRING)
    };

    $rootScope.$on('goToMyChatsTab', function (event, data) {
      $scope.ctrl.activeTab = chatTypeStrings.MY_CHATS_STRING;
    });

    $rootScope.$on('setAsRead', function (event, data) {
      markAsRead(data.chatId);
      $rootScope.$broadcast('removeChatFromOtherAttendants');
      $rootScope.$broadcast('goToMyChatsTab');
    });

    $rootScope.$on('refreshMyChats', function (event, data) {
      setTimeout(function () {
        scrollChat()
      }.bind(this), 100);

      refreshListChats(chatTypeStrings.MY_CHATS_STRING);
    });

    $rootScope.$on('chatReopened', function (event, data) {
      setTimeout(function () {
        scrollChat()
      }.bind(this), 100);

      refreshListChats(chatTypeStrings.MY_CHATS_STRING, function () {
        $scope.ctrl.activeTab = chatTypeStrings.MY_CHATS_STRING;
      });
    });

    $rootScope.$on('selectedChat', function (event, data) {
      $scope.refId = $state.params.id;
    });

    $rootScope.$on('deselectedChat', function (event, data) {
      $scope.refId = undefined;
    });

    socket.on('newMessage', function (data) {
      ($state.params.id === data.payload.chatId)
        ? markAsRead(data.payload.chatId, chatTypeStrings.OPEN_CHATS_STRING)
        : refreshListChats(chatTypeStrings.OPEN_CHATS_STRING);

      if ($scope.ctrl.activeTab !== chatTypeStrings.OPEN_CHATS_STRING)
        refreshListChats($scope.ctrl.activeTab);

      setTimeout(function () {
        scrollChat()
      }.bind(this), 100);
    });

    socket.on('removeChatFromOtherAttendants', function (data) {
      var staffId = localStorageService.get('authentication').staff;
      if (data.payload.new) {
        var openChatIndex = $scope.openChats.indexOf(_.find($scope.openChats, function (chat) {
          return data.payload._id === chat._id;
        }));

        $scope.openChats.splice(openChatIndex, 1);
      }

      if (data.payload.closed) {
        var closedChatIndex = $scope.closedChats.indexOf(_.find($scope.closedChats, function (chat) {
          return data.payload._id === chat._id;
        }));
        $scope.closedChats.splice(closedChatIndex, 1);

        if (
          $state.params.id === data.payload._id
          && data.payload.attendant.toString() !== staffId.toString()
        ) $state.go('chat');
      }

      $rootScope.$broadcast("removeNotificationForChat", data.payload);
    });

    socket.on('chatSlaTimeout', function (data) {
      var staffId = localStorageService.get('authentication').staff;

      refreshListChats(chatTypeStrings.MY_CHATS_STRING, function () {
        if (data.payload.attendant && data.payload.attendant.toString() === staffId.toString()) {

          refreshListChats(chatTypeStrings.OPEN_CHATS_STRING, function () {

            if (
              $state.includes('chat.view')
              && data.payload._id
              && $state.params.id.toString() === data.payload._id.toString()
            ) {
              $state.go('chat');
              $scope.refId = undefined;
              $scope.ctrl.activeTab = chatTypeStrings.OPEN_CHATS_STRING;
            }
            ;

          })
        }
      });
    });

    $scope.$on('openedChatFromNotifications', function (data) {
      var staffId = localStorageService.get('authentication').staff;
      if (data.payload.new) {
        var openChatIndex = $scope.openChats.indexOf(_.find($scope.openChats, function (chat) {
          return data.payload._id === chat._id;
        }));

        $scope.openChats.splice(openChatIndex, 1);
      }

      if (data.payload.closed) {
        var closedChatIndex = $scope.closedChats.indexOf(_.find($scope.closedChats, function (chat) {
          return data.payload._id === chat._id;
        }));
        $scope.closedChats.splice(closedChatIndex, 1);

        if (
          $state.params.id === data.payload._id
          && data.payload.attendant.toString() !== staffId.toString()
        ) $state.go('chat');
      }

      $rootScope.$broadcast("removeNotificationForChat", data.payload);
    });
  }
})();
