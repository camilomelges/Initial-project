(function () {
  'use strict';
  angular.module('app')
    .controller('CampaignCreateController', [
      '$rootScope',
      '$timeout',
      '$analytics',
      '$scope',
      'Campaign',
      'generalUtils',
      'localStorageService',
      'toastHelper',
      'Restangular',
      'PartnerLogo',
      'Upload',
      CampaignCreateController]);

  function CampaignCreateController($rootScope, $timeout, $analytics, $scope, Campaign, generalUtils, localStorageService, toastHelper, Restangular, PartnerLogo, Upload) {
    amplitude.getInstance().logEvent('Entrou na página nova campanha');
    $scope.displayPartner = localStorageService.get('displayables');
    $timeout(function () {
      $analytics.pageTrack('campaigns/create');
      $analytics.eventTrack('NovaCampanha')
    }, 20000);

    $scope.disableSaveButton = false;

    function resetPage() {
      $scope.Campaign = Restangular.copy(Campaign);
      $scope.ctrl = {
        emailEnabled: false,
        smsEnabled: false,
        notificationEnabled: false
      };
      $scope.hasClients = false;
      $scope.listClients = [];
      $scope.characterLimit = 100;
      $scope.titleNotificationLimit = 32;
      $scope.messageNotificationLimit = 90;
      $scope.Campaign.clients = [];
      $scope.listClientsErr = [];
      $scope.file = null;
      $scope.form = {email: {image: 'https://s3-sa-east-1.amazonaws.com/automobi-public/crm/img-email.png'}};
    }

    resetPage();

    $scope.partnerLogo = PartnerLogo.url || '';

    $scope.$watch('upload.image', function (file) {
      if (file) {
        $scope.upload.image = file;
        $scope.uploadImage();
      }
    });

    $scope.$watch('file', function (file) {
      if (file) {
        $scope.file = file;
        $scope.upload();
      } else {
        $scope.hasClients = false;
      }
    });

    $scope.uploadImage = function () {
      var opt = {
        url: 'https://automobi-public.s3.amazonaws.com',
        method: 'POST',
        data: {
          key: "email/campaigns/" + $scope.upload.image.name,
          AWSAccessKeyId: "AKIAIQTJAPVG6BQK4OIQ",
          acl: 'public-read',
          policy: 'ewogICJleHBpcmF0aW9uIjogIjIwMjUtMDEtMDFUMDA6MDA6MDBaIiwKICAiY29uZGl0aW9ucyI6IFsKICAgIHsiYnVja2V0IjogImF1dG9tb2JpLXB1YmxpYyJ9LAogICAgWyJzdGFydHMtd2l0aCIsICIka2V5IiwgImVtYWlsL2NhbXBhaWducy8iXSwKICAgIHsiYWNsIjogInB1YmxpYy1yZWFkIn0sCiAgICBbInN0YXJ0cy13aXRoIiwgIiRDb250ZW50LVR5cGUiLCAiIl0sCiAgICBbInN0YXJ0cy13aXRoIiwgIiRmaWxlbmFtZSIsICIiXSwKICAgIFsiY29udGVudC1sZW5ndGgtcmFuZ2UiLCAwLCA1MjQyODgwMDBdCiAgXQp9',
          signature: 'ATuz6S6moGvfMuBvzYirOaotVIU=',
          "Content-Type": $scope.upload.image.type != '' ? $scope.upload.image.type : 'application/octet-stream',
          filename: $scope.upload.image.name,
          file: $scope.upload.image
        }
      };
      var upload = Upload.upload(opt);
      $scope.upload.isUploading = true;
      upload.then(function (resp) {
        $scope.upload.isUploading = false;
        $scope.form.email.image = resp.config.url + '/' + opt.data.key;
        $scope.upload.error = '';
        $timeout(function () {
          $scope.upload.filename = '';
          $scope.upload.progress = 0;
        }, 3000);
      }, function (resp) {

        $scope.upload.isUploading = false;
        $scope.upload.filename = '';
        $scope.upload.progress = 0;
        $scope.upload.error = 'Falha ao enviar imagem.';

      }, function (evt) {
        $scope.upload.error = '';
        $scope.upload.filename = evt.config.data.file.name;
        $scope.upload.progress = parseInt(100.0 * evt.loaded / evt.total);

      });
    };

    $scope.upload = function () {
      if ($scope.file && !$scope.file.$error) {
        $scope.importSheetCustomerSelected = true;
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
      var workbook = XLSX.read(data, {
        type: 'binary'
      });
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
      Restangular.all('campaigns/clients/json')
        .withHttpConfig({
          transformRequest: angular.identity
        })
        .customPOST(payload, undefined, undefined, {
          'Content-Type': undefined,
          'authorization': authentication.token,
          'branch': authentication.branch,
          'partner': authentication.partner
        })
        .then(function (res) {
          var config = {
            content: 'Importando clientes...'
          };
          toastHelper.toastSimple(config);
        }, function (err) {
          generalUtils.hideLoader();
          generalUtils.onError('Ops',
            'Houve um problema ao enviar seu arquivo, veja se ele está no formato correto e tente novamente',
            'OK', function (isConfirm) {
            })
        });
    }
    function handleErrorCSV() {
      generalUtils.onError('Ops', 'Arquivo vazio, selecione um arquivo e tente novamente', 'OK', function (isConfirm) {
      });
    }

    $rootScope.$on('analysisComplete', function (e, attr) {
      generalUtils.hideLoader();
      var config = {
        content: 'Clientes importados!',
        delay: 1000,
        theme: 'success-toast'
      };
      toastHelper.toastSimple(config);
      setTimeout(function () {
        $scope.Campaign.clients = attr.clients;
        $scope.listClients = attr.clients;
        $scope.listClientsErr = attr.clientsErr;
        $scope.listTagsAvailable = Object.keys($scope.listClients[0]);

        $scope.listTagsAvailable = _.map($scope.listTagsAvailable, function (tag) {
          return '##' + tag + '##'
        });

        setTimeout(function () {
          scrollPage('listResult')
        }, 500);
      }, 500);
    });

    function scrollPage(divId) {
      var menu = $('.top-nav');
      setTimeout(function () {
        $('html, body').animate({
          scrollTop: $('#' + divId).offset().top - (menu.height() * 2.5)
        }, 500);
      }, 500);
    }

    function iterateClientes() {
      $scope.Campaign.clients = _.map($scope.Campaign.clients, function (client) {
        var clientContentUpdated = replaceTagForValue(client, $scope.form.email.content, 'content');
        var clientGreetingUpdated = replaceTagForValue(clientContentUpdated, $scope.form.email.greeting, 'greeting');
        var clientSubjectUpdated = replaceTagForValue(clientGreetingUpdated, $scope.form.email.subject, 'subject');
        var clientTitleUpdated = replaceTagForValue(clientSubjectUpdated, $scope.form.email.title, 'title');
        var clientImageUpdated = replaceTagForValue(clientTitleUpdated, $scope.form.email.image, 'image');
        return replaceTagForValue(clientImageUpdated, $scope.form.email.textButton, 'textButton');
      });
    }

    function replaceTagForValue(client, textValue, keyObject) {
      if (!textValue || textValue.length <= 0) {
        if (!client._emailValues) _.extend(client, {_emailValues: {}});
        client._emailValues[keyObject] = "";
        return client;
      }

      var pattSplit = /([##]+[A-z]+[##]+)/g;
      var words = textValue.split(pattSplit);
      var pattValidator = new RegExp(/([##])+([A-z])+([##])+/g);

      if (words && pattValidator.test(words))
        words = _.map(words, function (word) {
          var tag = _.find($scope.listTagsAvailable, function (tag) {
            return tag == word;
          });

          if (!tag) return word;

          tag = tag.split('##');
          if (tag[1]) return generalUtils.capitalizeString(String(client[tag[1]]).trim());
        });

      if (words && words.length > 0) {
        if (!client._emailValues) _.extend(client, {_emailValues: {}});
        client._emailValues[keyObject] = words.join("");
        return client;
      }
    }

    $scope.toggleEmailBtn = function (channel) {
      amplitude.getInstance().logEvent('Clicou no botão de email');
      $scope.ctrl.emailEnabled = !$scope.ctrl.emailEnabled;
      var subjectWatch = $scope.$watch('form.email.subject', function (textValue) {
        if ($scope.Campaign.clients[0])
          $scope.Campaign.clients[0] = replaceTagForValue($scope.Campaign.clients[0], textValue, 'subject');
      });
      var contentWatch = $scope.$watch('form.email.content', function (textValue) {
        if ($scope.Campaign.clients[0])
          $scope.Campaign.clients[0] = replaceTagForValue($scope.Campaign.clients[0], textValue, 'content');
      });
      var greetingWatch = $scope.$watch('form.email.greeting', function (textValue) {
        if ($scope.Campaign.clients[0])
          $scope.Campaign.clients[0] = replaceTagForValue($scope.Campaign.clients[0], textValue, 'greeting')
      });
      var titleWatch = $scope.$watch('form.email.title', function (textValue) {
        if ($scope.Campaign.clients[0])
          $scope.Campaign.clients[0] = replaceTagForValue($scope.Campaign.clients[0], textValue, 'title')
      });
      var textButtonWatch = $scope.$watch('form.email.textButton', function (textValue) {
        if ($scope.Campaign.clients[0])
          $scope.Campaign.clients[0] = replaceTagForValue($scope.Campaign.clients[0], textValue, 'textButton')
      });
      var imageWatch = $scope.$watch('form.email.image', function (textValue) {
        if ($scope.Campaign.clients[0])
          $scope.Campaign.clients[0] = replaceTagForValue($scope.Campaign.clients[0], textValue, 'image')
      });

      if (!$scope.ctrl.emailEnabled) {
        resetFormEmail();

        // Destroying watches if email isn't enabled
        contentWatch();
        greetingWatch();
        subjectWatch();
        titleWatch();
        textButtonWatch();
        imageWatch();
      }

      if ($scope.ctrl.emailEnabled)
        scrollPage(channel);
    };

    $scope.toggleSmsBtn = function (channel) {
      amplitude.getInstance().logEvent('Clicou no botão de sms');
      $scope.ctrl.smsEnabled = !$scope.ctrl.smsEnabled;
      if (!$scope.ctrl.smsEnabled) resetFormSms();

      if ($scope.ctrl.smsEnabled)
        scrollPage(channel);
    };

    $scope.toggleNotificationBtn = function (channel) {
      amplitude.getInstance().logEvent('Clicou no botão de notificação do app');
      $scope.ctrl.notificationEnabled = !$scope.ctrl.notificationEnabled;
      if (!$scope.ctrl.notificationEnabled) resetFormNotification();

      if ($scope.ctrl.notificationEnabled)
        scrollPage(channel);
    };

    function resetFormEmail() {
      $scope.form = {email: {image: 'https://s3-sa-east-1.amazonaws.com/automobi-public/crm/img-email.png'}};
      $scope.Campaign.clients = $scope.listClients;
    }

    function resetFormSms() {
      $scope.Campaign.sms = angular.copy(Campaign.sms);
    }

    function resetFormNotification() {
      $scope.Campaign.notification = angular.copy(Campaign.notification);
    }

    $scope.canSubmit = function () {
      return $scope.form_constraints.$valid && ($scope.ctrl.emailEnabled || $scope.ctrl.smsEnabled || $scope.ctrl.notificationEnabled);
    };

    $scope.imageUpload = function(){
      amplitude.getInstance().logEvent('Clicou em escolher imagem');
    };

    $scope.submitForm = function () {
      amplitude.getInstance().logEvent('Clicou em enviar campanha');
      $analytics.eventTrack('CampanhaRealizada');
      $scope.disableSaveButton = true;
      if ($scope.ctrl.emailEnabled) {
        $scope.Campaign.emailValues = $scope.form.email;
        _.map($scope.Campaign.clients, function (client) {
          delete client._emailValues;
          return client;
        });
      } else {
        delete $scope.Campaign.emailValues;
      }

      $scope.Campaign.post().then(function (data) {
        resetPage()
        $scope.disableSaveButton = false;
      }, function(err) {
          generalUtils.onError('Ops',
            'Houve um problema ao enviar sua campanha',
            'OK',
            function (isConfirm) {
            })
        $scope.disableSaveButton = false;
      });
    };

    function handleGetClientsDatabase(clients) {
      var attr = {clients: clients.plain()};
      generalUtils.hideLoader();

      var config = {
        content: 'Você não possui clientes cadastrados na plataforma!',
        delay: 1000,
        theme: 'success-toast'
      };

      if (attr.clients.length > 0)
        config = {
          content: 'Clientes importados!',
          delay: 1000,
          theme: 'success-toast'
        };

      toastHelper.toastSimple(config);
      setTimeout(function () {
        $scope.Campaign.clients = attr.clients;
        $scope.listClients = attr.clients;
        $scope.listClientsErr = attr.clientsErr;


        if ($scope.listClients && $scope.listClients.length > 0) {
          $scope.listTagsAvailable = Object.keys($scope.listClients[0]);
          $scope.listTagsAvailable = _.map($scope.listTagsAvailable, function (tag) {
            return '##' + tag + '##'
          });
          setTimeout(function () {
            scrollPage('listResult')
          }, 500);
        }

      }, 500);
    }

    function handleErrorGetClientsDatabase(err) {
      generalUtils.hideLoader();
      var config = {
        content: 'Houve um problema ao buscar os clientes do banco, veja na sessão de clientes e tente novamente',
        delay: 3000
      };
      toastHelper.toastSimple(config);
    }

    $scope.importCustomerFromDB = function () {
      amplitude.getInstance().logEvent('Clicou em importar clientes da plataforma');
      $scope.importCustomerFromDBSelected = true;

      generalUtils.startLoader();
      var config = {
        content: 'Importando clientes...'
      };
      toastHelper.toastSimple(config);

      Restangular.all('campaigns/clients/database')
        .getList({})
        .then(handleGetClientsDatabase, handleErrorGetClientsDatabase);
    };
  }

})();
