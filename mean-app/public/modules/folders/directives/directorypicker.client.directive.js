'use strict';

angular.module('folders').directive('directoryPicker', ['$compile',
  function ($compile) {
    return {
      restrict    : 'E',
      templateUrl : 'modules/folders/templates/directorypicker.client.template.html',
      link        : function (scope, element, attrs, ctrl) {
        var span = element.find('span'),
            button = element.find('button');

        var getPropByString = function (obj, propString) {
          if (!propString)
            return obj;

          var prop, props = propString.split('.');

          for (var i = 0, iLen = props.length - 1; i < iLen; i++) {
            prop = props[i];

            var candidate = obj[prop];
            if (candidate !== undefined) {
              obj = candidate;
            } else {
              break;
            }
          }
          return obj[props[i]];
        }, setPropByString = function (obj, propString) {
          if (!propString)
            return obj;

          var prop, props = propString.split('.');

          for (var i = 0, iLen = props.length - 1; i < iLen; i++) {
            prop = props[i];

            var candidate = obj[prop];
            if (candidate !== undefined) {
              obj = candidate;
            } else {
              break;
            }
          }
          return obj[props[i]];
        }, setSpanValue = function (val) {
          span.text(val || attrs.placeholder);
        };

        scope.$watch(attrs.path, function (newVal) {
          setSpanValue(newVal);
        }, true);


        button.on('click', function () {
          var input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('nwdirectory', 'true');
          input.setAttribute('nwworkingdir', getPropByString(scope, attrs.path) || '');
          input.onchange = function (event) {
            scope[attrs.path] = this.value;
            setSpanValue(this.value);
          };
          input.click();
        });
      }
    };
  }
]);
