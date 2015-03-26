'use strict';

app.controller('SuperuserController', SuperuserController);

SuperuserController.$inject = ['$scope', 'Announcements','$routeParams', '$location'];

function SuperuserController($scope, Announcements, $routeParams, $location) {

	$scope.announcement = {};
	$scope.deleteAnnouncement = deleteAnnouncement;
	$scope.toggleNewAnnouncement = toggleNewAnnouncement;
	$scope.toggleNewContest = toggleNewContest;
	$scope.region = capitalizeFirstLetter($routeParams.region);
	$scope.routes = ['Announcements', 'Contests'];
	$scope.currentRoute = $location.path().indexOf('announcements') >= 0 ? $scope.routes[0] : $scope.routes[1];
	$scope.showAddAnnouncement = false;
	$scope.showAddContest = false;

	activate();

	function activate() {
		resetAnnouncement();
		Announcements.query({
			id: $scope.region
		}).$promise
	    .then(function(as) {
	      $scope.as = as;
	      console.log(as)
	    });
	}

	// can make this into a filter
	function capitalizeFirstLetter(input) {
		return input[0].toUpperCase() + input.slice(1);
	}

	$scope.changeRoute = function() {
		$location.path('/su/' + $scope.currentRoute.toLowerCase() + '/' + $scope.region.toLowerCase());
	}

	function deleteAnnouncement(index) {
		var deleteConfirm = confirm("Are you sure you want to delete this?");
		if (deleteConfirm) {
			Announcements.remove({
				_id: $scope.as[index]._id
			})
			.$promise
			.then(function(response) {
				$scope.as = response;
			});
		}
	}

	function toggleNewAnnouncement() {
		$scope.showAddAnnouncement = !$scope.showAddAnnouncement;
		$scope.showAddContest = false;
	}

	function toggleNewContest() {
		$scope.showAddContest = !$scope.showAddContest;
		$scope.showAddAnnouncement = false;
	}

	function resetAnnouncement() {
		$scope.announcement = {
			live: false,
			region: 'global'
		};
	}

	$scope.submitAnnouncement = function () {
    console.log('announcement in front end is..', $scope.announcement);
    Announcements.save($scope.announcement).$promise
    .then(function(result) {
      console.log('successfuly created!', result)
      resetAnnouncement();
      $scope.as = result;
      toggleNewAnnouncement();
    }, function(error) {
    	console.log(error.data);
    });
  };
}