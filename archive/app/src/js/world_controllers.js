// function WorldHomeCtrl( $location, $scope, db, $timeout, leafletData) {


//     if (navigator.geolocation) {

//         // Get the user's current position
//         navigator.geolocation.getCurrentPosition(showPosition, locError, {timeout:50000});

//         function showPosition(position) {


//             userLat = position.coords.latitude;
//             userLon = position.coords.longitude;


//             // angular.extend($scope, {
//             //     center: {
//             //         lat: userLat,
//             //         lng: userLon,
//             //         zoom: 18
//             //     },
//             //     tiles: tilesDict.mapbox
//             // });

//             findBubbles(userLat, userLon);
//         }

//         function locError(){

//             //geo error

//             console.log('no loc');
//         }

//     } else {

//         //no geo
        
//     }

//     function findBubbles (userLat, userLon) {

//         console.log(userLon);
//         console.log(userLat);

//         $scope.landmarks = db.bubbles.query({ lat: userLat, lon: userLon, queryType:"inside" }, function(landmark){
//             console.log(landmark);

//             // if (inside bubble {})

//             // else {
//             //     //show bubble
//             // }
//         });




//         //IF USER NOT INSIDE BUBBLE, HIDE LOADER SCREEN AND SHOW NEARBY BUBBLES ON MAP. INDEX CARD ON BOTTOM. BUBBLES ON SIDES SHOW BUBBLE LOGOS

//          // $scope.bubbles = Bubble.get({_id: "asfd"}, function(landmark) {
//          //    console.log(landmark);
//          // });
        
//     }

//     $scope.goBack = function(){
//         //$scope.showBeyonce = false;
//         //$scope.showCamp = false;
//         $scope.showHome = true;

//     }

//     $scope.shelfUpdate = function(type){
        
//         if ($scope.shelfUpdate == type){

//             $scope.shelfUpdate = 'default';

//         }

//         else {
//             $scope.shelfUpdate = type;
//         }

//     }

//     // //---- Initial Query on Page Load -----//
//     // $scope.queryType = "all";
//     // $scope.queryFilter = "all";
//     // //Events Now example:
//     // // $scope.queryType = "events";
//     // // $scope.queryFilter = "now";

//     // $scope.landmarks = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter });

//     //---------//

//     //------- For Switching Button Classes ------//
//     $scope.items = ['all', 'events','places','search']; //specifying types, (probably better way to do this)
//     $scope.selected = $scope.items[0]; //starting out with selecting EVENTS 

//     $scope.select= function(item) {
//        $scope.selected = item; 
//     };

//     $scope.itemClass = function(item) {
//         return item === $scope.selected ? 'btn btn-block btn-lg btn-inverse' : 'btn';
//     };
//     //---------------------------//


//     //query function for all sorting buttons
//     $scope.filter = function(type, filter) {
//         $scope.landmarks = db.landmarks.query({ queryType: type, queryFilter: filter });
//     };

//     $scope.goTalk = function(url) {
//       $location.path('talk/'+url);
//     };

//     $scope.goTalkList = function(url) {
//       $location.path('talk');
//     };

//     $scope.goMap = function(url) {
//       $location.path('map/'+url);
//     };

//     $scope.goNew = function() {
//         $location.path('new');
//     };

//     //search query
//     $scope.sessionSearch = function() { 
//         $scope.landmarks = db.landmarks.query({queryType:"search", queryFilter: $scope.searchText});
//     };

// }
// WorldHomeCtrl.$inject = [ '$location', '$scope', 'db', '$timeout','leafletData'];




