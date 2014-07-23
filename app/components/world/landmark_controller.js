function LandmarkController( World, Landmark, db, $routeParams, $scope, $location, leafletData, $rootScope, apertureService, mapManager) {
		console.log('--Landmark Controller--');
		var map = mapManager;
		$scope.aperture = apertureService;
		
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
		});
}