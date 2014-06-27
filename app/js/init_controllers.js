
/* IF Controllers */

function WorldRouteCtrl($location, $scope, $routeParams, db) {

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

                userLat = position.coords.latitude;
                userLon = position.coords.longitude;
                findWorlds(userLat, userLon);
                //use locate.path()
            }

            function locError(){

                //geo error
            }

        } else {

            //no geo
            
        }

    //--------------//


    function findWorlds(lat,lon){

        $scope.worlds = db.worlds.query({ localTime: new Date(), userCoordinate:[lon,lat]}, function(data){
            console.log(data);
            if (data[0].liveAndInside > 0) {
              console.log(data[0].liveAndInside[0].id);
            }
            else {
                //?? profit
            }
        });
    }

}
WorldRouteCtrl.$inject = [ '$location', '$scope', '$routeParams', 'db'];


function indexIF($location, $scope, db, $timeout, leafletData, $rootScope){

    var backMarkCount = 0;

    $scope.goBack = function(){

        shelfPan('return');
        $rootScope.showSwitch = true;
        $rootScope.showBack = false;
        $rootScope.showMapNav = false;
        $rootScope.showNavIcons = false;
        $rootScope.hideIFbar = false;
    }

    $scope.goBackPage = function(){

        $rootScope.showBackPage = false;
        $rootScope.showMapNav = false;
        window.history.back();
        shelfPan('return');
        $rootScope.showNavIcons = false;   
        $rootScope.hideIFbar = false;   
    }

    $scope.goBackMarkers = function(){

        $rootScope.showBackMark = false;
        $rootScope.showBackPage = true;
        $rootScope.showMapNav = true;
        shelfPan('full','navbar');
        refreshMap();
        $rootScope.showNavIcons = true;
        $rootScope.hideIFbar = true;

        //stopping getting locked in "back" clicks on /show/view
        // backMarkCount++;
        // if (backMarkCount > 1){
        //     $location.path('show');
        //     backMarkCount = 0;
        // }
    }
    
    //this is temporary cause w/out leaflet won't render??
    angular.extend($rootScope, {
        center: {
            // lat: 40.7615,
            // lng: -73.9777,
            // zoom: 11
        },
        tiles: tilesDict.mapbox,
        markers : {}
    });

    //for bubble widget switcher
    $scope.goPath = function(url){
        shelfPan('return');
        $location.path(url);
    };

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
indexIF.$inject = [ '$location', '$scope', 'db', '$timeout','leafletData','$rootScope'];

