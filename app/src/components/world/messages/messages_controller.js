app.controller('MessagesController', ['$location', '$scope', '$sce', 'db', '$rootScope', '$routeParams', 'apertureService', '$http', '$timeout', 'worldTree', '$upload', function ($location, $scope,  $sce, db, $rootScope, $routeParams, apertureService, $http, $timeout, worldTree, $upload) {

////////////////////////////////////////////////////////////
///////////////////////INITIALIZE///////////////////////////
////////////////////////////////////////////////////////////
var checkMessagesTimeout;
$scope.loggedIn = false;
$scope.nick = 'Visitor';

$scope.msg = {};
$scope.messages = [];
$scope.localMessages = [];

$scope.currentChatID = $routeParams.worldID;
$scope.messageList = angular.element('.message-list');

olark('api.box.hide'); //shows olark tab on this page

var sinceID = 'none';
var firstScroll = true;


function scrollMessages() {
	$timeout(function() {
    	$scope.messageList.animate({scrollTop: $scope.messageList[0].scrollHeight}, 300); //JQUERY USED HERE
    	firstScroll=false;
    },0);
}

function checkMessages(){
db.messages.query({worldID:$routeParams.worldURL, sinceID:sinceID}, function(data){
	if (data.length>0) {
		for (i = 0; i < data.length; i++) { 
		    if ($scope.localMessages.indexOf(data[i]._id) == -1) {
		        if (data[i]._id) {
					$scope.messages.push(data[i]);
		        }
		    }
		}
	    sinceID = data[data.length-1]._id;
	    checkMessages();
	} else {
		if (firstScroll==true) {
		scrollMessages();
		}
		checkMessagesTimeout = $timeout(checkMessages, 3000);	
	}
	 
});


}

$scope.sendMsg = function (e) {
	if (e) {e.preventDefault()}
	if ($scope.msg.text == null) { return;}
	if ($scope.loggedIn){
	    var newChat = {
	        worldID: $routeParams.worldURL,
	        nick: $scope.nick,
	        msg: $scope.msg.text,
	        avatar: $scope.user.avatar || 'img/icons/profile.png',
	        userID: $scope.userID
	    };
		
		sendMsgToServer(newChat);		
	    $scope.msg.text = "";
	}
}

function sendMsgToServer(msg) {
db.messages.create(msg, function(res) {
	sinceID = res[0]._id;
	
	$scope.messages.push(msg);
	$scope.localMessages.push(res[0]._id);
	scrollMessages();
});
}
	
$scope.onImageSelect = function($files) {
	$scope.upload = $upload.upload({
		url: '/api/uploadPicture',
		file: $files[0]
	}).success(function(data, status) {
		sendMsgToServer({
			worldID: $routeParams.worldURL,
	        nick: $scope.nick,
	        avatar: $scope.user.avatar || 'img/icons/profile.png',
	        msg: '',
	        pic: data,
	        userID: $scope.userID
		});
		//console.log(data);
	})
}	


////////////////////////////////////////////////////////////
///////////////////LISTENERS&INTERVALS//////////////////////
////////////////////////////////////////////////////////////


/*
var dereg = $rootScope.$on('$locationChangeSuccess', function() {
        $interval.cancel(checkMessagesInterval);
        dereg();
});
*/


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
	  //strip name from email
	  var s = user.local.email;
	  var n = s.indexOf('@');
	  s = s.substring(0, n != -1 ? n : s.length);
	  $scope.nick = s;
	}
	else {
	  $scope.nick = "Visitor";
	}
}

$scope.user = user;
console.log(user._id);
checkMessages();
});


} ]);