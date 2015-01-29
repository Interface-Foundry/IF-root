app.controller('InstagramListController', ['$scope', '$routeParams', 'styleManager', 'worldTree', 'db', function($scope, $routeParams, styleManager, worldTree, db) {
	worldTree.getWorld($routeParams.worldURL).then(function(data) {
		$scope.world = data.world;
		$scope.style = data.style;
		styleManager.navBG_color = $scope.style.navBG_color; 
		
		$scope.instagrams = db.instagrams.query({limit:30, tag:$scope.world.resources.hashtag}); // make infinite scroll?	
	})
}])

//instagrams is an array of form
// [{"objectID":string,
//	"text":string,
//	"_id": mongoid,
//	"tags": array of strings
//	"local_path": array of 1 string (?)
//	"user": {"name": string,
//			"screen_name": string,
//			"userId": number
//			"userID_str": number
//			"profile_image_url": abs url},
//	"__v": 0

