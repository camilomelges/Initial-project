(function() {
  'use strict';

  angular.module('app')
    .controller('CustomerImportCtrl', ['$scope', '$rootScope', 'Restangular', 'generalUtils', '$analytics', 'permissions', 'toastHelper', 'localStorageService', CustomerImportCtrl]);

  function CustomerImportCtrl($scope, $rootScope, Restangular, generalUtils, $analytics, permissions, toastHelper, localStorageService) {
    amplitude.getInstance().logEvent('Entrou na página de importação de clientes');
    $scope.$watch('file', function(file) {
      if (file) {
        $scope.file = file;
        $scope.upload();
      } else {
        $scope.hasClients = false;
      }
    });

    $scope.importPlanilha = function() {
      amplitude.getInstance().logEvent('Clicou no botão de importar planilha');
    };

    $scope.downloadPlanilha = function() {
      amplitude.getInstance().logEvent('Clicou no botão de download de planilha');
    };

    $scope.upload = function() {
      if ($scope.file && !$scope.file.$error) {
        if ($scope.file.type === 'text/csv' || ($scope.file.type === 'application/vnd.ms-excel' && generalUtils.getExtFile($scope.file) === 'csv')) {
          handlePostCSV($scope.file);
        } else
          generalUtils.convertFileToBinaryData([$scope.file], function(err, data) {
            binaryToCSV(data, function(err, csvFile) {
              handlePostCSV(csvFile);
            });
          });
      } else {
        handleErrorCSV();
      }
    };

    function binaryToCSV(data, callback) {
      var workbook = XLSX.read(data, {
        type: 'binary'
      });
      workbook.SheetNames.forEach(function(sheetName) {
        var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        if (csv.length > 0) {
          return callback(null, csv);
        }

        return callback('Cannot generate CSV');
      });
    }

    function handlePostCSV(csvContent) {
      var payload = new FormData();
      payload.append('file', csvContent);

      generalUtils.startLoader();

      var config = {
        content: 'Importando clientes...'
      };
      toastHelper.toastSimple(config);

      var authentication = localStorageService.get('authentication');

      Restangular.all('customers/uploadsheet')
        .withHttpConfig({
          transformRequest: angular.identity
        })
        .customPOST(payload, undefined, undefined, {
          'Content-Type': undefined,
          'authorization': authentication.token,
          'branch': authentication.branch,
          'partner': authentication.partner
        })
        .then(function(res) {}, function(err) {
          generalUtils.onError('Ops',
            'Houve um problema ao enviar seu arquivo, veja se ele está no formato correto e tente novamente',
            'OK',
            function(isConfirm) {

            })
        });
    }

    $rootScope.$on('analysisComplete', function(event, data) {
      generalUtils.hideLoader();
      $scope.listClients = data.clients;
      $scope.listClientsErr = data.clientsErr;
      var config = {
        content: 'Clientes importados!',
        delay: 1000,
        theme: 'success-toast'
      };
      toastHelper.toastSimple(config);
    });

    function handleErrorCSV() {
      generalUtils.onError('Ops', 'Arquivo vazio, selecione um arquivo e tente novamente', 'OK', function(isConfirm) {});
    }
  }
})();
