app.controller('WorldController', ['World', 'db', '$routeParams', '$scope', '$location', 'leafletData', '$rootScope', 'apertureService', 'mapManager', 'styleManager', '$sce', 'worldTree', '$q', '$http', function ( World, db, $routeParams, $scope, $location, leafletData, $rootScope, apertureService, mapManager, styleManager, $sce, worldTree, $q, $http) {

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

$scope.collectedPresents = [];

angular.extend($rootScope, {loading: false});
	
$scope.selectedIndex = 0;
	
var landmarksLoaded;

if (olark){
	olark('api.box.hide'); //hides olark tab on this page
}

	//currently only for upcoming...
function setLookup() {
	$scope.lookup = {}; 
	
	for (var i = 0, len = $scope.landmarks.length; i<len; i++) {
  	$scope.lookup[$scope.landmarks[i]._id] = i;
	}
}
  	
  	
function reorderById (idArray) {
	console.log('reorderById');
	var tempLandmarks = angular.copy($scope.landmarks);
	$scope.upcoming = [];
	
	for (var i = 0, len = idArray.length; i<len; i++) {
	  	$scope.upcoming[i] = $scope.landmarks.splice($scope.lookup[idArray[i]._id],1, 0)[0];
	}
	
	for (var i = 0, len = $scope.landmarks.length; i<len; i++) {
		if ($scope.landmarks[i] == 0 || $scope.landmarks[i].category && $scope.landmarks[i].category.hiddenPresent == true) {
			$scope.landmarks.splice(i, 1);
			i--;
		}
	}

}

  	
$scope.zoomOn = function() {
	  	zoomControl.style.display = "block";
}
  	
$scope.loadWorld = function(data) {
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

		 console.log($scope.world);
		 console.log($scope.style);
		 
		 if ($scope.world.name) {
			 angular.extend($rootScope, {globalTitle: $scope.world.name});
		 }
		 
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
		
		var zoomLevel = 19;
		
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
					iconAnchor: [17.5, 60],
					popupAnchor:[0,-30]
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
  	
  	function loadWidgets() {
		console.log($scope.world);
		if ($scope.style.widgets) {
		if ($scope.style.widgets.twitter) {
			$scope.twitter = true;
		}
		if ($scope.style.widgets.instagram) {
			$scope.instagram = true;
		}
		if ($scope.world.id == "StartFast_Demo_Day_2014") {
			console.log('wyzerr');
			$scope.wyzerr = true;
		}
		if ($scope.style.widgets.presents && $scope.world.landmarkCategories) {

			// $scope.presents = true;
			// $scope.showInitialPresent = true;
			// $scope.presentCollected = false;
			// $scope.presentAlreadyCollected = false;

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

			//angular while loop the query every 2 seconds
			db.messages.query({limit:1, worldID:$routeParams.worldURL}, function(data){ 
				console.log('db.messages', data);
				if (data.length>0) {
					$scope.msg = data[0];
				}
			});
		}
		
		if ($scope.style.widgets.category) {
			$scope.category = true;
		}
		
	  	if ($scope.style.widgets.upcoming) {
	  		$scope.upcoming = true;
	  		var userTime = new Date();
	  		db.landmarks.query({queryFilter:'now', parentID: $scope.world._id, userTime: userTime}, function(data){
				console.log('queryFilter:now');
				console.log(data);
				if (data[0]) $scope.now = $scope.landmarks.splice($scope.lookup[data[0]._id],1)[0];
				console.log($scope.now);
			}); 
			
			db.landmarks.query({queryFilter:'upcoming', parentID: $scope.world._id, userTime: userTime}, function(data){
				console.log('queryFilter:upcoming');
				console.log('upcoming data', data);
				//console.log(angular.fromJson(data[0]));
				reorderById(data);
			}); 
		}
		}
		
	   if ($scope.world.resources) {
		$scope.tweets = db.tweets.query({limit:1, tag:$scope.world.resources.hashtag});
	    $scope.instagrams = db.instagrams.query({limit:1, tag:$scope.world.resources.hashtag});
	   }
	     	 
	}

  	$scope.loadLandmarks = function(data) {
  		console.log('--loadLandmarks--');
  		//STATE: EXPLORE
	  	db.landmarks.query({queryFilter:'all', parentID: $scope.world._id}, function(data) { 
	  		console.log(data);
	  		$scope.landmarks = data;
	  		console.log($scope.landmarks);
	  		setLookup();
	  		loadWidgets(); //load widget data
	  		initLandmarks($scope.landmarks);
	  	});
  	}
  	
  	function initLandmarks(landmarks) {
	  	angular.forEach($scope.landmarks, function(landmark) {
			map.addMarker(landmark._id, {
				lat:landmark.loc.coordinates[1],
				lng:landmark.loc.coordinates[0],
				draggable:false,
				message:'<a href="#/w/'+$scope.world.id+'/'+landmark.id+'">'+landmark.name+'</a>',
	            icon: {
	              iconUrl: 'img/marker/bubble-marker-50.png',
	              shadowUrl: '',
	              iconSize: [35, 67],
	              iconAnchor: [13, 10]
	            },
				_id: landmark._id
			});
		});
  	}

	/*
World.get({id: $routeParams.worldURL}, function(data) {
		 if (data.err) {
		 	console.log('Data error! Returning to root!');
		 	console.log(data.err);
		 	$location.path('/#/');
		 } else {
			$scope.loadWorld(data); 
		}
	});
*/

	//===== VISITS =====//
	
	// saveVisit();

	// function saveVisit(){
	//     var newVisit = {
	//         worldID: 'somemongoid',
	//         userName: 'nickname'
	//     };

	//     db.visit.create(newVisit, function(res) {
	//     	console.log(res);
	//     });		
	// }

	// //query for visits within one hour
	// db.visit.query({ worldID:'somemongoid'}, function(data){

	// 	console.log('WITHIN HOUR');
	// 	console.log(data);
	// });

	// //query for visits from User
	// db.visit.query({ option:'userHistory'}, function(data){

	// 	console.log('USER');
	// 	console.log(data);
	// });

	//==================//


		
	worldTree.getWorld($routeParams.worldURL).then(function(data) {
		console.log('worldtree success');
		console.log(data);
		$scope.loadWorld(data);
	}, function(error) {
		console.log(error);
		//handle this better
	});
}]);
