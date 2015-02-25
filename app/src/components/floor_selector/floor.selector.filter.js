app.filter('floorNumberFilter', floorNumberFilter);

function floorNumberFilter() {
	return function(floor) {
		if (!floor) {
			return;
		}
		if (floor.floor_num <= 1) {
			return floor.floor_name[0];
		} else {
			return floor.floor_num;
		}
	}
}