'use strict';

app.directive('announcements', announcements);

announcements.$inject = ['announcementsService'];

function announcements(announcementsService) {
	return {
		restrict: 'E',
		scope: {},
		templateUrl: 'components/announcements/announcements.html',
		link: link
	};

	function link(scope, elem, attr) {
		scope.announcements = [];

		announcementsService.get()
		.then(function(response) {
			scope.announcements = scope.announcements.concat(response.data);
		});
	}
}