function WorldViewCtrl( World, $routeParams, $scope, db, $location, $timeout, leafletData, $route, $rootScope ) {


    if ($routeParams.option == 'm'){

    }

    else {
        shelfPan('closed');
    }


    if ($routeParams.option == 'new'){

        // leafletData.getMap().then(function(map) {
        //     map.invalidateSize();
        // });

        // $scope.$apply();
    }


    angular.extend($rootScope, { 
        markers : {}
    });

  
    $scope.option = $routeParams.option;

    $scope.landmark = World.get({_id: $routeParams.worldID}, function(landmark) {

        //CHANGE HTML TITLE HEADER ++ META DATA

        console.log(landmark);

        $scope.mainImageUrl = landmark.stats.avatar;
        $scope.time = "all";
        $scope.currentTag = $scope.landmark.tags;
        $scope.tweets = db.tweets.query({tag: $scope.landmark.tags, time:$scope.time});


        var markerList = {
            "m" : {
                lat: $scope.landmark.loc[0],
                lng: $scope.landmark.loc[1],
                message: '<h4><img style="width:70px;" src="'+ landmark.stats.avatar +'"><a href=#/landmark/'+ $routeParams.landmarkId +'/m> '+landmark.name+'</a></h4>',
                focus: true,
                icon: local_icons.yellowIcon
            }
        };


        angular.extend($rootScope, {
            center: {
                lat: $scope.landmark.loc[0],
                lng: $scope.landmark.loc[1],
                zoom: 16
            },
            markers: markerList
        });


        // WRITE IN ERROR HANDLER HERE IF BUBBLE DOESN"T EXIST

    });

    $scope.open = function () {
        $scope.etherpad = true;
    };

    $scope.close = function () {
        $scope.etherpad = false;
    };

    $scope.opts = {
        backdropFade: true,
        dialogFade:true
    };

    $scope.setImage = function(imageUrl) {
        $scope.mainImageUrl = imageUrl;
    }

    $scope.goBack = function(){
        window.history.back();
        shelfPan('return');
    }

    $scope.edit = function(){
        $location.path('/landmark/'+$routeParams.landmarkId+'/edit');
    }


}
WorldViewCtrl.$inject = ['World', '$routeParams', '$scope', 'db', '$location','$timeout','leafletData', '$route','$rootScope'];



