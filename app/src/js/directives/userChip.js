angular.module('IF-directives', [])
.directive('userChip', ['dialogs', function(dialogs) {
	return {
		restrict: 'A',
		scope: true,
		link: function(scope, element, attrs) {
			scope.openDrawer = function() {
				console.log('openDrawer');
				scope.$emit('toggleDrawer');
			}
			
			scope.login = function() {
				dialogs.showDialog('authDialog.html');
			}
		},
		templateUrl: 'templates/userChip.html'
	}
		
}]);