
function WorldMakerCtrl($location, $scope, $routeParams, db, $rootScope, leafletData, leafletEvents, apertureService, $http, $timeout, $modal) {
	var worldDetailMap = leafletData.getMap('worldDetailMap');
	var aperture = apertureService;
	aperture.set('off');
	
	angular.extend($rootScope, {apertureSize: 0});
	angular.extend($rootScope, {apertureOn: false});
	
	$scope.center = {};
	$scope.tiles = tilesDict.mapbox;
            
    $scope.markers = {};
    angular.extend($scope, 
    	{paths: {}}
    	);
	
	angular.extend($rootScope, {loading: true});
	
	$scope.userID = "53ab92d2ac23550e12600011";	
	$scope.username = "interfoundry"; 
	$scope.worldID; //mongo ID
	//$scope.worldURL; //unique URL ID for that world
	$scope.styleID;
	$scope.projectID;

	//init vars
	$scope.pageIndex = 0;
	$scope.pageClass = [];
	$scope.pageClass[0] = 'current';
	$scope.pageClass[1] = 'right';
	$scope.pageClass[2] = 'right';
	$scope.pageClass[3] = 'right';
	
	$scope.mapConfirm = 'false';
	
    $scope.world = { 
    	loc: {},
        avatar: "img/tidepools/default.jpg",
        date: {},
        time: {}
    };
	
    $scope.mapping = {};
    $scope.styles = {};
    $scope.project = {};
	
	$scope.mapThemes = [
		{cloudMapName:'urban', cloudMapID:'interfacefoundry.ig6a7dkn'},
		{cloudMapName:'fairy', cloudMapID:'interfacefoundry.ig9jd86b'},
		{cloudMapName:'sunset', cloudMapID:'interfacefoundry.ig6f6j6e'},
		{cloudMapName:'arabesque', cloudMapID:'interfacefoundry.ig67e7eb'}
	];
	
	$scope.mapping.mapThemeSelect = $scope.mapThemes[0];

	$scope.mapping.type = 'cloud'; //pre-select cloud only map
	
	$scope.markerOptions = [
		{name:'red'},
		{name:'orange'},
		{name:'yellow'},
		{name:'green'},
		{name:'blue'},
		{name:'purple'}
	];
	
	$scope.mapping.markerSelect = $scope.markerOptions[0];
	
	$scope.bgColor = '#CCC';

	$scope.showTime = false; //pre-set


	
	//custom elements, eventually replace with directives
	$('.color').spectrum({
		clickoutFiresChange: true
	});





  //==== SETTING UP DATETIME INPUTS ====//

  //DATE
  $scope.today = function() {
    $scope.world.date.start = new Date();
    $scope.world.time.start = new Date();
    $scope.world.time.end = new Date();
  };
  $scope.today();

  // $scope.clear = function () {
  //   $scope.world.date.start = null;
  // };

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.format = 'MMMM dd, yyyy';

  //TIME
  $scope.hstep = 1;
  $scope.mstep = 15;

  $scope.ismeridian = true;

  // $scope.update = function() {
  //   var d = new Date();
  //   d.setHours( 14 );
  //   d.setMinutes( 0 );
  //   $scope.world.time.start= d;
  // };

  //===============================//



	// =============  TEMPORARY  ============== //

    


	$scope.buildOut = function() {
		saveStyle();
		$location.path('/w/'+$scope.worldURL);
	}
    //===================================//



	angular.element('#fileupload').fileupload({
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

            $('#uploadedpic').html('');
            $('#preview').html('');
            $('<p/>').text('Saved: '+data.originalFiles[0].name).appendTo('#uploadedpic');
            $('<img src="'+ data.result +'">').load(function() {
              $(this).width(150).height(150).appendTo('#preview');
            });
            $scope.world.avatar = data.result;
        }
    });

	$scope.nextPage = function () {
		if ($scope.worldDetail.worldName.$valid) {
		if ($scope.pageIndex<($scope.pageClass.length-1)) {
			$scope.pageClass[$scope.pageIndex] = 'left';
			if ($scope.pageIndex == 0){ //making new world after first page
				
				if (!$scope.worldID){ //new world
					console.log("Saving new world");
					saveWorld();
				}
				else { //edit created world
					console.log("Editing created world");
					saveWorld('edit');
				}
			}
			if ($scope.pageIndex == 1){ //adding/editing world map settings
				console.log("Adding/editing world map settings");
				saveWorld('map');	
			}

			if ($scope.pageIndex == 2){ //editing style.
				console.log("Editing style");
				saveStyle();
			}
			$scope.pageIndex += 1;
			$scope.pageClass[$scope.pageIndex] = 'current';
		}

		} else {
			window.alert("Add a name!");
		}
	};
	
	$scope.prevPage = function() {
		if ($scope.pageIndex>0) {
			$scope.pageClass[$scope.pageIndex] = 'right';
			$scope.pageIndex = $scope.pageIndex - 1;
			$scope.pageClass[$scope.pageIndex] = 'current';
		}
	};
	
	$scope.maplocsearch = function(keypressEvent) {
		if (keypressEvent.keyCode == 13) {
			console.log("enter");
			var geocoder = new google.maps.Geocoder();
			if (geocoder) {
					geocoder.geocode({'address': $scope.locsearchbar},
						function (results, status) {
							if (status == google.maps.GeocoderStatus.OK) {
								$scope.center.lat = results[0].geometry.location.lat();
								$scope.center.lng = results[0].geometry.location.lng();
								$scope.markers.m.lat = results[0].geometry.location.lat();
								$scope.markers.m.lng = results[0].geometry.location.lng();
								
							} else { console.log('No results found.')}
						});
					}
			}
		};
	
	$scope.mapLock = function() {
			//position is locked
			console.log($scope.markers.m.lat);
			console.log($scope.markers.m.lng);
			$scope.paths = {
				worldBounds: {
					type: 'circle',
					radius: 150,
					latlngs: {lat:$scope.markers.m.lat,
							lng:$scope.markers.m.lng}
				}
			};
			refreshMap();	
			};
	
	function refreshMap(){ 
        leafletData.getMap('worldDetailMap').then(function(map) {
            setTimeout(function() {map.invalidateSize();}, 400);
        });
    }

	function showPosition(position) {

            userLat = position.coords.latitude;
            userLon = position.coords.longitude;

            //map builder map view
	       	angular.extend($scope, {
			  center: {
			      lat: userLat, //adding these from world editor function
			      lng: userLon,
			      zoom: 17
			  },
			  markers:{}
			});

            $scope.center = {
                lat: userLat,
                lng: userLon,
                zoom: 17
            };
            $scope.tiles = tilesDict.mapbox;
            
            $scope.markers = {
                    m: {
                        lat: userLat,
                        lng: userLon,
                        message: "<p style='color:black;'>Drag to Location on map</p>",
                        focus: true,
                        draggable: true,
                        icon: local_icons.yellowIcon
                    }
                };
                
            $scope.paths = {
				worldBounds: {
					type: 'circle',
					radius: 150,
					latlngs: {lat:$scope.markers.m.lat,
							lng:$scope.markers.m.lng}
				}
			};
			
			//disable this for 2nd page of editor...
			$scope.$on('leafletDirectiveMap.moveend', function(event){
                    console.log('moveend');
                    /*angular.extend($scope, {
	                    paths: {
		                    worldBounds: {
		                    type:'circle',
		                    radius: 150,
			                    latlngs: {lat:$scope.markers.m.lat,
							lng:$scope.markers.m.lng}
		                    }
	                    }
                    });*/
                    
	                $scope.paths = {
		                    worldBounds: {
		                    type:'circle',
		                    radius: 150,
			                    latlngs: {lat:$scope.markers.m.lat,
							lng:$scope.markers.m.lng}
		                    }
	                    };
	                    
                    refreshMap();
                    /*$scope.paths.worldBounds.latlngs = {lat:$scope.markers.m.lat,
							lng:$scope.markers.m.lng};*/
                });
            angular.extend($rootScope, {loading: false});
            refreshMap();
            
     }

	
    function locError(){
            console.log('no loc');
    }
    
    function loadWorld(){
		//init from world ID
		
    }
    
    function saveWorld(option){
    	//set up json object w all attributes
    	//update object in database
    	
    	//todo only update things that have changed

    	//---- TIME ----//
    	//use checkbox to select "time" option, for now sending with no time: (use time icon, make it special, like TIME ACTIVATED glow)


    	$scope.world.hasTime = $scope.showTime; //adding datetime to world


    	if ($scope.showTime){
	   
	   	    //if no end date added, use start date
	        if (!$scope.world.date.end){
	            $scope.world.date.end = $scope.world.date.start;
	        }

	        $scope.world.datetext = {
	            start: $scope.world.date.start,
	            end: $scope.world.date.end
	        }
	        //---- Date String converter to avoid timezone issues...could be optimized probably -----//
	        $scope.world.date.start = new Date($scope.world.date.start).toISOString();
	        $scope.world.date.end = new Date($scope.world.date.end).toISOString();

	        $scope.world.date.start = dateConvert($scope.world.date.start);
	        $scope.world.date.end = dateConvert($scope.world.date.end);

	        $scope.world.date.start = $scope.world.date.start.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1'); //rearranging so value still same in input field
	        $scope.world.date.end = $scope.world.date.end.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1');

	        function dateConvert(input){
	            var s = input;
	            var n = s.indexOf('T');
	            return s.substring(0, n != -1 ? n : s.length);
	        }
	        //-----------//

	        if (!$scope.world.time.start){
	            $scope.world.time.start = "00:00";
	        }

	        if (!$scope.world.time.end){
	            $scope.world.time.end = "23:59";
	        }

	        $scope.world.timetext = {
	            start: $scope.world.time.start,
	            end: $scope.world.time.end
	        } 
	        //------- END TIME --------//
	    }


        //$rootScope.worldCoordinates = $scope.world.loc.coordinates; //updating to rootscope for modal process

        $scope.world.userID = $scope.userID;

        //edit world
        if (option == 'edit'){
        	$scope.world.loc.coordinates = [$scope.markers.m.lng, $scope.markers.m.lat];
			console.log('saveWorld(edit)');
        	$scope.world.newStatus = false; //not new
        	$scope.world.worldID = $scope.worldID;
	        db.worlds.create($scope.world, function(response){
	        	console.log(response);
	        });  
        }

        //adding/editing map theme options to world 
        if (option == 'map'){
        	console.log('saveWorld(map)');
        	$scope.mapping.editMap = true; //adding/editing world map

        	$scope.mapping.worldID = $scope.worldID;

        	console.log($scope.mapping);

        	db.worlds.create($scope.mapping, function(response){
	        	console.log(response);
	        });  

        }

        //new world
        if (option === undefined) {
        	console.log('saveWorld()');
        	$scope.world.loc.coordinates = [$scope.markers.m.lng, $scope.markers.m.lat];
        	$scope.world.newStatus = true; //new
	        db.worlds.create($scope.world, function(response){
	        	$scope.worldID = response[0].worldID;
	        	$scope.projectID = response[0].projectID;
	        	$scope.styleID = response[0].styleID;
	        	$scope.worldURL = response[0].worldURL;
	        	console.log($scope.worldURL);
				console.log('new world created');
	        });       	
        }

    
    }

    function saveStyle(){
    	console.log('saveStyle()');
    	$scope.styles.styleID = $scope.styleID;
	    db.styles.create($scope.styles, function(response){
        	console.log(response);
        });  
    }

    function saveProject(){
    	console.log('saveProject()');
    	$scope.project.projectID = $scope.projectID;

	    db.projects.create($scope.project, function(response){
        	console.log(response);
        });  
    }



    if (navigator.geolocation) {
       // Get the user's current position
       navigator.geolocation.getCurrentPosition(showPosition, locError, {timeout:50000});
       refreshMap();
	}
	


	///////// MODAL ///////
	$scope.myData = {
	    link: "http://google.com",
	    modalShown: false,
	    hello: 'world',
	    foo: 'bar'
	}
	 
	$scope.logClose = function() {
	   console.log('close!');
	};
	  
	  

	function resetModalMap(){
		leafletData.getMap('modalMap').then(function(map) {
			map.invalidateSize();
			window.console.log("map reset fired");
		});
	}

	angular.extend($scope, {
 	  layers: {
	      baselayers: {	
	        osm: {
	          name: 'OpenStreetMap',
		      url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		      type: 'xyz'
	        }
	      }
	  },
	  markers: {}
	});

	//////// END MODAL ///////

	$scope.upload_panel = true;
	$scope.upload_bar = false;


	function refreshMap(){ 
        leafletData.getMap('worldDetailMap').then(function(map) {
            setTimeout(function() {map.invalidateSize();}, 400);
        });
    }


  //add uploaded image as an overlay to map
	$scope.addOverlay = function(){
		
		$scope.upload_panel = false;
		$scope.resetMap();
		
		
		window.console.log("image uploaded to " + $('#preview_map').find('img').attr("src"));
		window.console.log("image width " + $('#preview_map').find('img').width());
		window.console.log("image height " + $('#preview_map').find('img').height());
		
		//setup image object to add to map
		var imageUrl = $('#preview_map').find('img').attr("src");
		var img_width = $('#preview_map').find('img').width();
		var img_height = $('#preview_map').find('img').height();
	
	    leafletData.getMap('modalMap').then(function(map) {
	    	window.console.log("map found");
	    	window.console.log(map);
				
				$scope.areaSelect = L.areaSelect({
				    width:img_width, 
				    height:img_height, 
				    keepAspectRatio:true
				});
				
				$scope.areaSelect.addTo(map);
				var bounds = $scope.areaSelect.getBounds();
				window.console.log("area select added to map");
				
				//add image overlay layer
				var image_layer = L.imageOverlay(imageUrl, bounds).addTo(map);
				window.console.log("image overlay added to map");
				
				// Get a callback when the bounds change
				$scope.areaSelect.on("change", function() {
				    map.removeLayer(image_layer);
				    image_layer = L.imageOverlay(imageUrl, this.getBounds()).addTo(map);
				});
				
				map.on('move', function(){
					this.removeLayer(image_layer);
				  image_layer = L.imageOverlay(imageUrl, $scope.areaSelect.getBounds()).addTo(map);
				});
		});

	}
  
  $scope.resetMap = function(){
	  leafletData.getMap('modalMap').then(function(map) {
			map.invalidateSize();
			window.console.log("map reset fired");
		});
  }
  

	$scope.buildMap = function(){

		console.log('building map: '+$scope.$parent.mapIMG);

		var coordBox;

		$scope.showMapBuilding = true;

		//get image geo coordinates, add to var to send
		leafletData.getMap('modalMap').then(function(map) {
			var bounds = $scope.areaSelect.getBounds();
		    var southEast = bounds.getSouthEast();
		    var northWest = bounds.getNorthWest();
		    var southWest = bounds.getSouthWest();
		    var northEast = bounds.getNorthEast();
			coordBox = {
		        worldID: $scope.worldID,
		        nw_loc_lng: northWest.lng,
		        nw_loc_lat: northWest.lat,
		        sw_loc_lng: southWest.lng,
		        sw_loc_lat: southWest.lat,
		        ne_loc_lng: northEast.lng,
		        ne_loc_lat: northEast.lat,
		        se_loc_lng: southEast.lng,
		        se_loc_lat: southEast.lat
		    };

		    console.log(coordBox);
		      
		    var coords_text = JSON.stringify(coordBox);

		    var data = {
		      mapIMG: $scope.mapIMG,
		      coords: coords_text
		    }
		    //build map
		    $http.post('/api/build_map', data).success(function(response){
		        
		    	//response = JSON.parse(response);
		        console.log(response.style.maps.localMapOptions.maxZoom);

		        $scope.showMapBuilding = false;
		        $scope.showMapBuilt = true;

		        $scope.mapping.type = 'both';
				
		  //       angular.extend($scope, {

			 // 	  layers: {
				//       baselayers: {	
				//         osm: {
	 		// 				url: 'http://107.170.180.141/maps/'+response.style.maps.localMapID+'/{z}/{x}/{y}.png',
				// 		    option: {
				// 			    attribution: 'IF',
				// 			    minZoom: response.style.maps.localMapOptions.minZoom,
				// 			    maxZoom: response.style.maps.localMapOptions.maxZoom,
				// 			    reuseTiles: true,
				// 			    tms:true
				// 		    },
				// 			  center: {
	
				// 			      zoom: response.style.maps.localMapOptions.maxZoom
				// 			  },

				//         }
				//       }
				//   }

				// });

				// leafletData.getMap('modalMap').then(function(map) {
		  //           setTimeout(function() {map.invalidateSize();}, 400);
		  //       });


		    });

		});

	}


  
	angular.element('#fileuploadmap').fileupload({
        url: '/api/upload_maps',
        dataType: 'text',
        progressall: function (e, data) {  

            $('#map_progress .bar').css('width', '0%');

            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#map_progress .bar').css(
                'width',
                progress + '%'
            );
        },
        done: function (e, data) {

            $('#uploaded_map').html('');
            $('#preview_map').html('');
            $('<p/>').text('Saved: '+data.originalFiles[0].name).appendTo('#uploaded_map');
            $('<img src="'+ data.result +'">').load(function() {
              $(this).appendTo('#preview_map').after($scope.addOverlay());
            });

            $scope.hideMapOptions = true; //hide map upload buttons

            $scope.$parent.mapIMG = data.result;
        }
	});




}


function UserCtrl($location, $scope, $routeParams, db, $rootScope) {
	$scope.userID = "53ab92d2ac23550e12600011";	
	$scope.username = "interfoundry";
	
	$scope.worlds = db.worlds.query({queryType:'all',userID:'539533e5d22c979322000001'}, function(data){
          console.log(data);
    });
}