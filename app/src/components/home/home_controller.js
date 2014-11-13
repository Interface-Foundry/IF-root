app.controller('HomeController', ['$scope', 'worldTree', function ($scope, worldTree) {
	worldTree.getNearby().then(function(data) {
		console.log(data);
	$scope.homeBubble = data.liveAndInside[0];
	$scope.nearbyBubbles = data.live;	
	});
}]);