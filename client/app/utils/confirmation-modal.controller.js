/**
 * Created by atomicavocado on 06/01/17.
 */

(function () {
  'use strict';

  angular.module('app')
    .controller('ConfirmationModalCtrl', ['$scope', '$uibModalInstance', 'Title', 'Message', ConfirmationModalCtrl]);

  function ConfirmationModalCtrl($scope, $uibModalInstance, Title, Message) {

    $scope.ctrl = {
      title: Title,
      message: Message
    };

    $scope.confirm = function() {
      $uibModalInstance.close({reason: 'confirmed'});
    };

    $scope.deny = function() {
      $uibModalInstance.close();
    };

  }//END ConfirmationModalCtrl

})();
