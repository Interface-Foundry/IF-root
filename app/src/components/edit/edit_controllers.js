app.controller('EditController', ['$scope', 'db', 'World', '$rootScope', '$route', '$routeParams', 'apertureService', 'mapManager', 'styleManager', 'alertManager', '$upload', '$http', '$timeout', '$interval', 'dialogs', '$window', '$location', '$anchorScroll', 'ifGlobals', function($scope, db, World, $rootScope, $route, $routeParams, apertureService, mapManager, styleManager, alertManager, $upload, $http, $timeout, $interval, dialogs, $window, $location, $anchorScroll, ifGlobals) {

//@IFDEF PHONEGAP
dialogs.showDialog('mobileDialog.html');
$window.history.back();
//isnt ready for mobile yet
//@ENDIF


var aperture = apertureService,
	map = mapManager,
	style = styleManager,
	alerts = alertManager;
var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];
zoomControl.style.top = "50px";
zoomControl.style.left = "40%"; 
//TODO: do this in map controller

var lastRoute = $route.current;
$scope.worldURL = $routeParams.worldURL;

aperture.set('full');

$scope.mapThemeSelect = 'arabesque';

$scope.kinds = [
	{name:'Convention'},
	{name: 'Park'},
	{name: 'Retail'},
	{name: 'Venue'},
	{name: 'Event'},
	{name: 'Venue'},
	{name: 'Campus'},
	{name: 'Home'},
	{name: 'Neighborhood'}
]; 
//TODO: Switch to ifGlobal source 

$scope.mapThemes = ifGlobals.mapThemes;

function tempID() { 
	//Used because angular leaflet has issues with watching when a marker is replaced with a marker of the same name. 
	//Kind of stupid.
	return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12);
}

var markerID = tempID();

$scope.temp = {
	scale: 1
}
 //Used for local map scaling

$http.get('/components/edit/edit.locale-en-us.json').success(function(data) { 
	$scope.locale = angular.fromJson(data);
	$scope.tooltips = $scope.locale.tooltips;
}); 
//weird way of throwing tooltip text on before we had solidified it. TODO: centralize localization method.

if ($routeParams.view) {
	$scope.view = $routeParams.view; 
	//switching between the three subviews
} else {
	$scope.view = 'details';
}

$scope.initView = function() {
	//switch the state of the circle mask on or off, style view wants flat black
	switch ($scope.view) {
		case 'details':
		map.setCircleMaskState('mask');
			break;
		case 'maps': 
		map.setCircleMaskState('mask');
			break;
		case 'styles':
		console.log('switching to styles');
		map.setCircleMaskState('cover');
			break;
	}
}

$scope.onWorldIconSelect = function($files) { 
	//file uploading, uses angular-file-upload
	var file = $files[0];
	$scope.upload = $upload.upload({
		url: '/api/upload/',
		file: file,
	}).progress(function(e) {
		console.log('%' + parseInt(100.0 * e.loaded/e.total));
	}).success(function(data, status, headers, config) {
		$scope.world.avatar = data;
		$scope.uploadFinished = true;
	});
}

$scope.onLandmarkCategoryIconSelect = function($files) {
	//same as above
	var file = $files[0];
	$scope.upload = $upload.upload({
		url: '/api/upload/',
		file: file,
	}).progress(function(e) {
		console.log('%' + parseInt(100.0 * e.loaded/e.total));
	}).success(function(data, status, headers, config) {
		console.log(data);
		$scope.temp.LandmarkCatAvatar = data;
		$scope.uploadFinishedLandmark = true;
	});
}

$scope.setUploadFinished = function(bool, type) { 
	if (type == 'world') {
		if (bool) {
			$scope.uploadFinished = true;
		}
		else {
			$scope.uploadFinished = false;
			$scope.world.avatar = null;
		}
	}
	if (type == 'landmark') {
		if (bool) {
			$scope.uploadFinishedLandmark = true;
		}
		else {
			$scope.uploadFinishedLandmark = false;
			$scope.temp.LandmarkCatAvatar = null;
		}
	}
};

$scope.onLocalMapSelect = function($files, floor_num, floor_name) {
	if (floor_num == '') {
		alerts.addAlert('info', "Please enter a floor number", true);
	}
	else if (floor_num == 0) {
		alerts.addAlert('info', "The floor number can't be 0", true);
	} 
	else {
		//local map image upload, then places image on map
		var file = $files[0];
		$scope.upload = $upload.upload({
			url: '/api/upload_maps',
			file: file
		}).progress(function(e) {
			console.log('%' + parseInt(100.0 * e.loaded/e.total));
			if (!$scope.temp) {$scope.temp = {}}
			$scope.temp.picProgress = parseInt(100.0 * e.loaded/e.total)+'%';
		}).success(function(data, status, headers, config) {
			$scope.mapImage = data;
			map.placeImage(markerID, data);
			// post details to /api/temp_map_upload
			// will update floor_num and floor_name
			var newData = {
				worldID: $scope.world._id,
				map_marker_viewID: markerID,
				temp_upload_path: data,
				floor_num: floor_num,
				floor_name: floor_name
			};
			$http.post('/api/temp_map_upload', newData).
				success(function(data, status, headers, config) {
					console.log('success: ', data);
					$scope.world = data;
					$scope.selectLastMap();
				}).
				error(function(data, status, headers, config) {
					console.log('error: ', data);
				});
			});
		scrollToBottom(300);
	}
}

$scope.selectMapTheme = function(key) {
	if (typeof name === 'string') {
		$scope.mapThemeSelect = key;
		map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/'+$scope.mapThemes[key].cloudMapID+'/{z}/{x}/{y}.png');
		
		$scope.world.style.maps.cloudMapName = $scope.mapThemes[key].cloudMapName;
		$scope.world.style.maps.cloudMapID = $scope.mapThemes[key].cloudMapID;
		
		if ($scope.style.hasOwnProperty('navBG_color')==false) {
			$scope.setThemeFromMap();
		}
	}
}

$scope.setThemeFromMap = function() {
	switch ($scope.world.style.maps.cloudMapName) {
		case 'urban':
			angular.extend($scope.style, themeDict['urban']);
			break;
		case 'sunset':
			angular.extend($scope.style, themeDict['sunset']);
			break;
		case 'fairy':
			angular.extend($scope.style, themeDict['fairy']);
			break;
		case 'arabesque':
			angular.extend($scope.style, themeDict['arabesque']);
			break;
		case 'purple haze': 
			angular.extend($scope.style, themeDict['haze']);
			break;
	}
}

$scope.addLandmarkCategory = function() {
	//adds landmark categories one by one to list
	if ($scope.temp) {

		$scope.world.landmarkCategories.unshift({name: $scope.temp.LandmarkCategory, avatar: $scope.temp.LandmarkCatAvatar, present: $scope.temp.landmarkPresent});

		// console.log('----- TEST')
		// console.log($scope.world.landmarkCategories);
		delete $scope.temp.LandmarkCatAvatar;
		delete $scope.temp.LandmarkCategory;
		$scope.temp.landmarkPresent = false;
		$scope.uploadFinishedLandmark = false;
	}
}

$scope.removeLandmarkCategory = function(index) {
	$scope.world.landmarkCategories.splice(index, 1);
}

$scope.removeAllMaps = function() {
	map.removePlaceImage();
	map.removeOverlays();
};

$scope.getHighestFloor = function() {
	// gets the highest floor_num in array of map objects
	var array = $scope.world.style.maps.localMapArray;
	array = $.map(array, function(obj) {
		return obj.floor_num;
	});
	return Math.max.apply(this, array);
};

$scope.increaseFloor = function(map) {
	if (!$scope.mapIsUploaded(map)) {
		map.floor_num++;
	}
};

$scope.decreaseFloor = function(map) {
	if (!$scope.mapIsUploaded(map)) {
		map.floor_num--;
	}
};

$scope.mapIsUploaded = function(map) {
	return map.temp_upload_path || map.localMapName;
};

$scope.mapIsBuilt = function(map) {
	if (map) {
		return map.localMapName;
	}
	else {
		// check if the last map in the array is built
		if ($scope.world) {
			if ($scope.world.style.maps.localMapArray &&
				$scope.world.style.maps.localMapArray.length>0) {
				var len = $scope.world.style.maps.localMapArray.length;
				return $scope.world.style.maps.localMapArray[len-1].hasOwnProperty('localMapName');
			}
		}
		// no localMapArrat
		return true;
	}
}

$scope.selectMap = function(clickedMap) {
	// show panel body
	$scope.selectedMap = clickedMap;
	// clickedMap.isSelected = true;

	// remove any maps showing (built or unbuilt)
	$scope.removeAllMaps();

	// add new maps
	if (clickedMap.temp_upload_path == '') { // map has been built
		// the timeout is necessary (for some reason)
		var showMapDelay = $timeout(function() {
			map.addOverlay(clickedMap.localMapID,
						clickedMap.localMapName,
						clickedMap.localMapOptions); // populate this correctly
		}, 100);
	} else { // map has not been built
		var showMapDelay = $timeout(function() {
			map.placeImage(clickedMap.map_marker_viewID, clickedMap.temp_upload_path);
		}, 100);
	}
};

$scope.selectLastMap = function() {
	var len = $scope.world.style.maps.localMapArray.length;
	$scope.selectMap($scope.world.style.maps.localMapArray[len-1]);
};

$scope.addMapPlaceholder = function() {
	// creates new temporary li in edit/maps.html
	if ($scope.world.style.maps.localMapArray && $scope.world.style.maps.localMapArray.length>0) {
		$scope.world.style.maps.localMapArray.push({
			floor_num: $scope.getHighestFloor()+1,
			floor_name: 'Floor ' + ($scope.getHighestFloor()+1)
		});
	} else { // first map to upload
		$scope.world.style.maps.localMapArray = [{
			floor_num: 1,
			floor_name: 'Lobby'
		}];
	}
	//scroll to bottom
	scrollToBottom(100);

	// select li
	$scope.selectLastMap();
};

$scope.removeMap = function(map) {
	if (window.confirm('Are you sure you want to delete this local map?')) {
		if ($scope.mapIsUploaded(map)) {
			deleteMap(map);
		}
		else {
			// remove last object in map array
			$scope.world.style.maps.localMapArray.pop();
		}
		
	}
};

function deleteMap(map) {
	var data = {
		worldID: $scope.world._id,
		map_marker_viewID: map.map_marker_viewID
	};
	$http.post('/api/delete_map', data).
		success(function(data) {
			console.log('success: ', data);
			$scope.world = data;
		}).
		error(function(data) {
			console.log('error', data);
		});
}

function scrollToBottom(timeout) {
	$location.hash('scrollToBottom');
	if (timeout) {
		var scroll = $timeout(function() {
			// give ngRepeat time to add new DOM element
			$anchorScroll();
			console.log('scrolled with timeout');
		}, timeout);
	}
	else {
		$anchorScroll;
		console.log('scrolled without timeout');
	}
}

$scope.loadWorld = function(data) { 
	// initialize world
	  	$scope.world = data.world;
		console.log('AAAAAAAAAAAAA', $scope.world);

	  	// don't load unbuilt maps (can only be last map in array)
	  	if ($scope.world.style.maps.localMapArray && 
	  		$scope.world.style.maps.localMapArray.length>0) {
			var len = $scope.world.style.maps.localMapArray.length;
			if ($scope.world.style.maps.localMapArray[len-1].temp_upload_path != '') {
				// delete unbuilt map
				deleteMap($scope.world.style.maps.localMapArray[len-1]);
			}
	  	}

		$scope.style = data.style;
		style.navBG_color = $scope.style.navBG_color;
		if ($scope.world.hasLoc) {
			console.log('hasLoc');
			showPosition({
				coords: {
					latitude: $scope.world.loc.coordinates[1],
					longitude: $scope.world.loc.coordinates[0]
				}
			});
		} else {
			console.log('findLoc');
			findLoc();
		}
		
		if ($scope.world.hasOwnProperty('style')==false) {$scope.world.style = {};}
		if ($scope.world.style.hasOwnProperty('maps')==false) {$scope.world.style.maps = {};}
		if ($scope.world.hasOwnProperty('landmarkCategories')==false) {$scope.world.landmarkCategories = [];}
		
		if ($scope.world.style.maps.cloudMapName) {
			map.setBaseLayerFromID($scope.world.style.maps.cloudMapID);
			$scope.mapThemeSelect = $scope.world.style.maps.cloudMapName;
		} else {
			$scope.selectMapTheme('arabesque');
		}
		
		/*if ($scope.world.style.maps.type == "both" || $scope.world.style.maps.type == "local") {
			map.addOverlay($scope.world.style.maps.localMapID, $scope.world.style.maps.localMapName, $scope.world.style.maps.localMapOptions);
			map.refresh();
		}*/
		

		var theseMaps = [$scope.world.style.maps];

		if (theseMaps[0].localMapArray && theseMaps[0].localMapArray.length > 0) {
			theseMaps = map.findMapFromArray(theseMaps[0].localMapArray);
		}

		theseMaps.forEach(function(thisMap) {
			if (thisMap.localMapID !== undefined && thisMap.localMapID.length > 0) {
				map.addOverlay(thisMap.localMapID, 
								thisMap.localMapName, 
								thisMap.localMapOptions);
			}
		})

		
		if (!$scope.style.bodyBG_color) {
			$scope.style.bodyBG_color = "#FFFFFF";
			$scope.style.cardBG_color = "#FFFFFF";
		}		
}

$scope.saveWorld = function() {
	$scope.whenSaving = true;
	console.log('saveWorld(edit)');
	$scope.world.newStatus = false; //not new
	//$scope.world.worldID = $scope.worldID;
	$scope.world.hasLoc = true;
	console.log($scope.world);
	tempMarker = map.getMarker(markerID);
	$scope.world.loc.coordinates[0] = tempMarker.lng;
	$scope.world.loc.coordinates[1] = tempMarker.lat;
	
	if (typeof $scope.world.style.maps == undefined) {
		$scope.world.style.maps = {};
	}
	console.log($scope.mapThemeSelect);
	//$scope.world.style.maps.cloudMapName = $scope.mapThemeSelect.cloudMapName;
	//$scope.world.style.maps.cloudMapID = $scope.mapThemeSelect.cloudMapID;
	
	
	console.log($scope.world);
    db.worlds.create($scope.world, function(response) {
    	console.log('--db.worlds.create response--');
    	console.log(response);
    	$scope.world.id = response[0].id; //updating world id with server new ID
    	$scope.whenSaving = false;
    	// alerts.addAlert('success', 'Save successful! Go to <a class="alert-link" target="_blank" href="#/w/'+$scope.world.id+'">'+$scope.world.name+'</a>', true);
    	$timeout.cancel(saveTimer);
    });
	
    console.log('scope world');
    console.log($scope.world);

    //adding world data to pass to style save function (for widget processing not saving to style)
    

    if ($scope.world.resources){
    	if ($scope.world.resources.hashtag){
    		$scope.style.hashtag = $scope.world.resources.hashtag;
    	}
    }
    if ($scope.world._id){
    	$scope.style.world_id = $scope.world._id;
    }

    console.log($scope.style);
    //end extra data

    db.styles.create($scope.style, function(response){
        console.log(response);
    });
    
}

$scope.search = function() {
	console.log('--search()--');
	var geocoder = new google.maps.Geocoder();
	if (geocoder) {
			geocoder.geocode({'address': $scope.searchText},
				function (results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						showPosition({
							coords: {
								latitude: results[0].geometry.location.lat(),
								longitude: results[0].geometry.location.lng()
							}
						});
						
					} else { console.log('No results found.')}
				});
	}
}

