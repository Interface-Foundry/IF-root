app.directive('floorSelector', floorSelector);

floorSelector.$inject = ['mapManager'];

function floorSelector(mapManager) {
	return {
		restrict: 'E',
		scope: {
			world: '=world',
			style: '=style'
		},
		templateUrl: 'components/floor_selector/floor.selector.html',
		link: function(scope, elem, attr) {

			scope.currentFloor = {};

			scope.selectFloor = function(index) {
				scope.currentFloor = scope.floors[index][0];
				scope.showFloors = !scope.showFloors;
				showCurrentFloorMaps(index);
			}

			scope.openFloorMenu = function() {
				scope.showFloors = !scope.showFloors;
			}

			function showCurrentFloorMaps(index) {
				mapManager.removeOverlays();
				var floorMaps = scope.floors[index];
				floorMaps.forEach(function(m) {
					mapManager.addOverlay(m.localMapID, m.localMapName, m.localMapOptions);
				});
			}
			
			// when world changes in world controller, assign local vars in directive scope
			scope.$watch('world', function(world) {

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
					.value()
					.reverse();
				scope.currentFloor = scope.floors.slice(-1)[0][0];
			});
		}

	};
}