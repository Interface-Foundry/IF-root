function LandmarkEditorController($scope, $rootScope, $location, $route, $routeParams, db, World, leafletData, apertureService, mapManager, Landmark, alertManager) {
	console.log('Landmark Editor Controller initializing');
////////////////////////////////////////////////////////////
///////////////////INITIALIZING VARIABLES///////////////////
////////////////////////////////////////////////////////////
	var map = mapManager;
	$scope.aperture = apertureService;
	$scope.aperture.set('half');
	
	var worldLoaded = false;
	var landmarksLoaded = false;
	
	$scope.landmarks = [];
	$scope.selectedIndex = 0;
	$scope.alerts = alertManager;

	
////////////////////////////////////////////////////////////
//////////////////////DEFINE FUNCTIONS//////////////////////
////////////////////////////////////////////////////////////
	$scope.addFileUploads = function() {
		angular.element('.fileupload').fileupload({
        url: '/api/upload',
        dataType: 'text',
        progressall: function (e, data) {  

            $('#progress .bar').css('width', '0%');

            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .bar').css(
                'width',
                progress + '%'
            );
        },
        done: function (e, data) {
            $scope.landmarks[$scope.selectedIndex].avatar = data.result;
        }
    });
	}
	
	$scope.addLandmark = function() {
		console.log('--addLandmark--');
		if (!worldLoaded || !landmarksLoaded) {console.log('loading not complete');}
		else {
		console.log('Adding a new Landmark');
		var tempLandmark = landmarkDefaults();
		db.landmarks.create(tempLandmark, function(response) {
				console.log('--db.landmarks.create--');
				console.log('Response ID:'+response[0]._id);
			tempLandmark._id = response[0]._id;
				console.log('tempLandmark');
				console.log(tempLandmark);
				console.log(tempLandmark.loc.coordinates);
			
			//add to array 
			$scope.landmarks.unshift(tempLandmark);		
			
			//add marker
			map.addMarker(tempLandmark._id, {
				lat:tempLandmark.loc.coordinates[1],
				lng:tempLandmark.loc.coordinates[0],
				draggable:true,
			});
			
			//$scope.selectItem(0)
			console.log("$scope.landmarks");
			console.log($scope.landmarks);				
				
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
		$scope.alerts.addAlert('success','Landmark Saved');
	}
	
	$scope.selectItem = function(i) {
		console.log('--selectItem--');
		//$scope.saveItem($scope.selectedIndex);//save previous landmark
		console.log('Continue w select');
		$scope.selectedIndex = i; //change landmarks
		map.setCenter($scope.landmarks[i].loc.coordinates, 17);//center map on new markers
		console.log($scope.landmarks[i].name);
		map.setMarkerMessage($scope.landmarks[i]._id, $scope.landmarks[i].name);
		map.setMarkerFocus($scope.landmarks[i]._id);
		console.log('Complete select');
	}
		
	function loadLandmarks() {
		console.log('--loadLandmarks--');
		//$scope.queryType = "all";
		//$scope.queryFilter = "all";
		db.landmarks.query({ queryType:'all', queryFilter:'all', parentID: $scope.world._id}, function(data){
				console.log('--db.landmarks.query--');
				console.log('data');
				console.log(data);
			//data.shift();
			$scope.landmarks = $scope.landmarks.concat(data);
				console.log('$scope.landmarks');
				console.log($scope.landmarks);
			
			//add markers to map
			angular.forEach($scope.landmarks, function(value, key) {
				//for each landmark add a marker
				map.addMarker(value._id, {
					lat:value.loc.coordinates[1],
					lng:value.loc.coordinates[0],
					draggable: true,
					message:value.name
				});
			});
			landmarksLoaded = true;
			
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
			avatar: "img/tidepools/default.jpg"
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
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////
		console.log('controller active');
	World.get({id: $routeParams.worldID}, function(data) {
			console.log('--World.get--');
			console.log(data);
		$scope.world = data.world;
			console.log('-World-');
			console.log($scope.world);
		$scope.style = data.style;
			console.log('-Style-');
			console.log($scope.style);
		
		$scope.worldURL = $routeParams.worldID;
		//initialize map with world settings
		map.setCenter($scope.world.loc.coordinates, 15);
		/*map.addPath('worldBounds', {
				type: 'circle',
                radius: 150,
				latlngs: {lat:$scope.world.loc.coordinates[1], lng:$scope.world.loc.coordinates[0]}
				});*/
		//map.setTiles($scope.world.style.maps.cloudMapName);
		map.setMaxBoundsFromPoint([$scope.world.loc.coordinates[1],$scope.world.loc.coordinates[0]], 0.05);
		if ($scope.world.style.maps.type == "local" || $scope.world.style.maps.type == "both") {
		map.addOverlay($scope.world.style.maps.localMapID, $scope.world.style.maps.localMapName, $scope.world.style.maps.localMapOptions);
		}
		map.refresh();
		
		//world is finished loading
		worldLoaded = true;
		
		//begin loading landmarks
		loadLandmarks();
	});
}

function LandmarkEditorItemController($scope, db, Landmark, mapManager) {
	$scope.time = false;
	$scope.typeOptions = [
		{name:'Place'},
		{name:'Event'}
	];
	$scope.typeSelect = $scope.typeOptions[0];
	
	
	$scope.deleteLandmark = function() {
		$scope.$parent.removeItem($scope.$index);
	}
	
	$scope.saveLandmark = function() {
		$scope.$parent.saveItem($scope.$index);
	}
	
	$scope.selectLandmark = function() {
		$scope.$parent.selectItem($scope.$index);
	}
	
	$scope.fUploads = function() {
		$scope.$parent.addFileUploads();
	}
}