$scope.setStartTime = function() {
	var timeStart = new Date();
	$scope.world.time.start = timeStart.toISO8601String();
}

$scope.setEndTime = function() {
	var timeStart = new Date();
	console.log(timeStart);
	
	if (typeof $scope.world.time.start === 'string') {
		timeStart.setISO8601($scope.world.time.start);
	} //correct, its a string
	
	if ($scope.world.time.start instanceof Date) {
		//incorrect but deal with it anyway
		timeStart = $scope.world.time.start;
	}
	//timeStart is currently a date object
	console.log('timeStart', timeStart.toString());	 
	timeStart.setUTCHours(timeStart.getUTCHours()+3);
	
	//timeStart is now the default end time.
	var timeEnd = timeStart;
	console.log('--timeEnd', timeEnd.toString());
	$scope.world.time.end = timeEnd.toISO8601String();
	
}

$scope.removePlaceImage = function () {
	$scope.mapImage = null;
	map.removePlaceImage();
}

$scope.buildLocalMap = function () {
	console.log('--buildLocalMap--');
	$scope.building = true;
	//get image geo coordinates, add to var to send
	var bounds = map.getPlaceImageBounds(),
		southEast = bounds.getSouthEast(),
		northWest = bounds.getNorthWest(),
		southWest = bounds.getSouthWest(),
		northEast = bounds.getNorthEast(),
		coordBox = {
			worldID: $scope.world._id,
			localMapID: $scope.world._id + '_' + markerID,
			nw_loc_lng: northWest.lng,
		    nw_loc_lat: northWest.lat,
		    sw_loc_lng: southWest.lng,
			sw_loc_lat: southWest.lat,
			ne_loc_lng: northEast.lng,
			ne_loc_lat: northEast.lat,
			se_loc_lng: southEast.lng,
			se_loc_lat: southEast.lat 
		};
	console.log('bounds', bounds);
	console.log('coordBox', coordBox);
	var coords_text = JSON.stringify(coordBox);
		var data = {
		    mapIMG: $scope.mapImage,
		    coords: coords_text,
		    map_marker_viewID: markerID
		}
	//build map
	alerts.addAlert('warning', 'Building local map, this may take some time!', true);
	$http.post('/api/build_map', data).success(function(response){
		//response = JSON.parse(response);
		alerts.addAlert('success', 'Map built!', true);
		console.log(response);
		if (!$scope.world.hasOwnProperty('style')){$scope.world.style={}}
		if (!$scope.world.style.hasOwnProperty('maps')){$scope.world.style.maps={}} 
		//remove this when world objects arent fd up
		if (response[0]) {
			
			 //the server sends back whatever it wants. sometimes an array, sometimes not. :(99
			$scope.world = response[0];
			// $scope.world.style.maps.localMapID = response[0].style.maps.localMapID;
			// $scope.world.style.maps.localMapName = response[0].style.maps.localMapName;
			// $scope.world.style.maps.localMapOptions = response[0].style.maps.localMapOptions;
		} else {
			$scope.world = response;
			// $scope.world.style.maps.localMapID = response.style.maps.localMapID;
			// $scope.world.style.maps.localMapName = response.style.maps.localMapName;
			// $scope.world.style.maps.localMapOptions = response.style.maps.localMapOptions;
		}
		$scope.building = false;
		// reload to reset markerID, etc.
		$route.reload();
		scrollToBottom(1000);
		// $scope.saveWorld();
		}).error(function(response) {
			$scope.building = false;
		});
}

