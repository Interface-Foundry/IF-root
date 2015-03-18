app.directive('singleClick', ['$timeout', '$parse', function($timeout, $parse) {
	// directive that replaces ngClick when you need to use ngClick and ngDblclick on the same element. This will make the element wait for some delay before carrying out the click callback, so use sparingly.

	return {
		restrict: 'EA',
		link: link,
		scope: {
			callback: '=',
			vars: '='
		}
	};

	function link(scope, elem, attrs) {
		var delay = 300;
		var clicks = 0;
		var timer;

		elem.on('click', function(event) {
			clicks++;
			if (clicks === 1) {
				timer = $timeout(function() {
					scope.$apply(function() {
						scope.callback.apply(scope.callback, scope.vars); // apply lets you call the callback function, where the parameters are the elements of the vars array
					});
					clicks = 0;
				}, delay);
			} else { // double-click, don't execute callback above
				$timeout.cancel(timer);
				clicks = 0;
			}
		});
	}

}]);