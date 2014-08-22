function EditController($scope, db, World, $rootScope, $route, $routeParams, apertureService, mapManager, styleManager, $upload) {
console.log('--EditController--');

var aperture = apertureService;
var map = mapManager;
var style = styleManager;
aperture.set('full');

$scope.mapThemes = [
		{cloudMapName:'arabesque', cloudMapID:'interfacefoundry.ig67e7eb'},
		{cloudMapName:'fairy', cloudMapID:'interfacefoundry.ig9jd86b'},
		{cloudMapName:'sunset', cloudMapID:'interfacefoundry.ig6f6j6e'},
		{cloudMapName:'urban', cloudMapID:'interfacefoundry.ig6a7dkn'}
];
console.log($scope.mapThemes);

$scope.mapThemeSelect = $scope.mapThemes[0];

if ($routeParams.view) {
	$scope.view = $routeParams.view;
} else {
	$scope.view = 'details';
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
	});
}

console.log($scope.view); 
$scope.worldURL = $routeParams.worldURL;

var lastRoute = $route.current;
$scope.$on('$locationChangeSuccess', function (event) {
    if (lastRoute.$$route.originalPath === $route.current.$$route.originalPath) {
        $scope.view = $route.current.params.view;
        $route.current = lastRoute;
        console.log($scope.view);
    }
});

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
		
		//map.setBaseLayer(tilesDict[$scope.world.style.maps.cloudMapName]['url']);
		
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
	$scope.world.style.maps.cloudMapName = $scope.mapThemeSelect.cloudMapName;
	$scope.world.style.maps.cloudMapID = $scope.mapThemeSelect.cloudMapID;
	
	
	console.log($scope.world);
    db.worlds.create($scope.world, function(response){
    	console.log(response);
    });  
    
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

	map.setBaseLayer(tilesDict.mapbox.url);
 
	map.addMarker('m', {
		lat: userLat,
		lng: userLng,
		message: "<p style='color:black;'>Drag to Location on Map</p>",
		focus: true,
		draggable: true,
		icon: local_icons.yellowIcon
	});
			
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