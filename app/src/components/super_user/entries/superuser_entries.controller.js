'use strict';

app.controller('SuperuserEntriesController', SuperuserEntriesController);

SuperuserEntriesController.$inject = ['$scope', 'Entries','$routeParams', '$location', 'superuserService'];

function SuperuserEntriesController($scope, Entries, $routeParams, $location, superuserService) {

	$scope.currentRoute = superuserService.getCurrentRoute();
	$scope.deleteEntry = deleteEntry;
	$scope.entries = [];
	$scope.loadEntries = loadEntries;
	$scope.region = $routeParams.region;
	$scope.routes = superuserService.routes;
	$scope.toggleValidity = toggleValidity;
	
	activate();

	function activate() {
		Entries.resource.query({
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
			Entries.resource.remove({
				id: $scope.entries[$index]._id
			})
			.$promise
			.then(function(response) {
				$scope.entries = response;
			}, function(error) {
				console.log('Error:', error);
			});
		}
	}

	function loadEntries() {
		Entries.resource.query({
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

	function toggleValidity($index) {
  	$scope.entries[$index].valid = !$scope.entries[$index].valid;
  	Entries.resource.update({
  		id: $scope.entries[$index]._id
  	}, $scope.entries[$index]);		
	}


}