function LandmarkViewCtrl(Landmark, $routeParams, $scope, db, $location, $timeout, leafletData, $route, $rootScope, $sce) {  

    $rootScope.showSwitch = false;
    $rootScope.showBackPage = true;
    $rootScope.showNavIcons = false;

    window.scrollTo(0, 0);

    //nicknames of places, temporary for AICP
    var geoLocs = {
        "BASECAMP" : [40.7215408, -73.9967013],
        "SKIRBALL" : [40.7297, -73.9978],
        "MoMA" : [40.7615, -73.9777],
        "NYC" : [40.7127, -74.0059]
    }

    //map zoom value on landmark click
    var geoZoom = 16;

    //hiding bubble switcher and showing map nav instead
    $scope.showMapNav = function(){
        if ($rootScope.showMapNav == true){      
            $rootScope.showMapNav = false;
            shelfPan('partial');     
        }
        else {       
            $rootScope.showMapNav = true;      
        }
    }

    //special case for in map clicking - not sustainable 
    if ($routeParams.option == 'm'){
        shelfPan('partial');
        $rootScope.showSwitch = false;
        $rootScope.showBackPage = false;
        $rootScope.showBack = false;
        $rootScope.showMapNav= false;
        $rootScope.showBackMark = true;
        $rootScope.hideIFbar = false;
    }

    else {
        shelfPan('partial');
        angular.extend($rootScope, { 
            markers : {}
        });

    }

    $scope.option = $routeParams.option;

    //query individual landmark
    $scope.landmark = Landmark.get({_id: $routeParams.landmarkId}, function(landmark) {

        if (landmark.stats.avatar){
            if (landmark.stats.avatar !== "img/tidepools/default.jpg"){
                $scope.mainImageUrl = landmark.stats.avatar;
            }
        }

        //making these fields into raw HTML allowed (trustable?)
        $scope.people = landmark.people;
        $scope.description = landmark.description;

        //add landmark to map
        processLandmark(landmark);

        //widget plugin
        //if there's a sub hashtag for this object, query for tweets
        if ($scope.landmark.tags){
            $scope.time = "all";
            $scope.currentTag = $scope.landmark.tags;
            $scope.tweets = db.tweets.query({tag: $scope.landmark.tags, time:$scope.time});
        }

    });

    
    //after query, do map plot
    function processLandmark(landmark){


        //ALL "EVENTS" such as lectures, ARE PROCESSED WITH MAPBOX RIGHT NOW, needs to use map tile option in CMS!
        if (landmark.type == "event"){

            // FOR PLACES USING A NICKNAME, such as "MoMA" - called from user specific nickhame list
            if (geoLocs[landmark.loc_nickname]){
                
                angular.extend($rootScope, {
                    center: {
                        lat: geoLocs[landmark.loc_nickname][0],
                        lng: geoLocs[landmark.loc_nickname][1],
                        zoom: geoZoom,
                        autoDiscover:false
                    },
                    markers: {
                        "m": {
                            lat: geoLocs[landmark.loc_nickname][0],
                            lng: geoLocs[landmark.loc_nickname][1],
                            message: '<h4>'+landmark.loc_nickname+'</h4>',
                            focus: true,
                            icon: local_icons.yellowIcon
                        }
                    },
                    tiles: tilesDict.mapbox
                });

                refreshMap();
            }

            //no nickname, use default map place (change to be "default area nearby bubble, not NYC")
            else{
                angular.extend($rootScope, {
                    center: {
                        lat: geoLocs['NYC'][0],
                        lng: geoLocs['NYC'][1],
                        zoom: geoZoom
                    },
                    markers: {
                        "m": {
                            lat: geoLocs['NYC'][0],
                            lng: geoLocs['NYC'][1],
                            message: '<h4>NYC</h4>',
                            focus: true,
                            icon: local_icons.yellowIcon
                        }
                    },
                    tiles: tilesDict.mapbox
                });

                refreshMap();
            }
        }


        // if place, PLOTTING TO AICP MAP right now - change to CMS map chooser
        if (landmark.type == "place"){

            //if parameter has "m" - temp fix for in map icon navigating between icons
            if ($routeParams.option == 'm'){

                // FOR MOMA MAP STUFF
                angular.extend($rootScope, {
                    center: {
                        lat: landmark.loc[0],
                        lng: landmark.loc[1],
                        zoom: 19, 
                        autoDiscover: false
                    },
                    tiles: tilesDict.aicp
                }); 
                refreshMap(); 
            }

            else { 
                // FOR MOMA MAP STUFF
                angular.extend($rootScope, {
                    center: {
                        lat: landmark.loc[0],
                        lng: landmark.loc[1],
                        zoom: 19,
                        autoDiscover:false
                    },
                    markers: {
                        "m": {
                            lat: landmark.loc[0],
                            lng: landmark.loc[1],
                            message: '<h4><img style="width:70px;" src="'+landmark.stats.avatar+'"><a href=#/post/'+landmark.id+'/m> '+landmark.name+'</a></h4>',
                            focus: false,
                            icon: local_icons.yellowIcon
                        }
                    },
                    tiles: tilesDict.aicp
                }); 

                refreshMap();  
            }
        }
    }

    $scope.setImage = function(imageUrl) {
        $scope.mainImageUrl = imageUrl;
    }

    $scope.goBack = function(){
        window.history.back();
        shelfPan('return');
    }

    $scope.edit = function(){
        $location.path('/landmark/'+$routeParams.landmarkId+'/edit');
    }

    function refreshMap(){ 
        leafletData.getMap().then(function(map) {
            map.invalidateSize();
        });
    }

}
LandmarkViewCtrl.$inject = ['Landmark', '$routeParams', '$scope', 'db', '$location','$timeout','leafletData', '$route','$rootScope','$sce'];



