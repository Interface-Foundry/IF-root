app.controller('WalkthroughController', ['$scope', '$location', '$route', '$routeParams', '$timeout', 'ifGlobals', 'leafletData', '$upload', 'mapManager', 'World', 'db', function($scope, $location, $route, $routeParams, $timeout, ifGlobals, leafletData, $upload, mapManager, World, db) {
////////////////////////////////////////////////////////////
///////////////////INITIALIZING VARIABLES///////////////////
////////////////////////////////////////////////////////////
$scope.global = ifGlobals;
$scope.position = 0;
$scope.world = {};
$scope.world.time = {};
$scope.world.time.start = new Date();
$scope.world.time.end = new Date();
$scope.world.style = {};
$scope.world.style.maps = {};
$scope.temp = {};
var map = mapManager;
var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];

olark('api.box.show'); //shows olark tab on this page

zoomControl.style.display = 'none'; 

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
	$scope.save();
}

$scope.prev = function() {
	if ($scope.position > 0) {
		$scope.position--;
		if ($scope.walk[$scope.position].hasOwnProperty('jump')) {
			if ($scope.walk[$scope.position].jump()) {
				$scope.prev();
			}
		}
	}
	$scope.save();
}

$scope.slowNext = function() {
	$timeout(function() {
		$scope.next();
	}, 200);
	$scope.save();
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
			$scope.setThemeFromMap(name);
			//}
		}
}

$scope.setThemeFromMap = function(name) {
switch (name) { 
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
console.log($scope.style)

    db.styles.create($scope.style, function(response){
        console.log(response);
    });
}	
	
$scope.saveAndExit = function() {
	$scope.save();
	if ($scope.world.id) {
		$location.path("/edit/w/"+$scope.world.id);
	} else {
		//console
		console.log('no world id'); 
	}
}

$scope.save = function() {
	$scope.world.newStatus = false;
	console.log($scope.world);
	db.worlds.create($scope.world, function(response) {
    	console.log('--db.worlds.create response--');
    	console.log(response);
    	$scope.world.id = response[0].id; //updating world id with server new ID
    });
    
    if ($scope.style) {
    	console.log('saving style');
	    db.styles.create($scope.style, function(response){
      		console.log(response);
		});
    }
}

var firstWalk = [
	{title: 'Need a hand?',
	caption: 'If you haven’t built a bubble before, we can walk you through it.',
	height: 0,
	view: '0.html',
	valid: function() {return true},
	skip: false},
	{title: 'Kind',
	caption: 'What kind of bubble is it?',
	view: 'kind.html',
	height: 220,
	valid: function() {return typeof $scope.world.category == "string"},
	skip: false},
	{title: 'Location', 
	caption: 'Find its location',
	view: 'location.html',
	height: 290,
	valid: function() {return $scope.world.hasLoc},
	skip: false},
	{title: 'Name',
	caption: 'What\'s your bubble named?',
	view: 'name.html',
	height: 62,
	valid: function() {return $scope.form.worldName.$valid},
	skip: false},
	{title: 'Time',
	caption: 'Give it a start and end time',
	view: 'time.html',
	height: 88,
	valid: function() {return $scope.form.time.$valid},
	jump: function() {return !$scope.global.kinds[$scope.world.category].hasTime;},
	skip: true},
	{title: 'Picture',
	caption: 'Upload a picture for your bubble',
	view: 'picture.html',
	height: 194,
	valid: function() {return true},
	skip: true},
	{title: 'Maps',
	caption: 'Choose a map',
	view: 'maptheme.html',
	height: 426,
	valid: function() {return true},
	skip: true},
	{title: 'Hashtag',
	caption: 'Connect your bubble\'s social media',
	view: 'hashtag.html',
	height: 132,
	valid: function() {return true},
	skip: true,
	},
	{title: 'Done!',
	caption: 'Now spread the word :)',
	view: 'done.html',
	height: 200,
	skip: false}
];

var meetupWalk = [
	//0 intro
	{title: 'Claim your Meetup',
	caption: "We'll use your Meetup group to create a bubble.",
	view:'0.html',
	height: 0,
	valid: function() {return true},
	skip: false
	},
	//1 
	{title: 'Confirm',
	caption: 'Make sure this information from Meetup.com is correct',
	view: 'meetup_confirm.html',
	height: 300,
	valid: function() {return true},
	skip: false
	},
	{title: 'Kind',
	caption: 'What kind of bubble is it?',
	view: 'kind.html',
	height: 220,
	valid: function() {return typeof $scope.world.category == "string"},
	skip: false},
	{title: 'Hashtag',
	caption: 'Connect your bubble\'s social media',
	view: 'hashtag.html',
	height: 132,
	valid: function() {return true},
	skip: true,
	},
	{title: 'Picture',
	caption: 'Upload a picture',
	view: 'picture.html',
	height: 194,
	valid: function() {return true},
	skip: true},
	{title: 'Maps',
	caption: 'Choose a map',
	view: 'maptheme.html',
	height: 426,
	valid: function() {return true},
	skip: true},
	{title: 'Done!',
	caption: 'Now spread the word :)',
	view: 'done_meetup.html',
	height: 200,
	skip: false}
];

$scope.walk = firstWalk;

function setUpProgress() {
	$scope.progress = [];

	var i = 0;
	if ($scope.walk) {
		while (i < $scope.walk.length) {
		$scope.progress[i] = {status: ''};
		i++;
	}
	}
	
$scope.progress[$scope.position].status = 'active';

}

////////////////////////////////////////////////////////////
////////////////////////LISTENERS///////////////////////////
////////////////////////////////////////////////////////////
/*$scope.$on('$destroy', function (event) {
	console.log('$destroy event', event);
	if (event.targetScope===$scope) {
		if (zoomControl) {
			zoomControl.style.display = 'block';
		}
	}
});*/

////////////////////////////////////////////////////////////
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////

console.log($routeParams._id);
World.get({id: $routeParams._id, m: true}, function(data) {
	if (data.err) {
		 console.log('World not found!');
		 console.log(data.err);
	} else {
		console.log(data);
		angular.extend($scope.world, data.world);
		angular.extend($scope.style, data.style);
		
		if ($scope.world.source_meetup && $scope.world.source_meetup.id) {
			$scope.walk = meetupWalk;
		}
		map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/interfacefoundry.jh58g2al/{z}/{x}/{y}.png');
		setUpProgress();
	}
});

}]);

app.controller('WalkLocationController', ['$scope', '$rootScope', '$timeout', 'leafletData', function($scope, $rootScope, $timeout, leafletData) {
	angular.extend($scope, {tiles: tilesDict['arabesque']});
	angular.extend($scope, {center: {lat: 42,
									lng: -83,
									zoom: 15}});
	angular.extend($scope, {markers: {}});
	
	$scope.$watch('temp.MapActive', function(current, old) {
		console.log('scopewatch');
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
								draggable: false
							}}});		
		$scope.center.lat = tempLat;
		$scope.center.lng = tempLng;
		$scope.world.loc = { 
			coordinates: [tempLng,tempLat]
		}
		
		$scope.world.hasLoc = true;
		$scope.$apply(function() {
			$scope.locLoading = false;
		});
		leafletData.getMap('locMap').then(function(map) {
			console.log('invalidating size');
			map.invalidateSize();
		});
		console.log('showPosition done', $scope.locLoading);
	}
	
	$scope.searchByAddress = function() {
		console.log('--searchByAddress()--');
		var geocoder = new google.maps.Geocoder();
		if (geocoder) {
			$scope.locLoading = true; 
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
			$scope.locLoading = true;
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

}]);