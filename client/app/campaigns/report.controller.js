/**
 * Created by atomicavocado on 11/01/17.
 */

(function () {
  'use strict';

  angular.module('app')
    .controller('ReportController', ['$scope', '$state', 'Campaigns', '$timeout', '$analytics', ReportController]);

  function ReportController($scope, $state, Campaigns, $timeout, $analytics) {
    $timeout(function () {
      $analytics.pageTrack('campaigns/list');
      $analytics.eventTrack('RelatóriosCampanha');
    }, 20000);

    $scope.ctrl = {
      'campaignsList': _.map(Campaigns, function (campaign) {
        campaign.optionsChart = {
          title: {
            text: '',
            x: ''
          },
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          legend: {
            orient: 'vertical',
            x: 'left',
            data: ['Enviados', 'Entregues', 'Negados', 'Abertos', 'Convertidos']
          },
          toolbox: {
            show: false,
            feature: {
              restore: {show: true, title: "restore"},
              saveAsImage: {show: true, title: "save as image"}
            }
          },
          calculable: true,
          series: [
            {
              name: '',
              type: 'pie',
              radius: '55%',
              center: ['50%', '60%'],
              data: [
                {value: campaign.statistics.sent, name: 'Entregues'},
                {value: campaign.statistics.open, name: 'Abertos'},
                {value: campaign.statistics.converted, name: 'Convertidos'}
              ]
            }
          ]
        };
        campaign.dateCreate = moment(campaign.dateCreate).locale('pt-BR').format('LLL');
        return campaign;
      }),
      orderById: true,
      orderByName: true,
      orderByCreateAt: true,
      orderByStatistics: true
    };

    $scope.campaignDetails = function (id) {
      $state.go('campaigns.details', {id: id})
    };

    $scope.pie1 = {};
    $scope.pie1.options = {
      title: {
        text: '',
        x: ''
      },
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        x: 'left',
        data: ['Enviados', 'Entregues', 'Negados', 'Abertos', 'Convertidos']
      },
      toolbox: {
        show: false,
        feature: {
          restore: {show: true, title: "restore"},
          saveAsImage: {show: true, title: "save as image"}
        }
      },
      calculable: true,
      series: [
        {
          name: '',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: [
            {value: 310, name: 'Entregues'},
            {value: 135, name: 'Abertos'},
            {value: 1548, name: 'Convertidos'}
          ]
        }
      ]
    };

    for (var i = $scope.ctrl.campaignsList.length-1; i >= 0; i--) {
      var statistics = $scope.ctrl.campaignsList[i].statistics;
      var sumStatistics = statistics.converted + statistics.open + statistics.sentEmail 
      + statistics.sentNotification + statistics.sentSMS;
      $scope.ctrl.campaignsList[i].SumStatistics = sumStatistics;
    }

    $scope.orderById = function(){
      $scope.ctrl.orderById = !$scope.ctrl.orderById;
      if ($scope.ctrl.orderById == true) 
        $scope.ctrl.campaignsList = _.orderBy($scope.ctrl.campaignsList, ['_id'], ['asc']);
      if ($scope.ctrl.orderById == false)
        $scope.ctrl.campaignsList = _.orderBy($scope.ctrl.campaignsList, ['_id'], ['desc']);
      $scope.ctrl.orderByName = true;
      $scope.ctrl.orderByCreateAt = true;
      $scope.ctrl.orderByStatistics = true;
    };

    $scope.orderByName = function(){
      $scope.ctrl.orderByName = !$scope.ctrl.orderByName;
      if ($scope.ctrl.orderByName == true) 
        $scope.ctrl.campaignsList = _.orderBy($scope.ctrl.campaignsList, ['name'], ['asc']);
      if ($scope.ctrl.orderByName == false)
        $scope.ctrl.campaignsList = _.orderBy($scope.ctrl.campaignsList, ['name'], ['desc']);
      $scope.ctrl.orderById = true;
      $scope.ctrl.orderByCreateAt = true;
      $scope.ctrl.orderByStatistics = true;
    };

    $scope.orderByCreateAt = function(){
      $scope.ctrl.orderByCreateAt = !$scope.ctrl.orderByCreateAt;
      if ($scope.ctrl.orderByCreateAt == true) 
        $scope.ctrl.campaignsList = _.orderBy($scope.ctrl.campaignsList, ['createdAt'], ['asc']);
      if ($scope.ctrl.orderByCreateAt == false)
        $scope.ctrl.campaignsList = _.orderBy($scope.ctrl.campaignsList, ['createdAt'], ['desc']);
      $scope.ctrl.orderByName = true;
      $scope.ctrl.orderById = true;
      $scope.ctrl.orderByStatistics = true;
    };

    $scope.orderByStatistics = function(){
      $scope.ctrl.orderByStatistics = !$scope.ctrl.orderByStatistics;
      if ($scope.ctrl.orderByStatistics == true) 
        $scope.ctrl.campaignsList = _.orderBy($scope.ctrl.campaignsList, ['SumStatistics'], ['asc']);
      if ($scope.ctrl.orderByStatistics == false)
        $scope.ctrl.campaignsList = _.orderBy($scope.ctrl.campaignsList, ['SumStatistics'], ['desc']);
      $scope.ctrl.orderByName = true;
      $scope.ctrl.orderByCreateAt = true;
      $scope.ctrl.orderById = true;
    };
  }
})();
