function WorldController( World, db, $routeParams, $scope, $location, leafletData, $rootScope, apertureService, mapManager) {
   	
    var map = mapManager;
  	$scope.worldURL = $routeParams.worldURL;  
    $scope.aperture = apertureService;	
    $scope.aperture.set('off');

	if ($routeParams.worldURL == "Syracuse_Tech_Meetup") {
		$scope.stm = true;
	}
	
    angular.extend($rootScope, {loading: false});
    
	$scope.selectedIndex = 0;
	
	var landmarksLoaded;
	
$scope.goToLandmark = function(i) {
		console.log('--goToLandmark--');
		$scope.selectedIndex = i;
		map.setCenter($scope.landmarks[i].loc.coordinates, 17);
		map.setMarkerFocus($scope.landmarks[i]._id);	
	}
  	
  	$scope.goToCategory = function(c) {
	  	console.log('--goToCategory--');
	  	$scope.aperture.set('half');
	  	
	  	redoMarkers($scope.landmarks, c);
	 }
	 
	 $scope.returnToWorld = function() {
		 redoMarkers($scope.landmarks);
	 }

  	
  	function redoMarkers(landmarks, c) {
  		var categoryURL;
  		angular.forEach($scope.landmarks, function(landmark) {
	  		if (landmark.category == 'food') {categoryURL="/img/marker/food-marker.png"}
	  		if (landmark.category == 'bathroom') {categoryURL="/img/marker/washroom-marker.png"}
	  		if (landmark.category == 'building') {categoryURL="/img/marker/building-marker.png"}
	  		if (c != undefined && landmark.category != c) {
	  			map.removeMarker(landmark._id); 
	  		} else {
	  			map.addMarker(landmark._id, {
		  			lat: landmark.loc.coordinates[1],
		  			lng: landmark.loc.coordinates[0],
		  			draggable:false,
		  			message:landmark.name,
		  			icon: {
		  				iconUrl: categoryURL,
		  				iconSize: [50,50]
		  			}
		  		});
		  	}
	  		
	  		
  		});
  		map.refresh();
  	}
  	
  	
  	$scope.loadWorld = function(data) {
	  	 $scope.world = data.world;
		 $scope.style = data.style;
		 
		 console.log($scope.world);
		 console.log($scope.style);
		 // order of logic
		 // if (type == cloud) ---> load cloud as basemap
		 // else if (type == both && localMapID && cloudMapID) --> load cloud as basecamp, layer local map on top
		 // else if (type == local && localMapID) --> load local map as base, use black background for leaflet style
		 // else if (cloudMapID) ---> load cloudmap as basemap
		 // else { load with default cloudMapID } ---> load a default cloudmap as basemap
		 
		 // add zoom restrictions

		 map.setMaxBoundsFromPoint([$scope.world.loc.coordinates[1],$scope.world.loc.coordinates[0]], 0.05);
		 map.setCenter($scope.world.loc.coordinates, 15); //pull zoom from mapoptions if exists
		 map.addPath('worldBounds', {
				type: 'circle',
                radius: 150,
				latlngs: {lat:$scope.world.loc.coordinates[1], lng:$scope.world.loc.coordinates[0]}
				});
		map.tiles = tilesDict[$scope.world.style.maps.cloudMapName];
		map.refresh();
  	}
  	
  	if ($scope.stm) {
  	console.log("Syracuse Tech Meetup");
  	angular.extend($rootScope, {globalNavColor: "rgba(0,110,100, 0.9)", globalBGColor: "#00695C"});
  	
	 	$scope.world = {
	"__v" : 0,
	"_id" : "53cf6d5b1e218b73715cef47",
	"avatar" : "uploads/82737527.png",
	"category" : "Meetup",
	"description" : "Six amazing tech start-ups from the StartFast Venture Accelerator will introduce their companies.  Networking. Food. Drink. Tech.",
	"id" : "Syracuse_Tech_Meetup",
	"landmarkCategories" : [ ],
	"loc" : {
		"type" : "Point",
		"coordinates" : [
			-76.15032400000001,
			43.0444631
		]
	},
	"name" : "Syracuse Tech Meetup",
	"permissions" : {
		"ownerID" : "53cf6cab1e218b73715cef3a",
		"admins" : [ ],
		"viewers" : [ ]
	},
	"resources" : {
		"hashtag" : "techmeetup2014"
	},
	"style" : {
		"maps" : {
			"cloudMapID" : "interfacefoundry.ig6f6j6e",
			"cloudMapName" : "sunset",
			"localMapID" : "53cf6d5b1e218b73715cef47_warped.vrt",
			"localMapName" : "53cf6d5b1e218b73715cef47",
			"localMapOptions" : {
				"minZoom" : 16,
				"maxZoom" : 19,
				"attribution" : "IF",
				"reuseTiles" : true,
				"tms" : true
			},
			"type" : "both"
		},
		"markers" : {
			"name" : "red",
			"category" : "all"
		},
		"styleID" : "53cf6d5b1e218b73715cef46"
	},
	"subType" : [ ],
	"summary" : "Meet the Teams at StartFast",
	"tags" : [ ],
	"time" : {
		"created" : "2014-07-23T08:07:55.604Z"
	},
	"valid" : true,
	"world" : true
};
		
		$scope.style = {
			titleBG_color: "#009688",
			cardBG_color: "#FFF",
			category_color: "#E91E63",
			categoryTitle_color: "#BBDEFB",
			worldTitle_color: "#FFF",
			landmarkTitle_color: "#2196F3"
		}
		
		
		map.setMaxBoundsFromPoint([$scope.world.loc.coordinates[1],$scope.world.loc.coordinates[0]], 0.05);
		map.setCenter($scope.world.loc.coordinates, 16); //pull zoom from mapoptions if exists
		/*map.addPath('worldBounds', {
				type: 'circle',
                radius: 150,
				latlngs: {lat:$scope.world.loc.coordinates[1], lng:$scope.world.loc.coordinates[0]}
				});*/
		//map.tiles = tilesDict['sunset']; http://107.170.180.141/maps/53cf6d5b1e218b73715cef47_warped.vrt/{z}/{x}/{y}.png',

		map.tiles = {};
		angular.extend(map.layers, {
			overlays: {
				localMap: {
					name: 'Syracuse Tech Meetup',
					visible: true,
					type: 'xyz',
					url: 'http://107.170.180.141/maps/demo/{z}/{x}/{y}.png',
					opacity: 0.2,					
					minZoom: 16,
					maxZoom: 19,
					tms: false,
					reuseTiles: true,
					layerParams: {
					},
					layerOptions: {
					}
					}
			}
		});
		map.refresh();
		
		World.get({id: $routeParams.worldURL}, function(data) {
		
		$scope.queryType = "all";
			$scope.queryFilter = "all";
		db.landmarks.query({queryType:$scope.queryType, queryFilter:$scope.queryFilter, parentID: data.world._id}, function(data){   
				console.log(data);
				$scope.landmarks = data;
				
				redoMarkers($scope.landmarks);
				landmarksLoaded=true;
				
			});
		
		});
		
		
		
  	} else {
	World.get({id: $routeParams.worldURL}, function(data) {
		 if (data.err){
		 	$location.path('/#/');
		 }
		 else {

			$scope.loadWorld(data); 
			$scope.queryType = "all";
			$scope.queryFilter = "all";

			db.landmarks.query({queryType:$scope.queryType, queryFilter:$scope.queryFilter, parentID: $scope.world._id}, function(data){   
				console.log(data);
				$scope.landmarks = data;
				
				angular.forEach($scope.landmarks, function(landmark) {
					map.addMarker(landmark._id, {
						lat:landmark.loc.coordinates[1],
						lng:landmark.loc.coordinates[0],
						draggable:false,
						message:landmark.name
					});
				});
				landmarksLoaded=true;
				
			});
		}
		map.refresh();
		
	});
	}
	
}


function WorldRepeatController($scope) {
	$scope.goToMark = function() {
		$scope.$parent.goToLandmark($scope.$index);
	}
	
	
}