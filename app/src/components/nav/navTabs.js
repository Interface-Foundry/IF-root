app.directive('navTabs', ['$routeParams', '$location', '$http', 'worldTree', '$document',  'apertureService', 'navService', 'bubbleTypeService', 'geoService', 'encodeDotFilterFilter', function($routeParams, $location, $http, worldTree, $document, apertureService, navService, bubbleTypeService, geoService, encodeDotFilterFilter) {
	
	return {
		restrict: 'EA',
		scope: true,
		templateUrl: 'components/nav/navTabs.html',
		link: link
	};

	function link(scope, element, attrs) {

		scope.select = function (tab) {
			if (tab === 'home') {
				if ($routeParams.worldURL) {
					var wRoute = "/w/"+$routeParams.worldURL;
					$location.path() === wRoute ? $location.path("/") : $location.path(wRoute);

				} else {
					$location.path('/');
				}
			}
			else if (tab === 'search') {
				// if in retail bubble, search takes you to search within bubble. else, search takes you general bubbl.li search
				if ($routeParams.worldURL && bubbleTypeService.get() === 'Retail') {
					tab = 'searchWithinBubble';	
					$location.path('/w/' + $routeParams.worldURL + '/search');
				} else {
					if (geoService.location.cityName) {
						var locationData = {
							lat: geoService.location.lat,
							lng: geoService.location.lng,
							cityName: geoService.location.cityName
						};
						$location.path('/c/' + locationData.cityName + '/search/lat' + encodeDotFilterFilter(locationData.lat, 'encode') + '&lng' + encodeDotFilterFilter(locationData.lng, 'encode'));
					} else { // use IP
						var data = {
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
				apertureService.set('third');
			}
			navService.show(tab);
		}

		scope.hardSearch = function() {
			if (geoService.location.cityName) {
				navService.show('search');
				var locationData = {
					lat: geoService.location.lat,
					lng: geoService.location.lng,
					cityName: geoService.location.cityName
				};
				$location.path('/c/' + locationData.cityName + '/search/lat' + encodeDotFilterFilter(locationData.lat, 'encode') + '&lng' + encodeDotFilterFilter(locationData.lng, 'encode'));
			}
		};

	}

}]);