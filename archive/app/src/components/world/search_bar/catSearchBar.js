app.directive('catSearchBar', ['$location', '$http', '$timeout', 'apertureService', 'bubbleSearchService', 'floorSelectorService', 'mapManager', 'categoryWidgetService', 'geoService', 'encodeDotFilterFilter', 'deviceManager', 'alertManager', function($location, $http, $timeout, apertureService, bubbleSearchService, floorSelectorService, mapManager, categoryWidgetService, geoService, encodeDotFilterFilter, deviceManager, alertManager) {

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
			var offset = $('.search-cat').offset().top;
			var noResultsText = bubbleSearchService.defaultText.none;
			var defaultText;

			if (scope.mode === 'city' || scope.mode === 'home') {
				defaultText = bubbleSearchService.defaultText.global;
			} else {
				defaultText = bubbleSearchService.defaultText.bubble;
			}
			

			// change text in search bar whenever $scope.searchBarText changes in searchController
			if (inSearchView()) {
				scope.$parent.$parent.$watch('searchBarText', function(newValue, oldValue) {
					// 1st parent scope is ngIf scope, next parent is searchController scope
					scope.text = newValue;
				});
			}

			scope.clearTextSearch = function() {
				// on click X
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
				// on blur
				/**
				 * timeout allows clearTextSearch() to be called 1st on click X. that way, the text is * changed to default before scroll or aperture change (in which case the click event * to clearTextSearch() might not be recognized) 
				 */
				$timeout(function() {
					if (scope.text === '') {
						scope.text = defaultText;
					}

					if (scope.mode === 'home') {
					} else {
						if (apertureService.state !== 'aperture-full') {
							apertureService.set('third');
						}
					}
				}, 100);
			}

			scope.select = function() {

				// set text
				if (scope.text === defaultText) {
					scope.text = '';
				} else if (scope.text.indexOf(noResultsText) > -1) {
					// remove "(No results)" part of input
					scope.text = scope.text.slice(0, scope.text.length - (noResultsText.length + 3));
				}

				// set aperture or scroll
				if (scope.mode === 'home') {
					if (deviceManager.os === 'android') {
						// fixes bug on andorid native browser where elements in focus don't scroll when keyboard pops up
						var navHeight = parseInt($('.main-nav').css('height'));
						var marginTop = parseInt($('.search-cat').css('margin-top'));
						$('.wrap').animate({
							// subtract nav bar height and searchbar's margin-top
							scrollTop: offset - (navHeight + marginTop)
						}, 400);
					}
				} else {
					if (apertureService.state !== 'aperture-full') {
						apertureService.set('off');
					}
				}

				$('.search-cat input').focus();

				// close floor selector
				floorSelectorService.showFloors = false;
			}

			scope.search = function(keyEvent) {
				if (keyEvent.which === 13 && scope.text) { // pressed enter and input isn't empty
					
					if (apertureService.state !== 'aperture-full') {
						apertureService.set('third');
					}

					if (scope.mode === 'city') {
						scope.loading = true;
						geoService.getLocation().then(function(location) {
							$location.path('/c/' + location.cityName + '/search/lat' + encodeDotFilterFilter(location.lat, 'encode') + '&lng' + encodeDotFilterFilter(location.lng, 'encode') +  '/text/' + encodeURIComponent(scope.text), false);
							scope.populateCitySearchView(scope.text, 'text', location);
						}, function(err) {
							console.log('er: ', err);
							alertManager.addAlert('info', 'Sorry, there was a problem getting your location', true);
						}).finally(function() {
							scope.loading = false;
						});
					} else if (scope.mode == 'home') {
						geoService.getLocation().then(function(location) {
							$location.path('/c/' + location.cityName + '/search/lat' + encodeDotFilterFilter(location.lat, 'encode') + '&lng' + encodeDotFilterFilter(location.lng, 'encode') +  '/text/' + encodeURIComponent(scope.text));
						}, function(err) {
							console.log('er: ', err);
							alertManager.addAlert('info', 'Sorry, there was a problem getting your location', true);
						});
					} else {
						if (inSearchView()) {
							scope.populateSearchView(scope.text, 'text');
							$location.path('/w/' + scope.world.id + '/search/text/' + encodeURIComponent(scope.text), false);
						} else {
							$location.path('/w/' + scope.world.id + '/search/text/' + encodeURIComponent(scope.text));
						}
					}
					
					// don't blur on home page or you get scrolling effect while the page changes
					if (scope.mode !== 'home') $('.search-cat input').blur();

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
