'use strict';

// Setting up route
angular.module('server').config(['$stateProvider',
  function ($stateProvider) {
    // Server state routing
    $stateProvider.
      state('server', {
        url           : '/server',
        templateUrl   : 'modules/server/views/server.client.view.html',
        ncyBreadcrumb : {
          label  : 'Server',
          parent : 'home'
        }
      });
  }
]);
