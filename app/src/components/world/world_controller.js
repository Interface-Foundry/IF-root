function WorldController( World, db, $routeParams, $scope, $location, leafletData, $rootScope, apertureService, mapManager, styleManager, socket, $sce, worldTree, $q) {

	var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];
	zoomControl.style.top = "60px";
	zoomControl.style.left = "1%";

    var map = mapManager;
    	map.resetMap();
  	var style = styleManager;
  	$scope.worldURL = $routeParams.worldURL;  
    $scope.aperture = apertureService;	
    $scope.aperture.set('off');
	
    angular.extend($rootScope, {loading: false});
	
	$scope.selectedIndex = 0;
	
	var landmarksLoaded;
	
  	$scope.filterCategory = function(c) {
	  	console.log('--goToCategory--');
	  	$scope.aperture.set('half');
	  	
	  	redoMarkers($scope.landmarks, c);
	}
	 
	 $scope.returnToWorld = function() {
		 redoMarkers($scope.landmarks);
	 }


  	//currently only for upcoming...
  	function setLookup() {
	  	$scope.lookup = {}; 
	  	
	  	for (var i = 0, len = $scope.landmarks.length; i<len; i++) {
		  	$scope.lookup[$scope.landmarks[i]._id] = i;
	  	}
	  	console.log($scope.lookup);
  	}
  	
  	
  	function reorderById (idArray) {
  		console.log('reorderById');
	  	
	  	$scope.upcoming = [];
	  	for (var i = 0, len = idArray.length; i<len; i++) {
		  	$scope.upcoming[i] = $scope.landmarks.splice($scope.lookup[idArray[i]._id],1)[0];
	  	}
	  	
	  	console.log($scope.upcoming);
  	}
  	
  	
  	$scope.loadWorld = function(data) {
	  	 $scope.world = data.world;
		 $scope.style = data.style;
		 style.navBG_color = $scope.style.navBG_color;
		 

		 console.log($scope.world);
		 console.log($scope.style);
		 
		 if ($scope.world.name) {
			 angular.extend($rootScope, {globalTitle: $scope.world.name});
		 }
		 
		//switching between descrip and summary for descrip card
		if ($scope.world.description || $scope.world.summary) {
			$scope.description = true;
			if ($scope.world.description){
				$scope.descriptionType = "description";
			}
			else {
				$scope.descriptionType = "summary";
			}
		}
		
		var zoomLevel = 19;
		
		if ($scope.world.hasOwnProperty('loc') && $scope.world.loc.hasOwnProperty('coordinates')) {
		map.setCenter([$scope.world.loc.coordinates[0], $scope.world.loc.coordinates[1]], zoomLevel, $scope.aperture.state);
		} else {
			console.error('No center found! Error!');
		}
		
		if ($scope.world.style.hasOwnProperty('maps')) {
			if ($scope.world.style.maps.localMapID) {
			map.addOverlay($scope.world.style.maps.localMapID, 
							$scope.world.style.maps.localMapName, 
							$scope.world.style.maps.localMapOptions);
			}
			if ($scope.world.style.maps.hasOwnProperty('localMapOptions')) {
				zoomLevel = $scope.world.style.maps.localMapOptions.maxZoom || 19;
			}
		
			if (tilesDict.hasOwnProperty($scope.world.style.maps.cloudMapName)) {
				map.setBaseLayer(tilesDict[$scope.world.style.maps.cloudMapName]['url']);
			} else if ($scope.world.style.maps.hasOwnProperty('cloudMapID')) {
				map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/'+$scope.world.style.maps.cloudMapID+'/{z}/{x}/{y}.png');
			} else {
				console.warn('No base layer found! Defaulting to forum.');
				map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/interfacefoundry.jh58g2al/{z}/{x}/{y}.png');
			}
		}
		
		$scope.loadLandmarks();
  	}
  	
  	function loadWidgets() {
		console.log($scope.world);
		if ($scope.style.widgets) {
		if ($scope.style.widgets.twitter) {
			$scope.twitter = true;
		}
		if ($scope.style.widgets.instagram) {
			$scope.instagram = true;
		}
		if ($scope.world.id == "StartFast_Demo_Day_2014") {
			console.log('wyzerr');
			$scope.wyzerr = true;
		}
		
		if ($scope.style.widgets.category) {
			$scope.category = true;
		}
		
	  	if ($scope.style.widgets.upcoming) {
	  		$scope.upcoming = true;
	  		var userTime = new Date();
	  		db.landmarks.query({queryFilter:'now', parentID: $scope.world._id, userTime: userTime}, function(data){
				console.log('queryFilter:now');
				console.log(data);
				if (data[0]) $scope.now = $scope.landmarks.splice($scope.lookup[data[0]._id],1)[0];
				console.log($scope.now);
			}); 
			
			db.landmarks.query({queryFilter:'upcoming', parentID: $scope.world._id, userTime: userTime}, function(data){
				console.log('queryFilter:upcoming');
				console.log(data);
				//console.log(angular.fromJson(data[0]));
				reorderById(data);
			}); 
		}
		}
		
	   if ($scope.world.resources) {
		$scope.tweets = db.tweets.query({limit:1, tag:$scope.world.resources.hashtag});
	    $scope.instagrams = db.instagrams.query({limit:1, tag:$scope.world.resources.hashtag});
	    }
	     	 
	}

  	$scope.loadLandmarks = function(data) {
  		console.log('--loadLandmarks--');
  		//STATE: EXPLORE
	  	db.landmarks.query({queryFilter:'all', parentID: $scope.world._id}, function(data) { 
	  		console.log(data);
	  		$scope.landmarks = data;
	  		console.log($scope.landmarks);
	  		setLookup();
	  		loadWidgets(); //load widget data
	  		initLandmarks($scope.landmarks);
	  	});
  	}
  	
  	function initLandmarks(landmarks) {
	  	angular.forEach($scope.landmarks, function(landmark) {
					map.addMarker(landmark._id, {
						lat:landmark.loc.coordinates[1],
						lng:landmark.loc.coordinates[0],
						draggable:false,
						message:'<a href="#/w/'+$scope.world.id+'/'+landmark.id+'">'+landmark.name+'</a>',
						icon: {
			  				/*iconUrl: 'img/marker/red-marker-100.png',
			  				iconSize: [100,100],
			  				iconAnchor: [50, 100],
			  				shadowUrl: '',
			  				shadowRetinaUrl: '',
			  				shadowSize: [0,0],
			  				popupAnchor: [0, -80]*/
		  				},
						_id: landmark._id
					});
				});
  	}

	/*
World.get({id: $routeParams.worldURL}, function(data) {
		 if (data.err) {
		 	console.log('Data error! Returning to root!');
		 	console.log(data.err);
		 	$location.path('/#/');
		 } else {
			$scope.loadWorld(data); 
		}
	});
*/
		
	worldTree.getWorld($routeParams.worldURL).then(function(data) {
		console.log('worldtree success');
		console.log(data);
		$scope.loadWorld(data);
	}, function(error) {
		console.log(error);
		//handle this better
	});
}


function WorldRepeatController($scope) {
	
}

function UpcomingController($scope) {
	
}