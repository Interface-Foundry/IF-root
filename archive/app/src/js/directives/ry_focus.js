//angular.module('IF-directives', [])
app.directive('ryFocus', function($rootScope, $timeout) {
	return {
		restrict: 'A',
		scope: {
			shouldFocus: "=ryFocus"
		},
		link: function($scope, $element, attrs) {
			$scope.$watch("shouldFocus", function(current, previous) {
				if (current == true && !previous) {
					console.log('focus');
					$element[0].focus();
				} else if (current == false && previous) {
					console.log('blur');
					$element[0].blur();
				}
			});
		}
	}
});