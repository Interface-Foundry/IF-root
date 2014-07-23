function WorldController( World, db, $routeParams, $scope, $location, leafletData, $rootScope, apertureService, mapManager) {
   	
    var map = mapManager;
  	$scope.worldURL = $routeParams.worldURL;  
    $scope.aperture = apertureService;	
    $scope.aperture.set('half');

    angular.extend($rootScope, {loading: false});
    
	$scope.selectedIndex = 0;
	
	var landmarksLoaded;
	
	$scope.goToLandmark = function(i) {
		console.log('--goToLandmark--');
		$scope.selectedIndex = i;
		map.setCenter($scope.landmarks[i].loc.coordinates, 17);
		map.setMarkerFocus($scope.landmarks[i]._id);	
	}
  	
  	$scope.loadWorld = function(data) {
	  	$scope.world = data.world;
		 $scope.style = data.style;

		 // order of logic
		 // if (type == cloud) ---> load cloud as basemap
		 // else if (type == both && localMapID && cloudMapID) --> load cloud as basecamp, layer local map on top
		 // else if (type == local && localMapID) --> load local map as base, use black background for leaflet style
		 // else if (cloudMapID) ---> load cloudmap as basemap
		 // else { load with default cloudMapID } ---> load a default cloudmap as basemap

		 map.setMaxBoundsFromPoint([$scope.world.loc.coordinates[1],$scope.world.loc.coordinates[0]], 0.05);
		 map.setCenter($scope.world.loc.coordinates, 15); //pull zoom from mapoptions if exists
		 map.addPath('worldBounds', {
				type: 'circle',
                radius: 150,
				latlngs: {lat:$scope.world.loc.coordinates[1], lng:$scope.world.loc.coordinates[0]}
				});
		map.tiles = tilesDict[$scope.world.style.maps.cloudMapName];
		map.refresh();
  	}
  	
	 World.get({id: $routeParams.worldURL}, function(data) {
		 if (data.err){
		 	$location.path('/#/');
		 }
		 else {

			$scope.loadWorld(data); 
			$scope.queryType = "all";
			$scope.queryFilter = "all";

			db.landmarks.query({queryType:$scope.queryType, queryFilter:$scope.queryFilter, parentID: $scope.world._id}, function(data){   
				console.log(data);
				$scope.landmarks = data;
				
				angular.forEach($scope.landmarks, function(landmark) {
					map.addMarker(landmark._id, {
						lat:landmark.loc.coordinates[1],
						lng:landmark.loc.coordinates[0],
						draggable:false,
						message:landmark.name
					});
				});
				landmarksLoaded=true;
				
			});
		}
		map.refresh();
		
	});
	
	
}


function WorldRepeatController($scope) {
	$scope.goToMark = function() {
		$scope.$parent.goToLandmark($scope.$index);
	}
	
	
}