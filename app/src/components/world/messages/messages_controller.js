app.controller('MessagesController', ['$location', '$scope', '$sce', 'db', '$rootScope', '$routeParams', 'apertureService', '$http', '$timeout', 'worldTree', '$upload', 'styleManager', 'alertManager', 'dialogs', 'userManager', 'mapManager', 'ifGlobals', 'leafletData', 'stickerManager', 'messagesService', function ($location, $scope,  $sce, db, $rootScope, $routeParams, apertureService, $http, $timeout, worldTree, $upload, styleManager, alertManager, dialogs, userManager, mapManager, ifGlobals, leafletData, stickerManager, messagesService) {

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

$scope.msg = {};
$scope.messages = [];
$scope.localMessages = [];
$scope.stickers = ifGlobals.stickers;
$scope.editing = false;

var sinceID = 'none';
var firstScroll = true;

function scrollToBottom() {
	$timeout(function() {
		messageList.animate({scrollTop: messageList[0].scrollHeight * 2}, 300); //JQUERY USED HERE
	},0);
	if (firstScroll==true) {
		firstScroll = false;
		profileEditMessage();
	}
}

//Initiates message checking loop, calls itself. 
function checkMessages() {
	var doScroll = firstScroll;
db.messages.query({roomID:$scope.world._id, sinceID:sinceID}, function(data){
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
	if (doScroll) {
		scrollToBottom();
	}
	}
	 
});
}

function sendMsgToServer(msg) {
$http.post('/api/worldchat/create', msg, {server: true})
	.success(function(success) {
		sinceID = success[0]._id;
		msg._id = success[0]._id;
		$scope.messages.push(msg);
		$scope.localMessages.push(success[0]._id);
		scrollToBottom();
	})
	.error(function(error) {
		//HANDLE
	})
}

$scope.toggleMap = function() {
	if ($scope.editing) {
		$scope.editing = false;
	}
	var url = $location.path();
	if (url.indexOf('#') > -1) {
		$location.path(url.slice(0, url.indexOf('#')));
	}
	aperture.toggle('full');

}

function checkStickerUrl(url) {
	var url = $location.path();
	if (url.indexOf('#') === -1) {
		// changing the url allows user to click back button to return to chat
		url = $location.url() + '#stickers';
		$location.path(url, false);
	}
}

$scope.sendMsg = function (e) {
	if ($scope.editing) {
		$scope.pinSticker();
		return;
	}
	if (e) {e.preventDefault()}
	if ($scope.msg.text == null) {return;}
	if (userManager.loginStatus) {
		var newChat = {
		    roomID: $scope.world._id,
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
	$scope.uploading = true;
	$scope.uploadProgress = 0;
	$scope.upload = $upload.upload({
		url: '/api/uploadPicture',
		file: $files[0]
	}).progress(function(e) {
		console.log(e);
		$scope.uploadProgress = parseInt(100.0 * e.loaded / e.total);
	}).success(function(data, status) {
		console.log(data);
		sendMsgToServer({
			roomID: $scope.world._id,
			userID: $scope.userID,
	        nick: $scope.nick,
	        avatar: $scope.user.avatar || 'img/icons/profile.png',
	        msg: '',
	        pic: data,
	        kind: 'pic'
		});
		$scope.uploading = false;
		//console.log(data);
	})
}	

$scope.showStickers = function() {
	if ($scope.editing) {
		return;
	}
	checkStickerUrl();

	$scope.editing = true;
	aperture.set('full');
}

$scope.selectSticker = function(sticker) {
	$scope.selected = sticker;
	$scope.stickerChange = true;
	$scope.msg.text = sticker.name;
	$timeout(function() {
		$scope.stickerChange = false
	}, 500);
}

$scope.messageLink = function(message) {
	console.log(message);
	if (message.sticker) {
		aperture.set('full');
		stickerManager.getSticker(message.sticker._id).then(function(sticker) {
			console.log('getSticker', sticker);
			map.setCenter(sticker.loc.coordinates, 18, $scope.aperture.state);
			if (map.hasMarker(sticker._id)) {
				map.setMarkerFocus(sticker._id);
			} else {
				addStickerToMap(sticker);
			}
			checkStickerUrl();
		});
	} else if (message.href) {
		$location.path(message.href);
	}
}

$scope.pinSticker = function() {
	if (!$scope.selected) {
		return;
	}
	//getStickerLoc//
	var sticker = angular.copy($scope.selected),
		h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
		w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0), 
		left = w/2,
		top = (h-220-40)/2+40;
	leafletData.getMap().then(function(map) {
		var latlng = map.containerPointToLatLng([left, top]);
		sticker.loc = {
			coordinates: [latlng.lng, latlng.lat]
		}
	//end getStickerLoc//
		sticker.time = Date.now();
		sticker.roomID = $scope.world._id;
		sticker.message = $scope.msg.text || sticker.name;
		sticker.avatar = $scope.user.avatar;
		
		stickerManager.postSticker(sticker).then(function(success) {
			addStickerToMap(success)			

			$timeout(function() {
				sendMsgToServer({
				roomID: $scope.world._id,
				userID: $scope.userID,
				nick: $scope.nick,
				avatar: $scope.user.avatar || 'img/icons/profile.png',
				msg: $scope.msg.text || sticker.name,
				sticker: {
					img: sticker.img,
					_id: success._id
				},
				kind: 'sticker'
				});
				$scope.msg.text = "";
			}, 500);

		}, function(error) {
			console.log(error);
			//handle error
		})
	})
	
	$scope.selected = undefined;
	$scope.editing = false;
	aperture.set('off');
}

function getAvatar() {
	return $scope.user.avatar || 'img/icons/profile.png';
}

//add welcome message 
function welcomeMessage() {
	var newChat = messagesService.createWelcomeMessage($scope.world);
	$scope.messages.push(newChat);
}

function profileEditMessage() {
	var newChat = messagesService.createProfileEditMessage($scope.world, $scope.nick);
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
					iconUrl: 'img/marker/bubbleMarker_30.png',
					shadowUrl: '',
					iconSize: [24, 24], 
					iconAnchor: [11, 11],
					popupAnchor:[0, -12]
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

function loadStickers() {
	console.log('loadStickers');
	stickerManager.getStickers({_id: $scope.world._id}).then(function(stickers) {
		console.log(stickers);
		addStickersToMap(stickers);
	})
}

function addStickersToMap(stickers) {
	stickers.forEach(function(sticker, index, stickers) {
		addStickerToMap(sticker);
	})
}

function addStickerToMap(sticker) {
	mapManager.addMarker(sticker._id, {
		lat: sticker.loc.coordinates[1],
		lng: sticker.loc.coordinates[0],
		icon: {
			iconUrl: sticker.iconInfo.iconUrl,
			shadowUrl: '',
			iconSize: [100, 100], 
			iconAnchor: [50, 100],
			popupAnchor: [0, -80]
		},
		message: '<div class="avatarWrapper"><img class="user-chip-img user-map-img" src="' + getAvatar() + '"/>' + '<strong>' + $scope.nick + '</strong></div>' + '<p class="user-map-text">' + sticker.message + '</p>'
	});
}

////////////////////////////////////////////////////////////
///////////////////LISTENERS&INTERVALS//////////////////////
////////////////////////////////////////////////////////////



var dereg = $rootScope.$on('$locationChangeSuccess', function() {
    $timeout.cancel(checkMessagesTimeout);
    dereg();
});

$scope.$watch('editing', function(newBool, oldBool) {
	if (newBool===true) {
		//editing
		console.log('editing true');
		map.fadeMarkers(true);
	} else if (newBool===false) {
		//not editing
		map.fadeMarkers(false);
	}
})

////////////////////////////////////////////////////////////
//////////////////////EXECUTING/////////////////////////////
////////////////////////////////////////////////////////////

worldTree.getWorld($routeParams.worldURL).then(function(data) {
	$scope.style=data.style;
		style.navBG_color = $scope.style.navBG_color;

	$scope.world=data.world;

	loadWorld();
	welcomeMessage();
	loadStickers();
	checkMessages();
});

userManager.getUser().then(function(user) {
		$scope.user = user;
		$scope.nick = userManager.getDisplayName();	
	}, function(reason) {
	dialogs.showDialog('messageAuthDialog.html');
});


} ]);