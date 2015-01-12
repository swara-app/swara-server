'use strict';

angular.module('subfolders').controller('SubfoldersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Subfolders',
  function ($scope, $stateParams, $location, Authentication, Subfolders) {
    $scope.authentication = Authentication;

    $scope.remove = function (subfolder) {
      if (subfolder) {
        subfolder.$remove();

        for (var i in $scope.subfolders) {
          if ($scope.subfolders[i] === subfolder) {
            $scope.subfolders.splice(i, 1);
          }
        }
      } else {
        $scope.subfolder.$remove(function () {
          $location.path('subfolders');
        });
      }
    };

    $scope.findOne = function () {
      $scope.subfolder = Subfolders.get({
        subfolderId : $stateParams.subfolderId
      });
    };
  }
]);
