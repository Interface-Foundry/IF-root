app.directive('catSearchBar', ['$location', 'apertureService', 'bubbleSearchService', 'floorSelectorService', 'mapManager', 'categoryWidgetService', function($location, apertureService, bubbleSearchService, floorSelectorService, mapManager, categoryWidgetService) {

	return {
		restrict: 'E',
		scope: {
			text: '=',
			color: '=',
			world: '=',
			populateSearchView: '=',
			loading: '='
		},
		templateUrl: 'components/world/search_bar/catSearchBar.html',
		link: function(scope, elem, attrs) {
			// scope.mapmanager = mapManager;

			var defaultText = bubbleSearchService.defaultText;
			var noResultsText = bubbleSearchService.noResultsText;

			// change text in search bar whenever $scope.searchBarTet changes in searchController
			if (inSearchView()) {
				scope.$parent.$parent.$watch('searchBarText', function(newValue, oldValue) {
					// 1st parent scope is ngIf scope, next parent is searchController scope
					scope.text = newValue;
				});
			}

			scope.clearTextSearch = function() {
				if (inSearchView()) {
					scope.populateSearchView(defaultText, 'generic');
					$location.path('/w/' + scope.world.id + '/search', false);
					mapManager.removeAllMarkers();
				}
				scope.text = defaultText;
				if (apertureService.state !== 'aperture-full') {
					apertureService.set('third');
				}
				categoryWidgetService.selectedIndex = null;
				floorSelectorService.showFloors = false;
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

				// close floor selector
				floorSelectorService.showFloors = false;
			}

			scope.search = function(keyEvent) {
				if (keyEvent.which === 13 && scope.text) { // pressed enter and input isn't empty
					if (apertureService.state !== 'aperture-full') {
						apertureService.set('third');
					}
					if (inSearchView()) {
						scope.populateSearchView(scope.text, 'text');
						$location.path('/w/' + scope.world.id + '/search/text/' + encodeURIComponent(scope.text), false);
					} else {
						$location.path('/w/' + scope.world.id + '/search/text/' + encodeURIComponent(scope.text));
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