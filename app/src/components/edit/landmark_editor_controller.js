app.controller('LandmarkEditorController', ['$scope', '$rootScope', '$location', '$route', '$routeParams', 'db', 'World', 'leafletData', 'apertureService', 'mapManager', 'Landmark', 'alertManager', '$upload', '$http', '$window', 'dialogs', 'worldTree', 'bubbleTypeService', function ($scope, $rootScope, $location, $route, $routeParams, db, World, leafletData, apertureService, mapManager, Landmark, alertManager, $upload, $http, $window, dialogs, worldTree, bubbleTypeService) {
	
//@IFDEF PHONEGAP
dialogs.showDialog('mobileDialog.html');
$window.history.back();
//@ENDIF

////////////////////////////////////////////////////////////
///////////////////INITIALIZING VARIABLES///////////////////
////////////////////////////////////////////////////////////
	var map = mapManager;
	
var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];
	zoomControl.style.top = "50px";
	zoomControl.style.left = "40%";

var worldLoaded = false;
var landmarksLoaded = false;
	
	$scope.landmarks = [];
	$scope.selectedIndex = 0;
	$scope.alerts = alertManager;

	
////////////////////////////////////////////////////////////
//////////////////////DEFINE FUNCTIONS//////////////////////
////////////////////////////////////////////////////////////
	
	$scope.addLandmark = function() {
		console.log('--addLandmark--');
		if (!worldLoaded || !landmarksLoaded) {console.log('loading not complete');}
		else {
		var tempLandmark = landmarkDefaults();
		db.landmarks.create(tempLandmark, function(response) {
			console.log('--db.landmarks.create--');
			console.log('Response ID:'+response[0]._id);
			tempLandmark._id = response[0]._id;
			
			//add to array 
			$scope.landmarks.unshift(tempLandmark);		
			
			//add marker
			map.addMarker(tempLandmark._id, {
				lat:tempLandmark.loc.coordinates[1],
				lng:tempLandmark.loc.coordinates[0],
				icon: {
					iconUrl: 'img/marker/bubble-marker-50.png',
					shadowUrl: '',
					iconSize: [35],
					iconAnchor: [25, 100],
					popupAnchor: [0, -60]
				},
				draggable:true,
				message:'Drag to location on map',
				focus:true
			});				
		});
		}
	}
	
	$scope.removeItem = function(i) {		
		var deleteItem = confirm('Are you sure you want to delete this item?'); 
		
	    if (deleteItem) {
			//notify parent to remove from array with $index
	    	console.log($scope.landmarks[i]._id);
	        map.removeMarker($scope.landmarks[i]._id);
	        Landmark.del({_id: $scope.landmarks[i]._id}, function(landmark) {
	            //$location.path('/');
	            console.log('Delete');
	            $scope.landmarks.splice(i, 1); //Removes from local array
	        });
	    }
	}	
	
	$scope.saveItem = function(i) {
		console.log('--saveItem--');
		$scope.landmarks[i].newStatus = false;
		var tempMarker = map.getMarker($scope.landmarks[i]._id);
		if (tempMarker == false) {
			console.log('Problem finding marker, save failed');
			return false;}
		$scope.landmarks[i].loc.coordinates = [tempMarker.lng, tempMarker.lat];

		// if($scope.landmarks[i].hiddenPresent == true){
		// 	$scope.landmarks[i].category.hiddenPresent = true;
		// }
		// else{
		// 	$scope.landmarks[i].category.hiddenPresent = false;
		// }
		
		/*
if ($scope.landmark.hasTime) {
	   
	   	    //if no end date added, use start date
	        if (!$scope.landmark[i].date.end) {
	            $scope.landmark[i].date.end = $scope.landmark[i].date.start;
	        }

	        $scope.landmark[i].datetext = {
	            start: $scope.landmark[i].date.start,
	            end: $scope.landmark[i].date.end
	        }
	        //---- Date String converter to avoid timezone issues...could be optimized probably -----//
	        $scope.landmark[i].date.start = new Date($scope.landmark[i].date.start).toISOString();
	        $scope.landmark[i].date.end = new Date($scope.landmark[i].date.end).toISOString();

	        $scope.landmark[i].date.start = dateConvert($scope.landmark[i].date.start);
	        $scope.landmark[i].date.end = dateConvert($scope.landmark[i].date.end);

	        $scope.landmark[i].date.start = $scope.landmark[i].date.start.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1'); //rearranging so value still same in input field
	        $scope.landmark[i].date.end = $scope.landmark[i].date.end.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1');

	        function dateConvert(input){
	            var s = input;
	            var n = s.indexOf('T');
	            return s.substring(0, n != -1 ? n : s.length);
	        }
	        //-----------//

	        if (!$scope.landmark[i].time.start){
	            $scope.landmark[i].time.start = "00:00";
	        }

	        if (!$scope.landmark[i].time.end){
	            $scope.landmark[i].time.end = "23:59";
	        }

	        $scope.landmark[i].timetext = {
	            start: $scope.landmark[i].time.start,
	            end: $scope.landmark[i].time.end
	        } 
	        //------- END TIME --------//
		}
*/	
		console.log('Saving...');
		console.log($scope.landmarks[i]);
		db.landmarks.create($scope.landmarks[i], function(response) {
			console.log('--db.landmarks.create--');
			console.log(response);
		});
		console.log('Save complete');
		$scope.alerts.addAlert('success','Landmark Saved', true);
	}
	
	$scope.selectItem = function(i) {
		console.log('--selectItem--');
		if ($scope.selectedIndex != i) {
			//$scope.saveItem($scope.selectedIndex);//save previous landmark
			console.log('Continue w select');
			$scope.selectedIndex = i; //change landmarks
			map.setCenter($scope.landmarks[i].loc.coordinates, 18);//center map on new markers
			console.log($scope.landmarks[i].name);
			map.setMarkerMessage($scope.landmarks[i]._id, $scope.landmarks[i].name);
			map.bringMarkerToFront($scope.landmarks[i]._id);
			map.setMarkerSelected($scope.landmarks[i]._id);
			map.setMarkerFocus($scope.landmarks[i]._id);
			console.log('Complete select');
		}
	}
	
	function addLandmarkMarker(landmark) {
		var landmarkIcon = 'img/marker/bubble-marker-50.png',
				popupAnchorValues = [0, -40];

		if (bubbleTypeService.get() === 'Retail') {
			landmarkIcon = landmark.avatar === 'img/tidepools/default.jpg' ?
													'img/marker/bubble-marker-50.png' : landmark.avatar;
			popupAnchorValues = [0, -75];
		}
	
		map.addMarker(landmark._id, {
				lat:landmark.loc.coordinates[1],
				lng:landmark.loc.coordinates[0],
				icon: {
					iconUrl: landmarkIcon,
					shadowUrl: '',
					iconSize: [35],
					iconAnchor: [17.5, 60],
					popupAnchor: popupAnchorValues
				},
				draggable:true,
				message:landmark.name || 'Drag to location on map',
				focus:true
			});
	}
	
	function landmarkDefaults() {
		console.log('--landmarkDefaults()--');
		var defaults = {
			name: 'Landmark '+($scope.landmarks.length+1),
			_id: 0,
			world: false,
			newStatus: true,
			parentID: 0,
			loc: {type:'Point', coordinates:[-74.0059,40.7127]}, 
			avatar: "img/tidepools/default.jpg",
			time: {}
		};
		if (worldLoaded) {
			defaults.parentID = $scope.world._id;
			defaults.loc.coordinates = $scope.world.loc.coordinates;
		}
		console.log('Defaults Updated');
		console.log(defaults);
		return defaults;
	}

////////////////////////////////////////////////////////////
/////////////////////////LISTENERS//////////////////////////
////////////////////////////////////////////////////////////

$scope.$on('$destroy', function (event) {
	console.log('$destroy event', event);
	if (event.targetScope===$scope) {
	map.removeCircleMask();
	
	if (zoomControl.style) {
	zoomControl.style.top = "";
	zoomControl.style.left = "";
	}
	}
});

////////////////////////////////////////////////////////////
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////
worldTree.getWorld($routeParams.worldURL).then(function(data) {
		$scope.world = data.world;
		$scope.style = data.style;
		
		$scope.worldURL = $routeParams.worldURL;
		//initialize map with world settings
		map.setCenter($scope.world.loc.coordinates, 18, 'editor');

		if ($scope.world.style) {
			if ($scope.world.style.maps) {
			map.setBaseLayerFromID($scope.world.style.maps.cloudMapID)}}
			map.removeAllMarkers();
		
			map.addMarker('m', {
				lat: $scope.world.loc.coordinates[1],
				lng: $scope.world.loc.coordinates[0],
				focus: false,
				draggable: false,
				icon: {
					iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=',
					shadowUrl: '',
					iconSize: [0,0],
					shadowSize: [0,0],
					iconAnchor: [0,0],
					shadowAnchor: [0,0]
				}
			});

			map.removeCircleMask();
			map.addCircleMaskToMarker('m', 150, 'mask');
		
			map.setMaxBoundsFromPoint([$scope.world.loc.coordinates[1],$scope.world.loc.coordinates[0]], 0.05);
		
			if ($scope.world.style.maps.localMapID) {
				map.addOverlay($scope.world.style.maps.localMapID, 
								$scope.world.style.maps.localMapName, 
								$scope.world.style.maps.localMapOptions);
			}
			
			if ($scope.world.style.maps.hasOwnProperty('localMapOptions')) {
				zoomLevel = $scope.world.style.maps.localMapOptions.maxZoom || 19;
			}
		map.refresh();
		
		//world is finished loading
		worldLoaded = true;
		
		//begin loading landmarks
	worldTree.getLandmarks(data.world._id).then(function(data) {
		$scope.landmarks = data;
					
		//add markers to map
		angular.forEach($scope.landmarks, function(value, key) {
			//for each landmark add a marker
			addLandmarkMarker(value);
		});
		landmarksLoaded = true;
			
	});
	});	
	
}])