function AwardsCtrl( $location, $scope, db, $timeout, leafletData, $rootScope) {

    shelfPan('return');
    window.scrollTo(0, 0);

    ///// TIME STUFF /////

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} var today = dd+'/'+mm+'/'+yyyy;

    var eventDate = 10;

    if (eventDate == dd){
        $scope.itisToday = true;
    }
    ////////////////////

    //fixing back button showing up glitches
    $rootScope.showBack = false;
    $rootScope.showBackPage = false;
    $rootScope.showBackMark = false;
    $rootScope.hideIFbar = false;
    $rootScope.showNavIcons = false;
    $rootScope.showMapNav = false;


    ///// TEMP MAP STUFF ///////
    var geoLocs = {
        "BASECAMP" : [40.7215408, -73.9967013],
        "SKIRBALL" : [40.7297, -73.9978]
    }

    angular.extend($rootScope, { 
        markers : {}
    });


    angular.extend($rootScope, {
        center: {
            lat: 40.7250,
            lng: -73.9970,
            zoom: 14
        },
        tiles: tilesDict.mapbox,
        markers : {       
            "b": {
                lat: geoLocs["SKIRBALL"][0],
                lng: geoLocs["SKIRBALL"][1],
                message: '<h4>SKIRBALL</h4>',
                focus: false,
                icon: local_icons.yellowIcon
            }, 
            "a": {
                lat: geoLocs["BASECAMP"][0],
                lng: geoLocs["BASECAMP"][1],
                message: '<h4>BASECAMP</h4>',
                focus: true,
                icon: local_icons.yellowIcon
            }     
        }
    });

    refreshMap();

    function refreshMap(){ 
        leafletData.getMap().then(function(map) {
            map.invalidateSize();
        });
    }
    /////////////////////


    $rootScope.showSwitch = true;
    $rootScope.radioModel = 'Tuesday'; //for bubble switcher selector


    $scope.tweets = db.tweets.query({limit:1});
    $scope.instagrams = db.instagrams.query({limit:1});


    //hiding bubble switcher and showing map nav instead
    $scope.hideSwitch = function(){
        if ($rootScope.showSwitch == true){
            $rootScope.showSwitch = false;
            $rootScope.showBack = true;
        }

        else {
            $rootScope.showSwitch = true;
            $rootScope.showBack = false;
        }
    }

    $rootScope.goBack = function(){
        window.history.back();
    }

    $scope.shelfUpdate = function(type){     
        if ($scope.shelfUpdate == type){
            $scope.shelfUpdate = 'default';
        }
        else {
            $scope.shelfUpdate = type;
        }
    }

    $scope.refreshMap = function(){ 
        leafletData.getMap().then(function(map) {
            map.invalidateSize();
        });
    }

    //---- EVENT CARDS WIDGET -----//
    var queryCat = "award";

    //---- Happening Now -----//
    $scope.queryType = "events";
    $scope.queryFilter = "now";
    $scope.queryCat = queryCat;
    //$scope.queryTime = new Date();
    // ADD FAKE TIME FROM UNIVERSAL VAR TO NEW DATE!

    //////// WIDGET -- show now + upcoming. if before or after upcoming, then display all /////
    // THIS NEEDS TO BE CONDENSED into one query to server with a breakdown response of:

    /*
    {
        "now":{
    
        },
        "upcoming":{
    
        },
        "all":{
    
        }
    }
    */ 

    // SEND DATE to server
    $scope.landmarksNow = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, queryCat: $scope.queryCat}, function(){
        
        console.log("NOW");
        console.log($scope.landmarksNow);

        //IF THERE'S A NOW OBJECT 
        if ($scope.landmarksNow[0]){
            //passing now result as temporary DOESNT SCALE
            queryUpcoming($scope.landmarksNow[0].time.end);
        }

        // NO NOW OBJECT
        else {
            queryUpcoming("noNow");
        }
    });

    //---------//

    function queryUpcoming(nowTimeEnd){
        
        if (nowTimeEnd == "noNow"){

            //if still day of event, not another day
            if (dd == eventDate){

                $scope.upcomingLimit = 2;

                //---- Upcoming -----//
                $scope.queryType = "events";
                $scope.queryFilter = "upcoming";
                $scope.queryCat = queryCat;

                $scope.landmarksUpcoming = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, queryCat: $scope.queryCat, nowTimeEnd: "upcomingToday"},function(data){
                    
                    console.log("UPCOMING");
                    console.log(data);
                    //no more events for that day    
                    if (data.length == 0) {
                        // console.log("asdfasdf");
                        queryHappened();
                    }
                });     
            }

            else {
                queryHappened();
            }   
        }

        else {

            $scope.upcomingLimit = 1;

            //---- Upcoming -----//
            $scope.queryType = "events";
            $scope.queryFilter = "upcoming";
            $scope.queryCat = queryCat;

            $scope.landmarksUpcoming = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, queryCat: $scope.queryCat, nowTimeEnd: nowTimeEnd},function(){
            
                console.log("UPCOMING");
                console.log($scope.landmarksUpcoming);

            });     

        }
        //---------// 
    }

    function queryHappened(){

        $scope.happenedLimit = 10;

        //---- Happened -----//
        $scope.queryType = "events";
        $scope.queryFilter = "all"; 
        $scope.queryCat = queryCat;

        $scope.landmarksHappened = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, queryCat: $scope.queryCat},function(){
            console.log('HAPPENED');
            console.log($scope.landmarksHappened);
        });

        //---------//
    }

    //------------------------//


    //query function for all sorting buttons
    $scope.filter = function(type, filter) {
        $scope.landmarks = db.landmarks.query({ queryType: type, queryFilter: filter });
    };

    $scope.goTalk = function(url) {
      $location.path('talk/'+url);
    };

    $scope.goTalkList = function(url) {
      $location.path('talk');
    };

    $scope.goVote = function(url) {
      $location.path('poll');
    };

    
}
AwardsCtrl.$inject = [ '$location', '$scope', 'db', '$timeout','leafletData','$rootScope'];




