angular.module('tidepoolsServices')


	.factory('worldTree', ['$cacheFactory', '$q','$rootScope','$timeout', 'World', 'db', 'geoService', '$http', '$location', 'alertManager', 'bubbleTypeService', 'navService', 'mapManager', 'currentWorldService',
	function($cacheFactory, $q, $rootScope, $timeout, World, db, geoService, $http, $location, alertManager, bubbleTypeService, navService, mapManager, currentWorldService) {


var worldTree = {
	worldCache: $cacheFactory('worlds'),
	styleCache: $cacheFactory('styles'),
	landmarkCache: $cacheFactory('landmarks'),
	contestCache: $cacheFactory('contest'),
	submissionCache: $cacheFactory('submission')
}

var alert = alertManager;

worldTree.getWorld = function(id) { //returns a promise with a world and corresponding style object
	var deferred = $q.defer();

	var world = worldTree.worldCache.get(id);
	if (world && world.style) {
		console.log('world and world style');
		bubbleTypeService.set(world.category);
		if (mapManager.localMapArrayExists(world)) {
			currentWorldService.createFloorDirectory(world.style.maps.localMapArray);
		}
		var style = worldTree.styleCache.get(world.style.styleID);
			if (style) {
				if (world.category === 'Retail') {
					var contest = worldTree.contestCache.get('active');
					if (!contest) {
						askServer();
						return deferred.promise;
					}
					var submissions = [];
					var worldSubs = worldTree.submissionCache.get(world._id);
					if (worldSubs) {
						submissions.push(worldSubs[contest.contestTags[0].tag]);
						submissions.push(worldSubs[contest.contestTags[1].tag]);
					}
				}
				
				deferred.resolve({
					world: world,
					style: style,
					contest: contest,
					submissions: submissions
				});
				console.log('world & style in cache!');
			} else {
				console.log('missing style');
				askServer();
			}
	} else {
		askServer();
	}

	function askServer() {
		console.log('ask server')
		World.get({id: id}, function(data) {
			if (data.err) {
				deferred.reject(data.err);
				// $location.path('/w/404');
	 		} else {
	 			// TODO: decide if we need a time limit or space limit on cached worlds
	 			worldTree.worldCache.put(data.world.id, data.world);
	 			worldTree.styleCache.put(data.style._id, data.style);
	 			worldTree.contestCache.put('active', data.contest);
				if (!(_.isEmpty(data.submissions))) {
					var submissions = {};
					data.submissions.forEach(function(s) {
						submissions[s.hashtag] = s;
					});
					worldTree.submissionCache.put(data.world._id, submissions);
				}

		 		deferred.resolve(data);
		 		bubbleTypeService.set(data.world.category);
		 		if (mapManager.localMapArrayExists(data.world)) {
					currentWorldService.createFloorDirectory(data.world.style.maps.localMapArray);
				}
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
				worldTree.clearCache('landmarkCache');
				worldTree.landmarkCache.put(_id, success.landmarks);
				deferred.resolve(success.landmarks);
			})
			.error(function(err) {
				console.log(err);
				deferred.resolve(err)
			});
	}
	
	return deferred.promise;
}

worldTree.getLandmark = function(_id, landmarkId) {
	var deferred = $q.defer(), result;
	
	worldTree.getLandmarks(_id).then(function(landmarks) {
		result = landmarks.find(function(landmark, index, landmarks) {
			return landmark.id.toLowerCase() === landmarkId.toLowerCase();
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

function getLocationInfoFromIP(deferredObj) {
	var data = {
		server: true,
		params: {
			hasLoc: false
		}
	};
	$http.get('/api/geolocation', data).
		success(function(locInfo) {
			var locationData = {
				lat: locInfo.lat,
				lng: locInfo.lng,
				cityName: locInfo.cityName,
				src: locInfo.src,
				timestamp: Date.now()
			};

			geoService.updateLocation(locationData);

			db.worlds.query({localTime: new Date(), 
				userCoordinate: [locationData.lng, locationData.lat]},
				function(data) {
					worldTree._nearby = data[0];
					worldTree._nearby.timestamp = Date.now() / 1000;
					if (deferredObj) deferredObj.resolve(data[0]);
					
					worldTree.cacheWorlds(data[0]['150m']);
					worldTree.cacheWorlds(data[0]['2.5km']);
				});
		}).
		error(function(err) {
			console.log('err: ', err);
		});
}

worldTree.getNearby = function() {

	var deferred = $q.defer();
	var now = Date.now() / 1000;

	var useIP = true;

	if (worldTree._nearby && (worldTree._nearby.timestamp + 30) > now) {
		deferred.resolve(worldTree._nearby);
	} else {
		console.log('nearbies not cached');

		// use IP after geoService.geoTimeout time if for any reason we can't get user's geolocation. could be geo taking too long, user denied request for geo, user didn't accept or reject request, etc.
		$timeout(function() {
			if (useIP) {
				// use last known location if we have it, before resorting to IP
				if (geoService.location.cityName && geoService.location.lat) {
					db.worlds.query({
						localTime: new Date(), 
						userCoordinate: [geoService.location.lng, geoService.location.lat]
					}, function(data) {
						worldTree._nearby = data[0];
						worldTree._nearby.timestamp = now;
						deferred.resolve(data[0]);
						
						worldTree.cacheWorlds(data[0]['150m']);
						worldTree.cacheWorlds(data[0]['2.5km']);
					});
				} else {
					getLocationInfoFromIP(deferred);
				}
			}
		}, geoService.geoTimeout);

		// cache location for geoService.cacheTime. wait for geoService.geoTimeout before resorting to IP based location
		geoService.getLocation(geoService.cacheTime).then(function(location) {
			useIP = false;

			// get city info
			var data = {
				server: true,
				params: {
					hasLoc: true,
					lat: location.lat,
					lng: location.lng
				}
			};
			$http.get('/api/geolocation', data).
				success(function(locInfo) {
					location.cityName = locInfo.cityName;
					location.timestamp = Date.now();
					location.src = locInfo.src;

					geoService.updateLocation(location);

					db.worlds.query({localTime: new Date(), 
						userCoordinate: [location.lng, location.lat]},
						function(data) {
							worldTree._nearby = data[0];
							worldTree._nearby.timestamp = now;
							deferred.resolve(data[0]);
							
							worldTree.cacheWorlds(data[0]['150m']);
							worldTree.cacheWorlds(data[0]['2.5km']);
						});
				}).
				error(function(err) {
					console.log('er: ', err);
				});

		}, function(reason) {
			useIP = false;

			// get city info and query world using IP
			getLocationInfoFromIP(deferred);

			// deferred.reject(reason);
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

worldTree.clearCache = function(cache) {
	worldTree[cache].removeAll();
}

worldTree.cacheSubmission = function(worldId, hashtag, imgURL) {
	var worldSubmissions = worldTree.submissionCache.get(worldId) || {};
	worldSubmissions[hashtag] = {
		hashtag: hashtag,
		imgURL: imgURL
	};
	worldTree.submissionCache.put(worldId, worldSubmissions);
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
	
	var world = {newStatus: true};
	
	db.worlds.create(world, function(response){
		console.log('##Create##');
		console.log('response', response);
		$location.path('/edit/walkthrough/'+response[0].worldID);
		navService.reset();
	});
}

return worldTree;
}
]);
