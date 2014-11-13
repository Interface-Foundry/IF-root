app.controller('HomeController', ['$scope', 'worldTree', function ($scope, worldTree) {
	worldTree.getNearby().then(function(data) {
		console.log(data);
	$scope.homeBubbles = data.liveAndInside;
	$scope.nearbyBubbles = data.live;	
	});
}]);