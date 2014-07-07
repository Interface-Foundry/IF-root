function LandmarkEditorController($scope, $rootScope, $location, $route, $routeParams, db, World, leafletData, apertureService, mapManager) {
	console.log('Landmark Editor Controller initialized');
	var map = mapManager;
	var defaults = {
		name: 'Default',
		world: false,
		loc: {
			type: {
				type: 'point'
			},
			coordinates: []
		}
	};
	
	var aperture = apertureService;
	aperture.toggle('half');
	
	$scope.landmarks = [];
	
	$scope.addLandmark = function() {
		$scope.landmarks.unshift({name:'New Landmark'});
	}
	
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
		//loadLandmarks();
		
	});
	
	function updateDefaults() {
		defaults.parentID = world._id;
		defaults.loc.coordinates = $scope.world.loc.coordinates;		
	}
	
	function loadLandmarks() {
		$scope.queryType = "all";
		$scope.queryFilter = "all";

		$scope.landmarksQuery = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, parentID: $scope.world._id}, function(){   
			
		});
	}
	
		function refreshMap(){
	    leafletData.getMap().then(function(map) {
			
	        map.invalidateSize();
	    });
	}
	
}