app.directive('catSearchBar', ['$location', 'apertureService', 'bubbleSearchService', 'floorSelectorService', 'mapManager', function($location, apertureService, bubbleSearchService, floorSelectorService, mapManager) {

	return {
		restrict: 'E',
		scope: {
			text: '=',
			color: '=',
			world: '=',
			populateSearchView: '='
		},
		templateUrl: 'components/world/search_bar/catSearchBar.html',
		link: function(scope, elem, attrs) {
			// scope.mapmanager = mapManager;

			var defaultText = bubbleSearchService.defaultText;

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
				}
				if (apertureService.state !== 'aperture-full') {
					apertureService.set('off');
				}
				$('.search-cat input').focus();

				// close floor selector
				floorSelectorService.showFloors = false;
			}

			scope.search = function(keyEvent) {
				if (keyEvent.which === 13) { // pressed enter
					if (apertureService.state !== 'aperture-full') {
						apertureService.set('third');
					}
					if (inSearchView()) {
						scope.populateSearchView(scope.text, 'text');
						$location.path('/w/' + scope.world.id + '/search/text/' + scope.text, false);
					} else {
						$location.path('/w/' + scope.world.id + '/search/text/' + scope.text);
					}
					$('.search-cat input').blur();
				}
			}

			scope.showX = function() {
				return scope.text && scope.text !== defaultText;
			}

			scope.getColor = function() {
				// leave placeholder text as default color, black otherwise
				var result = scope.text === defaultText ? scope.color : 'black';
				return {
					color: result
				};
			}

			function inSearchView() {
				return $location.path().indexOf('search') > -1;
				// else in world view
			}
			
		}
	};
}]);