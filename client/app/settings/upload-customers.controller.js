/**
 * Created by atomicavocado on 22/11/16.
 */
(function () {
  'use strict';

  angular.module('app')
    .controller('CustomersUploadCtrl', ['$scope', 'Restangular', 'generalUtils', '$state', 'Customers', 'toastHelper', 'localStorageService', CustomersUploadCtrl]);

  function CustomersUploadCtrl($scope, Restangular, generalUtils, $state, Customers, toastHelper, localStorageService) {

    $scope.ctrl = {
      customers: Customers,
      clientCSVExample: 'https://s3-sa-east-1.amazonaws.com/automobi-public/crm/Modelo+de+CSV+para+importar+Clientes.xlsx'
    };

    $scope.$watch('file', function (file) {
      if (file) {
        $scope.file = file;
      }
    });

    $scope.upload = function () {
      if ($scope.file && !$scope.file.$error) {
        if ($scope.file.type == 'text/csv' || ($scope.file.type == 'application/vnd.ms-excel' && generalUtils.getExtFile($scope.file) == 'csv'))
          handlePostCSV($scope.file);
        else
          generalUtils.convertFileToBinaryData([$scope.file], function (err, data) {
            binaryToCSV(data, function (err, csvFile) {
              handlePostCSV(csvFile);
            });
          });
      } else {
        handleErrorCSV();
      }
    };

    function binaryToCSV(data, callback) {
      var workbook = XLSX.read(data, {type: 'binary'});
      workbook.SheetNames.forEach(function (sheetName) {
        var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        if (csv.length > 0)
          return callback(null, csv);

        return callback('Cannot generate CSV');
      });
    }

    function handlePostCSV(csvContent) {
      var payload = new FormData();
      payload.append('file', csvContent);

      generalUtils.startLoader();

      var authentication = localStorageService.get('authentication');
      Restangular.all('analysis')
        .withHttpConfig({transformRequest: angular.identity})
        .customPOST(payload, undefined, undefined, {
          'Content-Type': undefined,
          'authorization': authentication.token,
          'branch': authentication.branch,
          'partner': authentication.partner
        })
        .then(function (res) {
          var config = {
            content: 'Clientes importados com sucesso! \n Analisando...'
          };
          toastHelper.toastSimple(config);
        }, function (err) {
          generalUtils.hideLoader();
          generalUtils.onError('Ops', 'Houve um problema ao enviar seu arquivo, veja se ele está no formato correto e tente novamente', 'OK', function (isConfirm) {

          })
        });
    }

    function handleErrorCSV() {
      generalUtils.onError('Ops', 'Arquivo vazio, selecione um arquivo e tente novamente', 'OK', function (isConfirm) {

      });
    }

    $scope.openModal = function (size) {
      generalUtils.alert('Atenção', 'Os campos em amarelo são obrigatórios.', 'BAIXAR MODELO', '', function (isConfirm) {
        if (isConfirm) {
          window.location.href = $scope.ctrl.clientCSVExample;
        }
      });
    };

  }
})();
