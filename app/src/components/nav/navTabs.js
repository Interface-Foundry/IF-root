app.directive('navTabs', ['$routeParams', '$location', '$http', 'worldTree', '$document',  'apertureService', 'navService', 'bubbleTypeService', 'geoService', 'encodeDotFilterFilter', function($routeParams, $location, $http, worldTree, $document, apertureService, navService, bubbleTypeService, geoService, encodeDotFilterFilter) {
	
	return {
		restrict: 'EA',
		scope: true,
		templateUrl: 'components/nav/navTabs.html',
		link: link
	};

	function link(scope, element, attrs) {

		scope.goHome = goHome;
		scope.goSearch = goSearch;

		function goHome() {
			// go to world home if in world but not already in world home. go to kip home otherwise

			if ($routeParams.worldURL && $location.path() !== '/w/' + $routeParams.worldURL) {
				$location.path('/w/' + $routeParams.worldURL);
			} else {
				$location.path('/');
			}

			navService.show('home');
		}

		function goSearch() {
			// go to world search if in retail world but not already in world search home. go to global search otherwise

			if ($routeParams.worldURL &&
				bubbleTypeService.get() === 'Retail' && 
				$location.path() !== '/w/' + $routeParams.worldURL + '/search') {
				$location.path('/w/' + $routeParams.worldURL + '/search');
			} else {
				// get location. use IP if we don't have it stored
				if (geoService.location.cityName && geoService.location.lat) {
					var locationData = {
						lat: geoService.location.lat,
						lng: geoService.location.lng,
						cityName: geoService.location.cityName
					};
					$location.path('/c/' + locationData.cityName + '/search/lat' + encodeDotFilterFilter(locationData.lat, 'encode') + '&lng' + encodeDotFilterFilter(locationData.lng, 'encode'));
				} else { // use IP
					var data = {
						server: true,
						params: {
							hasLoc: false
						}
					};
					$http.get('/api/geolocation', data).
						success(function(locInfo) {
							var locationData = {
								lat: locInfo.lat,
								lng: locInfo.lng,
								cityName: locInfo.cityName,
								src: locInfo.src,
								timestamp: Date.now()
							};
							geoService.updateLocation(locationData);
							$location.path('/c/' + locationData.cityName + '/search/lat' + encodeDotFilterFilter(locationData.lat, 'encode') + '&lng' + encodeDotFilterFilter(locationData.lng, 'encode'));
						}).
						error(function(err) {
							console.log('err: ', err);
						});
				}
			}

			navService.show('search');
		}

	}

}]);
