'use strict';

angular.module('core').directive('auditTrail', [
  function () {
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
