app.controller('InstagramListController', ['$scope', '$routeParams', 'styleManager', 'worldTree', 'db', function($scope, $routeParams, styleManager, worldTree, db) {
	worldTree.getWorld($routeParams.worldURL).then(function(data) {
		
		$scope.loadInstagrams = loadInstagrams;
		$scope.instagrams = [];
		$scope.style = data.style;
		$scope.world = data.world;

		styleManager.navBG_color = $scope.style.navBG_color; 
		
		loadInstagrams();

		function loadInstagrams() {
			db.instagrams.query({
				number: $scope.instagrams.length,
				tags: $scope.world.resources.hashtag
			}).$promise
			.then(function(response) {
				$scope.instagrams.concat(response);
			}, function(error) {
				console.log('Error:', error);
			});
		}
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

