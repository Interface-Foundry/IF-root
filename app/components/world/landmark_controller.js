function LandmarkController( World, Landmark, db, $routeParams, $scope, $location, $log, $window, leafletData, $rootScope, apertureService, mapManager, styleManager) {
		console.log('--Landmark Controller--');
		var map = mapManager;
		var style = styleManager;
		$scope.aperture = apertureService;
		$scope.aperture.set('half');
		
		
		$scope.worldURL = $routeParams.worldURL;
		$scope.landmarkURL = $routeParams.landmarkURL;
		
		//eventually landmarks can have non-unique names
		$scope.landmark = Landmark.get({id: $routeParams.landmarkURL}, function(landmark) {
			console.log(landmark);
			console.log('trying to get landmark');
			//goto landmarker
			goToMark();	
		});
		
		World.get({id: $routeParams.worldURL}, function(data) {
			console.log(data)
			if (data.err) {
				$log.error(data.err);
				$location.path('/#/');
			} else {
				$scope.world = data.world;
				$scope.style = data.style;
				style.navBG_color = $scope.style.navBG_color;
			}
		});
		
		function goToMark() {
			
			map.setCenter($scope.landmark.loc.coordinates, 19); 
		  	var markers = map.markers;
		  	angular.forEach(markers, function(marker) {
		  		console.log(marker);
			  	map.removeMarker(marker._id);
		  	});
		  	
		  	map.addMarker($scope.landmark._id, {
		  			lat: $scope.landmark.loc.coordinates[1],
		  			lng: $scope.landmark.loc.coordinates[0],
		  			draggable:false,
		  			message:$scope.landmark.name,
		  			_id: $scope.landmark._id
		  			});
		  	map.setMarkerFocus($scope.landmark._id);
		 };
		 
		map.refresh();
}