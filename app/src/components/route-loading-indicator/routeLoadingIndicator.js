app.directive('routeLoadingIndicator', ['$rootScope', '$timeout', function($rootScope, $timeout) {

	return {
		restrict: 'E',
		template: '<div ng-show="isRouteLoading"><div class="routeLoading routeLoading--left"></div><div class="routeLoading routeLoading--right"></div></div>',
		link: link
	};

	function link(scope, elem, attrs) {
		$rootScope.isRouteLoading = false;

		$rootScope.$on('$routeChangeStart', function() {
			$rootScope.isRouteLoading = true;
		});

		$rootScope.$on('$routeChangeSuccess', function() {
			$rootScope.isRouteLoading = false;
		})
	}

}]);

