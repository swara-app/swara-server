'use strict';

angular.module('folders').directive('directoryPicker', [
	function() {
		return {
			template: '<div></div>',
			restrict: 'E',
			link: function postLink(scope, element, attrs) {
				// Directorypicker directive logic
				// ...
        console.log('>>> Inside the link function in the directoryPicker directive');
				element.text('this is the directorypicker directive');
			}
		};
	}
]);
