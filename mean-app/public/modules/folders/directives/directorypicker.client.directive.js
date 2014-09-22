'use strict';

angular.module('folders').directive('directoryPicker', ['$compile',
  function ($compile) {
    return {
      restrict    : 'E',
      templateUrl : 'modules/folders/templates/directorypicker.client.template.html',
      link        : function (scope, element, attrs, ngModel) {
        var span = element.find('span'),
            button = element.find('button');

        var setSpanValue = function () {
          span.text(scope.path || attrs.placeholder);
        };

        setSpanValue();

        button.on('click', function () {
          var input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('nwdirectory', 'true');
          input.onchange = function (event) {
            scope.path = this.value;
            setSpanValue();
          };
          input.click();
        });
      }
    };
  }
]);
