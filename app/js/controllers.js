
/* IF Controllers */

function BubbleRouteCtrl($location, $scope, $routeParams, db) {

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} var today = dd+'/'+mm+'/'+yyyy;
    //document.getElementById("DATE").value = today;

    console.log(today);

    if (today === '28/05/2014'){
        //$location.path('awards');
        $location.path('lectures');
        
    }

    else if (today === '29/05/2014'){
        $location.path('lectures');

    }

    else if (today === '30/05/2014'){
        $location.path('lectures');
        //$location.path('show');
    }

    else {
        //$location.path('awards');
        $location.path('lectures');
    }

 

}
BubbleRouteCtrl.$inject = [ '$location', '$scope', '$routeParams', 'db'];


function indexIF($location, $scope, db, $timeout, leafletData, $rootScope){

    $scope.goBack = function(){
        shelfPan('return');
        $rootScope.showSwitch = true;
        $rootScope.showBack = false;
        $rootScope.showMapNav = false;
        $rootScope.showNavIcons = false;
    }

    $scope.goBackPage = function(){
        $rootScope.showBackPage = false;
        $rootScope.showMapNav = false;
        window.history.back();
        shelfPan('return');
        $rootScope.showNavIcons = false;

        
    }

    $scope.goBackMarkers = function(){
        // $rootScope.showBackPage = false;
        $rootScope.showBackMark = false;
        $rootScope.showBackPage = true;
        // $rootScope.showBack = false;
        $rootScope.showMapNav= true;
        shelfPan('full');
        refreshMap();
         $rootScope.showNavIcons = true;

    }







//--- GEO LOCK -----//

    // if (navigator.geolocation) {

    //     // Get the user's current position
    //     navigator.geolocation.getCurrentPosition(showPosition, locError, {timeout:50000});

    //     function showPosition(position) {


    //         userLat = position.coords.latitude;
    //         userLon = position.coords.longitude;


    //         // angular.extend($scope, {
    //         //     center: {
    //         //         lat: userLat,
    //         //         lng: userLon,
    //         //         zoom: 18
    //         //     },
    //         //     tiles: tilesDict.mapbox
    //         // });

    //         findWorlds(userLat, userLon);
    //     }

    //     function locError(){

    //         //geo error
    //     }

    // } else {

    //     //no geo
        
    // }

//--------------//


    angular.extend($rootScope, {
        center: {
            lat: 40.7615,
            lng: -73.9777,
            zoom: 11
        },
        tiles: tilesDict.aicp,
        markers : {}
    });




    //for bubble widget switcher
    $scope.goPath = function(url){
        shelfPan('return');
        $location.path(url);
    };


    // function findWorlds(lat,lon){

    //     //---- Find World -----//
    //     // $scope.queryType = "all";
    //     // $scope.queryFilter = "all";


    //     //Events Now example:
    //     // $scope.queryType = "events";
    //     // $scope.queryFilter = "now";

    //     $scope.worlds = db.worlds.query({ userLat:lat, userLon:lon });

    //     //---------//

    // }

    function refreshMap(){ 
        leafletData.getMap().then(function(map) {
            map.invalidateSize();
        });
    }


    $scope.refreshMap = function(){ 
        leafletData.getMap().then(function(map) {
            map.invalidateSize();
        });
    }


 
  


    //----- MAP QUERY ------//
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

                markerCollect[data[i].id] = {
                    lat: data[i].loc[0],
                    lng: data[i].loc[1],
                    message: '<h4 onclick="shelfPan('+dumbVar+');"><img style="width:70px;" src="'+data[i].stats.avatar+'"><a href=#/post/'+data[i].id+'/m> '+data[i].name+'</a></h4>',
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




    //-------------------------// 


      // //**** MAP STUFF *****//

      //   $scope.queryType = "all";
      //   $scope.queryFilter = "all";

      //   queryMap($scope.queryType, $scope.queryFilter); //showing all at first



      //   function queryMap(type, filter){

      //       db.landmarks.query({ queryType: type, queryFilter: filter },

      //       function (data) {   //success

      //           var markerCollect = {};

      //           for (var i=0;i < data.length;i++){ 

      //               markerCollect[data[i].id] = {
      //                   lat: data[i].loc[0],
      //                   lng: data[i].loc[1],
      //                   message: '<h4><img style="width:70px;" src="'+data[i].stats.avatar+'"><a href=#/post/'+data[i].id+'/m> '+data[i].name+'</a></h4>',
      //                   focus: false, 
      //                   icon: local_icons.yellowIcon
      //               }
      //           }

      //           angular.extend($rootScope, {
      //               markers: markerCollect
      //           });

          

      //           // var singleMarker = {
      //           //     lat: 42.3568700,
      //           //     lng: -83.080400,
      //           //     message: 'Culinary Theater',
      //           //     focus: true, 
      //           //     icon: local_icons.yellowIcon
      //           // }

      //           // angular.extend($scope, {
      //           //     markers: singleMarker
      //           // });

      //           // $timeout(leafletUpdate, 500); //temp solution? leaflet isn't updating properly after callback...

      //           // function leafletUpdate(){

      //           //      angular.extend($scope, { 
                        
      //           //         markers: markerCollect
      //           //     });
      //           // }
      //       },
      //       function (data) {   //failure
      //           //error handling goes here
      //       });

      //   }

      //   angular.extend($rootScope, { 
      //       markers : {}
      //   });

    //-------------------------//




    //query function for all sorting buttons
    $scope.filter = function(type, filter) {
        $scope.landmarks = db.landmarks.query({ queryType: type, queryFilter: filter });
    };


    $scope.goHome = function() {
        $location.path('/');
        $scope.showHome = true;
    };

    $scope.goTalk = function(url) {
      $location.path('talk/'+url);
    };

    $scope.goMap = function(url) {
      $location.path('map/'+url);
    };

    $scope.goNew = function() {
        $location.path('new');
    };

    //search query
    $scope.sessionSearch = function() { 
        $scope.landmarks = db.landmarks.query({queryType:"search", queryFilter: $scope.searchText});
    };



}
indexIF.$inject = [ '$location', '$scope', 'db', '$timeout','leafletData','$rootScope'];





function LandmarkDetailCtrl(Landmark, $routeParams, $scope, db, $location, $timeout, leafletData, $route, $rootScope, $sce) {  

    $rootScope.showSwitch = false;
    $rootScope.showBackPage = true;
    $rootScope.showNavIcons = false;

    
    window.scrollTo(0, 0);

    //nicknames
    var geoLocs = {
        "BASECAMP" : [40.7215408, -73.9967013],
        "SKIRBALL" : [40.7297, -73.9978],
        "MoMA" : [40.7615, -73.9777],
        "NYC" : [40.7127, -74.0059]
    }

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


    if ($routeParams.option == 'm'){

        shelfPan('partial');
        $rootScope.showSwitch = false;
        $rootScope.showBackPage = false;
        $rootScope.showBack = false;
        $rootScope.showMapNav= false;
        $rootScope.showBackMark = true;

    

        //if m then save search previous stored markers

        // THEN MAKE SPECIAL BACK BUTTON GOES BACK TO MARKERS FULL VIEW MAP (special ng-href to special link)
    }

    else {
        shelfPan('partial');
    }

    if ($routeParams.option == 'm'){

    }
    else {
        angular.extend($rootScope, { 
            markers : {}
        });

        //process
    }



    $scope.option = $routeParams.option;
    $scope.landmark = Landmark.get({_id: $routeParams.landmarkId}, function(landmark) {

        $scope.mainImageUrl = landmark.stats.avatar;

        //if ____
        //$scope.htmlDescription = landmark.description;

        // $scope.myHTML = landmark.description;
        // // $sce.trustAsHtml($scope.myHTML);

        // $scope.trustedHtml = $sce.trustAsHtml($scope.myHTML);

        // $scope.trustedHtml = $sce.trustAsHtml(landmark.description);

        processLandmark(landmark);

        //if there's a sub hashtag for this object, query for tweets
        if ($scope.landmark.tags){
            $scope.time = "all";
            $scope.currentTag = $scope.landmark.tags;
            $scope.tweets = db.tweets.query({tag: $scope.landmark.tags, time:$scope.time});
        }

    });

    
    //after query, do stuff
    function processLandmark(landmark){


        //ALL EVENTS ARE PROCESSED WITH MAPBOX RIGHT NOW!
        if (landmark.type == "event"){


            //does it have a nickname to place on map from nick list?
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

            //no nickname, use default map place
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

        if (landmark.type == "place"){

            if ($routeParams.option == 'm'){

                // FOR MOMA MAP STUFF
                angular.extend($rootScope, {
                    center: {
                        lat: landmark.loc[0],
                        lng: landmark.loc[1],
                        zoom: 19,
                        autoDiscover:false
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
LandmarkDetailCtrl.$inject = ['Landmark', '$routeParams', '$scope', 'db', '$location','$timeout','leafletData', '$route','$rootScope','$sce'];





function LandmarkNewCtrl($location, $scope, $routeParams, db, $rootScope) {

    shelfPan('return');

    $rootScope.showSwitch = false;
    $rootScope.showBack = false;
    $rootScope.showBackPage = false;


    //Showing form options based on type of "new" request
    if ($routeParams.type == '' || $routeParams.type == 'place' || $routeParams.type == 'event' || $routeParams.type == 'job'){

    }
    else {
        $location.path('/new');
    }

    var currentDate = new Date();

    //----- Loading sub categories from global settings ----//
    $scope.subTypes = [];

    if ($routeParams.type == 'event'){
        $scope.subTypes = $scope.subTypes.concat(eventCategories);
    }

    if ($routeParams.type == 'place'){
        $scope.subTypes = $scope.subTypes.concat(placeCategories);
    }
    //-----//

    $scope.addEndDate = function () {
        $scope.landmark.date.end = $scope.landmark.date.start;
    }


    angular.extend($scope, {
        // amc: {
        //     lat: $scope.landmark.loc[0],
        //     lng: $scope.landmark.loc[1],
        //     zoom: global_mapCenter.zoom
        // },
        markers2: {
            m: {
                lat: $scope.center.lat,
                lng: $scope.center.lng,
                message: "Drag to Location on map",
                focus: true,
                draggable: true,
                icon: local_icons.yellowIcon
            }
        }
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
            $scope.landmark.stats.avatar = data.result;
        }
    });


    $scope.locsearch = function () {

        var geocoder = new google.maps.Geocoder();

          if (geocoder) {
             geocoder.geocode({ 'address': $scope.landmark.location}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                  $scope.$apply(function () {
                        
                        angular.extend($scope, {
                            center: {
                                lat: results[0].geometry.location.lat(),
                                lng: results[0].geometry.location.lng(),
                                zoom: global_mapCenter.zoom
                            },
                            markers2: {
                                m: {
                                    lat: results[0].geometry.location.lat(),
                                    lng: results[0].geometry.location.lng(),
                                    message: "Drag to Location",
                                    focus: true,
                                    draggable: true
                                }
                            }
                        });
                    });

                } 
                else {
                  console.log('No results found: ' + status);
                }
             });
          }
    }



    $scope.save = function () {

        if (!$scope.landmark.date.end){
            $scope.landmark.date.end = $scope.landmark.date.start;
        }

        $scope.landmark.datetext = {
            start: $scope.landmark.date.start,
            end: $scope.landmark.date.end
        }

        //---- Date String converter to avoid timezone issues...could be optimized probably -----//
        $scope.landmark.date.start = new Date($scope.landmark.date.start).toISOString();
        $scope.landmark.date.end = new Date($scope.landmark.date.end).toISOString();

        $scope.landmark.date.start = dateConvert($scope.landmark.date.start);
        $scope.landmark.date.end = dateConvert($scope.landmark.date.end);

        $scope.landmark.date.start = $scope.landmark.date.start.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1'); //rearranging so value still same in input field
        $scope.landmark.date.end = $scope.landmark.date.end.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1');

        function dateConvert(input){
            var s = input;
            var n = s.indexOf('T');
            return s.substring(0, n != -1 ? n : s.length);
        }
        //-----------//

        if (!$scope.landmark.time.start){
            $scope.landmark.time.start = "00:00";
        }

        if (!$scope.landmark.time.end){
            $scope.landmark.time.end = "23:59";
        }

        $scope.landmark.timetext = {
            start: $scope.landmark.time.start,
            end: $scope.landmark.time.end
        } 

        $scope.landmark.loc = [$scope.markers2.m.lat,$scope.markers2.m.lng];

        db.landmarks.create($scope.landmark, function(response){
            $location.path('/post/'+response[0].id+'/new');
        });
    }

    // angular.extend($scope, {
    //     amc: global_mapCenter,
    //     markers: {
    //         m: {
    //             lat: global_mapCenter.lat,
    //             lng: global_mapCenter.lng,
    //             message: "Drag to Location",
    //             focus: true,
    //             draggable: true
    //         }
    //     }
    // });

    $scope.landmark = { 
        stats: { 
            avatar: "img/tidepools/default.jpg" 
        },
        type: $routeParams.type,
        date: {
            start: currentDate
        }
    };

    $scope.landmark.loc = [];
}

LandmarkNewCtrl.$inject = ['$location', '$scope', '$routeParams','db', '$rootScope'];












function LandmarkEditCtrl(Landmark, $location, $scope, $routeParams, db, $timeout, $rootScope) {

    //if authenticate, show and provide this functionality:

    //if not, login plz k thx

    $rootScope.showSwitch = false;

    shelfPan('return');

    Landmark.get({_id: $routeParams.landmarkId}, function(landmark) {

        $scope.landmark = landmark;
        if (landmark.loc_nicknames){
            $scope.landmark.location = landmark.loc_nicknames[0];
        }
        
        $scope.landmark.idCheck = landmark.id;

        //----- Loading sub categories from global settings ----//
        $scope.subTypes = [];

        if (landmark.type == 'event'){
            $scope.subTypes = $scope.subTypes.concat(eventCategories);
        }

        if (landmark.type == 'place'){
            $scope.subTypes = $scope.subTypes.concat(placeCategories);
        }
        //-----//

        if (landmark.type == "event"){

            $scope.landmark.date = {
                start : landmark.timetext.datestart,
                end: landmark.timetext.dateend
            }

            $scope.landmark.time = {
                start: landmark.timetext.timestart,
                end: landmark.timetext.timeend
            } 
        }

         console.log($scope.landmark.loc[0]);
         console.log($scope.landmark.loc[1]);

    // angular.extend($scope, {
    //     // amc: {
    //     //     lat: $scope.landmark.loc[0],
    //     //     lng: $scope.landmark.loc[1],
    //     //     zoom: global_mapCenter.zoom
    //     // },
    //     markers2: {
    //         m: {
    //             lat: $scope.center.lat,
    //             lng: $scope.center.lng,
    //             message: "Drag to Location on map",
    //             focus: true,
    //             draggable: true,
    //             icon: local_icons.yellowIcon
    //         }
    //     }
    // });


        angular.extend($scope, {
            center: {
                lat: $scope.landmark.loc[0],
                lng: $scope.landmark.loc[1],
                zoom: 17
            },
            markers3: {
                "m": {
                    lat: $scope.landmark.loc[0],
                    lng: $scope.landmark.loc[1],
                    message: "Drag to Location on map",
                    focus: true,
                    draggable: true,
                    icon: local_icons.yellowIcon
                }
            },
            tiles: tilesDict.aicp
        });

                //     angular.extend($rootScope, {
                //     center: {
                //         lat: geoLocs[landmark.loc_nickname][0],
                //         lng: geoLocs[landmark.loc_nickname][1],
                //         zoom: geoZoom,
                //         autoDiscover:false
                //     },
                //     markers: {
                //         "m": {
                //             lat: geoLocs[landmark.loc_nickname][0],
                //             lng: geoLocs[landmark.loc_nickname][1],
                //             message: '<h4>'+landmark.loc_nickname+'</h4>',
                //             focus: true,
                //             icon: local_icons.yellowIcon
                //         }
                //     },
                //     tiles: tilesDict.mapbox
                // });

                // refreshMap();

    //     angular.extend($scope, {
    //     // amc: {
    //     //     lat: $scope.landmark.loc[0],
    //     //     lng: $scope.landmark.loc[1],
    //     //     zoom: global_mapCenter.zoom
    //     // },
    //     markers2: {
    //         m: {
    //             lat: $scope.center.lat,
    //             lng: $scope.center.lng,
    //             message: "Drag to Location on map",
    //             focus: true,
    //             draggable: true,
    //             icon: local_icons.yellowIcon
    //         }
    //     }
    // });

        console.log($scope.markers3);


        $('<img src="'+ $scope.landmark.stats.avatar +'">').load(function() {
          $(this).width(150).height(150).appendTo('#preview');
        });

    });


    var currentDate = new Date();

    $scope.addEndDate = function () {
        $scope.landmark.date.end = $scope.landmark.date.start;
    }

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

            $scope.landmark.stats.avatar = data.result;

        }
    });




    $scope.save = function () {

        if ($scope.landmark.type =="event"){
            if (!$scope.landmark.date.end){

                $scope.landmark.date.end = $scope.landmark.date.start;
            }

            $scope.landmark.datetext = {
                start: $scope.landmark.date.start,
                end: $scope.landmark.date.end
            }

            //---- Date String converter to avoid timezone issues...could be optimized probably -----//
            $scope.landmark.date.start = new Date($scope.landmark.date.start).toISOString();
            $scope.landmark.date.end = new Date($scope.landmark.date.end).toISOString();

            $scope.landmark.date.start = dateConvert($scope.landmark.date.start);
            $scope.landmark.date.end = dateConvert($scope.landmark.date.end);

            $scope.landmark.date.start = $scope.landmark.date.start.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1'); //rearranging so value still same in input field
            $scope.landmark.date.end = $scope.landmark.date.end.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1');

            function dateConvert(input){
                var s = input;
                var n = s.indexOf('T');
                return s.substring(0, n != -1 ? n : s.length);
            }
            //-----------//

            if (!$scope.landmark.time.start){
                $scope.landmark.time.start = "00:00";
            }

            if (!$scope.landmark.time.end){
                $scope.landmark.time.end = "23:59";
            }

            $scope.landmark.timetext = {

                start: $scope.landmark.time.start,
                end: $scope.landmark.time.end
            } 

        }

        //a temp fix for a problem with marker scope "unsyncing" from the marker's map position. using globalEditLoc global variable to pass values for now..better with $rootScope or legit fix...
        if (!globalEditLoc.lat){

            $scope.landmark.loc = [$scope.markers3.m.lat,$scope.markers3.m.lng];
        }

        else {
            $scope.landmark.loc = [globalEditLoc.lat,globalEditLoc.lng];
        }

        db.landmarks.create($scope.landmark, function(response){

            $location.path('/post/'+response[0].id+'/new');
        });

    }
 
    $scope.delete = function (){

        var deleteItem = confirm('Are you sure you want to delete this item?'); 

        if (deleteItem) {
            Landmark.del({_id: $scope.landmark._id}, function(landmark) {
                $location.path('/'); 
            });
        }
    }

    // angular.extend($scope, {
    //     // center: $scope.center,
    //     // tiles: tilesDict.amc,
    //     markers2: {
    //         m: {
    //             lat: $scope.center.lat,
    //             lng: $scope.center.lng,
    //             zoom: 15,
    //             message: "Drag to Location",
    //             focus: true,
    //             draggable: true,
    //             icon: local_icons.yellowIcon
    //         }
    //     }
    // });

}

LandmarkEditCtrl.$inject = ['Landmark','$location', '$scope', '$routeParams','db','$timeout','$rootScope'];







function WorldNewCtrl($location, $scope, $routeParams, db) {

 
    //Showing form options based on type of "new" request
    if ($routeParams.type == '' || $routeParams.type == 'place' || $routeParams.type == 'event' || $routeParams.type == 'job'){

    }
    else {
        $location.path('/new');
    }

    var currentDate = new Date();

    //----- Loading sub categories from global settings ----//
    $scope.subTypes = [];

    if ($routeParams.type == 'event'){
        $scope.subTypes = $scope.subTypes.concat(eventCategories);
    }

    if ($routeParams.type == 'place'){
        $scope.subTypes = $scope.subTypes.concat(placeCategories);
    }
    //-----//

    $scope.addEndDate = function () {
        $scope.landmark.date.end = $scope.landmark.date.start;
    }

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
            $scope.landmark.stats.avatar = data.result;
        }
    });


    $scope.locsearch = function () {

        var geocoder = new google.maps.Geocoder();

          if (geocoder) {
             geocoder.geocode({ 'address': $scope.landmark.location}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                  $scope.$apply(function () {
                        
                        angular.extend($scope, {
                            amc: {
                                lat: results[0].geometry.location.lat(),
                                lng: results[0].geometry.location.lng(),
                                zoom: global_mapCenter.zoom
                            },
                            markers: {
                                m: {
                                    lat: results[0].geometry.location.lat(),
                                    lng: results[0].geometry.location.lng(),
                                    message: "Drag to Location",
                                    focus: true,
                                    draggable: true
                                }
                            }
                        });
                    });

                } 
                else {
                  console.log('No results found: ' + status);
                }
             });
          }
    }



    $scope.save = function () {

        if (!$scope.landmark.date.end){
            $scope.landmark.date.end = $scope.landmark.date.start;
        }

        $scope.landmark.datetext = {
            start: $scope.landmark.date.start,
            end: $scope.landmark.date.end
        }

        //---- Date String converter to avoid timezone issues...could be optimized probably -----//
        $scope.landmark.date.start = new Date($scope.landmark.date.start).toISOString();
        $scope.landmark.date.end = new Date($scope.landmark.date.end).toISOString();

        $scope.landmark.date.start = dateConvert($scope.landmark.date.start);
        $scope.landmark.date.end = dateConvert($scope.landmark.date.end);

        $scope.landmark.date.start = $scope.landmark.date.start.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1'); //rearranging so value still same in input field
        $scope.landmark.date.end = $scope.landmark.date.end.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1');

        function dateConvert(input){
            var s = input;
            var n = s.indexOf('T');
            return s.substring(0, n != -1 ? n : s.length);
        }
        //-----------//

        if (!$scope.landmark.time.start){
            $scope.landmark.time.start = "00:00";
        }

        if (!$scope.landmark.time.end){
            $scope.landmark.time.end = "23:59";
        }

        $scope.landmark.timetext = {
            start: $scope.landmark.time.start,
            end: $scope.landmark.time.end
        } 

        $scope.landmark.loc = [$scope.markers.m.lat,$scope.markers.m.lng];

        db.worlds.create($scope.landmark, function(response){
            $location.path('/world/'+response[0].id+'/new');
        });
    }

    angular.extend($scope, {
        amc: global_mapCenter,
        markers: {
            m: {
                lat: global_mapCenter.lat,
                lng: global_mapCenter.lng,
                message: "Drag to Location",
                focus: true,
                draggable: true
            }
        }
    });

    $scope.landmark = { 
        stats: { 
            avatar: "img/tidepools/default.jpg" 
        },
        type: $routeParams.type,
        date: {
            start: currentDate
        }
    };

    $scope.landmark.loc = [];
}

