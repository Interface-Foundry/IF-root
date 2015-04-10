app.controller('feedbackController', ['$http', '$scope', 'dialogs', function($http, $scope, dialogs) {

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
      feedbackText: $scope.feedbackText || null
    };

    $http.post('feedback', data).
      success(function(data){
        console.log('feedback sent');
        alert('Feedback sent, thanks!');
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