function findLoc() {
	if (navigator.geolocation && !$scope.world.hasLoc) {
   // Get the user's current position
   		navigator.geolocation.getCurrentPosition(showPosition, locError, {timeout:15000});
   }
}

function showPosition(position) {
	console.log('--showPosition--');
	userLat = position.coords.latitude;
	userLng = position.coords.longitude;
	
	console.log(userLng);
	map.setCenter([userLng, userLat], 18, 'editor');
 
	markerID = tempID();
 
	map.removeAllMarkers();
	map.addMarker(markerID, {
		lat: userLat,
		lng: userLng,
		message: "<p style='color:black;'>Drag to Bubble Location</p>",
		focus: true,
		draggable: true,
		icon: {
			iconUrl: 'img/marker/bubble-marker-50.png',
			shadowUrl: '',
			iconSize: [35, 67],
			iconAnchor: [17.5, 55],
			popupAnchor:  [0, -40]
		}
	});
	
	var state;
	console.log('$scope.view', $scope.view);
	switch ($scope.view) {
		case 'details':
		state = 'mask';
		break;
		case 'maps':
		state = 'mask';
		break;
		case 'styles':
		state = 'cover';
		break;
	}
	
	if (map.circleMaskLayer) {
		map.setCircleMaskMarker(markerID)		
	} else {
		map.addCircleMaskToMarker(markerID, 100, state);     
	}
}

