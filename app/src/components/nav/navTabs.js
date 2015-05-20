app.directive('navTabs', ['$routeParams', '$location', '$http', 'worldTree', '$document',  'apertureService', 'navService', 'bubbleTypeService', 'geoService', 'encodeDotFilterFilter', 'alertManager', function($routeParams, $location, $http, worldTree, $document, apertureService, navService, bubbleTypeService, geoService, encodeDotFilterFilter, alertManager) {
	
	return {
		restrict: 'EA',
		scope: true,
		templateUrl: 'components/nav/navTabs.html',
		link: link
	};

	function link(scope, element, attrs) {

		scope.goWorld = goWorld;
		scope.goSearch = goSearch;

		function goWorld() {
			// go to world home if in world but not already in world home. go to kip home otherwise
			if ($routeParams.worldURL && $location.path() !== '/w/' + $routeParams.worldURL) {
				$location.path('/w/' + $routeParams.worldURL);
				navService.show('world');
			}
		}

		function goSearch() {
			// go to world search if in retail world but not already in world search home. go to global search otherwise

			if ($routeParams.worldURL &&
				bubbleTypeService.get() === 'Retail' && 
				$location.path() !== '/w/' + $routeParams.worldURL + '/search') {
				$location.path('/w/' + $routeParams.worldURL + '/search');
			} else {
				geoService.getLocation().then(function(locationData) {
					$location.path('/c/' + locationData.cityName + '/search/lat' + encodeDotFilterFilter(locationData.lat, 'encode') + '&lng' + encodeDotFilterFilter(locationData.lng, 'encode'));
				}, function(err) {
					alertManager.addAlert('info', 'Sorry, there was a problem getting your location', true);
					navService.reset();
				});
			}

			navService.show('search');
		}

	}

}]);
