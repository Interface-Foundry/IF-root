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
			
			var landmarkIcon = 'img/marker/bubble-marker-50.png',
					popupAnchorValues = [0, -50],
					shadowUrl = '',
					// shadowAnchor = [12, 20],
					iconAnchor = [25, 100];

			//add marker
			map.addMarker(tempLandmark._id, {
				lat:tempLandmark.loc.coordinates[1],
				lng:tempLandmark.loc.coordinates[0],
				icon: {
					iconUrl: landmarkIcon,
					shadowUrl: shadowUrl,
					// shadowAnchor: shadowAnchor,
					iconSize: [50, 95],
					iconAnchor: [25, 100],
					popupAnchor: popupAnchorValues,
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
	
	$scope.addLandmarkMarker = function(landmark) {
		var landmarkIcon = 'img/marker/bubble-marker-50.png',
				popupAnchorValues = [0, -40],
				shadowUrl = '',
				shadowAnchor = [4, -3],
				iconAnchor = [17, 67],
				iconSize = [35, 67];

		if (bubbleTypeService.get() === 'Retail' && landmark.avatar !== 'img/tidepools/default.jpg') {
			landmarkIcon = landmark.avatar;
			popupAnchorValues = [0, -14];
			// shadowUrl = 'img/marker/blue-pointer.png';
			iconAnchor = [25, 25];
			iconSize = [50, 50]
		}
	
		map.addMarker(landmark._id, {
				lat:landmark.loc.coordinates[1],
				lng:landmark.loc.coordinates[0],
				icon: {
					iconUrl: landmarkIcon,
					shadowUrl: shadowUrl,
					shadowAnchor: shadowAnchor,
					iconSize: iconSize,
					iconAnchor: iconAnchor,
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
		
			var theseMaps = [$scope.world.style.maps];

			if (theseMaps[0].localMapArray){
				if (theseMaps[0].localMapArray.length > 0) {
					theseMaps = map.findMapFromArray(theseMaps[0].localMapArray);
				}				
			}


			theseMaps.forEach(function(thisMap) {
				if (thisMap.localMapID !== undefined && thisMap.localMapID.length > 0) {
					map.addOverlay(thisMap.localMapID, 
									thisMap.localMapName, 
									thisMap.localMapOptions);
				}
				
			});
			
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
			$scope.addLandmarkMarker(value);
		});
		landmarksLoaded = true;
			
	});
	});	
	
}])