function locError(){
        console.log('no loc');
}





	// //---- Adding Local Maps -----//

	// $scope.addLandmarkCategory = function() {

	// 	if ($scope.temp) {

	// 		$scope.world.landmarkCategories.unshift({name: $scope.temp.LandmarkCategory, avatar: $scope.temp.LandmarkCatAvatar, present: $scope.temp.landmarkPresent});

	// 		// console.log('----- TEST')
	// 		// console.log($scope.world.landmarkCategories);

	// 		console.log($scope.world);
	// 		delete $scope.temp.LandmarkCatAvatar;
	// 		delete $scope.temp.LandmarkCategory;
	// 		$scope.temp.landmarkPresent = false;
	// 		$scope.uploadFinishedLandmark = false;
	// 		console.log($scope.temp.LandmarkCatAvatar);
	// 	}
	// }

	// $scope.removeLandmarkCategory = function(index) {
	// 	$scope.world.landmarkCategories.splice(index, 1);
	// }



	// $scope.newMap = function(){

	// 	//check if there are floor numbers registered, default to 0
	// 	//populate dropdown with registered floors

	// 	//if loc_info already exists, add 1
	// 	if ($scope.landmark.loc_info){		
	// 		if ($scope.landmark.loc_info.floor_num == null){
	// 			$scope.landmark.loc_info.floor_num = 1;
	// 		}
	// 	}

	// 	addLocInfo();
	// }

	// //if loc info, then load floor numbers / room names
	// if ($scope.$parent.landmark.loc_info){
	// 	addLocInfo();
	// }

	// function addLocInfo() {

	// 	//read landmark floor array, cp to $scope

	// 	$scope.$parent.floors = [{"val":-1,"label":"-1 Floor"},{"val":1,"label":"1st Floor"},{"val":2,"label":"2nd Floor"}];  

	// 	//IF no loc_info, then floor_num = 0
	// 	if (!$scope.$parent.landmark.loc_info){
	// 		$scope.$parent.landmark.loc_info = {
	// 			floor_num: 1
	// 		};  		
	// 	}
	// }
	// //onclick hide location details
	// $scope.clearMap = function(){

	// 	//console.log('asdfasdfasdf');
	// 	//delete $scope.$parent.landmark.loc_info;

	// 	$scope.landmark.loc_info.floor_num = null;
	// 	$scope.landmark.loc_info.room_name = null;
	// }
	// //--------------------------//

