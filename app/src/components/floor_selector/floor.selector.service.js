'use strict';

app.factory('floorSelectorService', floorSelectorService);

floorSelectorService.$inject = [];

function floorSelectorService() {
	
	var currentFloor = {floor_num: 1},
			floors = [],
			selectedIndex,
			showFloors;

	return {
		currentFloor: currentFloor,
		getFloors: getFloors,
		getSelectedIndex: getSelectedIndex,
		floors: floors,
		landmarksToFloors: landmarksToFloors,
		selectedIndex: selectedIndex,
		setCurrentFloor: setCurrentFloor,
		setSelectedIndex: setSelectedIndex,
		showFloors: showFloors,
		updateIndicator: updateIndicator
	};

	function landmarksToFloors(landmarks) {
		return _.chain(landmarks)
			.map(function(l) {
				return l.loc_info ? l.loc_info.floor_num : 1;
			})
			.uniq()
			.sort()
			.value()
	}

	function setCurrentFloor(floor) {
		angular.copy(floor, currentFloor);
	}

	function updateIndicator(categoryMode) {
		var baseline = categoryMode ? 140 : 100;
		selectedIndex = selectedIndex >= 0 ? selectedIndex : getSelectedIndex();
		if (this.showFloors) {
			var bottom = (floors.length - selectedIndex - 1) * 42 + baseline + 48 + 'px';
			$('.floor-indicator').css({bottom: bottom, opacity: 1});
		} else {
			$('.floor-indicator').css({bottom: baseline + 'px', opacity: 0});
		}
	}

	function getFloors(localMapArray) {
		var sorted = _.chain(localMapArray)
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
		angular.copy(sorted, floors);
		return floors;
	}

	function getSelectedIndex() {
		selectedIndex = floors.length - 1;
		return selectedIndex;
	}

	function setSelectedIndex(index) {
		selectedIndex = index;
		return selectedIndex;
	}
}