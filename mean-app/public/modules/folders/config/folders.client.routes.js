'use strict';

// Setting up route
angular.module('folders').config(['$stateProvider',
  function ($stateProvider) {
    // Folders state routing
    $stateProvider.
      state('listFolders', {
        url         : '/folders',
        templateUrl : 'modules/folders/views/list-folders.client.view.html'
      }).
      state('addFolder', {
        url         : '/folders/add',
        templateUrl : 'modules/folders/views/create-folder.client.view.html'
      }).
      state('viewFolder', {
        url         : '/folders/:folderId',
        templateUrl : 'modules/folders/views/view-folder.client.view.html'
      }).
      state('editFolder', {
        url         : '/folders/:folderId/edit',
        templateUrl : 'modules/folders/views/edit-folder.client.view.html'
      });
  }
]);
