
/* IF Controllers */

//searching for bubbles
function WorldRouteCtrl($location, $scope, $routeParams, db, $rootScope, apertureService, styleManager, mapManager) {

    var map = mapManager;

    angular.extend($rootScope, {loading: true});
	  var style = styleManager;
	  style.resetNavBG();
	
    $scope.aperture = apertureService;  
    $scope.aperture.set('off');

	  console.log('world routing');
    
    $scope.initGeo = function() {
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

    $scope.initGeo();

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

            if (data[0].liveAndInside[0] != null) {
                if (data[0].liveAndInside[0].id){

                    $location.path('w/'+data[0].liveAndInside[0].id); 
                }
                else {
   
                    console.log('world has no id');
                    noWorlds(lat,lon);
                }
            }
            else {

                console.log('not inside any worlds');
                noWorlds(lat,lon); //not inside any worlds

            }
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


//loads everytime
function indexIF($location, $scope, db, leafletData, $rootScope, apertureService, mapManager, styleManager, alertManager, $route, $routeParams, $location, $timeout, $http,$q, $sanitize, $anchorScroll, $window) {
	console.log('init controller-indexIF');
    $scope.aperture = apertureService;
    $scope.map = mapManager;
    $scope.style = styleManager;
    $scope.alerts = alertManager;
    $rootScope.messages = [];
    //$rootScope.loadMeetup = false;
    
    angular.extend($rootScope, {globalTitle: "Bubbl.li"});
    angular.extend($rootScope, {navTitle: "Bubbl.li"})
	  angular.extend($rootScope, {loading: false});
	
	  
	$scope.search = function() {
		if ($scope.searchOn == true) {
			//call search
			console.log('searching');
			$location.path('/search/'+$scope.searchText);
			$scope.searchOn = false;
		} else {
			$scope.searchOn = true;
		}
	}  
	  
    // /!\ /!\ Change this to call to function in app.js instead /!\ /!\
    //================================================
    // Check if the user is connected
    //================================================
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){

      //============== Refresh page to show Login auth =====//
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/api/user/loggedin').success(function(user){

        // Authenticated
        if (user !== '0'){
              if (user._id){
                $rootScope.userID = user._id;
              }
              //determine name to display on login (should check for name extension before adding...)
              if (user.name){
                  $rootScope.userName = user.name;
              }
              else if (user.facebook){
                  $rootScope.userName = user.facebook.name;
              }
              else if (user.twitter){
                  $rootScope.userName = user.twitter.displayName;
              }
              else if (user.meetup){
                  $rootScope.userName = user.meetup.displayName;
              }
              else if (user.local){
                  $rootScope.userName = user.local.email;             
              }
              else {
                  $rootScope.userName = "Me";
              }
              
          $rootScope.avatar = user.avatar;
          $rootScope.showLogout = true;          
          $timeout(deferred.resolve, 0);
        }

        // Not Authenticated
        else {
          $rootScope.showLogout = false;
          $rootScope.message = 'You need to log in.';
          $timeout(function(){deferred.reject();}, 0);
        }
      });

      return deferred.promise;
    };
    //================================================//

    $scope.sendFeedback = function(){

        var data = {
          emailText: ('FEEDBACK:\n' + $sanitize($scope.feedbackText) + '\n===\n===\n' + $rootScope.userName)
        }

        $http.post('feedback', data).
          success(function(data){
            console.log('feedback sent');
            alert('Feedback sent, thanks!');

          }).
          error(function(err){
            console.log('there was a problem');
        });
        
        $scope.feedbackOn = false;
    };

    //check if logged in
    checkLoggedin($q, $timeout, $http, $location, $rootScope);
	
    //search query
    $scope.sessionSearch = function() { 
        $scope.landmarks = db.landmarks.query({queryType:"search", queryFilter: $scope.searchText});
    };
    

}

