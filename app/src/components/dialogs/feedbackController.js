app.controller('feedbackController', ['$http', '$location', '$scope', 'alertManager', 'analyticsService', 'dialogs', function($http, $location, $scope, alertManager, analyticsService, dialogs) {

  $scope.feedbackCategories = [
    {category: "map request"},
    {category: "complaint"},
    {category: "feature idea"},
    {category: "other suggestion"}
  ];

  $scope.feedbackEmotions = [
    {emotion: "happy", emoji: ":smile:"},
    {emotion: "angry", emoji: ":angry:"},
    {emotion: "confused", emoji: ":confused:"}
  ];

  $scope.feedbackCategory = {};
  $scope.feedbackEmotion = {};

  $scope.selectEmoji = function(emotion) {
	  if ($scope.feedbackEmotion === emotion) {
		  $scope.feedbackEmotion = {}
	  } else {
		  $scope.feedbackEmotion = emotion;
	  }
  };

  $scope.sendFeedback = function($event) { //sends feedback email. move to dialog directive

    var data = {
      feedbackCategory: $scope.feedbackCategory.category || "no category",
      feedbackEmotion: $scope.feedbackEmotion.emotion || "no emotion",
      feedbackText: $scope.feedbackText || null,
	  currentUrl: $location.absUrl()
    };

    $http.post('feedback', data, {server: true}).
      success(function(data){
        console.log('feedback sent');
		alertManager.addAlert('success', "Feedback sent, thanks!", true);
      }).
      error(function(err){
        console.log('there was a problem');
      });

	analyticsService.log("feedback", data);

    dialogs.show = false;
    $scope.feedbackCategory = null;
    $scope.feedbackEmotion = null;
    $scope.feedbackText = null;
  };
}]);
