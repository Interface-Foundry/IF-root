'use strict';

app.factory('floorSelectorService', floorSelectorService);

floorSelectorService.$inject = [];

function floorSelectorService() {
	
	var currentFloor = {floor_num: 1},
			floors = [],
			selectedIndex,
			showFloors,
			showLandmarks = false;

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
		showLandmarks: showLandmarks,
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
		var nums = floors.map(function(f) {
			return f[0].floor_num;
		});
		var i = nums.indexOf(currentFloor.floor_num);
		setSelectedIndex(i);
	}

	function updateIndicator(categoryMode) {
		selectedIndex = selectedIndex >= 0 ? selectedIndex : getSelectedIndex();
		if (this.showFloors) {
			// 42 is height of floor, 20 is margin-bottom on bottom floor, selected index adds pixels for floor-tile:after border
			var top = (42 * (selectedIndex + 1) - 48 + 20) + selectedIndex + 'px';
			$('.floor-indicator').css({top: top, opacity: 1});
		} else {
			$('.floor-indicator').css({opacity: 0});
		}
	}

	function getFloors(localMapArray) {

		var sorted = _.chain(localMapArray)
			.filter(function(f) {
				return f.floor_num;
			})
			.groupBy('floor_num')
			.toArray()
			.sortBy(function(arr) {
				return arr[0].floor_num;
			})
			.reverse()
			.value()

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