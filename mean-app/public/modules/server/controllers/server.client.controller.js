'use strict';

var tweakHeaderForMaxLogSize = function (header, log, maxLogSize) {
  if (log.length === maxLogSize) {
    header += ' (showing last ' + maxLogSize + ' lines)';
  }
  return header;
};

angular.module('server').controller('ServerController', ['$scope', '$sce', '$stateParams', '$location', 'Server',
  function ($scope, $sce, $stateParams, $location, Server) {

    $scope.libraryLogVisible = false;

    $scope.$watch('server.libraryLog', function (libraryLog) {
      $scope.libraryLogHeader = 'Last Library Operation Log';
      $scope.libraryLogHeader = tweakHeaderForMaxLogSize($scope.libraryLogHeader, libraryLog, $scope.server.maxLogSize);

      $scope.libraryLogVisible = libraryLog && libraryLog.length > 1;
    }, true);

    $scope.$watch('server.appLog', function (appLog) {
      $scope.appLogHeader = 'Application Log';
      $scope.appLogHeader = tweakHeaderForMaxLogSize($scope.appLogHeader, appLog, $scope.server.maxLogSize);
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
