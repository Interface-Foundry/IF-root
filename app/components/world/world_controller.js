function WorldController( World, db, $routeParams, $scope, $location, leafletData, $rootScope, apertureService, mapManager, styleManager, socket, $sce) {
   	
    var map = mapManager;
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

  	
/*
  	function redoMarkers(landmarks, c) {
  		var categoryURL;
  		angular.forEach($scope.landmarks, function(landmark) {
  			switch (landmark.category) {
	  			case 'food': 
	  				categoryURL = 'img/jul30/marker/cake_arrow.png';
	  				break;
	  			case 'bar':
	  				categoryURL = 'img/jul30/marker/cocktail_arrow.png';
	  				break;
	  			case 'fabric':
	  				categoryURL = 'img/jul30/marker/spool_arrow.png';
	  				break;
	  		}
	  		if (c != undefined && landmark.category != c) {
	  			map.removeMarker(landmark._id); 
	  		} else {
	  			map.addMarker(landmark._id, {
		  			lat: landmark.loc.coordinates[1],
		  			lng: landmark.loc.coordinates[0],
		  			draggable:false,
		  			message:'<a href="#/w/'+$scope.world.id+'/'+landmark.id+'">'+landmark.name+'</a>',
		  			icon: {
		  				iconUrl: categoryURL,
		  				iconSize: [100,100],
		  				iconAnchor: [50, 100],
		  				shadowUrl: '',
		  				shadowRetinaUrl: '',
		  				shadowSize: [0,0],
		  				popupAnchor: [0, -80]
		  			},
		  			_id: landmark._id
		  		});
		  	}
	  		
	  		
  		});
  		map.refresh();
  	}
*/
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
		 
		 
		 
		 // order of logic
		 // if (type == cloud) ---> load cloud as basemap
		 // else if (type == both && localMapID && cloudMapID) --> load cloud as basecamp, layer local map on top
		 // else if (type == local && localMapID) --> load local map as base, use black background for leaflet style
		 // else if (cloudMapID) ---> load cloudmap as basemap
		 // else { load with default cloudMapID } ---> load a default cloudmap as basemap
		 
		 // add zoom restrictions

		
		 /*map.addPath('worldBounds', {
				type: 'circle',
                radius: 150,
				latlngs: {lat:$scope.world.loc.coordinates[1], lng:$scope.world.loc.coordinates[0]}
				});*/
		map.setCenter([$scope.world.loc.coordinates[0], $scope.world.loc.coordinates[1]],19)
		map.setBaseLayer(tilesDict[$scope.world.style.maps.cloudMapName]['url']);
		if ($scope.world.style.maps.type == "both" || $scope.world.style.maps.type == "local") {
			map.addOverlay($scope.world.style.maps.localMapID, 
							$scope.world.style.maps.localMapName, 
							$scope.world.style.maps.localMapOptions);
			map.refresh();
		}
		
		$scope.loadLandmarks();
  	}
  	
  	function loadWidgets() {
		console.log($scope.world);
		if ($scope.style.widgets.twitter) {
			$scope.twitter = true;
		}
		
		if ($scope.world.resources) {
		$scope.tweets = db.tweets.query({limit:1, tag:$scope.world.resources.hashtag});
	    $scope.instagrams = db.instagrams.query({limit:1, tag:$scope.world.resources.hashtag});
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

	World.get({id: $routeParams.worldURL}, function(data) {
		 if (data.err) {
		 	console.log('Data error! Returning to root!');
		 	console.log(data.err);
		 	$location.path('/#/');
		 } else {
			$scope.loadWorld(data); 
		}
	});	
	

}


function WorldRepeatController($scope) {
	
}