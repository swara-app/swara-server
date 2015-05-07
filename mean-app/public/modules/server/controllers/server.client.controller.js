'use strict';

angular.module('server').controller('ServerController', ['$scope', '$sce', '$stateParams', '$location', 'Server',
  function ($scope, $sce, $stateParams, $location, Server) {

    $scope.libraryLogVisible = false;

    $scope.$watch('server.libraryLog', function (libraryLog) {
      $scope.libraryLogVisible = libraryLog && libraryLog.length > 1;

      // TODO: Apply the same suffix for the application log header too
      $scope.libraryLogHeader = 'Last Library Operation Log';
      if (libraryLog.length === $scope.server.maxLogSize) {
        $scope.libraryLogHeader += ' (showing last ' + $scope.server.maxLogSize + ' lines)';
      }
    }, true);

    $scope.renderHtml = function (html) {
      return $sce.trustAsHtml(html);
    };

    $scope.init = function () {
      $scope.server = Server.get(function () {
      }, function (error) {
        $scope.error = error;
      });
    };
  }
]);
