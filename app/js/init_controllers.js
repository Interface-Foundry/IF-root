
/* IF Controllers */

//searching for bubbles
function WorldRouteCtrl($location, $scope, $routeParams, db, $rootScope, apertureService, styleManager) {

    angular.extend($rootScope, {loading: true});
	var style = styleManager;
	style.resetNavBG();
	
    $scope.aperture = apertureService;  
    $scope.aperture.set('off');

	console.log('world routing');
    //WIDGET find data and then route to correct bubble
    // var today = new Date();
    // var dd = today.getDate();
    // var mm = today.getMonth()+1; //January is 0!

    // var yyyy = today.getFullYear();
    // if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} var today = dd+'/'+mm+'/'+yyyy;
 
    // if (today === '10/06/2014'){
    //     $location.path('awards');    
    // }

    // else if (today === '11/06/2014'){
    //     $location.path('lectures');
    // }

    // else if (today === '12/06/2014'){
    //     $location.path('show');
    // }

    // else {
    //     $location.path('awards');
    // }

    

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

    //--------------//

    function noLoc(){
      
      console.log('no loc');  


      $scope.showNoLoc = true;
      angular.extend($rootScope, {loading: false});
      $scope.$apply();
    }

    function findWorlds(lat,lon){   
     
        $scope.worlds = db.worlds.query({ localTime: new Date(), userCoordinate:[lon,lat]}, function(data){

            $rootScope.altBubbles = data[0].liveAndInside;
            $rootScope.nearbyBubbles = data[0].live;

            if (data[0].liveAndInside[0] != null) {
                if (data[0].liveAndInside[0].id){

                    //-------- DISABLE AFTER DEMO ------//
                    $location.path('/w/StartFast_Demo_Day_2014');

                    ///-------- ENABLE AFTER DEMO ------//
                    //$location.path('w/'+data[0].liveAndInside[0].id); 
                }
                else {
                    //-------- DISABLE AFTER DEMO ------//
                    $location.path('/w/StartFast_Demo_Day_2014');

                    ///-------- ENABLE AFTER DEMO ------//
                    //console.log('world has no id');
                    //noWorlds();
                }
            }
            else {

                //-------- DISABLE AFTER DEMO ------//
                $location.path('/w/StartFast_Demo_Day_2014');

                //-------- ENABLE AFTER DEMO ------//
                //console.log('not inside any worlds');
                //noWorlds(); //not inside any worlds

            }
        });
    }

    function noWorlds(){


     //-------- DISABLE AFTER DEMO ------//
      // angular.extend($rootScope, {loading: false});
      // $location.path('/w/Startfast_Demo_Day'); 


      //-------- ENABLE AFTER DEMO ------//
        console.log('no worlds');  
        $scope.showCreateNew = true;
        angular.extend($rootScope, {loading: false});
    }

}
//WorldRouteCtrl.$inject = [ '$location', '$scope', '$routeParams', 'db', '$rootScope','apertureService'];


//loads everytime
function indexIF($location, $scope, db, leafletData, $rootScope, apertureService, mapManager, styleManager, $route, $routeParams, $location, $timeout, $http,$q, $sanitize, $anchorScroll) {
	console.log('init controller-indexIF');
    $scope.aperture = apertureService;
    $scope.map = mapManager;
    $scope.style = styleManager;
    $rootScope.messages = [];
    
    
    angular.extend($rootScope, {globalTitle: "Bubbl.li"});
	angular.extend($rootScope, {loading: false});
	
	$scope.$on('$viewContentLoaded', function() {
		document.getElementById("wrap").scrollTop = 0
	});
	  
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
              //determine name to display on login (should check for name extension before adding...)
              if (user.facebook){
                  $rootScope.userName = user.facebook.name;
              }
              else if (user.twitter){
                  $rootScope.userName = user.twitter.displayName;
              }
              else if (user.local){
                  $rootScope.userName = user.local.email;             
              }
              else {
                  $rootScope.userName = "Me";
              }

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

