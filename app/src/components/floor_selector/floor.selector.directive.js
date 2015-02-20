app.directive('floorSelector', floorSelector);

function floorSelector() {
	return {
		restrict: 'E',
		// template: '<div>123</div>',
		templateUrl: 'components/floor_selector/floor.selector.html',
		link: function(scope, elem, attrs) {
			elem.bind('click', function() {
				console.log('click!')
			});
		}
	};
}