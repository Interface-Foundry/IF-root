app.directive('navTabs', ['$routeParams', '$location', '$http', 'worldTree', '$document',  'apertureService', 'navService', 'bubbleTypeService', 'geoService', 'encodeDotFilterFilter', function($routeParams, $location, $http, worldTree, $document, apertureService, navService, bubbleTypeService, geoService, encodeDotFilterFilter) {
	return {
		restrict: 'EA',
		scope: true,
		link: function(scope, element, attrs) {

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
					// if in retail bubble, search takes you to search within bubble. else, search takes you general kip search
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
			
			scope.nearbiesLength = function() {
				if (worldTree._nearby) {
					return _.reduce(worldTree._nearby, function(memo, value) {return memo+_.size(value)}, 0);
				} else {
					return 0;
				}
			}
		},
		template: 
'<button class="view-tab home-tab" ng-class="{selected: navService.status.home}" ng-click="select(\'home\')"></button>'+
'<button class="view-tab explore-tab" ng-class="{selected: navService.status.explore}" ng-click="select(\'explore\')">'+
'<span ng-show="nearbiesLength()>0" class="compass-badge badge" ng-cloak>{{nearbiesLength()}}</span></button>'+
'<button class="view-tab search-tab" ng-class="{selected: navService.status.search || navService.status.searchWithinBubble}" single-click callback="select" vars="[\'search\']" ng-dblclick="hardSearch()"></button>'
	}
}])