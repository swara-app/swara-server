'use strict';

angular.module('server').controller('ServerController', ['$scope', '$sce', '$stateParams', '$location', 'prompt', 'Server',
  function ($scope, $sce, $stateParams, $location, prompt, Server) {

    $scope.libraryLogVisible = false;

    $scope.$watch('server.libraryLog', function (libraryLog) {
      $scope.libraryLogVisible = libraryLog && libraryLog.length > 1;
    }, true);

    $scope.renderHtml = function (html) {
      return $sce.trustAsHtml(html);
    };

    $scope.getLogHeader = function (logInfoLine) {
      return logInfoLine.slice(logInfoLine.indexOf('`') + 1, logInfoLine.lastIndexOf('`'));
    };

    $scope.init = function () {
      $scope.server = Server.get();
    };
  }
]);
