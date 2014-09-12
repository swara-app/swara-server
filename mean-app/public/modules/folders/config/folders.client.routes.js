'use strict';

// Setting up route
angular.module('folders').config(['$stateProvider',
  function ($stateProvider) {
    // Folders state routing
    $stateProvider.
      state('folders', {
        url         : '/folders',
        templateUrl : 'modules/folders/views/list-folders.client.view.html'
      }).
      state('folders.add', {
        url         : '/add',
        templateUrl : 'modules/folders/views/create-folder.client.view.html'
      });
  }
]);
