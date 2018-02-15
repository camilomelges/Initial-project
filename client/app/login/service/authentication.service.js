(function () {
  'use strict';

  angular.module('app')
    .factory('authService', ['Restangular', '$q', 'localStorageService', '$rootScope', AuthService]);

  function AuthService(Restangular, $q, localStorageService, $rootScope) {
    function loginFn(credentials) {
      var deferred = $q.defer();

      Restangular.all('staffs/login')
        .post(credentials)
        .then(function (data) {
            return deferred.resolve(data);
          },
          function (err) {
            return deferred.reject(err);
          });

      return deferred.promise;
    }

    function logoffFn() {
      $rootScope.$emit('logOff');
      localStorageService.clearAll();
    }

    function verifyUser() {
      var authentication = localStorageService.get('authentication');

      if (!_.isEmpty(authentication))
        return authentication;
      else
        return null;
    }

    function updateConfigs(configs, callback) {
      if (!verifyUser()) return logoffFn();

      Restangular.all('staffs/configs')
        .customPUT(configs)
        .then(function (data) {
          data = data.plain();

          callback(null, data);
        })
        .catch(callback);
    }

    return {
      login: loginFn,
      logoff: logoffFn,
      verifyUser: verifyUser,
      updateConfigs: updateConfigs
    }
  }

})();
