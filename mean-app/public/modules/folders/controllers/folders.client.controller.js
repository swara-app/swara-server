'use strict';

angular.module('folders').controller('FoldersController', ['$scope', '$stateParams', '$location', 'prompt', 'Authentication', 'Folders',
  function ($scope, $stateParams, $location, prompt, Authentication, Folders) {
    $scope.authentication = Authentication;

    var getTitleFromPath = function (path) {
      if (!path) {
        return null;
      }
      var sep;
      if (typeof process === 'object') {  // node-wekit
        sep = require('path').sep;
        return path.substr(path.lastIndexOf(sep) + 1);
      } else {  // web app
        // FIXME: This below else is only for trying out the app from without the node-webkit container
        sep = '';
        if (path.indexOf('/') > -1) {
          sep = '/';
        } else if (path.indexOf('\\') > -1) {
          sep = '\\';
        }
        return path.substr(path.lastIndexOf(sep) + 1);
      }
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
      //simple confirmation
      prompt({
        title   : 'Delete this folder?',
        message : 'Are you sure?\nAll the subfolders and tracks within this folder would be deleted.'
      }).then(function () {
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
      });
    };

    $scope.update = function (triggerScan) {
      var folder = $scope.folder;
      folder.scanning = triggerScan;

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
