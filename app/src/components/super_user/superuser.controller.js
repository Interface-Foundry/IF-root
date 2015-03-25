'use strict';

app.controller('SuperuserController', SuperuserController);

SuperuserController.$inject = ['$scope', 'Announcements','$routeParams'];

function SuperuserController($scope, Announcements, $routeParams) {

	$scope.announcement = {};
	$scope.newAnnouncement = newAnnouncement;
	$scope.region = capitalizeFirstLetter($routeParams.region);
	$scope.routes = ['Global Announcements', 'Contests'];
	$scope.currentRoute = $scope.routes[0];
	$scope.showAddAnnouncement = false;
	$scope.submit = function () {
      console.log('announcement in front end is..', $scope.announcement)
      Announcements.save($scope.announcement).$promise
      .then(function(result) {
        console.log('successfuly created!', result)
      });
    };

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

	function newAnnouncement() {
		$scope.showAddAnnouncement = !$scope.showAddAnnouncement;
	}

	function submit() {
		console.log('Submitted:', vm.announcement);
	}

	function post() {
		Announcments.post({

		})
	}
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