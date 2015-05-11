'use strict';

angular.module('core').controller('SpinnerController', ['$scope', 'Spinner',
  function ($scope, Spinner) {

    $scope.$watch(function () { return Spinner.active; }, function (newVal /*, oldVal */) {
      if (typeof newVal !== 'undefined') {
        $scope.spinnerActive = Spinner.active;
      }
    });

  }
]);
