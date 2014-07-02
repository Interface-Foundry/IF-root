function WorldController( World, db, $routeParams, $scope, $location, leafletData, $rootScope, apertureService) {

    function refreshMap(){ 
	    leafletData.getMap().then(function(map) {
	        map.invalidateSize();
	    });
	}
    
	 World.get({id: $routeParams.worldURL}, function(data) {
		 console.log(data);
		 $scope.world = data.world;
		 $scope.style = data.style;
		 angular.extend($rootScope, {
				center: {
		            lat: $scope.world.loc.coordinates[1],
		            lng: $scope.world.loc.coordinates[0],
		            zoom: 11
		        },
		        markers : {
			        m: {
				        lat: $scope.world.loc.coordinates[1],
						lng: $scope.world.loc.coordinates[0]
			        }
		        }
		});
		refreshMap();

	});
		$scope.aperture = apertureService;	
	
}

