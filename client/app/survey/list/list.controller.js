(function () {
  'use strict';

  angular.module('app')
    .controller('SurveyCommentListCtrl', ['$timeout','$state', 'anchorSmoothScroll', '$scope', 'generalUtils', 'permissions', 'Restangular', 'SurveyQuestions', '$uibModal', SurveyCommentListCtrl]);

  function SurveyCommentListCtrl($timeout, $state, anchorSmoothScroll, $scope, generalUtils, permissions, Restangular, SurveyQuestions, $uibModal) {
    amplitude.getInstance().logEvent('Entrou na lista de comentários de feedback dos usuários');

    var surveys = {
      docs: [],
      total: 0,
      limit: 0
    };

    $scope.permissions = permissions;

    $scope.ctrl = {
      surveyQuestions: SurveyQuestions,
      surveys: surveys.docs,
      totalItems: surveys.total,
      limit: surveys.limit,
      currentPage: 1,
      questionFilter: $state.params.surveyQuestion ? $state.params.surveyQuestion : SurveyQuestions && SurveyQuestions.length > 0 ? SurveyQuestions[0]._id : "",
      surveySelected: $state.params.surveyId ? $state.params.surveyId : ""
    };

    requestSurveys(function () {
      if ($scope.ctrl.surveySelected) {
        $timeout(function () {
          anchorSmoothScroll.scrollTo($scope.ctrl.surveySelected.toString(), 150);
        }, 1000);
      }
    });

    function requestSurveys(callback) {
      generalUtils.startLoader();

      Restangular.one('surveys')
        .get({
          page: $scope.ctrl.currentPage,
          surveyAnswered: true,
          question: $scope.ctrl.questionFilter,
          _id: $scope.ctrl.surveySelected
        })
        .then(function (surveys) {
          generalUtils.hideLoader();
          $scope.ctrl.surveys = surveys.docs;
          $scope.ctrl.totalItems = surveys.total;
          $scope.ctrl.limit = surveys.limit;

          if (callback && typeof callback === 'function')
            callback();
        });
    }

    $scope.paginate = function () {
      requestSurveys();
    };

    $scope.openCustomerDetailsModal = function (customerId) {
      amplitude.getInstance().logEvent('Clicou em informações do cliente.');
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/chat/customer-details-modal.html',
        controller: 'CustomerDetailsModalCtrl',
        size: 'lg',
        resolve: {
          Customer: [function () {
            return Restangular.one('customers', customerId).get();
          }]
        }
      });
    };

    $scope.filterByQuestion = function (questionId) {
      $scope.ctrl.questionFilter = questionId;
      $scope.ctrl.currentPage = 1;
      requestSurveys();
    };
  }
})();
