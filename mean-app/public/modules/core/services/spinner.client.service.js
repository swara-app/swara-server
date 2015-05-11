'use strict';

angular.module('core').factory('Spinner', [
  function () {
    return {
      active : false,
      show   : function () {
        this.active = true;
      },
      hide   : function () {
        this.active = false;
      }
    };
  }
]);
