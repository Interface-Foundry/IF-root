function WorldController( World, db, $routeParams, $scope, $location, leafletData, $rootScope, apertureService, mapManager) {

    function refreshMap(){ 
    	
	    leafletData.getMap().then(function(map) {
			
	        map.invalidateSize();
	    });
	}
    
    var map = mapManager;
    
	 World.get({id: $routeParams.worldURL}, function(data) {
		 console.log(data);
		 $scope.world = data.world;
		 $scope.style = data.style;
		 map.center = {
		            lat: $scope.world.loc.coordinates[1],
		            lng: $scope.world.loc.coordinates[0],
		            zoom: 11
		        };
		 map.markers = {
			        m: {
				        lat: $scope.world.loc.coordinates[1],
						lng: $scope.world.loc.coordinates[0]
			        }
		        };
		map.tiles = tilesDict[$scope.world.style.maps.cloudMapName];
		
		refreshMap();
		
	});
	$scope.aperture = apertureService;	
	
}

