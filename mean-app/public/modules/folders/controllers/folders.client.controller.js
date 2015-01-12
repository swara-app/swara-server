'use strict';

angular.module('folders').controller('FoldersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Folders',
  function ($scope, $stateParams, $location, Authentication, Folders) {
    $scope.authentication = Authentication;

    var getTitleFromPath = function (path) {
      if (!path) {
        return null;
      }
      var sep = require('path').sep;
      return path.substr(path.lastIndexOf(sep) + 1);
    };

    $scope.create = function () {
      var folder = new Folders({
        path  : this.path,
        title : getTitleFromPath(this.path)
      });
      folder.$save(function (response) {
        $location.path('folders/' + response._id);

        $scope.path = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.remove = function (folder) {
      if (folder) {
        folder.$remove();

        for (var i in $scope.folders) {
          if ($scope.folders[i] === folder) {
            $scope.folders.splice(i, 1);
          }
        }
      } else {
        $scope.folder.$remove(function () {
          $location.path('folders');
        });
      }
    };

    $scope.update = function () {
      var folder = $scope.folder;

      folder.$update(function () {
        $location.path('folders/' + folder._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.find = function () {
      $scope.folders = Folders.query();
    };

    $scope.findOne = function () {
      $scope.folder = Folders.get({
        folderId : $stateParams.folderId
      });
    };
  }
]);
