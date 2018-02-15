(function() {
  'use strict';

  angular.module('app')
    .controller('ModalChangeCtrl', ['$scope', '$filter', 'Restangular', '$stateParams', '$state', '$uibModalInstance', 'Schedule', 'generalUtils', 'localStorageService', ModalChangeCtrl]);

  function ModalChangeCtrl($scope, $filter, Restangular, $stateParams, $state, $uibModalInstance, Schedule, generalUtils, localStorageService) {
    var schedule = Schedule;
    $scope.form = {
      status: '',
      reason: ''
    };

    var splitedEmail = generalUtils.verifyEmailStaff();

    if (splitedEmail) {
      $scope.ctrl = {
        statusList: [{
          code: 'pending',
          name: 'Pendente'
        }, {
          code: 'service',
          name: 'Em serviço'
        }, {
          code: 'canceled',
          name: 'Cancelado'
        }, {
          code: 'finished',
          name: 'Finalizado'
        }]
      }
    } else {
      switch (Schedule.status) {
        case 'pending':
          $scope.ctrl = {
            statusList: [{
              code: 'service',
              name: 'Em serviço'
            }, {
              code: 'finished',
              name: 'Finalizado'
            }]
          };
          break;
        case 'no-show':
          $scope.ctrl = {
            statusList: [{
              code: 'pending',
              name: 'Pendente'
            }]
          };
          break;
        case 'service':
          $scope.ctrl = {
            statusList: [{
              code: 'finished',
              name: 'Finalizado'
            }]
          };
          break;
        case 'finished':
          $scope.ctrl = {
            statusList: '',
          };
          break;
        case 'canceled':
          $scope.ctrl = {
            statusList: [{
              code: 'pending',
              name: 'Pendente'
            }, {
              code: 'service',
              name: 'Em serviço'
            }, {
              code: 'finished',
              name: 'Finalizado'
            }]
          };
          break;
      };
    }

    // HERE STAY DEFAULTS VALUES FOR $scope.ctrl.statusList
    /*$scope.ctrl = {
      statusList: [{
        code: 'pending',
        name: 'Pendente'
      }, {
        code: 'service',
        name: 'Em serviço'
      }, {
        code: 'canceled',
        name: 'Cancelado'
      }, {
        code: 'finished',
        name: 'Finalizado'
      }]
    };*/

    $scope.cancel = function(e) {
      amplitude.getInstance().logEvent('Clicou em cancelar a alteração de status do agendamento');
      $uibModalInstance.dismiss('cancel');
    };

    $scope.save = function(e) {
      schedule.status = _.isEmpty($scope.form.status) ? 'pending' : $scope.form.status.code;
      if (schedule.status == 'finished') schedule.dateFinished = new Date();

      schedule.put().then(function(data) {
        var schedule = {id: data._id};
        amplitude.getInstance().logEvent('Clicou em salvar a alteração de status do agendamento para ' + data.status, schedule);
        generalUtils.onSuccess('Status atualizado!', 'O status foi atualizado com sucesso!.', "OK", '', function(isConfirm) {
          $uibModalInstance.close(data);
          amplitude.getInstance().logEvent('Clicou em confirmar a inclusao da alteração de status do agendamento');
          $state.reload()
        });
      }, function(err) {
        $state.reload();
        generalUtils.onError('Ops!', err.data.message, 'Confirmar', function(isConfirm) {
          amplitude.getInstance().logEvent('Clicou em confirmar o erro na alteração de status do agendamento');
        });
      });
    };
  }

})();
