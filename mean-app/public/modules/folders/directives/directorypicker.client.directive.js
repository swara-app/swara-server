'use strict';

angular.module('folders').directive('directoryPicker', ['$compile',
  function ($compile) {
    return {
      restrict    : 'E',
      replace     : true,
      require     : '?ngModel',
      templateUrl : 'modules/folders/templates/directorypicker.client.template.html',
      link        : function (scope, element, attrs, controller) {
        var span = element.find('span'),
          button = element.find('button');

        var setPath = function (val) {
          span.text(val || attrs.placeholder);
          if (val) {
            controller.$setViewValue(val);
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
          input.onchange = function (event) {
            setPath(this.value);
          };
          input.click();
        });
      }
    };
  }
]);
