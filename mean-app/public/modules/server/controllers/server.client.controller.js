'use strict';

angular.module('server').controller('ServerController', ['$scope', '$stateParams', '$location', 'prompt', 'Socket', 'Server',
  function ($scope, $stateParams, $location, prompt, Socket, Server) {

    $scope.init = function () {
      $scope.server = Server.get();
    };
  }
]);
