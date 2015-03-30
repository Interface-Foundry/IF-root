'use strict';

app.controller('ContestController', ContestController);

ContestController.$inject = ['$scope', '$routeParams', 'Entries'];

function ContestController($scope, $routeParams, Entries) {

	$scope.dummyData = dummyData;
	$scope.hashTag = $routeParams.hashTag;
	$scope.loadEntries = loadEntries;
	$scope.entries = [];
	$scope.region = 'global';
	$scope.worldId = $routeParams.worldURL;

	activate();
	// dummyData()
	function activate() {
		Entries.getValidEntries($scope.region, $scope.entries.length)
    .then(function(response) {
      $scope.entries = response.data;
    }, function(error) {
    	console.log('Error:', error);
    });
	}



	function loadEntries() {
		// contestService.getentries($scope.entries.length, $scope.worldId, $scope.hashTag)
		// .then(function(response) {
		// 	$scope.entries = $scope.entries.concat(response.data);
		// });
		Entries.getValidEntries($scope.region, $scope.entries.length)
    .then(function(response) {
      $scope.entries.push(response.data);
    }, function(error) {
    	console.log('Error:', error);
    });
	}

	function dummyData() {
		console.log("FILLING DUMMY DATA")
		for (var i = 0; i < 20; i++) {
			$scope.entries.push('data' + i);
		}
	}
}