WorldNewCtrl.$inject = ['$location', '$scope', '$routeParams','db'];




function talklistCtrl( $location, $scope, db, $rootScope) {

    $rootScope.showSwitch = false;

    $scope.tweets = db.tweets.query({limit:100});
    $scope.globalhashtag = global_hashtag;

    //search
    $scope.tagSearch = function() { 
        var tagged = $scope.searchText.replace("#","");
        $scope.tweets = db.tweets.query({tag: tagged});
    };

    $scope.goBack = function(){
        window.history.back();
        // shelfPan('return');
    }
}
talklistCtrl.$inject = [ '$location', '$scope', 'db', '$rootScope'];





function talktagCtrl( $location, $scope, $routeParams, db, $rootScope) {

    $rootScope.showSwitch = false;

    $scope.currentTag = $routeParams.hashTag;
    $scope.globalhashtag = global_hashtag;

    $scope.time = "all";
    $scope.tweets = db.tweets.query({tag: $routeParams.hashTag, time:$scope.time});

    $scope.goBack = function(){
        window.history.back();
    }

    $scope.goTalk = function(url) {
      $location.path('talk');
    };

}
talktagCtrl.$inject = [ '$location', '$scope', '$routeParams', 'db', '$rootScope'];


















function AwardsCtrl( $location, $scope, db, $timeout, leafletData, $rootScope) {

    shelfPan('return');
    window.scrollTo(0, 0);

 
    $rootScope.showSwitch = true;
    $rootScope.showBackPage= false;
    $rootScope.radioModel = 'Tuesday'; //for bubble switcher selector


    $scope.tweets = db.tweets.query({limit:1});
    $scope.instagrams = db.instagrams.query({limit:1});

    angular.extend($rootScope, {
        center: {
            lat: 40.7615,
            lng: -73.9777,
            zoom: 9
        },
        tiles: tilesDict.mapbox,
        markers : {}
    });

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
        
        //$scope.upcomingLimit = 2;

        if ($scope.landmarksNow.length > 0){
            $scope.upcomingLimit = 1;
        }

        else {
            $scope.upcomingLimit = 2;
        }


        //---- Upcoming -----//
        $scope.queryType = "events";
        $scope.queryFilter = "upcoming";
        $scope.queryCat = queryCat;


        $scope.landmarksUpcoming = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, queryCat: $scope.queryCat, nowTimeEnd: nowTimeEnd},function(){
        
            //console.log($scope.landmarksUpcoming.length);
            console.log("UPCOMING");
            console.log($scope.landmarksUpcoming);

             //queryHappened();

            if ($scope.landmarksUpcoming.length < 2){
                queryHappened();
            }

        });

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

    console.log($scope.tweets);
}
AwardsCtrl.$inject = [ '$location', '$scope', 'db', '$timeout','leafletData','$rootScope'];




