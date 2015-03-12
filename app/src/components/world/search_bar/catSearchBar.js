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
scope.mapmanager = mapManager

			var defaultText = bubbleSearchService.defaultText;

			scope.clearTextSearch = function() {
				scope.populateSearchView(defaultText, 'generic');
				$location.path('/w/' + scope.world.id + '/search', false);
				apertureService.set('third');
				scope.text = defaultText;
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
				if (keyEvent.which === 13){
					$location.path('/w/' + scope.world.id + '/search/text/' + scope.text);
				}
			}

			scope.showX = function() {
				return scope.text && scope.text !== defaultText;
			}
		}
	};
}]);