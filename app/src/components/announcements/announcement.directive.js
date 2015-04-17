'use strict';

app.directive('announcements', announcements);

announcements.$inject = ['$timeout', 'announcementsService'];

function announcements($timeout, announcementsService) {
	return {
		restrict: 'E',
		scope: {},
		templateUrl: 'components/announcements/announcements.html',
		link: link
	};

	function link(scope, elem, attr) {

		scope.announcements = [];
		// scope.chevron = angular.element('.announcement-chevron');
		scope.index = 0;
		// scope.nextCard = nextCard;
		scope.region = 'global';

		activate();

		function activate() {
			announcementsService.get()
			.then(function(response) {
				scope.announcements = scope.announcements.concat(response.data);
				console.log('response data for announcements is..: ', response.data)
				// scope.announcements.push(scope.allCaughtUp);
			}, function(error) {
				console.log('Error', error);
			});
		}

		// function nextCard() {
			// scope.chevron = !!scope.chevron.length ? scope.chevron : angular.element('.announcement-chevron');
			// scope.chevron.animate({opacity: 0}, 350);
			// if (scope.index < scope.announcements.length - 1) {
			// 	scope.index++;
				// $timeout(function() {
				// 	scope.chevron.animate({opacity: 1}, 400);
				// }, 650);
			// }
		// }
	}
}