function LecturesCtrl( $location, $scope, db, $timeout, leafletData, $rootScope) {

    shelfPan('return');
    window.scrollTo(0, 0);


    angular.extend($rootScope, {
        center: {
            lat: 40.7615,
            lng: -73.9777,
            zoom: 12
        },
        tiles: tilesDict.mapbox,
        markers : {}
    });

    $rootScope.radioModel = 'Wednesday'; //for bubble switcher selector
    $rootScope.showSwitch = true;
    $rootScope.showBackPage = false;

    $scope.tweets = db.tweets.query({limit:1});

    angular.extend($rootScope, {
        center: {
            lat: 40.7615,
            lng: -73.9777,
            zoom: 12
        },
        tiles: tilesDict.mapbox
    });

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
        
        //$scope.upcomingLimit = 2;

        if ($scope.landmarksNow.length > 0){
            $scope.upcomingLimit = 1;
        }

        else {
            $scope.upcomingLimit = 2;
        }


        //---- Upcoming -----//
        $scope.queryType = "events";
        $scope.queryFilter = "upcoming";
        $scope.queryCat = queryCat;


        $scope.landmarksUpcoming = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, queryCat: $scope.queryCat, nowTimeEnd: nowTimeEnd},function(){
        
            //console.log($scope.landmarksUpcoming.length);
            console.log("UPCOMING");
            console.log($scope.landmarksUpcoming);


            if ($scope.landmarksUpcoming.length < 2){
                //queryHappened();
            }

        });

        //---------//
        
    }

    function queryHappened(){

        $scope.happenedLimit = 1;

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

    $rootScope.showSwitch = true;
    $rootScope.showBackPage = false;

    $rootScope.radioModel = 'Thursday'; //for bubble switcher selector

    $scope.tweets = db.tweets.query({limit:1});

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

        //
        if ($rootScope.showSwitch == true){
            $rootScope.showSwitch = false;
            $rootScope.showMapNav = true;
            $rootScope.showBack = true;
            $rootScope.showNavIcons = true;
            // $( '#shelf' ).toggleClass( "iconMenu" );
            // $('.index_card .h1.blue').toggleClass('red');
            // $( "#shelf" ).addClass( ".iconMenu !important" );

        }

        //
        else {  
            $rootScope.showSwitch = true;
            $rootScope.showMapNav = false;
            $rootScope.showBack = false;
            $rootScope.showNavIcons = false;

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




    //---- EVENT CARDS WIDGET -----//
    var queryCat = "show";

    //---- Happening Now -----//
    $scope.queryType = "events";
    $scope.queryFilter = "now";
    $scope.queryCat = queryCat;
    //$scope.queryTime = new Date();
    // ADD FAKE TIME FROM UNIVERSAL VAR TO NEW DATE!

    $scope.landmarksNow = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, queryCat: $scope.queryCat}, function(){
        
        console.log("NOW");
        console.log($scope.landmarksNow);

        queryHappened();

        // !!!!!!!! TAKEN OUT RIGHT NOW

        // //IF THERE'S A NOW OBJECT 
        // if ($scope.landmarksNow[0]){
        //     //passing now result as temporary DOESNT SCALE
        //     queryUpcoming($scope.landmarksNow[0].time.end);
        // }

        // // NO NOW OBJECT
        // else {
        //     queryUpcoming("noNow");
        // }


    });

    //---------//

    function queryUpcoming(nowTimeEnd){

         window.scrollTo(0, 0);
        
        //$scope.upcomingLimit = 2;

        if ($scope.landmarksNow.length > 0){
            $scope.upcomingLimit = 1;
        }

        else {
            $scope.upcomingLimit = 2;
        }


        //---- Upcoming -----//
        $scope.queryType = "events";
        $scope.queryFilter = "upcoming";
        $scope.queryCat = queryCat;


        $scope.landmarksUpcoming = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, queryCat: $scope.queryCat, nowTimeEnd: nowTimeEnd},function(){
        
            //console.log($scope.landmarksUpcoming.length);
            console.log("UPCOMING");
            console.log($scope.landmarksUpcoming);


            if ($scope.landmarksUpcoming.length < 2){
                queryHappened();
            }

        });

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

    var dumbVar = "'partial'";


    //----- MAP QUERY ------//
    $scope.queryMap = function(type, cat){  

        window.scrollTo(0, 0);


        $rootScope.singleModel = 1;

        $rootScope.iconModel = cat;

        db.landmarks.query({ queryType: type, queryFilter: cat},

        function (data) {   //success

            var markerCollect = {};

            for (var i=0;i < data.length;i++){ 

                markerCollect[data[i].id] = {
                    lat: data[i].loc[0],
                    lng: data[i].loc[1],
                    message: '<h4 onclick="shelfPan('+dumbVar+');"><img style="width:70px;" src="'+data[i].stats.avatar+'"><a href=#/post/'+data[i].id+'/m> '+data[i].name+'</a></h4>',
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


    angular.extend($rootScope, { 
        markers : {}
    });

    //-------------------------// 


    $scope.mapIconClick = function() {
      
    };


}
ShowCtrl.$inject = [ '$location', '$scope', 'db', '$timeout','leafletData','$rootScope'];


function ListCtrl( $location, $scope, db, $routeParams, $rootScope) {

    shelfPan('return');

    $rootScope.showSwitch = false;

    $scope.goBack = function(){
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

    $scope.listType = $routeParams.category;
    //var queryCat = $routeParams.category;

    if ($scope.listType == 'lecture' ){
        $scope.day = "WEDNESDAY";
    }
    if ($scope.listType == 'award' ){
        $scope.day = "TUESDAY";
    }
    if ($scope.listType == 'show' ){
        $scope.day = "THURSDAY";
    }
    

    queryList();


    function queryList(){

        $scope.listLimit = 10;

        //---- Happened -----//
        $scope.queryType = "events";
        $scope.queryFilter = $routeParams.filter;
        $scope.queryCat = $routeParams.category;

        $scope.landmarksList = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, queryCat: $scope.queryCat, nowTimeEnd: "noNow"},function(){
            
            
        });

        //---------//

    }

    //------------------------//


    //query function for all sorting buttons
    $scope.filter = function(type, filter) {
        $scope.landmarks = db.landmarks.query({ queryType: type, queryFilter: filter });
    };


}
ListCtrl.$inject = [ '$location', '$scope', 'db', '$routeParams', '$rootScope'];


function MenuCtrl( $location, $scope, db, $routeParams, $rootScope) {

    shelfPan('return');
    window.scrollTo(0, 0);

    $rootScope.showSwitch = false;

    $scope.goBack = function(){
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

    $scope.menuType = $routeParams.type;
    //var queryCat = $routeParams.category;

    // if ($scope.listType == 'lecture' ){
    //     $scope.day = "WEDNESDAY";
    // }
    // if ($scope.listType == 'award' ){
    //     $scope.day = "TUESDAY";
    // }
    // if ($scope.listType == 'show' ){
    //     $scope.day = "THURSDAY";
    // }
    

    // queryList();


    // function queryList(){

    //     $scope.listLimit = 10;

    //     //---- Happened -----//
    //     $scope.queryType = "events";
    //     $scope.queryFilter = $routeParams.filter;
    //     $scope.queryCat = $routeParams.category;

    //     $scope.landmarksList = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, queryCat: $scope.queryCat, nowTimeEnd: "noNow"},function(){
            
            
    //     });

    //     //---------//

    // }

    // //------------------------//


    // //query function for all sorting buttons
    // $scope.filter = function(type, filter) {
    //     $scope.landmarks = db.landmarks.query({ queryType: type, queryFilter: filter });
    // };


}
MenuCtrl.$inject = [ '$location', '$scope', 'db', '$routeParams', '$rootScope'];



// function FetchViewData($scope) {
//     console.log('asdf');
//     // var test_link = "<MY LINK>";
//     // $http.get(test_link).success( function(data) {
//     //     $scope.viewData = data;
//     // });
//     // $scope.deleteRecord = function(docURL) {
//     //     console.log(docURL);

//     //     $http.delete(docURL);
//     // }   
// }
