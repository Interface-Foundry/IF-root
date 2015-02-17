angular.module('tidepoolsServices')
	.factory('worldTree', ['$cacheFactory', '$q', 'World', 'db', 'geoService', '$http', '$location', 'alertManager', 
	function($cacheFactory, $q, World, db, geoService, $http, $location, alertManager) {

var worldTree = {
	worldCache: $cacheFactory('worlds'),
	styleCache: $cacheFactory('styles'),
	landmarkCache: $cacheFactory('landmarks')
}

var alert = alertManager;

worldTree.getWorld = function(id) { //returns a promise with a world and corresponding style object
	var deferred = $q.defer();
	
	var world = worldTree.worldCache.get(id);
	if (world && world.style) {
		var style = worldTree.styleCache.get(world.style.styleID);
			if (style) {
				deferred.resolve({world: world, style: style});
				console.log('world & style in cache!');
			} else {
				console.log('missing style');
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
	console.log('getLandmarks');
	var landmarks = worldTree.landmarkCache.get(_id);
	if (landmarks) {
		deferred.resolve(landmarks);
		console.log('landmarks in cache!');
	} else {
		$http.get('/api/landmarks', {params: {parentID: _id}, server: true})
			.success(function(success) {
				console.log(success);
				deferred.resolve(success.landmarks)})
			.error(function(err) {
				console.log(success);
				deferred.resolve(err)});
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
	
	//current nearby format
	//{150m: [worlds],
	// 150mPast: [worlds],
	// 2.5k: [worlds],
	// 2.5kPast: [worlds]}
	
	var deferred = $q.defer();
	var now = Date.now() / 1000;

	if (worldTree._nearby && (worldTree._nearby.timestamp + 30) > now) {
		deferred.resolve(worldTree._nearby);
	} else {
		console.log('nearbies not cached');
	geoService.getLocation().then(function(location) {
		db.worlds.query({localTime: new Date(), 
			userCoordinate: [location.lng, location.lat]},
			function(data) {
				worldTree._nearby = data[0];
				worldTree._nearby.timestamp = now;
				deferred.resolve(data[0]);
				
				worldTree.cacheWorlds(data[0]['150m']);
				worldTree.cacheWorlds(data[0]['2.5km']);
			});
	}, function(reason) {
		deferred.reject(reason);
	})
	}
	
	return deferred.promise;
}

worldTree.cacheWorlds = function(worlds) {
	if (!worlds) {return}
	worlds.forEach(function(world) {
		worldTree.worldCache.put(world.id, world);
	});
}

worldTree.getUserWorlds = function(_id) {
	console.log('getUserWorlds')
	var now = Date.now() / 1000; 
	
	if (_id) {
		//other user -- need api endpoint
	} else if (worldTree._userWorlds && (worldTree._userWorlds.timestamp + 60) > now) {
		return $q.when(worldTree._userWorlds);
	} else {
		return $http.get('/api/user/profile', {server: true}).success(function(bubbles){	
			worldTree._userWorlds = bubbles;
			worldTree._userWorlds.timestamp = now;
			worldTree.cacheWorlds(bubbles);
		});
	}
}

worldTree.createWorld = function() {
	//@IFDEF PHONEGAP
	alert.addAlert('warning', "Creating New Bubbles coming soon to the iOS app. For now, login to build through https://bubbl.li", true);
	return;
	//@ENDIF
	
	var world = {newStatus: true};
	
	db.worlds.create(world, function(response){
		console.log('##Create##');
		console.log('response', response);
		$location.path('/edit/walkthrough/'+response[0].worldID);
	});
}

return worldTree;
}
]);