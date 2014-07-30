function WorldController( World, db, $routeParams, $scope, $location, leafletData, $rootScope, apertureService, mapManager, styleManager, socket, $sce) {
   	
    var map = mapManager;
  	var style = styleManager;
  	$scope.worldURL = $routeParams.worldURL;  
    $scope.aperture = apertureService;	
    $scope.aperture.set('off');
	
	
    angular.extend($rootScope, {loading: false});
	
	$scope.selectedIndex = 0;
	
	var landmarksLoaded;
	
  	$scope.filterCategory = function(c) {
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
  			switch (landmark.category) {
	  			case 'food': 
	  				categoryURL = 'img/jul30/marker/cake_arrow.png';
	  				break;
	  			case 'bar':
	  				categoryURL = 'img/jul30/marker/cocktail_arrow.png';
	  				break;
	  			case 'fabric':
	  				categoryURL = 'img/jul30/marker/spool_arrow.png';
	  				break;
	  		}
	  		if (c != undefined && landmark.category != c) {
	  			map.removeMarker(landmark._id); 
	  		} else {
	  			map.addMarker(landmark._id, {
		  			lat: landmark.loc.coordinates[1],
		  			lng: landmark.loc.coordinates[0],
		  			draggable:false,
		  			message:'<a href="#/w/'+$scope.world.id+'/'+landmark.id+'">'+landmark.name+'</a>',
		  			icon: {
		  				iconUrl: categoryURL,
		  				iconSize: [100,100],
		  				iconAnchor: [50, 100],
		  				shadowUrl: '',
		  				shadowRetinaUrl: '',
		  				shadowSize: [0,0],
		  				popupAnchor: [0, -80]
		  			},
		  			_id: landmark._id
		  		});
		  	}
	  		
	  		
  		});
  		map.refresh();
  	}
  	
  	
  	$scope.loadWorld = function(data) {
	  	 $scope.world = data.world;
		 $scope.style = data.style;
		 style.navBG_color = $scope.style.navBG_color;
		 
		 
		 console.log($scope.world);
		 console.log($scope.style);
		 
		 if ($scope.world.id=="AlleyNYC_Startup_Showcase") {
			 $scope.world.tempLocationName = "7th Ave & 37th St"
		 }
		 // order of logic
		 // if (type == cloud) ---> load cloud as basemap
		 // else if (type == both && localMapID && cloudMapID) --> load cloud as basecamp, layer local map on top
		 // else if (type == local && localMapID) --> load local map as base, use black background for leaflet style
		 // else if (cloudMapID) ---> load cloudmap as basemap
		 // else { load with default cloudMapID } ---> load a default cloudmap as basemap
		 
		 // add zoom restrictions

		 map.setMaxBoundsFromPoint([$scope.world.loc.coordinates[1],$scope.world.loc.coordinates[0]], 0.05);
		 map.setCenter($scope.world.loc.coordinates, 17); //pull zoom from mapoptions if exists
		 /*map.addPath('worldBounds', {
				type: 'circle',
                radius: 150,
				latlngs: {lat:$scope.world.loc.coordinates[1], lng:$scope.world.loc.coordinates[0]}
				});*/
		map.setBaseLayer(tilesDict[$scope.world.style.maps.cloudMapName]['url']);
		if ($scope.world.style.maps.type == "both" || $scope.world.style.maps.type == "local") {
			map.addOverlay($scope.world.style.maps.localMapID, $scope.world.style.maps.localMapName, $scope.world.style.maps.localMapOptions);
			map.refresh();
		}
  	}

	World.get({id: $routeParams.worldURL}, function(data) {
		 if (data.err) {
		 	console.log('Data error! Returning to root!');
		 	console.log(data.err);
		 	$location.path('/#/');
		 } else {

			$scope.loadWorld(data); 
			$scope.queryType = "all";
			$scope.queryFilter = "all";

			db.landmarks.query({queryType:$scope.queryType, queryFilter:$scope.queryFilter, parentID: $scope.world._id}, function(data){   
				console.log(data);
				$scope.landmarks = data;
				
				var categoryURL;
				angular.forEach($scope.landmarks, function(landmark) {
					switch (landmark.category) {
		  			case 'food': 
		  				categoryURL = 'img/jul30/marker/cake_arrow.png';
		  				break;
		  			case 'bar':
		  				categoryURL = 'img/jul30/marker/cocktail_arrow.png';
		  				break;
		  			case 'fabric':
		  				categoryURL = 'img/jul30/marker/spool_arrow.png';
		  				break;
		  			default:
		  				categoryURL = 'img/marker/red-marker-100.png';
		  				break;
		  			}
		  			
					map.addMarker(landmark._id, {
						lat:landmark.loc.coordinates[1],
						lng:landmark.loc.coordinates[0],
						draggable:false,
						message:'<a href="#/w/'+$scope.world.id+'/'+landmark.id+'">'+landmark.name+'</a>',
						icon: {
			  				iconUrl: categoryURL,
			  				iconSize: [100,100],
			  				iconAnchor: [50, 100],
			  				shadowUrl: '',
			  				shadowRetinaUrl: '',
			  				shadowSize: [0,0],
			  				popupAnchor: [0, -80]
		  				},
						_id: landmark._id
					});
				});
				landmarksLoaded=true;
				
			});
	

		}
		map.refresh();
		
	});
	
	$scope.tweets = db.tweets.query({limit:1});
    $scope.instagrams = db.instagrams.query({limit:1});
	


	////////////////////////////////////
	///////// Socket Chat //////////////
	////////////////////////////////////

  $scope.routeChat = function () {
  	$location.path('/chat/'+$scope.worldURL);
  }

	// Socket listeners
	//==================

  socket.on('init', function (data) {
    $rootScope.chatName = data.name;
    $rootScope.users = data.users;
  });

  socket.on('send:message', function (message) {
    $rootScope.messages.push(message);
  });

  //$scope.messages = [];

  $scope.sendMessage = function () {

    socket.emit('send:message', {
      message: $scope.message
    });

    var date = new Date;
    var seconds = (date.getSeconds()<10?'0':'') + date.getSeconds();
    var minutes = (date.getMinutes()<10?'0':'') + date.getMinutes();
    var hour = date.getHours();

    // add the message to our model locally
    $rootScope.messages.push({
      user: $rootScope.chatName,
      text: $scope.message,
      time: hour + ":" + minutes + ":" + seconds
    });

    // clear message box
    $scope.message = '';
  };

  $scope.sendEmo = function (input) {
    var path = "/img/emoji/";
    var emoji;

    switch(input) {
        case "cool":
            emoji = path+"cool.png";
            break;
        case "dolphin":
            emoji = path+"dolphin.png";
            break;
        case "ghost":
            emoji = path+"ghost.png";
            break;
        case "heart":
            emoji = path+"heart.png";
            break;
        case "love":
            emoji = path+"love.png";
            break;
        case "party":
            emoji = path+"party.png";
            break;
        case "smile":
            emoji = path+"smile.png";
            break;
        case "woah":
            emoji = path+"woah.png";
            break;
        default:
            emoji = path+"love.png";
            break;
    }
    $scope.message = '<img src="'+emoji+'">';
    $scope.sendMessage();
  }
  /////////////////////////////////////////
  /////////// End Socket Chat /////////////
  ////////////////////////////////////////


}


function WorldRepeatController($scope) {
	
}