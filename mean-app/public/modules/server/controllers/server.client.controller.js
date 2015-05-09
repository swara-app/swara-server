'use strict';

angular.module('server').controller('ServerController', ['$scope', '$sce', '$stateParams', '$location', '$http', 'Socket', 'Server',
  function ($scope, $sce, $stateParams, $location, $http, Socket, Server) {

    var setupSocketsListenersForLogFile = function (logFileName) {
      Socket.connect();

      Socket.on(logFileName + '.tail.error', function (error) {
        $scope.server[logFileName].push(logFileName + '.tail.error');
        console.log(logFileName + '.tail.error');
        $scope.error = error;
      });

      Socket.on(logFileName + '.tail.line', function (libraryLogLine) {
        if (!$scope.server[logFileName]) {
          $scope.server[logFileName] = [];
        }
        $scope.server[logFileName].push(libraryLogLine);
      });

      Socket.on(logFileName + '.tail.ended', function () {
        $scope.server[logFileName].push(logFileName + '.tail.ended');

        console.log(logFileName + '.tail.ended');
      });
    };

    $scope.libraryLogVisible = false;

    $scope.$watch('server.libraryLogFile', function () {
      $scope.libraryLogVisible = $scope.server.libraryLogFile && $scope.server.libraryLogFile.length > 1;
    }, true);

    $scope.renderHtml = function (html) {
      return $sce.trustAsHtml(html);
    };

    setupSocketsListenersForLogFile('libraryLogFile');
    setupSocketsListenersForLogFile('appLogFile');

    $scope.init = function () {
      $scope.server = Server.get(function () {
      }, function (error) {
        $scope.error = error;
      });
    };

    $scope.$on('$destroy', function () {
       Socket.disconnect(true);
    });

  }
]);
