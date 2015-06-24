'use strict';

angular.module('folders').directive('directoryPicker', ['$compile', '$timeout',
  function ($compile, $timeout) {
    return {
      restrict    : 'E',
      replace     : true,
      require     : '?ngModel',
      templateUrl : 'modules/folders/templates/directorypicker.client.template.html',
      link        : function (scope, element, attrs, controller) {
        if (typeof process === 'object') {  // node context
          var span = element.find('span'),
            button = element.find('button');

          var setPath = function (val) {
            span.text(val || attrs.placeholder);
            if (val) {
              controller.$setViewValue(val);
              // http://stackoverflow.com/a/17958847/218882
              $timeout(function () {
                // to update the model into the scope - http://stackoverflow.com/a/18264323/218882
                scope.$apply();
              });
            }
          };

          scope.$watch(attrs.ngModel, function (newVal) {
            setPath(newVal);
          }, true);

          button.on('click', function () {
            var ipc = require('ipc');
            ipc.on('directory-picker-closed', function(selectedDirectory){
              setPath(selectedDirectory);
            });
            ipc.send('open-directory-picker', {
              title: 'Select folder to add to the library',
              defaultPath: controller.$viewValue || ''
            });
          });
        } else {  // web app
          // FIXME: This below else is only for trying out the app from without the electronjs container
          var html = '<input name="path" type="text" id="path" data-ng-model="path" class="form-control" ' +
            'placeholder="Path (for example: /Users/username/Music/)" required>';
          var e = $compile(html)(scope);
          element.replaceWith(e);
        }
      }
    };
  }
]);
