(function () {
  'use strict';

  angular.module('environment', [])
    .factory('environment', [Environment]);

  function Environment() {

    function get() {

      switch (window.location.hostname) {

        case 'localhost':
          return {
            socket: 'https://staging.automobi.com.br',
            sla: 'https://staging.automobi.com.br/sla',
            apiMobile: 'https://staging.automobi.com.br/api-mobile'

            // socket: 'http://localhost:5555',
            // sla: 'http://localhost:3344',
            // apiMobile: 'http://localhost:3333'
          };

        case 'dev.crm.automobi.com.br':
          return {
            socket: 'https://staging.automobi.com.br',
            sla: 'https://staging.automobi.com.br/sla',
            apiMobile: 'https://staging.automobi.com.br/api-mobile'
          };

        case 'crm.automobi.com.br':
          return {
            socket: 'https://prod.socket.automobi.com.br',
            sla: 'https://prod.socket.automobi.com.br/sla',
            apiMobile: 'https://app.automobi.com.br/api-mobile'
          };

        default:
          return {
            socket: 'https://staging.automobi.com.br',
            sla: 'https://staging.automobi.com.br/sla',
            apiMobile: 'https://staging.automobi.com.br/api-mobile'
          };
      }
    }

    return {
      get: get
    }
  }
})();
