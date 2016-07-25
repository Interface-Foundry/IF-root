'use strict';
// keep track of which type of bubble user is currently viewing
app
	.factory('bubbleTypeService', [
		function() {
			
			var currentBubbleType;

			return {
				set: set,
				get: get
			}

			function set(type) {
				currentBubbleType = type;
			}

			function get() {
				return currentBubbleType;
			}
}]);