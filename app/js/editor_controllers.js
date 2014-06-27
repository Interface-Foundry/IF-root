//parent
function WorldMakerCtrl($location, $scope, $routeParams, db, $rootScope, leafletData) {
	var worldDetailMap = leafletData.getMap('worldDetailMap');
	var bubbleCircle;
	
	$scope.userID = "53ab92d2ac23550e12600011";	
	$scope.username = "interfoundry";
	
	$scope.worldID = "53ab92d2ac23550e12600011";
	
	//init vars
	$scope.pageIndex = 0;
	$scope.pageClass = [];
	$scope.pageClass[0] = 'current';
	$scope.pageClass[1] = 'right';
	$scope.pageClass[2] = 'right';
	$scope.pageClass[3] = 'right';
	$scope.pageClass[4] = 'right';
	
	$scope.markers.m = {};
	
	$scope.mapConfirm = 'false';
	
    $scope.world = { 
        stats: { 
            avatar: "img/tidepools/default.jpg" 
        }
    };
	
	$scope.mapThemes = [
		{name:'urban'},
		{name:'fairy'},
		{name:'sunset'},
		{name:'arabesque'}
	];
	
	$scope.mapThemeSelect = $scope.mapThemes[0];
	
	$scope.markerOptions = [
		{name:'red'},
		{name:'orange'},
		{name:'yellow'},
		{name:'green'},
		{name:'blue'},
		{name:'purple'}
	];
	
	$scope.markerSelect = $scope.markerOptions[0];
	
	angular.extend($scope, {
		worldDetailPaths: {}
	});
	
	//custom elements, eventually replace with directives
	$('.color').spectrum({
		color: '#0000ff'
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

	function refreshMap(){ 
        leafletData.getMap('worldDetailMap').then(function(map) {
            map.invalidateSize();
        });
    }
      
    function locError(){
            console.log('no loc');
    }
    
    function loadWorld(){
		//init from world ID
		
    }
    
    function saveWorld(){
    	//set up json object w all attributes
    	//update object in database
    	
    	//todo only update things that have changed
    }
    
    
    
    if (navigator.geolocation) {
        // Get the user's current position
        navigator.geolocation.getCurrentPosition(showPosition, locError, {timeout:50000});
       
    }
}

function UserCtrl($location, $scope, $routeParams, db, $rootScope) {
	$scope.userID = "53ab92d2ac23550e12600011";	
	$scope.username = "interfoundry";
	
	$scope.worlds = db.worlds.query({queryType:'all',userID:'539533e5d22c979322000001'}, function(data){
          console.log(data);
      });
}