function LecturesCtrl( $location, $scope, db, $timeout, leafletData, $rootScope) {

    shelfPan('return');
    window.scrollTo(0, 0);

    ///// TIME STUFF /////

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} var today = dd+'/'+mm+'/'+yyyy;

    var eventDate = 11;

    if (eventDate == dd){
        $scope.itisToday = true;
    }
    ////////////////////

    //fixing back button showing up glitches
    $rootScope.showBack = false;
    $rootScope.showBackPage = false;
    $rootScope.showBackMark = false;
    $rootScope.hideIFbar = false;
    $rootScope.showNavIcons = false;
    $rootScope.showMapNav = false;


    angular.extend($rootScope, { 
        markers : {}
    });


    ///// MAP STUFF ///////
    var geoLocs = {
        "BASECAMP" : [40.7215408, -73.9967013],
        "MoMA" : [40.7615, -73.9777]
    }


    angular.extend($rootScope, {
        center: {
            lat: 40.7415,
            lng: -73.9850,
            zoom: 12
        },
        tiles: tilesDict.mapbox,
        markers : {       
            "b": {
                lat: geoLocs["MoMA"][0],
                lng: geoLocs["MoMA"][1],
                message: '<h4>MoMA</h4>',
                focus: false,
                icon: local_icons.yellowIcon
            }, 
            "a": {
                lat: geoLocs["BASECAMP"][0],
                lng: geoLocs["BASECAMP"][1],
                message: '<h4>BASECAMP</h4>',
                focus: true,
                icon: local_icons.yellowIcon
            }
          
        }
    });

    // refreshMap();

    function refreshMap(){ 
        leafletData.getMap().then(function(map) {
            map.invalidateSize();
        });
    }
    /////////////////////


    $rootScope.radioModel = 'Wednesday'; //for bubble switcher selector
    $rootScope.showSwitch = true;

    //WIDGETS FOR GETTING LATEST TWEET + INSTA, should check for lastest and refresh
    $scope.tweets = db.tweets.query({limit:1});
    $scope.instagrams = db.instagrams.query({limit:1});


    //hiding bubble switcher and showing map nav instead
    $scope.hideSwitch = function(){
        if ($rootScope.showSwitch == true){
            $rootScope.showSwitch = false;
            $rootScope.showBack = true;
        }
        else {
            $rootScope.showSwitch = true;
            $rootScope.showBack = false;
        }
    }

    $rootScope.goBack = function(){
        window.history.back();
    }

    $scope.shelfUpdate = function(type){     
        if ($scope.shelfUpdate == type){
            $scope.shelfUpdate = 'default';
        }
        else {
            $scope.shelfUpdate = type;
        }
    }

    //---- EVENT CARDS WIDGET -----//
    var queryCat = "lecture";


    //---- Happening Now -----//
    $scope.queryType = "events";
    $scope.queryFilter = "now";
    $scope.queryCat = queryCat;
    //$scope.queryTime = new Date();
    // ADD FAKE TIME FROM UNIVERSAL VAR TO NEW DATE!

    $scope.landmarksNow = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, queryCat: $scope.queryCat, userTime: new Date() }, function(){
        
        console.log("NOW");
        console.log($scope.landmarksNow);

        //IF THERE'S A NOW OBJECT 
        if ($scope.landmarksNow[0]){
            //passing now result as temporary DOESNT SCALE
            queryUpcoming($scope.landmarksNow[0].time.end);
        }

        // NO NOW OBJECT
        else {
            queryUpcoming("noNow");
        }
    });

    //---------//

    function queryUpcoming(nowTimeEnd){
        
        //$scope.upcomingLimit = 2;

        if (nowTimeEnd == "noNow"){

            //if still day of event, not another day
            if (dd == eventDate){


                $scope.upcomingLimit = 2;


                //---- Upcoming -----//
                $scope.queryType = "events";
                $scope.queryFilter = "upcoming";
                $scope.queryCat = queryCat;


                $scope.landmarksUpcoming = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, queryCat: $scope.queryCat, nowTimeEnd: nowTimeEnd},function(data){
                
                    //no more events for that day    
                    if (data.length == 0) {
                        // console.log("asdfasdf");
                        queryHappened();
                    }

                });     
            }

            else {
                queryHappened();
            }   
        }

        else {

            $scope.upcomingLimit = 1;

            //---- Upcoming -----//
            $scope.queryType = "events";
            $scope.queryFilter = "upcoming";
            $scope.queryCat = queryCat;

            $scope.landmarksUpcoming = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, queryCat: $scope.queryCat, nowTimeEnd: nowTimeEnd},function(){
            
                console.log("UPCOMING");
                console.log($scope.landmarksUpcoming);

            });     

        }

        //---------// 
    }

    function queryHappened(){

        $scope.happenedLimit = 10;

        //---- Happened -----//
        $scope.queryType = "events";
        $scope.queryFilter = "all";
        $scope.queryCat = queryCat;

        $scope.landmarksHappened = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, queryCat: $scope.queryCat},function(){
            console.log('HAPPENED');
            console.log($scope.landmarksHappened);
        });

        //---------//

    }

    //------------------------//


    //query function for all sorting buttons
    $scope.filter = function(type, filter) {
        $scope.landmarks = db.landmarks.query({ queryType: type, queryFilter: filter });
    };

    $scope.goTalk = function(url) {
      $location.path('talk/'+url);
    };

    $scope.goTalkList = function(url) {
      $location.path('talk');
    };

}
LecturesCtrl.$inject = [ '$location', '$scope', 'db', '$timeout','leafletData', '$rootScope'];






