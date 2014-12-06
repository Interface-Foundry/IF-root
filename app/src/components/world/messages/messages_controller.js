app.controller('MessagesController', ['$location', '$scope', '$sce', 'db', '$rootScope', '$routeParams', 'apertureService', '$http', '$timeout', 'worldTree', '$upload', 'styleManager', 'alertManager', 'dialogs', 'userManager',  function ($location, $scope,  $sce, db, $rootScope, $routeParams, apertureService, $http, $timeout, worldTree, $upload, styleManager, alertManager, dialogs, userManager) {

////////////////////////////////////////////////////////////
///////////////////////INITIALIZE///////////////////////////
////////////////////////////////////////////////////////////
var checkMessagesTimeout;
var alerts = alertManager;
var style = styleManager;
var aperture = apertureService; 
aperture.set('off');

var messageList = $('.message-list');

$scope.loggedIn = false;
$scope.nick = 'Visitor';

$scope.msg = {};
$scope.messages = [];
$scope.localMessages = [];

var sinceID = 'none';
var firstScroll = true;

function scrollToBottom() {
	$timeout(function() {
		messageList.animate({scrollTop: messageList[0].scrollHeight * 2}, 300); //JQUERY USED HERE
	},0);
	firstScroll = false;
}

function checkMessages() {
	var doScroll = firstScroll;
db.messages.query({worldID:$routeParams.worldURL, sinceID:sinceID}, function(data){
	if (messageList[0].scrollHeight - messageList.scrollTop() - messageList.outerHeight() < 50) {
		doScroll = true;
	}
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
		checkMessagesTimeout = $timeout(checkMessages, 3000);	
	}
	if (doScroll) {
		scrollToBottom();
	}
	 
});
}

function sendMsgToServer(msg) {
db.messages.create(msg, function(res) {
	sinceID = res[0]._id;
	
	msg._id = res[0]._id;
	$scope.messages.push(msg);
	$scope.localMessages.push(res[0]._id);
	scrollToBottom();
});
}

$scope.sendMsg = function (e) {
	if (e) {e.preventDefault()}
	if ($scope.msg.text == null) {return;}
	if (userManager.loginStatus) {
		var newChat = {
		    worldID: $routeParams.worldURL,
			nick: $scope.nick,
			msg: $scope.msg.text,
			avatar: $scope.user.avatar || 'img/icons/profile.png',
		    userID: $scope.userID,
		};
		
		sendMsgToServer(newChat);		
	    $scope.msg.text = "";
	}
}

$scope.alert = function (msg) {
	alerts.addAlert('warning', msg, true);
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

//add welcome message 
function welcomeMessage(){
	
	var newChat = {
	    worldID: $routeParams.worldURL,
	    nick: 'BubblyBot',
	    msg: 'Hey there, this is a Bubble chat created just for '+$scope.world.name+'. Chat, share pictures & leave notes with others here!',
	    avatar: $scope.world.avatar || 'img/icons/profile.png',
	    userID: 'chatbot'
	};
	$scope.messages.push(newChat);
}


////////////////////////////////////////////////////////////
///////////////////LISTENERS&INTERVALS//////////////////////
////////////////////////////////////////////////////////////



var dereg = $rootScope.$on('$locationChangeSuccess', function() {
        $timeout.cancel(checkMessagesTimeout);
        dereg();
});

////////////////////////////////////////////////////////////
//////////////////////EXECUTING/////////////////////////////
////////////////////////////////////////////////////////////

worldTree.getWorld($routeParams.worldURL).then(function(data) {
	$scope.style=data.style;
	$scope.world=data.world;
	welcomeMessage();
});

userManager.checkLogin().then(function(user) {
	userManager.getUser().then(function(user) {
		$scope.user = user;
	});
	userManager.getDisplayName().then(function(displayName) {
		$scope.nick = displayName;	
	});
}, function(reason) {
	dialogs.showDialog('messageAuthDialog.html');
});

checkMessages();

} ]);