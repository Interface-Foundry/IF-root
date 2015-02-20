app.directive('floorSelector', floorSelector);

function floorSelector() {
	return {
		restrict: 'E',
		scope: true,
		// template: '<div>123</div>',
		templateUrl: 'components/floor_selector/floor.selector.html',
		link: function(scope, elem, attrs) {
			elem.bind('click', function() {
				scope.showFloors = !scope.showFloors;
			});
			scope.showFloors = false;
		}
	};
}