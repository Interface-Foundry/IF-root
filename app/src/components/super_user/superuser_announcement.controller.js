'use strict';

app.controller('SuperuserAnnouncementController', SuperuserAnnouncementController);

SuperuserAnnouncementController.$inject = ['$scope', 'Announcements','$routeParams', '$location'];

function SuperuserAnnouncementController($scope, Announcements, $routeParams, $location) {

	$scope.announcement = {};
	$scope.announcements = [];
	$scope.changeAnnouncementOrder = changeAnnouncementOrder;
	$scope.deleteAnnouncement = deleteAnnouncement;
	$scope.edit = false;
	$scope.editAnnouncement = editAnnouncement;
	$scope.editIndex;
	$scope.region = capitalizeFirstLetter($routeParams.region);
	$scope.routes = ['Announcements', 'Contests'];
	$scope.currentRoute = $location.path().indexOf('announcements') >= 0 ? $scope.routes[0] : $scope.routes[1];
	$scope.resetAnnouncement = resetAnnouncement;
	$scope.showAddAnnouncement = false;
	$scope.showAddContest = false;
	$scope.toggleNewAnnouncement = toggleNewAnnouncement;
	$scope.toggleNewContest = toggleNewContest;
	$scope.toggleDraftState = toggleDraftState;
	$scope.updateAnnouncement = updateAnnouncement;

	activate();

	function activate() {
		resetAnnouncement();
		Announcements.query({
			id: $scope.region
		}).$promise
	    .then(function(response) {
	      $scope.announcements = response;
	    });
	}

	// can make this into a filter
	function capitalizeFirstLetter(input) {
		return input[0].toUpperCase() + input.slice(1);
	}

	function changeAnnouncementOrder(index, direction) {
		Announcements.sort({
			id: $scope.announcements[index]._id
		}, {
			dir: direction,
			priority: $scope.announcements[index].priority
		})
		.$promise
		.then(function(response) {
			$scope.announcements = response;
		});
	}

	$scope.changeRoute = function() {
		$location.path('/su/' + $scope.currentRoute.toLowerCase() + '/' + $scope.region.toLowerCase());
	}

	function deleteAnnouncement(index) {
		var deleteConfirm = confirm("Are you sure you want to delete this?");
		if (deleteConfirm) {
			Announcements.remove({
				id: $scope.announcements[index]._id
			})
			.$promise
			.then(function(response) {
				$scope.announcements = response;
			});
		}
	}

	function editAnnouncement(index) {
		var tempAnnouncement = {};
		angular.copy($scope.announcements[index], tempAnnouncement);
		$scope.announcement = tempAnnouncement;
		$scope.edit = true;
		$scope.editIndex = index;
		$scope.showAddAnnouncement = true;
	}

	function resetAnnouncement() {
		$scope.announcement = {
			live: false,
			region: 'global'
		};
	}

	$scope.submitAnnouncement = function (form) {
		if (form.$invalid) {
			console.log('Form is missing required fields.');
			return;
		}
    Announcements.save($scope.announcement).$promise
    .then(function(announcements) {
      resetAnnouncement();
      $scope.announcements = announcements;
      toggleNewAnnouncement();
    }, function(error) {
    	console.log(error.data);
    });
  };

	function toggleNewAnnouncement() {
		$scope.showAddAnnouncement = !$scope.showAddAnnouncement;
		$scope.showAddContest = false;
	}

	function toggleNewContest() {
		$scope.showAddContest = !$scope.showAddContest;
		$scope.showAddAnnouncement = false;
	}

  function toggleDraftState(index) {
  	$scope.announcements[index].live = !$scope.announcements[index].live;
  	Announcements.update({
  		id: $scope.announcements[index]._id
  	}, $scope.announcements[index]);
  }

  function updateAnnouncement(form) {
  	if (form.$invalid) {
  		console.log('Form is missing required fields.');
  		return;
  	}
  	$scope.announcement.live = false;
  	Announcements.update({
  		id: $scope.announcement._id
  	}, $scope.announcement)
  	.$promise
  	.then(function(response) {
  		$scope.announcements[$scope.editIndex] = response;
  		toggleNewAnnouncement();
  	});	
  }
}