'use strict';

app.directive('announcements', announcements);

announcements.$inject = [];

function announcements() {
	return {
		restrict: 'E',
		scope: {},
		templateUrl: 'components/announcements/announcements.html',
		link: link
	};

	function link(scope, elem, attr) {
	}
}
