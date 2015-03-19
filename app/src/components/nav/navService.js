app.factory('navService', [function() {
	// used for displaying correct selection on nav icons, as well as showing and hiding explore-view and search-view directives in index.html

	var status = {
		home: true, // default home nav selected
		explore: false,
		search: false, // main bubblli search
		searchWithinBubble: false // search within a bubble (all, text, category)
	};

	return {
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