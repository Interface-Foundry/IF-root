'use strict';

app.controller('ContestController', ContestController);

ContestController.$inject = ['$scope', '$routeParams', 'Entries', 'worldTree'];

function ContestController($scope, $routeParams, Entries, worldTree) {

	$scope.hashTag = $routeParams.hashTag;
	$scope.loadEntries = loadEntries;
	$scope.entries = [];
	$scope.region = 'global';
	$scope.style;
	$scope.worldId = $routeParams.worldURL;

	activate();

	function activate() {
		Entries.getValidEntries($scope.region, $scope.entries.length)
    .then(function(response) {
      $scope.entries = response.data;
    }, function(error) {
    	console.log('Error:', error);
    });

    worldTree.getWorld($routeParams.worldURL).then(function(data) {
			$scope.style = data.style;
		});
	}

	function loadEntries() {
		Entries.getValidEntries($scope.region, $scope.entries.length)
    .then(function(response) {
      $scope.entries = $scope.entries.concat(response.data);
    }, function(error) {
    	console.log('Error:', error);
    });
	}
}