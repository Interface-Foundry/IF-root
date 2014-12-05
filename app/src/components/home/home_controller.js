app.controller('HomeController', ['$scope', 'worldTree', 'styleManager', function ($scope, worldTree, styleManager) {
	styleManager.resetNavBG();
	
	worldTree.getNearby().then(function(data) {
		$scope.$evalAsync(function($scope) {
			$scope.homeBubbles = data['150m'];
			$scope.nearbyBubbles = data['2.5km'];
		});
	});
}]);