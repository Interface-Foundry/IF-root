app.controller('HomeController', ['$scope', 'worldTree', 'styleManager', function ($scope, worldTree, styleManager) {
	styleManager.resetNavBG();
	
	worldTree.getNearby().then(function(data) {
		console.log(data);
	$scope.homeBubbles = data.liveAndInside;
	$scope.nearbyBubbles = data.live;
	});
}]);