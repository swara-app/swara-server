'use strict';

angular.module('core').directive('auditTrail', ['$compile',
  function ($compile) {
    return {
      replace     : true,
      restrict    : 'E',
      scope       : {
        entity : '='
      },
      templateUrl : 'modules/core/templates/audittrail.client.template.html'
    };
  }
]);
