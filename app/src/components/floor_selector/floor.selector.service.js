'use strict';

app.factory('floorSelectorService', floorSelectorService);

floorSelectorService.$inject = [];

function floorSelectorService() {
	
	var currentFloor,
			showFloors;

	return {
		currentFloor: currentFloor,
		landmarksToFloors: landmarksToFloors,
		showFloors: showFloors
	};

	function landmarksToFloors(landmarks) {
		return _.chain(landmarks)
			.map(function(l) {
				return l.loc_info ? l.loc_info.floor_num : 1;
			})
			.uniq()
			.value()
	}

}