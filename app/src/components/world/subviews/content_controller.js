// app.controller('InstagramListController', ['$scope', '$routeParams', 'styleManager', 'worldTree', 'db', function($scope, $routeParams, styleManager, worldTree, db) {
// 	worldTree.getWorld($routeParams.worldURL).then(function(data) {
// 		$scope.world = data.world;
// 		$scope.style = data.style;
// 		styleManager.navBG_color = $scope.style.navBG_color; 
		
// 		$scope.instagrams = db.instagrams.query({limit:30, tag:$scope.world.resources.hashtag}); // make infinite scroll?	
// 	})
// }])

// model after above