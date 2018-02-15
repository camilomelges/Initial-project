(function () {
  'use strict';

  angular.module('app')
    .controller('DashboardCtrl', ['$scope', 'Schedules', 'Vehicles', 'Customers', '$state', 'generalUtils', 'MobileCustomers', 'SurveyQuestions', DashboardCtrl]);

  function DashboardCtrl($scope, Schedules, Vehicles, Customers, $state, generalUtils, MobileCustomers, SurveyQuestions) {
    amplitude.getInstance().logEvent('Entrou na página dashboard');
    $scope.ctrl = {
      schedules: Schedules.count,
      vehicles: Vehicles.count,
      customers: Customers.count,
      mobileCustomers: MobileCustomers.count
    };
    var labels = [], data = [[], []];
    _.forEach(SurveyQuestions, function (question) {
      labels.push(question.crmLabel);

      var total = question.statistics.happy + question.statistics.bad;
      var happyPercentage = (question.statistics.happy * 100) / total;
      var badPercentage = (question.statistics.bad * 100) / total;
      data[0].push(Math.round(happyPercentage));
      data[1].push(Math.round(badPercentage));
    });
    $scope.chart = {
      options: {
        tooltips: {
          callbacks: {
            label: function (tooltipItems, data) {
              return tooltipItems.yLabel + ': ' + data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index] + "%";
            }
          }
        },
        elements: {
          rectangle: {
            borderSkipped: 'left',
            borderRadius: 10
          }
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }],
          xAxes: [{
            ticks: {
              min: 0,
              max: 100,
              callback: function (value) {
                return value + "%"
              }
            }
          }]
        },
        responsive: true,
        legend: {
          display: true,
          position: 'top',
          align: 'left',
          labels: {
            boxWidth: 15
          }
        }
      },
      labels: labels,
      series: ['Satisfeitos', 'Não satisfeitos'],
      data: data,
      colors: [
        '#68ceaa',
        '#ff9b7c',
        '#7c9bce',
        '#ce4351',
        '#bdce55',
        '#8d5cce',
        '#3ace27'
      ]
    };
  }
})();
