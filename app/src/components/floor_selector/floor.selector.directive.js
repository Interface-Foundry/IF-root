app.directive('floorSelector', floorSelector);

floorSelector.$inject = ['mapManager'];

function floorSelector(mapManager) {
	return {
		restrict: 'E',
		scope: {
			world: '=world',
			style: '=style',
			landmarks: '=landmarks',
			loadLandmarks: '&'
		},
		templateUrl: 'components/floor_selector/floor.selector.html',
		link: link
	};

	function link(scope, elem, attr) {

		activate(elem);

		function activate(elem) {
			scope.showFloors = false;

			scope.floors = _.chain(scope.world.style.maps.localMapArray)
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

			scope.selectedIndex = scope.floors.length - 1;

			scope.currentFloor = scope.floors.slice(-1)[0][0] > 0 ? 
												   scope.floors.slice(-1)[0][0] : findCurrentFloor(scope.floors);

			showCurrentFloorLandmarks(1);
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
					$(el).css('bottom', bottom + 60 + 'px');
				});
			}
		}

		function findCurrentFloor(floors) {
			var tempFiltered = floors.filter(function(f) {
				return f[0].floor_num > 0;
			});
			return tempFiltered.length ? tempFiltered.slice(-1)[0][0] : floors[0][0];
		}

		scope.selectFloor = function(index) {
			scope.selectedIndex = index;
			scope.currentFloor = scope.floors[index][0];
			updateIndicator();
			showCurrentFloorMaps(index);
			showCurrentFloorLandmarks();

		}

		scope.openFloorMenu = function() {
			scope.showFloors = !scope.showFloors;
			updateIndicator();
		}

		function showCurrentFloorMaps(index) {
			mapManager.removeOverlays();
			setTimeout(function() {
				var floorMaps = scope.floors[index];
				floorMaps.forEach(function(m) {
					mapManager.addOverlay(m.localMapID, m.localMapName, m.localMapOptions);
				});

					
			}, 100)
		}

		function showCurrentFloorLandmarks(floor) {
			floor = floor || scope.currentFloor.floor_num;
			scope.loadLandmarks();

			setTimeout(function() {

				var removeLandmarks = _.chain(scope.landmarks)
					.filter(function(l) {
						return l.loc_info;
					})
					.filter(function(l) {
						return l.loc_info.floor_num !== floor;
					})
					.value();

					removeLandmarks.forEach(function(l) {
						mapManager.removeMarker(l._id);
					});
					scope.$apply()
				}, 500)
		}

		function updateIndicator() {
			var baseline = scope.category ? 160 : 100;
			if (scope.showFloors) {
				var bottom = (scope.floors.length - scope.selectedIndex - 1) * 42 + baseline + 48 + 'px';
				$('.floor-indicator').css({bottom: bottom, opacity: 1});
			} else {
				$('.floor-indicator').css({bottom: baseline + 'px', opacity: 0});
			}
		}
	}
}
