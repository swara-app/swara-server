'use strict';

angular.module('core').factory('SpinnerInterceptor', ['$q', 'Spinner',
  function (Spinner, $q) {
    return function (promise) {
      return promise.then(function (response) {
        Spinner.hide();
        return response;
      }, function (response) {
        Spinner.hide();
        return $q.reject(response);
      });
    };
  }
]);