////////////////////////////////////////////////////////////
/////////////////////////LISTENERS//////////////////////////
////////////////////////////////////////////////////////////
$scope.$on('$locationChangeSuccess', function (event, args) {
	//stops route from changing if just changing subview
	console.log(event, args);
	console.log($route.current.$$route);
	
    if (lastRoute.$$route.originalPath === $route.current.$$route.originalPath) {
        $scope.view = $route.current.params.view;
        $route.current = lastRoute;
        console.log($scope.view);
    }
    $scope.initView();
});

$scope.$on('$destroy', function (event) { //controller cleanup
	console.log('$destroy event', event);
	if (event.targetScope===$scope) {
	map.removeCircleMask();
	map.removePlaceImage();
	if (zoomControl.style) {
		zoomControl.style.top = "";
		zoomControl.style.left = "";
	}
	}
	
	angular.extend($rootScope, {navTitle: "Bubbl.li"});
});

$scope.$watch('style.navBG_color', function(current, old) {
	style.navBG_color = current;
});

/*
$scope.$watch('world.name', function(current, old) {
	console.log('world name watch', current);
	angular.extend($rootScope, {navTitle: "Edit &raquo; "+current+" <a href='#/w/"+$routeParams.worldURL+"' class='preview-link' target='_blank'>Preview</a>"});
});
*/

$scope.$watch('temp.scale', function(current, old) {
	if (current!=old) {
		map.setPlaceImageScale(current);
		console.log(map.getPlaceImageBounds());
	}
});

var saveTimer = null;
$scope.$watchCollection('world', function (newCol, oldCol) {
	if (oldCol!=undefined) {
		if (saveTimer) {
			$timeout.cancel(saveTimer);
		}
		saveTimer = $timeout($scope.saveWorld, 1500);
	}
});


////////////////////////////////////////////////////////////
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////
World.get({id: $routeParams.worldURL}, function(data) {
	if (data.err) {
		 console.log('World not found!');
		 console.log(data.err);
	} else {
		$scope.loadWorld(data);
	}
	map.refresh();
})

//end editcontroller
}]);
