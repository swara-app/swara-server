'use strict';

angular.module('server').controller('ServerController', ['$scope', '$sce', '$stateParams', '$location', 'prompt', 'Server',
  function ($scope, $sce, $stateParams, $location, prompt, Server) {

    $scope.renderHtml = function (html) {
      return $sce.trustAsHtml(html);
    };

    $scope.init = function () {
      $scope.server = Server.get();
    };
  }
]);
