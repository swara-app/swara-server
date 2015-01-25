'use strict';

//Server service used for communicating with the server REST endpoints
angular.module('server').factory('Server', ['$resource',
  function ($resource) {
    return $resource('server');
  }
]);
