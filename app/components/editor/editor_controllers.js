
function WorldMakerCtrl($location, $scope, $routeParams, db, $rootScope, leafletData, leafletEvents, apertureService, $http) {
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
		{name:'urban'},
		{name:'fairy'},
		{name:'sunset'},
		{name:'arabesque'}
	];
	
	$scope.mapping.mapThemeSelect = $scope.mapThemes[0];
	
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

    

    $scope.buildMap = function(){

        //fake data r/n
        var coordBox = {
            worldID: '53c4a0ab0ee5d8ccfa68a034',
            nw_loc_lng: -73.99749,
            nw_loc_lat:  40.75683,
            sw_loc_lng: -73.99749,
            sw_loc_lat:   40.7428,
            ne_loc_lng: -73.98472,
            ne_loc_lat:  40.75683,
            se_loc_lng: -73.98472,
            se_loc_lat:   40.7428
        };

        var coords_text = JSON.stringify(coordBox);

        var data = {
          mapIMG: $scope.mapIMG,
          coords: coords_text
        }

        $http.post('/api/build_map', data).success(function(response){
            console.log(response);
        });

    }

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

            console.log(userLat);

            $scope.center = {
                    lat: userLat,
                    lng: userLon,
                    zoom: 15
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

        $scope.world.loc.coordinates = [$scope.markers.m.lng, $scope.markers.m.lat];

        $scope.world.userID = $scope.userID;

        //edit world
        if (option == 'edit'){
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

        	db.worlds.create($scope.mapping, function(response){
	        	console.log(response);
	        });  

        }

        //new world
        if (option === undefined) {
        	console.log('saveWorld()');
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
	

	$scope.myData = {
	    link: "http://google.com",
	    modalShown: false,
	    hello: 'world',
	    foo: 'bar'
	}
	 
	$scope.logClose = function() {
	   console.log('close!');
	};
	  
	  
	  $scope.toggleModal = function() {
	    console.log("toggle modal fired");
	    $scope.myData.modalShown = !$scope.myData.modalShown;
	    $timeout(resetModalMap(), 5000);
	  };
	  
	  function resetModalMap(){
		  leafletData.getMap('modalMap').then(function(map) {
				map.invalidateSize();
				window.console.log("map reset fired");
			});
	  }
}

function MapModalCtrl($scope, $log, leafletData) {

	$scope.upload_panel = true;
	$scope.upload_bar = false;

	angular.extend($scope, {
		center: {
	      lat: 40.7127,
	      lng: -74.0059,
	      zoom: 18
	  },
	  markers: {},
 		layers: {
      baselayers: {	
        osm: {
          name: 'OpenStreetMap',
	        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	        type: 'xyz'
        }
      }
	  }
	});

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
  
  $scope.printBounds = function(){
	  leafletData.getMap('modalMap').then(function(map) {
			var bounds = $scope.areaSelect.getBounds();
			alert("Image bounds are " + JSON.stringify(bounds));
/* 			$scope.myData.modalShown = !$scope.myData.modalShown; */
		});
  }
  
  //run when modal loads
	$scope.loadMe = function () {
	
		$scope.resetMap();
/* 			$scope.myData.modalShown = !$scope.myData.modalShown; */
		  //map modal upload
		  
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
	                  
	            $scope.$parent.mapIMG = data.result;
	        }
    	});


		 /* angular.element('#fileuploadmap').fileupload({
		      url: '/api/upload_maps',
		      dataType: 'text',
		      progressall: function (e, data) {  
		          $('#map_progress .bar').css('width', '0%');
		          var progress = parseInt(data.loaded / data.total * 100, 10);
		          $('#map_progress .bar').show();
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
		            $(this).appendTo('#preview_map').after( $scope.addOverlay());
		          });
		          //$scope.world.stats.avatar = data.result;
		      }
		  });//fileupload*/
	  }//loadMe
};//mapmodalctrl


function UserCtrl($location, $scope, $routeParams, db, $rootScope) {
	$scope.userID = "53ab92d2ac23550e12600011";	
	$scope.username = "interfoundry";
	
	$scope.worlds = db.worlds.query({queryType:'all',userID:'539533e5d22c979322000001'}, function(data){
          console.log(data);
    });
}