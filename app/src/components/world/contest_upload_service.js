'use strict';

app.factory('contestUploadService', contestUploadService);

contestUploadService.$inject = ['$upload', '$q', 'geoService', 'worldTree', 'alertManager'];

function contestUploadService($upload, $q, geoService, worldTree, alertManager) {

	return {
		uploadImage: uploadImage
	};

	function uploadImage(file, world, hashtag) {
		var deferred = $q.defer();

		// get time
		var time = new Date();

		var data = {
			world_id: world._id,
			worldID: world.id,
			hashtag: hashtag,
			userTime: time,
			userLat: null,
			userLon: null,
			type: 'retail_campaign'
		};

		// get location
		geoService.getLocation().then(function(coords) {
			data.userLat = coords.lat;
			data.userLon = coords.lng;
			return deferred.resolve(uploadPicture(file, world, data));
		}, function(err) {
			return deferred.resolve(uploadPicture(file, world, data));
		});

		return deferred.promise;
	};

	function uploadPicture(file, world, data) {
		var deferred = $q.defer();

		$upload.upload({
			url: '/api/uploadPicture/',
			file: file,
			data: JSON.stringify(data),
			server: true
		}).progress(function(e) {
		}).success(function(result) {
			showConfirmationMessage();
			worldTree.cacheSubmission(world._id, data.hashtag, result.imgURL);
			deferred.resolve(result);
		}).error(function(error) {
			deferred.reject(error);
		});
		return deferred.promise;
	}

	function showConfirmationMessage() {
		alertManager.addAlert('info', 'Your contest entry was received! Enter as many times as you like.', 2500);
	}
}
