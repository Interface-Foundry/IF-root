app.directive('floorSelector', floorSelector);

function floorSelector() {
	return {
		restrict: 'E',
		templateUrl: 'components/floor_selector/floor.selector.html'
		// template: '<h3>123</h3>'
	};
}