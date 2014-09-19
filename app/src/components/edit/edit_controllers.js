function EditController($scope, db, World, $rootScope, $route, $routeParams, apertureService, mapManager, styleManager, alertManager, $upload, $http) {
console.log('--EditController--');

var ears = []

var aperture = apertureService;
var map = mapManager;
var style = styleManager;
var alerts = alertManager;
var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];
zoomControl.style.top = "50px";
zoomControl.style.left = "40%";
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

$scope.temp = {
	scale: 1
}


$http.get('/components/edit/edit.locale-en-us.json').success(function(data) { 
	$scope.locale = angular.fromJson(data);
	$scope.tooltips = $scope.locale.tooltips;
});

if ($routeParams.view) {
	$scope.view = $routeParams.view;
} else {
	$scope.view = 'details';
}

console.log($scope.view); 
$scope.worldURL = $routeParams.worldURL;

var lastRoute = $route.current;


$scope.initView = function() {
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
	var file = $files[0];
	$scope.upload = $upload.upload({
		url: '/api/upload/',
		file: file,
	}).progress(function(e) {
		console.log('%' + parseInt(100.0 * e.loaded/e.total));
	}).success(function(data, status, headers, config) {
		console.log(data);
		$scope.world.avatar = data;
		$scope.uploadFinished = true;
	});
}

$scope.onLocalMapSelect = function($files) {
	var file = $files[0];
	$scope.upload = $upload.upload({
		url: '/api/upload_maps',
		file: file
	}).progress(function(e) {
		console.log('%' + parseInt(100.0 * e.loaded/e.total));
	}).success(function(data, status, headers, config) {
		console.log(data);
		$scope.mapImage = data;
		map.placeImage('m', data);
	})
}

$scope.selectMapTheme = function(name) {
	console.log('--selectMapTheme--', name);
	var mapThemes = {
		arabesque: {cloudMapName:'arabesque', cloudMapID:'interfacefoundry.ig67e7eb'},
		fairy: {cloudMapName:'fairy', cloudMapID:'interfacefoundry.ig9jd86b'},
		sunset: {cloudMapName:'sunset', cloudMapID:'interfacefoundry.ig6f6j6e'},
		urban: {cloudMapName:'urban', cloudMapID:'interfacefoundry.ig6a7dkn'}
	};
	if (typeof name === 'string') {
		$scope.mapThemeSelect = name;
		map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/'+mapThemes[name].cloudMapID+'/{z}/{x}/{y}.png');
		
		$scope.world.style.maps.cloudMapName = mapThemes[name].cloudMapName;
		$scope.world.style.maps.cloudMapID = mapThemes[name].cloudMapID;
		
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
}
}

$scope.addLandmarkCategory = function() {
	if ($scope.temp) {
	console.log($scope.temp.LandmarkCategory);
	$scope.world.landmarkCategories.unshift({name: $scope.temp.LandmarkCategory});
	console.log($scope.world);
	}
}

$scope.removeLandmarkCategory = function(index) {
	$scope.world.landmarkCategories.splice(index, 1);
}

$scope.loadWorld = function(data) {
	  	$scope.world = data.world;
		$scope.style = data.style;
		style.navBG_color = $scope.style.navBG_color;
		
		console.log($scope.world);
		console.log($scope.style);
		
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
			map.setBaseLayer(tilesDict[$scope.world.style.maps.cloudMapName]['url']);
			$scope.mapThemeSelect = $scope.world.style.maps.cloudMapName;
		
		} else {
			$scope.selectMapTheme('arabesque');
		}
		
		/*if ($scope.world.style.maps.type == "both" || $scope.world.style.maps.type == "local") {
			map.addOverlay($scope.world.style.maps.localMapID, $scope.world.style.maps.localMapName, $scope.world.style.maps.localMapOptions);
			map.refresh();
		}*/
		
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
	tempMarker = map.getMarker('m');
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
    	alerts.addAlert('success', 'Save successful! Go to <a class="alert-link" target="_blank" href="#/w/'+$scope.world.id+'">'+$scope.world.name+'</a>', true);
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
	//get image geo coordinates, add to var to send
	var bounds = map.getPlaceImageBounds(),
		southEast = bounds.getSouthEast(),
		northWest = bounds.getNorthWest(),
		southWest = bounds.getSouthWest(),
		northEast = bounds.getNorthEast(),
		coordBox = {
			worldID: $scope.world._id,
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
		      coords: coords_text
		    }
	//build map
	alerts.addAlert('warning', 'Building local map, this may take some time!', true);
	$http.post('/api/build_map', data).success(function(response){
		//response = JSON.parse(response);
		alerts.addAlert('success', 'Map built!', true);
		console.log(response);
		if (!$scope.world.hasOwnProperty('style')){$scope.world.style={}}
		if (!$scope.world.style.hasOwnProperty('maps')){$scope.world.style.maps={}} //remove this when world objects arent fd up
		if (response[0]) { //the server sends back whatever it wants. sometimes an array, sometimes not. :(99
			$scope.world.style.maps.localMapID = response[0].style.maps.localMapID;
			$scope.world.style.maps.localMapName = response[0].style.maps.localMapName;
			$scope.world.style.maps.localMapOptions = response[0].style.maps.localMapOptions;
		} else {
			$scope.world.style.maps.localMapID = response.style.maps.localMapID;
			$scope.world.style.maps.localMapName = response.style.maps.localMapName;
			$scope.world.style.maps.localMapOptions = response.style.maps.localMapOptions;
		}
		$scope.saveWorld();
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
	
	map.setCenter([userLng, userLat], 17);
 
	map.removeAllMarkers();
	map.addMarker('m', {
		lat: userLat,
		lng: userLng,
		message: "<p style='color:black;'>Drag to World's Location</p>",
		focus: true,
		draggable: true,
		icon: local_icons.yellowIcon
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
	
	map.removeCircleMask();
	map.addCircleMaskToMarker('m', 150, state);

/*
map.addPath('worldBounds', {
		type: 'circle',
		radius: 150,
		latlngs: {lat:userLat,
					lng:userLng}
	});
*/
			
			//disable this for 2nd page of editor...
		//	$scope.$on('leafletDirectiveMap.drag', function(event){
            //        console.log('moveend');
                    /*$scope.paths.worldBounds.latlngs = {lat:$scope.markers.m.lat,
							lng:$scope.markers.m.lng};*/
          //  });
            
}

function locError(){
        console.log('no loc');
}

////////////////////////////////////////////////////////////
/////////////////////////LISTENERS//////////////////////////
////////////////////////////////////////////////////////////
$scope.$on('$locationChangeSuccess', function (event) {
    if (lastRoute.$$route.originalPath === $route.current.$$route.originalPath) {
        $scope.view = $route.current.params.view;
        $route.current = lastRoute;
        console.log($scope.view);
    }
    $scope.initView();
});

$scope.$on('$destroy', function (event) {
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
	
	var len = ears.length;
	for (var i = 0; i < len; i++) {
		console.log(ears);
		ears[i]();
	}
	
});

ears.push(
$scope.$watch('style.navBG_color', function(current, old) {
	style.navBG_color = current;
}));

ears.push(
$scope.$watch('world.name', function(current, old) {
	console.log('world name watch', current);
	angular.extend($rootScope, {navTitle: "Edit &raquo; "+current+" <a href='#/w/"+$scope.world.id+"' class='preview-link' target='_blank'>Preview</a>"});
}));

ears.push($scope.$watch('temp.scale', function(current, old) {
	if (current!=old) {
		map.setPlaceImageScale(current);
		console.log(map.getPlaceImageBounds());
	}
}))

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
}