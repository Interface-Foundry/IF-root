angular.module('tidepoolsServices')
	.factory('worldTree', ['$cacheFactory', '$q', 'World', 'db',
	function($cacheFactory, $q, World, db) {

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

return worldTree;
}
]);