
/* IF Controllers */

app.controller('WorldRouteCtrl', ['$location', '$scope', '$routeParams', 'db', '$rootScope', 'styleManager', 'mapManager', 'alertManager', 
function ($location, $scope, $routeParams, db, $rootScope, styleManager, mapManager, alertManager) {
	
var map = mapManager;
// map.resetMap();

angular.extend($rootScope, {loading: true});
var style = styleManager;
style.resetNavBG();

	var alert = alertManager;
	
$scope.aperture = apertureService;  
$scope.aperture.set('off');
    
$scope.initGeo = function() {

if (navigator.geolocation) {
	console.log('geolocation');
	function showPosition(position) {
		var userLat = position.coords.latitude;
		var userLon = position.coords.longitude;
		findWorlds(userLat, userLon); 
	}

	function locError(){
		console.log('error finding loc');
		//geo error
	}
	
	navigator.geolocation.getCurrentPosition(showPosition, locError, {timeout:15000, enableHighAccuracy : true});

    } else {
          console.log('no geo');
          alert('Your browser does not support geolocation :(');
		  }
    }

$scope.initGeo();

function findWorlds(lat,lon) {  
	console.log('findWorlds');
    //union square coordinates
    // var lat = 40.7356;
    // var lon =  -73.9906;
	$scope.worlds = db.worlds.query({ localTime: new Date(), userCoordinate:[lon,lat]}, function(data){
		$rootScope.altBubbles = data[0].liveAndInside;
		$rootScope.nearbyBubbles = data[0].live;
		//BEGIN SPOOKY TEST
		// TEMP DISABLED FOR SPOOKY
		if (data[0].liveAndInside[0] != null) {
            if (data[0].liveAndInside[0].id){
				$location.path('w/'+data[0].liveAndInside[0].id); 
				alert.addAlert('success', 'You found a bubble! Explore it below', true);
            } else {
				console.log('world has no id');
				noWorlds(lat,lon);
			}
        } else {
			console.log('not inside any worlds');
			noWorlds(lat,lon); //not inside any worlds
			alert.addAlert('info', 'No Bubbles here, but there are some nearby!', true);
		}
    });
}

function noWorlds(lat,lon) {

    map.setCenter([lon, lat + 0.012], 14, $scope.aperture.state);
	$scope.showCreateNew = true;
	//add markers to map
    angular.forEach($rootScope.nearbyBubbles, function(landmark) {
      	if (landmark.lat && landmark.lng){
		  	map.addMarker(landmark._id, {
		  	lat:landmark.lat,
		  	lng:landmark.lng,
		  	draggable:false,
		  	message:'<a href="#/w/'+landmark.id+'">'+landmark.name+'</a>',
		  	icon: {
	            iconUrl: 'img/marker/bubble-marker-50.png',
	            shadowUrl: '',
	            iconSize: [35, 67],
	            iconAnchor: [13, 10]
			}
			});  
		}
    });

}

$scope.addWorld = function (){
    $location.path( '/profile' );
};

function noLoc() {
  console.log('no loc');  
  $scope.showNoLoc = true;
  angular.extend($rootScope, {loading: false});
  $scope.$apply();
}
}]);


//searching for bubbles
function NearbyCtrl($location, $scope, $routeParams, db, $rootScope, apertureService, styleManager, mapManager, alertManager) {

    var map = mapManager;

    angular.extend($rootScope, {loading: true});
    var style = styleManager;
    style.resetNavBG();

    var alert = alertManager;
  
    $scope.aperture = apertureService;  
    $scope.aperture.set('off');

    console.log('world routing');
    
    $rootScope.initGeo = function() {
      //--- GEO LOCK -----//

      if (navigator.geolocation) {

        function showPosition(position) {
            var userLat = position.coords.latitude;
            var userLon = position.coords.longitude;
            findWorlds(userLat, userLon); 
        }

        function locError(){
            console.log('error finding loc');
            //geo error
            noLoc();
        }

        navigator.geolocation.getCurrentPosition(showPosition, locError, {timeout:15000, enableHighAccuracy : true});

      } else {
          console.log('no geo');
          alert('Your browser does not support geolocation :(');
      }
    }

    $rootScope.initGeo();

    function noLoc(){
      console.log('no loc');  
      $scope.showNoLoc = true;
      angular.extend($rootScope, {loading: false});
      $scope.$apply();
    }

    function findWorlds(lat,lon){   
     
     console.log('findWorlds');
        $scope.worlds = db.worlds.query({ localTime: new Date(), userCoordinate:[lon,lat]}, function(data){

            $rootScope.altBubbles = data[0].liveAndInside;
            $rootScope.nearbyBubbles = data[0].live;

            noWorlds(lat,lon); //not inside any worlds
            alert.addAlert('success', 'Explore bubbles around you', true);

        });
    }

    function noWorlds(lat,lon){

        map.setCenter([lon, lat], 14, $scope.aperture.state);

        console.log('no worlds');  
        $scope.showCreateNew = true;
        angular.extend($rootScope, {loading: false});

        //add markers to map


        angular.forEach($rootScope.nearbyBubbles, function(landmark) {
         
          if (landmark.lat && landmark.lng){

                map.addMarker(landmark._id, {
                  lat:landmark.lat,
                  lng:landmark.lng,
                  draggable:false,
                  message:'<a href="#/w/'+landmark.id+'">'+landmark.name+'</a>',
                  icon: {
                    iconUrl: 'img/marker/bubble-marker-50.png',
                    shadowUrl: '',
                    iconSize: [35, 67],
                    iconAnchor: [13, 10]
                  }
                });  

               

          }
          

        });

    }

    $scope.addWorld = function (){
      $location.path( '/profile' );
    };

}
