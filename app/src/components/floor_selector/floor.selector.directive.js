'use strict';

app.directive('floorSelector', floorSelector);

floorSelector.$inject = ['mapManager', 'floorSelectorService'];

function floorSelector(mapManager, floorSelectorService) {
	return {
		restrict: 'E',
		scope: {
			world: '=world',
			style: '=style',
			landmarks: '=landmarks'
		},
		templateUrl: 'components/floor_selector/floor.selector.html',
		link: link
	};

	function link(scope, elem, attr) {
		activate(elem);
		
		// make sure floor selector is closed if switching to a new bubble
		scope.$on('$destroy', function(ev) {
			floorSelectorService.showFloors = false;
		});

		function activate(elem) {
			scope.floors = floorSelectorService.getFloors(scope.world.style.maps.localMapArray)

			scope.floorSelectorService = floorSelectorService;

			scope.selectedIndex = floorSelectorService.getSelectedIndex(1);

			scope.currentFloor = scope.floors.slice(-1)[0][0] > 0 ? 
												   scope.floors.slice(-1)[0][0] : findCurrentFloor(scope.floors);
			floorSelectorService.setCurrentFloor(scope.currentFloor);

			checkCategories(elem);
		}

		function checkCategories(elem) {
			if (scope.style.widgets.category === true) {
				scope.category = true;
				// adjust bottom property of all floor selector elements
				angular.forEach(elem.children(), function(el) {
					// get current bottom property pixels
					var bottom = parseInt($(el).css('bottom'));
					// raise 60px to account for category bar
					$(el).css('bottom', bottom + 40 + 'px');
				});
			} else {
				floorSelectorService.showLandmarks = true;
			}
		}

		function findCurrentFloor(floors) {
			var tempFiltered = floors.filter(function(f) {
				return f[0].floor_num > 0;
			});
			return tempFiltered.length ? tempFiltered.slice(-1)[0][0] : floors[0][0];
		}

		scope.selectFloor = function(index) {
			scope.selectedIndex = floorSelectorService.setSelectedIndex(index);
			scope.currentFloor = scope.floors[index][0];
			floorSelectorService.setCurrentFloor(scope.currentFloor);
			turnOffFloorLayers();
			turnOnFloorMaps();
			updateIndicator();
			adjustZoom(index);
			
			if (floorSelectorService.showLandmarks) {
				turnOnFloorLandmarks();
			}
		}

		scope.openFloorMenu = function() {
			floorSelectorService.showFloors = !floorSelectorService.showFloors;
			updateIndicator();
		}

		function adjustZoom(index) {
			// get current zoom
			var currentZoom = mapManager.center.zoom,
					lowestMinZoom,
					highestMaxZoom,
					floors = scope.floors[index];
			// checkout zoom levels of all maps on current floor
			for (var i = 0, len = floors.length; i < len; i++) {
				if (zoomInRange(currentZoom, floors[i].localMapOptions)) {
				return;
				} else {
					// if zoom not in range hold on to highest and lowest zooms
					lowestMinZoom = lowestMinZoom ? Math.min(lowestMinZoom, floors[i].localMapOptions.minZoom) : floors[i].localMapOptions.minZoom;
					highestMaxZoom = highestMaxZoom ? Math.max(highestMaxZoom, floors[i].localMapOptions.maxZoom) : floors[i].localMapOptions.maxZoom;
				}
			}

			// adjust zoom to nearest in map range
			if (currentZoom < lowestMinZoom) {
				mapManager.center.zoom = Number(lowestMinZoom);
			} else if (currentZoom > highestMaxZoom) {
				mapManager.center.zoom = Number(highestMaxZoom);
			}
			// if no maps on floor, it should keep current zoom
		}

		function zoomInRange(currentZoom, floorOptions) {
			if (floorOptions.minZoom <= currentZoom && currentZoom <= floorOptions.maxZoom) {
				return true;
			} else {
				return false;
			}
		}

		function turnOffFloorLayers() {
			var layers = scope.floors.map(function(f) {
				return f[0].floor_num || 1;
			});

			mapManager.findVisibleLayers().forEach(function(l) {
				mapManager.toggleOverlay(l.name);			
			});
		}

		function turnOnFloorMaps() {
			var currentMapLayer = scope.currentFloor.floor_num + '-maps';
			mapManager.toggleOverlay(currentMapLayer);
		}

		function turnOnFloorLandmarks() {
			var currentLandmarkLayer = scope.currentFloor.floor_num + '-landmarks';
			mapManager.toggleOverlay(currentLandmarkLayer);
		}

		function updateIndicator() {
			floorSelectorService.updateIndicator(scope.category, scope.floors, scope.selectedIndex);
		}
	}
}
