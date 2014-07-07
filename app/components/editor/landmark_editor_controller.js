function LandmarkEditorController($scope, $rootScope, $location, $route, $routeParams, db, World, leafletData, apertureService, mapManager) {
	console.log('Landmark Editor Controller initializing');
////////////////////////////////////////////////////////////
///////////////////INITIALIZING VARIABLES///////////////////
////////////////////////////////////////////////////////////
	var map = mapManager;
	var defaults = {
		name: 'Default',
		_id: 0,
		world: false,
		newStatus: true,
		parentID: 0,
		loc: [-74.0059,40.7127], //DOES NOT MATCH SCHEMA
		stats: {
			avatar: "img/tidepools/default.jpg"
		}
	};
	
	var aperture = apertureService;
	aperture.toggle('half');
	
	$scope.landmarks = [];
	
////////////////////////////////////////////////////////////
//////////////////////DEFINE FUNCTIONS//////////////////////
////////////////////////////////////////////////////////////

	$scope.addLandmark = function() {
		console.log('Adding Landmark');
		if (defaults.parentID == 0) {
			//Not ready yet! 
			console.log('Defaults not updated, error');
		} else {
			console.log('Creating Landmark');
			
			db.landmarks.create(defaults, function(response) {
				console.log('Response ID:'+response[0]._id);
				
				
				var tempLandmark = new Object();
				angular.extend(tempLandmark, defaults);
				angular.extend(tempLandmark, response[0]);
								
				console.log("Temporary Landmark:");
				console.log(tempLandmark);
				
				$scope.landmarks.unshift(tempLandmark);		
				
				console.log("Landmarks Array");
				console.log($scope.landmarks);
			});
		}
	}
	
	function loadLandmarks() {
		$scope.queryType = "all";
		$scope.queryFilter = "all";

		$scope.landmarksQuery = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, parentID: $scope.world._id}, function(){   
			
		});
	}
	
	function updateDefaults() {
		defaults.parentID = $scope.world._id;
		//defaults.loc.coordinates = $scope.world.loc.coordinates;
		console.log('Defaults Updated');
		console.log(defaults);
	}
	
	function refreshMap(){
	    leafletData.getMap().then(function(map) {
			
	        map.invalidateSize();
	    });
	}


////////////////////////////////////////////////////////////
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////

	World.get({id: $routeParams.worldID}, function(data) {
		console.log(data);
		$scope.world = data.world;
		$scope.style = data.style;
		map.center = {
			 lat: $scope.world.loc.coordinates[1],
		     lng: $scope.world.loc.coordinates[0],
		     zoom: 10
		};
		map.markers = {
			m: {
				        lat: $scope.world.loc.coordinates[1],
						lng: $scope.world.loc.coordinates[0]
				}
		};
		map.tiles = tilesDict[$scope.world.style.maps.cloudMapName];
		refreshMap();
		updateDefaults();
		loadLandmarks();
		
	});
	
}