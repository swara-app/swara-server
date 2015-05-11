'use strict';

// Setting up SpinnerInterceptor
angular.module('core').config(['$httpProvider',
  function ($httpProvider) {

    // Ensure transform defaults is an array and then add the custom transform
    var appendTransform = function (defaults, transform) {
      // We can't guarantee that the default transformation is an array
      defaults = angular.isArray(defaults) ? defaults : [defaults];
      // Append the new transformation to the defaults
      return defaults.concat(transform);
    };

    // A pseudo transform that will show the Spinner
    var spinnerTransform = function (data /* , headersGetter */) {
      Spinner.show();
      return data;
    };

    // Setup the response interceptors to hide the spinner
    $httpProvider.responseInterceptors.push('SpinnerInterceptor');
    // Show the spinner using the transformRequest hook
    $httpProvider.defaults.transformRequest = appendTransform($httpProvider.defaults.transformRequest, spinnerTransform);
  }
]);
