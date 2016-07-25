app.filter('landmarkIsVisible', [function() {
	/**
	 * if input is an array, returns new array with landmarks that are visible
	 * if input is single landmark, returns landmark if visible and null otherwise
	 */

	return function(input) {
		if (_.isArray(input)) {
			var visibleLandmarks = _.filter(input, function(landmark) {
				return !landmark.permissions.hidden
			});
			return visibleLandmarks;
		} else {
			return input.permissions.hidden ? null : input;
		}
	}

}]);	