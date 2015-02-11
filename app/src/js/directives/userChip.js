angular.module('IF-directives', [])
.directive('userChip', [function() {
	return {
		restrict: 'A',
		scope: true,
		link: function(scope, element, attrs) {
			scope.openDrawer = function() {
				console.log('openDrawer');
				scope.$emit('toggleDrawer');
			}
		},
		templateUrl: 'templates/userChip.html'
	}
		
}]);