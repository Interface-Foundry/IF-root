function CategoryController( World, db, $route, $routeParams, $scope, $location, leafletData, $rootScope, apertureService, mapManager, styleManager) {
   	var map = mapManager;
  	var style = styleManager;
  	$scope.worldURL = $routeParams.worldURL;
  	$scope.category = $routeParams.category;
    $scope.aperture = apertureService;
    $scope.aperture.set('full');
    
    $scope.landmarks = [];
    
    var lastRoute = $route.current;
$scope.$on('$locationChangeSuccess', function (event) {
    if (lastRoute.$$route.originalPath === $route.current.$$route.originalPath) {
        $scope.category = $route.current.params.category;
        $route.current = lastRoute;
        
        console.log($scope.category);
        loadLandmarks();
    }
});
 	
 	function loadLandmarks() {
		console.log('--loadLandmarks--');
		//$scope.queryType = "all";
		//$scope.queryFilter = "all";
		map.removeAllMarkers();
		$scope.landmarks = [];
		db.landmarks.query({ queryType:'all', queryFilter:'all', parentID: $scope.world._id}, function(data){
				console.log('--db.landmarks.query--');
				console.log('data');
				console.log(data);
				angular.forEach(data, function(landmark) {
					if (landmark.category==$scope.category) {
						$scope.landmarks.push(landmark);
						map.addMarker(landmark._id, {
							lat:landmark.loc.coordinates[1],
							lng:landmark.loc.coordinates[0],
							draggable: false,
							message:landmark.name
						});
					}	
				});
				console.log('$scope.landmarks');
				console.log($scope.landmarks);
		});	
			
	}
 	
////////////////////////////////////////////////////////////
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////	
 	
 	World.get({id: $scope.worldURL}, function(data) {
 			console.log('--World.get--');
			console.log(data);
		$scope.world = data.world;
			console.log('-World-');
			console.log($scope.world);
		$scope.style = data.style;
			console.log('-Style-');
			console.log($scope.style);
			
			 map.setMaxBoundsFromPoint([$scope.world.loc.coordinates[1],$scope.world.loc.coordinates[0]], 0.05);
		 map.setCenter($scope.world.loc.coordinates, 17); //pull zoom from mapoptions if exists
			
			loadLandmarks();
 	});
 	   
}