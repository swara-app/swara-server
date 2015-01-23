'use strict';

//Subfolders service used for communicating with the subfolders REST endpoints
angular.module('subfolders').factory('Subfolders', ['$resource',
  function ($resource) {
    return $resource('subfolders/:subfolderId', {
      subfolderId : '@_id'
    }, {
      update : {
        method : 'PUT'
      }
    });
  }
]);
