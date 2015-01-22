'use strict';

angular.module('folders').directive('directoryPicker', ['$compile',
  function ($compile) {
    return {
      restrict    : 'E',
      replace     : true,
      require     : '?ngModel',
      templateUrl : 'modules/folders/templates/directorypicker.client.template.html',
      link        : function (scope, element, attrs, controller) {
        if (typeof process === 'object') {  // node-webkit
          var span = element.find('span'),
            button = element.find('button');

          var setPath = function (val) {
            span.text(val || attrs.placeholder);
            if (val) {
              controller.$setViewValue(val);
              // http://stackoverflow.com/a/17958847/218882
              require('lodash').defer(function () {
                // to update the model into the scope - http://stackoverflow.com/a/18264323/218882
                scope.$apply();
              });
            }
          };

          scope.$watch(attrs.ngModel, function (newVal) {
            setPath(newVal);
          }, true);

          button.on('click', function () {
            var input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('nwdirectory', 'true');
            input.setAttribute('nwworkingdir', controller.$viewValue || '');
            input.onchange = function () {
              setPath(this.value);
            };
            input.click();
          });
        } else {  // web app
          // FIXME: This below else is only for trying out the app from without the node-webkit container
          var html = '<input name="path" type="text" id="path" data-ng-model="path" class="form-control" ' +
            'placeholder="Path (for example: /Users/username/Music/)" required>';
          var e = $compile(html)(scope);
          element.replaceWith(e);
        }
      }
    };
  }
]);
