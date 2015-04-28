app.directive('userLocation', ['geoService', 'mapManager', function(geoService, mapManager) {
	
	return {
		restrict: 'E',
		scope: {
			style: '='
		},
		templateUrl: 'components/userLocation/userLocation.html',
		link: link
	};

	function link(scope, elem, attrs) {

		scope.locateAndPan = function() {
			if (!geoService.tracking) {
				geoService.trackStart();
			}
			var marker = mapManager.getMarker('track');
			if (marker && marker.lng !== 0 && marker.lat!== 0) {
				mapManager.setCenter([marker.lng, marker.lat], mapManager.center.zoom);
			}
		};

	}

}]);