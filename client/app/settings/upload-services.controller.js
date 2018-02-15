/**
 * Created by atomicavocado on 17/01/17.
 */
(function () {
  'use strict';

  angular.module('app')
    .controller('ServicesUploadCtrl', ['$scope', 'Restangular', 'generalUtils', '$state', 'Services', ServicesUploadCtrl]);

  function ServicesUploadCtrl($scope, Restangular, generalUtils, $state, Services) {

    $scope.ctrl = {
      servicesCSVExample: 'https://s3-sa-east-1.amazonaws.com/automobi-public/crm/Modelo+de+CSV+para+importar+Servicos.csv',
      services: _.map(Services, function (service) {
        service.revisions = service.revisions.split(';');
        return service;
      })
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
              handlePostCSV(csvFile)
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

    function handleErrorCSV() {
      generalUtils.onError('Ops', 'Arquivo vazio, selecione um arquivo e tente novamente', 'Confirmar', function (isConfirm) {

      });
    }

    function handlePostCSV(csvContent) {
      var payload = new FormData();
      payload.append('file', csvContent);

      generalUtils.startLoader();

      Restangular.all('service')
        .withHttpConfig({transformRequest: angular.identity})
        .customPOST(payload, undefined, undefined, {'Content-Type': undefined})
        .then(function (res) {
          generalUtils.hideLoader();
          generalUtils.onSuccess('Serviços enviados com sucesso!',
            '',
            'OK',
            '',
            function (isConfirm) {
              $state.reload();
            });
        }, function (err) {
          generalUtils.hideLoader();
          generalUtils.onError('Ops', 'Houve problemas ao enviar seu arquivo, veja se ele está no formato certo e tente novamente', 'Confirmar', function (isConfirm) {

          })
        });
    }
  }
})
();
