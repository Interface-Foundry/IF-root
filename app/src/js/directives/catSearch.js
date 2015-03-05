app.directive('catSearch', [function() {
	return {
		restrict: 'E',
		scope: {
			text: '=',
			color: '='
		},
		templateUrl: 'templates/catSearch.html',
		link: function(scope, elem, attrs) {
			var input = $('.search-cat input');
			input.on('click', function() {
				input.select();
			})
		}
	};
}]);