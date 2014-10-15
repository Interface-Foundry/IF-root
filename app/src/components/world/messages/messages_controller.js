function MessagesController( $location, $scope, socket, $sce, db, $rootScope, $routeParams, apertureService, $http, $interval, $timeout, worldTree) {

////////////////////////////////////////////////////////////
///////////////////////INITIALIZE///////////////////////////
////////////////////////////////////////////////////////////
$scope.loggedIn = false;
$scope.nick = 'Visitor';

$scope.messages = [];
$scope.localMessages = [];

$scope.currentChatID = $routeParams.worldID;
$scope.messageList = angular.element('.message-list');

var sinceID = 'none';


function scrollMessages() {
	$timeout(function() {
    	$scope.messageList[0].scrollTop = $scope.messageList[0].scrollHeight;
    },0);
}

function checkMessages(){
db.messages.query({ worldID:$routeParams.worldID, sinceID:sinceID}, function(data){
    for (i = 0; i < data.length; i++) { 
        if ($scope.localMessages.indexOf(data[i]._id) == -1) {
            if (data[i]._id){
				sinceID = data[i]._id;
				$scope.messages.push(data[i]); 
				scrollMessages();
            }
        }
    }
});
}

$scope.sendMsg = function (e) {
	console.log('???');
	if (e) {e.preventDefault()}
	if ($scope.msg || $scope.msg.text == null || $scope.msg.img == null) {return}
	if ($scope.loggedIn){
	    var newChat = {
	        worldID: $routeParams.worldID,
	        nick: $scope.nick,
	        msg: $scope.msg.text,
	        avatar: $scope.user.avatar || 'img/icons/profile.png',
	        img: $scope.msg.img,
	        userID: $scope.userID
	    };
	
	
	    db.messages.create(newChat, function(res) {
	        console.log(res[0]);
	        console.log('response id '+res[0]._id);
	        sinceID = res[0]._id;

	        $scope.messages.push(newChat);
	        $scope.localMessages.push(res[0]._id);
	        scrollMessages();
	    });
		
	    $scope.msg.text = null;
	    $scope.msg.img = null;
	    
	}
}

$scope.goBack = function(){
    window.history.back();
}
	
	


////////////////////////////////////////////////////////////
///////////////////LISTENERS&INTERVALS//////////////////////
////////////////////////////////////////////////////////////
var checkMessagesInterval = $interval(checkMessages, 2000); 

var dereg = $rootScope.$on('$locationChangeSuccess', function() {
        $interval.cancel(checkMessagesInterval);
        dereg();
});


////////////////////////////////////////////////////////////
//////////////////////EXECUTING/////////////////////////////
////////////////////////////////////////////////////////////

worldTree.getWorld($routeParams.worldURL).then(function(data) {
	$scope.style=data.style;
	$scope.world=data.world;
	console.log($scope.style);
});

$http.get('/api/user/loggedin').success(function(user){

// Authenticated
if (user !== '0'){
	$scope.loggedIn = true;
	if (user._id){
    	$scope.userID = user._id;
	}
	//nickname
	if (user.name){
	  $scope.nick = user.name;
	}
	else if (user.facebook){
	  $scope.nick = user.facebook.name;
	}
	else if (user.twitter){
	  $scope.nick = user.twitter.displayName;
	}
	else if (user.meetup){
	  $scope.nick = user.meetup.displayName;
	}
	else if (user.local){
	  $scope.nick = user.local.email;
	}
	else {
	  $scope.nick = "Visitor";
	}
}

$scope.user = user;
console.log(user._id);
checkMessages();
});





  


}