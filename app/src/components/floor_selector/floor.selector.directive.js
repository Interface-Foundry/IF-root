app.directive('floorSelector', floorSelector);

function floorSelector() {
	return {
		restrict: 'E',
		scope: {
			world: '@world'
		},
		templateUrl: 'components/floor_selector/floor.selector.html',
		link: function(scope, elem, attr) {

			scope.currentFloor = {};			

			scope.selectFloor = function(index) {
				scope.currentFloor = scope.floors[index];
				scope.showFloors = !scope.showFloors;
			}

			scope.openFloorMenu = function() {
				scope.showFloors = !scope.showFloors;
			}
			
			// when world changes in world controller, assign local vars in directive scope
			attr.$observe('world', function(world) {
				var world = JSON.parse(attr.world);
				if (!world.style || !world.style.maps || !world.style.maps.localMapArray) {
					return;
				}
				scope.showFloors = false;
				scope.floors = _.chain(world.style.maps.localMapArray)
					.filter(function(f) {
						return f.floor_num;
					})
					.groupBy(function(f) {
						return f.floor_num;
					})
					.sortBy(function(f) {
						return -f.floor_num;
					})
					.flatten()
					.value();

				scope.currentFloor = scope.floors[0];
				console.log(scope.currentFloor)
			});


		}


	};
}