app.controller('MessagesController', ['$location', '$scope', '$sce', 'db', '$rootScope', '$routeParams', 'apertureService', '$http', '$timeout', 'worldTree', '$upload', 'styleManager', 'alertManager', 'dialogs', 'userManager', 'mapManager', 'ifGlobals', 'leafletData',  function ($location, $scope,  $sce, db, $rootScope, $routeParams, apertureService, $http, $timeout, worldTree, $upload, styleManager, alertManager, dialogs, userManager, mapManager, ifGlobals, leafletData) {

////////////////////////////////////////////////////////////
///////////////////////INITIALIZE///////////////////////////
////////////////////////////////////////////////////////////
var checkMessagesTimeout;
var alerts = alertManager;
var style = styleManager;
var aperture = apertureService;
var map = mapManager;
aperture.set('off');

var messageList = $('.message-list');

$scope.loggedIn = false;
$scope.nick = 'Visitor';
$rootScope.hideBack = true;

$scope.msg = {};
$scope.messages = [];
$scope.localMessages = [];
$scope.stickers = ifGlobals.stickers;

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

$scope.showStickers = function() {
	aperture.set('full');
}

$scope.select = function(sticker) {
	$scope.selected = sticker;
}

$scope.pinSticker = function() {
	var sticker = $scope.selected,
		h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
		w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0), 
		left = w/2,
		top = (h-220-40)/2+40;
	leafletData.getMap().then(function(map) {
		var latlng = map.containerPointToLatLng([left, top]);	
		mapManager.addMarker('c', {
				lat: latlng.lat,
				lng: latlng.lng,
				icon: {
					iconUrl: sticker.img,
					shadowUrl: '',
					iconSize: [100, 100], 
					iconAnchor: [50, 100],
					popupAnchor: [0, -80]
				},
				message: 'Testing'
		});
		
	})
	
	sendMsgToServer({
		worldID: $routeParams.worldURL,
		nick: $scope.nick,
	    avatar: $scope.user.avatar || 'img/icons/profile.png',
	    msg: 'Sticker posted',
		userID: $scope.userID,
		sticker: {
			img: sticker.img,
		}
	});
	
	$scope.selected = undefined;
	aperture.set('off');
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

function loadWorld() {
	if ($scope.world.hasOwnProperty('loc') && $scope.world.loc.hasOwnProperty('coordinates')) {
			map.setCenter([$scope.world.loc.coordinates[0], $scope.world.loc.coordinates[1]], 18, $scope.aperture.state);
			console.log('setcenter');
			map.addMarker('c', {
				lat: $scope.world.loc.coordinates[1],
				lng: $scope.world.loc.coordinates[0],
				icon: {
					iconUrl: 'img/marker/bubble-marker-50.png',
					shadowUrl: '',
					iconSize: [35, 67], 
					iconAnchor: [17, 67],
					popupAnchor:[0, -40]
				},
				message:'<a href="#/w/'+$scope.world.id+'/">'+$scope.world.name+'</a>',

			});
		} else {
			console.error('No center found! Error!');
		}
		
		if ($scope.world.style.hasOwnProperty('maps')) {
			if ($scope.world.style.maps.localMapID) {
			map.addOverlay($scope.world.style.maps.localMapID, 
							$scope.world.style.maps.localMapName, 
							$scope.world.style.maps.localMapOptions);
			}
			if ($scope.world.style.maps.hasOwnProperty('localMapOptions')) {
				zoomLevel = $scope.world.style.maps.localMapOptions.maxZoom || 19;
			}
		
			if (tilesDict.hasOwnProperty($scope.world.style.maps.cloudMapName)) {
				map.setBaseLayer(tilesDict[$scope.world.style.maps.cloudMapName]['url']);
			} else if ($scope.world.style.maps.hasOwnProperty('cloudMapID')) {
				map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/'+$scope.world.style.maps.cloudMapID+'/{z}/{x}/{y}.png');
			} else {
				console.warn('No base layer found! Defaulting to forum.');
				map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/interfacefoundry.jh58g2al/{z}/{x}/{y}.png');
			}
		}
}


////////////////////////////////////////////////////////////
///////////////////LISTENERS&INTERVALS//////////////////////
////////////////////////////////////////////////////////////



var dereg = $rootScope.$on('$locationChangeSuccess', function() {
    $timeout.cancel(checkMessagesTimeout);
	$rootScope.hideBack = false;
    dereg();
});

////////////////////////////////////////////////////////////
//////////////////////EXECUTING/////////////////////////////
////////////////////////////////////////////////////////////

worldTree.getWorld($routeParams.worldURL).then(function(data) {
	$scope.style=data.style;
		style.navBG_color = $scope.style.navBG_color;

	$scope.world=data.world;

	loadWorld();
	welcomeMessage();
});

userManager.getUser().then(function(user) {
		$scope.user = user;
	userManager.getDisplayName().then(function(displayName) {
		$scope.nick = displayName;	
	});
	}, function(reason) {
	dialogs.showDialog('messageAuthDialog.html');
});

checkMessages();

} ]);