app.directive('catSearchBar', ['apertureService', function(apertureService) {
	return {
		restrict: 'E',
		scope: {
			text: '=',
			color: '='
		},
		templateUrl: 'components/world/search_bar/catSearchBar.html',
		link: function(scope, elem, attrs) {

			// bind text
			scope.searchText = scope.text;

			scope.selectText = function() {
				$('.search-cat input').select();
				apertureService.set('off');
			}

			scope.clearText = function() {
				scope.searchText = '';
				// propagates and calls scope.selectText
			}

		}
	};
}]);