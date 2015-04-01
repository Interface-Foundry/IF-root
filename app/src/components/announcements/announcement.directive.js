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
		var announcement = {
			"_id" : "5515705c2e2248e875be5b8c",
			"urlName" : "Tap here to learn more...",
			"urlPath" : "fake/url/path",
			"body" : "Phasellus eget augue ut tortor tincidunt tempor vitae at mi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Proin malesuada vehicula tristique.",
			"headline" : "Win $100 Gift Cards!",
			"timestamp" : "2015-03-27T14:59:40.118Z",
			"region" : "global",
			"live" : true,
			"priority" : 1,
			"__v" : 0
		};

		var announcement2 = { "_id" : "551ad01b51e27cbc7e415f55", "urlName" : "Click here to learn more", "urlPath" : "/contest/global", "body" : "Win $$$!", "headline" : "Contest!", "timestamp" : "2015-03-31T16:49:31.588Z", "region" : "global", "live" : false, "priority" : 2, "__v" : 0 }

		scope.allCaughtUp = {
			headline: 'All caught up!',
			body: ':)'
		};
		scope.announcements = [];
		scope.currentAnnouncement = {};
		scope.end = false;
		scope.index = 0;
		scope.nextCard = nextCard;

		// activate();
		fakeData();

		function activate() {
			announcementsService.get()
			.then(function(response) {
				scope.announcements = scope.announcements.concat(response.data);
				scope.currentAnnouncement = scope.announcements[scope.index];
			}, function(error) {
				console.log('Error', error);
			});
		}

		function fakeData() {
			scope.announcements.push(announcement);
			scope.announcements.push(announcement2);
			scope.currentAnnouncement = scope.announcements[scope.index];
		}

		function nextCard() {
			scope.index++;
			if (scope.announcements[scope.index]) {
				scope.currentAnnouncement = scope.announcements[scope.index];
			} else {
				scope.currentAnnouncement = scope.allCaughtUp;
				scope.end = true;
			}
		}

	}
}
