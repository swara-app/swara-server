'use strict';

angular.module('server').controller('ServerController', ['$scope', '$sce', '$stateParams', '$location', '$http', '$timeout', 'Socket', 'Server',
  function ($scope, $sce, $stateParams, $location, $http, $timeout, Socket, Server) {

    var LIMIT_LOG_AT = 100;
    var MAX_LOG_SIZE = 10000;

    var logFiles = ['libraryLogFile', 'appLogFile'];

    var appendLogHeader = function (logFileName) {
      if ($scope[logFileName + 'Header'].indexOf('(showing the last ') === -1) {
        $scope[logFileName + 'Header'] = $scope[logFileName + 'Header'] + ' (showing the last ' + MAX_LOG_SIZE + ' lines)';
      }
    };

    var addLogLineToArrayInScope = function (logFileName, logLine) {
      var logLines = $scope.server[logFileName];
      logLines.push(logLine);
      if (logLines.length % LIMIT_LOG_AT === 0 && logLines.length > MAX_LOG_SIZE) {
        logLines.splice(0, logLines.length - MAX_LOG_SIZE);
        appendLogHeader(logFileName);
      }
    };

    var setupSocketsListenersForLogFile = function (logFileName) {
      Socket.connect();

      Socket.on(logFileName + '.tail.error', function (error) {
        $scope.server[logFileName].push(logFileName + '.tail.error');
        console.log(logFileName + '.tail.error');
        $scope.error = error;
      });

      Socket.on(logFileName + '.tail.line', function (libraryLogLine) {
        addLogLineToArrayInScope(logFileName, libraryLogLine);
      });

      Socket.on(logFileName + '.tail.ended', function () {
        $scope.server[logFileName].push(logFileName + '.tail.ended');

        console.log(logFileName + '.tail.ended');
      });
    };

    $scope.$watch('server.maxLogSize', function (maxLogSize) {
      MAX_LOG_SIZE = maxLogSize || MAX_LOG_SIZE;
    }, true);

    $scope.$watch('server.libraryLogFile', function () {
      $scope.libraryLogVisible = $scope.server.libraryLogFile && $scope.server.libraryLogFile.length > 1;
    }, true);

    $scope.renderHtml = function (html) {
      return $sce.trustAsHtml(html);
    };

    $scope.init = function () {
      $scope.libraryLogVisible = false;

      $scope.libraryLogFileHeader = 'Last Library Operation Log';
      $scope.appLogFileHeader = 'Application Log';

      logFiles.forEach(setupSocketsListenersForLogFile);

      $scope.server = Server.get(
        function () {
          $timeout(function () {

            // tweak the header of the log sections if the server has already trimmed for MAX_SIZE
            logFiles.forEach(function (logFileName) {
              if ($scope.server[logFileName + 'Length'] !== $scope.server[logFileName].length) {
                appendLogHeader(logFileName);
              }
            });

            // call the logs route to set up the websockets streaming
            var availableLines = {};
            logFiles.forEach(function (logFileName) {
              availableLines[logFileName] = $scope.server[logFileName + 'Length'];
            });

            $http.post('server/logs', availableLines);

          });
        },
        function (error) {
          $scope.error = error;
        });
    };

    $scope.$on('$destroy', function () {
      Socket.disconnect(true);
    });

  }
]);
