(function () {
  'use strict';

  angular.module('app', [
    // Core modules
    'app.core'

    // Custom Feature modules
    , 'app.ui'
    , 'app.ui.form'
    , 'app.ui.form.validation'
    , 'app.page'
    , 'app.table'

    // 3rd party feature modules
    , 'mgo-angular-wizard'
    , 'ui.tree'
    , 'ngMap'
    , 'textAngular'
    , 'restangular'
    , 'LocalStorageModule'
    , 'ui.utils.masks'
    , 'localytics.directives'
    , 'ngMask'
    , 'ngFileUpload'
    , 'permission'
    , 'permission.ui'
    , 'angular-table'
    , 'colorpicker.module'
    , 'ui-notification'
    , 'ui.select'
    , 'environment'
    , 'chart.js'
  ]);

})();

