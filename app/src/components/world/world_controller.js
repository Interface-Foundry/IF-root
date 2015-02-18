app.controller('WorldController', ['World', 'db', '$routeParams', '$scope', '$location', 'leafletData', '$rootScope', 'apertureService', 'mapManager', 'styleManager', '$sce', 'worldTree', '$q', '$http', 'userManager', 'stickerManager', 'geoService', 'bubbleTypeService', function (World, db, $routeParams, $scope, $location, leafletData, $rootScope, apertureService, mapManager, styleManager, $sce, worldTree, $q, $http, userManager, stickerManager, geoService, bubbleTypeService) {

var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];
zoomControl.style.top = "60px";
zoomControl.style.left = "1%";
zoomControl.style.display = 'none';
var map = mapManager;
	map.resetMap();
var style = styleManager;
$scope.worldURL = $routeParams.worldURL;  
$scope.aperture = apertureService;	
$scope.aperture.set('third');

$scope.world = {};
$scope.landmarks = [];
$scope.lookup = {};

$scope.collectedPresents = [];
	
$scope.selectedIndex = 0;
	
var landmarksLoaded;
  	
$scope.zoomOn = function() {
	  	zoomControl.style.display = "block";
}
 
$scope.loadWorld = function(data) { //this doesn't need to be on the scope
	  	 $scope.world = data.world;
		 $scope.style = data.style;
		 style.navBG_color = $scope.style.navBG_color;
		 
		 //show edit buttons if user is world owner
		 if ($rootScope.userID && $scope.world.permissions){
			 if ($rootScope.userID == $scope.world.permissions.ownerID){
			 	$scope.showEdit = true;
			 }
			 else {
			 	$scope.showEdit = false;
			 }
		 } 

		//console.log($scope.world);
		//console.log($scope.style);
		 
		 if ($scope.world.name) {
			 angular.extend($rootScope, {globalTitle: $scope.world.name});
		 } //TODO: cleanup on $destroy
		 
		//switching between descrip and summary for descrip card
		if ($scope.world.description || $scope.world.summary) {
			$scope.description = true;
			if ($scope.world.description){
				$scope.descriptionType = "description";
			}
			else {
				$scope.descriptionType = "summary";
			}
		}
		
		var zoomLevel = 18;
		
		//map setup
		if ($scope.world.hasOwnProperty('loc') && $scope.world.loc.hasOwnProperty('coordinates')) {
			map.setCenter([$scope.world.loc.coordinates[0], $scope.world.loc.coordinates[1]], zoomLevel, $scope.aperture.state);
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
		
		$scope.loadLandmarks();
  	}
  	
function loadWidgets() { //needs to be generalized
	console.log($scope.world);
	if ($scope.style.widgets) {
		if ($scope.style.widgets.twitter == true) {
			$scope.twitter = true;
		}
		if ($scope.style.widgets.instagram == true) {
	  		$scope.instagrams = db.instagrams.query({limit:1, tag:$scope.world.resources.hashtag});
	  		$scope.instagram = true;
		}

		if ($scope.style.widgets.streetview == true) {

			var mapAPI = '&key=AIzaSyDbEMuXZS67cFLAaTtmrKjFNlrdNm1H-KE';
			//var mapAPI = '';

			$scope.streetview = true;

			if($scope.world.source_meetup){
				if($scope.world.source_meetup.venue){
					if($scope.world.source_meetup.venue.address_1){

						var venueArr = [];

						typeof $scope.world.source_meetup.venue.address_1 && venueArr.push($scope.world.source_meetup.venue.address_1);
						typeof $scope.world.source_meetup.venue.address_2 && venueArr.push($scope.world.source_meetup.venue.address_2);
						typeof $scope.world.source_meetup.venue.city && venueArr.push($scope.world.source_meetup.venue.city);
						typeof $scope.world.source_meetup.venue.state && venueArr.push($scope.world.source_meetup.venue.state);
						typeof $scope.world.source_meetup.venue.zip && venueArr.push($scope.world.source_meetup.venue.zip);
						typeof $scope.world.source_meetup.venue.country && venueArr.push($scope.world.source_meetup.venue.country);

						venueArr = venueArr.join("+").replace(/ /g,"+");
						$scope.streetviewLoc = venueArr + mapAPI;
					}
					else{
						coordsURL();
					}
				}
				else{
					coordsURL();
				}
			}
			else if($scope.world.source_yelp){
				if($scope.world.source_yelp.locationInfo){
					if($scope.world.source_yelp.locationInfo){
						if($scope.world.source_yelp.locationInfo.address){

							var venueArr = [];

							typeof $scope.world.source_yelp.locationInfo.address && venueArr.push($scope.world.source_yelp.locationInfo.address);
							typeof $scope.world.source_yelp.locationInfo.city && venueArr.push($scope.world.source_yelp.locationInfo.city);
							typeof $scope.world.source_yelp.locationInfo.state_code && venueArr.push($scope.world.source_yelp.locationInfo.state_code);
							typeof $scope.world.source_yelp.locationInfo.postal_code && venueArr.push($scope.world.source_yelp.locationInfo.postal_code);
							typeof $scope.world.source_yelp.locationInfo.country_code && venueArr.push($scope.world.source_yelp.locationInfo.country_code);

							venueArr = venueArr.join("+").replace(/ /g,"+");
							$scope.streetviewLoc = venueArr + mapAPI;

						}
						else {
							coordsURL();
						}
					}
					else{
						coordsURL();
					}
				}
				else{
					coordsURL();
				}
			}
			else {
				coordsURL();
			}

			function coordsURL(){
				if ($scope.world.loc){
					if ($scope.world.loc.coordinates){
						if ($scope.world.loc.coordinates.length){
							$scope.streetviewLoc = $scope.world.loc.coordinates[1]+','+$scope.world.loc.coordinates[0] + mapAPI;

						}
						
					}
				}
			}

		}
		if ($scope.style.widgets.presents && $scope.world.landmarkCategories) {
			$scope.temp = {
				showInitialPresent: true,
				presentCollected: false,
				presentAlreadyCollected: false,
				presents: true
			}

			$http.get('/api/user/loggedin', {server: true}).success(function(user){
				if (user !== '0'){
					userManager.getUser().then(
						function(response) {

						$scope.user = response;

						//showing collected presents in this world
						if ($scope.user.presents.collected){
							for(var i = 0; i < $scope.user.presents.collected.length; i++) {
							    if ($scope.user.presents.collected[i].worldID == $scope.world._id){
									$scope.collectedPresents.push($scope.user.presents.collected[i].categoryname);
							    }
							}
							checkFinalState();
						}

						//to see if user reached world collect goal for final present
						function checkFinalState(){

							var numPresents = $scope.world.landmarkCategories.filter(function(x){return x.present == true}).length;
							var numCollected = $scope.user.presents.collected.filter(function(x){return x.worldID == $scope.world._id}).length;

							//are # of present user collected in the world == to number of presents available in the world?
							if (numPresents == numCollected){
								console.log('final state!');
								$scope.temp.finalPresent = true;
								$scope.temp.showInitialPresent = false;
								$scope.temp.presentCollected = false;
								$scope.temp.presentAlreadyCollected = false;
							}
							else{
								$scope.presentsLeft = numPresents - numCollected;
								console.log('presents left '+ $scope.presentsLeft);
							}
						}	
					});

				}
				else {
					$scope.temp.signupCollect = true;
				}
			});


		}
		if ($scope.style.widgets.messages==true||$scope.style.widgets.chat==true) {
			$scope.messages = true;

			db.messages.query({limit:1, roomID:$scope.world._id}, function(data){ 
				console.log('db.messages', data);
				if (data.length>0) {
					$scope.msg = data[0];
				}
			});
		}
		
		if ($scope.style.widgets.category) {
			$scope.category = true;
		}
		
		}
		
	   if ($scope.world.resources) {
		$scope.tweets = db.tweets.query({limit:1, tag:$scope.world.resources.hashtag});
	   }

	   if ($scope.style.widgets.nearby == true) {
	      $scope.nearby = true;
	      $scope.loadState = 'loading';

	      worldTree.getNearby().then(function(data){

	      	if(!data){
	      		$scope.loadState = 'failure';
	      	}

	      	if(data['150m'].length > 0 || data['2.5km'].length > 0){

	      		//probably a better way to do this =_=
	      		if (data['150m'].length > 0 && data['2.5km'].length > 0){
					$scope.nearbyBubbles = data['150m'].concat(data['2.5km']);
	      		}
	      		else if (data['150m'].length > 0 && data['2.5km'].length < 0){
	      			$scope.nearbyBubbles = data['150m'];
	      		}
	      		else if (data['150m'].length < 0 && data['2.5km'].length > 0){
	      			$scope.nearbyBubbles = data['2.5km'];
	      		}
	      		else {
	      			$scope.loadState = 'failure';
	      		}

	      		//remove bubble you're inside
	      		for(var i = 0; i < $scope.nearbyBubbles.length; i++) {
				    if($scope.nearbyBubbles[i]._id == $scope.world._id) {
				        $scope.nearbyBubbles.splice(i, 1);
				    }
				}

				//only 3 bubbles
				if ($scope.nearbyBubbles.length > 3){
					$scope.nearbyBubbles.length = 3;
				}
		
	      	}

	      	$scope.loadState = 'success';

	      	
	      });

	      $scope.findRandom = function(){
	      	  $scope.loadState = 'loading';
		      geoService.getLocation().then(function(coords){
		      	  $http.get('/api/find/random', {params: {userCoordinate: [coords.lng,coords.lat], localTime:new Date()}, server:true}).success(function(data){		
						if(data.length > 0){
							if (data[0].id){
								$location.path("/w/"+data[0].id);
							}
						}
						else {
							$scope.loadState = 'success';
						}
		      	  });
		      });
	      }
	     




	   }

	}

$scope.loadLandmarks = function() {
	console.log('--loadLandmarks--');
	//STATE: EXPLORE
	worldTree.getLandmarks($scope.world._id).then(function(data) {
		console.log('landmarks', {landmarks: data});
  		
		initLandmarks({landmarks: data});
		loadWidgets(); //load widget data
	});
}
  	
function initLandmarks(data) {
	var now = moment(); 
	var groups = _.groupBy(data.landmarks, function(landmark) {
		if (landmark.time.start) {
			var startTime = moment(landmark.time.start); 
			var endTime = moment(landmark.time.end) || moment(startTime).add(1, 'hour');
		if (now.isAfter(startTime) && now.isBefore(endTime)) {
			return 'Now';
		} else if (now.isBefore(startTime)) {
			if (now.isSame(startTime, 'day')) {
				return 'Today';
			} else {
				return 'Upcoming';
			}
		} else if (now.isAfter(startTime)) {
			return 'Past';
		}
		} else {
			return 'Places';
		}
	})
	console.log(groups);
	$scope.places = groups['Places'] || [];
	$scope.upcoming = _.compact([].concat(groups['Upcoming'], groups['Today']));
	$scope.past = groups['Past'] || []; 
	$scope.now = groups['Now'] || [];
	$scope.landmarks = data.landmarks || [];
	$scope.today = groups['Today'] || [];
	console.log($scope.upcoming);
		
	if ($scope.now.length > 0) {
		var tempMarkers = [].concat($scope.places, $scope.now);
	} else if ($scope.today.length > 0) {
		var tempMarkers = [].concat($scope.places, $scope.today);
	} else {
		var tempMarkers = [].concat($scope.places);
	}
	//markers should contain now + places, if length of now is 0, 
	// upcoming today + places

	mapManager.addMarkers(tempMarkers.map(markerFromLandmark));
}

function markerFromLandmark(landmark) {

	var landmarkIcon = 'img/marker/bubble-marker-50.png',
			popupAnchorValues = [0, -40];

	if (bubbleTypeService.get() === 'Retail') {
		landmarkIcon = landmark.avatar === 'img/tidepools/default.jpg' ?
												'img/marker/bubble-marker-50.png' : landmark.avatar;
		popupAnchorValues = [0, -75];
	}

	return {
		lat:landmark.loc.coordinates[1],
		lng:landmark.loc.coordinates[0],
		draggable:false,
		message: '<a if-href="#w/'+$scope.world.id+'/'+landmark.id+'">'+landmark.name+'</a>',
		icon: {
			iconUrl: landmarkIcon,
			shadowUrl: '',
			iconSize: [35],
			iconAnchor: [17, 67],
			popupAnchor: popupAnchorValues
		},
		_id: landmark._id
	}
}


$scope.$on('landmarkCategoryChange', function(event, landmarkCategoryName) {
	var markers = $scope.landmarks.filter(testCategory).map(markerFromLandmark);
	console.log(markers);
	if (markers.length>0) {
		map.setCenterFromMarkers(markers);
		map.setMarkers(markers);
		$scope.aperture.set('full');
		$scope.selectedCategory = landmarkCategoryName;
	} else {
		//handle no landmarks in category
	}
	
	function testCategory (landmark, index, landmarks) {
		return landmark.category === landmarkCategoryName;
	}
})


worldTree.getWorld($routeParams.worldURL).then(function(data) {
	console.log('worldtree success');
	console.log(data);
	$scope.loadWorld(data);
}, function(error) {
	console.log(error);
	//handle this better
});

function adjustMarkerForRetail() {

}

}]);
