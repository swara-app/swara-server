'use strict';

// Setting up route
angular.module('subfolders').config(['$stateProvider',
  function ($stateProvider) {
    // Subfolders state routing
    $stateProvider.
      state('viewSubfolder', {
        url           : '/folders/:folderId/subfolders/:subfolderId',
        templateUrl   : 'modules/subfolders/views/view-subfolder.client.view.html',
        ncyBreadcrumb : {
          label  : 'Subfolder',
          parent : 'viewFolder'
        }
      }).
      state('editSubfolder', {
        url         : '/folders/:folderId/subfolders/:subfolderId/edit',
        templateUrl : 'modules/subfolders/views/edit-subfolder.client.view.html',
        ncyBreadcrumb : {
          label : 'Edit',
          parent: 'viewSubfolder'
        }
      });
  }
]);
