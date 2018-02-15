/**
 * Created by keyboard99 on 5/3/17.
 */
(function () {
  'use strict';

  angular.module('app')
    .factory('showNotifications', ['Notification', '$state', ShowNotifications]);

  function ShowNotifications(Notification, $state) {

    function show(status, payload) {
      if (!status || !payload) return;
      switch (status){
        case 'warning':
          Notification.info({
            message: 'Ligue para '+ payload.customer.fullname + ' em ' + payload.leftTime + ' minutos',
            onClick: function () {
              $state.go("schedulerequests.view", {id:payload._id});
            },
            delay: 7000
          });
          break;
        case 'danger':
          Notification.warning({
            message: 'Ligue para '+ payload.customer.fullname + ' em ' + payload.leftTime + ' minutos',
            onClick: function () {
              $state.go("schedulerequests.view", {id:payload._id});
            },
            delay: 7000
          });
          break;
        case 'now':
          Notification.error({
            message: '<b>ATENÇÃO!</b> Ligue para <b>' + payload.customer.fullname + '</b> agora',
            onClick: function () {
              $state.go("schedulerequests.view", {id:payload._id});
            },
            delay: 999999999
          });
          break
      }
    }
    return {
      show: show
    }
  }
})();

