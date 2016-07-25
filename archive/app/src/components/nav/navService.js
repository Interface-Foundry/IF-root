app.factory('navService', [function() {
	// used for displaying correct selection on nav icons, and managing back button

	var status = {
		home: true, // default home nav selected
		world: false, // in world
		search: false // global search or world search
	};

	var backPages = -1; // for back button, num pages to go back. useful for 404 page

	return {
		backPages: backPages,
		status: status,
		reset: reset,
		show: show
	};

	function reset() {
		// set all values in status to false, except home
		_.each(status, function(value, key) {
			status[key] = false;
		});
		status.home = true;
	}

	function show(key) {
		// sets one navShow to true, sets others to false
		reset();
		status.home = false;
		status[key] = true;
	}

}]);