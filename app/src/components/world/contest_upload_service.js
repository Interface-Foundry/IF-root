'use strict';

app.factory('contestUploadService', contestUploadService);

contestUploadService.$inject = ['$upload', '$q', 'geoService', 'worldTree'];

function contestUploadService($upload, $q, geoService, worldTree) {

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
			return deferred.resolve(uploadPicture(file, data));
		});

		return deferred.promise;
	};

	function uploadPicture(file, world, data) {
		var deferred = $q.defer();

		$upload.upload({
			url: '/api/uploadPicture/',
			file: file,
			data: JSON.stringify(data)
		}).progress(function(e) {
		}).success(function(data) {
			worldTree.cacheSubmission(world._id, data.hashtag, data.imgURL);
			deferred.resolve(data);
		});

		return deferred.promise;
	}
}