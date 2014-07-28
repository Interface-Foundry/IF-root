function LandmarkController( World, Landmark, db, $routeParams, $scope, $location, $log, leafletData, $rootScope, apertureService, mapManager) {
		console.log('--Landmark Controller--');
		var map = mapManager;
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
				$scope.style = data.style;
			}
		});
		
		function goToMark() {
			
			map.setCenter($scope.landmark.loc.coordinates, 16); 
			map.addMarker($scope.landmark._id, {
		  			lat: $scope.landmark.loc.coordinates[1],
		  			lng: $scope.landmark.loc.coordinates[0],
		  			draggable: false,
		  			message:$scope.landmark.name
		  		});
		  	var markers = map.markers;
		  	angular.forEach(markers, function(marker) {
			  	map.removeMarker(marker);
		  	});
		  	
		  	map.addMarker($scope.landmark._id, {
		  			lat: $scope.landmark.loc.coordinates[1],
		  			lng: $scope.landmark.loc.coordinates[0],
		  			draggable:false,
		  			message:$scope.landmark.name
		 });
		 };
		 
		angular.extend(map.layers, {
			overlays: {
				localMap: {
					name: 'Syracuse Tech Meetup',
					visible: true,
					type: 'xyz',
					url: 'http://107.170.180.141/maps/demo/{z}/{x}/{y}.png',
					opacity: 0.2,					
					minZoom: 16,
					maxZoom: 19,
					tms: false,
					reuseTiles: true,
					layerParams: {
					},
					layerOptions: {
					}
					}
			}
		});
		map.refresh();
		
		map.addMarker();
}