'use strict';

app.controller('ContestController', ContestController);

ContestController.$inject = ['$routeParams', 'Entries'];

function ContestController($routeParams, Entries) {

	$scope.dummyData = dummyData;
	$scope.hashTag = $routeParams.hashTag;
	$scope.loadPictures = loadPictures;
	$scope.entries = [];
	$scope.worldId = $routeParams.worldURL;

	// activate();
	dummyData()
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



	function loadEntries() {
		// contestService.getentries($scope.entries.length, $scope.worldId, $scope.hashTag)
		// .then(function(response) {
		// 	$scope.entries = $scope.entries.concat(response.data);
		// });
		Entries.query({
			id: $scope.region
		}, {
			number: $scope.entries.length
		}).$promise
    .then(function(response) {
      $scope.entries.push(response);
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