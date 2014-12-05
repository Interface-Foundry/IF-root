angular.module('tidepoolsServices')
	.factory('worldTree', ['$cacheFactory', '$q', 'World', 'db', 'geoService',
	function($cacheFactory, $q, World, db, geoService) {

var worldTree = {
	worldCache: $cacheFactory('worlds'),
	styleCache: $cacheFactory('styles'),
	landmarkCache: $cacheFactory('landmarks')
}

worldTree.getWorld = function(id) { //returns a promise with a world and corresponding style object
	var deferred = $q.defer();
	
	var world = worldTree.worldCache.get(id);
	if (world && world.style) {
		var style = worldTree.styleCache.get(world.style.styleID);
			if (style) {
				deferred.resolve({world: world, style: style});
				console.log('world & style in cache!');
			} else {
				askServer();
			}
	} else {
		askServer();
	}
		
	function askServer() {
		World.get({id: id}, function(data) {
			if (data.err) {
				deferred.reject(data.err);
	 		} else {
	 			worldTree.worldCache.put(data.world.id, data.world);
	 			worldTree.styleCache.put(data.style._id, data.style);
		 		deferred.resolve(data);
		 	}
		 });
	}
	
	return deferred.promise;
}

worldTree.getLandmarks = function(_id) { //takes world's _id
	var deferred = $q.defer();
	
	var landmarks = worldTree.landmarkCache.get(_id);
	if (landmarks) {
		deferred.resolve(landmarks);
		console.log('landmarks in cache!');
	} else {
		db.landmarks.query({queryFilter:'all', parentID: _id}, function(data) {
			if (data.err) {
				deferred.reject(data.err);
			} else {
				worldTree.landmarkCache.put(_id, data);
				deferred.resolve(data);
			}
		});
	}
	
	return deferred.promise;
}

worldTree.getLandmark = function(_id, landmarkId) {
	var deferred = $q.defer(), result;
	
	worldTree.getLandmarks(_id).then(function(landmarks) {
		result = landmarks.find(function(landmark, index, landmarks) {
			return landmark.id === landmarkId;
		});
		
		if (result) {
			deferred.resolve(result);
		} else {
			deferred.reject('Landmark not found');
		}
	});	

	return deferred.promise;
}

worldTree.getUpcoming = function(_id) {
	var userTime = new Date(), data = {}, deferred = $q.defer();
	
	db.landmarks.query({queryFilter:'upcoming', parentID: _id, userTime: userTime}, function(uResult){
		data.upcomingIDs = uResult;
		
		db.landmarks.query({queryFilter:'now', parentID: _id, userTime: userTime}, function(nResult){
		console.log('queryFilter:now');
			data.nowID = nResult[0];
			deferred.resolve(data);
		}, function(reason) {
			deferred.reject(reason);
		}); 
	}, function(reason) {
		deferred.reject(reason); 
	});
	
	return deferred.promise;
}

worldTree.getNearby = function() {
	var deferred = $q.defer();
	var now = Date.now();
	
	if (worldTree._nearby && worldTree._nearby.timestamp+60000 < now) {
		deferred.resolve(worldTree._nearby);
	} else {
	geoService.getLocation().then(function(location) {
		db.worlds.query({localTime: new Date(), 
			userCoordinate: [location.lng, location.lat]},
			function(data) {
				worldTree._nearby = data[0];
				worldTree._nearby.timestamp = now;
				deferred.resolve(data[0]);
				//live
				//liveAndInside
			});
	}, function(reason) {
		deferred.reject(reason);
	})
	}
	
	return deferred.promise;
}


return worldTree;
}
]);