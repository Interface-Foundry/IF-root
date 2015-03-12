app.directive('catSearchBar', ['$location', 'apertureService', 'bubbleSearchService', 'mapManager', function($location, apertureService, bubbleSearchService, mapManager) {
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

			var defaultText = bubbleSearchService.defaultText;

			scope.clearTextSearch = function() {
				scope.populateSearchView(defaultText, 'generic');
				$location.path('/w/' + scope.world.id + '/search', false);
				scope.text = defaultText;
				mapManager.removeAllMarkers();
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
			}

			scope.search = function(keyEvent) {
				if (keyEvent.which === 13) { // pressed enter
					$location.path('/w/' + scope.world.id + '/search/text/' + scope.text);
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

		}
	};
}]);