function ShowCtrl( $location, $scope, db, $timeout, leafletData, $rootScope) {

    shelfPan('return');

    window.scrollTo(0, 0);

    $rootScope.hideIFbar = false;
    $rootScope.showNavIcons = false;
    $rootScope.showMapNav = false;


    //WIDGET SHOW THING AFTER TIME
    //time check to show MoMA site:
    var rightNow = new Date();
    var momaStart = new Date('Jun 12 2014 15:59:59 GMT-0400 (EDT)');

    if (rightNow > momaStart){
        $scope.showBootCamp = false;
        $scope.showMoMA = true;
    }
    else {
        $scope.showBootCamp = true;
        $scope.showMoMA = false;
    }
    ///////////////

    function refreshMap(){ 
        leafletData.getMap().then(function(map) {
            map.invalidateSize();
        });
    }

    //////////////

    //fixing back button showing up glitches
    $rootScope.showBack = false;
    $rootScope.showBackPage = false;
    $rootScope.showBackMark = false;
    $rootScope.showSwitch = true;
    $rootScope.radioModel = 'Thursday'; //for bubble switcher selector

    $scope.tweets = db.tweets.query({limit:1});
    $scope.instagrams = db.instagrams.query({limit:1});

    angular.extend($rootScope, {
        center: {
            lat: 40.76147,
            lng: -73.9778,
            zoom: 19
        },
        tiles: tilesDict.aicp
    });


    //hiding bubble switcher and showing map nav instead
    $scope.hideSwitch = function(){

        if ($rootScope.showSwitch == true){
            $rootScope.showSwitch = false;
            $rootScope.showMapNav = true;
            $rootScope.showBack = true;
            $rootScope.showNavIcons = true;
            $rootScope.hideIFbar = true;
        }

        else {  
            $rootScope.showSwitch = true;
            $rootScope.showMapNav = false;
            $rootScope.showBack = false;
            $rootScope.showNavIcons = false;
            $rootScope.hideIFbar = false;
        }
    }

    //nicknames
    var geoLocs = {
        "1F" : [40.7618, -73.978],
        "2F" : [40.7612, -73.978],
        "5F" : [40.7607, -73.978],
        "GARDEN" : [40.7619, -73.9771],
        "EDUCATION": [40.761999, -73.9764]
    }

    $rootScope.mapPan = function(area){

        angular.extend($rootScope, {
            center: {
                lat: geoLocs[area][0],
                lng: geoLocs[area][1],
                zoom: 20
            },
            tiles: tilesDict.aicp
        });
    }

    $rootScope.goBack = function(){
        $rootScope.hideIFbar = false;
        window.history.back();

    }

    $scope.goNow = function(url) {
      $location.path('landmark/Kathryn_Gordon_Show');
    };

    $scope.shelfUpdate = function(type){     
        if ($scope.shelfUpdate == type){
            $scope.shelfUpdate = 'default';
        }
        else {
            $scope.shelfUpdate = type;
        }
    }

    //query function for all sorting buttons
    $scope.filter = function(type, filter) {
        $scope.landmarks = db.landmarks.query({ queryType: type, queryFilter: filter });
    };

    $scope.goTalk = function(url) {
      $location.path('talk/'+url);
    };

    $scope.goTalkList = function(url) {
      $location.path('talk');
    };

    var dumbVar = "'partial'";


    //----- MAP QUERY when explore button selected ------//
    $scope.queryMap = function(type, cat){  

        window.scrollTo(0, 0); // move to top of page

        $rootScope.singleModel = 1;
        $rootScope.iconModel = cat;

        db.landmarks.query({ queryType: type, queryFilter: cat},

        function (data) {   //success

            var markerCollect = {};

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

    angular.extend($rootScope, { 
        markers : {}
    });

    //-------------------------// 

}
ShowCtrl.$inject = [ '$location', '$scope', 'db', '$timeout','leafletData','$rootScope'];




