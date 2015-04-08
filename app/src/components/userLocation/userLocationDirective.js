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
		
		if (scope.style.widgets && scope.style.widgets.category) {
			// raise button from 80px to 120px to account for category widget
			$('.userLocation').css('bottom', '120px');
		}

		scope.locateAndPan = function() {
			if (!geoService.tracking) {
				geoService.trackStart();
			}
			var marker = mapManager.getMarker('track');
			if (marker.lng !== 0 && marker.lat!== 0) {
				mapManager.setCenter([marker.lng, marker.lat], mapManager.center.zoom);
			}
		};

	}

}]);