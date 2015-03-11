app.directive('catSearchBar', ['$location', 'apertureService', function($location, apertureService) {
	return {
		restrict: 'E',
		scope: {
			text: '=',
			color: '=',
			world: '='
		},
		templateUrl: 'components/world/search_bar/catSearchBar.html',
		link: function(scope, elem, attrs) {

			scope.selectText = function() {
				$('.search-cat input').select();
				apertureService.set('off');
			}

			scope.clearText = function() {
				scope.text = '';
				// propagates and calls scope.selectText
			}

			scope.search = function(keyEvent) {
				if (keyEvent.which === 13){
					$location.path('/w/' + scope.world.id + '/search/text/' + scope.text);
				}
			}

		}
	};
}]);