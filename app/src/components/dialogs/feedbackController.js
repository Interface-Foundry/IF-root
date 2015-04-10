app.controller('feedbackController', ['$http', '$location', '$scope', 'alertManager', 'dialogs', function($http, $location, $scope, alertManager, dialogs) {

  $scope.feedbackCategories = [
    {category: "map request"},
    {category: "complaint"},
    {category: "feature idea"},
    {category: "other suggestion"}
  ];

  $scope.feedbackEmotions = [
    {emotion: "excited"},
    {emotion: "angry"},
    {emotion: "confused"}
  ];

  $scope.sendFeedback = function($event) { //sends feedback email. move to dialog directive

    var data = {
      feedbackCategory: $scope.feedbackCategory.category || "no category",
      feedbackEmotion: $scope.feedbackEmotion.emotion || "no emotion",
      feedbackText: $scope.feedbackText || null,
	  currentUrl: $location.absUrl()
    };

    $http.post('feedback', data).
      success(function(data){
        console.log('feedback sent');
		alertManager.addAlert('success', "Feedback sent, thanks!", true);
      }).
      error(function(err){
        console.log('there was a problem');
      });

    dialogs.show = false;
    $scope.feedbackCategory = null;
    $scope.feedbackEmotion = null;
    $scope.feedbackText = null;
  };
}]);
