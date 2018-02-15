(function () {
  'use strict';

  angular.module('app')
    .constant('constantDomainAutomobi', 'automobi.com.br')
    .constant('constantScheduleStatus', [
      "service",
      "finished",
      "canceled"
    ])
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
    .constant('scheduleReasons', [
      {name: 'Caiu direto na caixa postal', status: 'voicemail'},
      {name: 'Chama chama, não atende', status: 'no-answer'},
      {name: 'Cliente pediu para ligar depois', status: 'call-later'},
      {name: 'Cliente desistiu de agendar', status: 'client-gave-up'},
      {name: 'Cliente já executou o serviço', status: 'already-scheduled'},
      {name: 'Esse telefone não existe', status: 'nonexistent-phone'},
      {name: 'Não quer agendar agora', status: 'not-now'}
    ])
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
    .constant('originList', [
      {name: 'Aplicativo', value: 'Aplicativo'},
      {name: 'Apontador', value: 'Apontador'},
      {name: 'CRM', value: 'CRM'},
      {name: 'CRM - Chat', value: 'CRM - Chat'},
      {name: 'E-mail', value: 'E-mail'},
      {name: 'Régua de Relacionamento - E-mail', value: 'Régua de Relacionamento - E-mail'},
      {name: 'Régua de Relacionamento - Facebook', value: 'Régua de Relacionamento - Facebook'},
      {name: 'Régua de Relacionamento - Ligação automática', value: 'Régua de Relacionamento - Ligação automática'},
      {name: 'Régua de Relacionamento - SMS', value: 'Régua de Relacionamento - SMS'},
      {name: 'Régua de Relacionamento - Telefone', value: 'Régua de Relacionamento - Telefone'},
      {name: 'Régua de Relacionamento - Whatsapp', value: 'Régua de Relacionamento - Whatsapp'}
    ])
    .factory('generalUtils', ['$rootScope', 'localStorageService', 'constantDomainAutomobi', '$state', 'environment', appConfig])
    .factory('permissionHelper', ['PermPermissionStore', 'permissions', 'localStorageService', permissionHelper])
    .factory('toastHelper', ['$rootScope', '$mdToast', toastHelper])
    .directive('hashGenerate', function () {

      function setCaretPosition(elem, caretPos) {
        if (elem !== null) {
          setTimeout(function () {
            if (elem.createTextRange) {
              var range = elem.createTextRange();
              range.collapse(true);
              range.moveEnd('character', caretPos);
              range.moveStart('character', caretPos);
              range.select();
            } else if (elem.setSelectionRange) {
              elem.focus();
              elem.setSelectionRange(caretPos, caretPos);
            }
          }, 1);

        }
      }

      return {
        scope: {value: '=ngModel'},
        link: function (scope, element, attrs) {
          element.bind("keydown", function (e) {
            if (e.keyCode == 13)
              setCaretPosition(element[0], scope.value.length);
          });
          scope.$watch('value', function (newValue, oldValue) {
            // TODO validar este bloco {if##}
            var pattValidator = new RegExp(/##/g);
            if (pattValidator.test(newValue) && !(oldValue.length == 3 && newValue.length == 2)) {
              scope.value = newValue + '##';
              setCaretPosition(element[0], scope.value.length - 2);
            }
          });
        }
      };
    })
    .directive('focusOn', [function () {
      return {
        link: function (scope, elem, attr) {
          scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
              elem[0].focus();
            }
          });
        }
      };
    }])
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


    function verifyEmailStaff() {
      var localStorageDisplayables = localStorageService.get('displayables');
      if (!localStorageDisplayables.email) {
        localStorageService.clearAll();
        onError(
          'Aviso',
          'Não foi possível encontrar seu e-mail, faça o login novamente, para atualizar.',
          'Fazer login',
          function () {
            $state.go('login');
          });
        return;
      }

      return localStorageDisplayables.email.includes(constantDomainAutomobi);
    }

    function generateYearsStringByMonth(months) {
      if (!months) return;
      if (months < 12) return months + ' meses';
      if (months === 12) return '1 ano';
      months = (months / 12).toString().split('.');
      if (months[1]) return months[0] + ' anos e ' + increaseFloatToNextNumber(months[1]) + ' meses';
      else return months + ' anos';
    };

    function getVehicleImage (environment, vehicle) {
      if (!vehicle) return;
      var modelId = vehicle.idName,
        specificationId = vehicle.idSpecification;

      return environment.get().apiMobile + '/public/models/' + modelId + '/specifications/' +
        specificationId + '/image';
    }

    function increaseFloatToNextNumber(number) {
      number.split('.');
      if (number[2] >= 6) return parseInt(number[0]) + 1;
      return number[0];
    };

    function formatPhone(phone) {
      if (!phone || phone == "") return;

      if (phone.substring(0, 1) == "(")
        return phone;


      var aux1 = phone.substring(0, 2);
      var aux2 = phone.substring(2, 7);
      var aux3 = phone.substring(7, 12);

      return '(' + aux1 + ')' + ' ' + aux2 + ' ' + aux3;
    }

    function formatCPF(cpf) {
      if (!cpf)
        return '';

      if (cpf.substring(3, 4) == ".")
        return cpf;

      var aux1 = cpf.substring(0, 3);
      var aux2 = cpf.substring(3, 6);
      var aux3 = cpf.substring(6, 9);
      var aux4 = cpf.substring(9, 11);
      return aux1 + '.' + aux2 + '.' + aux3 + '-' + aux4;
    }

    function formatCNPJ(cnpj) {
      if (!cnpj)
        return '';

      if (cnpj.substring(2, 3) == ".")
        return cnpj;

      var aux1 = cnpj.substring(0, 2);
      var aux2 = cnpj.substring(2, 5);
      var aux3 = cnpj.substring(5, 8);
      var aux4 = cnpj.substring(8, 12);
      var aux5 = cnpj.substring(12, 14);

      return aux1 + '.' + aux2 + '.' + aux3 + '/' + aux4 + '-' + aux5;
    }

    function formatCPForCNPJ(doc) {
      if (!doc)
        return '';

      if (doc.substring(3, 4) == ".")
        return doc;

      if (doc.substring(2, 3) == ".")
        return doc;

      if (doc.length == 11)
        return formatCPF(doc);


      return formatCNPJ(doc);
    }


    function checkIfIsCpfOrCnpj ( value ) {
      if(!value) return ;

      value = value.toString();
      value = value.replace(/[^0-9]/g, '');

      if ( value.length === 11 ) return 'cpf';
      if ( value.length === 14 ) return 'cnpj';
    }

    function moveArrayElementFromTo(array, from, to) {
      if (!array || from === undefined || to === undefined){
        console.error('required parameters not informed');
        return [];
      }
      var copyArray = angular.copy(array);
      copyArray.splice(to,0,copyArray.splice(from,1)[0]);

      return copyArray;
    }

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

    function splitFullName(fullName, callback) {
      if (!fullName) callback(['', '']) ;
      var splitName = fullName.split(' ');
      var firstName = splitName[0];
      var lastName = splitName.length > 0 ? splitName.slice(1, splitName.length).join(' ') : '';
      callback([firstName, lastName]);
    }

    function concatFullName(splitName) {
      return splitName[0] + ' ' + splitName[1];
    }

    function validatePlate(plate) {
      if (!plate || plate.substring(3, 4) == '-')
        return;

      var firstPlate = plate.substring(0, 3);
      var secondPlate = plate.substring(3);
      return firstPlate + "-" + secondPlate;
    }

    function validateKilometer(km) {
      if (!km) return 0;

      return parseInt(km);

    }

    function formatInspections(time) {
      return "Revisão de " + time + " quilometros";
    }

    function validateYear(year) {
      return parseInt(year);

    }

    function startLoader() {
      $rootScope.$broadcast('preloader:active');
    }

    function hideLoader() {
      $rootScope.$broadcast('preloader:hide');
    }

    function typePerson(doc) {
      if (!doc || doc == "") return '';

      if (doc.length == 14)
        return 'Física';


      return 'Jurídica';

    }

    function typeDoc(doc) {
      if (!doc || doc === '') return '';

      if (doc.length == 14)
        return 'CPF';

      return 'CNPJ';
    }

    function typeDate(doc) {
      if (!doc || doc == "") return '';

      if (doc.length == 14)
        return 'Data de aniversário';

      return 'Data de criação';
    }

    function isNumber(str) {
      return /^\d+$/.test(str);
    }

    //DateType must be a String of one of 3 options: "birthdate", "foundation", "scheduling"
    function dateIsValid(dateString, dateType, hour) {

      if (_.isEmpty(dateString)) return false;

      if (_.isEmpty(hour)) {
        var date = moment(dateString, 'DD/MM/YYYY');
      } else {
        var date = moment(dateString + hour, 'DD/MM/YYYYHH:mm');
      }


      if (!date.isValid()) {
        return false
      }

      var currentDate = moment();

      var preciseDiff = moment.preciseDiff(date, currentDate, true);

      switch (dateType) {
        case 'scheduling':
          if (preciseDiff.firstDateWasLater && preciseDiff.years == 0 && preciseDiff.months < 6) {
            return true
          } else {
            return false
          }
          break;
        case 'foundation':
          if (!preciseDiff.firstDateWasLater) {
            return true
          } else {
            return false
          }
          break;
        case 'birthdate':
          if (!preciseDiff.firstDateWasLater && preciseDiff.years >= 18 && preciseDiff.years <= 150) {
            return true
          } else {
            false
          }
        default:
          return false;
      }

    }

    function breakIntervalInMinutes(startHour, endHour, interval) {
      if (!startHour || !endHour || !interval) return [];

      var dayString = '28-03-1990 ';
      var start = moment(dayString + startHour, 'DD-MM-YYYY HH:mm');
      var end = moment(dayString + endHour, 'DD-MM-YYYY HH:mm');
      var result = [];

      while (start <= end) {
        result.push(start.format('HH:mm'));
        start.add(interval, 'minutes');
      }

      return result;
    }

    function formatDateSchedule(d) {
      if (d.substring(4, 5) == '-')
        return;

      var date = d.split('/');
      return date[2] + '-' + date[1] + '-' + date[0];
    }

    function convertFileToBinaryData(files, callback) {
      for (var i = 0, f = files[i]; i != files.length; ++i) {
        var reader = new FileReader();
        var data;
        reader.onload = function (e) {
          if (!e) {
            data = reader.content;
          } else {
            data = e.target.result;
          }

          callback(null, data)
        };

        //extend FileReader
        if (!FileReader.prototype.readAsBinaryString) {
          FileReader.prototype.readAsBinaryString = function (fileData) {
            var binary = "";
            var pt = this;
            var reader = new FileReader();
            reader.onload = function (e) {
              var bytes = new Uint8Array(reader.result);
              var length = bytes.byteLength;
              for (var i = 0; i < length; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              //pt.result  - readonly so assign binary
              pt.content = binary;
              $(pt).trigger('onload');
            };
            reader.readAsArrayBuffer(fileData);
          }
        }

        reader.readAsBinaryString(f);

      }
    }

    function getExtFile(file) {
      var regexExt = /(?:\.([^.]+))?$/;
      return regexExt.exec(file.name)[1];
    }


    function generateTimeOptions(BranchSettings) {
      if (!BranchSettings.startTime && !BranchSettings.endTime && !BranchSettings.interval) return [];

      return breakIntervalInMinutes(BranchSettings.startTime
        , BranchSettings.endTime
        , BranchSettings.interval);
    }

    function capitalizeString(string) {
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    return {
      formatPhone: formatPhone,
      formatCPF: formatCPF,
      formatCNPJ: formatCNPJ,
      checkIfIsCpfOrCnpj: checkIfIsCpfOrCnpj,
      alert: alert,
      generateYearsStringByMonth: generateYearsStringByMonth,
      getVehicleImage: getVehicleImage,
      onSuccess: onSuccess,
      onError: onError,
      onWarning: onWarning,
      splitFullName: splitFullName,
      startLoader: startLoader,
      hideLoader: hideLoader,
      validatePlate: validatePlate,
      validateKilometer: validateKilometer,
      validateYear: validateYear,
      concatFullName: concatFullName,
      typePerson: typePerson,
      formatCPForCNPJ: formatCPForCNPJ,
      isNumber: isNumber,
      moveArrayElementFromTo: moveArrayElementFromTo,
      formatInspections: formatInspections,
      dateIsValid: dateIsValid,
      breakIntervalInMinutes: breakIntervalInMinutes,
      formatDateSchedule: formatDateSchedule,
      typeDoc: typeDoc,
      typeDate: typeDate,
      convertFileToBinaryData: convertFileToBinaryData,
      getExtFile: getExtFile,
      generateTimeOptions: generateTimeOptions,
      capitalizeString: capitalizeString,
      verifyEmailStaff: verifyEmailStaff
    }

  }

  function permissionHelper(PermPermissionStore, permissions, localStorageService) {

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
          break;
        case p.consultant:
          return 'Consultor';
          break;
        case p.clerk:
          return 'Atendente';
          break;
        case p.director:
          return 'Diretor';
          break;
        case p.techSupport:
          return 'Suporte Automobi';
          break;
      }
    }

    function setRole(authentication, displayables) {
      if (!authentication) return;
      var role = authentication.role;

      var allPermissions = [p.read, p.createCustomer, p.createVehicle, p.editVehicle, p.createSchedule, p.changeScheduleStatus, p.editSchedule, p.requestAnalysis, p.createEmployee, p.readEmployee, p.updateEmployee, p.destroyEmployee, p.createPartner, p.readPartner, p.updatePartner, p.destroyPartner, p.settings, p.uploadServices, p.viewRules, p.importCustomers, p.readSurvey, p.reportBug, p.bugs, p.faq, p.metabase];
      var permissionsArray = [];
      switch (role) {
        case p.manager:
          permissionsArray = [p.read, p.createCustomer, p.createVehicle, p.editVehicle, p.createSchedule, p.changeScheduleStatus, p.editSchedule, p.requestAnalysis, p.createEmployee, p.readEmployee, p.updateEmployee, p.destroyEmployee, p.settings, p.readSurvey, p.reportBug, p.faq];
          break;
        case p.consultant:
          permissionsArray = [p.read, p.changeScheduleStatus, p.editSchedule, p.reportBug, p.faq];
          break;
        case p.clerk:
          permissionsArray = [p.read, p.createCustomer, p.createVehicle, p.createSchedule, p.changeScheduleStatus, p.editSchedule, p.reportBug, p.faq];
          break;
        case p.director:
          permissionsArray = [p.read, p.createCustomer.editSchedule, p.createVehicle, p.editVehicle, p.createSchedule, p.changeScheduleStatus, p.editSchedule, p.requestAnalysis, p.createEmployee, p.readEmployee, p.updateEmployee, p.destroyEmployee, p.settings, p.readSurvey, p.reportBug, p.faq];
          if (displayables) {
            if (displayables.partnerName === 'Lince Toyota')
              permissionsArray.push(p.viewRules);
          }

          break;
        case p.techSupport:
          permissionsArray = allPermissions;
          break;
      }
      PermPermissionStore.defineManyPermissions(allPermissions, /*@ngInject*/ function (permissionName) {
        return _.includes(permissionsArray, permissionName);
      });

    }

    return {
      setRole: setRole
      , getRoles: getRoles
      , getRoleName: getRoleName
    };
  }

})();