app.controller('LandmarkEditorItemController', ['$scope', 'db', 'Landmark', 'mapManager', '$upload', 'bubbleTypeService', 'worldTree', '$q', '$log', function ($scope, db, Landmark, mapManager, $upload, bubbleTypeService, worldTree, $q, $log) {
	console.log('LandmarkEditorItemController', $scope);
	$scope.time = false;
	
	$scope.deleteLandmark = function() {
		$scope.$parent.removeItem($scope.$index);
	}
	
	$scope.saveLandmark = function() {
		$scope.$parent.saveItem($scope.$index);
	}
	
	$scope.selectLandmark = function(index) {
		if (index === $scope.$parent.selectedIndex) {
			return;
		}
		// updateFloor sets up a promise chain to allow markers to
		// disappear and regenerate before selectItem is run
		$scope.updateFloor()
			.then(function() {
				$scope.$parent.selectItem($scope.$index);		
			});
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

	function populateFloorsDropdown(localMap) {
		var newFloor = {};
		newFloor.val = localMap.floor_num;
		newFloor.label = localMap.floor_name;
		return newFloor;
	}

	$scope.$on('leafletDirectiveMarker.dragend',function (marker, ev) {
		mapManager.markers[ev.markerName].lat = ev.leafletEvent.target._latlng.lat;
		mapManager.markers[ev.markerName].lng = ev.leafletEvent.target._latlng.lng;
  });

	function addLocInfo() {
		//read landmark floor array, cp to $scope

		if (mapManager.localMapArrayExists($scope.world)) {
			var floors = [];
			var localMaps = _.chain($scope.world.style.maps.localMapArray)
				.filter(function(m) {
					return m.floor_num;
				})
				.sortBy(function(m) {
					return m.floor_num;
				})
				.uniq(function(m) {
					return m.floor_num;
				})
				.value();

			localMaps.forEach(function(m) {
				floors.push(populateFloorsDropdown(m));
			});

			$scope.$parent.floors = floors;
		} else {
			$scope.$parent.floors = [{"val":-1,"label":"-1 Floor"},{"val":1,"label":"1st Floor"},{"val":2,"label":"2nd Floor"},{"val":3,"label":"3rd Floor"},{"val":4,"label":"4th Floor"},{"val":5,"label":"5th Floor"},{"val":6,"label":"6th Floor"},{"val":7,"label":"7th Floor"},{"val":8,"label":"8th Floor"},{"val":9,"label":"9th Floor"},{"val":10,"label":"10th Floor"}];  
		}

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


$scope.updateFloor = function() {

	var deferred = $q.defer(),
			// landmarks without floor info will default to floor 1
			currentFloor = $scope.landmark.loc_info ? $scope.landmark.loc_info.floor_num : 1;

	if (mapManager.localMapArrayExists($scope.world)) {
		var localMaps = $scope.world.style.maps.localMapArray;

		// sort and then filter floors
		var floorMaps = mapManager.filterToCurrentFloor(mapManager.sortFloors(localMaps), currentFloor);	

		mapManager.removeOverlays();
		floorMaps.forEach(function(thisMap) {
			if (thisMap.localMapID !== undefined && thisMap.localMapID.length) {
				mapManager.addOverlay(thisMap.localMapID, 
								thisMap.localMapName, 
								thisMap.localMapOptions);
			}	
		});
	}
	getLandmarks(currentFloor).then(function() {
		deferred.resolve(true);
	});

	return deferred.promise;
}

function getLandmarks(currentFloor) {
	var deferred = $q.defer();

	showLandmarksOnFloor(filterLandmarks($scope.$parent.landmarks, currentFloor))
		.then(function() {
			deferred.resolve(true);
		});

	return deferred.promise;
}

function filterLandmarks(landmarks, currentFloor) {
	var filtered = _.chain(landmarks)
		.filter(function(l) {
			return l.loc_info;
		})
		.filter(function(l) {
			return l.loc_info.floor_num === currentFloor;
		})
		.value();

	// if showing the first floor then include all landmarks without a floor num
	if (currentFloor === 1) {
		filtered = filtered.concat(landmarks.filter(function(l) {
			return !l.loc_info;
		}));
	}

	return filtered;
}

function showLandmarksOnFloor(landmarks) {
	var deferred = $q.defer();

	// remove all landmarks
	mapManager.removeAllMarkers();
	angular.forEach(landmarks, function(mark) {
		// for each landmark add a marker
		$scope.$parent.addLandmarkMarker(mark);
	});

	deferred.resolve(true);

	return deferred.promise;
}

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
	if (bubbleTypeService.get() === 'Retail') {
		mapManager.setNewIcon($scope.$parent.landmark);
	}
	$scope.uploadFinished = true;
	});
}		
	
	//------- TAGGING -------//

	$scope.$parent.landmark.landmarkTagsRemoved = [];

	$scope.tagDetect = function(keyEvent) {
		if (keyEvent.which === 13){
			$scope.addTag();
		}
	}

	$scope.addTag = function() {
		if($scope.addTagName !== ''){
			if (!$scope.$parent.landmark.tags){
				$scope.$parent.landmark.tags = []; //if no array, then add
			}
			$scope.addTagName = $scope.addTagName.replace(/[^\w\s]/gi, '');

			if($scope.$parent.landmark.tags.indexOf($scope.addTagName) > -1){ 
				//check for dupes, if dupe dont added
			}
			else {
				$scope.$parent.landmark.tags.push($scope.addTagName);
			}
			$scope.addTagName = '';			
		}
	};

	$scope.closeTag = function(index) {
		$scope.$parent.landmark.landmarkTagsRemoved.push($scope.$parent.landmark.tags[index]); //add remove to tags removed arr
		$scope.$parent.landmark.tags.splice(index, 1);
	};

	//--------------------------//
	
}]);
