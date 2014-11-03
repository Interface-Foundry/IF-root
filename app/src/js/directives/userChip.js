angular.module('IF-directives', [])
.directive('userChip', function($rootScope, userManager, dialogs, $location) {
	return {
		restrict: 'A',
		scope: true,
		link: function($scope, $element, attrs) {
			$scope.openMenu = function($event) {
				if (userManager.loginStatus) {
					console.log('click1');
					$scope.userMenu = true;
					$event.stopPropagation();
					$(document).on('touchstart click', function(e) {
						$scope.userMenu = false;
						$scope.$digest();
						console.log('touchstart click');
						$(document).off('touchstart click');
					})
				} else {
					dialogs.showDialog('authDialog.html');
				}
			}
			
			$scope.closeMenu = function($event) {
				$scope.userMenu = false;
				$event.stopPropagation();
			}
		},
		templateUrl: 'templates/userChip.html'
	}
		
});