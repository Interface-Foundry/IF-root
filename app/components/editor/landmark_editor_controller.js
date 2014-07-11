function LandmarkEditorController($scope, $rootScope, $location, $route, $routeParams, db, World, leafletData, apertureService, mapManager, Landmark) {
	console.log('Landmark Editor Controller initializing');
////////////////////////////////////////////////////////////
///////////////////INITIALIZING VARIABLES///////////////////
////////////////////////////////////////////////////////////
	var map = mapManager;
	var defaults = {
		name: 'Default',
		_id: 0,
		world: false,
		newStatus: true,
		parentID: 0,
		loc: [-74.0059,40.7127], //DOES NOT MATCH SCHEMA
		avatar: "img/tidepools/default.jpg"	
	};
	
	var aperture = apertureService;
	aperture.toggle('half');
	
	$scope.landmarks = [];
	$scope.selectedIndex;
	
////////////////////////////////////////////////////////////
//////////////////////DEFINE FUNCTIONS//////////////////////
////////////////////////////////////////////////////////////

	$scope.addLandmark = function() {
		console.log('Adding Landmark');
		if (defaults.parentID == 0) {
			//Not ready yet! 
			console.log('Defaults not updated, error');
		} else {
			console.log('Creating Landmark');
			
			db.landmarks.create(defaults, function(response) {
				console.log('Response ID:'+response[0]._id);
				
				var tempLandmark = new Object();
				angular.extend(tempLandmark, defaults);
				angular.extend(tempLandmark, response[0]);
								
				console.log("Temporary Landmark:");
				console.log(tempLandmark);
				
				$scope.landmarks.unshift(tempLandmark);		
				
				console.log("Landmarks Array");
				console.log($scope.landmarks);
			});
		}
	}
	
	$scope.removeItem = function(i) {
		//animates the removal
		$scope.landmarks.splice(i, 1);
	}	
	
	$scope.selectItem = function(i) {
		//pan to new landmark, select the interface
		$scope.selectedIndex = i;
	}
		
	function loadLandmarks() {
		$scope.queryType = "all";
		$scope.queryFilter = "all";

		$scope.landmarksQuery = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, parentID: $scope.world._id}, function(data){
			console.log(data);   
			$scope.landmarks = $scope.landmarks.concat(data);
			console.log($scope.landmarks);
		});
	}
	
	function updateDefaults() {
		defaults.parentID = $scope.world._id;
		//defaults.loc.coordinates = $scope.world.loc.coordinates;
		console.log('Defaults Updated');
		console.log(defaults);
	}
	
	function refreshMap(){
	    leafletData.getMap().then(function(map) {
			
	        map.invalidateSize();
	    });
	}

	
////////////////////////////////////////////////////////////
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////

	World.get({id: $routeParams.worldID}, function(data) {
		console.log(data);
		$scope.world = data.world;
		$scope.style = data.style;
		map.center = {
			 lat: $scope.world.loc.coordinates[1],
		     lng: $scope.world.loc.coordinates[0],
		     zoom: 10
		};
		map.markers = {
			m: {
				        lat: $scope.world.loc.coordinates[1],
						lng: $scope.world.loc.coordinates[0]
				}
		};
		map.tiles = tilesDict[$scope.world.style.maps.cloudMapName];
		refreshMap();
		updateDefaults();
		loadLandmarks();
		
	});
	
}

function LandmarkEditorItemController($scope, db, Landmark, mapManager) {

	$scope.deleteLandmark = function() {
		var deleteItem = confirm('Are you sure you want to delete this item?'); 
		
	    if (deleteItem) {
	    	$scope.$parent.removeItem($scope.$index);
			//notify parent to remove from array with $index
	    	console.log($scope.landmark._id);
	        Landmark.del({_id: $scope.landmark._id}, function(landmark) {
	            //$location.path('/'); 
	            console.log('Delete');
	        });
	        }
	}
	
	$scope.saveLandmark = function() {
		
	}
	
}