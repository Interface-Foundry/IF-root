'use strict';

app.controller('ContestController', ContestController);

ContestController.$inject = ['$scope', '$routeParams', 'Entries'];

function ContestController($scope, $routeParams, Entries) {

	$scope.hashTag = $routeParams.hashTag;
	$scope.loadEntries = loadEntries;
	$scope.entries = [];
	$scope.region = 'global';
	$scope.worldId = $routeParams.worldURL;

	activate();

	function activate() {
		Entries.getValidEntries($scope.region, $scope.entries.length)
    .then(function(response) {
      $scope.entries = response.data;
    }, function(error) {
    	console.log('Error:', error);
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