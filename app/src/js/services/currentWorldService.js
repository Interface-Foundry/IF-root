'use strict';

app.factory('currentWorldService', currentWorldService);

function currentWorldService() {
	
	var floorDirectory = {};

	return {
		createFloorDirectory: createFloorDirectory,
		floorNumToName: floorNumToName
	};
	
	function floorNumToName(floorNum) {
		if (_.isEmpty(floorDirectory)) {
			return floorNum;
		} else {
			return floorDirectory[floorNum] || 'Floor ' + floorNum;
		}
	}

	function createFloorDirectory(localMapArray) {
		localMapArray.forEach(function(m) {
			floorDirectory[String(m.floor_num)] = m.floor_name || 'Floor ' + m.floor_num;
		});
	}
}