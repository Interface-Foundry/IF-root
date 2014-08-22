//parent
function WorldMakerCtrl($location, $scope, $routeParams, db, $rootScope, leafletData) {
	var worldDetailMap = leafletData.getMap('worldDetailMap');
	var bubbleCircle;
	
	$scope.userID = "53ab92d2ac23550e12600011";	
	$scope.username = "interfoundry";
	$scope.worldID;
	$scope.worldURL;
	$scope.styleID;
	$scope.projectID;

	//init vars
	$scope.pageIndex = 0;
	$scope.pageClass = [];
	$scope.pageClass[0] = 'current';
	$scope.pageClass[1] = 'right';
	$scope.pageClass[2] = 'right';
	$scope.pageClass[3] = 'right';
	$scope.pageClass[4] = 'right';
	
	
	$scope.mapConfirm = 'false';
	
    $scope.world = { 
        stats: { 
            avatar: "img/tidepools/default.jpg" 
        }
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
	
	angular.extend($scope, {
		worldDetailPaths: {}
	});
	
	//custom elements, eventually replace with directives
	$('.color').spectrum({
		clickoutFiresChange: true
	});
	
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
            $scope.world.stats.avatar = data.result;
        }
    });

	$scope.nextPage = function () {
		if ($scope.pageIndex<($scope.pageClass.length-1)) {
			$scope.pageClass[$scope.pageIndex] = 'left';
			if ($scope.pageIndex == 0){ //making new world after first page
				if (!$scope.worldID){ //new world
					saveWorld(); 
				}
				else { //edit created world
					saveWorld('edit');
				}	
			}
			if ($scope.pageIndex == 1){ //adding/editing world map settings
				saveWorld('map');	
			}

			if ($scope.pageIndex == 3){ //editing style. needs to be moved back one page to "2"
				saveStyle();
			}
			$scope.pageIndex += 1;
			$scope.pageClass[$scope.pageIndex] = 'current';
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
		console.log($scope.mapConfirm);
		if ($scope.mapConfirm) {
			//position is locked
			$scope.markers.m.draggable = false;
			console.log($scope.markers.m.lat);
			console.log($scope.markers.m.lng);
			$scope.worldDetailPaths = {};
			$scope.worldDetailPaths['circle'] = {
					type: "circle",
					radius: 5000,
					latlngs: {lat: $scope.markers.m.lat, lng: $scope.markers.m.lng}
				};
			} else {
			//position is movable
			$scope.markers.m.draggable = true;
		}	
	};
	
	function refreshMap(){ 
        leafletData.getMap('worldDetailMap').then(function(map) {
            map.invalidateSize();
        });
    }
      

	function showPosition(position) {

            userLat = position.coords.latitude;
            userLon = position.coords.longitude;

            console.log(userLat);

            $scope.center = {
                    lat: userLat,
                    lng: userLon,
                    zoom: 12
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
    	$scope.hasTime = false;

    	//if no end date added, use start date


        // if (!$scope.world.date.end){
        //     $scope.world.date.end = $scope.world.date.start;
        // }

        // $scope.world.datetext = {
        //     start: $scope.world.date.start,
        //     end: $scope.world.date.end
        // }
        // //---- Date String converter to avoid timezone issues...could be optimized probably -----//
        // $scope.world.date.start = new Date($scope.world.date.start).toISOString();
        // $scope.world.date.end = new Date($scope.world.date.end).toISOString();

        // $scope.world.date.start = dateConvert($scope.world.date.start);
        // $scope.world.date.end = dateConvert($scope.world.date.end);

        // $scope.world.date.start = $scope.world.date.start.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1'); //rearranging so value still same in input field
        // $scope.world.date.end = $scope.world.date.end.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1');

        // function dateConvert(input){
        //     var s = input;
        //     var n = s.indexOf('T');
        //     return s.substring(0, n != -1 ? n : s.length);
        // }
        // //-----------//

        // if (!$scope.world.time.start){
        //     $scope.world.time.start = "00:00";
        // }

        // if (!$scope.world.time.end){
        //     $scope.world.time.end = "23:59";
        // }

        // $scope.world.timetext = {
        //     start: $scope.world.time.start,
        //     end: $scope.world.time.end
        // } 
        //------- END TIME --------//

        

        $scope.world.loc = [$scope.markers.m.lat,$scope.markers.m.lng];

        $scope.world.userID = $scope.userID;

        //edit world
        if (option == 'edit'){

        	$scope.world.newStatus = false; //not new
        	$scope.world.worldID = $scope.worldID;
	        db.worlds.create($scope.world, function(response){
	        	console.log(response);
	        });  
        }

        //adding/editing map theme options to world 
        else if (option == 'map'){
        	$scope.mapping.editMap = true; //adding/editing world map

        	$scope.mapping.worldID = $scope.worldID;

        	db.worlds.create($scope.mapping, function(response){
	        	console.log(response);
	        });  

        }

        //new world
        else {
        	$scope.world.newStatus = true; //new
	        db.worlds.create($scope.world, function(response){
	        	$scope.worldID = response[0].worldID;
	        	$scope.projectID = response[0].projectID;
	        	$scope.styleID = response[0].styleID;
	        	$scope.worldURL = response[0].worldURL;
	        	console.log($scope.worldURL);
	        });       	
        }

    
    }

    function saveStyle(){
    	$scope.styles.styleID = $scope.styleID;
	    db.styles.create($scope.styles, function(response){
        	console.log(response);
        });  
    }

    function saveProject(){
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
	    $scope.myData.modalShown = !$scope.myData.modalShown;
	  };
	 }

function UserCtrl($location, $scope, $routeParams, db, $rootScope) {
	$scope.userID = "53ab92d2ac23550e12600011";	
	$scope.username = "interfoundry";
	
	$scope.worlds = db.worlds.query({queryType:'all',userID:'539533e5d22c979322000001'}, function(data){
          console.log(data);
    });
}