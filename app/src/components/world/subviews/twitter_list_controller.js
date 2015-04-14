app.filter('httpsify', function() {
	return function(input) {
		input = input || "";
		return input.replace(/^http:\/\//i, 'https://'); 
	}
}) 

app.controller('TwitterListController', ['$scope', '$routeParams', 'styleManager', 'worldTree', 'db', function($scope, $routeParams, styleManager, worldTree, db) {

	worldTree.getWorld($routeParams.worldURL).then(function(data) {
		$scope.loadTweets = loadTweets;
		$scope.tweets = [];
		$scope.style = data.style;
		$scope.world = data.world;

		styleManager.navBG_color = $scope.style.navBG_color; 

		loadTweets();

		function loadTweets() {
			db.tweets.query({
				number: $scope.tweets.length, 
				tag:$scope.world.resources.hashtag
			}).$promise
			.then(function(response) {
				$scope.tweets = $scope.tweets.concat(response);
			}, function(error) {
				console.log('Error', error);
			});
		}

		// throttle will prevent calling the db multiple times
		$scope.throttledLoadTweets = _.throttle(loadTweets, 5000);
	});
}]);

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