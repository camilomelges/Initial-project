(function () {
  'use strict';

  angular.module('app')
    .constant('constantDomainAutomobi', 'automobi.com.br')
    .constant('permissions', {
      read: 'readData'
      , createCustomer: 'createCustomer'
      , createVehicle: 'createVehicle'
      , editVehicle: 'editVehicle'
      , createSchedule: 'createSchedule'
      , editSchedule: 'editSchedule'
      , changeScheduleStatus: 'changeScheduleStatus'
      , requestAnalysis: 'requestAnalysis'
      , uploadServices: 'uploadServices'
      , createEmployee: 'createEmployee'
      , readEmployee: 'readEmployee'
      , readSurvey: 'readSurvey'
      , reportBug: 'reportBug'
      , bugs: 'bugs'
      , metabase: 'metabase'
      , faq: 'faq'
      , updateEmployee: 'updateEmployee'
      , destroyEmployee: 'destroyEmployee'
      , createPartner: 'createPartner'
      , readPartner: 'readPartner'
      , updatePartner: 'updatePartner'
      , destroyPartner: 'destroyPartner'
      , viewRules: 'viewRules'
      , settings: 'settings'
      , importCustomers: 'importCustomers'
      , manager: 'MANAGER'
      , consultant: 'CONSULTANT'
      , clerk: 'CLERK'
      , director: 'DIRECTOR'
      , techSupport: 'TECH-SUPPORT'
    })
    .constant('timezonesBrazil', [
      'America/Sao_Paulo',
      'America/Campo_Grande',
      'America/Manaus',
      'America/Cuiabá',
      'America/Bahia',
      'America/Maceio',
      'America/Recife',
      'America/Noronha',
      'America/Fortaleza',
      'America/Belem',
      'America/Porto_Velho',
      'America/Rio_Branco'
    ])
    .factory('generalUtils', ['$rootScope', 'constantDomainAutomobi', '$state', 'environment', appConfig])
    .factory('permissionHelper', ['PermPermissionStore', 'permissions', permissionHelper])
    .factory('toastHelper', ['$rootScope', '$mdToast', toastHelper])
    .factory('focus', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
      return function (name) {
        $timeout(function () {
          $rootScope.$broadcast('focusOn', name);
        });
      }
    }]);

  function toastHelper($rootScope, $mdToast) {
    var lastPositionToast = {
      bottom: false,
      top: true,
      left: false,
      right: true
    }
      , toastPosition = angular.extend({}, lastPositionToast)
      , getToastPosition = function () {
      sanitizePosition();

      return Object.keys(toastPosition)
        .filter(function (pos) {
          return toastPosition[pos];
        })
        .join(' ');
    };
    var isShowingBadSocketToast = false;

    function sanitizePosition() {
      var current = toastPosition;

      if (current.bottom && lastPositionToast.top) current.top = false;
      if (current.top && lastPositionToast.bottom) current.bottom = false;
      if (current.right && lastPositionToast.left) current.left = false;
      if (current.left && lastPositionToast.right) current.right = false;

      lastPositionToast = angular.extend({}, current);
    }


    function toastAction(config) {
      return $mdToast.show($mdToast.simple({
          content: config.content,
          theme: config.theme ? config.theme : 'default',
          position: getToastPosition(),
          hideDelay: config.delay,
          highlightAction: true,
          action: config.actionText
        })
      );
    }

    function toastSimple(config) {
      return $mdToast.show($mdToast.simple({
          content: config.content,
          theme: config.theme ? config.theme : 'default',
          position: getToastPosition(),
          hideDelay: config.delay
        })
      );
    }

    function toastBadSocketConnection() {
      if (!isShowingBadSocketToast) {
        var config = {
          content: 'Não há conexão com a internet, tentando conexão...',
          delay: 0,
          theme: 'default'
        };
        toastSimple(config).then(function () {
          isShowingBadSocketToast = true;
        });
      }
    }

    function toastConnectionSuccessful() {
      var config = {
        content: 'Conectado com sucesso!',
        delay: 3000,
        theme: 'success-toast'
      };
      toastSimple(config).then(function () {
        isShowingBadSocketToast = false;
      });
    }

    return {
      toastAction: toastAction,
      toastSimple: toastSimple,
      toastBadSocketConnection: toastBadSocketConnection,
      toastConnectionSuccessful: toastConnectionSuccessful
    }
  }

  function appConfig($rootScope, localStorageService, constantDomainAutomobi, $state) {

    function alert(title, text, confirmTextBtn, cancelTextBtn, callback) {
      swal({
        title: title,
        text: text,
        type: "warning",
        showCancelButton: !_.isEmpty(cancelTextBtn),
        confirmButtonText: confirmTextBtn,
        confirmButtonColor: "#DD6B55",
        cancelButtonText: cancelTextBtn,
        cancelButtonColor: "#eee",
        allowOutsideClick: "true"
      }, function (isConfirm) {
        callback(isConfirm);
      })
    }

    function onError(title, text, confirmTextBtn, callback) {
      swal({
        title: title,
        text: text,
        type: "error",
        confirmButtonText: confirmTextBtn,
        confirmButtonColor: "#008ac7",
        allowOutsideClick: "false"
      }, function (isConfirm) {
        callback(isConfirm);
      })
    }

    function onSuccess(title, text, confirmTextBtn, cancelTextBtn, callback) {
      swal({
        title: title,
        text: text,
        type: "success",
        showCancelButton: !_.isEmpty(cancelTextBtn),
        confirmButtonText: confirmTextBtn,
        confirmButtonColor: "#008ac7",
        cancelButtonText: cancelTextBtn,
        cancelButtonColor: "#eee",
        allowOutsideClick: false,
        closeOnConfirm: true,
        closeOnCancel: false
      }, function (isConfirm) {
        callback(isConfirm);
      });
    }

    function onWarning(title, text, confirmTextBtn, cancelTextBtn, callback) {
      swal({
        title: title,
        text: text,
        type: "warning",
        showCancelButton: !_.isEmpty(cancelTextBtn),
        confirmButtonText: confirmTextBtn,
        confirmButtonColor: "#008ac7",
        cancelButtonText: cancelTextBtn,
        cancelButtonColor: "#eee",
        closeOnConfirm: true,
        closeOnCancel: true
      }, function (isConfirm) {
        callback(isConfirm);
      });
    }

    function startLoader() {
      $rootScope.$broadcast('preloader:active');
    }

    function hideLoader() {
      $rootScope.$broadcast('preloader:hide');
    }
  }

  function permissionHelper(PermPermissionStore, permissions) {

    var p = permissions;

    function getRoles() {
      return [{
        name: 'Gerente',
        identifier: p.manager
      }, {
        name: 'Consultor',
        identifier: p.consultant
      }, {
        name: 'Atendente',
        identifier: p.clerk
      }, {
        name: 'Diretor',
        identifier: p.director
      }, {
        name: 'Suporte Automobi',
        identifier: p.techSupport
      }];
    }

    function getRoleName(identifier) {
      switch (identifier) {
        case p.manager:
          return 'Gerente';
        case p.techSupport:
          return 'Suporte Automobi';
      }
    }

    function setRole(authentication) {
      if (!authentication) return;
      var role = authentication.role;

      var allPermissions = [p.read, p.createCustomer, p.createVehicle, p.editVehicle, p.createSchedule, p.changeScheduleStatus, p.editSchedule, p.requestAnalysis, p.createEmployee, p.readEmployee, p.updateEmployee, p.destroyEmployee, p.createPartner, p.readPartner, p.updatePartner, p.destroyPartner, p.settings, p.uploadServices, p.viewRules, p.importCustomers, p.readSurvey, p.reportBug, p.bugs, p.faq, p.metabase];
      var permissionsArray = [];
      switch (role) {
        case p.manager:
          permissionsArray = [p.read, p.createCustomer, p.createVehicle, p.editVehicle, p.createSchedule, p.changeScheduleStatus, p.editSchedule, p.requestAnalysis, p.createEmployee, p.readEmployee, p.updateEmployee, p.destroyEmployee, p.settings, p.readSurvey, p.reportBug, p.faq];
          break;
        case p.techSupport:
          permissionsArray = allPermissions;
          break;
      }
    }
  }

})();
