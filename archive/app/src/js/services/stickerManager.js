app.factory('stickerManager', ['$http', '$q', function($http, $q) {
var stickerManager = {
	
}//manages interfacing with stickers on the server

stickerManager.postSticker = function(sticker) {
	var deferred = $q.defer();
	console.log(sticker);
	$http.post('/api/stickers/create', sticker, {server: true})
		.success(function(success) {
			console.log(success);
			deferred.resolve(success);
		})
		.error(function(error) {
			console.log(error)
			deferred.reject(error);
		})

	return deferred.promise;
}

stickerManager.getStickers = function(stickerReq) {
	var deferred = $q.defer();
	console.log(stickerReq);
	$http.get('/api/stickers/', {params: {'worldID': stickerReq._id}, server: true})
		.success(function(result) {
			console.log(result);
			deferred.resolve(result);
		})
		.error(function(error) {
			console.log(error);
			deferred.reject(error);
		})		
	return deferred.promise;
}

stickerManager.getSticker = function(_id) {
	var deferred = $q.defer();
	$http.get('/api/stickers/'+_id, {server: true})
		.success(function(result) {
			console.log(result);
			deferred.resolve(result);
		})
		.error(function(error) {
			console.log(error);
			deferred.reject(error);
		})
	return deferred.promise;
}

//loc: Objectcoordinates: Array[2]0: -73.989127278327961: 40.74133129511772
// Array[2]0: -73.989127278327961: 40.74133129511772


return stickerManager;
}]);