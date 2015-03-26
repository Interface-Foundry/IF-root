'use strict';

app.controller('SuperuserController', SuperuserController);

SuperuserController.$inject = ['$scope', 'Announcements','$routeParams', '$location'];

function SuperuserController($scope, Announcements, $routeParams, $location) {

	$scope.announcement = {
		region: 'global'
	};
	$scope.newAnnouncement = newAnnouncement;
	$scope.region = capitalizeFirstLetter($routeParams.region);
	$scope.routes = ['Announcements', 'Contests'];
	$scope.currentRoute = $location.path().indexOf('announcements') >= 0 ? $scope.routes[0] : $scope.routes[1];
	$scope.showAddAnnouncement = false;
	$scope.showAddContest = false;
	$scope.url = {};


	activate();

	function activate() {
		Announcements.query({id: $scope.region}).$promise
	    .then(function(as) {
	      $scope.as = as;
	    });
	}

	// can make this into a filter
	function capitalizeFirstLetter(input) {
		return input[0].toUpperCase() + input.slice(1);
	}

	$scope.changeRoute = function() {
		$location.path('/su/' + $scope.currentRoute.toLowerCase() + '/' + $scope.region.toLowerCase());
	}


	function createAnnouncementUrl() {
		return '<a href="' + $scope.url.path + '">' + $scope.url.name + '</a>';
	}

	function newAnnouncement() {
		$scope.showAddAnnouncement = !$scope.showAddAnnouncement;
		$scope.showAddContest = false;
	}

	function newContest() {
		$scope.showAddContest = !$scope.showAddContest;
		$scope.showAddAnnouncement = false;
	}

	$scope.submitAnnouncement = function () {
    $scope.announcement.URL = createAnnouncementUrl();
    console.log('announcement in front end is..', $scope.announcement);
    Announcements.save($scope.announcement).$promise
    .then(function(result) {
      console.log('successfuly created!', result)
      $scope.announcement = {};
      $scope.url = {};
      newAnnouncement();
    });
  };
}



// var announcementsSchema = mongoose.Schema({
//     headline: {
//         type: String,
//         required: true
//     }, 
//     body: {
//         type: String,
//         required: true
//     }, 
//     URL: {
//         type: String,
//         required: true
//     }, 
//     priority: {type: Number},
//     live: {type: Boolean},
//     imgURL: {
//         type: String,
//         required: true
//     },
//     region: {
//         type: String,
//         default: 'global'
//     },
//     timestamp: { type: Date, default: Date.now }
// });

