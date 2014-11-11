angular.module('IF-directives', [])
.directive('userChip', function($rootScope, userManager, dialogs, $location) {
	return {
		restrict: 'A',
		scope: true,
		link: function($scope, $element, attrs) {
			$scope.openMenu = function($event) {
				if (userManager.loginStatus && $scope.userMenu !== true) {
					console.log('click1');
					$scope.userMenu = true;
					$event.stopPropagation();
					$('html').on('click', function(e) {
						$scope.userMenu = false;
						$scope.$digest();
						console.log('click');
						$('html').off('click');
					})
				} else if (!userManager.loginStatus) {
					dialogs.showDialog('authDialog.html');
				}
			}
		},
		templateUrl: 'templates/userChip.html'
	}
		
});