app.directive('catSearchBar', ['$location', '$http', 'apertureService', 'bubbleSearchService', 'floorSelectorService', 'mapManager', 'categoryWidgetService', 'geoService', 'encodeDotFilterFilter', function($location, $http, apertureService, bubbleSearchService, floorSelectorService, mapManager, categoryWidgetService, geoService, encodeDotFilterFilter) {

	return {
		restrict: 'E',
		scope: {
			text: '=',
			color: '=',
			world: '=',
			populateSearchView: '=',
			populateCitySearchView: '=',
			loading: '=',
			mode: '='
		},
		templateUrl: 'components/world/search_bar/catSearchBar.html',
		link: function(scope, elem, attrs) {
			// scope.mapmanager = mapManager;

			var defaultText = bubbleSearchService.defaultText;
			var noResultsText = bubbleSearchService.noResultsText;

			// change text in search bar whenever $scope.searchBarText changes in searchController
			if (inSearchView()) {
				scope.$parent.$parent.$watch('searchBarText', function(newValue, oldValue) {
					// 1st parent scope is ngIf scope, next parent is searchController scope
					scope.text = newValue;
				});
			}

			scope.clearTextSearch = function() {
				if (scope.mode === 'city') {
					var indexText = $location.path().indexOf('/text/');
					var indexCategory = $location.path().indexOf('/category/');
					if (indexText > -1) {
						$location.path($location.path().slice(0, indexText), false);
					} else if (indexCategory > -1) {
						$location.path($location.path().slice(0, indexCategory), false);
					}
					scope.populateCitySearchView(defaultText, 'generic');
				} else if (scope.mode === 'home') {
					// scroll page here toks
				} else {
					if (inSearchView()) {
						scope.populateSearchView(defaultText, 'generic');
						$location.path('/w/' + scope.world.id + '/search', false);
					}
					categoryWidgetService.selectedIndex = null;
					floorSelectorService.showFloors = false;
				}
				scope.text = defaultText;
				if (apertureService.state !== 'aperture-full') {
					apertureService.set('third');
				}
			}

			scope.resetDefaultSearch = function() {
				if (scope.text === '') {
					scope.text = defaultText;
				}
				if (apertureService.state !== 'aperture-full') {
					apertureService.set('third');
				}
			}

			scope.select = function() {
				if (scope.text === defaultText) {
					scope.text = '';
				} else if (scope.text.indexOf(noResultsText) > -1) {
					// remove "(No results)" part of input
					scope.text = scope.text.slice(0, scope.text.length - 13);
				}

				if (apertureService.state !== 'aperture-full') {
					apertureService.set('off');
				}
				$('.search-cat input').focus();

				if (scope.mode === 'home') {
					// scroll page here toks
				}

				// close floor selector
				floorSelectorService.showFloors = false;
			}

			scope.search = function(keyEvent) {
				if (keyEvent.which === 13 && scope.text) { // pressed enter and input isn't empty
					
					if (apertureService.state !== 'aperture-full') {
						apertureService.set('third');
					}

					if (scope.mode === 'city') {

						// get user's current location on every search
						scope.loading = true;

						// cache of 23s and timeout of 3s
						geoService.getLocation(23*1000, 3*1000).then(function(location) {
							var data = {
								params: {
									hasLoc: true,
									lat: location.lat,
									lng: location.lng
								}
							};
							$http.get('/api/geolocation', data).
								success(function(locInfo) {
									var locationData = {
										lat: locInfo.lat,
										lng: locInfo.lng,
										cityName: locInfo.cityName,
										timestamp: locInfo.timestamp
									};
									geoService.updateLocation(locationData);
									$location.path('/c/' + locationData.cityName + '/search/lat' + encodeDotFilterFilter(locationData.lat, 'encode') + '&lng' + encodeDotFilterFilter(locationData.lng, 'encode') +  '/text/' + encodeURIComponent(scope.text), false);
									scope.populateCitySearchView(scope.text, 'text', locationData);
									scope.loading = false;
								}).
								error(function(err) {
									console.log('er: ', err);
									scope.loading = false;
								})
						}, function(err) {
							// get location from IP
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
										timestamp: locInfo.timestamp
									};
									geoService.updateLocation(locationData);
									$location.path('/c/' + locationData.cityName + '/search/lat' + encodeDotFilterFilter(locationData.lat, 'encode') + '&lng' + encodeDotFilterFilter(locationData.lng, 'encode') +  '/text/' + encodeURIComponent(scope.text), false);
									scope.populateCitySearchView(scope.text, 'text', locationData);
									scope.loading = false;
								}).
								error(function(err) {
									console.log('er: ', err);
									scope.loading = false;
								})
						})
						
					} else if (scope.mode == 'home') {
						// route to city search toks. get IP location of no?
					} else {
						if (inSearchView()) {
							scope.populateSearchView(scope.text, 'text');
							$location.path('/w/' + scope.world.id + '/search/text/' + encodeURIComponent(scope.text), false);
						} else {
							$location.path('/w/' + scope.world.id + '/search/text/' + encodeURIComponent(scope.text));
						}
					}
					
					$('.search-cat input').blur();

					// deselect active category
					categoryWidgetService.selectedIndex = null;
				}
			}

			scope.showX = function() {
				return scope.text && scope.text !== defaultText;
			}

			scope.getColor = function() {
				var result;

				// set style based on input
				if (scope.text === defaultText) {
					result = {
						'color': scope.color
					};
				} else if (scope.text.indexOf(noResultsText) > -1) {
					result = {
						'color': 'gray',
						'font-style': 'italic'
					};
				} else {
					result = {
						'color': 'black'
					};
				}

				return result;
			}

			function inSearchView() {
				return $location.path().indexOf('search') > -1;
				// else in world view
			}
			
		}
	};
}]);