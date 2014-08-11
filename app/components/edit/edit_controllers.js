function EditController($scope, db, World, $rootScope, $routeParams, apertureService, mapManager, styleManager) {
var aperture = apertureService;
var map = mapManager;
var style = styleManager;
aperture.set('full');

$scope.loadWorld = function(data) {
	  	$scope.world = data.world;
		$scope.style = data.style;
		style.navBG_color = $scope.style.navBG_color;
		 
		console.log($scope.world);
		console.log($scope.style);
		 
		map.setCenter([$scope.world.loc.coordinates[0], $scope.world.loc.coordinates[1]],15)
		map.setBaseLayer(tilesDict[$scope.world.style.maps.cloudMapName]['url']);
		if ($scope.world.style.maps.type == "both" || $scope.world.style.maps.type == "local") {
			map.addOverlay($scope.world.style.maps.localMapID, $scope.world.style.maps.localMapName, $scope.world.style.maps.localMapOptions);
			map.refresh();
		}
}



////////////////////////////////////////////////////////////
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////
World.get({id: $routeParams.worldURL}, function(data) {
	if (data.err) {
		 console.log('World not found!');
		 console.log(data.err);
	} else {
		$scope.loadWorld(data);
	}
	map.refresh();
		
	});

//end editcontroller
}