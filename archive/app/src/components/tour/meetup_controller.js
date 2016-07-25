app.controller('MeetupController', ['$scope', '$window', '$location', 'styleManager', '$rootScope','dialogs', function ($scope, $window, $location, styleManager, $rootScope, dialogs) {


	var style = styleManager;

	style.setNavBG("#3d66ca");

	angular.element('#view').bind("scroll", function () {
		console.log(this.scrollTop);
	});
	
	angular.element('#wrap').scroll(
	_.debounce(function() {
		console.log(this.scrollTop);
		$scope.scroll = this.scrollTop;
		$scope.$apply();
		}, 20));

	$scope.openSignup = function(){
		$scope.setShowSplashReset();
	}
	
	// $scope.loadmeetup = function() {
	// 	$location.path('/auth/meetup');
	// }

}]);
