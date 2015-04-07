'use strict';

app.factory('currentWorldService', currentWorldService);

function currentWorldService() {
	
	var floorDirectory = {};

	return {
		createFloorDirectory: createFloorDirectory,
		floorNumToName: floorNumToName
	};
	
	function floorNumToName(floorNum) {
		return floorDirectory[floorNum];
	}

	function createFloorDirectory(localMapArray) {
		localMapArray.forEach(function(m) {
			floorDirectory[String(m.floor_num)] = m.floor_name;
		});
	}
}