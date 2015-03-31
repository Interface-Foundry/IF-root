'use strict';

app.controller('ContestEntriesController', ContestEntriesController);

ContestEntriesController.$inject = ['$scope', '$routeParams', 'Entries', 'worldTree'];

function ContestEntriesController($scope, $routeParams, Entries, worldTree) {

	$scope.hashTag = $routeParams.hashTag;
	$scope.loadEntries = loadEntries;
	$scope.entries = [];
	$scope.region = 'global';
	$scope.style;
	$scope.worldId = $routeParams.worldURL;

	activate();

	function activate() {
		loadEntries();

    worldTree.getWorld($routeParams.worldURL).then(function(data) {
			$scope.style = data.style;
		});
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
}