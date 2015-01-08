'use strict';

//Folders service used for communicating with the folders REST endpoints
angular.module('folders').factory('Folders', ['$resource',
  function ($resource) {
    return $resource('folders/:folderId', {
      folderId : '@_id'
    }, {
      update : {
        method : 'PUT'
      }
    });
  }
]);
