'use strict';

app.controller('ContestEntriesController', ContestEntriesController);

ContestEntriesController.$inject = ['$scope', '$routeParams', '$rootScope', 'Entries', 'worldTree', 'styleManager', 'contestUploadService'];

function ContestEntriesController($scope, $routeParams, $rootScope, Entries, worldTree, styleManager, contestUploadService) {

	$scope.hashTag = $routeParams.hashTag;
	$scope.loadEntries = loadEntries;
	$scope.entries = [];
	$scope.region = 'global';
	$scope.style;
	$scope.world;
	$scope.worldId = $routeParams.worldURL;

	activate();

	function activate() {
		loadEntries();

    worldTree.getWorld($routeParams.worldURL).then(function(data) {
			$scope.style = data.style;
			$scope.world = data.world;
			styleManager.navBG_color = $scope.style.navBG_color;
		});
	}

	function loadEntries() {
		Entries.resource.query({
			id: $scope.region
		}, {
			number: $scope.entries.length
		}).$promise
    .then(function(response) {
      $scope.entries = $scope.entries.concat(response);
    }, function(error) {
    	console.log('Error:', error);
    });
	}

	$scope.uploadWTGT = function($files) {
		contestUploadService.uploadImage($files[0], $scope.world, $scope.hashtag)
		.then(function(data) {
			$scope.entries.unshift(data);
		});
	}
}