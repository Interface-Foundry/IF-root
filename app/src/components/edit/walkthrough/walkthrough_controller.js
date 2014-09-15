function WalkthroughController($scope, $route, $routeParams, $http, $timeout, ifGlobals, leafletData, $upload, mapManager, World) {

////////////////////////////////////////////////////////////
///////////////////INITIALIZING VARIABLES///////////////////
////////////////////////////////////////////////////////////
$scope.global = ifGlobals;
$scope.world = {};
$scope.world.time = {};
$scope.world.time.start = new Date();
$scope.world.time.end = new Date();
$scope.world.style = {};
$scope.world.style.maps = {};
$scope.temp = {};
var map = mapManager;

$scope.next = function() {
	if ($scope.position < $scope.walk.length-1) {
		$scope.position++; 
		//check if new position has 'jump'
		if ($scope.walk[$scope.position].hasOwnProperty('jump')) {
			if ($scope.walk[$scope.position].jump()) {
				$scope.next();
			}
		}
	}
}

$scope.prev = function() {
	if ($scope.position > 0) {
		$scope.position--;
	}
}

$scope.slowNext = function() {
	$timeout(function() {
		$scope.next();
	}, 200);
}

$scope.pictureSelect = function($files) {
	var file = $files[0];
	$scope.upload = $upload.upload({
		url: '/api/upload/',
		file: file,
	}).progress(function(e) {
		console.log('%' + parseInt(100.0 * e.loaded/e.total));
	}).success(function(data, status, headers, config) {
		console.log(data);
		$scope.world.avatar = data;
	});
}

$scope.selectMapTheme = function(name) {
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
			
			//if ($scope.style.hasOwnProperty('navBG_color')==false) {
			//	$scope.setThemeFromMap();
			//}
		}
	}

$scope.walk = [
	//0 - intro
	{title: 'Need a hand?',
	caption: 'If you haven’t built a world before, we can walk you through it.',
	height: 0,
	valid: function() {return true},
	skip: false},
	//1
	{title: 'Kind',
	caption: 'What kind is it?',
	view: 'kind.html',
	height: 220,
	valid: function() {return typeof $scope.world.category == "string"},
	skip: false},
	//3
	{title: 'Location', 
	caption: 'Find its location',
	view: 'location.html',
	height: 290,
	valid: function() {return $scope.world.hasLoc},
	skip: false},
	//4
	{title: 'Name',
	caption: 'What\'s it named?',
	view: 'name.html',
	height: 62,
	valid: function() {return $scope.form.worldName.$valid},
	skip: false},
	//5
	{title: 'Time',
	caption: 'Give it a start and end time',
	view: 'time.html',
	height: 348,
	valid: function() {return $scope.form.time.$valid},
	jump: function() {return !$scope.global.kinds[$scope.world.category].hasTime;},
	skip: true},
	//6
	{title: 'Picture',
	caption: 'Upload a picture',
	view: 'picture.html',
	height: 194,
	valid: function() {return typeof $scope.world.avatar == "string"},
	skip: true},
	//
	{title: 'Maps',
	caption: 'Choose a map',
	view: 'maptheme.html',
	height: 426,
	valid: function() {return typeof $scope.mapThemeSelect == "string"},
	skip: true},
	//
	{title: 'Done!',
	caption: 'Now you can add landmarks',
	view: 'done.html',
	skip: false}
];
		
$scope.progress = [];

var i = 0;
while (i < $scope.walk.length) {
	$scope.progress[i] = {status: ''};
	i++;
}

$scope.position = 0;
$scope.progress[$scope.position].status = 'active';


////////////////////////////////////////////////////////////
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////

World.get({_id: $routeParams._id}, function(data) {
	if (data.err) {
		 console.log('World not found!');
		 console.log(data.err);
	} else {
		console.log(data);	
	}
});



}

function WalkLocationController ($scope, $rootScope, $timeout, leafletData) {
	angular.extend($scope, {tiles: tilesDict['arabesque']});
	angular.extend($scope, {center: {lat: 42,
									lng: -83,
									zoom: 15}});
	angular.extend($scope, {markers: {}});
	
	$scope.$watch('temp.MapActive', function(current, old) {
		console.log(current, old);
		if (current==true) {
		leafletData.getMap('locMap').then(function(map) {
			console.log('invalidating size');
			map.invalidateSize();
		});
		}
	});
	
	$scope.showPosition = function(lat, lng) {
		var tempLat = lat.valueOf(),
			tempLng = lng.valueOf();
		angular.extend($scope, {markers: {
							m: {
								lat: tempLat,
								lng: tempLng,
								focus: true,
								message: 'Drag to the location!',
								draggable: true
							}}});		
		$scope.center.lat = tempLat;
		$scope.center.lng = tempLng;
		
		$scope.world.hasLoc = true;
	}
	
	$scope.searchByAddress = function() {
		console.log('--searchByAddress()--');
		var geocoder = new google.maps.Geocoder();
		if (geocoder) {
			geocoder.geocode({'address': $scope.temp.address},
				function (results, status) {
					if (status == google.maps.GeocoderStatus.OK) {

						console.log('invalidating size');
						//map.invalidateSize();
						
						console.log(results[0].geometry.location.lat());
						$scope.showPosition(results[0].geometry.location.lat(),
						 	results[0].geometry.location.lng());
						 
					} else { console.log('No results found.')}
					
				});
		}
		
	}
	
	$scope.searchByLocation = function() {
		if (navigator.geolocation) {
   			navigator.geolocation.getCurrentPosition(function(position) {
   				//position
				$scope.showPosition(position.coords.latitude, position.coords.longitude);	
   				
   				}, function() {
   				console.log('location error');
   			}, {timeout:5000});
   		} else {
	   		console.log('No geolocation!');
   		}
   		
	}

} 