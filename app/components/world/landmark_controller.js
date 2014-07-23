function LandmarkController( World, Landmark, db, $routeParams, $scope, $location, leafletData, $rootScope, apertureService, mapManager) {
		console.log('--Landmark Controller--');
		var map = mapManager;
		$scope.aperture = apertureService;
		$scope.aperture.set('half');
	
		
		$scope.worldURL = $routeParams.worldURL;
		$scope.landmarkURL = $routeParams.landmarkURL;
		
		angular.extend($rootScope, {
			backToWorld: true
		});
		
		angular.extend($rootScope, {
			backToWorldURL: $routeParams.worldURL
		});
		
		//eventually landmarks can have non-unique names
		$scope.landmark = Landmark.get({id: $routeParams.landmarkURL}, function(landmark) {
			console.log(landmark);
			console.log('trying to get landmark');
			//goto landmarker
			goToMark();
			
		});
		
		function goToMark() {
			
			map.setCenter($scope.landmark.loc.coordinates, 16); 
				  			map.addMarker($scope.landmark._id, {
		  			lat: $scope.landmark.loc.coordinates[1],
		  			lng: $scope.landmark.loc.coordinates[0],
		  			draggable:false,
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
		 
		
		map.tiles = {};
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
		
		map.addMarker()
		
		
		angular.extend($rootScope, {globalNavColor: "rgba(0,110,100, 0.9)", globalBGColor: "#00695C"});
		
		$scope.style = {
			titleBG_color: "#009688",
			cardBG_color: "#FFF",
			category_color: "#E91E63",
			categoryTitle_color: "#BBDEFB",
			worldTitle_color: "#FFF",
			landmarkTitle_color: "#2196F3"
		}
}