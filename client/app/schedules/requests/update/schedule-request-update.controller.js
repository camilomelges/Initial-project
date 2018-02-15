/**
 * Created by atomicavocado on 03/02/17.
 */

(function () {
  'use strict';

  angular.module('app')
    .controller('ScheduleRequestUpdateCtrl', ['localStorageService', 'authService', '$scope', '$uibModal', 'Restangular', '$state', 'Services', 'BranchSettings', 'ScheduleRequest', 'generalUtils', 'permissions', 'Partner', 'socket', ScheduleRequestUpdateCtrl]);

  function ScheduleRequestUpdateCtrl(localStorageService, authService, $scope, $uibModal, Restangular, $state, Services, BranchSettings, ScheduleRequest, generalUtils, permissions, Partner, socket) {
    $scope.authentication = localStorageService.get('authentication');
    if (!$scope.authentication.scheduleModule || $scope.authentication.scheduleModule !== 'schedulerequest') {
      generalUtils.onError(
        'Aviso!',
        'Você não possui permissão para acessar esta página, você será redirecionado para página principal.',
        'Confirmar',
        function (isConfirm) {
          $state.go('dashboard');
        });
    }


    var operationWeekend = Partner.operationWeekend ? Partner.operationWeekend : {saturday: true, sunday: false};

    $scope.permissions = permissions;
    $scope.ctrl = {
      srequest: ScheduleRequest,
      services: angular.copy(Services),
      scheduleServicesWithoutDetails: ScheduleRequest.services,
      scheduleServicesDetailed: _.concat((ScheduleRequest.servicesDetails) ?
        ScheduleRequest.servicesDetails : [], filterServicesDuplicates()),
      timeOptions: generalUtils.generateTimeOptions(BranchSettings),
      timeValid: true,
      selectedUser: ScheduleRequest.customer,
      selectedVehicle: ScheduleRequest.vehicle,
      selectedHour: "",
      selectedServices: []
    };

    if ($scope.ctrl.srequest.customer.phone) {
      $scope.ctrl.srequest.customer.phone = generalUtils.formatPhone($scope.ctrl.srequest.customer.phone);
    }

    if ($scope.ctrl.srequest.inspection) {
      $scope.inspection = true;
      $scope.ctrl.km = $scope.ctrl.srequest.inspection.km;
    }


    $scope.calendar = {
      dateOptions: {
        formatYear: 'yy',
        startingDay: 0,
        minDate: new Date(),
        maxDate: moment().add(2, "year"),
        dateDisabled: function (data) {
          var date = data.date,
            mode = data.mode;
          return mode === 'day' && (date.getDay() === 0 && !operationWeekend.sunday) || (date.getDay() === 6 && !operationWeekend.saturday);
        }
      },
      format: 'dd/MM/yyyy',
      altInputFormats: ['d!/M!/yyyy'],
      selectedDate: new Date()
    };

    $scope.serviceSelected = function () {
      if (!$scope.ctrl.selectedService) return $scope.cancelAddService();
      if (!$scope.ctrl.selectedService.name.includes('Revisão'))
        return hideInspection();

      $scope.ctrl.inspectionSelected = !$scope.ctrl.inspectionSelected;
    };

    function hideInspection() {
      $scope.ctrl.inspectionSelected = false;
      $scope.ctrl.inspectionParameter = undefined;
      $scope.ctrl.selectedService.inspectionKm = undefined;
      $scope.ctrl.selectedService.inspectionTime = undefined;
    }

    $scope.generateYearsStringByMonth = generalUtils.generateYearsStringByMonth;

    $scope.addService = function (form) {
      $scope.ctrl.serviceForm = form;
      if (!form.$valid) return;

      ($scope.ctrl.selectedService.name.includes('Revisão')) ? $scope.ctrl.selectedService.type = 'inspection' :
        $scope.ctrl.selectedService.type = 'other';

      if ($scope.ctrl.selectedService.type === 'inspection')
        $scope.ctrl.selectedService.inspectionTimeString = $scope.generateYearsStringByMonth($scope.ctrl.selectedService.inspectionTime);

      $scope.ctrl.scheduleServicesDetailed.push(angular.copy($scope.ctrl.selectedService));
      $scope.ctrl.scheduleServicesWithoutDetails.push($scope.ctrl.selectedService);
      $scope.ctrl.services.splice($scope.ctrl.services.indexOf(
        $scope.ctrl.selectedService
      ), 1);

      $scope.cancelAddService();
    };

    $scope.removeService = function (index, selectedService) {
      $scope.ctrl.services.unshift(_.find(Services, function (service) {
        if (!selectedService.service) return selectedService._id.toString() === service._id.toString();
        return service._id.toString() === selectedService.service.toString();
      }));
      $scope.ctrl.scheduleServicesDetailed.splice(index, 1);
      var serviceIdIndex = $scope.ctrl.services.indexOf(
        _.find($scope.ctrl.scheduleServicesWithoutDetails, function (service) {
          if (service.service) return (service.service.toString()) === (selectedService.service.toString());
          if (service._id && selectedService._id) return (service._id.toString()) === selectedService._id.toString();
          if (service._id) return (service._id.toString()) === selectedService.service.toString();
        })
      );
      if (serviceIdIndex) $scope.ctrl.scheduleServicesWithoutDetails.splice(serviceIdIndex, 1);
    };

    $scope.cancelAddService = function () {
      $scope.ctrl.inspectionParameter = undefined;
      $scope.ctrl.inspectionSelected = false;
      if ($scope.ctrl.serviceForm) $scope.ctrl.serviceForm.$submitted = false;
      if (!$scope.ctrl.selectedService) return;
      $scope.ctrl.selectedService.durationTime = undefined;
      $scope.ctrl.selectedService.inspectionKm = undefined;
      $scope.ctrl.selectedService.inspectionTime = undefined;
      delete $scope.ctrl.selectedService;
      delete $scope.ctrl.inspectionSelected;
    };

    function filterServicesDuplicates() {
      return _.filter(ScheduleRequest.services, function (service) {
        if (!_.find(ScheduleRequest.servicesDetails, function (serviceDetail) {
            return serviceDetail.name === service.name;
          })) return service;
      });
    }

    $scope.toggleHour = function () {
      $scope.ctrl.selectedHour = undefined;
    };


    $scope.clearCalendar = function () {
      $scope.calendar.selectedDate = null;
    };

    // Disable weekend selection
    $scope.disabledCalendar = function (date, mode) {
      return mode === 'day' && (date.getDay() === 0 && !operationWeekend.sunday) || (date.getDay() === 6 && !operationWeekend.saturday);
    };

    $scope.setDate = function (year, month, day) {
      $scope.calendar.selectedDate = new Date(year, month, day);
    };

    $scope.inspectionIsSelected = function () {
      return !_.isEmpty(_.find($scope.ctrl.selectedServices, {
        name: 'Revisão'
      }))
    };

    $scope.emptyField = function (val) {
      $scope.ctrl.searchField = '';
    };

    function removeActionFromAuth(pendingAction) {
      var action = _.find($scope.authentication.pendingActions, function (action) {
        return action.idAction === pendingAction.idAction;
      });

      amplitude.getInstance().logEvent('Atendente foi liberado da pendencia da solicitação', action);

      if ($scope.authentication && $scope.authentication.pendingActions.length > 0) {
        _.remove($scope.authentication.pendingActions, function (action) {
          return action.idAction === pendingAction.idAction;
        });
      }
      localStorageService.set('authentication', $scope.authentication);
    }

    socket.on('removePendingFromOtherAttendants', function (data) {

      var sameAction = _.find($scope.authentication.pendingActions, function (action) {
        return action.idAction === data.payload.idAction;
      });

      if (sameAction) {
        removeActionFromAuth(data.payload);
        var message = '';

        ($state.current.name === 'schedulerequests.update')
          ? message = "Este agendamento foi finalizado pelo " + data.staff.name + ' ' + data.staff.lastname
          : message = "A solicitação na " + sameAction.branch.companyName + " foi finalizado pelo " + data.staff.name + ' ' + data.staff.lastname;
        if ($scope.authentication.staff != data.staff.id) {
          generalUtils.onSuccess("UAU!",
            message,
            "Confirmar",
            "",
            function (isConfirm) {
              ($state.current.name === 'schedulerequests.update')
                ? $state.go('schedulerequests') : '';
            });
        }
        ;
      }
    }, function (err) {
      if (err) {
        generalUtils.onError("Ops!",
          "Ocorreu um erro, tente novamente em instantes!",
          "OK",
          "",
          function (isConfirm) {
            $state.reload();
          });
      }
      ;
    });

    function removeActionFromDB() {
      if ($scope.authentication && $scope.authentication.pendingActions.length > 0) {
        var action = _.find($scope.authentication.pendingActions, function (action) {
          return action.branch._id === $scope.authentication.branch;
        })
      }
      Restangular.one('staffs/' + $scope.authentication.staff + '/pendingActions').remove(action)
        .then(function (data) {
        }, function (err) {
          if (err.status == 500) {
            generalUtils.onError("Ops!",
              "Ocorreu um erro, tente novamente em instantes!",
              "OK",
              "",
              function (isConfirm) {
                $state.reload();
              })
          }
        });
    }

    $scope.saveSchedule = function () {
      var scheduleRequest = {};
      const END_WEEK_ERROR = "Não é possível agendar para o final de semana, verifique a data selecionada e tente novamente!";
      const PASSED_HOUR_ERROR = "Não é possível agendar em horas passadas, verifique a hora selecionada e tente novamente!";
      const PASSED_DATE_ERROR = "Não é possível agendar em datas passadas, verifique a data selecionada e tente novamente!";
      const FORM_REQUIRED_ERROR = "Verifique se o formulário está devidamente preenchido e tente novamente!";

      if (
        !$scope.ctrl.selectedUser._id ||
        !$scope.ctrl.selectedVehicle._id ||
        !$scope.ctrl.scheduleServicesDetailed ||
        !$scope.calendar.selectedDate ||
        !$scope.ctrl.selectedHour
      ) return generalUtils.onError('Ops', FORM_REQUIRED_ERROR, 'OK', function (isConfirm) {
      });

      var selectedDate = moment(new Date($scope.calendar.selectedDate)).format("DD/MM/YYYY");
      var actualDate = moment(new Date()).format("DD/MM/YYYY");

      var fullHour = $scope.ctrl.selectedHour;
      var hour = parseInt(fullHour ? fullHour.split(":")[0] : 0);
      var minutes = parseInt(fullHour ? fullHour.split(":")[1] : 0);

      if (($scope.calendar.selectedDate.getDay() === 0 && !operationWeekend.sunday) || ($scope.calendar.selectedDate.getDay() === 6 && !operationWeekend.saturday))
        return generalUtils.onError('Ops', END_WEEK_ERROR, 'OK', function (isConfirm) {
        });


      var hackDate = new Date($scope.calendar.selectedDate);
      hackDate.setHours(23);
      hackDate.setMinutes(59);
      if (moment(hackDate) < moment(new Date())) return generalUtils.onError('Ops', PASSED_DATE_ERROR, 'OK', function (isConfirm) {
      });

      if (selectedDate === actualDate) {
        if (hour < new Date().getHours())
          return generalUtils.onError('Ops', PASSED_HOUR_ERROR, 'OK', function (isConfirm) {
          });

        if ((hour === new Date().getHours() || hour < new Date().getHours()) && minutes < new Date().getMinutes())
          return generalUtils.onError('Ops', PASSED_HOUR_ERROR, 'OK', function (isConfirm) {
          });
      }

      scheduleRequest.date = $scope.calendar.selectedDate;
      scheduleRequest.hour = $scope.ctrl.selectedHour;
      scheduleRequest.customer = $scope.ctrl.selectedUser._id;
      scheduleRequest.idVehicle = $scope.ctrl.selectedVehicle._id;
      scheduleRequest.services = _.map($scope.ctrl.scheduleServicesWithoutDetails, '_id');
      scheduleRequest.servicesDetails = _.map($scope.ctrl.scheduleServicesDetailed, function (service) {
        if (service.type) return {
          service: (service._id) ? service._id : service.service,
          name: service.name,
          durationTime: service.durationTime,
          type: service.type,
          inspectionKm: (service.inspectionKm) ? service.inspectionKm : undefined,
          inspectionTime: (service.inspectionTime) ? service.inspectionTime : undefined
        }
      }).filter(function (item) {
        return item !== undefined;
      });
      scheduleRequest.observation = $scope.ctrl.note;

      if ($scope.inspection && $scope.ctrl.km)
        scheduleRequest.inspection = {
          km: $scope.ctrl.km
        };


      generalUtils.startLoader();
      Restangular.one("scheduleRequests", ScheduleRequest._id)
        .all("confirm").post(scheduleRequest).then(function (data) {
        generalUtils.hideLoader();
        removeActionFromDB();
        amplitude.getInstance().logEvent('Solicitação agendada com sucesso', data.schedule);
        generalUtils.onSuccess("Sucesso!",
          "Seu agendamento foi criado com sucesso.",
          "OK",
          "",
          function (isConfirm) {
            $state.go('schedules')
          })
      }, function (err) {
        generalUtils.hideLoader();
        if (err.data.code == '1') return generalUtils.onError("Ops!", err.data.message, "Confirmar", function (isConfirm) {
        });
        generalUtils.onError("Ops!", "Não foi possível criar o agendamento.", "Confirmar", function (isConfirm) {
        });
      });
    };

    $scope.notSaveSchedule = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/schedules/requests/update/status-change.html',
        controller: 'StatusChangeCtrl',
        controllerAs: 'ctrl',
        size: 'md',
        resolve: {
          ScheduleReasons: ['scheduleReasons',
            function (scheduleReasons) {
              return scheduleReasons;
            }
          ]
        }
      });

      modalInstance.result.then(function (result) {
        var update = {
          deadlock: {
            motive: result.reason.status,
            description: result.form.description
          }
        };

        if (result.form.executed) {
          var executed = {
            executed: {
              date: result.form.executed ? moment(new Date(result.form.executed.date)).format("YYYY-MM-DD") : result.form.executed,
              with: result.form.executed ? result.form.executed.with : result.form.executed
            }
          };
          _.assignIn(update.deadlock, executed);
        }


        if (result.form.callAgainAt) {
          var dateISO = moment(new Date(result.form.callAgainAt.date))
            .set("hour", result.form.callAgainAt.time.split(":")[0])
            .set("minute", result.form.callAgainAt.time.split(":")[1]);

          var callAgainAt = {
            callAgainAt: {
              date: moment(new Date(result.form.callAgainAt.date)).format("YYYY-MM-DD"),
              dateISO: dateISO,
              time: result.form.callAgainAt.time
            }
          };
          _.assignIn(update.deadlock, callAgainAt);
        }

        generalUtils.startLoader();
        Restangular.one("scheduleRequests", ScheduleRequest._id).customPUT(update).then(function (data) {
          generalUtils.hideLoader();
          removeActionFromDB();
          generalUtils.onSuccess('Sucesso!', 'Solicitação atualizada com sucesso!', 'Confirmar', '', function (isConfirm) {
            $state.go('schedulerequests', {
              status: data.status
            });
          });

        }, function (err) {

          generalUtils.hideLoader();
          generalUtils.onError("Ops!", "Não foi possível alterar esta solicitação.", "Confirmar", function (isConfirm) {
          });

        });
      })
    };

    $scope.hasServices = function () {
      return (!_.isEmpty($scope.ctrl.scheduleServicesDetailed));
    };

    $scope.dataIsEmpty = function () {
      return _.isEmpty($scope.form.date) && _.isEmpty($scope.form.hour);
    };
  }

})();
