'use strict';

angular.module('server').controller('ServerController', ['$scope', '$sce', '$stateParams', '$location', 'Server',
  function ($scope, $sce, $stateParams, $location, Server) {

    $scope.libraryLogVisible = false;

    $scope.$watch('server.libraryLog', function (libraryLog) {
      $scope.libraryLogVisible = libraryLog && libraryLog.length > 1;
    }, true);

    $scope.renderHtml = function (html) {
      return $sce.trustAsHtml(html);
    };

    $scope.getLogHeader = function (logInfoLine) {
      var beginAction = logInfoLine.indexOf('`');
      var endAction = logInfoLine.lastIndexOf('`');
      var action = logInfoLine.slice(beginAction + 1, endAction);

      var beginTimeStamp = logInfoLine.indexOf('(', endAction);
      var endTimestamp = logInfoLine.lastIndexOf(')') + 1;
      var timestamp = logInfoLine.slice(beginTimeStamp, endTimestamp);

      return (action + ' ' + timestamp).replace(/`/g, '');
    };

    $scope.init = function () {
      $scope.server = Server.get(function () {
      }, function (error) {
        $scope.error = error;
      });
    };
  }
]);
