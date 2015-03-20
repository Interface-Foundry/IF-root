'use strict';

app.directive('markerPopupClick', markerPopupClick);

markerPopupClick.$inject = ['$location'];

function markerPopupClick($location) {
	return {
		scope: {},
		restrict: 'A',
		template: "<p ng-click='clickMe()'>hello</p>",
		link: function(scope, elem, attr) {

			scope.link = attr.link;

			scope.clickMe = function() {
				console.log('i clicked me', this.link)
				$location.path(this.link);
			}

			// elem.bind('click', function(a, b, c) {
			// 	console.log('clicked, redirecting to')
			// })
			// console.log('LINK', attr.link)
		}
	};


}
