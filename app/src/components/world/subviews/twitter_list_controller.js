app.filter('httpsify', function() {
	return function(input) {
		input = input || "";
		return input.replace(/^http:\/\//i, 'https://'); 
	}
}) 

app.controller('TwitterListController', ['$scope', '$routeParams', 'styleManager', 'worldTree', 'db', function($scope, $routeParams, styleManager, worldTree, db) {
	worldTree.getWorld($routeParams.worldURL).then(function(data) {
		$scope.world = data.world;
		$scope.style = data.style;
		styleManager.navBG_color = $scope.style.navBG_color; 
		
		$scope.tweets = db.tweets.query({limit:50, tag:$scope.world.resources.hashtag});
	})

//tweets is an array of form
// [{"text": string,
//	"tweetID_str":string,
//	"tweetID": number,
//	"_id": mongoID
//	"created": iso date,
//	"hashtags": array of strings
//	"media": {"media_url": string,
//				"media_type": string}
//	"user": {"profile_image_url": url,
//			"screen_name": string,
//			"name": string}
//	"__v": 0}....]

}])