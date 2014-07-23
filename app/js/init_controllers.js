
/* IF Controllers */

//searching for bubbles
function WorldRouteCtrl($location, $scope, $routeParams, db, $rootScope, apertureService) {

    angular.extend($rootScope, {loading: true});

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

            // Get the user's current position
            navigator.geolocation.getCurrentPosition(showPosition, locError, {timeout:50000});

            function showPosition(position) {

                var userLat = position.coords.latitude;
                var userLon = position.coords.longitude;
                //findWorlds(userLat, userLon);
                $location.path('w/Syracuse_Tech_Meetup');
            }

            function locError(){
                console.log('error finding loc');
                //geo error
            }

        } else {

            //no geo, go to plan b for geo loc here from IP?
            console.log('no geo');
            
        }

    //--------------//


    function findWorlds(lat,lon){   
     
        $scope.worlds = db.worlds.query({ localTime: new Date(), userCoordinate:[lon,lat]}, function(data){

            $rootScope.nearbyBubbles = data[0].liveAndInside;

            if (data[0].liveAndInside[0] != null) {
                if (data[0].liveAndInside[0].id){
                    $location.path('w/'+data[0].liveAndInside[0].id);
                }
                else {
                    console.log('world has no id');
                }
            }
            else {
                //?? profit
                angular.extend($rootScope, {loading: false});
                $scope.showCreateNew = true;
                console.log('no worlds');
            }
        });
    }

}
WorldRouteCtrl.$inject = [ '$location', '$scope', '$routeParams', 'db', '$rootScope','apertureService'];


//loads everytime
function indexIF($location, $scope, db, leafletData, $rootScope, apertureService, mapManager, $route, $routeParams, $timeout, $http,$q){

    $scope.aperture = apertureService; 
    $scope.map = mapManager;
    
	angular.extend($rootScope, {loading: false});
	
    //to refresh map after resize of leaflet map
    function refreshMap(){ 
        leafletData.getMap().then(function(map) {
            map.invalidateSize();
        });
    }

    //need both now?
    $scope.refreshMap = function(){ 
        leafletData.getMap().then(function(map) {
            map.invalidateSize();
        });
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

           console.log($rootScope.showLogout);
          
          $timeout(deferred.resolve, 0);
        }

        // Not Authenticated
        else {
          $rootScope.showLogout = false;
          $rootScope.message = 'You need to log in.';
          $timeout(function(){deferred.reject();}, 0);
          $location.url('/');
        }
      });

      return deferred.promise;
    };
    //================================================//


    //check if logged in
    checkLoggedin($q, $timeout, $http, $location, $rootScope);



    //----- MAP QUERY, TEMPORARY, for "show" page map icon click panel. needs to be directive ------//
    $scope.queryMap = function(type, cat){  

        window.scrollTo(0, 0);

        $rootScope.singleModel = 1;
        $rootScope.iconModel = cat;

        db.landmarks.query({ queryType: type, queryFilter: cat},

        function (data) {   //success

            angular.extend($rootScope, { 
                markers : {}
            });

            var markerCollect = {};

            var dumbVar = "'partial'";

            for (var i=0;i < data.length;i++){ 

                if (data[i].stats.avatar == "img/tidepools/default.jpg"){

                    if (data[i].subType == "bars"){
                        data[i].stats.avatar = "img/AICP/icons/bar.png";
                    }
                    if (data[i].subType == "exhibits"){
                        data[i].stats.avatar = "img/AICP/icons/coolsculpt.png";
                    }
                    if (data[i].subType == "food"){
                        data[i].stats.avatar = "img/AICP/icons/food.png";
                    }
                    if (data[i].subType == "smoking"){
                        data[i].stats.avatar = "img/AICP/icons/smoking.png";
                    }

                    if (data[i].subType == "washrooms"){
                        data[i].stats.avatar = "img/AICP/icons/washrooms.png";
                    }
                }

                markerCollect[data[i].id] = {
                    lat: data[i].loc[0],
                    lng: data[i].loc[1],
                    message: '<a href=#/post/'+data[i].id+'/m><h4 onclick="shelfPan('+dumbVar+');"><img style="width:70px;" src="'+data[i].stats.avatar+'"> '+data[i].name+'</h4></a>',
                    focus: true, 
                    icon: local_icons.yellowIcon
                }
            }

            //$rootScope.map.markers.push({ lat: data[i].loc[0], lng: data[i].loc[1], message: 'asdf', draggable: false }); 

            angular.extend($rootScope, {
                center: {
                    lat: data[0].loc[0],
                    lng: data[0].loc[1],
                    zoom: 18
                },
                markers: markerCollect,
                tiles: tilesDict.aicp
            });

        },
        function (data) {   //failure
            //error handling goes here
        });

    }


    //search query
    $scope.sessionSearch = function() { 
        $scope.landmarks = db.landmarks.query({queryType:"search", queryFilter: $scope.searchText});
    };

}
// indexIF.$inject = [ '$location', '$scope', 'db', 'leafletData','$rootScope', 'apertureService', 'mapManager'];

