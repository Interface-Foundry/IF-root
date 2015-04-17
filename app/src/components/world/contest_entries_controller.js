'use strict';

app.controller('ContestEntriesController', ContestEntriesController);

ContestEntriesController.$inject = ['$scope', '$routeParams', '$rootScope', '$timeout', 'Entries', 'worldTree', 'styleManager', 'contestUploadService', 'userManager', 'alertManager', 'dialogs', 'contest'];

function ContestEntriesController($scope, $routeParams, $rootScope, $timeout, Entries, worldTree, styleManager, contestUploadService, userManager, alertManager, dialogs, contest) {

	$scope.hashtag = $routeParams.hashTag;
	$scope.loadEntries = loadEntries;
	$scope.entries = [];
	$scope.region = 'global';
	$scope.style;
	$scope.uploadWTGT = uploadWTGT;
	$scope.verifyUpload = verifyUpload;
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

	function verifyUpload(event) {
		// stops user from uploading wtgt photo if they aren't logged in
		if (!userManager.loginStatus) {
			event.stopPropagation();
			alertManager.addAlert('info', 'Please sign in before uploading your photo', true);
			$timeout(function() {
				$scope.setShowSplash('splash', true);
				contest.set($scope.hashtag);
			}, 2000);	
		}
	}

	function uploadWTGT($files) {
		var hashtag = '#' + $scope.hashtag;
		contestUploadService.uploadImage($files[0], $scope.world, hashtag)
		.then(function(data) {
			$scope.entries.unshift(data);
		});
	}
}