app.controller('LandmarkEditorItemController', ['$scope', 'db', 'Landmark', 'mapManager', '$upload', function ($scope, db, Landmark, mapManager, $upload) {
	console.log('LandmarkEditorItemController', $scope);
	$scope.time = false;
	
	$scope.deleteLandmark = function() {
		$scope.$parent.removeItem($scope.$index);
	}
	
	$scope.saveLandmark = function() {
		$scope.$parent.saveItem($scope.$index);
	}
	
	$scope.selectLandmark = function($event) {
		$scope.$parent.selectItem($scope.$index);
	}
	
	$scope.setStartTime = function() {
	var timeStart = new Date();
	$scope.$parent.landmark.time.start = timeStart.toISO8601String();
	}
	
	$scope.setEndTime = function() {
		var timeStart = new Date();
		console.log(timeStart);
		
		if (typeof $scope.$parent.landmark.time.start === 'string') {
			timeStart.setISO8601($scope.$parent.landmark.time.start);
		} //correct, its a string
		
		if ($scope.$parent.landmark.time.start instanceof Date) {
			//incorrect but deal with it anyway
			timeStart = $scope.$parent.landmark.time.start;
		}
		
		//timeStart is currently a date object
		console.log('timeStart', timeStart.toString());	 
		
		timeStart.setUTCHours(timeStart.getUTCHours()+3); //!!!Mutates timeStart itself, ECMA Date() design sucks!
		//timeStart is now the default end time
		var timeEnd = timeStart;
		console.log('--timeEnd', timeEnd.toString());
		$scope.$parent.landmark.time.end = timeEnd.toISO8601String();
	
	}

	//---- LOCATION DETAILS -----//
	$scope.setLocation = function(){

		//check if there are floor numbers registered, default to 0
		//populate dropdown with registered floors

		//if loc_info already exists, add 1
		if ($scope.$parent.landmark.loc_info){		
			if ($scope.$parent.landmark.loc_info.floor_num == null){
				$scope.$parent.landmark.loc_info.floor_num = 1;
			}
		}

		addLocInfo();
	}

	//if loc info, then load floor numbers / room names
	if ($scope.$parent.landmark.loc_info){
		addLocInfo();
	}

	function addLocInfo() {

		//read landmark floor array, cp to $scope

		$scope.$parent.floors = [{"val":-1,"label":"-1 Floor"},{"val":1,"label":"1st Floor"},{"val":2,"label":"2nd Floor"},{"val":3,"label":"3rd Floor"},{"val":4,"label":"4th Floor"},{"val":5,"label":"5th Floor"},{"val":6,"label":"6th Floor"},{"val":7,"label":"7th Floor"},{"val":8,"label":"8th Floor"},{"val":9,"label":"9th Floor"},{"val":10,"label":"10th Floor"}];  

		//IF no loc_info, then floor_num = 0
		if (!$scope.$parent.landmark.loc_info){
			$scope.$parent.landmark.loc_info = {
				floor_num: 1
			};  		
		}
	}
	//onclick hide location details
$scope.clearLoc = function(){
	//delete $scope.$parent.landmark.loc_info;

	$scope.$parent.landmark.loc_info.floor_num = null;
	$scope.$parent.landmark.loc_info.room_name = null;
}
	//--------------------------//

	
$scope.onUploadAvatar = function($files) {
	console.log('uploadAvatar');
	var file = $files[0];
	$scope.upload = $upload.upload({
		url: '/api/upload/',
		file: file,
	}).progress(function(e) {
		console.log('%' + parseInt(100.0 * e.loaded/e.total));
	}).success(function(data, status, headers, config) {
		console.log(data);
	$scope.$parent.landmark.avatar = data;
	$scope.uploadFinished = true;
	});
}		
	
}]);
