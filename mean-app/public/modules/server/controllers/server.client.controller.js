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

    $scope.init = function () {
      $scope.server = Server.get(function () {
      }, function (error) {
        $scope.error = error;
      });
    };
  }
]);
