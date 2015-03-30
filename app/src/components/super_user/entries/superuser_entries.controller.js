'use strict';

app.controller('SuperuserEntriesController', SuperuserEntriesController);

SuperuserEntriesController.$inject = ['$scope', 'Entries','$routeParams', '$location', 'superuserService'];

function SuperuserEntriesController($scope, Entries, $routeParams, $location, superuserService) {

	$scope.currentRoute = superuserService.getCurrentRoute();
	$scope.entries = [];
	$scope.region = $routeParams.region;
	$scope.routes = superuserService.routes;
	$scope.toggleValidity = toggleValidity;
	
	activate();

	function activate() {
		Entries.query({
			id: $scope.region
		}, {
			number: $scope.entries.length
		}).$promise
    .then(function(response) {
      $scope.entries = response;
    }, function(error) {
    	console.log('Error:', error);
    });
	}

	$scope.changeRoute = function() {
		superuserService.changeRoute($scope.currentRoute, $scope.region);
	}

	function deleteEntry($index) {
		var deleteConfirm = confirm("Are you sure you want to delete this?");
		if (deleteConfirm) {
			Entries.remove({
				id: $scope.entries[$index]._id
			})
			.$promise
			.then(function(response) {
				$scope.entries = response;
			});
		}
	}

	function toggleValidity($index) {
  	$scope.entries[$index].valid = !$scope.entries[$index].valid;
  	entries.update({
  		id: $scope.entries[$index]._id
  	}, $scope.entries[$index]);		
	}


}