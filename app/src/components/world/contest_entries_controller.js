'use strict';

app.controller('ContestEntriesController', ContestEntriesController);

ContestEntriesController.$inject = ['$scope', '$routeParams', '$rootScope', 'Entries', 'worldTree', 'styleManager'];

function ContestEntriesController($scope, $routeParams, $rootScope, Entries, worldTree, styleManager) {

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
		// $scope.wtgt.building[hashtag] = true;

		var file = $files[0];

		// get time
		var time = new Date();

		var data = {
			world_id: $scope.world._id,
			worldID: $scope.world.id,
			hashtag: $scope.hashtag,
			userTime: time,
			userLat: null,
			userLon: null,
			type: 'retail_campaign'
		};

		// get location
		geoService.getLocation().then(function(coords) {
			// console.log('coords: ', coords);
			data.userLat = coords.lat;
			data.userLon = coords.lng;
			uploadPicture(file, $scope.hashtag, data);
		}, function(err) {
			uploadPicture(file, $scope.hashtag, data);
		});
	};

	function uploadPicture(file, hashtag, data) {

	$scope.upload = $upload.upload({
		url: '/api/uploadPicture/',
		file: file,
		data: JSON.stringify(data)
	}).progress(function(e) {
	}).success(function(data) {
		worldTree.cacheSubmission($scope.world._id, hashtag, data);
		loadEntries();
	});
}
}