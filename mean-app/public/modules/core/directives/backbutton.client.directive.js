'use strict';

angular.module('core').directive('backButton', ['$window',
  function ($window) {
    return {
      replace  : true,
      restrict : 'E',
      template : '<a class="btn btn-default" title="Go Back">Back</a>',
      link     : function (scope, elem) {
        elem.bind('click', function () {
          $window.history.back();
        });
      }
    };
  }
]);
