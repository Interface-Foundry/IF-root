function LandmarkNewCtrl($location, $scope, $routeParams, db, $rootScope) {

    //if authenticate, show and provide this functionality:
    //if not, login plz k thx   

    $scope.landmarkID;
    $scope.worldID = '029345823045982345';

    $scope.landmark = { 
        stats: { 
            avatar: "img/tidepools/default.jpg" 
        }
    };

    $scope.landmark.loc = [-74.0059,40.7127];

    $scope.landmark.name = "Default";

    saveLandmark();
    //saveLandmark('edit', id); //for editing landmark

    function saveLandmark(option, editID){
       
        //edit world
        if (option == 'edit'){
            console.log('saveLandmark(edit)');
            $scope.landmark.newStatus = false; //not new
            $scope.landmark.landmarkID = editID; //from passed function, to edit landmark
            db.landmarks.create($scope.landmark, function(response){
                console.log(response);
            });  
        }

        //new landmark
        if (option === undefined) {
            console.log('saveLandmark()');
            $scope.landmark.newStatus = true; //new
            $scope.landmark.parentID = $scope.worldID; //using worldID 

            db.landmarks.create($scope.landmark, function(response){
                $scope.landmarkID = response[0]._id;
            });
       
        } 
    }






    shelfPan('return');

    $rootScope.showSwitch = false;
    $rootScope.showBack = false;
    $rootScope.showBackPage = false;

    //finish harcdoing here
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

    // ADD IN DROPDOWN LIST FOR NICKNAME PLACES
    // USER CAN ADD NEW NICKNAMES
    // *** STORE NEW VALUE: which map tile base to display on

    //use bubbl center value here
    // *** let user select between which map to store landmark on
    angular.extend($scope, {
        center: {
            lat: 40.76150,
            lng: -73.9769,
            zoom: 17
        },
        markers2: {
            "m": {
                lat: 40.76150,
                lng: -73.9769,
                message: "Drag to Location on map",
                focus: true,
                draggable: true,
                icon: local_icons.yellowIcon
            }
        },
        tiles: tilesDict.aicp
    });


    // var nw_loc_lng = -73.99749;
    // var nw_loc_lat = 40.75683;

    // var sw_loc_lng = -73.99749;
    // var sw_loc_lat = 40.7428;

    // var ne_loc_lng = -73.98472;
    // var ne_loc_lat = 40.75683;

    // var se_loc_lng = -73.98472;
    // var se_loc_lat = 40.7428;










    angular.element('#fileupload').fileupload({
        url: '/api/upload_maps',
        paramName: coords_text, //sending map coordinates to backend
        //formData: form,
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
      
            $scope.mapIMG = data.result;
        }
    });


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


    //location search by human string via google geo, temp not enabled
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

    //save landmark
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

    //get landmark to edit
    Landmark.get({_id: $routeParams.landmarkId}, function(landmark) {

        $scope.landmark = landmark;

        if (landmark.loc_nicknames){
            $scope.landmark.location = landmark.loc_nicknames;
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

        angular.extend($rootScope, { 
            markers : {}
        });
      
        angular.extend($rootScope, {
            center: {
                lat: $scope.landmark.loc[0],
                lng: $scope.landmark.loc[1],
                zoom: 17
            },
            markers: {
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

        $scope.landmark.loc = [$rootScope.markers.m.lat,$rootScope.markers.m.lng];

        db.landmarks.create($scope.landmark, function(response){

            $location.path('/post/'+response[0].id+'/new');
        });

    }   

    // change to archive?
    $scope.delete = function (){

        var deleteItem = confirm('Are you sure you want to delete this item?'); 

        if (deleteItem) {
            Landmark.del({_id: $scope.landmark._id}, function(landmark) {
                //$location.path('/'); 
            });
        }
    }

}
LandmarkEditCtrl.$inject = ['Landmark','$location', '$scope', '$routeParams','db','$timeout','$rootScope'];








// function WorldNewCtrl($location, $scope, $routeParams, db) {

//     //Showing form options based on type of "new" request
//     if ($routeParams.type == '' || $routeParams.type == 'place' || $routeParams.type == 'event' || $routeParams.type == 'job'){

//     }
//     else {
//         $location.path('/new');
//     }

//     var currentDate = new Date();

//     //----- Loading sub categories from global settings ----//
//     $scope.subTypes = [];

//     if ($routeParams.type == 'event'){
//         $scope.subTypes = $scope.subTypes.concat(eventCategories);
//     }

//     if ($routeParams.type == 'place'){
//         $scope.subTypes = $scope.subTypes.concat(placeCategories);
//     }
//     //-----//

//     $scope.addEndDate = function () {
//         $scope.landmark.date.end = $scope.landmark.date.start;
//     }

//     angular.element('#fileupload').fileupload({
//         url: '/api/upload',
//         dataType: 'text',
//         progressall: function (e, data) {  

//             $('#progress .bar').css('width', '0%');

//             var progress = parseInt(data.loaded / data.total * 100, 10);
//             $('#progress .bar').css(
//                 'width',
//                 progress + '%'
//             );
//         },
//         done: function (e, data) {

//             $('#uploadedpic').html('');
//             $('#preview').html('');
//             $('<p/>').text('Saved: '+data.originalFiles[0].name).appendTo('#uploadedpic');
//             $('<img src="'+ data.result +'">').load(function() {
//               $(this).width(150).height(150).appendTo('#preview');
//             });
//             $scope.landmark.stats.avatar = data.result;
//         }
//     });


//     $scope.locsearch = function () {

//         var geocoder = new google.maps.Geocoder();

//           if (geocoder) {
//              geocoder.geocode({ 'address': $scope.landmark.location}, function (results, status) {
//                 if (status == google.maps.GeocoderStatus.OK) {

//                   $scope.$apply(function () {
                        
//                         angular.extend($scope, {
//                             amc: {
//                                 lat: results[0].geometry.location.lat(),
//                                 lng: results[0].geometry.location.lng(),
//                                 zoom: global_mapCenter.zoom
//                             },
//                             markers: {
//                                 m: {
//                                     lat: results[0].geometry.location.lat(),
//                                     lng: results[0].geometry.location.lng(),
//                                     message: "Drag to Location",
//                                     focus: true,
//                                     draggable: true
//                                 }
//                             }
//                         });
//                     });
//                 } 
//                 else {
//                   console.log('No results found: ' + status);
//                 }
//              });
//           }
//     }


//     $scope.save = function () {

//         if (!$scope.landmark.date.end){
//             $scope.landmark.date.end = $scope.landmark.date.start;
//         }

//         $scope.landmark.datetext = {
//             start: $scope.landmark.date.start,
//             end: $scope.landmark.date.end
//         }

//         //---- Date String converter to avoid timezone issues...could be optimized probably -----//
//         $scope.landmark.date.start = new Date($scope.landmark.date.start).toISOString();
//         $scope.landmark.date.end = new Date($scope.landmark.date.end).toISOString();

//         $scope.landmark.date.start = dateConvert($scope.landmark.date.start);
//         $scope.landmark.date.end = dateConvert($scope.landmark.date.end);

//         $scope.landmark.date.start = $scope.landmark.date.start.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1'); //rearranging so value still same in input field
//         $scope.landmark.date.end = $scope.landmark.date.end.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1');

//         function dateConvert(input){
//             var s = input;
//             var n = s.indexOf('T');
//             return s.substring(0, n != -1 ? n : s.length);
//         }
//         //-----------//

//         if (!$scope.landmark.time.start){
//             $scope.landmark.time.start = "00:00";
//         }

//         if (!$scope.landmark.time.end){
//             $scope.landmark.time.end = "23:59";
//         }

//         $scope.landmark.timetext = {
//             start: $scope.landmark.time.start,
//             end: $scope.landmark.time.end
//         } 

//         $scope.landmark.loc = [$scope.markers.m.lat,$scope.markers.m.lng];

//         db.worlds.create($scope.landmark, function(response){
//             $location.path('/world/'+response[0].id+'/new');
//         });
//     }

//     angular.extend($scope, {
//         amc: global_mapCenter,
//         markers: {
//             m: {
//                 lat: global_mapCenter.lat,
//                 lng: global_mapCenter.lng,
//                 message: "Drag to Location",
//                 focus: true,
//                 draggable: true
//             }
//         }
//     });

//     $scope.landmark = { 
//         stats: { 
//             avatar: "img/tidepools/default.jpg" 
//         },
//         type: $routeParams.type,
//         date: {
//             start: currentDate
//         }
//     };

//     $scope.landmark.loc = [];
// }

// WorldNewCtrl.$inject = ['$location', '$scope', '$routeParams','db'];


/*function WorldNewCtrl($location, $scope, $rootScope, $routeParams, db, leafletData) {

    shelfPan('new');

 
    //Showing form options based on type of "new" request
    if ($routeParams.type == '' || $routeParams.type == 'place' || $routeParams.type == 'event' || $routeParams.type == 'job'){

    }
    else {
        $location.path('/new');
    }


    if (navigator.geolocation) {

        // Get the user's current position
        navigator.geolocation.getCurrentPosition(showPosition, locError, {timeout:50000});

        function showPosition(position) {


            userLat = position.coords.latitude;
            userLon = position.coords.longitude;

            console.log(userLat);

            angular.extend($rootScope, {
                center: {
                    lat: userLat,
                    lng: userLon,
                    zoom: 12
                },
                tiles: tilesDict.mapbox,
                markers: {
                    m: {
                        lat: userLat,
                        lng: userLon,
                        message: "<p style='color:black;'>Drag to Location on map</p>",
                        focus: true,
                        draggable: true,
                        icon: local_icons.yellowIcon
                    }
                }
            });


            refreshMap();
            // angular.extend($scope, {
            //     center: {
            //         lat: userLat,
            //         lng: userLon,
            //         zoom: 18
            //     },
            //     tiles: tilesDict.mapbox,
            // });

            //findBubbles(userLat, userLon);
        }

        function locError(){

            //geo error

            console.log('no loc');
        }

    } else {

        //no geo
        
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


    function refreshMap(){ 
        leafletData.getMap().then(function(map) {
            map.invalidateSize();
        });
    }


    $scope.locsearch = function () {

        console.log('asdf');

          var geocoder = new google.maps.Geocoder();

          if (geocoder) {
             geocoder.geocode({ 'address': $scope.landmark.locsearch}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                    angular.extend($rootScope, { 
                        markers : {}
                    });

                    console.log(results[0].geometry.location.lat());
                        
                    // angular.extend($rootScope, {
                    //     center: {
                    //         lat: results[0].geometry.location.lat(),
                    //         lng: results[0].geometry.location.lng(),
                    //         zoom: 17
                    //     },
                    //     markers: {
                    //         m: {
                    //             lat: results[0].geometry.location.lat(),
                    //             lng: results[0].geometry.location.lng(),
                    //             message: "Drag to Location",
                    //             focus: true,
                    //             draggable: true
                    //         }
                    //     }
                    // });

                    angular.extend($rootScope, {
                        center: {
                            lat: results[0].geometry.location.lat(),
                            lng: results[0].geometry.location.lng(),
                            zoom: 15,
                            autoDiscover:false
                        },
                        markers: {
                            "m": {
                                lat: results[0].geometry.location.lat(),
                                lng: results[0].geometry.location.lng(),
                                message: '<h4>'+ $scope.landmark.locsearch+ '</h4>',
                                focus: true,
                                draggable: true,
                                icon: local_icons.yellowIcon
                            }
                        }
                    });

                    refreshMap();
                   

                } 
                else {
                  console.log('No results found: ' + status);
                }
             });
          }
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

    
        //window.location.href = 'http://aicp.bubbl.li/#/';

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

        $scope.landmark.loc = [$rootScope.markers.m.lat,$rootScope.markers.m.lng];

        db.bubbles.create($scope.landmark, function(response){
            $location.path('/bubble/'+response[0].id+'/new');
        });
    }



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
*/

//WorldNewCtrl.$inject = ['$location', '$scope', '$rootScope','$routeParams','db','leafletData'];





function WorldEditCtrl( $location, $scope, db) {

  

}
WorldEditCtrl.$inject = [ '$location', '$scope', 'db'];




function UserViewCtrl( $location, $scope, db) {

  

}
UserViewCtrl.$inject = [ '$location', '$scope', 'db'];

(function() {

"use strict";

angular.module("leaflet-directive", []).directive('leaflet', ["$q", "leafletData", "leafletMapDefaults", "leafletHelpers", "leafletEvents", function ($q, leafletData, leafletMapDefaults, leafletHelpers, leafletEvents) {
    var _leafletMap;
    return {
        restrict: "EA",
        replace: true,
        scope: {
            center         : '=center',
            defaults       : '=defaults',
            maxbounds      : '=maxbounds',
            bounds         : '=bounds',
            markers        : '=markers',
            legend         : '=legend',
            geojson        : '=geojson',
            paths          : '=paths',
            tiles          : '=tiles',
            layers         : '=layers',
            controls       : '=controls',
            decorations    : '=decorations',
            eventBroadcast : '=eventBroadcast'
        },
        transclude: true,
        template: '<div class="angular-leaflet-map"><div ng-transclude></div></div>',
        controller: ["$scope", function ($scope) {
            _leafletMap = $q.defer();
            this.getMap = function () {
                return _leafletMap.promise;
            };

            this.getLeafletScope = function() {
                return $scope;
            };
        }],

        link: function(scope, element, attrs) {
            var isDefined = leafletHelpers.isDefined,
                defaults = leafletMapDefaults.setDefaults(scope.defaults, attrs.id),
                genDispatchMapEvent = leafletEvents.genDispatchMapEvent,
                mapEvents = leafletEvents.getAvailableMapEvents();

            // Set width and height utility functions
            function updateWidth() {
                if (isNaN(attrs.width)) {
                    element.css('width', attrs.width);
                } else {
                    element.css('width', attrs.width + 'px');
                }
            }

            function updateHeight() {
                if (isNaN(attrs.height)) {
                    element.css('height', attrs.height);
                } else {
                    element.css('height', attrs.height + 'px');
                }
            }

            // If the width attribute defined update css
            // Then watch if bound property changes and update css
            if (isDefined(attrs.width)) {
                updateWidth();

                scope.$watch(
                    function () {
                        return element[0].getAttribute('width');
                    },
                    function () {
                        updateWidth();
                        map.invalidateSize();
                    });
            }

            // If the height attribute defined update css
            // Then watch if bound property changes and update css
            if (isDefined(attrs.height)) {
                updateHeight();

                scope.$watch(
                    function () {
                        return element[0].getAttribute('height');
                    },
                    function () {
                        updateHeight();
                        map.invalidateSize();
                    });
            }

            // Create the Leaflet Map Object with the options
            var map = new L.Map(element[0], leafletMapDefaults.getMapCreationDefaults(attrs.id));
            _leafletMap.resolve(map);

            if (!isDefined(attrs.center)) {
                map.setView([defaults.center.lat, defaults.center.lng], defaults.center.zoom);
            }

            // If no layers nor tiles defined, set the default tileLayer
            if (!isDefined(attrs.tiles) && (!isDefined(attrs.layers))) {
                var tileLayerObj = L.tileLayer(defaults.tileLayer, defaults.tileLayerOptions);
                tileLayerObj.addTo(map);
                leafletData.setTiles(tileLayerObj, attrs.id);
            }

            // Set zoom control configuration
            if (isDefined(map.zoomControl) &&
                isDefined(defaults.zoomControlPosition)) {
                map.zoomControl.setPosition(defaults.zoomControlPosition);
            }

            if (isDefined(map.zoomControl) &&
                defaults.zoomControl===false) {
                map.zoomControl.removeFrom(map);
            }

            if (isDefined(map.zoomsliderControl) &&
                isDefined(defaults.zoomsliderControl) &&
                defaults.zoomsliderControl===false) {
                map.zoomsliderControl.removeFrom(map);
            }


            // if no event-broadcast attribute, all events are broadcasted
            if (!isDefined(attrs.eventBroadcast)) {
                var logic = "broadcast";
                for (var i = 0; i < mapEvents.length; i++) {
                    var eventName = mapEvents[i];
                    map.on(eventName, genDispatchMapEvent(scope, eventName, logic), {
                        eventName: eventName
                    });
                }
            }

            // Resolve the map object to the promises
            map.whenReady(function() {
                leafletData.setMap(map, attrs.id);
            });

            scope.$on('$destroy', function () {
                map.remove();
                leafletData.unresolveMap(attrs.id);
            });

            //Handle request to invalidate the map size
	        //Up scope using $scope.$emit('invalidateSize')
	        //Down scope using $scope.$broadcast('invalidateSize')
            scope.$on('invalidateSize', function() {
                map.invalidateSize();
            });
        }
    };
}]);

angular.module("leaflet-directive").directive('center',
    ["$log", "$q", "$location", "$timeout", "leafletMapDefaults", "leafletHelpers", "leafletBoundsHelpers", "leafletEvents", function ($log, $q, $location, $timeout, leafletMapDefaults, leafletHelpers, leafletBoundsHelpers, leafletEvents) {

    var isDefined     = leafletHelpers.isDefined,
        isNumber      = leafletHelpers.isNumber,
        isSameCenterOnMap = leafletHelpers.isSameCenterOnMap,
        safeApply     = leafletHelpers.safeApply,
        isValidCenter = leafletHelpers.isValidCenter,
        isEmpty       = leafletHelpers.isEmpty,
        isUndefinedOrEmpty = leafletHelpers.isUndefinedOrEmpty;

    var shouldInitializeMapWithBounds = function(bounds, center) {
        return (isDefined(bounds) && !isEmpty(bounds)) && isUndefinedOrEmpty(center);
    };

    var _leafletCenter;
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'leaflet',
        controller: function () {
            _leafletCenter = $q.defer();
            this.getCenter = function() {
                return _leafletCenter.promise;
            };
        },
        link: function(scope, element, attrs, controller) {
            var leafletScope  = controller.getLeafletScope(),
                centerModel   = leafletScope.center;

            controller.getMap().then(function(map) {
                var defaults = leafletMapDefaults.getDefaults(attrs.id);

                if (attrs.center.search("-") !== -1) {
                    $log.error('The "center" variable can\'t use a "-" on his key name: "' + attrs.center + '".');
                    map.setView([defaults.center.lat, defaults.center.lng], defaults.center.zoom);
                    return;
                } else if (shouldInitializeMapWithBounds(leafletScope.bounds, centerModel)) {
                    map.fitBounds(leafletBoundsHelpers.createLeafletBounds(leafletScope.bounds));
                    centerModel = map.getCenter();
                    safeApply(leafletScope, function (scope) {
                        scope.center = {
                            lat: map.getCenter().lat,
                            lng: map.getCenter().lng,
                            zoom: map.getZoom(),
                            autoDiscover: false
                        };
                    });
                    safeApply(leafletScope, function (scope) {
                        var mapBounds = map.getBounds();
                        var newScopeBounds = {
                            northEast: {
                                lat: mapBounds._northEast.lat,
                                lng: mapBounds._northEast.lng
                            },
                            southWest: {
                                lat: mapBounds._southWest.lat,
                                lng: mapBounds._southWest.lng
                            }
                        };
                        scope.bounds = newScopeBounds;
                    });
                } else if (!isDefined(centerModel)) {
                    $log.error('The "center" property is not defined in the main scope');
                    map.setView([defaults.center.lat, defaults.center.lng], defaults.center.zoom);
                    return;
                } else if (!(isDefined(centerModel.lat) && isDefined(centerModel.lng)) && !isDefined(centerModel.autoDiscover)) {
                    angular.copy(defaults.center, centerModel);
                }

                var urlCenterHash, mapReady;
                if (attrs.urlHashCenter === "yes") {
                    var extractCenterFromUrl = function() {
                        var search = $location.search();
                        var centerParam;
                        if (isDefined(search.c)) {
                            var cParam = search.c.split(":");
                            if (cParam.length === 3) {
                                centerParam = { lat: parseFloat(cParam[0]), lng: parseFloat(cParam[1]), zoom: parseInt(cParam[2], 10) };
                            }
                        }
                        return centerParam;
                    };
                    urlCenterHash = extractCenterFromUrl();

                    leafletScope.$on('$locationChangeSuccess', function(event) {
                        var scope = event.currentScope;
                        //$log.debug("updated location...");
                        var urlCenter = extractCenterFromUrl();
                        if (isDefined(urlCenter) && !isSameCenterOnMap(urlCenter, map)) {
                            //$log.debug("updating center model...", urlCenter);
                            scope.center = {
                                lat: urlCenter.lat,
                                lng: urlCenter.lng,
                                zoom: urlCenter.zoom
                            };
                        }
                    });
                }

                leafletScope.$watch("center", function(center) {
                    //$log.debug("updated center model...");
                    // The center from the URL has priority
                    if (isDefined(urlCenterHash)) {
                        angular.copy(urlCenterHash, center);
                        urlCenterHash = undefined;
                    }

                    if (!isValidCenter(center) && center.autoDiscover !== true) {
                        $log.warn("[AngularJS - Leaflet] invalid 'center'");
                        //map.setView([defaults.center.lat, defaults.center.lng], defaults.center.zoom);
                        return;
                    }

                    if (center.autoDiscover === true) {
                        if (!isNumber(center.zoom)) {
                            map.setView([defaults.center.lat, defaults.center.lng], defaults.center.zoom);
                        }
                        if (isNumber(center.zoom) && center.zoom > defaults.center.zoom) {
                            map.locate({ setView: true, maxZoom: center.zoom });
                        } else if (isDefined(defaults.maxZoom)) {
                            map.locate({ setView: true, maxZoom: defaults.maxZoom });
                        } else {
                            map.locate({ setView: true });
                        }
                        return;
                    }

                    if (mapReady && isSameCenterOnMap(center, map)) {
                        //$log.debug("no need to update map again.");
                        return;
                    }

                    //$log.debug("updating map center...", center);
                    leafletScope.settingCenterFromScope = true;
                    map.setView([center.lat, center.lng], center.zoom);
                    leafletEvents.notifyCenterChangedToBounds(leafletScope, map);
                    $timeout(function() {
                        leafletScope.settingCenterFromScope = false;
                        //$log.debug("allow center scope updates");
                    });
                }, true);

                map.whenReady(function() {
                    mapReady = true;
                });

                map.on("moveend", function(/* event */) {
                    // Resolve the center after the first map position
                    _leafletCenter.resolve();
                    leafletEvents.notifyCenterUrlHashChanged(leafletScope, map, attrs, $location.search());
                    //$log.debug("updated center on map...");
                    if (isSameCenterOnMap(centerModel, map) || scope.settingCenterFromScope) {
                        //$log.debug("same center in model, no need to update again.");
                        return;
                    }
                    safeApply(leafletScope, function(scope) {
                        if (!leafletScope.settingCenterFromScope) {
                            //$log.debug("updating center model...", map.getCenter(), map.getZoom());
                            scope.center = {
                                lat: map.getCenter().lat,
                                lng: map.getCenter().lng,
                                zoom: map.getZoom(),
                                autoDiscover: false
                            };
                        }
                        leafletEvents.notifyCenterChangedToBounds(leafletScope, map);
                    });
                });

                if (centerModel.autoDiscover === true) {
                    map.on("locationerror", function() {
                        $log.warn("[AngularJS - Leaflet] The Geolocation API is unauthorized on this page.");
                        if (isValidCenter(centerModel)) {
                            map.setView([centerModel.lat, centerModel.lng], centerModel.zoom);
                            leafletEvents.notifyCenterChangedToBounds(leafletScope, map);
                        } else {
                            map.setView([defaults.center.lat, defaults.center.lng], defaults.center.zoom);
                            leafletEvents.notifyCenterChangedToBounds(leafletScope, map);
                        }
                    });
                }
            });
        }
    };
}]);

angular.module("leaflet-directive").directive('tiles', ["$log", "leafletData", "leafletMapDefaults", "leafletHelpers", function ($log, leafletData, leafletMapDefaults, leafletHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'leaflet',

        link: function(scope, element, attrs, controller) {
            var isDefined = leafletHelpers.isDefined,
                leafletScope  = controller.getLeafletScope(),
                tiles = leafletScope.tiles;

            if (!isDefined(tiles) && !isDefined(tiles.url)) {
                $log.warn("[AngularJS - Leaflet] The 'tiles' definition doesn't have the 'url' property.");
                return;
            }

            controller.getMap().then(function(map) {
                var defaults = leafletMapDefaults.getDefaults(attrs.id);
                var tileLayerObj;
                leafletScope.$watch("tiles", function(tiles) {
                    var tileLayerOptions = defaults.tileLayerOptions;
                    var tileLayerUrl = defaults.tileLayer;

                    // If no valid tiles are in the scope, remove the last layer
                    if (!isDefined(tiles.url) && isDefined(tileLayerObj)) {
                        map.removeLayer(tileLayerObj);
                        return;
                    }

                    // No leafletTiles object defined yet
                    if (!isDefined(tileLayerObj)) {
                        if (isDefined(tiles.options)) {
                            angular.copy(tiles.options, tileLayerOptions);
                        }

                        if (isDefined(tiles.url)) {
                            tileLayerUrl = tiles.url;
                        }

                        tileLayerObj = L.tileLayer(tileLayerUrl, tileLayerOptions);
                        tileLayerObj.addTo(map);
                        leafletData.setTiles(tileLayerObj, attrs.id);
                        return;
                    }

                    // If the options of the tilelayer is changed, we need to redraw the layer
                    if (isDefined(tiles.url) && isDefined(tiles.options) && !angular.equals(tiles.options, tileLayerOptions)) {
                        map.removeLayer(tileLayerObj);
                        tileLayerOptions = defaults.tileLayerOptions;
                        angular.copy(tiles.options, tileLayerOptions);
                        tileLayerUrl = tiles.url;
                        tileLayerObj = L.tileLayer(tileLayerUrl, tileLayerOptions);
                        tileLayerObj.addTo(map);
                        leafletData.setTiles(tileLayerObj, attrs.id);
                        return;
                    }

                    // Only the URL of the layer is changed, update the tiles object
                    if (isDefined(tiles.url)) {
                        tileLayerObj.setUrl(tiles.url);
                    }
                }, true);
            });
        }
    };
}]);

angular.module("leaflet-directive").directive('legend', ["$log", "$http", "leafletHelpers", "leafletLegendHelpers", function ($log, $http, leafletHelpers, leafletLegendHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'leaflet',

        link: function(scope, element, attrs, controller) {
            var isArray      = leafletHelpers.isArray,
                isDefined = leafletHelpers.isDefined,
                isFunction = leafletHelpers.isFunction,
                leafletScope = controller.getLeafletScope(),
                legend       = leafletScope.legend;

            var legendClass = legend.legendClass ? legend.legendClass : "legend";
            var position = legend.position || 'bottomright';
            var leafletLegend;

            controller.getMap().then(function(map) {
                leafletScope.$watch('legend', function (legend) {
                    if (!isDefined(legend.url) && (!isArray(legend.colors) || !isArray(legend.labels) || legend.colors.length !== legend.labels.length)) {
                        $log.warn("[AngularJS - Leaflet] legend.colors and legend.labels must be set.");
                    } else if(isDefined(legend.url)){
                        $log.info("[AngularJS - Leaflet] loading arcgis legend service.");
                    } else {
                        if (isDefined(leafletLegend)) {
						    leafletLegend.removeFrom(map);
						}
                        leafletLegend = L.control({ position: position });
                        leafletLegend.onAdd = leafletLegendHelpers.getOnAddArrayLegend(legend, legendClass);
                        leafletLegend.addTo(map);
                    }
                });

                leafletScope.$watch('legend.url', function(newURL) {
                    if(!isDefined(newURL)) {
                        return;
                    }
                    $http.get(newURL)
                        .success(function(legendData) {
                            if(isDefined(leafletLegend)) {
                                leafletLegendHelpers.updateArcGISLegend(leafletLegend.getContainer(),legendData);
                            } else {
                                leafletLegend = L.control({ position: position });
                                leafletLegend.onAdd = leafletLegendHelpers.getOnAddArcGISLegend(legendData, legendClass);
                                leafletLegend.addTo(map);
                            }
                            if(isDefined(legend.loadedData) && isFunction(legend.loadedData)) {
                                legend.loadedData();
                            }
                        })
                        .error(function() {
                            $log.warn('[AngularJS - Leaflet] legend.url not loaded.');
                        });
                });
            });
        }
    };
}]);

angular.module("leaflet-directive").directive('geojson', ["$log", "$rootScope", "leafletData", "leafletHelpers", function ($log, $rootScope, leafletData, leafletHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'leaflet',

        link: function(scope, element, attrs, controller) {
            var safeApply = leafletHelpers.safeApply,
                isDefined = leafletHelpers.isDefined,
                leafletScope  = controller.getLeafletScope(),
                leafletGeoJSON = {};

            controller.getMap().then(function(map) {
                leafletScope.$watch("geojson", function(geojson) {
                    if (isDefined(leafletGeoJSON) && map.hasLayer(leafletGeoJSON)) {
                        map.removeLayer(leafletGeoJSON);
                    }

                    if (!(isDefined(geojson) && isDefined(geojson.data))) {
                        return;
                    }

                    var resetStyleOnMouseout = geojson.resetStyleOnMouseout,
                        onEachFeature = geojson.onEachFeature;


                    geojson.options = {
                        style: geojson.style,
                        filter: geojson.filter,
                        onEachFeature: onEachFeature,
                        pointToLayer: geojson.pointToLayer
                    };

                    leafletGeoJSON = L.geoJson(geojson.data, geojson.options);
                    leafletData.setGeoJSON(leafletGeoJSON, attrs.id);
                    leafletGeoJSON.addTo(map);

                    if (!onEachFeature) {
                        onEachFeature = function(feature, layer) {
                            if (leafletHelpers.LabelPlugin.isLoaded() && isDefined(geojson.label)) {
                                layer.bindLabel(feature.properties.description);
                            }

                            layer.on({
                                mouseover: function(e) {
                                    safeApply(leafletScope, function() {
                                        geojson.selected = feature;
                                        $rootScope.$broadcast('leafletDirectiveMap.geojsonMouseover', e);
                                    });
                                },
                                mouseout: function(e) {
                                    if (resetStyleOnMouseout) {
                                        leafletGeoJSON.resetStyle(e.target);
                                    }
                                    safeApply(leafletScope, function() {
                                        geojson.selected = undefined;
                                        $rootScope.$broadcast('leafletDirectiveMap.geojsonMouseout', e);
                                    });
                                },
                                click: function(e) {
                                    safeApply(leafletScope, function() {
                                        geojson.selected = feature;
                                        $rootScope.$broadcast('leafletDirectiveMap.geojsonClick', geojson.selected, e);
                                    });
                                }
                            });
                        };
                    }
                }, true);
            });
        }
    };
}]);

angular.module("leaflet-directive").directive('layers', ["$log", "$q", "leafletData", "leafletHelpers", "leafletLayerHelpers", "leafletControlHelpers", function ($log, $q, leafletData, leafletHelpers, leafletLayerHelpers, leafletControlHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'leaflet',
        controller: ["$scope", function ($scope) {
            $scope._leafletLayers = $q.defer();
            this.getLayers = function () {
                return $scope._leafletLayers.promise;
            };
        }],
        link: function(scope, element, attrs, controller){
            var isDefined = leafletHelpers.isDefined,
                leafletLayers = {},
                leafletScope  = controller.getLeafletScope(),
                layers = leafletScope.layers,
                createLayer = leafletLayerHelpers.createLayer,
                updateLayersControl = leafletControlHelpers.updateLayersControl,
                isLayersControlVisible = false;

            controller.getMap().then(function(map) {
                // Do we have a baselayers property?
                if (!isDefined(layers) || !isDefined(layers.baselayers) || Object.keys(layers.baselayers).length === 0) {
                    // No baselayers property
                    $log.error('[AngularJS - Leaflet] At least one baselayer has to be defined');
                    return;
                }

                // We have baselayers to add to the map
                scope._leafletLayers.resolve(leafletLayers);
                leafletData.setLayers(leafletLayers, attrs.id);

                leafletLayers.baselayers = {};
                leafletLayers.overlays = {};

                var mapId = attrs.id;

                // Setup all baselayers definitions
                var oneVisibleLayer = false;
                for (var layerName in layers.baselayers) {
                    var newBaseLayer = createLayer(layers.baselayers[layerName]);
                    if (!isDefined(newBaseLayer)) {
                        delete layers.baselayers[layerName];
                        continue;
                    }
                    leafletLayers.baselayers[layerName] = newBaseLayer;
                    // Only add the visible layer to the map, layer control manages the addition to the map
                    // of layers in its control
                    if (layers.baselayers[layerName].top === true) {
                        map.addLayer(leafletLayers.baselayers[layerName]);
                        oneVisibleLayer = true;
                    }
                }

                // If there is no visible layer add first to the map
                if (!oneVisibleLayer && Object.keys(leafletLayers.baselayers).length > 0) {
                    map.addLayer(leafletLayers.baselayers[Object.keys(layers.baselayers)[0]]);
                }

                // Setup the Overlays
                for (layerName in layers.overlays) {
                    if(layers.overlays[layerName].type === 'cartodb') {

                    }
                    var newOverlayLayer = createLayer(layers.overlays[layerName]);
                    if (!isDefined(newOverlayLayer)) {
                        delete layers.overlays[layerName];
                        continue;
                    }
                    leafletLayers.overlays[layerName] = newOverlayLayer;
                    // Only add the visible overlays to the map
                    if (layers.overlays[layerName].visible === true) {
                        map.addLayer(leafletLayers.overlays[layerName]);
                    }
                }

                // Watch for the base layers
                leafletScope.$watch('layers.baselayers', function(newBaseLayers) {
                    // Delete layers from the array
                    for (var name in leafletLayers.baselayers) {
                        if (!isDefined(newBaseLayers[name])) {
                            // Remove from the map if it's on it
                            if (map.hasLayer(leafletLayers.baselayers[name])) {
                                map.removeLayer(leafletLayers.baselayers[name]);
                            }
                            delete leafletLayers.baselayers[name];
                        }
                    }
                    // add new layers
                    for (var newName in newBaseLayers) {
                        if (!isDefined(leafletLayers.baselayers[newName])) {
                            var testBaseLayer = createLayer(newBaseLayers[newName]);
                            if (isDefined(testBaseLayer)) {
                                leafletLayers.baselayers[newName] = testBaseLayer;
                                // Only add the visible layer to the map
                                if (newBaseLayers[newName].top === true) {
                                    map.addLayer(leafletLayers.baselayers[newName]);
                                }
                            }
                        }
                    }
                    if (Object.keys(leafletLayers.baselayers).length === 0) {
                        $log.error('[AngularJS - Leaflet] At least one baselayer has to be defined');
                        return;
                    }

                    //we have layers, so we need to make, at least, one active
                    var found = false;
                    // search for an active layer
                    for (var key in leafletLayers.baselayers) {
                        if (map.hasLayer(leafletLayers.baselayers[key])) {
                            found = true;
                            break;
                        }
                    }
                    // If there is no active layer make one active
                    if (!found) {
                        map.addLayer(leafletLayers.baselayers[Object.keys(layers.baselayers)[0]]);
                    }

                    // Only show the layers switch selector control if we have more than one baselayer + overlay
                    isLayersControlVisible = updateLayersControl(map, mapId, isLayersControlVisible, newBaseLayers, layers.overlays, leafletLayers);
                }, true);

                // Watch for the overlay layers
                leafletScope.$watch('layers.overlays', function(newOverlayLayers) {
                    // Delete layers from the array
                    for (var name in leafletLayers.overlays) {
                        if (!isDefined(newOverlayLayers[name])) {
                            // Remove from the map if it's on it
                            if (map.hasLayer(leafletLayers.overlays[name])) {
                                map.removeLayer(leafletLayers.overlays[name]);
                            }
                            // TODO: Depending on the layer type we will have to delete what's included on it
                            delete leafletLayers.overlays[name];
                        }
                    }

                    // add new overlays
                    for (var newName in newOverlayLayers) {
                        if (!isDefined(leafletLayers.overlays[newName])) {
                            var testOverlayLayer = createLayer(newOverlayLayers[newName]);
                            if (isDefined(testOverlayLayer)) {
                                leafletLayers.overlays[newName] = testOverlayLayer;
                                if (newOverlayLayers[newName].visible === true) {
                                    map.addLayer(leafletLayers.overlays[newName]);
                                }
                            }
                        }

                        // check for the .visible property to hide/show overLayers
                        if (newOverlayLayers[newName].visible && !map.hasLayer(leafletLayers.overlays[newName])) {
                            map.addLayer(leafletLayers.overlays[newName]);
                        } else if (newOverlayLayers[newName].visible === false && map.hasLayer(leafletLayers.overlays[newName])) {
                            map.removeLayer(leafletLayers.overlays[newName]);
                        }
                    }

                    // Only add the layers switch selector control if we have more than one baselayer + overlay
                    isLayersControlVisible = updateLayersControl(map, mapId, isLayersControlVisible, layers.baselayers, newOverlayLayers, leafletLayers);
                }, true);
            });
        }
    };
}]);

angular.module("leaflet-directive").directive('bounds', ["$log", "$timeout", "leafletHelpers", "leafletBoundsHelpers", function ($log, $timeout, leafletHelpers, leafletBoundsHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: [ 'leaflet', 'center' ],

        link: function(scope, element, attrs, controller) {
            var isDefined = leafletHelpers.isDefined,
                createLeafletBounds = leafletBoundsHelpers.createLeafletBounds,
                leafletScope = controller[0].getLeafletScope(),
                mapController = controller[0];

            var emptyBounds = function(bounds) {
                if (bounds._southWest.lat === 0 && bounds._southWest.lng === 0 && bounds._northEast.lat === 0 && bounds._northEast.lng === 0) {
                    return true;
                }
                return false;
            };

            mapController.getMap().then(function (map) {
                leafletScope.$on('boundsChanged', function (event) {
                    var scope = event.currentScope;
                    var bounds = map.getBounds();
                    //$log.debug('updated map bounds...', bounds);
                    if (emptyBounds(bounds) || scope.settingBoundsFromScope) {
                        return;
                    }
                    var newScopeBounds = {
                        northEast: {
                            lat: bounds._northEast.lat,
                            lng: bounds._northEast.lng
                        },
                        southWest: {
                            lat: bounds._southWest.lat,
                            lng: bounds._southWest.lng
                        }
                    };
                    if (!angular.equals(scope.bounds, newScopeBounds)) {
                        //$log.debug('Need to update scope bounds.');
                        scope.bounds = newScopeBounds;
                    }
                });
                leafletScope.$watch('bounds', function (bounds) {
                    //$log.debug('updated bounds...', bounds);
                    if (!isDefined(bounds)) {
                        $log.error('[AngularJS - Leaflet] Invalid bounds');
                        return;
                    }
                    var leafletBounds = createLeafletBounds(bounds);
                    if (leafletBounds && !map.getBounds().equals(leafletBounds)) {
                        //$log.debug('Need to update map bounds.');
                        scope.settingBoundsFromScope = true;
                        map.fitBounds(leafletBounds);
                        $timeout( function() {
                            //$log.debug('Allow bound updates.');
                            scope.settingBoundsFromScope = false;
                        });
                    }
                }, true);
            });
        }
    };
}]);

angular.module("leaflet-directive").directive('markers', ["$log", "$rootScope", "$q", "leafletData", "leafletHelpers", "leafletMapDefaults", "leafletMarkersHelpers", "leafletEvents", function ($log, $rootScope, $q, leafletData, leafletHelpers, leafletMapDefaults, leafletMarkersHelpers, leafletEvents) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: ['leaflet', '?layers'],

        link: function(scope, element, attrs, controller) {
            var mapController = controller[0],
                Helpers = leafletHelpers,
                isDefined = leafletHelpers.isDefined,
                isString = leafletHelpers.isString,
                leafletScope  = mapController.getLeafletScope(),
                deleteMarker = leafletMarkersHelpers.deleteMarker,
                addMarkerWatcher = leafletMarkersHelpers.addMarkerWatcher,
                listenMarkerEvents = leafletMarkersHelpers.listenMarkerEvents,
                addMarkerToGroup = leafletMarkersHelpers.addMarkerToGroup,
                bindMarkerEvents = leafletEvents.bindMarkerEvents,
                createMarker = leafletMarkersHelpers.createMarker;

            mapController.getMap().then(function(map) {
                var leafletMarkers = {},
                    getLayers;

                // If the layers attribute is used, we must wait until the layers are created
                if (isDefined(controller[1])) {
                    getLayers = controller[1].getLayers;
                } else {
                    getLayers = function() {
                        var deferred = $q.defer();
                        deferred.resolve();
                        return deferred.promise;
                    };
                }

                getLayers().then(function(layers) {
                    leafletData.setMarkers(leafletMarkers, attrs.id);
                    leafletScope.$watch('markers', function(newMarkers) {
                        // Delete markers from the array
                        for (var name in leafletMarkers) {
                            if (!isDefined(newMarkers) || !isDefined(newMarkers[name])) {
                                deleteMarker(leafletMarkers[name], map, layers);
                                delete leafletMarkers[name];
                            }
                        }

                        // add new markers
                        for (var newName in newMarkers) {
                            if (newName.search("-") !== -1) {
                                $log.error('The marker can\'t use a "-" on his key name: "' + newName + '".');
                                continue;
                            }

                            if (!isDefined(leafletMarkers[newName])) {
                                var markerData = newMarkers[newName];
                                var marker = createMarker(markerData);
                                if (!isDefined(marker)) {
                                    $log.error('[AngularJS - Leaflet] Received invalid data on the marker ' + newName + '.');
                                    continue;
                                }
                                leafletMarkers[newName] = marker;

                                // Bind message
                                if (isDefined(markerData.message)) {
                                    marker.bindPopup(markerData.message, markerData.popupOptions);
                                }

                                // Add the marker to a cluster group if needed
                                if (isDefined(markerData.group)) {
                                    var groupOptions = isDefined(markerData.groupOption) ? markerData.groupOption : null;
                                    addMarkerToGroup(marker, markerData.group, groupOptions, map);
                                }

                                // Show label if defined
                                if (Helpers.LabelPlugin.isLoaded() && isDefined(markerData.label) && isDefined(markerData.label.message)) {
                                    marker.bindLabel(markerData.label.message, markerData.label.options);
                                }

                                // Check if the marker should be added to a layer
                                if (isDefined(markerData) && isDefined(markerData.layer)) {
                                    if (!isString(markerData.layer)) {
                                        $log.error('[AngularJS - Leaflet] A layername must be a string');
                                        continue;
                                    }
                                    if (!isDefined(layers)) {
                                        $log.error('[AngularJS - Leaflet] You must add layers to the directive if the markers are going to use this functionality.');
                                        continue;
                                    }

                                    if (!isDefined(layers.overlays) || !isDefined(layers.overlays[markerData.layer])) {
                                        $log.error('[AngularJS - Leaflet] A marker can only be added to a layer of type "group"');
                                        continue;
                                    }
                                    var layerGroup = layers.overlays[markerData.layer];
                                    if (!(layerGroup instanceof L.LayerGroup || layerGroup instanceof L.FeatureGroup)) {
                                        $log.error('[AngularJS - Leaflet] Adding a marker to an overlay needs a overlay of the type "group" or "featureGroup"');
                                        continue;
                                    }

                                    // The marker goes to a correct layer group, so first of all we add it
                                    layerGroup.addLayer(marker);

                                    // The marker is automatically added to the map depending on the visibility
                                    // of the layer, so we only have to open the popup if the marker is in the map
                                    if (map.hasLayer(marker) && markerData.focus === true) {
                                        marker.openPopup();
                                    }

                                // Add the marker to the map if it hasn't been added to a layer or to a group
                                } else if (!isDefined(markerData.group)) {
                                    // We do not have a layer attr, so the marker goes to the map layer
                                    map.addLayer(marker);
                                    if (markerData.focus === true) {
                                        marker.openPopup();
                                    }
                                    if (Helpers.LabelPlugin.isLoaded() && isDefined(markerData.label) && isDefined(markerData.label.options) && markerData.label.options.noHide === true) {
                                        marker.showLabel();
                                    }
                                }

                                // Should we watch for every specific marker on the map?
                                var shouldWatch = (!isDefined(attrs.watchMarkers) || attrs.watchMarkers === 'true');

                                if (shouldWatch) {
                                    addMarkerWatcher(marker, newName, leafletScope, layers, map);
                                    listenMarkerEvents(marker, markerData, leafletScope);
                                }
                                bindMarkerEvents(marker, newName, markerData, leafletScope);
                            }
                        }
                    }, true);
                });
            });
        }
    };
}]);

angular.module("leaflet-directive").directive('paths', ["$log", "$q", "leafletData", "leafletMapDefaults", "leafletHelpers", "leafletPathsHelpers", "leafletEvents", function ($log, $q, leafletData, leafletMapDefaults, leafletHelpers, leafletPathsHelpers, leafletEvents) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: ['leaflet', '?layers'],

        link: function(scope, element, attrs, controller) {
            var mapController = controller[0],
                isDefined = leafletHelpers.isDefined,
                isString = leafletHelpers.isString,
                leafletScope  = mapController.getLeafletScope(),
                paths     = leafletScope.paths,
                createPath = leafletPathsHelpers.createPath,
                bindPathEvents = leafletEvents.bindPathEvents,
                setPathOptions = leafletPathsHelpers.setPathOptions;

            mapController.getMap().then(function(map) {
                var defaults = leafletMapDefaults.getDefaults(attrs.id),
                    getLayers;

                // If the layers attribute is used, we must wait until the layers are created
                if (isDefined(controller[1])) {
                    getLayers = controller[1].getLayers;
                } else {
                    getLayers = function() {
                        var deferred = $q.defer();
                        deferred.resolve();
                        return deferred.promise;
                    };
                }

                if (!isDefined(paths)) {
                    return;
                }

                getLayers().then(function(layers) {

                    var leafletPaths = {};
                    leafletData.setPaths(leafletPaths, attrs.id);

                    // Function for listening every single path once created
                    var watchPathFn = function(leafletPath, name) {
                        var clearWatch = leafletScope.$watch('paths.' + name, function(pathData) {
                            if (!isDefined(pathData)) {
                                map.removeLayer(leafletPath);
                                clearWatch();
                                return;
                            }
                            setPathOptions(leafletPath, pathData.type, pathData);
                        }, true);
                    };

                    leafletScope.$watch("paths", function (newPaths) {

                        // Create the new paths
                        for (var newName in newPaths) {
                            if (newName.search('\\$') === 0) {
                                continue;
                            }
                            if (newName.search("-") !== -1) {
                                $log.error('[AngularJS - Leaflet] The path name "' + newName + '" is not valid. It must not include "-" and a number.');
                                continue;
                            }

                            if (!isDefined(leafletPaths[newName])) {
                                var pathData = newPaths[newName];
                                var newPath = createPath(newName, newPaths[newName], defaults);

                                // bind popup if defined
                                if (isDefined(newPath) && isDefined(pathData.message)) {
                                    newPath.bindPopup(pathData.message);
                                }

                                // Show label if defined
                                if (leafletHelpers.LabelPlugin.isLoaded() && isDefined(pathData.label) && isDefined(pathData.label.message)) {
                                    newPath.bindLabel(pathData.label.message, pathData.label.options);
                                }

                                // Check if the marker should be added to a layer
                                if (isDefined(pathData) && isDefined(pathData.layer)) {

                                    if (!isString(pathData.layer)) {
                                        $log.error('[AngularJS - Leaflet] A layername must be a string');
                                        continue;
                                    }
                                    if (!isDefined(layers)) {
                                        $log.error('[AngularJS - Leaflet] You must add layers to the directive if the markers are going to use this functionality.');
                                        continue;
                                    }

                                    if (!isDefined(layers.overlays) || !isDefined(layers.overlays[pathData.layer])) {
                                        $log.error('[AngularJS - Leaflet] A marker can only be added to a layer of type "group"');
                                        continue;
                                    }
                                    var layerGroup = layers.overlays[pathData.layer];
                                    if (!(layerGroup instanceof L.LayerGroup || layerGroup instanceof L.FeatureGroup)) {
                                        $log.error('[AngularJS - Leaflet] Adding a marker to an overlay needs a overlay of the type "group" or "featureGroup"');
                                        continue;
                                    }

                                    // Listen for changes on the new path
                                    leafletPaths[newName] = newPath;
                                    // The path goes to a correct layer group, so first of all we add it
                                    layerGroup.addLayer(newPath);

                                    watchPathFn(newPath, newName);
                                } else if (isDefined(newPath)) {
                                    // Listen for changes on the new path
                                    leafletPaths[newName] = newPath;
                                    map.addLayer(newPath);
                                    watchPathFn(newPath, newName);
                                }

                                bindPathEvents(newPath, newName, pathData, leafletScope);
                            }
                        }

                        // Delete paths (by name) from the array
                        for (var name in leafletPaths) {
                            if (!isDefined(newPaths[name])) {
                                delete leafletPaths[name];
                            }
                        }

                    }, true);

                });
            });
        }
    };
}]);

angular.module("leaflet-directive").directive('controls', ["$log", "leafletHelpers", function ($log, leafletHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: '?^leaflet',

        link: function(scope, element, attrs, controller) {
            if(!controller) {
                return;
            }

            var isDefined = leafletHelpers.isDefined,
                leafletScope  = controller.getLeafletScope(),
                controls = leafletScope.controls;

            controller.getMap().then(function(map) {
                if (isDefined(L.Control.Draw) && isDefined(controls.draw)) {
                    var drawnItems = new L.FeatureGroup();
                    var options = {
                        edit: {
                            featureGroup: drawnItems
                        }
                    };
                    angular.extend(options, controls.draw);
                    controls.draw = options;
                    map.addLayer(options.edit.featureGroup);

                    var drawControl = new L.Control.Draw(options);
                    map.addControl(drawControl);
                }

                if(isDefined(controls.custom)) {
                    for(var i in controls.custom) {
                        map.addControl(controls.custom[i]);
                    }
                }
            });
        }
    };
}]);

angular.module("leaflet-directive").directive('eventBroadcast', ["$log", "$rootScope", "leafletHelpers", "leafletEvents", function ($log, $rootScope, leafletHelpers, leafletEvents) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'leaflet',

        link: function(scope, element, attrs, controller) {
            var isObject = leafletHelpers.isObject,
                leafletScope  = controller.getLeafletScope(),
                eventBroadcast = leafletScope.eventBroadcast,
                availableMapEvents = leafletEvents.getAvailableMapEvents(),
                genDispatchMapEvent = leafletEvents.genDispatchMapEvent;

            controller.getMap().then(function(map) {

                var mapEvents = [];
                var i;
                var eventName;
                var logic = "broadcast";

                if (isObject(eventBroadcast)) {
                    // We have a possible valid object
                    if (eventBroadcast.map === undefined || eventBroadcast.map === null) {
                        // We do not have events enable/disable do we do nothing (all enabled by default)
                        mapEvents = availableMapEvents;
                    } else if (typeof eventBroadcast.map !== 'object') {
                        // Not a valid object
                        $log.warn("[AngularJS - Leaflet] event-broadcast.map must be an object check your model.");
                    } else {
                        // We have a possible valid map object
                        // Event propadation logic
                        if (eventBroadcast.map.logic !== undefined && eventBroadcast.map.logic !== null) {
                            // We take care of possible propagation logic
                            if (eventBroadcast.map.logic !== "emit" && eventBroadcast.map.logic !== "broadcast") {
                                // This is an error
                                $log.warn("[AngularJS - Leaflet] Available event propagation logic are: 'emit' or 'broadcast'.");
                            } else if (eventBroadcast.map.logic === "emit") {
                                logic = "emit";
                            }
                        }
                        // Enable / Disable
                        var mapEventsEnable = false, mapEventsDisable = false;
                        if (eventBroadcast.map.enable !== undefined && eventBroadcast.map.enable !== null) {
                            if (typeof eventBroadcast.map.enable === 'object') {
                                mapEventsEnable = true;
                            }
                        }
                        if (eventBroadcast.map.disable !== undefined && eventBroadcast.map.disable !== null) {
                            if (typeof eventBroadcast.map.disable === 'object') {
                                mapEventsDisable = true;
                            }
                        }
                        if (mapEventsEnable && mapEventsDisable) {
                            // Both are active, this is an error
                            $log.warn("[AngularJS - Leaflet] can not enable and disable events at the time");
                        } else if (!mapEventsEnable && !mapEventsDisable) {
                            // Both are inactive, this is an error
                            $log.warn("[AngularJS - Leaflet] must enable or disable events");
                        } else {
                            // At this point the map object is OK, lets enable or disable events
                            if (mapEventsEnable) {
                                // Enable events
                                for (i = 0; i < eventBroadcast.map.enable.length; i++) {
                                    eventName = eventBroadcast.map.enable[i];
                                    // Do we have already the event enabled?
                                    if (mapEvents.indexOf(eventName) !== -1) {
                                        // Repeated event, this is an error
                                        $log.warn("[AngularJS - Leaflet] This event " + eventName + " is already enabled");
                                    } else {
                                        // Does the event exists?
                                        if (availableMapEvents.indexOf(eventName) === -1) {
                                            // The event does not exists, this is an error
                                            $log.warn("[AngularJS - Leaflet] This event " + eventName + " does not exist");
                                        } else {
                                            // All ok enable the event
                                            mapEvents.push(eventName);
                                        }
                                    }
                                }
                            } else {
                                // Disable events
                                mapEvents = availableMapEvents;
                                for (i = 0; i < eventBroadcast.map.disable.length; i++) {
                                    eventName = eventBroadcast.map.disable[i];
                                    var index = mapEvents.indexOf(eventName);
                                    if (index === -1) {
                                        // The event does not exist
                                        $log.warn("[AngularJS - Leaflet] This event " + eventName + " does not exist or has been already disabled");
                                    } else {
                                        mapEvents.splice(index, 1);
                                    }
                                }
                            }
                        }
                    }

                    for (i = 0; i < mapEvents.length; i++) {
                        eventName = mapEvents[i];
                        map.on(eventName, genDispatchMapEvent(leafletScope, eventName, logic), {
                            eventName: eventName
                        });
                    }
                } else {
                    // Not a valid object
                    $log.warn("[AngularJS - Leaflet] event-broadcast must be an object, check your model.");
                }
            });
        }
    };
}]);

angular.module("leaflet-directive").directive('maxbounds', ["$log", "leafletMapDefaults", "leafletBoundsHelpers", function ($log, leafletMapDefaults, leafletBoundsHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'leaflet',

        link: function(scope, element, attrs, controller) {
            var leafletScope  = controller.getLeafletScope(),
                isValidBounds = leafletBoundsHelpers.isValidBounds;


            controller.getMap().then(function(map) {
                leafletScope.$watch("maxbounds", function (maxbounds) {
                    if (!isValidBounds(maxbounds)) {
                        // Unset any previous maxbounds
                        map.setMaxBounds();
                        return;
                    }
                    var bounds = [
                        [ maxbounds.southWest.lat, maxbounds.southWest.lng ],
                        [ maxbounds.northEast.lat, maxbounds.northEast.lng ]
                    ];

                    map.setMaxBounds(bounds);
                    if (!attrs.center) {
                            map.fitBounds(bounds);
                        }
                });
            });
        }
    };
}]);

angular.module("leaflet-directive").directive("decorations", ["$log", "leafletHelpers", function($log, leafletHelpers) {
	return {
		restrict: "A", 
		scope: false,
		replace: false,
		require: 'leaflet',

		link: function(scope, element, attrs, controller) {
			var leafletScope = controller.getLeafletScope(),
				PolylineDecoratorPlugin = leafletHelpers.PolylineDecoratorPlugin,
				isDefined = leafletHelpers.isDefined,
				leafletDecorations = {};

			/* Creates an "empty" decoration with a set of coordinates, but no pattern. */
			function createDecoration(options) {
				if (isDefined(options) && isDefined(options.coordinates)) {
					if (!PolylineDecoratorPlugin.isLoaded()) {
						$log.error('[AngularJS - Leaflet] The PolylineDecorator Plugin is not loaded.');
					}
				}

				return L.polylineDecorator(options.coordinates);
			}

			/* Updates the path and the patterns for the provided decoration, and returns the decoration. */
			function setDecorationOptions(decoration, options) {
				if (isDefined(decoration) && isDefined(options)) {
					if (isDefined(options.coordinates) && isDefined(options.patterns)) {
						decoration.setPaths(options.coordinates);
						decoration.setPatterns(options.patterns);
						return decoration;
					}
				}
			}

			controller.getMap().then(function(map) {
				leafletScope.$watch("decorations", function(newDecorations) {
					for (var name in leafletDecorations) {
						if (!isDefined(newDecorations) || !isDefined(newDecorations[name])) {
							delete leafletDecorations[name];
						}
						map.removeLayer(leafletDecorations[name]);
					}
					
					for (var newName in newDecorations) {
						var decorationData = newDecorations[newName],
							newDecoration = createDecoration(decorationData);

						if (isDefined(newDecoration)) {
							leafletDecorations[newName] = newDecoration;
							map.addLayer(newDecoration);
							setDecorationOptions(newDecoration, decorationData);
						}
					}
				}, true);
			});
		}
	};
}]);
angular.module("leaflet-directive").directive('layercontrol', ["$log", "leafletData", "leafletHelpers", function ($log, leafletData, leafletHelpers) {
  return {
    restrict: "E",
    scope: {
    },
    replace: true,
    transclude: false,
    require: '^leaflet',
    controller: ["$scope", "$element", "$sce", function ($scope, $element, $sce) {
      $log.debug('[Angular Directive - Layers] layers', $scope, $element);
      var safeApply = leafletHelpers.safeApply,
        isDefined = leafletHelpers.isDefined;
      angular.extend($scope, {
        baselayer: '',
        icons: {
          uncheck: 'fa fa-check-square-o',
          check: 'fa fa-square-o',
          radio: 'fa fa-dot-circle-o',
          unradio: 'fa fa-circle-o',
          up: 'fa fa-angle-up',
          down: 'fa fa-angle-down',
          open: 'fa fa-angle-double-down',
          close: 'fa fa-angle-double-up'
        },
        changeBaseLayer: function(key, e) {
          leafletHelpers.safeApply($scope, function(scp) {
            scp.baselayer = key;
            leafletData.getMap().then(function(map) {
              leafletData.getLayers().then(function(leafletLayers) {
                if(map.hasLayer(leafletLayers.baselayers[key])) {
                  return;
                }
                for(var i in scp.layers.baselayers) {
                  scp.layers.baselayers[i].icon = scp.icons.unradio;
                  if(map.hasLayer(leafletLayers.baselayers[i])) {
                    map.removeLayer(leafletLayers.baselayers[i]);
                  }
                }
                map.addLayer(leafletLayers.baselayers[key]);
                scp.layers.baselayers[key].icon = $scope.icons.radio;
              });
            });
          });
          e.preventDefault();
        },
        moveLayer: function(ly, newIndex, e) {
            var delta = Object.keys($scope.layers.baselayers).length;
            if(newIndex >= (1+delta) && newIndex <= ($scope.overlaysArray.length+delta)) {
                var oldLy;
                for(var key in $scope.layers.overlays) {
                    if($scope.layers.overlays[key].index === newIndex) {
                        oldLy = $scope.layers.overlays[key];
                        break;
                    }
                }
                if(oldLy) {
                    safeApply($scope, function() {
                        oldLy.index = ly.index;
                        ly.index = newIndex;
                    });
                }
            }
            e.stopPropagation();
            e.preventDefault();
        },
        initIndex: function(layer, idx) {
            var delta = Object.keys($scope.layers.baselayers).length;
            layer.index = isDefined(layer.index)? layer.index:idx+delta+1;
        },
        toggleOpacity: function(e, layer) {
            $log.debug('Event', e);
            if(layer.visible) {
                var el = angular.element(e.currentTarget);
                el.toggleClass($scope.icons.close + ' ' + $scope.icons.open);
                el = el.parents('.lf-row').find('.lf-opacity');
                el.toggle('fast', function() {
                    safeApply($scope, function() {
                        layer.opacityControl = !layer.opacityControl;
                    });
                });
            }
            e.stopPropagation();
            e.preventDefault();
        },
        unsafeHTML: function(html) {
          return $sce.trustAsHtml(html);
        }
      });

      var div = $element.get(0);
      if (!L.Browser.touch) {
          L.DomEvent.disableClickPropagation(div);
          L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation);
      } else {
          L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation);
      }
    }],
    template:
      '<div class="angular-leaflet-control-layers" ng-show="overlaysArray.length">' +
        '<div class="lf-baselayers">' +
            '<div class="lf-row" ng-repeat="(key, layer) in layers.baselayers">' +
                '<label class="lf-icon-bl" ng-click="changeBaseLayer(key, $event)">' +
                    '<input class="leaflet-control-layers-selector" type="radio" name="lf-radio" ' +
                        'ng-show="false" ng-checked="baselayer === key" ng-value="key" /> ' +
                    '<i class="lf-icon lf-icon-radio" ng-class="layer.icon"></i>' +
                    '<div class="lf-text">{{layer.name}}</div>' +
                '</label>' +
            '</div>' +
        '</div>' +
        '<div class="lf-overlays">' +
            '<div class="lf-container">' +
                '<div class="lf-row" ng-repeat="layer in overlaysArray | orderBy:\'index\':order" ng-init="initIndex(layer, $index)">' +
                    '<label class="lf-icon-ol">' +
                        '<input class="lf-control-layers-selector" type="checkbox" ng-show="false" ng-model="layer.visible"/> ' +
                        '<i class="lf-icon lf-icon-check" ng-class="layer.icon"></i>' +
                        '<div class="lf-text">{{layer.name}}</div>' +
                        '<div class="lf-icons">' +
                            '<i class="lf-icon lf-up" ng-class="icons.up" ng-click="moveLayer(layer, layer.index - orderNumber, $event)"></i> ' +
                            '<i class="lf-icon lf-down" ng-class="icons.down" ng-click="moveLayer(layer, layer.index + orderNumber, $event)"></i> ' +
                            '<i class="lf-icon lf-open" ng-class="layer.opacityControl? icons.close:icons.open" ng-click="toggleOpacity($event, layer)"></i>' +
                        '</div>' +
                    '</label>'+
                    '<div class="lf-legend" ng-if="layer.legend" ng-bind-html="unsafeHTML(layer.legend)"></div>' +
                    '<div class="lf-opacity" ng-show="layer.visible &amp;&amp; layer.opacityControl">' +
                        '<input type="text" class="lf-opacity-control" name="lf-opacity-control" data-key="{{layer.index}}" />' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
      '</div>',
    link: function(scope, element, attrs, controller) {
        var isDefined = leafletHelpers.isDefined,
        leafletScope = controller.getLeafletScope(),
        layers = leafletScope.layers;

        // Setting layer stack order.
        attrs.order = (isDefined(attrs.order) && (attrs.order === 'normal' || attrs.order === 'reverse'))? attrs.order:'normal';
        scope.order = attrs.order === 'normal';
        scope.orderNumber = attrs.order === 'normal'? -1:1;

        scope.layers = layers;
        controller.getMap().then(function(map) {
            // Do we have a baselayers property?
            if (!isDefined(layers) || !isDefined(layers.baselayers) || Object.keys(layers.baselayers).length === 0) {
                // No baselayers property
                $log.error('[AngularJS - Leaflet] At least one baselayer has to be defined');
                return;
            }

            leafletScope.$watch('layers.baselayers', function(newBaseLayers) {
                leafletData.getLayers().then(function(leafletLayers) {
                    var key;
                    for(key in newBaseLayers) {
                      if(map.hasLayer(leafletLayers.baselayers[key])) {
                        newBaseLayers[key].icon = scope.icons.radio;
                      } else {
                        newBaseLayers[key].icon = scope.icons.unradio;
                      }
                    }
                });
            });

            leafletScope.$watch('layers.overlays', function(newOverlayLayers) {
                var overlaysArray = [];
                leafletData.getLayers().then(function(leafletLayers) {
                    for(var key in newOverlayLayers) {
                        newOverlayLayers[key].icon = scope.icons[(newOverlayLayers[key].visible? 'uncheck':'check')];
                        overlaysArray.push(newOverlayLayers[key]);
                        if(isDefined(newOverlayLayers[key].index) && leafletLayers.overlays[key].setZIndex) {
                            leafletLayers.overlays[key].setZIndex(newOverlayLayers[key].index);
                        }
                    }
                });

                var unreg = scope.$watch(function() {
                    if(element.children().size() > 1) {
                        element.find('.lf-overlays').trigger('resize');
                        return element.find('.lf-opacity').size() === Object.keys(layers.overlays).length;
                    }
                }, function(el) {
                    if(el === true) {
                        if(isDefined(element.find('.lf-opacity-control').ionRangeSlider)) {
                            element.find('.lf-opacity-control').each(function(idx, inp) {
                                var delta =  Object.keys(layers.baselayers).length,
                                    lyAux;
                                for(var key in scope.overlaysArray) {
                                    if(scope.overlaysArray[key].index === idx+delta+1) {
                                        lyAux = scope.overlaysArray[key];
                                    }
                                }

                                var input = angular.element(inp),
                                    op = isDefined(lyAux) && isDefined(lyAux.layerOptions)?
                                        lyAux.layerOptions.opacity:undefined;
                                input.ionRangeSlider({
                                    min: 0,
                                    from: isDefined(op)? Math.ceil(op*100):100,
                                    step: 1,
                                    max: 100,
                                    prettify: false,
                                    hasGrid: false,
                                    hideMinMax: true,
                                    onChange: function(val) {
                                        leafletData.getLayers().then(function(leafletLayers) {
                                            var key = val.input.data().key;
                                            var ly, layer;
                                            for(var k in layers.overlays) {
                                                if(layers.overlays[k].index === key) {
                                                    ly = leafletLayers.overlays[k];
                                                    layer = layers.overlays[k];
                                                    break;
                                                }
                                            }
                                            if(map.hasLayer(ly)) {
                                                layer.layerOptions = isDefined(layer.layerOptions)? layer.layerOptions:{};
                                                layer.layerOptions.opacity = val.input.val()/100;
                                                if(ly.setOpacity) {
                                                    ly.setOpacity(val.input.val()/100);
                                                }
                                                if(ly.getLayers && ly.eachLayer) {
                                                    ly.eachLayer(function(lay) {
                                                        if(lay.setOpacity) {
                                                            lay.setOpacity(val.input.val()/100);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                });
                            });
                        } else {
                            $log.warn('[AngularJS - Leaflet] Ion Slide Range Plugin is not loaded');
                        }
                        unreg();
                    }
                });

                scope.overlaysArray = overlaysArray;
            }, true);
        });
    }
  };
}]);

angular.module("leaflet-directive").service('leafletData', ["$log", "$q", "leafletHelpers", function ($log, $q, leafletHelpers) {
    var getDefer = leafletHelpers.getDefer,
        getUnresolvedDefer = leafletHelpers.getUnresolvedDefer,
        setResolvedDefer = leafletHelpers.setResolvedDefer;

    var maps = {};
    var tiles = {};
    var layers = {};
    var paths = {};
    var markers = {};
    var geoJSON = {};
    var utfGrid = {};
    var decorations = {};

    this.setMap = function(leafletMap, scopeId) {
        var defer = getUnresolvedDefer(maps, scopeId);
        defer.resolve(leafletMap);
        setResolvedDefer(maps, scopeId);
    };

    this.getMap = function(scopeId) {
        var defer = getDefer(maps, scopeId);
        return defer.promise;
    };

    this.unresolveMap = function (scopeId) {
        var id = leafletHelpers.obtainEffectiveMapId(maps, scopeId);
        maps[id] = undefined;
    };

    this.getPaths = function(scopeId) {
        var defer = getDefer(paths, scopeId);
        return defer.promise;
    };

    this.setPaths = function(leafletPaths, scopeId) {
        var defer = getUnresolvedDefer(paths, scopeId);
        defer.resolve(leafletPaths);
        setResolvedDefer(paths, scopeId);
    };

    this.getMarkers = function(scopeId) {
        var defer = getDefer(markers, scopeId);
        return defer.promise;
    };

    this.setMarkers = function(leafletMarkers, scopeId) {
        var defer = getUnresolvedDefer(markers, scopeId);
        defer.resolve(leafletMarkers);
        setResolvedDefer(markers, scopeId);
    };

    this.getLayers = function(scopeId) {
        var defer = getDefer(layers, scopeId);
        return defer.promise;
    };

    this.setLayers = function(leafletLayers, scopeId) {
        var defer = getUnresolvedDefer(layers, scopeId);
        defer.resolve(leafletLayers);
        setResolvedDefer(layers, scopeId);
    };
    
    this.getUTFGrid = function(scopeId) {
        var defer = getDefer(utfGrid, scopeId);
        return defer.promise;
    };
    
    this.setUTFGrid = function(leafletUTFGrid, scopeId) {
        var defer = getUnresolvedDefer(utfGrid, scopeId);
        defer.resolve(leafletUTFGrid);
        setResolvedDefer(utfGrid, scopeId);
    };

    this.setTiles = function(leafletTiles, scopeId) {
        var defer = getUnresolvedDefer(tiles, scopeId);
        defer.resolve(leafletTiles);
        setResolvedDefer(tiles, scopeId);
    };

    this.getTiles = function(scopeId) {
        var defer = getDefer(tiles, scopeId);
        return defer.promise;
    };

    this.setGeoJSON = function(leafletGeoJSON, scopeId) {
        var defer = getUnresolvedDefer(geoJSON, scopeId);
        defer.resolve(leafletGeoJSON);
        setResolvedDefer(geoJSON, scopeId);
    };

    this.getGeoJSON = function(scopeId) {
        var defer = getDefer(geoJSON, scopeId);
        return defer.promise;
    };

    this.setDecorations = function(leafletDecorations, scopeId) {
        var defer = getUnresolvedDefer(decorations, scopeId);
        defer.resolve(leafletDecorations);
        setResolvedDefer(decorations, scopeId);
    };

    this.getDecorations = function(scopeId) {
        var defer = getDefer(decorations, scopeId);
        return defer.promise;
    };
}]);

angular.module("leaflet-directive").factory('leafletMapDefaults', ["$q", "leafletHelpers", function ($q, leafletHelpers) {
    function _getDefaults() {
        return {
            keyboard: true,
            dragging: true,
            worldCopyJump: false,
            doubleClickZoom: true,
            scrollWheelZoom: true,
            touchZoom: true,
            zoomControl: true,
            zoomsliderControl: false,
            zoomControlPosition: 'topleft',
            attributionControl: true,
            controls: {
                layers: {
                    visible: true,
                    position: 'topright',
                    collapsed: true
                }
            },
            crs: L.CRS.EPSG3857,
            tileLayer: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            tileLayerOptions: {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            },
            path: {
                weight: 10,
                opacity: 1,
                color: '#0000ff'
            },
            center: {
                lat: 0,
                lng: 0,
                zoom: 1
            }
        };
    }

    var isDefined = leafletHelpers.isDefined,
        isObject = leafletHelpers.isObject,
        obtainEffectiveMapId = leafletHelpers.obtainEffectiveMapId,
        defaults = {};

    // Get the _defaults dictionary, and override the properties defined by the user
    return {
        getDefaults: function (scopeId) {
            var mapId = obtainEffectiveMapId(defaults, scopeId);
            return defaults[mapId];
        },

        getMapCreationDefaults: function (scopeId) {
            var mapId = obtainEffectiveMapId(defaults, scopeId);
            var d = defaults[mapId];

            var mapDefaults = {
                maxZoom: d.maxZoom,
                keyboard: d.keyboard,
                dragging: d.dragging,
                zoomControl: d.zoomControl,
                doubleClickZoom: d.doubleClickZoom,
                scrollWheelZoom: d.scrollWheelZoom,
                touchZoom: d.touchZoom,
                attributionControl: d.attributionControl,
                worldCopyJump: d.worldCopyJump,
                crs: d.crs
            };

            if (isDefined(d.minZoom)) {
                mapDefaults.minZoom = d.minZoom;
            }

            if (isDefined(d.zoomAnimation)) {
                mapDefaults.zoomAnimation = d.zoomAnimation;
            }

            if (isDefined(d.fadeAnimation)) {
                mapDefaults.fadeAnimation = d.fadeAnimation;
            }

            if (isDefined(d.markerZoomAnimation)) {
                mapDefaults.markerZoomAnimation = d.markerZoomAnimation;
            }

            if (d.map) {
                for (var option in d.map) {
                    mapDefaults[option] = d.map[option];
                }
            }

            return mapDefaults;
        },

        setDefaults: function (userDefaults, scopeId) {
            var newDefaults = _getDefaults();

            if (isDefined(userDefaults)) {
                newDefaults.doubleClickZoom = isDefined(userDefaults.doubleClickZoom) ? userDefaults.doubleClickZoom : newDefaults.doubleClickZoom;
                newDefaults.scrollWheelZoom = isDefined(userDefaults.scrollWheelZoom) ? userDefaults.scrollWheelZoom : newDefaults.doubleClickZoom;
                newDefaults.touchZoom = isDefined(userDefaults.touchZoom) ? userDefaults.touchZoom : newDefaults.doubleClickZoom;
                newDefaults.zoomControl = isDefined(userDefaults.zoomControl) ? userDefaults.zoomControl : newDefaults.zoomControl;
                newDefaults.zoomsliderControl = isDefined(userDefaults.zoomsliderControl) ? userDefaults.zoomsliderControl : newDefaults.zoomsliderControl;
                newDefaults.attributionControl = isDefined(userDefaults.attributionControl) ? userDefaults.attributionControl : newDefaults.attributionControl;
                newDefaults.tileLayer = isDefined(userDefaults.tileLayer) ? userDefaults.tileLayer : newDefaults.tileLayer;
                newDefaults.zoomControlPosition = isDefined(userDefaults.zoomControlPosition) ? userDefaults.zoomControlPosition : newDefaults.zoomControlPosition;
                newDefaults.keyboard = isDefined(userDefaults.keyboard) ? userDefaults.keyboard : newDefaults.keyboard;
                newDefaults.dragging = isDefined(userDefaults.dragging) ? userDefaults.dragging : newDefaults.dragging;

                if (isDefined(userDefaults.controls)) {
                    angular.extend(newDefaults.controls, userDefaults.controls);
                }

                if (isObject(userDefaults.crs)) {
                    newDefaults.crs = userDefaults.crs;
                } else if (isDefined(L.CRS[userDefaults.crs])) {
                    newDefaults.crs = L.CRS[userDefaults.crs];
                }

                if (isDefined(userDefaults.center)) {
                    angular.copy(userDefaults.center, newDefaults.center);
                }

                if (isDefined(userDefaults.tileLayerOptions)) {
                    angular.copy(userDefaults.tileLayerOptions, newDefaults.tileLayerOptions);
                }

                if (isDefined(userDefaults.maxZoom)) {
                    newDefaults.maxZoom = userDefaults.maxZoom;
                }

                if (isDefined(userDefaults.minZoom)) {
                    newDefaults.minZoom = userDefaults.minZoom;
                }

                if (isDefined(userDefaults.zoomAnimation)) {
                    newDefaults.zoomAnimation = userDefaults.zoomAnimation;
                }

                if (isDefined(userDefaults.fadeAnimation)) {
                    newDefaults.fadeAnimation = userDefaults.fadeAnimation;
                }

                if (isDefined(userDefaults.markerZoomAnimation)) {
                    newDefaults.markerZoomAnimation = userDefaults.markerZoomAnimation;
                }

                if (isDefined(userDefaults.worldCopyJump)) {
                    newDefaults.worldCopyJump = userDefaults.worldCopyJump;
                }

                if (isDefined(userDefaults.map)) {
                    newDefaults.map = userDefaults.map;
                }
            }

            var mapId = obtainEffectiveMapId(defaults, scopeId);
            defaults[mapId] = newDefaults;
            return newDefaults;
        }
    };
}]);

angular.module("leaflet-directive").factory('leafletEvents', ["$rootScope", "$q", "$log", "leafletHelpers", function ($rootScope, $q, $log, leafletHelpers) {
    var safeApply = leafletHelpers.safeApply,
        isDefined = leafletHelpers.isDefined,
        isObject = leafletHelpers.isObject,
        Helpers = leafletHelpers;

    var _getAvailableLabelEvents = function() {
        return [
            'click',
            'dblclick',
            'mousedown',
            'mouseover',
            'mouseout',
            'contextmenu'
        ];
    };

    var genLabelEvents = function(leafletScope, logic, marker, name) {
        var labelEvents = _getAvailableLabelEvents();
        var scopeWatchName = "markers." + name;
        for (var i = 0; i < labelEvents.length; i++) {
            var eventName = labelEvents[i];
            marker.label.on(eventName, genDispatchLabelEvent(leafletScope, eventName, logic, marker.label, scopeWatchName));
        }
    };

    var genDispatchMarkerEvent = function(eventName, logic, leafletScope, marker, name, markerData) {
        return function(e) {
            var broadcastName = 'leafletDirectiveMarker.' + eventName;

            // Broadcast old marker click name for backwards compatibility
            if (eventName === "click") {
                safeApply(leafletScope, function() {
                    $rootScope.$broadcast('leafletDirectiveMarkersClick', name);
                });
            } else if (eventName === 'dragend') {
                safeApply(leafletScope, function() {
                    markerData.lat = marker.getLatLng().lat;
                    markerData.lng = marker.getLatLng().lng;
                });
                if (markerData.message && markerData.focus === true) {
                    marker.openPopup();
                }
            }

            safeApply(leafletScope, function(scope){
                if (logic === "emit") {
                    scope.$emit(broadcastName, {
                        markerName: name,
                        leafletEvent: e
                    });
                } else {
                    $rootScope.$broadcast(broadcastName, {
                        markerName: name,
                        leafletEvent: e
                    });
                }
            });
        };
    };

    var genDispatchPathEvent = function(eventName, logic, leafletScope, marker, name) {
        return function(e) {
            var broadcastName = 'leafletDirectivePath.' + eventName;

            safeApply(leafletScope, function(scope){
                if (logic === "emit") {
                    scope.$emit(broadcastName, {
                        pathName: name,
                        leafletEvent: e
                    });
                } else {
                    $rootScope.$broadcast(broadcastName, {
                        pathName: name,
                        leafletEvent: e
                    });
                }
            });
        };
    };

    var genDispatchLabelEvent = function(scope, eventName, logic, label, scope_watch_name) {
        return function(e) {
            // Put together broadcast name
            var broadcastName = 'leafletDirectiveLabel.' + eventName;
            var markerName = scope_watch_name.replace('markers.', '');

            // Safely broadcast the event
            safeApply(scope, function(scope) {
                if (logic === "emit") {
                    scope.$emit(broadcastName, {
                        leafletEvent : e,
                        label: label,
                        markerName: markerName
                    });
                } else if (logic === "broadcast") {
                    $rootScope.$broadcast(broadcastName, {
                        leafletEvent : e,
                        label: label,
                        markerName: markerName
                    });
                }
            });
        };
    };

    var _getAvailableMarkerEvents = function() {
        return [
            'click',
            'dblclick',
            'mousedown',
            'mouseover',
            'mouseout',
            'contextmenu',
            'dragstart',
            'drag',
            'dragend',
            'move',
            'remove',
            'popupopen',
            'popupclose'
        ];
    };

    var _getAvailablePathEvents = function() {
        return [
            'click',
            'dblclick',
            'mousedown',
            'mouseover',
            'mouseout',
            'contextmenu',
            'add',
            'remove',
            'popupopen',
            'popupclose'
        ];
    };

    return {
        getAvailableMapEvents: function() {
            return [
                'click',
                'dblclick',
                'mousedown',
                'mouseup',
                'mouseover',
                'mouseout',
                'mousemove',
                'contextmenu',
                'focus',
                'blur',
                'preclick',
                'load',
                'unload',
                'viewreset',
                'movestart',
                'move',
                'moveend',
                'dragstart',
                'drag',
                'dragend',
                'zoomstart',
                'zoomend',
                'zoomlevelschange',
                'resize',
                'autopanstart',
                'layeradd',
                'layerremove',
                'baselayerchange',
                'overlayadd',
                'overlayremove',
                'locationfound',
                'locationerror',
                'popupopen',
                'popupclose',
                'draw:created',
                'draw:edited',
                'draw:deleted',
                'draw:drawstart',
                'draw:drawstop',
                'draw:editstart',
                'draw:editstop',
                'draw:deletestart',
                'draw:deletestop'
            ];
        },

        genDispatchMapEvent: function(scope, eventName, logic) {
            return function(e) {
                // Put together broadcast name
                var broadcastName = 'leafletDirectiveMap.' + eventName;
                // Safely broadcast the event
                safeApply(scope, function(scope) {
                    if (logic === "emit") {
                        scope.$emit(broadcastName, {
                            leafletEvent : e
                        });
                    } else if (logic === "broadcast") {
                        $rootScope.$broadcast(broadcastName, {
                            leafletEvent : e
                        });
                    }
                });
            };
        },

        getAvailableMarkerEvents: _getAvailableMarkerEvents,

        getAvailablePathEvents: _getAvailablePathEvents,

        notifyCenterChangedToBounds: function(scope) {
            scope.$broadcast("boundsChanged");
        },

        notifyCenterUrlHashChanged: function(scope, map, attrs, search) {
            if (!isDefined(attrs.urlHashCenter)) {
                return;
            }
            var center = map.getCenter();
            var centerUrlHash = (center.lat).toFixed(4) + ":" + (center.lng).toFixed(4) + ":" + map.getZoom();
            if (!isDefined(search.c) || search.c !== centerUrlHash) {
                //$log.debug("notified new center...");
                scope.$emit("centerUrlHash", centerUrlHash);
            }
        },

        bindMarkerEvents: function(marker, name, markerData, leafletScope) {
            var markerEvents = [];
            var i;
            var eventName;
            var logic = "broadcast";

            if (!isDefined(leafletScope.eventBroadcast)) {
                // Backward compatibility, if no event-broadcast attribute, all events are broadcasted
                markerEvents = _getAvailableMarkerEvents();
            } else if (!isObject(leafletScope.eventBroadcast)) {
                // Not a valid object
                $log.error("[AngularJS - Leaflet] event-broadcast must be an object check your model.");
            } else {
                // We have a possible valid object
                if (!isDefined(leafletScope.eventBroadcast.marker)) {
                    // We do not have events enable/disable do we do nothing (all enabled by default)
                    markerEvents = _getAvailableMarkerEvents();
                } else if (!isObject(leafletScope.eventBroadcast.marker)) {
                    // Not a valid object
                    $log.warn("[AngularJS - Leaflet] event-broadcast.marker must be an object check your model.");
                } else {
                    // We have a possible valid map object
                    // Event propadation logic
                    if (leafletScope.eventBroadcast.marker.logic !== undefined && leafletScope.eventBroadcast.marker.logic !== null) {
                        // We take care of possible propagation logic
                        if (leafletScope.eventBroadcast.marker.logic !== "emit" && leafletScope.eventBroadcast.marker.logic !== "broadcast") {
                            // This is an error
                            $log.warn("[AngularJS - Leaflet] Available event propagation logic are: 'emit' or 'broadcast'.");
                        } else if (leafletScope.eventBroadcast.marker.logic === "emit") {
                            logic = "emit";
                        }
                    }
                    // Enable / Disable
                    var markerEventsEnable = false, markerEventsDisable = false;
                    if (leafletScope.eventBroadcast.marker.enable !== undefined && leafletScope.eventBroadcast.marker.enable !== null) {
                        if (typeof leafletScope.eventBroadcast.marker.enable === 'object') {
                            markerEventsEnable = true;
                        }
                    }
                    if (leafletScope.eventBroadcast.marker.disable !== undefined && leafletScope.eventBroadcast.marker.disable !== null) {
                        if (typeof leafletScope.eventBroadcast.marker.disable === 'object') {
                            markerEventsDisable = true;
                        }
                    }
                    if (markerEventsEnable && markerEventsDisable) {
                        // Both are active, this is an error
                        $log.warn("[AngularJS - Leaflet] can not enable and disable events at the same time");
                    } else if (!markerEventsEnable && !markerEventsDisable) {
                        // Both are inactive, this is an error
                        $log.warn("[AngularJS - Leaflet] must enable or disable events");
                    } else {
                        // At this point the marker object is OK, lets enable or disable events
                        if (markerEventsEnable) {
                            // Enable events
                            for (i = 0; i < leafletScope.eventBroadcast.marker.enable.length; i++) {
                                eventName = leafletScope.eventBroadcast.marker.enable[i];
                                // Do we have already the event enabled?
                                if (markerEvents.indexOf(eventName) !== -1) {
                                    // Repeated event, this is an error
                                    $log.warn("[AngularJS - Leaflet] This event " + eventName + " is already enabled");
                                } else {
                                    // Does the event exists?
                                    if (_getAvailableMarkerEvents().indexOf(eventName) === -1) {
                                        // The event does not exists, this is an error
                                        $log.warn("[AngularJS - Leaflet] This event " + eventName + " does not exist");
                                    } else {
                                        // All ok enable the event
                                        markerEvents.push(eventName);
                                    }
                                }
                            }
                        } else {
                            // Disable events
                            markerEvents = _getAvailableMarkerEvents();
                            for (i = 0; i < leafletScope.eventBroadcast.marker.disable.length; i++) {
                                eventName = leafletScope.eventBroadcast.marker.disable[i];
                                var index = markerEvents.indexOf(eventName);
                                if (index === -1) {
                                    // The event does not exist
                                    $log.warn("[AngularJS - Leaflet] This event " + eventName + " does not exist or has been already disabled");

                                } else {
                                    markerEvents.splice(index, 1);
                                }
                            }
                        }
                    }
                }
            }

            for (i = 0; i < markerEvents.length; i++) {
                eventName = markerEvents[i];
                marker.on(eventName, genDispatchMarkerEvent(eventName, logic, leafletScope, marker, name, markerData));
            }

            if (Helpers.LabelPlugin.isLoaded() && isDefined(marker.label)) {
                genLabelEvents(leafletScope, logic, marker, name);
            }
        },

        bindPathEvents: function(path, name, pathData, leafletScope) {
            var pathEvents = [];
            var i;
            var eventName;
            var logic = "broadcast";

            if (!isDefined(leafletScope.eventBroadcast)) {
                // Backward compatibility, if no event-broadcast attribute, all events are broadcasted
                pathEvents = _getAvailablePathEvents();
            } else if (!isObject(leafletScope.eventBroadcast)) {
                // Not a valid object
                $log.error("[AngularJS - Leaflet] event-broadcast must be an object check your model.");
            } else {
                // We have a possible valid object
                if (!isDefined(leafletScope.eventBroadcast.path)) {
                    // We do not have events enable/disable do we do nothing (all enabled by default)
                    pathEvents = _getAvailablePathEvents();
                } else if (isObject(leafletScope.eventBroadcast.paths)) {
                    // Not a valid object
                    $log.warn("[AngularJS - Leaflet] event-broadcast.path must be an object check your model.");
                } else {
                    // We have a possible valid map object
                    // Event propadation logic
                    if (leafletScope.eventBroadcast.path.logic !== undefined && leafletScope.eventBroadcast.path.logic !== null) {
                        // We take care of possible propagation logic
                        if (leafletScope.eventBroadcast.path.logic !== "emit" && leafletScope.eventBroadcast.path.logic !== "broadcast") {
                            // This is an error
                            $log.warn("[AngularJS - Leaflet] Available event propagation logic are: 'emit' or 'broadcast'.");
                        } else if (leafletScope.eventBroadcast.path.logic === "emit") {
                            logic = "emit";
                        }
                    }
                    // Enable / Disable
                    var pathEventsEnable = false, pathEventsDisable = false;
                    if (leafletScope.eventBroadcast.path.enable !== undefined && leafletScope.eventBroadcast.path.enable !== null) {
                        if (typeof leafletScope.eventBroadcast.path.enable === 'object') {
                            pathEventsEnable = true;
                        }
                    }
                    if (leafletScope.eventBroadcast.path.disable !== undefined && leafletScope.eventBroadcast.path.disable !== null) {
                        if (typeof leafletScope.eventBroadcast.path.disable === 'object') {
                            pathEventsDisable = true;
                        }
                    }
                    if (pathEventsEnable && pathEventsDisable) {
                        // Both are active, this is an error
                        $log.warn("[AngularJS - Leaflet] can not enable and disable events at the same time");
                    } else if (!pathEventsEnable && !pathEventsDisable) {
                        // Both are inactive, this is an error
                        $log.warn("[AngularJS - Leaflet] must enable or disable events");
                    } else {
                        // At this point the path object is OK, lets enable or disable events
                        if (pathEventsEnable) {
                            // Enable events
                            for (i = 0; i < leafletScope.eventBroadcast.path.enable.length; i++) {
                                eventName = leafletScope.eventBroadcast.path.enable[i];
                                // Do we have already the event enabled?
                                if (pathEvents.indexOf(eventName) !== -1) {
                                    // Repeated event, this is an error
                                    $log.warn("[AngularJS - Leaflet] This event " + eventName + " is already enabled");
                                } else {
                                    // Does the event exists?
                                    if (_getAvailablePathEvents().indexOf(eventName) === -1) {
                                        // The event does not exists, this is an error
                                        $log.warn("[AngularJS - Leaflet] This event " + eventName + " does not exist");
                                    } else {
                                        // All ok enable the event
                                        pathEvents.push(eventName);
                                    }
                                }
                            }
                        } else {
                            // Disable events
                            pathEvents = _getAvailablePathEvents();
                            for (i = 0; i < leafletScope.eventBroadcast.path.disable.length; i++) {
                                eventName = leafletScope.eventBroadcast.path.disable[i];
                                var index = pathEvents.indexOf(eventName);
                                if (index === -1) {
                                    // The event does not exist
                                    $log.warn("[AngularJS - Leaflet] This event " + eventName + " does not exist or has been already disabled");

                                } else {
                                    pathEvents.splice(index, 1);
                                }
                            }
                        }
                    }
                }
            }

            for (i = 0; i < pathEvents.length; i++) {
                eventName = pathEvents[i];
                path.on(eventName, genDispatchPathEvent(eventName, logic, leafletScope, pathEvents, name));
            }

            if (Helpers.LabelPlugin.isLoaded() && isDefined(path.label)) {
                genLabelEvents(leafletScope, logic, path, name);
            }
        }

    };
}]);


angular.module("leaflet-directive").factory('leafletLayerHelpers', ["$rootScope", "$log", "leafletHelpers", function ($rootScope, $log, leafletHelpers) {
    var Helpers = leafletHelpers,
        isString = leafletHelpers.isString,
        isObject = leafletHelpers.isObject,
        isDefined = leafletHelpers.isDefined;

    var utfGridCreateLayer = function(params) {
        if (!Helpers.UTFGridPlugin.isLoaded()) {
            $log.error('[AngularJS - Leaflet] The UTFGrid plugin is not loaded.');
            return;
        }
        var utfgrid = new L.UtfGrid(params.url, params.pluginOptions);

        utfgrid.on('mouseover', function(e) {
            $rootScope.$broadcast('leafletDirectiveMap.utfgridMouseover', e);
        });

        utfgrid.on('mouseout', function(e) {
            $rootScope.$broadcast('leafletDirectiveMap.utfgridMouseout', e);
        });

        utfgrid.on('click', function(e) {
            $rootScope.$broadcast('leafletDirectiveMap.utfgridClick', e);
        });

        return utfgrid;
    };

    var layerTypes = {
        xyz: {
            mustHaveUrl: true,
            createLayer: function(params) {
                return L.tileLayer(params.url, params.options);
            }
        },
        mapbox: {
            mustHaveKey: true,
            createLayer: function(params) {
                var url = '//{s}.tiles.mapbox.com/v3/' + params.key + '/{z}/{x}/{y}.png';
                return L.tileLayer(url, params.options);
            }
        },
        geoJSON: {
            mustHaveUrl: true,
            createLayer: function(params) {
                if (!Helpers.GeoJSONPlugin.isLoaded()) {
                    return;
                }
                return new L.TileLayer.GeoJSON(params.url, params.pluginOptions, params.options);
            }
        },
        utfGrid: {
            mustHaveUrl: true,
            createLayer: utfGridCreateLayer
        },
        cartodbTiles: {
            mustHaveKey: true,
            createLayer: function(params) {
                var url = '//' + params.user + '.cartodb.com/api/v1/map/' + params.key + '/{z}/{x}/{y}.png';
                return L.tileLayer(url, params.options);
            }
        },
        cartodbUTFGrid: {
            mustHaveKey: true,
            mustHaveLayer : true,
            createLayer: function(params) {
                params.url = '//' + params.user + '.cartodb.com/api/v1/map/' + params.key + '/' + params.layer + '/{z}/{x}/{y}.grid.json';
                return utfGridCreateLayer(params);
            }
        },
        cartodbInteractive: {
            mustHaveKey: true,
            mustHaveLayer : true,
            createLayer: function(params) {
                var tilesURL = '//' + params.user + '.cartodb.com/api/v1/map/' + params.key + '/{z}/{x}/{y}.png';
                var tileLayer = L.tileLayer(tilesURL, params.options);
                params.url = '//' + params.user + '.cartodb.com/api/v1/map/' + params.key + '/' + params.layer + '/{z}/{x}/{y}.grid.json';
                var utfLayer = utfGridCreateLayer(params);
                return L.layerGroup([tileLayer, utfLayer]);
            }
        },
        wms: {
            mustHaveUrl: true,
            createLayer: function(params) {
                return L.tileLayer.wms(params.url, params.options);
            }
        },
        wmts: {
            mustHaveUrl: true,
            createLayer: function(params) {
                return L.tileLayer.wmts(params.url, params.options);
            }
        },
        wfs: {
            mustHaveUrl: true,
            mustHaveLayer : true,
            createLayer: function(params) {
                if (!Helpers.WFSLayerPlugin.isLoaded()) {
                    return;
                }
                var options = angular.copy(params.options);
                if(options.crs && 'string' === typeof options.crs) {
                    /*jshint -W061 */
                    options.crs = eval(options.crs);
                }
                return new L.GeoJSON.WFS(params.url, params.layer, options);
            }
        },
        group: {
            mustHaveUrl: false,
            createLayer: function () {
                return L.layerGroup();
            }
        },
        featureGroup: {
            mustHaveUrl: false,
            createLayer: function () {
                return L.featureGroup();
            }
        },
        google: {
            mustHaveUrl: false,
            createLayer: function(params) {
                var type = params.type || 'SATELLITE';
                if (!Helpers.GoogleLayerPlugin.isLoaded()) {
                    return;
                }
                return new L.Google(type, params.options);
            }
        },
        china:{
            mustHaveUrl:false,
            createLayer:function(params){
                var type = params.type || '';
                if(!Helpers.ChinaLayerPlugin.isLoaded()){
                    return;
                }
                return L.tileLayer.chinaProvider(type, params.options);
            }
        },
        ags: {
            mustHaveUrl: true,
            createLayer: function(params) {
                if (!Helpers.AGSLayerPlugin.isLoaded()) {
                    return;
                }

                var options = angular.copy(params.options);
                angular.extend(options, {
                    url: params.url
                });
                var layer = new lvector.AGS(options);
                layer.onAdd = function(map) {
                    this.setMap(map);
                };
                layer.onRemove = function() {
                    this.setMap(null);
                };
                return layer;
            }
        },
        dynamic: {
            mustHaveUrl: true,
            createLayer: function(params) {
                if (!Helpers.DynamicMapLayerPlugin.isLoaded()) {
                    return;
                }
                return L.esri.dynamicMapLayer(params.url, params.options);
            }
        },
        markercluster: {
            mustHaveUrl: false,
            createLayer: function(params) {
                if (!Helpers.MarkerClusterPlugin.isLoaded()) {
                    $log.error('[AngularJS - Leaflet] The markercluster plugin is not loaded.');
                    return;
                }
                return new L.MarkerClusterGroup(params.options);
            }
        },
        bing: {
            mustHaveUrl: false,
            createLayer: function(params) {
                if (!Helpers.BingLayerPlugin.isLoaded()) {
                    return;
                }
                return new L.BingLayer(params.key, params.options);
            }
        },
        heatmap: {
            mustHaveUrl: false,
            mustHaveData: true,
            createLayer: function(params) {
                if (!Helpers.HeatMapLayerPlugin.isLoaded()) {
                    return;
                }
                var layer = new L.TileLayer.WebGLHeatMap(params.options);
                if (isDefined(params.data)) {
                    layer.setData(params.data);
                }

                return layer;
            }
        },
        yandex: {
            mustHaveUrl: false,
            createLayer: function(params) {
                var type = params.type || 'map';
                if (!Helpers.YandexLayerPlugin.isLoaded()) {
                    return;
                }
                return new L.Yandex(type, params.options);
            }
        },
        imageOverlay: {
            mustHaveUrl: true,
            mustHaveBounds : true,
            createLayer: function(params) {
                return L.imageOverlay(params.url, params.bounds, params.options);
            }
        },

        // This "custom" type is used to accept every layer that user want to define himself.
        // We can wrap these custom layers like heatmap or yandex, but it means a lot of work/code to wrap the world,
        // so we let user to define their own layer outside the directive,
        // and pass it on "createLayer" result for next processes
        custom: {
            createLayer: function (params) {
                if (params.layer instanceof L.Class) {
                    return angular.copy(params.layer);
                }
                else {
                    $log.error('[AngularJS - Leaflet] A custom layer must be a leaflet Class');
                }
            }
        },
        cartodb: {
            mustHaveUrl: true,
            createLayer: function(params) {
                return cartodb.createLayer(params.map, params.url);
            }
        }
    };

    function isValidLayerType(layerDefinition) {
        // Check if the baselayer has a valid type
        if (!isString(layerDefinition.type)) {
            $log.error('[AngularJS - Leaflet] A layer must have a valid type defined.');
            return false;
        }

        if (Object.keys(layerTypes).indexOf(layerDefinition.type) === -1) {
            $log.error('[AngularJS - Leaflet] A layer must have a valid type: ' + Object.keys(layerTypes));
            return false;
        }

        // Check if the layer must have an URL
        if (layerTypes[layerDefinition.type].mustHaveUrl && !isString(layerDefinition.url)) {
            $log.error('[AngularJS - Leaflet] A base layer must have an url');
            return false;
        }

        if (layerTypes[layerDefinition.type].mustHaveData && !isDefined(layerDefinition.data)) {
            $log.error('[AngularJS - Leaflet] The base layer must have a "data" array attribute');
            return false;
        }

        if(layerTypes[layerDefinition.type].mustHaveLayer && !isDefined(layerDefinition.layer)) {
            $log.error('[AngularJS - Leaflet] The type of layer ' + layerDefinition.type + ' must have an layer defined');
            return false;
        }

        if (layerTypes[layerDefinition.type].mustHaveBounds && !isDefined(layerDefinition.bounds)) {
            $log.error('[AngularJS - Leaflet] The type of layer ' + layerDefinition.type + ' must have bounds defined');
            return false ;
        }

        if (layerTypes[layerDefinition.type].mustHaveKey && !isDefined(layerDefinition.key)) {
            $log.error('[AngularJS - Leaflet] The type of layer ' + layerDefinition.type + ' must have key defined');
            return false ;
        }
        return true;
    }

    return {
        createLayer: function(layerDefinition) {
            if (!isValidLayerType(layerDefinition)) {
                return;
            }

            if (!isString(layerDefinition.name)) {
                $log.error('[AngularJS - Leaflet] A base layer must have a name');
                return;
            }
            if (!isObject(layerDefinition.layerParams)) {
                layerDefinition.layerParams = {};
            }
            if (!isObject(layerDefinition.layerOptions)) {
                layerDefinition.layerOptions = {};
            }

            // Mix the layer specific parameters with the general Leaflet options. Although this is an overhead
            // the definition of a base layers is more 'clean' if the two types of parameters are differentiated
            for (var attrname in layerDefinition.layerParams) {
                layerDefinition.layerOptions[attrname] = layerDefinition.layerParams[attrname];
            }

            var params = {
                url: layerDefinition.url,
                data: layerDefinition.data,
                options: layerDefinition.layerOptions,
                layer: layerDefinition.layer,
                type: layerDefinition.layerType,
                bounds: layerDefinition.bounds,
                key: layerDefinition.key,
                pluginOptions: layerDefinition.pluginOptions,
                user: layerDefinition.user
            };

            //TODO Add $watch to the layer properties
            return layerTypes[layerDefinition.type].createLayer(params);
        }
    };
}]);

angular.module("leaflet-directive").factory('leafletControlHelpers', ["$rootScope", "$log", "leafletHelpers", "leafletMapDefaults", function ($rootScope, $log, leafletHelpers, leafletMapDefaults) {
    var isObject = leafletHelpers.isObject,
        isDefined = leafletHelpers.isDefined;
    var _layersControl;

    var _controlLayersMustBeVisible = function(baselayers, overlays, mapId) {
        var defaults = leafletMapDefaults.getDefaults(mapId);
        if(!defaults.controls.layers.visible) {
            return false;
        }

        var numberOfLayers = 0;
        if (isObject(baselayers)) {
            numberOfLayers += Object.keys(baselayers).length;
        }
        if (isObject(overlays)) {
            numberOfLayers += Object.keys(overlays).length;
        }
        return numberOfLayers > 1;
    };

    var _createLayersControl = function(mapId) {
        var defaults = leafletMapDefaults.getDefaults(mapId);
        var controlOptions = {
            collapsed: defaults.controls.layers.collapsed,
            position: defaults.controls.layers.position
        };

        angular.extend(controlOptions, defaults.controls.layers.options);

        var control;
        if(defaults.controls.layers && isDefined(defaults.controls.layers.control)) {
			control = defaults.controls.layers.control.apply(this, [[], [], controlOptions]);
		} else {
			control = new L.control.layers([], [], controlOptions);
		}

        return control;
    };

    return {
        layersControlMustBeVisible: _controlLayersMustBeVisible,

        updateLayersControl: function(map, mapId, loaded, baselayers, overlays, leafletLayers) {
            var i;

            var mustBeLoaded = _controlLayersMustBeVisible(baselayers, overlays, mapId);
            if (isDefined(_layersControl) && loaded) {
                for (i in leafletLayers.baselayers) {
                    _layersControl.removeLayer(leafletLayers.baselayers[i]);
                }
                for (i in leafletLayers.overlays) {
                    _layersControl.removeLayer(leafletLayers.overlays[i]);
                }
                _layersControl.removeFrom(map);
            }

            if (mustBeLoaded) {
                _layersControl = _createLayersControl(mapId);
                for (i in baselayers) {
                    if (isDefined(leafletLayers.baselayers[i])) {
                        _layersControl.addBaseLayer(leafletLayers.baselayers[i], baselayers[i].name);
                    }
                }
                for (i in overlays) {
                    if (isDefined(leafletLayers.overlays[i])) {
                        _layersControl.addOverlay(leafletLayers.overlays[i], overlays[i].name);
                    }
                }
                _layersControl.addTo(map);
            }
            return mustBeLoaded;
        }
    };
}]);

angular.module("leaflet-directive").factory('leafletLegendHelpers', function () {
	var _updateArcGISLegend = function(div, legendData) {
		div.innerHTML = '';
		if(legendData.error) {
			div.innerHTML += '<div class="info-title alert alert-danger">' + legendData.error.message + '</div>';
		} else {
			for (var i = 0; i < legendData.layers.length; i++) {
				var layer = legendData.layers[i];
				div.innerHTML += '<div class="info-title" data-layerid="' + layer.layerId + '">' + layer.layerName + '</div>';
				for(var j = 0; j < layer.legend.length; j++) {
					var leg = layer.legend[j];
					div.innerHTML +=
						'<div class="inline" data-layerid="' + layer.layerId + '"><img src="data:' + leg.contentType + ';base64,' + leg.imageData + '" /></div>' +
						'<div class="info-label" data-layerid="' + layer.layerId + '">' + leg.label + '</div>';
				}
			}
		}
	};

	var _getOnAddArcGISLegend = function(legendData, legendClass) {
		return function(/*map*/) {
			var div = L.DomUtil.create('div', legendClass);

			if (!L.Browser.touch) {
				L.DomEvent.disableClickPropagation(div);
				L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation);
			} else {
				L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation);
			}
			_updateArcGISLegend(div, legendData);
			return div;
		};
	};

	var _getOnAddArrayLegend = function(legend, legendClass) {
		return function(/*map*/) {
			var div = L.DomUtil.create('div', legendClass);
            for (var i = 0; i < legend.colors.length; i++) {
                div.innerHTML +=
                    '<div class="outline"><i style="background:' + legend.colors[i] + '"></i></div>' +
                    '<div class="info-label">' + legend.labels[i] + '</div>';
            }
            if (!L.Browser.touch) {
				L.DomEvent.disableClickPropagation(div);
				L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation);
			} else {
				L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation);
			}
            return div;
		};
	};

	return {
		getOnAddArcGISLegend: _getOnAddArcGISLegend,
		getOnAddArrayLegend: _getOnAddArrayLegend,
		updateArcGISLegend: _updateArcGISLegend,
	};
});

angular.module("leaflet-directive").factory('leafletPathsHelpers', ["$rootScope", "$log", "leafletHelpers", function ($rootScope, $log, leafletHelpers) {
    var isDefined = leafletHelpers.isDefined,
        isArray = leafletHelpers.isArray,
        isNumber = leafletHelpers.isNumber,
        isValidPoint = leafletHelpers.isValidPoint;
    var availableOptions = [
        // Path options
        'stroke', 'weight', 'color', 'opacity',
        'fill', 'fillColor', 'fillOpacity',
        'dashArray', 'lineCap', 'lineJoin', 'clickable',
        'pointerEvents', 'className',

        // Polyline options
        'smoothFactor', 'noClip'
    ];
    function _convertToLeafletLatLngs(latlngs) {
        return latlngs.filter(function(latlng) {
            return isValidPoint(latlng);
        }).map(function (latlng) {
            return _convertToLeafletLatLng(latlng);
        });
    }

    function _convertToLeafletLatLng(latlng) {
        if (isArray(latlng)) {
            return new L.LatLng(latlng[0], latlng[1]);
        } else {
            return new L.LatLng(latlng.lat, latlng.lng);
        }
    }

    function _convertToLeafletMultiLatLngs(paths) {
        return paths.map(function(latlngs) {
            return _convertToLeafletLatLngs(latlngs);
        });
    }

    function _getOptions(path, defaults) {
        var options = {};
        for (var i = 0; i < availableOptions.length; i++) {
            var optionName = availableOptions[i];

            if (isDefined(path[optionName])) {
                options[optionName] = path[optionName];
            } else if (isDefined(defaults.path[optionName])) {
                options[optionName] = defaults.path[optionName];
            }
        }

        return options;
    }

    var _updatePathOptions = function (path, data) {
        var updatedStyle = {};
        for (var i = 0; i < availableOptions.length; i++) {
            var optionName = availableOptions[i];
            if (isDefined(data[optionName])) {
                updatedStyle[optionName] = data[optionName];
            }
        }
        path.setStyle(data);
    };

    var _isValidPolyline = function(latlngs) {
        if (!isArray(latlngs)) {
            return false;
        }
        for (var i = 0; i < latlngs.length; i++) {
            var point = latlngs[i];
            if (!isValidPoint(point)) {
                return false;
            }
        }
        return true;
    };

    var pathTypes = {
        polyline: {
            isValid: function(pathData) {
                var latlngs = pathData.latlngs;
                return _isValidPolyline(latlngs);
            },
            createPath: function(options) {
                return new L.Polyline([], options);
            },
            setPath: function(path, data) {
                path.setLatLngs(_convertToLeafletLatLngs(data.latlngs));
                _updatePathOptions(path, data);
                return;
            }
        },
        multiPolyline: {
            isValid: function(pathData) {
                var latlngs = pathData.latlngs;
                if (!isArray(latlngs)) {
                    return false;
                }

                for (var i in latlngs) {
                    var polyline = latlngs[i];
                    if (!_isValidPolyline(polyline)) {
                        return false;
                    }
                }

                return true;
            },
            createPath: function(options) {
                return new L.multiPolyline([[[0,0],[1,1]]], options);
            },
            setPath: function(path, data) {
                path.setLatLngs(_convertToLeafletMultiLatLngs(data.latlngs));
                _updatePathOptions(path, data);
                return;
            }
        } ,
        polygon: {
            isValid: function(pathData) {
                var latlngs = pathData.latlngs;
                return _isValidPolyline(latlngs);
            },
            createPath: function(options) {
                return new L.Polygon([], options);
            },
            setPath: function(path, data) {
                path.setLatLngs(_convertToLeafletLatLngs(data.latlngs));
                _updatePathOptions(path, data);
                return;
            }
        },
        multiPolygon: {
            isValid: function(pathData) {
                var latlngs = pathData.latlngs;

                if (!isArray(latlngs)) {
                    return false;
                }

                for (var i in latlngs) {
                    var polyline = latlngs[i];
                    if (!_isValidPolyline(polyline)) {
                        return false;
                    }
                }

                return true;
            },
            createPath: function(options) {
                return new L.MultiPolygon([[[0,0],[1,1],[0,1]]], options);
            },
            setPath: function(path, data) {
                path.setLatLngs(_convertToLeafletMultiLatLngs(data.latlngs));
                _updatePathOptions(path, data);
                return;
            }
        },
        rectangle: {
            isValid: function(pathData) {
                var latlngs = pathData.latlngs;

                if (!isArray(latlngs) || latlngs.length !== 2) {
                    return false;
                }

                for (var i in latlngs) {
                    var point = latlngs[i];
                    if (!isValidPoint(point)) {
                        return false;
                    }
                }

                return true;
            },
            createPath: function(options) {
                return new L.Rectangle([[0,0],[1,1]], options);
            },
            setPath: function(path, data) {
                path.setBounds(new L.LatLngBounds(_convertToLeafletLatLngs(data.latlngs)));
                _updatePathOptions(path, data);
            }
        },
        circle: {
            isValid: function(pathData) {
                var point= pathData.latlngs;
                return isValidPoint(point) && isNumber(pathData.radius);
            },
            createPath: function(options) {
                return new L.Circle([0,0], 1, options);
            },
            setPath: function(path, data) {
                path.setLatLng(_convertToLeafletLatLng(data.latlngs));
                if (isDefined(data.radius)) {
                    path.setRadius(data.radius);
                }
                _updatePathOptions(path, data);
            }
        },
        circleMarker: {
            isValid: function(pathData) {
                var point= pathData.latlngs;
                return isValidPoint(point) && isNumber(pathData.radius);
            },
            createPath: function(options) {
                return new L.CircleMarker([0,0], options);
            },
            setPath: function(path, data) {
                path.setLatLng(_convertToLeafletLatLng(data.latlngs));
                if (isDefined(data.radius)) {
                    path.setRadius(data.radius);
                }
                _updatePathOptions(path, data);
            }
        }
    };

    var _getPathData = function(path) {
        var pathData = {};
        if (path.latlngs) {
            pathData.latlngs = path.latlngs;
        }

        if (path.radius) {
            pathData.radius = path.radius;
        }

        return pathData;
    };

    return {
        setPathOptions: function(leafletPath, pathType, data) {
            if(!isDefined(pathType)) {
                pathType = "polyline";
            }
            pathTypes[pathType].setPath(leafletPath, data);
        },
        createPath: function(name, path, defaults) {
            if(!isDefined(path.type)) {
                path.type = "polyline";
            }
            var options = _getOptions(path, defaults);
            var pathData = _getPathData(path);

            if (!pathTypes[path.type].isValid(pathData)) {
                $log.error("[AngularJS - Leaflet] Invalid data passed to the " + path.type + " path");
                return;
            }

            return pathTypes[path.type].createPath(options);
        }
    };
}]);

angular.module("leaflet-directive").factory('leafletBoundsHelpers', ["$log", "leafletHelpers", function ($log, leafletHelpers) {

    var isArray = leafletHelpers.isArray,
        isNumber = leafletHelpers.isNumber;

    function _isValidBounds(bounds) {
        return angular.isDefined(bounds) && angular.isDefined(bounds.southWest) &&
               angular.isDefined(bounds.northEast) && angular.isNumber(bounds.southWest.lat) &&
               angular.isNumber(bounds.southWest.lng) && angular.isNumber(bounds.northEast.lat) &&
               angular.isNumber(bounds.northEast.lng);
    }

    return {
        createLeafletBounds: function(bounds) {
            if (_isValidBounds(bounds)) {
                return L.latLngBounds([bounds.southWest.lat, bounds.southWest.lng],
                                      [bounds.northEast.lat, bounds.northEast.lng ]);
            }
        },

        isValidBounds: _isValidBounds,

        createBoundsFromArray: function(boundsArray) {
            if (!(isArray(boundsArray) && boundsArray.length === 2 &&
                  isArray(boundsArray[0]) && isArray(boundsArray[1]) &&
                  boundsArray[0].length === 2 && boundsArray[1].length === 2 &&
                  isNumber(boundsArray[0][0]) && isNumber(boundsArray[0][1]) &&
                  isNumber(boundsArray[1][0]) && isNumber(boundsArray[1][1]))) {
                $log.error("[AngularJS - Leaflet] The bounds array is not valid.");
                return;
            }

            return {
                northEast: {
                    lat: boundsArray[0][0],
                    lng: boundsArray[0][1]
                },
                southWest: {
                    lat: boundsArray[1][0],
                    lng: boundsArray[1][1]
                }
            };

        }
    };
}]);

angular.module("leaflet-directive").factory('leafletMarkersHelpers', ["$rootScope", "leafletHelpers", "$log", "$compile", function ($rootScope, leafletHelpers, $log, $compile) {

    var isDefined = leafletHelpers.isDefined,
        MarkerClusterPlugin = leafletHelpers.MarkerClusterPlugin,
        AwesomeMarkersPlugin = leafletHelpers.AwesomeMarkersPlugin,
        MakiMarkersPlugin = leafletHelpers.MakiMarkersPlugin,
        safeApply     = leafletHelpers.safeApply,
        Helpers = leafletHelpers,
        isString = leafletHelpers.isString,
        isNumber  = leafletHelpers.isNumber,
        isObject = leafletHelpers.isObject,
        groups = {};

    var createLeafletIcon = function(iconData) {
        if (isDefined(iconData) && isDefined(iconData.type) && iconData.type === 'awesomeMarker') {
            if (!AwesomeMarkersPlugin.isLoaded()) {
                $log.error('[AngularJS - Leaflet] The AwesomeMarkers Plugin is not loaded.');
            }

            return new L.AwesomeMarkers.icon(iconData);
        }

        if (isDefined(iconData) && isDefined(iconData.type) && iconData.type === 'makiMarker') {
            if (!MakiMarkersPlugin.isLoaded()) {
                $log.error('[AngularJS - Leaflet] The MakiMarkers Plugin is not loaded.');
            }

            return new L.MakiMarkers.icon(iconData);
        }

        if (isDefined(iconData) && isDefined(iconData.type) && iconData.type === 'div') {
            return new L.divIcon(iconData);
        }

        var base64icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAGmklEQVRYw7VXeUyTZxjvNnfELFuyIzOabermMZEeQC/OclkO49CpOHXOLJl/CAURuYbQi3KLgEhbrhZ1aDwmaoGqKII6odATmH/scDFbdC7LvFqOCc+e95s2VG50X/LLm/f4/Z7neY/ne18aANCmAr5E/xZf1uDOkTcGcWR6hl9247tT5U7Y6SNvWsKT63P58qbfeLJG8M5qcgTknrvvrdDbsT7Ml+tv82X6vVxJE33aRmgSyYtcWVMqX97Yv2JvW39UhRE2HuyBL+t+gK1116ly06EeWFNlAmHxlQE0OMiV6mQCScusKRlhS3QLeVJdl1+23h5dY4FNB3thrbYboqptEFlphTC1hSpJnbRvxP4NWgsE5Jyz86QNNi/5qSUTGuFk1gu54tN9wuK2wc3o+Wc13RCmsoBwEqzGcZsxsvCSy/9wJKf7UWf1mEY8JWfewc67UUoDbDjQC+FqK4QqLVMGGR9d2wurKzqBk3nqIT/9zLxRRjgZ9bqQgub+DdoeCC03Q8j+0QhFhBHR/eP3U/zCln7Uu+hihJ1+bBNffLIvmkyP0gpBZWYXhKussK6mBz5HT6M1Nqpcp+mBCPXosYQfrekGvrjewd59/GvKCE7TbK/04/ZV5QZYVWmDwH1mF3xa2Q3ra3DBC5vBT1oP7PTj4C0+CcL8c7C2CtejqhuCnuIQHaKHzvcRfZpnylFfXsYJx3pNLwhKzRAwAhEqG0SpusBHfAKkxw3w4627MPhoCH798z7s0ZnBJ/MEJbZSbXPhER2ih7p2ok/zSj2cEJDd4CAe+5WYnBCgR2uruyEw6zRoW6/DWJ/OeAP8pd/BGtzOZKpG8oke0SX6GMmRk6GFlyAc59K32OTEinILRJRchah8HQwND8N435Z9Z0FY1EqtxUg+0SO6RJ/mmXz4VuS+DpxXC3gXmZwIL7dBSH4zKE50wESf8qwVgrP1EIlTO5JP9Igu0aexdh28F1lmAEGJGfh7jE6ElyM5Rw/FDcYJjWhbeiBYoYNIpc2FT/SILivp0F1ipDWk4BIEo2VuodEJUifhbiltnNBIXPUFCMpthtAyqws/BPlEF/VbaIxErdxPphsU7rcCp8DohC+GvBIPJS/tW2jtvTmmAeuNO8BNOYQeG8G/2OzCJ3q+soYB5i6NhMaKr17FSal7GIHheuV3uSCY8qYVuEm1cOzqdWr7ku/R0BDoTT+DT+ohCM6/CCvKLKO4RI+dXPeAuaMqksaKrZ7L3FE5FIFbkIceeOZ2OcHO6wIhTkNo0ffgjRGxEqogXHYUPHfWAC/lADpwGcLRY3aeK4/oRGCKYcZXPVoeX/kelVYY8dUGf8V5EBRbgJXT5QIPhP9ePJi428JKOiEYhYXFBqou2Guh+p/mEB1/RfMw6rY7cxcjTrneI1FrDyuzUSRm9miwEJx8E/gUmqlyvHGkneiwErR21F3tNOK5Tf0yXaT+O7DgCvALTUBXdM4YhC/IawPU+2PduqMvuaR6eoxSwUk75ggqsYJ7VicsnwGIkZBSXKOUww73WGXyqP+J2/b9c+gi1YAg/xpwck3gJuucNrh5JvDPvQr0WFXf0piyt8f8/WI0hV4pRxxkQZdJDfDJNOAmM0Ag8jyT6hz0WGXWuP94Yh2jcfjmXAGvHCMslRimDHYuHuDsy2QtHuIavznhbYURq5R57KpzBBRZKPJi8eQg48h4j8SDdowifdIrEVdU+gbO6QNvRRt4ZBthUaZhUnjlYObNagV3keoeru3rU7rcuceqU1mJBxy+BWZYlNEBH+0eH4vRiB+OYybU2hnblYlTvkHinM4m54YnxSyaZYSF6R3jwgP7udKLGIX6r/lbNa9N6y5MFynjWDtrHd75ZvTYAPO/6RgF0k76mQla3FGq7dO+cH8sKn0Vo7nDllwAhqwLPkxrHwWmHJOo+AKJ4rab5OgrM7rVu8eWb2Pu0Dh4eDgXoOfvp7Y7QeqknRmvcTBEyq9m/HQQSCSz6LHq3z0yzsNySRfMS253wl2KyRDbcZPcfJKjZmSEOjcxyi+Y8dUOtsIEH6R2wNykdqrkYJ0RV92H0W58pkfQk7cKevsLK10Py8SdMGfXNXATY+pPbyJR/ET6n9nIfztNtZYRV9XniQu9IA2vOVgy4ir7GCLVmmd+zjkH0eAF9Po6K61pmCXHxU5rHMYd1ftc3owjwRSVRzLjKvqZEty6cRUD7jGqiOdu5HG6MdHjNcNYGqfDm5YRzLBBCCDl/2bk8a8gdbqcfwECu62Fg/HrggAAAABJRU5ErkJggg==";

        var base64shadow = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAYAAACoYAD2AAAC5ElEQVRYw+2YW4/TMBCF45S0S1luXZCABy5CgLQgwf//S4BYBLTdJLax0fFqmB07nnQfEGqkIydpVH85M+NLjPe++dcPc4Q8Qh4hj5D/AaQJx6H/4TMwB0PeBNwU7EGQAmAtsNfAzoZkgIa0ZgLMa4Aj6CxIAsjhjOCoL5z7Glg1JAOkaicgvQBXuncwJAWjksLtBTWZe04CnYRktUGdilALppZBOgHGZcBzL6OClABvMSVIzyBjazOgrvACf1ydC5mguqAVg6RhdkSWQFj2uxfaq/BrIZOLEWgZdALIDvcMcZLD8ZbLC9de4yR1sYMi4G20S4Q/PWeJYxTOZn5zJXANZHIxAd4JWhPIloTJZhzMQduM89WQ3MUVAE/RnhAXpTycqys3NZALOBbB7kFrgLesQl2h45Fcj8L1tTSohUwuxhy8H/Qg6K7gIs+3kkaigQCOcyEXCHN07wyQazhrmIulvKMQAwMcmLNqyCVyMAI+BuxSMeTk3OPikLY2J1uE+VHQk6ANrhds+tNARqBeaGc72cK550FP4WhXmFmcMGhTwAR1ifOe3EvPqIegFmF+C8gVy0OfAaWQPMR7gF1OQKqGoBjq90HPMP01BUjPOqGFksC4emE48tWQAH0YmvOgF3DST6xieJgHAWxPAHMuNhrImIdvoNOKNWIOcE+UXE0pYAnkX6uhWsgVXDxHdTfCmrEEmMB2zMFimLVOtiiajxiGWrbU52EeCdyOwPEQD8LqyPH9Ti2kgYMf4OhSKB7qYILbBv3CuVTJ11Y80oaseiMWOONc/Y7kJYe0xL2f0BaiFTxknHO5HaMGMublKwxFGzYdWsBF174H/QDknhTHmHHN39iWFnkZx8lPyM8WHfYELmlLKtgWNmFNzQcC1b47gJ4hL19i7o65dhH0Negbca8vONZoP7doIeOC9zXm8RjuL0Gf4d4OYaU5ljo3GYiqzrWQHfJxA6ALhDpVKv9qYeZA8eM3EhfPSCmpuD0AAAAASUVORK5CYII=";

        if (!isDefined(iconData)) {
            return new L.Icon.Default({
                iconUrl: base64icon,
                shadowUrl: base64shadow
            });
        }

        if (!isDefined(iconData.iconUrl)) {
            iconData.iconUrl = base64icon;
            iconData.shadowUrl = base64shadow;
        }

        return new L.Icon(iconData);
    };

    var _resetMarkerGroup = function(groupName) {
      if (isDefined(groups[groupName])) {
        groups.splice(groupName, 1);
      }
    };

    var _resetMarkerGroups = function() {
      groups = {};
    };

    var _deleteMarker = function(marker, map, layers) {
        marker.closePopup();
        // There is no easy way to know if a marker is added to a layer, so we search for it
        // if there are overlays
        if (isDefined(layers) && isDefined(layers.overlays)) {
            for (var key in layers.overlays) {
                if (layers.overlays[key] instanceof L.LayerGroup || layers.overlays[key] instanceof L.FeatureGroup) {
                    if (layers.overlays[key].hasLayer(marker)) {
                        layers.overlays[key].removeLayer(marker);
                        return;
                    }
                }
            }
        }

        if (isDefined(groups)) {
            for (var groupKey in groups) {
                if (groups[groupKey].hasLayer(marker)) {
                    groups[groupKey].removeLayer(marker);
                }
            }
        }

        if (map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    };

    return {
        resetMarkerGroup: _resetMarkerGroup,

        resetMarkerGroups: _resetMarkerGroups,

        deleteMarker: _deleteMarker,

        createMarker: function(markerData) {
            if (!isDefined(markerData)) {
                $log.error('[AngularJS - Leaflet] The marker definition is not valid.');
                return;
            }

            var markerOptions = {
                icon: createLeafletIcon(markerData.icon),
                title: isDefined(markerData.title) ? markerData.title : '',
                draggable: isDefined(markerData.draggable) ? markerData.draggable : false,
                clickable: isDefined(markerData.clickable) ? markerData.clickable : true,
                riseOnHover: isDefined(markerData.riseOnHover) ? markerData.riseOnHover : false,
                zIndexOffset: isDefined(markerData.zIndexOffset) ? markerData.zIndexOffset : 0,
                iconAngle: isDefined(markerData.iconAngle) ? markerData.iconAngle : 0
            };
            // Add any other options not added above to markerOptions
            for (var markerDatum in markerData) {
                if (markerData.hasOwnProperty(markerDatum) && !markerOptions.hasOwnProperty(markerDatum)) {
                    markerOptions[markerDatum] = markerData[markerDatum];
                }
            }

            var marker = new L.marker(markerData, markerOptions);

            if (!isString(markerData.message)) {
                marker.unbindPopup();
            }

            return marker;
        },

        addMarkerToGroup: function(marker, groupName, groupOptions, map) {
            if (!isString(groupName)) {
                $log.error('[AngularJS - Leaflet] The marker group you have specified is invalid.');
                return;
            }

            if (!MarkerClusterPlugin.isLoaded()) {
                $log.error("[AngularJS - Leaflet] The MarkerCluster plugin is not loaded.");
                return;
            }
            if (!isDefined(groups[groupName])) {
                groups[groupName] = new L.MarkerClusterGroup(groupOptions);
                map.addLayer(groups[groupName]);
            }
            groups[groupName].addLayer(marker);
        },

        listenMarkerEvents: function(marker, markerData, leafletScope) {
            marker.on("popupopen", function(/* event */) {
                //the marker may have angular templates to compile
                $compile(marker.getPopup()._contentNode)($rootScope);
                safeApply(leafletScope, function() {
                    markerData.focus = true;
                });
            });
            marker.on("popupclose", function(/* event */) {
                safeApply(leafletScope, function() {
                    markerData.focus = false;
                });
            });
        },

        addMarkerWatcher: function(marker, name, leafletScope, layers, map) {
            var clearWatch = leafletScope.$watch("markers[\""+name+"\"]", function(markerData, oldMarkerData) {
                if (!isDefined(markerData)) {
                    _deleteMarker(marker, map, layers);
                    clearWatch();
                    return;
                }

                if (!isDefined(oldMarkerData)) {
                    return;
                }

                // Update the lat-lng property (always present in marker properties)
                if (!(isNumber(markerData.lat) && isNumber(markerData.lng))) {
                    $log.warn('There are problems with lat-lng data, please verify your marker model');
                    _deleteMarker(marker, map, layers);
                    return;
                }

                // It is possible that the layer has been removed or the layer marker does not exist
                // Update the layer group if present or move it to the map if not
                if (!isString(markerData.layer)) {
                    // There is no layer information, we move the marker to the map if it was in a layer group
                    if (isString(oldMarkerData.layer)) {
                        // Remove from the layer group that is supposed to be
                        if (isDefined(layers.overlays[oldMarkerData.layer]) && layers.overlays[oldMarkerData.layer].hasLayer(marker)) {
                            layers.overlays[oldMarkerData.layer].removeLayer(marker);
                            marker.closePopup();
                        }
                        // Test if it is not on the map and add it
                        if (!map.hasLayer(marker)) {
                            map.addLayer(marker);
                        }
                    }
                }

                if (isString(markerData.layer) && oldMarkerData.layer !== markerData.layer) {
                    // If it was on a layer group we have to remove it
                    if (isString(oldMarkerData.layer) && isDefined(layers.overlays[oldMarkerData.layer]) && layers.overlays[oldMarkerData.layer].hasLayer(marker)) {
                        layers.overlays[oldMarkerData.layer].removeLayer(marker);
                    }
                    marker.closePopup();

                    // Remove it from the map in case the new layer is hidden or there is an error in the new layer
                    if (map.hasLayer(marker)) {
                        map.removeLayer(marker);
                    }

                    // The markerData.layer is defined so we add the marker to the layer if it is different from the old data
                    if (!isDefined(layers.overlays[markerData.layer])) {
                        $log.error('[AngularJS - Leaflet] You must use a name of an existing layer');
                        return;
                    }
                    // Is a group layer?
                    var layerGroup = layers.overlays[markerData.layer];
                    if (!(layerGroup instanceof L.LayerGroup || layerGroup instanceof L.FeatureGroup)) {
                        $log.error('[AngularJS - Leaflet] A marker can only be added to a layer of type "group" or "featureGroup"');
                        return;
                    }
                    // The marker goes to a correct layer group, so first of all we add it
                    layerGroup.addLayer(marker);
                    // The marker is automatically added to the map depending on the visibility
                    // of the layer, so we only have to open the popup if the marker is in the map
                    if (map.hasLayer(marker) && markerData.focus === true) {
                        marker.openPopup();
                    }
                }

                // Update the draggable property
                if (markerData.draggable !== true && oldMarkerData.draggable === true && (isDefined(marker.dragging))) {
                    marker.dragging.disable();
                }

                if (markerData.draggable === true && oldMarkerData.draggable !== true) {
                    // The markerData.draggable property must be true so we update if there wasn't a previous value or it wasn't true
                    if (marker.dragging) {
                        marker.dragging.enable();
                    } else {
                        if (L.Handler.MarkerDrag) {
                            marker.dragging = new L.Handler.MarkerDrag(marker);
                            marker.options.draggable = true;
                            marker.dragging.enable();
                        }
                    }
                }

                // Update the icon property
                if (!isObject(markerData.icon)) {
                    // If there is no icon property or it's not an object
                    if (isObject(oldMarkerData.icon)) {
                        // If there was an icon before restore to the default
                        marker.setIcon(createLeafletIcon());
                        marker.closePopup();
                        marker.unbindPopup();
                        if (isString(markerData.message)) {
                            marker.bindPopup(markerData.message, markerData.popupOptions);
                        }
                    }
                }

                if (isObject(markerData.icon) && isObject(oldMarkerData.icon) && !angular.equals(markerData.icon, oldMarkerData.icon)) {
                    var dragG = false;
                    if (marker.dragging) {
                        dragG = marker.dragging.enabled();
                    }
                    marker.setIcon(createLeafletIcon(markerData.icon));
                    if (dragG) {
                        marker.dragging.enable();
                    }
                    marker.closePopup();
                    marker.unbindPopup();
                    if (isString(markerData.message)) {
                        marker.bindPopup(markerData.message, markerData.popupOptions);
                    }
                }

                // Update the Popup message property
                if (!isString(markerData.message) && isString(oldMarkerData.message)) {
                    marker.closePopup();
                    marker.unbindPopup();
                }

                // Update the label content
                if (Helpers.LabelPlugin.isLoaded() && isDefined(markerData.label) && isDefined(markerData.label.message) && !angular.equals(markerData.label.message, oldMarkerData.label.message)) {
                    marker.updateLabelContent(markerData.label.message);
                }

                // There is some text in the popup, so we must show the text or update existing
                if (isString(markerData.message) && !isString(oldMarkerData.message)) {
                    // There was no message before so we create it
                    marker.bindPopup(markerData.message, markerData.popupOptions);
                    if (markerData.focus === true) {
                        // If the focus is set, we must open the popup, because we do not know if it was opened before
                        marker.openPopup();
                    }
                }

                if (isString(markerData.message) && isString(oldMarkerData.message) && markerData.message !== oldMarkerData.message) {
                    // There was a different previous message so we update it
                    marker.setPopupContent(markerData.message);
                }

                // Update the focus property
                var updatedFocus = false;
                if (markerData.focus !== true && oldMarkerData.focus === true) {
                    // If there was a focus property and was true we turn it off
                    marker.closePopup();
                    updatedFocus = true;
                }

                // The markerData.focus property must be true so we update if there wasn't a previous value or it wasn't true
                if (markerData.focus === true && oldMarkerData.focus !== true) {
                    marker.openPopup();
                    updatedFocus = true;
                }

                if(oldMarkerData.focus === true && markerData.focus === true){
                    // Reopen the popup when focus is still true
                    marker.openPopup();
                    updatedFocus = true;
                }

                // zIndexOffset adjustment
                if (oldMarkerData.zIndexOffset !== markerData.zIndexOffset) {
                    marker.setZIndexOffset(markerData.zIndexOffset);
                }

                var markerLatLng = marker.getLatLng();
                var isCluster = (isString(markerData.layer) && Helpers.MarkerClusterPlugin.is(layers.overlays[markerData.layer]));
                // If the marker is in a cluster it has to be removed and added to the layer when the location is changed
                if (isCluster) {
                    // The focus has changed even by a user click or programatically
                    if (updatedFocus) {
                        // We only have to update the location if it was changed programatically, because it was
                        // changed by a user drag the marker data has already been updated by the internal event
                        // listened by the directive
                        if ((markerData.lat !== oldMarkerData.lat) || (markerData.lng !== oldMarkerData.lng)) {
                            layers.overlays[markerData.layer].removeLayer(marker);
                            marker.setLatLng([markerData.lat, markerData.lng]);
                            layers.overlays[markerData.layer].addLayer(marker);
                        }
                    } else {
                        // The marker has possibly moved. It can be moved by a user drag (marker location and data are equal but old
                        // data is diferent) or programatically (marker location and data are diferent)
                        if ((markerLatLng.lat !== markerData.lat) || (markerLatLng.lng !== markerData.lng)) {
                            // The marker was moved by a user drag
                            layers.overlays[markerData.layer].removeLayer(marker);
                            marker.setLatLng([markerData.lat, markerData.lng]);
                            layers.overlays[markerData.layer].addLayer(marker);
                        } else if ((markerData.lat !== oldMarkerData.lat) || (markerData.lng !== oldMarkerData.lng)) {
                            // The marker was moved programatically
                            layers.overlays[markerData.layer].removeLayer(marker);
                            marker.setLatLng([markerData.lat, markerData.lng]);
                            layers.overlays[markerData.layer].addLayer(marker);
                        } else if (isObject(markerData.icon) && isObject(oldMarkerData.icon) && !angular.equals(markerData.icon, oldMarkerData.icon)) {
                            layers.overlays[markerData.layer].removeLayer(marker);
                            layers.overlays[markerData.layer].addLayer(marker);
                        }
                    }
                } else if (markerLatLng.lat !== markerData.lat || markerLatLng.lng !== markerData.lng) {
                    marker.setLatLng([markerData.lat, markerData.lng]);
                }
            }, true);
        }
    };
}]);

angular.module("leaflet-directive").factory('leafletHelpers', ["$q", "$log", function ($q, $log) {

    function _obtainEffectiveMapId(d, mapId) {
        var id, i;
        if (!angular.isDefined(mapId)) {
        if (Object.keys(d).length === 0) {
            id = "main";
        } else if (Object.keys(d).length >= 1) {
            for (i in d) {
                if (d.hasOwnProperty(i)) {
                    id = i;
                }
            }
        } else if (Object.keys(d).length === 0) {
            id = "main";
        } else {
                $log.error("[AngularJS - Leaflet] - You have more than 1 map on the DOM, you must provide the map ID to the leafletData.getXXX call");
            }
        } else {
            id = mapId;
        }

        return id;
    }

    function _getUnresolvedDefer(d, mapId) {
        var id = _obtainEffectiveMapId(d, mapId),
            defer;

        if (!angular.isDefined(d[id]) || d[id].resolvedDefer === true) {
            defer = $q.defer();
            d[id] = {
                defer: defer,
                resolvedDefer: false
            };
        } else {
            defer = d[id].defer;
        }

        return defer;
    }

    return {
        //Determine if a reference is {}
        isEmpty: function(value) {
            return Object.keys(value).length === 0;
        },

        //Determine if a reference is undefined or {}
        isUndefinedOrEmpty: function (value) {
            return (angular.isUndefined(value) || value === null) || Object.keys(value).length === 0;
        },

        // Determine if a reference is defined
        isDefined: function(value) {
            return angular.isDefined(value) && value !== null;
        },

        // Determine if a reference is a number
        isNumber: function(value) {
            return angular.isNumber(value);
        },

        // Determine if a reference is a string
        isString: function(value) {
            return angular.isString(value);
        },

        // Determine if a reference is an array
        isArray: function(value) {
            return angular.isArray(value);
        },

        // Determine if a reference is an object
        isObject: function(value) {
            return angular.isObject(value);
        },

		// Determine if a reference is a function.
		isFunction: function(value) {
			return angular.isFunction(value);
		},

        // Determine if two objects have the same properties
        equals: function(o1, o2) {
            return angular.equals(o1, o2);
        },

        isValidCenter: function(center) {
            return angular.isDefined(center) && angular.isNumber(center.lat) &&
                   angular.isNumber(center.lng) && angular.isNumber(center.zoom);
        },

        isValidPoint: function(point) {
            if (!angular.isDefined(point)) {
                return false;
            }
            if (angular.isArray(point)) {
                return point.length === 2 && angular.isNumber(point[0]) && angular.isNumber(point[1]);
            }
            return angular.isNumber(point.lat) && angular.isNumber(point.lng);
        },

        isSameCenterOnMap: function(centerModel, map) {
            var mapCenter = map.getCenter();
            var zoom = map.getZoom();
            if (centerModel.lat && centerModel.lng &&
                mapCenter.lat.toFixed(4) === centerModel.lat.toFixed(4) &&
                mapCenter.lng.toFixed(4) === centerModel.lng.toFixed(4) &&
                zoom === centerModel.zoom) {
                    return true;
            }
            return false;
        },

        safeApply: function($scope, fn) {
            var phase = $scope.$root.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                $scope.$eval(fn);
            } else {
                $scope.$apply(fn);
            }
        },

        obtainEffectiveMapId: _obtainEffectiveMapId,

        getDefer: function(d, mapId) {
            var id = _obtainEffectiveMapId(d, mapId),
                defer;
            if (!angular.isDefined(d[id]) || d[id].resolvedDefer === false) {
                defer = _getUnresolvedDefer(d, mapId);
            } else {
                defer = d[id].defer;
            }
            return defer;
        },

        getUnresolvedDefer: _getUnresolvedDefer,

        setResolvedDefer: function(d, mapId) {
            var id = _obtainEffectiveMapId(d, mapId);
            d[id].resolvedDefer = true;
        },

        AwesomeMarkersPlugin: {
            isLoaded: function() {
                if (angular.isDefined(L.AwesomeMarkers) && angular.isDefined(L.AwesomeMarkers.Icon)) {
                    return true;
                } else {
                    return false;
                }
            },
            is: function(icon) {
                if (this.isLoaded()) {
                    return icon instanceof L.AwesomeMarkers.Icon;
                } else {
                    return false;
                }
            },
            equal: function (iconA, iconB) {
                if (!this.isLoaded()) {
                    return false;
                }
                if (this.is(iconA)) {
                    return angular.equals(iconA, iconB);
                } else {
                    return false;
                }
            }
        },

        PolylineDecoratorPlugin: {
            isLoaded: function() {
                if (angular.isDefined(L.PolylineDecorator)) {
                    return true;
                } else {
                    return false;
                }
            },
            is: function(decoration) {
                if (this.isLoaded()) {
                    return decoration instanceof L.PolylineDecorator;
                } else {
                    return false;
                }
            },
            equal: function(decorationA, decorationB) {
                if (!this.isLoaded()) {
                    return false;
                }
                if (this.is(decorationA)) {
                    return angular.equals(decorationA, decorationB);
                } else {
                    return false;
                }
            }
        },

        MakiMarkersPlugin: {
            isLoaded: function() {
                if (angular.isDefined(L.MakiMarkers) && angular.isDefined(L.MakiMarkers.Icon)) {
                    return true;
                } else {
                    return false;
                }
            },
            is: function(icon) {
                if (this.isLoaded()) {
                    return icon instanceof L.MakiMarkers.Icon;
                } else {
                    return false;
                }
            },
            equal: function (iconA, iconB) {
                if (!this.isLoaded()) {
                    return false;
                }
                if (this.is(iconA)) {
                    return angular.equals(iconA, iconB);
                } else {
                    return false;
                }
            }
        },
        LabelPlugin: {
            isLoaded: function() {
                return angular.isDefined(L.Label);
            },
            is: function(layer) {
                if (this.isLoaded()) {
                    return layer instanceof L.MarkerClusterGroup;
                } else {
                    return false;
                }
            }
        },
        MarkerClusterPlugin: {
            isLoaded: function() {
                return angular.isDefined(L.MarkerClusterGroup);
            },
            is: function(layer) {
                if (this.isLoaded()) {
                    return layer instanceof L.MarkerClusterGroup;
                } else {
                    return false;
                }
            }
        },
        GoogleLayerPlugin: {
            isLoaded: function() {
                return angular.isDefined(L.Google);
            },
            is: function(layer) {
                if (this.isLoaded()) {
                    return layer instanceof L.Google;
                } else {
                    return false;
                }
            }
        },
        ChinaLayerPlugin: {
            isLoaded: function() {
                return angular.isDefined(L.tileLayer.chinaProvider);
            }
        },
        HeatMapLayerPlugin: {
            isLoaded: function() {
                return angular.isDefined(L.TileLayer.WebGLHeatMap);
            }
        },
        BingLayerPlugin: {
            isLoaded: function() {
                return angular.isDefined(L.BingLayer);
            },
            is: function(layer) {
                if (this.isLoaded()) {
                    return layer instanceof L.BingLayer;
                } else {
                    return false;
                }
            }
        },
        WFSLayerPlugin: {
            isLoaded: function() {
                return L.GeoJSON.WFS !== undefined;
            },
            is: function(layer) {
                if (this.isLoaded()) {
                    return layer instanceof L.GeoJSON.WFS;
                } else {
                    return false;
                }
            }
        },
        AGSLayerPlugin: {
            isLoaded: function() {
                return lvector !== undefined && lvector.AGS !== undefined;
            },
            is: function(layer) {
                if (this.isLoaded()) {
                    return layer instanceof lvector.AGS;
                } else {
                    return false;
                }
            }
        },
        YandexLayerPlugin: {
            isLoaded: function() {
                return angular.isDefined(L.Yandex);
            },
            is: function(layer) {
                if (this.isLoaded()) {
                    return layer instanceof L.Yandex;
                } else {
                    return false;
                }
            }
        },
		DynamicMapLayerPlugin: {
			isLoaded: function() {
				return L.esri !== undefined && L.esri.dynamicMapLayer !== undefined;
			},
			is: function(layer) {
				if (this.isLoaded()) {
					return layer instanceof L.esri.dynamicMapLayer;
				} else {
					return false;
				}
			}
        },
        GeoJSONPlugin: {
            isLoaded: function(){
                return angular.isDefined(L.TileLayer.GeoJSON);
            },
            is: function(layer) {
                if (this.isLoaded()) {
                    return layer instanceof L.TileLayer.GeoJSON;
                } else {
                    return false;
                }
            }
        },
		UTFGridPlugin: {
            isLoaded: function(){
                return angular.isDefined(L.UtfGrid);
            },
            is: function(layer) {
                if (this.isLoaded()) {
                    return layer instanceof L.UtfGrid;
                } else {
                    $log.error('[AngularJS - Leaflet] No UtfGrid plugin found.');
                    return false;
                }
            }
        },
        CartoDB: {
            isLoaded: function(){
                return cartodb;
            },
            is: function(/*layer*/) {
                return true;
                /*
                if (this.isLoaded()) {
                    return layer instanceof L.TileLayer.GeoJSON;
                } else {
                    return false;
                }*/
            }
        },
        Leaflet: {
            DivIcon: {
                is: function(icon) {
                    return icon instanceof L.DivIcon;
                },
                equal: function(iconA, iconB) {
                    if (this.is(iconA)) {
                        return angular.equals(iconA, iconB);
                    } else {
                        return false;
                    }
                }
            },
            Icon: {
                is: function(icon) {
                    return icon instanceof L.Icon;
                },
                equal: function(iconA, iconB) {
                    if (this.is(iconA)) {
                        return angular.equals(iconA, iconB);
                    } else {
                        return false;
                    }
                }
            }
        }
    };
}]);

}());
'use strict';

var app = angular.module('IF', ['ngRoute','ngSanitize','ngAnimate','ngTouch', 'ngMessages', 'tidepoolsFilters','tidepoolsServices','leaflet-directive','angularFileUpload', 'IF-directives',  'mgcrea.ngStrap', 'angularSpectrumColorpicker', 'ui.slider', 'swipe', 'monospaced.elastic', 'ui.calendar', 'textAngular'])
  .config(function($routeProvider, $locationProvider, $httpProvider, $animateProvider, $tooltipProvider, $provide) {
  // $httpProvider.defaults.useXDomain = true;
	var reg = $animateProvider.classNameFilter(/if-animate/i);
	console.log(reg);
    //================================================
    // Check if the user is connected
    //================================================


var checkLoggedin = function(userManager) {
    return userManager.checkLogin();
}

    //================================================
    
    //================================================
    // Add an interceptor for AJAX errors
    //================================================
	$httpProvider.interceptors.push(function($q, $location, lockerManager, ifGlobals) {
    	return {
    		'request': function(request) {
	    			if (request.server) { //interceptor for requests that need auth--gives fb auth or basic auth
		    			request.url = 'https://bubbl.li' + request.url;
		    			if (ifGlobals.username&&ifGlobals.password) {
							request.headers['Authorization'] = ifGlobals.getBasicHeader();
							//console.log(request);
						} else if (ifGlobals.fbToken) {
							request.headers['Authorization'] = 'Bearer '+ifGlobals.fbToken;
						}
	    			}
				return request;
    		},
	    	'response': function(response) {
		    	//do something on success
		    	return response;
	    	},
	    	'responseError': function(rejection) {
		    	if (rejection.status === 401) {
			    	//$location.path('/login');
		    	}
		    	return $q.reject(rejection);
	    	}	
    	}
    });
    
	//================================================


    //================================================
    // Define all the routes
    //================================================
$routeProvider.
      when('/', {templateUrl: 'components/home/home.html', controller: 'HomeController'}).
      when('/nearby', {templateUrl: 'components/nearby/nearby.html', controller: 'NearbyCtrl'}).
      when('home', {templateUrl: 'components/home/home.html', controller: 'HomeController'}).
      when('/nearby', {templateUrl: 'components/nearby/nearby.html', controller: 'WorldRouteCtrl'}).
      
      when('/login', {templateUrl: 'components/user/login.html', controller: 'LoginCtrl'}).
      when('/forgot', {templateUrl: 'components/user/forgot.html', controller: 'ForgotCtrl'}).
      when('/reset/:token', {templateUrl: 'components/user/change-password.html', controller: 'ResetCtrl'}).
      when('/signup', {templateUrl: 'components/user/signup.html', controller: 'SignupCtrl'}).
      when('/signup/:incoming', {templateUrl: 'components/user/signup.html', controller: 'SignupCtrl'}).

      when('/auth/:type', {templateUrl: 'components/user/loading.html', controller: 'resolveAuth'}).
      when('/auth/:type/:callback', {templateUrl: 'components/user/loading.html', controller: 'resolveAuth'}).
      
      when('/profile', {redirectTo:'/profile/worlds'}).
      when('/profile/:tab', {templateUrl: 'components/user/user.html', controller: 'UserController'}).
      when('/profile/:tab/:incoming', {templateUrl: 'components/user/user.html', controller: 'UserController'}).
      when('/w/:worldURL', {templateUrl: 'components/world/world.html', controller: 'WorldController'}).
      when('/w/:worldURL/upcoming', {templateUrl: 'components/world/upcoming.html', controller: 'WorldController'}).
      when('/w/:worldURL/messages', {templateUrl: 'components/world/messages/messages.html', controller: 'MessagesController'}).
	  when('/w/:worldURL/schedule', {templateUrl: 'components/world/subviews/schedule.html', controller: 'ScheduleController'}).
	  when('/w/:worldURL/instagram', {templateUrl: 'components/world/subviews/instagram.html', controller: 'InstagramListController'}).
	  when('/w/:worldURL/twitter', {templateUrl: 'components/world/subviews/twitter.html', controller: 'TwitterListController'}).


      when('/w/:worldURL/:landmarkURL', {templateUrl: 'components/world/landmark.html', controller: 'LandmarkController'}).
      when('/w/:worldURL/category/:category', {templateUrl: 'components/world/category.html', controller: 'CategoryController'}).
      
      when('/edit/w/:worldURL/landmarks', {templateUrl: 'components/edit/landmark-editor.html', controller: 'LandmarkEditorController', resolve: {loggedin: checkLoggedin}}).
      when('/edit/w/:worldURL/', {templateUrl: 'components/edit/edit_world.html', controller: 'EditController', resolve: {loggedin: checkLoggedin}}).
	  when('/edit/w/:worldURL/:view', {templateUrl: 'components/edit/edit_world.html', controller: 'EditController', resolve: {loggedin: checkLoggedin}}).
	  when('/edit/walkthrough/:_id', {templateUrl: 'components/edit/walkthrough/walkthrough.html', controller: 'WalkthroughController', resolve: {loggedin: checkLoggedin}}).
      
      when('/meetup', {templateUrl: 'components/tour/meetup.html', controller: 'MeetupController'}).
      when('/welcome', {templateUrl: 'components/tour/welcome.html', controller: 'WelcomeController'}).

      
      when('/search/:searchQuery', {templateUrl: 'components/search/search.html', controller: 'SearchController'}).
      
      when('/twitter/:hashTag', {templateUrl: 'partials/tweet-list.html', controller: 'TweetlistCtrl'}).

      //when('/user/:userID', {templateUrl: 'partials/user-view.html', controller: UserCtrl, resolve: {loggedin: checkLoggedin}}).

      otherwise({redirectTo: '/'});
      
angular.extend($tooltipProvider.defaults, {
	animation: 'am-fade',
	placement: 'right',
	delay: {show: '0', hide: '250'}
});

})
.run(function($rootScope, $http, $location, userManager, lockerManager){
	
	
	
	navigator.splashscreen.hide();
	
/*
lockerManager.getCredentials().then(function(credentials) {
userManager.signin(credentials.username, credentials.password).then(function(success) {
		userManager.checkLogin().then(function(success) {
			console.log(success);
		});
	}, function (reason) {
		console.log('credential signin error', reason)
	});
}, function(err) {
	console.log('credential error', error); 
});
*/
});

document.addEventListener('deviceready', onDeviceReady, true);
function onDeviceReady() {
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['IF']);
	});
}
/*
*  AngularJs Fullcalendar Wrapper for the JQuery FullCalendar
*  API @ http://arshaw.com/fullcalendar/
*
*  Angular Calendar Directive that takes in the [eventSources] nested array object as the ng-model and watches it deeply changes.
*       Can also take in multiple event urls as a source object(s) and feed the events per view.
*       The calendar will watch any eventSource array and update itself when a change is made.
*
*/

angular.module('ui.calendar', [])
  .constant('uiCalendarConfig', {calendars: {}})
  .controller('uiCalendarCtrl', ['$scope', 
                                 '$timeout', 
                                 '$locale', function(
                                  $scope, 
                                  $timeout, 
                                  $locale){

      var sourceSerialId = 1,
          eventSerialId = 1,
          sources = $scope.eventSources,
          extraEventSignature = $scope.calendarWatchEvent ? $scope.calendarWatchEvent : angular.noop,

          wrapFunctionWithScopeApply = function(functionToWrap){
              var wrapper;

              if (functionToWrap){
                  wrapper = function(){
                      // This happens outside of angular context so we need to wrap it in a timeout which has an implied apply.
                      // In this way the function will be safely executed on the next digest.

                      var args = arguments;
                      var _this = this;
                      $timeout(function(){
                        functionToWrap.apply(_this, args);
                      });
                  };
              }

              return wrapper;
          };

      this.eventsFingerprint = function(e) {
        if (!e._id) {
          e._id = eventSerialId++;
        }
        // This extracts all the information we need from the event. http://jsperf.com/angular-calendar-events-fingerprint/3
        return "" + e._id + (e.id || '') + (e.title || '') + (e.url || '') + (+e.start || '') + (+e.end || '') +
          (e.allDay || '') + (e.className || '') + extraEventSignature(e) || '';
      };

      this.sourcesFingerprint = function(source) {
          return source.__id || (source.__id = sourceSerialId++);
      };

      this.allEvents = function() {
        // return sources.flatten(); but we don't have flatten
        var arraySources = [];
        for (var i = 0, srcLen = sources.length; i < srcLen; i++) {
          var source = sources[i];
          if (angular.isArray(source)) {
            // event source as array
            arraySources.push(source);
          } else if(angular.isObject(source) && angular.isArray(source.events)){
            // event source as object, ie extended form
            var extEvent = {};
            for(var key in source){
              if(key !== '_uiCalId' && key !== 'events'){
                 extEvent[key] = source[key];
              }
            }
            for(var eI = 0;eI < source.events.length;eI++){
              angular.extend(source.events[eI],extEvent);
            }
            arraySources.push(source.events);
          }
        }

        return Array.prototype.concat.apply([], arraySources);
      };

      // Track changes in array by assigning id tokens to each element and watching the scope for changes in those tokens
      // arguments:
      //  arraySource array of function that returns array of objects to watch
      //  tokenFn function(object) that returns the token for a given object
      this.changeWatcher = function(arraySource, tokenFn) {
        var self;
        var getTokens = function() {
          var array = angular.isFunction(arraySource) ? arraySource() : arraySource;
          var result = [], token, el;
          for (var i = 0, n = array.length; i < n; i++) {
            el = array[i];
            token = tokenFn(el);
            map[token] = el;
            result.push(token);
          }
          return result;
        };
        // returns elements in that are in a but not in b
        // subtractAsSets([4, 5, 6], [4, 5, 7]) => [6]
        var subtractAsSets = function(a, b) {
          var result = [], inB = {}, i, n;
          for (i = 0, n = b.length; i < n; i++) {
            inB[b[i]] = true;
          }
          for (i = 0, n = a.length; i < n; i++) {
            if (!inB[a[i]]) {
              result.push(a[i]);
            }
          }
          return result;
        };

        // Map objects to tokens and vice-versa
        var map = {};

        var applyChanges = function(newTokens, oldTokens) {
          var i, n, el, token;
          var replacedTokens = {};
          var removedTokens = subtractAsSets(oldTokens, newTokens);
          for (i = 0, n = removedTokens.length; i < n; i++) {
            var removedToken = removedTokens[i];
            el = map[removedToken];
            delete map[removedToken];
            var newToken = tokenFn(el);
            // if the element wasn't removed but simply got a new token, its old token will be different from the current one
            if (newToken === removedToken) {
              self.onRemoved(el);
            } else {
              replacedTokens[newToken] = removedToken;
              self.onChanged(el);
            }
          }

          var addedTokens = subtractAsSets(newTokens, oldTokens);
          for (i = 0, n = addedTokens.length; i < n; i++) {
            token = addedTokens[i];
            el = map[token];
            if (!replacedTokens[token]) {
              self.onAdded(el);
            }
          }
        };
        return self = {
          subscribe: function(scope, onChanged) {
            scope.$watch(getTokens, function(newTokens, oldTokens) {
              if (!onChanged || onChanged(newTokens, oldTokens) !== false) {
                applyChanges(newTokens, oldTokens);
              }
            }, true);
          },
          onAdded: angular.noop,
          onChanged: angular.noop,
          onRemoved: angular.noop
        };
      };

      this.getFullCalendarConfig = function(calendarSettings, uiCalendarConfig){
          var config = {};

          angular.extend(config, uiCalendarConfig);
          angular.extend(config, calendarSettings);
         
          angular.forEach(config, function(value,key){
            if (typeof value === 'function'){
              config[key] = wrapFunctionWithScopeApply(config[key]);
            }
          });

          return config;
      };

    this.getLocaleConfig = function(fullCalendarConfig) {
      if (!fullCalendarConfig.lang || fullCalendarConfig.useNgLocale) {
        // Configure to use locale names by default
        var tValues = function(data) {
          // convert {0: "Jan", 1: "Feb", ...} to ["Jan", "Feb", ...]
          var r, k;
          r = [];
          for (k in data) {
            r[k] = data[k];
          }
          return r;
        };
        var dtf = $locale.DATETIME_FORMATS;
        return {
          monthNames: tValues(dtf.MONTH),
          monthNamesShort: tValues(dtf.SHORTMONTH),
          dayNames: tValues(dtf.DAY),
          dayNamesShort: tValues(dtf.SHORTDAY)
        };
      }
      return {};
    };
  }])
  .directive('uiCalendar', ['uiCalendarConfig', function(uiCalendarConfig) {
    return {
      restrict: 'A',
      scope: {eventSources:'=ngModel',calendarWatchEvent: '&'},
      controller: 'uiCalendarCtrl',
      link: function(scope, elm, attrs, controller) {

        var sources = scope.eventSources,
            sourcesChanged = false,
            calendar,
            eventSourcesWatcher = controller.changeWatcher(sources, controller.sourcesFingerprint),
            eventsWatcher = controller.changeWatcher(controller.allEvents, controller.eventsFingerprint),
            options = null;

        function getOptions(){
          var calendarSettings = attrs.uiCalendar ? scope.$parent.$eval(attrs.uiCalendar) : {},
              fullCalendarConfig;

          fullCalendarConfig = controller.getFullCalendarConfig(calendarSettings, uiCalendarConfig);

          var localeFullCalendarConfig = controller.getLocaleConfig(fullCalendarConfig);
          angular.extend(localeFullCalendarConfig, fullCalendarConfig);
          options = { eventSources: sources };
          angular.extend(options, localeFullCalendarConfig);
          //remove calendars from options
          options.calendars = null;

          var options2 = {};
          for(var o in options){
            if(o !== 'eventSources'){
              options2[o] = options[o];
            }
          }
          return JSON.stringify(options2);
        }

        scope.destroy = function(){
          if(calendar && calendar.fullCalendar){
            calendar.fullCalendar('destroy');
          }
          if(attrs.calendar) {
            calendar = uiCalendarConfig.calendars[attrs.calendar] = $(elm).html('');
          } else {
            calendar = $(elm).html('');
          }
        };

        scope.init = function(){
          calendar.fullCalendar(options);
        };

        eventSourcesWatcher.onAdded = function(source) {
            calendar.fullCalendar('addEventSource', source);
            sourcesChanged = true;
        };

        eventSourcesWatcher.onRemoved = function(source) {
          calendar.fullCalendar('removeEventSource', source);
          sourcesChanged = true;
        };

        eventsWatcher.onAdded = function(event) {
          calendar.fullCalendar('renderEvent', event);
        };

        eventsWatcher.onRemoved = function(event) {
          calendar.fullCalendar('removeEvents', function(e) { 
            return e._id === event._id;
          });
        };

        eventsWatcher.onChanged = function(event) {
          event._start = $.fullCalendar.moment(event.start);
          event._end = $.fullCalendar.moment(event.end);
          calendar.fullCalendar('updateEvent', event);
        };

        eventSourcesWatcher.subscribe(scope);
        eventsWatcher.subscribe(scope, function(newTokens, oldTokens) {
          if (sourcesChanged === true) {
            sourcesChanged = false;
            // prevent incremental updates in this case
            return false;
          }
        });

        scope.$watch(getOptions, function(newO,oldO){
            scope.destroy();
            scope.init();
        });
      }
    };
}]);
'use strict';

/* Directives */

angular.module('IF-directives', [])
.directive('myPostRepeatDirective', function() {

	
  return function(scope, element, attrs) {
    if (scope.$last){
      // iteration is complete, do whatever post-processing
      // is necessary
      var $container = $('#card-container');
	  // init
	  $container.isotope({
	    // options
	    itemSelector: '.iso-card'
	  });
    }
  };
})

.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
        	console.log('ng-enter');
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
app.directive('bubbleBody', function(apertureService) {
	return {
		restrict: 'A',
		scope: true,
		link: function(scope, element, attrs) {
			//basically just handles scroll stuff
			var handleScroll = _.throttle(function() {
				var st = element.scrollTop();
				
				if (st === 0 && apertureService.state != 'aperture-third') {
					apertureService.set('third');
				} else if (apertureService.state != 'aperture-off') {
					apertureService.set('off');
				}
			}, 100);
			
			element.on('scroll', handleScroll);
			
			scope.$on('$destroy', function() {
				element.off('scroll');
			});
		}
	}
});
app.directive('compassButton', function(worldTree, $templateRequest, $compile, userManager, $timeout) {
	return { //NOT USED ANY MORE
		restrict: 'EA',
		scope: true,
		link: function(scope, element, attrs) {
			var compassMenu;
			
			function positionCompassMenu() {
				if (scope.compassState == true) {
					var offset = element.offset();
					var topOffset = 19;
					
					var newOffset = {top: topOffset, left: offset.left-compassMenu.width()+40};
					compassMenu.offset(newOffset);
				}
			}
			
			$templateRequest('templates/compassButton.html').then(function(template) {
				$compile(template)(scope, function(clonedElement) {
					compassMenu = $(clonedElement).appendTo(document.body);
					
					positionCompassMenu();
														
					scope.$watch(function () {
						return userManager.getDisplayName();
					}, function(newVal, oldVal) {
						positionCompassMenu();
					
					});
					
					$(window).resize(
						_.debounce(positionCompassMenu, 200)
					);
				})
			});			
			
			scope.compassOn = function($event, val) {
				console.log('compassOn');
				if (val!=undefined) {scope.compassState = val}
				if (val==true) {
					$timeout(positionCompassMenu, 0);
				}
				
				if ($event) {
					console.log('compassOn:event');

					$event.stopPropagation();
					$(document.body).on('click', function(e) {
						console.log('compassOn:html click');

						scope.compassState = false;
						scope.$digest();
						$(document.body).off('click');
					})
				}
				
			}
			
			console.log('linking compass button');
			worldTree.getNearby().then(function(data) {
				console.log('compassButton', data);
				scope.nearbyBubbles = data['150m'];
			}, function(reason) {console.log(reason)});
		}
	}
});
/*
 * angular-elastic v2.4.0
 * (c) 2014 Monospaced http://monospaced.com
 * License: MIT
 */

angular.module('monospaced.elastic', [])

  .constant('msdElasticConfig', {
    append: ''
  })

  .directive('msdElastic', [
    '$timeout', '$window', 'msdElasticConfig',
    function($timeout, $window, config) {
      'use strict';

      return {
        require: 'ngModel',
        restrict: 'A, C',
        link: function(scope, element, attrs, ngModel) {

          // cache a reference to the DOM element
          var ta = element[0],
              $ta = element;

          // ensure the element is a textarea, and browser is capable
          if (ta.nodeName !== 'TEXTAREA' || !$window.getComputedStyle) {
            return;
          }

          // set these properties before measuring dimensions
          $ta.css({
            'overflow': 'hidden',
            'overflow-y': 'hidden',
            'word-wrap': 'break-word'
          });

          // force text reflow
          var text = ta.value;
          ta.value = '';
          ta.value = text;

          var append = attrs.msdElastic ? attrs.msdElastic.replace(/\\n/g, '\n') : config.append,
              $win = angular.element($window),
              mirrorInitStyle = 'position: absolute; top: -999px; right: auto; bottom: auto;' +
                                'left: 0; overflow: hidden; -webkit-box-sizing: content-box;' +
                                '-moz-box-sizing: content-box; box-sizing: content-box;' +
                                'min-height: 0 !important; height: 0 !important; padding: 0;' +
                                'word-wrap: break-word; border: 0;',
              $mirror = angular.element('<textarea tabindex="-1" ' +
                                        'style="' + mirrorInitStyle + '"/>').data('elastic', true),
              mirror = $mirror[0],
              taStyle = getComputedStyle(ta),
              resize = taStyle.getPropertyValue('resize'),
              borderBox = taStyle.getPropertyValue('box-sizing') === 'border-box' ||
                          taStyle.getPropertyValue('-moz-box-sizing') === 'border-box' ||
                          taStyle.getPropertyValue('-webkit-box-sizing') === 'border-box',
              boxOuter = !borderBox ? {width: 0, height: 0} : {
                            width:  parseInt(taStyle.getPropertyValue('border-right-width'), 10) +
                                    parseInt(taStyle.getPropertyValue('padding-right'), 10) +
                                    parseInt(taStyle.getPropertyValue('padding-left'), 10) +
                                    parseInt(taStyle.getPropertyValue('border-left-width'), 10),
                            height: parseInt(taStyle.getPropertyValue('border-top-width'), 10) +
                                    parseInt(taStyle.getPropertyValue('padding-top'), 10) +
                                    parseInt(taStyle.getPropertyValue('padding-bottom'), 10) +
                                    parseInt(taStyle.getPropertyValue('border-bottom-width'), 10)
                          },
              minHeightValue = parseInt(taStyle.getPropertyValue('min-height'), 10),
              heightValue = parseInt(taStyle.getPropertyValue('height'), 10),
              minHeight = Math.max(minHeightValue, heightValue) - boxOuter.height,
              maxHeight = parseInt(taStyle.getPropertyValue('max-height'), 10),
              mirrored,
              active,
              copyStyle = ['font-family',
                           'font-size',
                           'font-weight',
                           'font-style',
                           'letter-spacing',
                           'line-height',
                           'text-transform',
                           'word-spacing',
                           'text-indent'];

          // exit if elastic already applied (or is the mirror element)
          if ($ta.data('elastic')) {
            return;
          }

          // Opera returns max-height of -1 if not set
          maxHeight = maxHeight && maxHeight > 0 ? maxHeight : 9e4;

          // append mirror to the DOM
          if (mirror.parentNode !== document.body) {
            angular.element(document.body).append(mirror);
          }

          // set resize and apply elastic
          $ta.css({
            'resize': (resize === 'none' || resize === 'vertical') ? 'none' : 'horizontal'
          }).data('elastic', true);

          /*
           * methods
           */

          function initMirror() {
            var mirrorStyle = mirrorInitStyle;

            mirrored = ta;
            // copy the essential styles from the textarea to the mirror
            taStyle = getComputedStyle(ta);
            angular.forEach(copyStyle, function(val) {
              mirrorStyle += val + ':' + taStyle.getPropertyValue(val) + ';';
            });
            mirror.setAttribute('style', mirrorStyle);
          }

          function adjust() {
            var taHeight,
                taComputedStyleWidth,
                mirrorHeight,
                width,
                overflow;

            if (mirrored !== ta) {
              initMirror();
            }

            // active flag prevents actions in function from calling adjust again
            if (!active) {
              active = true;

              mirror.value = ta.value + append; // optional whitespace to improve animation
              mirror.style.overflowY = ta.style.overflowY;

              taHeight = ta.style.height === '' ? 'auto' : parseInt(ta.style.height, 10);

              taComputedStyleWidth = getComputedStyle(ta).getPropertyValue('width');

              // ensure getComputedStyle has returned a readable 'used value' pixel width
              if (taComputedStyleWidth.substr(taComputedStyleWidth.length - 2, 2) === 'px') {
                // update mirror width in case the textarea width has changed
                width = parseInt(taComputedStyleWidth, 10) - boxOuter.width;
                mirror.style.width = width + 'px';
              }

              mirrorHeight = mirror.scrollHeight;

              if (mirrorHeight > maxHeight) {
                mirrorHeight = maxHeight;
                overflow = 'scroll';
              } else if (mirrorHeight < minHeight) {
                mirrorHeight = minHeight;
              }
              mirrorHeight += boxOuter.height;

              ta.style.overflowY = overflow || 'hidden';

              if (taHeight !== mirrorHeight) {
                ta.style.height = mirrorHeight + 'px';
                scope.$emit('elastic:resize', $ta);
              }

              // small delay to prevent an infinite loop
              $timeout(function() {
                active = false;
              }, 1);

            }
          }

          function forceAdjust() {
            active = false;
            adjust();
          }

          /*
           * initialise
           */

          // listen
          if ('onpropertychange' in ta && 'oninput' in ta) {
            // IE9
            ta['oninput'] = ta.onkeyup = adjust;
          } else {
            ta['oninput'] = adjust;
          }

          $win.bind('resize', forceAdjust);

          scope.$watch(function() {
            return ngModel.$modelValue;
          }, function(newValue) {
            forceAdjust();
          });

          scope.$on('elastic:adjust', function() {
            initMirror();
            forceAdjust();
          });

          $timeout(adjust);

          /*
           * destroy
           */

          scope.$on('$destroy', function() {
            $mirror.remove();
            $win.unbind('resize', forceAdjust);
          });
        }
      };
    }
  ]);

app.directive('fitFont', function($rootScope) { //used to fit font size to large as possible without overflow
	return {
		restrict: 'A',
		scope: true,
		link: function($scope, $element, attrs) {
			console.log('link', $element);
			var fontSize = parseInt($element.css('font-size'));
			var domElement = $element[0];
			var ears = []; //listeners
			
			//FUNCTIONS
			
			function hasOverflow(e) {
				if (e.offsetHeight < e.scrollHeight || e.offsetWidth < e.scrollWidth) {
					return true;
				} else {
					return false;
				}
			}
			
			function shrinkFont() {
				console.log('shrinkFont', hasOverflow(domElement), fontSize);
				while (hasOverflow(domElement) && fontSize > 12) {
					fontSize--;
					$element.css('font-size', fontSize+'px');
				}
			}
			
			function growFont() {
				console.log('growFont', hasOverflow(domElement), fontSize);

				while(!hasOverflow(domElement) && fontSize < 40) {
					fontSize++;
					$element.css('font-size', fontSize+'px');
				}
				shrinkFont();
			}
			
			function updateAfterChange(newWidth, oldWidth) {
				if (newWidth < oldWidth) {
					shrinkFont();
				} else {
					growFont();
				}
			}
			
			//LISTENERS
			
			ears.push(
			$scope.$watch( //watch for resizes
				function() {
					return domElement.clientWidth;
				}, 
				function (newWidth, oldWidth) {
					if (newWidth != oldWidth ) {
						updateAfterChange(newWidth, oldWidth);
					}
			}));
	
			//Watch for changes to contents
			ears.push(
			$scope.$watch(
				function() {
					return domElement.innerText;
				},
				function (newText, oldText) {
					growFont();
				})
			)
	
			$scope.$on("$destroy", function() {
				for (var i = 0, len = ears.length; i < len; i++) {
					ears[i]();
				}
			});
			
		}
	}
});

app.directive('ifHref', function() { //used to make URLs safe for both phonegap and web.
	return {
		restrict: 'A',
		priority: 99, 
		link: function($scope, $element, $attr) {
			$attr.$observe('ifHref', function(value) {
				if (!value) {
					$attr.$set('href', null);
				return;
				}
			
			$attr.$set('href', value);
			
			});
				
		}
	}
});
app.directive('ifSrc', function() { //used to make srcs safe for phonegap and web. Only for hosted content
	return {
		restrict: 'A',
		priority: 99, 
		link: function($scope, $element, $attr) {
			$attr.$observe('ifSrc', function(value) {
				if (!value) {
					$attr.$set('src', null);
				return;
				}
			
				if (value.indexOf('http')<0) {
					value = 'https://bubbl.li/'+value;
				}
				
				$attr.$set('src', value);
			
			});
				
		}
	}
});
app.directive('progressCircle', function() {
	return {
		restrict: 'EA',
		scope: {
			top: '=',
			left: '=',
			fullWidth: '=',
			spinLeft: '=',
			spinLeftLong: '='
		},
		templateUrl: 'templates/progressCircle.html',
		controller: function($scope) {
			$scope.style = function() {
				return {
					'top': $scope.top + 'px',
					'left': $scope.left + 'px',
					'width': $scope.fullWidth + 'px',
					'height': $scope.fullWidth + 'px',
					'clip': getClip($scope.spinLeft, $scope.spinLeftLong, $scope.fullWidth)
				};
			};

			$scope.styleClip = {
				'clip': 'rect(0px,' + $scope.fullWidth/2 + 'px,' + $scope.fullWidth + 'px,' + '0px)'
			};

			var getClip = function(spinLeft, spinLeftLong, fullWidth) {
				var clipNone = 'rect(auto, auto, auto, auto)';
				var clipAll = 'rect(0px, 0px, 0px, 0px)';
				var clipLeft = 'rect(0px,' + fullWidth + 'px,' + fullWidth + 'px,' + (fullWidth/2) + 'px)';

				if (spinLeft && spinLeftLong) return clipNone;
				else if (!spinLeft && !spinLeftLong) return clipAll;
				else return clipLeft; // default
			}
		}
	};
});
//angular.module('IF-directives', [])
app.directive('ryFocus', function($rootScope, $timeout) {
	return {
		restrict: 'A',
		scope: {
			shouldFocus: "=ryFocus"
		},
		link: function($scope, $element, attrs) {
			$scope.$watch("shouldFocus", function(current, previous) {
				if (current == true && !previous) {
					console.log('focus');
					$element[0].focus();
				} else if (current == false && previous) {
					console.log('blur');
					$element[0].blur();
				}
			});
		}
	}
});
app.directive('stickers', function(apertureService) { //NOT USED
	return {
		restrict: 'A',
		scope: true,
		link: function(scope, element, attrs) {
			var touch,
				action,
				diffX,
				diffY,
				endX,
				endY,
				scroll,
				drag,
				dragTimer,
				startX,
				startY;
				
			function getCoord(e, c) {
				return /touch/.test(e.type) ? (e.originalEvent || e).changedTouches[0]['page' + c] : e['page' + c];
			}
 
			//EVENT HANDLERS
			function onStart(ev) {
				startX = getCoord(ev, 'X');
				startY = getCoord(ev, 'Y');
				diffX = 0;
				diffY = 0;
				
				dragTimer = setTimeout(function () {
					drag = true;
				}, 200);
			}
			
			function onMove(ev) {
				endX = getCoord(ev, 'X');
				endY = getCoord(ev, 'Y');
				diffX = endX - startX;
				diffY = endY - startY;
				
				
				if (!drag) {
					if (Math.abs(diffY) > 10) {
						scroll = true;
						//android 4.0 touchend issue here
						//trigger touchend
					} /*else if (Math.abs(diffX) > 7) { //swipe
						swipe = true
					}*/
				}
				
				if (drag) {
					ev.preventDefault(); //kill page scrolling
					//handle dragging
					console.log('dragging starts');
					stickerElement.style.top = endY + 'px';
					stickerElement.style.left = endX + 'px';
				}
				
				if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
					//kill drag timer when you've started moving.
					clearTimeout(dragTimer)
				}
			}
						
			function onEnd(ev) {
				if (drag) {
					//handle drag end
					console.log('drag end');
					console.log(endX, endY);
				} else if (!scroll & Math.abs(diffX) < 5 && Math.abs(diffY) < 5) {
					if (ev.type === 'touchend') {
						ev.preventDefault(); //phantom clicks?
					}
					//handle tap
					console.log('tap');
				}
				
				swipe = false;
				drag = false;
				scroll = false;
				
				clearTimeout(dragTimer);
			}
			
			
			//INIT DOM
			var stickerElement = document.createElement('div');
			stickerElement.className = "floating-sticker";
			document.body.appendChild(stickerElement);
			
			
			//INIT LISTENERS
			element.on('touchstart', onStart)
			.on('touchmove', onMove)
			.on('touchend', onEnd);
			
			
		}
	}
});
app.directive('stickerCrosshair', ['$window', function($window) { //keeps sticker crosshair positioned
	return {
		restrict: 'A',
		scope: true,
		link: function(scope, element, attrs) {
			function positionCrosshair() {
				var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
				w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0), 
				wOffset = 0,//50,
				hOffset = 0,//100,
				left = w/2 - wOffset,
				top = (h-220-48)/2+48 - hOffset;
				
				element[0].style.left = left + 'px';
				element[0].style.top = top + 'px';
			}
			
			$(window).on('resize', positionCrosshair);
			positionCrosshair();
			
		 
		}
	}
}]);
angular.module('IF-directives', [])
.directive('ifTooltip', function($rootScope) {
	return {
		restrict: 'A',
		link: function($scope, $element, attrs) {
			console.log('linking if tooltip');
				
                new Drop({
                    target: $element[0],
                    content: 'testing 123',
                    position: 'bottom right',
                    openOn: 'click'
                });
            }	
		}
});

angular.module('IF-directives', [])
.directive('userChip', ['dialogs', function(dialogs) {
	return {
		restrict: 'A',
		scope: true,
		link: function(scope, element, attrs) {
			scope.openDrawer = function() {
				console.log('openDrawer');
				scope.$emit('toggleDrawer');
			}
			
			scope.login = function() {
				dialogs.showDialog('authDialog.html');
			}
		},
		templateUrl: 'templates/userChip.html'
	}
		
}]);
app.directive('worldShelf', ['$document', 'apertureService','$rootScope','$location', function($document, apertureService,$rootScope,$location) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {

			// window.onpopstate = function(event) {
			// 	if (apertureService.state==='aperture-full') {
			// 		e.stopPropagation();
			// 		e.preventDefault();
			// 		scope.$apply(function() {
			// 			apertureService.toggle('full');
			// 		});
			// 	}	
			// }

			// DETECT KEYPRESS!!!!!!!!!!!!!!!!



			

		  //  $rootScope.$on('$locationChangeStart', function(event,next,current) {

		  //  		if (apertureService.state==='aperture-full') {

			 //   		if ($rootScope.watchPastLoc && $rootScope.watchPastLoc !== ''){ //we're not on first loaded page

				// 		console.log('next',next);
				// 		console.log('current',current);
				// 		console.log('watchpast',$rootScope.watchPastLoc);

				// 		if ($rootScope.watchPastLoc == next){ //detect switch to previous page

				// 			console.log('FIRING');
				// 			event.preventDefault();
				// 			apertureService.toggle('full');

				// 		}			
			 //   		}
			 //   		else {
						
			 //   		}
		  //  		}

				// $rootScope.watchPastLoc = current; //recording previous state before loc change

		  //   });      






		  //  $rootScope.$watch(function () {return $location.path()}, function (newLocation, oldLocation) {

		  //  		console.log('asdf!!!!');
				// if (apertureService.state==='aperture-full') {
				// 	closeMap();
				// }	
		  //   });

			// $document.on('keydown', function(e) {
			// 	if (e.keyCode===8 && apertureService.state==='aperture-full') {
			// 		closeMap();
			// 	}	
			// })

			// function closeMap(){
			// 	// e.stopPropagation();
			// 	// e.preventDefault();
			// 	scope.$apply(function() {
			// 		apertureService.toggle('full');
			// 	});
			// }

	

		}
	}
}]);
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
'use strict';

/* Filters */

angular.module('tidepoolsFilters', []).filter('hashtag', function() {
  return function(input) {

  //http://www.simonwhatley.co.uk/parsing-twitter-usernames-hashtags-and-urls-with-javascript
  return input.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
    var tag = t.replace("#","");
    return t.link("#/talk/"+tag);
  });
  };
})

//Filtering youtube links to auto-display
.filter('youtubestrip', function() {
  return function(input) {

      //Filtering normal youtube link
      if(input){
        var newstr = input.replace(/^[^_]*=/, "");
        return newstr;
        //return youtube_parser(input);
      }
      
     function youtube_parser(url){
          var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
          var match = url.match(regExp);
          if (match&&match[7].length==11){
              return match[7];
          }else{
              console.log("The video link doesn't work :(");
          }
      }

  };
})

.filter('url', function() {
  return function(input) {
    //http://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;  
    return input.replace(urlRegex, function(url) {  
        return '<a href="' + url + '">' + url + '</a>';  
    })  
              
  };
})

//validate html
.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
})

//convert from http to https urls
.filter('httpsify', function() {
    return function(val) {
        return val.replace(/^http:\/\//i, 'https://');
    };
})

.filter('userName', function() {
	return function(name) {
		var i;
		if (typeof name == 'string') {
		i = name.indexOf('@');
			if (i != -1) {
				return name.substr(0,i);
			} else {return name;}
		} else { return name; }
	}	
})


.filter('datetime', function($filter)
{
 return function(input)
 {
  if(input == null){ return ""; } 
 
  var _date = $filter('date')(new Date(input),
                              'hh:mm a - MMM dd, yyyy');
 
  return _date.toUpperCase();

 };
});

/*!
 * FullCalendar v2.2.2
 * Docs & License: http://arshaw.com/fullcalendar/
 * (c) 2013 Adam Shaw
 */

(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery', 'moment' ], factory);
	}
	else {
		factory(jQuery, moment);
	}
})(function($, moment) {

;;

var defaults = {

	lang: 'en',

	defaultTimedEventDuration: '02:00:00',
	defaultAllDayEventDuration: { days: 1 },
	forceEventDuration: false,
	nextDayThreshold: '09:00:00', // 9am

	// display
	defaultView: 'month',
	aspectRatio: 1.35,
	header: {
		left: 'title',
		center: '',
		right: 'today prev,next'
	},
	weekends: true,
	weekNumbers: false,

	weekNumberTitle: 'W',
	weekNumberCalculation: 'local',
	
	//editable: false,
	
	// event ajax
	lazyFetching: true,
	startParam: 'start',
	endParam: 'end',
	timezoneParam: 'timezone',

	timezone: false,

	//allDayDefault: undefined,
	
	// time formats
	titleFormat: {
		month: 'MMMM YYYY', // like "September 1986". each language will override this
		week: 'll', // like "Sep 4 1986"
		day: 'LL' // like "September 4 1986"
	},
	columnFormat: {
		month: 'ddd', // like "Sat"
		week: generateWeekColumnFormat,
		day: 'dddd' // like "Saturday"
	},
	timeFormat: { // for event elements
		'default': generateShortTimeFormat
	},

	displayEventEnd: {
		month: false,
		basicWeek: false,
		'default': true
	},
	
	// locale
	isRTL: false,
	defaultButtonText: {
		prev: "prev",
		next: "next",
		prevYear: "prev year",
		nextYear: "next year",
		today: 'today',
		month: 'month',
		week: 'week',
		day: 'day'
	},

	buttonIcons: {
		prev: 'left-single-arrow',
		next: 'right-single-arrow',
		prevYear: 'left-double-arrow',
		nextYear: 'right-double-arrow'
	},
	
	// jquery-ui theming
	theme: false,
	themeButtonIcons: {
		prev: 'circle-triangle-w',
		next: 'circle-triangle-e',
		prevYear: 'seek-prev',
		nextYear: 'seek-next'
	},

	dragOpacity: .75,
	dragRevertDuration: 500,
	dragScroll: true,
	
	//selectable: false,
	unselectAuto: true,
	
	dropAccept: '*',

	eventLimit: false,
	eventLimitText: 'more',
	eventLimitClick: 'popover',
	dayPopoverFormat: 'LL',
	
	handleWindowResize: true,
	windowResizeDelay: 200 // milliseconds before a rerender happens
	
};


function generateShortTimeFormat(options, langData) {
	return langData.longDateFormat('LT')
		.replace(':mm', '(:mm)')
		.replace(/(\Wmm)$/, '($1)') // like above, but for foreign langs
		.replace(/\s*a$/i, 't'); // convert to AM/PM/am/pm to lowercase one-letter. remove any spaces beforehand
}


function generateWeekColumnFormat(options, langData) {
	var format = langData.longDateFormat('L'); // for the format like "MM/DD/YYYY"
	format = format.replace(/^Y+[^\w\s]*|[^\w\s]*Y+$/g, ''); // strip the year off the edge, as well as other misc non-whitespace chars
	if (options.isRTL) {
		format += ' ddd'; // for RTL, add day-of-week to end
	}
	else {
		format = 'ddd ' + format; // for LTR, add day-of-week to beginning
	}
	return format;
}


var langOptionHash = {
	en: {
		columnFormat: {
			week: 'ddd M/D' // override for english. different from the generated default, which is MM/DD
		},
		dayPopoverFormat: 'dddd, MMMM D'
	}
};


// right-to-left defaults
var rtlDefaults = {
	header: {
		left: 'next,prev today',
		center: '',
		right: 'title'
	},
	buttonIcons: {
		prev: 'right-single-arrow',
		next: 'left-single-arrow',
		prevYear: 'right-double-arrow',
		nextYear: 'left-double-arrow'
	},
	themeButtonIcons: {
		prev: 'circle-triangle-e',
		next: 'circle-triangle-w',
		nextYear: 'seek-prev',
		prevYear: 'seek-next'
	}
};

;;

var fc = $.fullCalendar = { version: "2.2.2" };
var fcViews = fc.views = {};


$.fn.fullCalendar = function(options) {
	var args = Array.prototype.slice.call(arguments, 1); // for a possible method call
	var res = this; // what this function will return (this jQuery object by default)

	this.each(function(i, _element) { // loop each DOM element involved
		var element = $(_element);
		var calendar = element.data('fullCalendar'); // get the existing calendar object (if any)
		var singleRes; // the returned value of this single method call

		// a method call
		if (typeof options === 'string') {
			if (calendar && $.isFunction(calendar[options])) {
				singleRes = calendar[options].apply(calendar, args);
				if (!i) {
					res = singleRes; // record the first method call result
				}
				if (options === 'destroy') { // for the destroy method, must remove Calendar object data
					element.removeData('fullCalendar');
				}
			}
		}
		// a new calendar initialization
		else if (!calendar) { // don't initialize twice
			calendar = new Calendar(element, options);
			element.data('fullCalendar', calendar);
			calendar.render();
		}
	});
	
	return res;
};


// function for adding/overriding defaults
function setDefaults(d) {
	mergeOptions(defaults, d);
}


// Recursively combines option hash-objects.
// Better than `$.extend(true, ...)` because arrays are not traversed/copied.
//
// called like:
//     mergeOptions(target, obj1, obj2, ...)
//
function mergeOptions(target) {

	function mergeIntoTarget(name, value) {
		if ($.isPlainObject(value) && $.isPlainObject(target[name]) && !isForcedAtomicOption(name)) {
			// merge into a new object to avoid destruction
			target[name] = mergeOptions({}, target[name], value); // combine. `value` object takes precedence
		}
		else if (value !== undefined) { // only use values that are set and not undefined
			target[name] = value;
		}
	}

	for (var i=1; i<arguments.length; i++) {
		$.each(arguments[i], mergeIntoTarget);
	}

	return target;
}


// overcome sucky view-option-hash and option-merging behavior messing with options it shouldn't
function isForcedAtomicOption(name) {
	// Any option that ends in "Time" or "Duration" is probably a Duration,
	// and these will commonly be specified as plain objects, which we don't want to mess up.
	return /(Time|Duration)$/.test(name);
}
// FIX: find a different solution for view-option-hashes and have a whitelist
// for options that can be recursively merged.

;;

//var langOptionHash = {}; // initialized in defaults.js
fc.langs = langOptionHash; // expose


// Initialize jQuery UI Datepicker translations while using some of the translations
// for our own purposes. Will set this as the default language for datepicker.
// Called from a translation file.
fc.datepickerLang = function(langCode, datepickerLangCode, options) {
	var langOptions = langOptionHash[langCode];

	// initialize FullCalendar's lang hash for this language
	if (!langOptions) {
		langOptions = langOptionHash[langCode] = {};
	}

	// merge certain Datepicker options into FullCalendar's options
	mergeOptions(langOptions, {
		isRTL: options.isRTL,
		weekNumberTitle: options.weekHeader,
		titleFormat: {
			month: options.showMonthAfterYear ?
				'YYYY[' + options.yearSuffix + '] MMMM' :
				'MMMM YYYY[' + options.yearSuffix + ']'
		},
		defaultButtonText: {
			// the translations sometimes wrongly contain HTML entities
			prev: stripHtmlEntities(options.prevText),
			next: stripHtmlEntities(options.nextText),
			today: stripHtmlEntities(options.currentText)
		}
	});

	// is jQuery UI Datepicker is on the page?
	if ($.datepicker) {

		// Register the language data.
		// FullCalendar and MomentJS use language codes like "pt-br" but Datepicker
		// does it like "pt-BR" or if it doesn't have the language, maybe just "pt".
		// Make an alias so the language can be referenced either way.
		$.datepicker.regional[datepickerLangCode] =
			$.datepicker.regional[langCode] = // alias
				options;

		// Alias 'en' to the default language data. Do this every time.
		$.datepicker.regional.en = $.datepicker.regional[''];

		// Set as Datepicker's global defaults.
		$.datepicker.setDefaults(options);
	}
};


// Sets FullCalendar-specific translations. Also sets the language as the global default.
// Called from a translation file.
fc.lang = function(langCode, options) {
	var langOptions;

	if (options) {
		langOptions = langOptionHash[langCode];

		// initialize the hash for this language
		if (!langOptions) {
			langOptions = langOptionHash[langCode] = {};
		}

		mergeOptions(langOptions, options || {});
	}

	// set it as the default language for FullCalendar
	defaults.lang = langCode;
};
;;

 
function Calendar(element, instanceOptions) {
	var t = this;



	// Build options object
	// -----------------------------------------------------------------------------------
	// Precedence (lowest to highest): defaults, rtlDefaults, langOptions, instanceOptions

	instanceOptions = instanceOptions || {};

	var options = mergeOptions({}, defaults, instanceOptions);
	var langOptions;

	// determine language options
	if (options.lang in langOptionHash) {
		langOptions = langOptionHash[options.lang];
	}
	else {
		langOptions = langOptionHash[defaults.lang];
	}

	if (langOptions) { // if language options exist, rebuild...
		options = mergeOptions({}, defaults, langOptions, instanceOptions);
	}

	if (options.isRTL) { // is isRTL, rebuild...
		options = mergeOptions({}, defaults, rtlDefaults, langOptions || {}, instanceOptions);
	}


	
	// Exports
	// -----------------------------------------------------------------------------------

	t.options = options;
	t.render = render;
	t.destroy = destroy;
	t.refetchEvents = refetchEvents;
	t.reportEvents = reportEvents;
	t.reportEventChange = reportEventChange;
	t.rerenderEvents = renderEvents; // `renderEvents` serves as a rerender. an API method
	t.changeView = changeView;
	t.select = select;
	t.unselect = unselect;
	t.prev = prev;
	t.next = next;
	t.prevYear = prevYear;
	t.nextYear = nextYear;
	t.today = today;
	t.gotoDate = gotoDate;
	t.incrementDate = incrementDate;
	t.zoomTo = zoomTo;
	t.getDate = getDate;
	t.getCalendar = getCalendar;
	t.getView = getView;
	t.option = option;
	t.trigger = trigger;



	// Language-data Internals
	// -----------------------------------------------------------------------------------
	// Apply overrides to the current language's data


	// Returns moment's internal locale data. If doesn't exist, returns English.
	// Works with moment-pre-2.8
	function getLocaleData(langCode) {
		var f = moment.localeData || moment.langData;
		return f.call(moment, langCode) ||
			f.call(moment, 'en'); // the newer localData could return null, so fall back to en
	}


	var localeData = createObject(getLocaleData(options.lang)); // make a cheap copy

	if (options.monthNames) {
		localeData._months = options.monthNames;
	}
	if (options.monthNamesShort) {
		localeData._monthsShort = options.monthNamesShort;
	}
	if (options.dayNames) {
		localeData._weekdays = options.dayNames;
	}
	if (options.dayNamesShort) {
		localeData._weekdaysShort = options.dayNamesShort;
	}
	if (options.firstDay != null) {
		var _week = createObject(localeData._week); // _week: { dow: # }
		_week.dow = options.firstDay;
		localeData._week = _week;
	}



	// Calendar-specific Date Utilities
	// -----------------------------------------------------------------------------------


	t.defaultAllDayEventDuration = moment.duration(options.defaultAllDayEventDuration);
	t.defaultTimedEventDuration = moment.duration(options.defaultTimedEventDuration);


	// Builds a moment using the settings of the current calendar: timezone and language.
	// Accepts anything the vanilla moment() constructor accepts.
	t.moment = function() {
		var mom;

		if (options.timezone === 'local') {
			mom = fc.moment.apply(null, arguments);

			// Force the moment to be local, because fc.moment doesn't guarantee it.
			if (mom.hasTime()) { // don't give ambiguously-timed moments a local zone
				mom.local();
			}
		}
		else if (options.timezone === 'UTC') {
			mom = fc.moment.utc.apply(null, arguments); // process as UTC
		}
		else {
			mom = fc.moment.parseZone.apply(null, arguments); // let the input decide the zone
		}

		if ('_locale' in mom) { // moment 2.8 and above
			mom._locale = localeData;
		}
		else { // pre-moment-2.8
			mom._lang = localeData;
		}

		return mom;
	};


	// Returns a boolean about whether or not the calendar knows how to calculate
	// the timezone offset of arbitrary dates in the current timezone.
	t.getIsAmbigTimezone = function() {
		return options.timezone !== 'local' && options.timezone !== 'UTC';
	};


	// Returns a copy of the given date in the current timezone of it is ambiguously zoned.
	// This will also give the date an unambiguous time.
	t.rezoneDate = function(date) {
		return t.moment(date.toArray());
	};


	// Returns a moment for the current date, as defined by the client's computer,
	// or overridden by the `now` option.
	t.getNow = function() {
		var now = options.now;
		if (typeof now === 'function') {
			now = now();
		}
		return t.moment(now);
	};


	// Calculates the week number for a moment according to the calendar's
	// `weekNumberCalculation` setting.
	t.calculateWeekNumber = function(mom) {
		var calc = options.weekNumberCalculation;

		if (typeof calc === 'function') {
			return calc(mom);
		}
		else if (calc === 'local') {
			return mom.week();
		}
		else if (calc.toUpperCase() === 'ISO') {
			return mom.isoWeek();
		}
	};


	// Get an event's normalized end date. If not present, calculate it from the defaults.
	t.getEventEnd = function(event) {
		if (event.end) {
			return event.end.clone();
		}
		else {
			return t.getDefaultEventEnd(event.allDay, event.start);
		}
	};


	// Given an event's allDay status and start date, return swhat its fallback end date should be.
	t.getDefaultEventEnd = function(allDay, start) { // TODO: rename to computeDefaultEventEnd
		var end = start.clone();

		if (allDay) {
			end.stripTime().add(t.defaultAllDayEventDuration);
		}
		else {
			end.add(t.defaultTimedEventDuration);
		}

		if (t.getIsAmbigTimezone()) {
			end.stripZone(); // we don't know what the tzo should be
		}

		return end;
	};



	// Date-formatting Utilities
	// -----------------------------------------------------------------------------------


	// Like the vanilla formatRange, but with calendar-specific settings applied.
	t.formatRange = function(m1, m2, formatStr) {

		// a function that returns a formatStr // TODO: in future, precompute this
		if (typeof formatStr === 'function') {
			formatStr = formatStr.call(t, options, localeData);
		}

		return formatRange(m1, m2, formatStr, null, options.isRTL);
	};


	// Like the vanilla formatDate, but with calendar-specific settings applied.
	t.formatDate = function(mom, formatStr) {

		// a function that returns a formatStr // TODO: in future, precompute this
		if (typeof formatStr === 'function') {
			formatStr = formatStr.call(t, options, localeData);
		}

		return formatDate(mom, formatStr);
	};


	
	// Imports
	// -----------------------------------------------------------------------------------


	EventManager.call(t, options);
	var isFetchNeeded = t.isFetchNeeded;
	var fetchEvents = t.fetchEvents;



	// Locals
	// -----------------------------------------------------------------------------------


	var _element = element[0];
	var header;
	var headerElement;
	var content;
	var tm; // for making theme classes
	var currentView;
	var suggestedViewHeight;
	var windowResizeProxy; // wraps the windowResize function
	var ignoreWindowResize = 0;
	var date;
	var events = [];
	
	
	
	// Main Rendering
	// -----------------------------------------------------------------------------------


	if (options.defaultDate != null) {
		date = t.moment(options.defaultDate);
	}
	else {
		date = t.getNow();
	}
	
	
	function render(inc) {
		if (!content) {
			initialRender();
		}
		else if (elementVisible()) {
			// mainly for the public API
			calcSize();
			renderView(inc);
		}
	}
	
	
	function initialRender() {
		tm = options.theme ? 'ui' : 'fc';
		element.addClass('fc');

		if (options.isRTL) {
			element.addClass('fc-rtl');
		}
		else {
			element.addClass('fc-ltr');
		}

		if (options.theme) {
			element.addClass('ui-widget');
		}
		else {
			element.addClass('fc-unthemed');
		}

		content = $("<div class='fc-view-container'/>").prependTo(element);

		header = new Header(t, options);
		headerElement = header.render();
		if (headerElement) {
			element.prepend(headerElement);
		}

		changeView(options.defaultView);

		if (options.handleWindowResize) {
			windowResizeProxy = debounce(windowResize, options.windowResizeDelay); // prevents rapid calls
			$(window).resize(windowResizeProxy);
		}
	}
	
	
	function destroy() {

		if (currentView) {
			currentView.destroy();
		}

		header.destroy();
		content.remove();
		element.removeClass('fc fc-ltr fc-rtl fc-unthemed ui-widget');

		$(window).unbind('resize', windowResizeProxy);
	}
	
	
	function elementVisible() {
		return element.is(':visible');
	}
	
	

	// View Rendering
	// -----------------------------------------------------------------------------------


	function changeView(viewName) {
		renderView(0, viewName);
	}


	// Renders a view because of a date change, view-type change, or for the first time
	function renderView(delta, viewName) {
		ignoreWindowResize++;

		// if viewName is changing, destroy the old view
		if (currentView && viewName && currentView.name !== viewName) {
			header.deactivateButton(currentView.name);
			freezeContentHeight(); // prevent a scroll jump when view element is removed
			if (currentView.start) { // rendered before?
				currentView.destroy();
			}
			currentView.el.remove();
			currentView = null;
		}

		// if viewName changed, or the view was never created, create a fresh view
		if (!currentView && viewName) {
			currentView = new fcViews[viewName](t);
			currentView.el =  $("<div class='fc-view fc-" + viewName + "-view' />").appendTo(content);
			header.activateButton(viewName);
		}

		if (currentView) {

			// let the view determine what the delta means
			if (delta) {
				date = currentView.incrementDate(date, delta);
			}

			// render or rerender the view
			if (
				!currentView.start || // never rendered before
				delta || // explicit date window change
				!date.isWithin(currentView.intervalStart, currentView.intervalEnd) // implicit date window change
			) {
				if (elementVisible()) {

					freezeContentHeight();
					if (currentView.start) { // rendered before?
						currentView.destroy();
					}
					currentView.render(date);
					unfreezeContentHeight();

					// need to do this after View::render, so dates are calculated
					updateTitle();
					updateTodayButton();

					getAndRenderEvents();
				}
			}
		}

		unfreezeContentHeight(); // undo any lone freezeContentHeight calls
		ignoreWindowResize--;
	}
	
	

	// Resizing
	// -----------------------------------------------------------------------------------


	t.getSuggestedViewHeight = function() {
		if (suggestedViewHeight === undefined) {
			calcSize();
		}
		return suggestedViewHeight;
	};


	t.isHeightAuto = function() {
		return options.contentHeight === 'auto' || options.height === 'auto';
	};
	
	
	function updateSize(shouldRecalc) {
		if (elementVisible()) {

			if (shouldRecalc) {
				_calcSize();
			}

			ignoreWindowResize++;
			currentView.updateSize(true); // isResize=true. will poll getSuggestedViewHeight() and isHeightAuto()
			ignoreWindowResize--;

			return true; // signal success
		}
	}


	function calcSize() {
		if (elementVisible()) {
			_calcSize();
		}
	}
	
	
	function _calcSize() { // assumes elementVisible
		if (typeof options.contentHeight === 'number') { // exists and not 'auto'
			suggestedViewHeight = options.contentHeight;
		}
		else if (typeof options.height === 'number') { // exists and not 'auto'
			suggestedViewHeight = options.height - (headerElement ? headerElement.outerHeight(true) : 0);
		}
		else {
			suggestedViewHeight = Math.round(content.width() / Math.max(options.aspectRatio, .5));
		}
	}
	
	
	function windowResize(ev) {
		if (
			!ignoreWindowResize &&
			ev.target === window && // so we don't process jqui "resize" events that have bubbled up
			currentView.start // view has already been rendered
		) {
			if (updateSize(true)) {
				currentView.trigger('windowResize', _element);
			}
		}
	}
	
	
	
	/* Event Fetching/Rendering
	-----------------------------------------------------------------------------*/
	// TODO: going forward, most of this stuff should be directly handled by the view


	function refetchEvents() { // can be called as an API method
		destroyEvents(); // so that events are cleared before user starts waiting for AJAX
		fetchAndRenderEvents();
	}


	function renderEvents() { // destroys old events if previously rendered
		if (elementVisible()) {
			freezeContentHeight();
			currentView.destroyEvents(); // no performance cost if never rendered
			currentView.renderEvents(events);
			unfreezeContentHeight();
		}
	}


	function destroyEvents() {
		freezeContentHeight();
		currentView.destroyEvents();
		unfreezeContentHeight();
	}
	

	function getAndRenderEvents() {
		if (!options.lazyFetching || isFetchNeeded(currentView.start, currentView.end)) {
			fetchAndRenderEvents();
		}
		else {
			renderEvents();
		}
	}


	function fetchAndRenderEvents() {
		fetchEvents(currentView.start, currentView.end);
			// ... will call reportEvents
			// ... which will call renderEvents
	}

	
	// called when event data arrives
	function reportEvents(_events) {
		events = _events;
		renderEvents();
	}


	// called when a single event's data has been changed
	function reportEventChange() {
		renderEvents();
	}



	/* Header Updating
	-----------------------------------------------------------------------------*/


	function updateTitle() {
		header.updateTitle(currentView.title);
	}


	function updateTodayButton() {
		var now = t.getNow();
		if (now.isWithin(currentView.intervalStart, currentView.intervalEnd)) {
			header.disableButton('today');
		}
		else {
			header.enableButton('today');
		}
	}
	


	/* Selection
	-----------------------------------------------------------------------------*/
	

	function select(start, end) {

		start = t.moment(start);
		if (end) {
			end = t.moment(end);
		}
		else if (start.hasTime()) {
			end = start.clone().add(t.defaultTimedEventDuration);
		}
		else {
			end = start.clone().add(t.defaultAllDayEventDuration);
		}

		currentView.select(start, end);
	}
	

	function unselect() { // safe to be called before renderView
		if (currentView) {
			currentView.unselect();
		}
	}
	
	
	
	/* Date
	-----------------------------------------------------------------------------*/
	
	
	function prev() {
		renderView(-1);
	}
	
	
	function next() {
		renderView(1);
	}
	
	
	function prevYear() {
		date.add(-1, 'years');
		renderView();
	}
	
	
	function nextYear() {
		date.add(1, 'years');
		renderView();
	}
	
	
	function today() {
		date = t.getNow();
		renderView();
	}
	
	
	function gotoDate(dateInput) {
		date = t.moment(dateInput);
		renderView();
	}
	
	
	function incrementDate(delta) {
		date.add(moment.duration(delta));
		renderView();
	}


	// Forces navigation to a view for the given date.
	// `viewName` can be a specific view name or a generic one like "week" or "day".
	function zoomTo(newDate, viewName) {
		var viewStr;
		var match;

		if (!viewName || fcViews[viewName] === undefined) { // a general view name, or "auto"
			viewName = viewName || 'day';
			viewStr = header.getViewsWithButtons().join(' '); // space-separated string of all the views in the header

			// try to match a general view name, like "week", against a specific one, like "agendaWeek"
			match = viewStr.match(new RegExp('\\w+' + capitaliseFirstLetter(viewName)));

			// fall back to the day view being used in the header
			if (!match) {
				match = viewStr.match(/\w+Day/);
			}

			viewName = match ? match[0] : 'agendaDay'; // fall back to agendaDay
		}

		date = newDate;
		changeView(viewName);
	}
	
	
	function getDate() {
		return date.clone();
	}



	/* Height "Freezing"
	-----------------------------------------------------------------------------*/


	function freezeContentHeight() {
		content.css({
			width: '100%',
			height: content.height(),
			overflow: 'hidden'
		});
	}


	function unfreezeContentHeight() {
		content.css({
			width: '',
			height: '',
			overflow: ''
		});
	}
	
	
	
	/* Misc
	-----------------------------------------------------------------------------*/
	

	function getCalendar() {
		return t;
	}

	
	function getView() {
		return currentView;
	}
	
	
	function option(name, value) {
		if (value === undefined) {
			return options[name];
		}
		if (name == 'height' || name == 'contentHeight' || name == 'aspectRatio') {
			options[name] = value;
			updateSize(true); // true = allow recalculation of height
		}
	}
	
	
	function trigger(name, thisObj) {
		if (options[name]) {
			return options[name].apply(
				thisObj || _element,
				Array.prototype.slice.call(arguments, 2)
			);
		}
	}

}

;;

/* Top toolbar area with buttons and title
----------------------------------------------------------------------------------------------------------------------*/
// TODO: rename all header-related things to "toolbar"

function Header(calendar, options) {
	var t = this;
	
	// exports
	t.render = render;
	t.destroy = destroy;
	t.updateTitle = updateTitle;
	t.activateButton = activateButton;
	t.deactivateButton = deactivateButton;
	t.disableButton = disableButton;
	t.enableButton = enableButton;
	t.getViewsWithButtons = getViewsWithButtons;
	
	// locals
	var el = $();
	var viewsWithButtons = [];
	var tm;


	function render() {
		var sections = options.header;

		tm = options.theme ? 'ui' : 'fc';

		if (sections) {
			el = $("<div class='fc-toolbar'/>")
				.append(renderSection('left'))
				.append(renderSection('right'))
				.append(renderSection('center'))
				.append('<div class="fc-clear"/>');

			return el;
		}
	}
	
	
	function destroy() {
		el.remove();
	}
	
	
	function renderSection(position) {
		var sectionEl = $('<div class="fc-' + position + '"/>');
		var buttonStr = options.header[position];

		if (buttonStr) {
			$.each(buttonStr.split(' '), function(i) {
				var groupChildren = $();
				var isOnlyButtons = true;
				var groupEl;

				$.each(this.split(','), function(j, buttonName) {
					var buttonClick;
					var themeIcon;
					var normalIcon;
					var defaultText;
					var customText;
					var innerHtml;
					var classes;
					var button;

					if (buttonName == 'title') {
						groupChildren = groupChildren.add($('<h2>&nbsp;</h2>')); // we always want it to take up height
						isOnlyButtons = false;
					}
					else {
						if (calendar[buttonName]) { // a calendar method
							buttonClick = function() {
								calendar[buttonName]();
							};
						}
						else if (fcViews[buttonName]) { // a view name
							buttonClick = function() {
								calendar.changeView(buttonName);
							};
							viewsWithButtons.push(buttonName);
						}
						if (buttonClick) {

							// smartProperty allows different text per view button (ex: "Agenda Week" vs "Basic Week")
							themeIcon = smartProperty(options.themeButtonIcons, buttonName);
							normalIcon = smartProperty(options.buttonIcons, buttonName);
							defaultText = smartProperty(options.defaultButtonText, buttonName);
							customText = smartProperty(options.buttonText, buttonName);

							if (customText) {
								innerHtml = htmlEscape(customText);
							}
							else if (themeIcon && options.theme) {
								innerHtml = "<span class='ui-icon ui-icon-" + themeIcon + "'></span>";
							}
							else if (normalIcon && !options.theme) {
								innerHtml = "<span class='fc-icon fc-icon-" + normalIcon + "'></span>";
							}
							else {
								innerHtml = htmlEscape(defaultText || buttonName);
							}

							classes = [
								'fc-' + buttonName + '-button',
								tm + '-button',
								tm + '-state-default'
							];

							button = $( // type="button" so that it doesn't submit a form
								'<button type="button" class="' + classes.join(' ') + '">' +
									innerHtml +
								'</button>'
								)
								.click(function() {
									// don't process clicks for disabled buttons
									if (!button.hasClass(tm + '-state-disabled')) {

										buttonClick();

										// after the click action, if the button becomes the "active" tab, or disabled,
										// it should never have a hover class, so remove it now.
										if (
											button.hasClass(tm + '-state-active') ||
											button.hasClass(tm + '-state-disabled')
										) {
											button.removeClass(tm + '-state-hover');
										}
									}
								})
								.mousedown(function() {
									// the *down* effect (mouse pressed in).
									// only on buttons that are not the "active" tab, or disabled
									button
										.not('.' + tm + '-state-active')
										.not('.' + tm + '-state-disabled')
										.addClass(tm + '-state-down');
								})
								.mouseup(function() {
									// undo the *down* effect
									button.removeClass(tm + '-state-down');
								})
								.hover(
									function() {
										// the *hover* effect.
										// only on buttons that are not the "active" tab, or disabled
										button
											.not('.' + tm + '-state-active')
											.not('.' + tm + '-state-disabled')
											.addClass(tm + '-state-hover');
									},
									function() {
										// undo the *hover* effect
										button
											.removeClass(tm + '-state-hover')
											.removeClass(tm + '-state-down'); // if mouseleave happens before mouseup
									}
								);

							groupChildren = groupChildren.add(button);
						}
					}
				});

				if (isOnlyButtons) {
					groupChildren
						.first().addClass(tm + '-corner-left').end()
						.last().addClass(tm + '-corner-right').end();
				}

				if (groupChildren.length > 1) {
					groupEl = $('<div/>');
					if (isOnlyButtons) {
						groupEl.addClass('fc-button-group');
					}
					groupEl.append(groupChildren);
					sectionEl.append(groupEl);
				}
				else {
					sectionEl.append(groupChildren); // 1 or 0 children
				}
			});
		}

		return sectionEl;
	}
	
	
	function updateTitle(text) {
		el.find('h2').text(text);
	}
	
	
	function activateButton(buttonName) {
		el.find('.fc-' + buttonName + '-button')
			.addClass(tm + '-state-active');
	}
	
	
	function deactivateButton(buttonName) {
		el.find('.fc-' + buttonName + '-button')
			.removeClass(tm + '-state-active');
	}
	
	
	function disableButton(buttonName) {
		el.find('.fc-' + buttonName + '-button')
			.attr('disabled', 'disabled')
			.addClass(tm + '-state-disabled');
	}
	
	
	function enableButton(buttonName) {
		el.find('.fc-' + buttonName + '-button')
			.removeAttr('disabled')
			.removeClass(tm + '-state-disabled');
	}


	function getViewsWithButtons() {
		return viewsWithButtons;
	}

}

;;

fc.sourceNormalizers = [];
fc.sourceFetchers = [];

var ajaxDefaults = {
	dataType: 'json',
	cache: false
};

var eventGUID = 1;


function EventManager(options) { // assumed to be a calendar
	var t = this;
	
	
	// exports
	t.isFetchNeeded = isFetchNeeded;
	t.fetchEvents = fetchEvents;
	t.addEventSource = addEventSource;
	t.removeEventSource = removeEventSource;
	t.updateEvent = updateEvent;
	t.renderEvent = renderEvent;
	t.removeEvents = removeEvents;
	t.clientEvents = clientEvents;
	t.mutateEvent = mutateEvent;
	
	
	// imports
	var trigger = t.trigger;
	var getView = t.getView;
	var reportEvents = t.reportEvents;
	var getEventEnd = t.getEventEnd;
	
	
	// locals
	var stickySource = { events: [] };
	var sources = [ stickySource ];
	var rangeStart, rangeEnd;
	var currentFetchID = 0;
	var pendingSourceCnt = 0;
	var loadingLevel = 0;
	var cache = []; // holds events that have already been expanded


	$.each(
		(options.events ? [ options.events ] : []).concat(options.eventSources || []),
		function(i, sourceInput) {
			var source = buildEventSource(sourceInput);
			if (source) {
				sources.push(source);
			}
		}
	);
	
	
	
	/* Fetching
	-----------------------------------------------------------------------------*/
	
	
	function isFetchNeeded(start, end) {
		return !rangeStart || // nothing has been fetched yet?
			// or, a part of the new range is outside of the old range? (after normalizing)
			start.clone().stripZone() < rangeStart.clone().stripZone() ||
			end.clone().stripZone() > rangeEnd.clone().stripZone();
	}
	
	
	function fetchEvents(start, end) {
		rangeStart = start;
		rangeEnd = end;
		cache = [];
		var fetchID = ++currentFetchID;
		var len = sources.length;
		pendingSourceCnt = len;
		for (var i=0; i<len; i++) {
			fetchEventSource(sources[i], fetchID);
		}
	}
	
	
	function fetchEventSource(source, fetchID) {
		_fetchEventSource(source, function(eventInputs) {
			var isArraySource = $.isArray(source.events);
			var i, eventInput;
			var abstractEvent;

			if (fetchID == currentFetchID) {

				if (eventInputs) {
					for (i = 0; i < eventInputs.length; i++) {
						eventInput = eventInputs[i];

						if (isArraySource) { // array sources have already been convert to Event Objects
							abstractEvent = eventInput;
						}
						else {
							abstractEvent = buildEventFromInput(eventInput, source);
						}

						if (abstractEvent) { // not false (an invalid event)
							cache.push.apply(
								cache,
								expandEvent(abstractEvent) // add individual expanded events to the cache
							);
						}
					}
				}

				pendingSourceCnt--;
				if (!pendingSourceCnt) {
					reportEvents(cache);
				}
			}
		});
	}
	
	
	function _fetchEventSource(source, callback) {
		var i;
		var fetchers = fc.sourceFetchers;
		var res;

		for (i=0; i<fetchers.length; i++) {
			res = fetchers[i].call(
				t, // this, the Calendar object
				source,
				rangeStart.clone(),
				rangeEnd.clone(),
				options.timezone,
				callback
			);

			if (res === true) {
				// the fetcher is in charge. made its own async request
				return;
			}
			else if (typeof res == 'object') {
				// the fetcher returned a new source. process it
				_fetchEventSource(res, callback);
				return;
			}
		}

		var events = source.events;
		if (events) {
			if ($.isFunction(events)) {
				pushLoading();
				events.call(
					t, // this, the Calendar object
					rangeStart.clone(),
					rangeEnd.clone(),
					options.timezone,
					function(events) {
						callback(events);
						popLoading();
					}
				);
			}
			else if ($.isArray(events)) {
				callback(events);
			}
			else {
				callback();
			}
		}else{
			var url = source.url;
			if (url) {
				var success = source.success;
				var error = source.error;
				var complete = source.complete;

				// retrieve any outbound GET/POST $.ajax data from the options
				var customData;
				if ($.isFunction(source.data)) {
					// supplied as a function that returns a key/value object
					customData = source.data();
				}
				else {
					// supplied as a straight key/value object
					customData = source.data;
				}

				// use a copy of the custom data so we can modify the parameters
				// and not affect the passed-in object.
				var data = $.extend({}, customData || {});

				var startParam = firstDefined(source.startParam, options.startParam);
				var endParam = firstDefined(source.endParam, options.endParam);
				var timezoneParam = firstDefined(source.timezoneParam, options.timezoneParam);

				if (startParam) {
					data[startParam] = rangeStart.format();
				}
				if (endParam) {
					data[endParam] = rangeEnd.format();
				}
				if (options.timezone && options.timezone != 'local') {
					data[timezoneParam] = options.timezone;
				}

				pushLoading();
				$.ajax($.extend({}, ajaxDefaults, source, {
					data: data,
					success: function(events) {
						events = events || [];
						var res = applyAll(success, this, arguments);
						if ($.isArray(res)) {
							events = res;
						}
						callback(events);
					},
					error: function() {
						applyAll(error, this, arguments);
						callback();
					},
					complete: function() {
						applyAll(complete, this, arguments);
						popLoading();
					}
				}));
			}else{
				callback();
			}
		}
	}
	
	
	
	/* Sources
	-----------------------------------------------------------------------------*/
	

	function addEventSource(sourceInput) {
		var source = buildEventSource(sourceInput);
		if (source) {
			sources.push(source);
			pendingSourceCnt++;
			fetchEventSource(source, currentFetchID); // will eventually call reportEvents
		}
	}


	function buildEventSource(sourceInput) { // will return undefined if invalid source
		var normalizers = fc.sourceNormalizers;
		var source;
		var i;

		if ($.isFunction(sourceInput) || $.isArray(sourceInput)) {
			source = { events: sourceInput };
		}
		else if (typeof sourceInput === 'string') {
			source = { url: sourceInput };
		}
		else if (typeof sourceInput === 'object') {
			source = $.extend({}, sourceInput); // shallow copy
		}

		if (source) {

			// TODO: repeat code, same code for event classNames
			if (source.className) {
				if (typeof source.className === 'string') {
					source.className = source.className.split(/\s+/);
				}
				// otherwise, assumed to be an array
			}
			else {
				source.className = [];
			}

			// for array sources, we convert to standard Event Objects up front
			if ($.isArray(source.events)) {
				source.origArray = source.events; // for removeEventSource
				source.events = $.map(source.events, function(eventInput) {
					return buildEventFromInput(eventInput, source);
				});
			}

			for (i=0; i<normalizers.length; i++) {
				normalizers[i].call(t, source);
			}

			return source;
		}
	}


	function removeEventSource(source) {
		sources = $.grep(sources, function(src) {
			return !isSourcesEqual(src, source);
		});
		// remove all client events from that source
		cache = $.grep(cache, function(e) {
			return !isSourcesEqual(e.source, source);
		});
		reportEvents(cache);
	}


	function isSourcesEqual(source1, source2) {
		return source1 && source2 && getSourcePrimitive(source1) == getSourcePrimitive(source2);
	}


	function getSourcePrimitive(source) {
		return (
			(typeof source === 'object') ? // a normalized event source?
				(source.origArray || source.url || source.events) : // get the primitive
				null
		) ||
		source; // the given argument *is* the primitive
	}
	
	
	
	/* Manipulation
	-----------------------------------------------------------------------------*/


	function updateEvent(event) {

		event.start = t.moment(event.start);
		if (event.end) {
			event.end = t.moment(event.end);
		}

		mutateEvent(event);
		propagateMiscProperties(event);
		reportEvents(cache); // reports event modifications (so we can redraw)
	}


	var miscCopyableProps = [
		'title',
		'url',
		'allDay',
		'className',
		'editable',
		'color',
		'backgroundColor',
		'borderColor',
		'textColor'
	];

	function propagateMiscProperties(event) {
		var i;
		var cachedEvent;
		var j;
		var prop;

		for (i=0; i<cache.length; i++) {
			cachedEvent = cache[i];
			if (cachedEvent._id == event._id && cachedEvent !== event) {
				for (j=0; j<miscCopyableProps.length; j++) {
					prop = miscCopyableProps[j];
					if (event[prop] !== undefined) {
						cachedEvent[prop] = event[prop];
					}
				}
			}
		}
	}

	
	// returns the expanded events that were created
	function renderEvent(eventInput, stick) {
		var abstractEvent = buildEventFromInput(eventInput);
		var events;
		var i, event;

		if (abstractEvent) { // not false (a valid input)
			events = expandEvent(abstractEvent);

			for (i = 0; i < events.length; i++) {
				event = events[i];

				if (!event.source) {
					if (stick) {
						stickySource.events.push(event);
						event.source = stickySource;
					}
					cache.push(event);
				}
			}

			reportEvents(cache);

			return events;
		}

		return [];
	}
	
	
	function removeEvents(filter) {
		var eventID;
		var i;

		if (filter == null) { // null or undefined. remove all events
			filter = function() { return true; }; // will always match
		}
		else if (!$.isFunction(filter)) { // an event ID
			eventID = filter + '';
			filter = function(event) {
				return event._id == eventID;
			};
		}

		// Purge event(s) from our local cache
		cache = $.grep(cache, filter, true); // inverse=true

		// Remove events from array sources.
		// This works because they have been converted to official Event Objects up front.
		// (and as a result, event._id has been calculated).
		for (i=0; i<sources.length; i++) {
			if ($.isArray(sources[i].events)) {
				sources[i].events = $.grep(sources[i].events, filter, true);
			}
		}

		reportEvents(cache);
	}
	
	
	function clientEvents(filter) {
		if ($.isFunction(filter)) {
			return $.grep(cache, filter);
		}
		else if (filter != null) { // not null, not undefined. an event ID
			filter += '';
			return $.grep(cache, function(e) {
				return e._id == filter;
			});
		}
		return cache; // else, return all
	}
	
	
	
	/* Loading State
	-----------------------------------------------------------------------------*/
	
	
	function pushLoading() {
		if (!(loadingLevel++)) {
			trigger('loading', null, true, getView());
		}
	}
	
	
	function popLoading() {
		if (!(--loadingLevel)) {
			trigger('loading', null, false, getView());
		}
	}
	
	
	
	/* Event Normalization
	-----------------------------------------------------------------------------*/


	// Given a raw object with key/value properties, returns an "abstract" Event object.
	// An "abstract" event is an event that, if recurring, will not have been expanded yet.
	// Will return `false` when input is invalid.
	// `source` is optional
	function buildEventFromInput(input, source) {
		var out = {};
		var start, end;
		var allDay;
		var allDayDefault;

		if (options.eventDataTransform) {
			input = options.eventDataTransform(input);
		}
		if (source && source.eventDataTransform) {
			input = source.eventDataTransform(input);
		}

		// Copy all properties over to the resulting object.
		// The special-case properties will be copied over afterwards.
		$.extend(out, input);

		if (source) {
			out.source = source;
		}

		out._id = input._id || (input.id === undefined ? '_fc' + eventGUID++ : input.id + '');

		if (input.className) {
			if (typeof input.className == 'string') {
				out.className = input.className.split(/\s+/);
			}
			else { // assumed to be an array
				out.className = input.className;
			}
		}
		else {
			out.className = [];
		}

		start = input.start || input.date; // "date" is an alias for "start"
		end = input.end;

		// parse as a time (Duration) if applicable
		if (isTimeString(start)) {
			start = moment.duration(start);
		}
		if (isTimeString(end)) {
			end = moment.duration(end);
		}

		if (input.dow || moment.isDuration(start) || moment.isDuration(end)) {

			// the event is "abstract" (recurring) so don't calculate exact start/end dates just yet
			out.start = start ? moment.duration(start) : null; // will be a Duration or null
			out.end = end ? moment.duration(end) : null; // will be a Duration or null
			out._recurring = true; // our internal marker
		}
		else {

			if (start) {
				start = t.moment(start);
				if (!start.isValid()) {
					return false;
				}
			}

			if (end) {
				end = t.moment(end);
				if (!end.isValid()) {
					return false;
				}
			}

			allDay = input.allDay;
			if (allDay === undefined) {
				allDayDefault = firstDefined(
					source ? source.allDayDefault : undefined,
					options.allDayDefault
				);
				if (allDayDefault !== undefined) {
					// use the default
					allDay = allDayDefault;
				}
				else {
					// if a single date has a time, the event should not be all-day
					allDay = !start.hasTime() && (!end || !end.hasTime());
				}
			}

			assignDatesToEvent(start, end, allDay, out);
		}

		return out;
	}


	// Normalizes and assigns the given dates to the given partially-formed event object.
	// Requires an explicit `allDay` boolean parameter.
	// NOTE: mutates the given start/end moments. does not make an internal copy
	function assignDatesToEvent(start, end, allDay, event) {

		// normalize the date based on allDay
		if (allDay) {
			// neither date should have a time
			if (start.hasTime()) {
				start.stripTime();
			}
			if (end && end.hasTime()) {
				end.stripTime();
			}
		}
		else {
			// force a time/zone up the dates
			if (!start.hasTime()) {
				start = t.rezoneDate(start);
			}
			if (end && !end.hasTime()) {
				end = t.rezoneDate(end);
			}
		}

		event.allDay = allDay;
		event.start = start;
		event.end = end || null; // ensure null if falsy

		if (options.forceEventDuration && !event.end) {
			event.end = getEventEnd(event);
		}

		backupEventDates(event);
	}


	// If the given event is a recurring event, break it down into an array of individual instances.
	// If not a recurring event, return an array with the single original event.
	// If given a falsy input (probably because of a failed buildEventFromInput call), returns an empty array.
	function expandEvent(abstractEvent) {
		var events = [];
		var view;
		var _rangeStart = rangeStart;
		var _rangeEnd = rangeEnd;
		var dowHash;
		var dow;
		var i;
		var date;
		var startTime, endTime;
		var start, end;
		var event;

		// hack for when fetchEvents hasn't been called yet (calculating businessHours for example)
		if (!_rangeStart || !_rangeEnd) {
			view = t.getView();
			_rangeStart = view.start;
			_rangeEnd = view.end;
		}

		if (abstractEvent) {
			if (abstractEvent._recurring) {

				// make a boolean hash as to whether the event occurs on each day-of-week
				if ((dow = abstractEvent.dow)) {
					dowHash = {};
					for (i = 0; i < dow.length; i++) {
						dowHash[dow[i]] = true;
					}
				}

				// iterate through every day in the current range
				date = _rangeStart.clone().stripTime(); // holds the date of the current day
				while (date.isBefore(_rangeEnd)) {

					if (!dowHash || dowHash[date.day()]) { // if everyday, or this particular day-of-week

						startTime = abstractEvent.start; // the stored start and end properties are times (Durations)
						endTime = abstractEvent.end; // "
						start = date.clone();
						end = null;

						if (startTime) {
							start = start.time(startTime);
						}
						if (endTime) {
							end = date.clone().time(endTime);
						}

						event = $.extend({}, abstractEvent); // make a copy of the original
						assignDatesToEvent(
							start, end,
							!startTime && !endTime, // allDay?
							event
						);
						events.push(event);
					}

					date.add(1, 'days');
				}
			}
			else {
				events.push(abstractEvent); // return the original event. will be a one-item array
			}
		}

		return events;
	}



	/* Event Modification Math
	-----------------------------------------------------------------------------------------*/


	// Modify the date(s) of an event and make this change propagate to all other events with
	// the same ID (related repeating events).
	//
	// If `newStart`/`newEnd` are not specified, the "new" dates are assumed to be `event.start` and `event.end`.
	// The "old" dates to be compare against are always `event._start` and `event._end` (set by EventManager).
	//
	// Returns an object with delta information and a function to undo all operations.
	//
	function mutateEvent(event, newStart, newEnd) {
		var oldAllDay = event._allDay;
		var oldStart = event._start;
		var oldEnd = event._end;
		var clearEnd = false;
		var newAllDay;
		var dateDelta;
		var durationDelta;
		var undoFunc;

		// if no new dates were passed in, compare against the event's existing dates
		if (!newStart && !newEnd) {
			newStart = event.start;
			newEnd = event.end;
		}

		// NOTE: throughout this function, the initial values of `newStart` and `newEnd` are
		// preserved. These values may be undefined.

		// detect new allDay
		if (event.allDay != oldAllDay) { // if value has changed, use it
			newAllDay = event.allDay;
		}
		else { // otherwise, see if any of the new dates are allDay
			newAllDay = !(newStart || newEnd).hasTime();
		}

		// normalize the new dates based on allDay
		if (newAllDay) {
			if (newStart) {
				newStart = newStart.clone().stripTime();
			}
			if (newEnd) {
				newEnd = newEnd.clone().stripTime();
			}
		}

		// compute dateDelta
		if (newStart) {
			if (newAllDay) {
				dateDelta = dayishDiff(newStart, oldStart.clone().stripTime()); // treat oldStart as allDay
			}
			else {
				dateDelta = dayishDiff(newStart, oldStart);
			}
		}

		if (newAllDay != oldAllDay) {
			// if allDay has changed, always throw away the end
			clearEnd = true;
		}
		else if (newEnd) {
			durationDelta = dayishDiff(
				// new duration
				newEnd || t.getDefaultEventEnd(newAllDay, newStart || oldStart),
				newStart || oldStart
			).subtract(dayishDiff(
				// subtract old duration
				oldEnd || t.getDefaultEventEnd(oldAllDay, oldStart),
				oldStart
			));
		}

		undoFunc = mutateEvents(
			clientEvents(event._id), // get events with this ID
			clearEnd,
			newAllDay,
			dateDelta,
			durationDelta
		);

		return {
			dateDelta: dateDelta,
			durationDelta: durationDelta,
			undo: undoFunc
		};
	}


	// Modifies an array of events in the following ways (operations are in order):
	// - clear the event's `end`
	// - convert the event to allDay
	// - add `dateDelta` to the start and end
	// - add `durationDelta` to the event's duration
	//
	// Returns a function that can be called to undo all the operations.
	//
	function mutateEvents(events, clearEnd, forceAllDay, dateDelta, durationDelta) {
		var isAmbigTimezone = t.getIsAmbigTimezone();
		var undoFunctions = [];

		$.each(events, function(i, event) {
			var oldAllDay = event._allDay;
			var oldStart = event._start;
			var oldEnd = event._end;
			var newAllDay = forceAllDay != null ? forceAllDay : oldAllDay;
			var newStart = oldStart.clone();
			var newEnd = (!clearEnd && oldEnd) ? oldEnd.clone() : null;

			// NOTE: this function is responsible for transforming `newStart` and `newEnd`,
			// which were initialized to the OLD values first. `newEnd` may be null.

			// normlize newStart/newEnd to be consistent with newAllDay
			if (newAllDay) {
				newStart.stripTime();
				if (newEnd) {
					newEnd.stripTime();
				}
			}
			else {
				if (!newStart.hasTime()) {
					newStart = t.rezoneDate(newStart);
				}
				if (newEnd && !newEnd.hasTime()) {
					newEnd = t.rezoneDate(newEnd);
				}
			}

			// ensure we have an end date if necessary
			if (!newEnd && (options.forceEventDuration || +durationDelta)) {
				newEnd = t.getDefaultEventEnd(newAllDay, newStart);
			}

			// translate the dates
			newStart.add(dateDelta);
			if (newEnd) {
				newEnd.add(dateDelta).add(durationDelta);
			}

			// if the dates have changed, and we know it is impossible to recompute the
			// timezone offsets, strip the zone.
			if (isAmbigTimezone) {
				if (+dateDelta || +durationDelta) {
					newStart.stripZone();
					if (newEnd) {
						newEnd.stripZone();
					}
				}
			}

			event.allDay = newAllDay;
			event.start = newStart;
			event.end = newEnd;
			backupEventDates(event);

			undoFunctions.push(function() {
				event.allDay = oldAllDay;
				event.start = oldStart;
				event.end = oldEnd;
				backupEventDates(event);
			});
		});

		return function() {
			for (var i=0; i<undoFunctions.length; i++) {
				undoFunctions[i]();
			}
		};
	}


	/* Business Hours
	-----------------------------------------------------------------------------------------*/

	t.getBusinessHoursEvents = getBusinessHoursEvents;


	// Returns an array of events as to when the business hours occur in the current view.
	// Abuse of our event system :(
	function getBusinessHoursEvents() {
		var optionVal = options.businessHours;
		var defaultVal = {
			className: 'fc-nonbusiness',
			start: '09:00',
			end: '17:00',
			dow: [ 1, 2, 3, 4, 5 ], // monday - friday
			rendering: 'inverse-background'
		};
		var eventInput;

		if (optionVal) {
			if (typeof optionVal === 'object') {
				// option value is an object that can override the default business hours
				eventInput = $.extend({}, defaultVal, optionVal);
			}
			else {
				// option value is `true`. use default business hours
				eventInput = defaultVal;
			}
		}

		if (eventInput) {
			return expandEvent(buildEventFromInput(eventInput));
		}

		return [];
	}


	/* Overlapping / Constraining
	-----------------------------------------------------------------------------------------*/

	t.isEventAllowedInRange = isEventAllowedInRange;
	t.isSelectionAllowedInRange = isSelectionAllowedInRange;
	t.isExternalDragAllowedInRange = isExternalDragAllowedInRange;


	function isEventAllowedInRange(event, start, end) {
		var source = event.source || {};
		var constraint = firstDefined(
			event.constraint,
			source.constraint,
			options.eventConstraint
		);
		var overlap = firstDefined(
			event.overlap,
			source.overlap,
			options.eventOverlap
		);

		return isRangeAllowed(start, end, constraint, overlap, event);
	}


	function isSelectionAllowedInRange(start, end) {
		return isRangeAllowed(
			start,
			end,
			options.selectConstraint,
			options.selectOverlap
		);
	}


	function isExternalDragAllowedInRange(start, end, eventInput) { // eventInput is optional associated event data
		var event;

		if (eventInput) {
			event = expandEvent(buildEventFromInput(eventInput))[0];
			if (event) {
				return isEventAllowedInRange(event, start, end);
			}
		}

		return isSelectionAllowedInRange(start, end); // treat it as a selection
	}


	// Returns true if the given range (caused by an event drop/resize or a selection) is allowed to exist
	// according to the constraint/overlap settings.
	// `event` is not required if checking a selection.
	function isRangeAllowed(start, end, constraint, overlap, event) {
		var constraintEvents;
		var anyContainment;
		var i, otherEvent;
		var otherOverlap;

		// normalize. fyi, we're normalizing in too many places :(
		start = start.clone().stripZone();
		end = end.clone().stripZone();

		// the range must be fully contained by at least one of produced constraint events
		if (constraint != null) {
			constraintEvents = constraintToEvents(constraint);
			anyContainment = false;

			for (i = 0; i < constraintEvents.length; i++) {
				if (eventContainsRange(constraintEvents[i], start, end)) {
					anyContainment = true;
					break;
				}
			}

			if (!anyContainment) {
				return false;
			}
		}

		for (i = 0; i < cache.length; i++) { // loop all events and detect overlap
			otherEvent = cache[i];

			// don't compare the event to itself or other related [repeating] events
			if (event && event._id === otherEvent._id) {
				continue;
			}

			// there needs to be an actual intersection before disallowing anything
			if (eventIntersectsRange(otherEvent, start, end)) {

				// evaluate overlap for the given range and short-circuit if necessary
				if (overlap === false) {
					return false;
				}
				else if (typeof overlap === 'function' && !overlap(otherEvent, event)) {
					return false;
				}

				// if we are computing if the given range is allowable for an event, consider the other event's
				// EventObject-specific or Source-specific `overlap` property
				if (event) {
					otherOverlap = firstDefined(
						otherEvent.overlap,
						(otherEvent.source || {}).overlap
						// we already considered the global `eventOverlap`
					);
					if (otherOverlap === false) {
						return false;
					}
					if (typeof otherOverlap === 'function' && !otherOverlap(event, otherEvent)) {
						return false;
					}
				}
			}
		}

		return true;
	}


	// Given an event input from the API, produces an array of event objects. Possible event inputs:
	// 'businessHours'
	// An event ID (number or string)
	// An object with specific start/end dates or a recurring event (like what businessHours accepts)
	function constraintToEvents(constraintInput) {

		if (constraintInput === 'businessHours') {
			return getBusinessHoursEvents();
		}

		if (typeof constraintInput === 'object') {
			return expandEvent(buildEventFromInput(constraintInput));
		}

		return clientEvents(constraintInput); // probably an ID
	}


	// Is the event's date ranged fully contained by the given range?
	// start/end already assumed to have stripped zones :(
	function eventContainsRange(event, start, end) {
		var eventStart = event.start.clone().stripZone();
		var eventEnd = t.getEventEnd(event).stripZone();

		return start >= eventStart && end <= eventEnd;
	}


	// Does the event's date range intersect with the given range?
	// start/end already assumed to have stripped zones :(
	function eventIntersectsRange(event, start, end) {
		var eventStart = event.start.clone().stripZone();
		var eventEnd = t.getEventEnd(event).stripZone();

		return start < eventEnd && end > eventStart;
	}

}


// updates the "backup" properties, which are preserved in order to compute diffs later on.
function backupEventDates(event) {
	event._allDay = event.allDay;
	event._start = event.start.clone();
	event._end = event.end ? event.end.clone() : null;
}

;;

/* FullCalendar-specific DOM Utilities
----------------------------------------------------------------------------------------------------------------------*/


// Given the scrollbar widths of some other container, create borders/margins on rowEls in order to match the left
// and right space that was offset by the scrollbars. A 1-pixel border first, then margin beyond that.
function compensateScroll(rowEls, scrollbarWidths) {
	if (scrollbarWidths.left) {
		rowEls.css({
			'border-left-width': 1,
			'margin-left': scrollbarWidths.left - 1
		});
	}
	if (scrollbarWidths.right) {
		rowEls.css({
			'border-right-width': 1,
			'margin-right': scrollbarWidths.right - 1
		});
	}
}


// Undoes compensateScroll and restores all borders/margins
function uncompensateScroll(rowEls) {
	rowEls.css({
		'margin-left': '',
		'margin-right': '',
		'border-left-width': '',
		'border-right-width': ''
	});
}


// Make the mouse cursor express that an event is not allowed in the current area
function disableCursor() {
	$('body').addClass('fc-not-allowed');
}


// Returns the mouse cursor to its original look
function enableCursor() {
	$('body').removeClass('fc-not-allowed');
}


// Given a total available height to fill, have `els` (essentially child rows) expand to accomodate.
// By default, all elements that are shorter than the recommended height are expanded uniformly, not considering
// any other els that are already too tall. if `shouldRedistribute` is on, it considers these tall rows and 
// reduces the available height.
function distributeHeight(els, availableHeight, shouldRedistribute) {

	// *FLOORING NOTE*: we floor in certain places because zoom can give inaccurate floating-point dimensions,
	// and it is better to be shorter than taller, to avoid creating unnecessary scrollbars.

	var minOffset1 = Math.floor(availableHeight / els.length); // for non-last element
	var minOffset2 = Math.floor(availableHeight - minOffset1 * (els.length - 1)); // for last element *FLOORING NOTE*
	var flexEls = []; // elements that are allowed to expand. array of DOM nodes
	var flexOffsets = []; // amount of vertical space it takes up
	var flexHeights = []; // actual css height
	var usedHeight = 0;

	undistributeHeight(els); // give all elements their natural height

	// find elements that are below the recommended height (expandable).
	// important to query for heights in a single first pass (to avoid reflow oscillation).
	els.each(function(i, el) {
		var minOffset = i === els.length - 1 ? minOffset2 : minOffset1;
		var naturalOffset = $(el).outerHeight(true);

		if (naturalOffset < minOffset) {
			flexEls.push(el);
			flexOffsets.push(naturalOffset);
			flexHeights.push($(el).height());
		}
		else {
			// this element stretches past recommended height (non-expandable). mark the space as occupied.
			usedHeight += naturalOffset;
		}
	});

	// readjust the recommended height to only consider the height available to non-maxed-out rows.
	if (shouldRedistribute) {
		availableHeight -= usedHeight;
		minOffset1 = Math.floor(availableHeight / flexEls.length);
		minOffset2 = Math.floor(availableHeight - minOffset1 * (flexEls.length - 1)); // *FLOORING NOTE*
	}

	// assign heights to all expandable elements
	$(flexEls).each(function(i, el) {
		var minOffset = i === flexEls.length - 1 ? minOffset2 : minOffset1;
		var naturalOffset = flexOffsets[i];
		var naturalHeight = flexHeights[i];
		var newHeight = minOffset - (naturalOffset - naturalHeight); // subtract the margin/padding

		if (naturalOffset < minOffset) { // we check this again because redistribution might have changed things
			$(el).height(newHeight);
		}
	});
}


// Undoes distrubuteHeight, restoring all els to their natural height
function undistributeHeight(els) {
	els.height('');
}


// Given `els`, a jQuery set of <td> cells, find the cell with the largest natural width and set the widths of all the
// cells to be that width.
// PREREQUISITE: if you want a cell to take up width, it needs to have a single inner element w/ display:inline
function matchCellWidths(els) {
	var maxInnerWidth = 0;

	els.find('> *').each(function(i, innerEl) {
		var innerWidth = $(innerEl).outerWidth();
		if (innerWidth > maxInnerWidth) {
			maxInnerWidth = innerWidth;
		}
	});

	maxInnerWidth++; // sometimes not accurate of width the text needs to stay on one line. insurance

	els.width(maxInnerWidth);

	return maxInnerWidth;
}


// Turns a container element into a scroller if its contents is taller than the allotted height.
// Returns true if the element is now a scroller, false otherwise.
// NOTE: this method is best because it takes weird zooming dimensions into account
function setPotentialScroller(containerEl, height) {
	containerEl.height(height).addClass('fc-scroller');

	// are scrollbars needed?
	if (containerEl[0].scrollHeight - 1 > containerEl[0].clientHeight) { // !!! -1 because IE is often off-by-one :(
		return true;
	}

	unsetScroller(containerEl); // undo
	return false;
}


// Takes an element that might have been a scroller, and turns it back into a normal element.
function unsetScroller(containerEl) {
	containerEl.height('').removeClass('fc-scroller');
}


/* General DOM Utilities
----------------------------------------------------------------------------------------------------------------------*/


// borrowed from https://github.com/jquery/jquery-ui/blob/1.11.0/ui/core.js#L51
function getScrollParent(el) {
	var position = el.css('position'),
		scrollParent = el.parents().filter(function() {
			var parent = $(this);
			return (/(auto|scroll)/).test(
				parent.css('overflow') + parent.css('overflow-y') + parent.css('overflow-x')
			);
		}).eq(0);

	return position === 'fixed' || !scrollParent.length ? $(el[0].ownerDocument || document) : scrollParent;
}


// Given a container element, return an object with the pixel values of the left/right scrollbars.
// Left scrollbars might occur on RTL browsers (IE maybe?) but I have not tested.
// PREREQUISITE: container element must have a single child with display:block
function getScrollbarWidths(container) {
	var containerLeft = container.offset().left;
	var containerRight = containerLeft + container.width();
	var inner = container.children();
	var innerLeft = inner.offset().left;
	var innerRight = innerLeft + inner.outerWidth();

	return {
		left: innerLeft - containerLeft,
		right: containerRight - innerRight
	};
}


// Returns a boolean whether this was a left mouse click and no ctrl key (which means right click on Mac)
function isPrimaryMouseButton(ev) {
	return ev.which == 1 && !ev.ctrlKey;
}


/* FullCalendar-specific Misc Utilities
----------------------------------------------------------------------------------------------------------------------*/


// Creates a basic segment with the intersection of the two ranges. Returns undefined if no intersection.
// Expects all dates to be normalized to the same timezone beforehand.
function intersectionToSeg(subjectStart, subjectEnd, intervalStart, intervalEnd) {
	var segStart, segEnd;
	var isStart, isEnd;

	if (subjectEnd > intervalStart && subjectStart < intervalEnd) { // in bounds at all?

		if (subjectStart >= intervalStart) {
			segStart = subjectStart.clone();
			isStart = true;
		}
		else {
			segStart = intervalStart.clone();
			isStart =  false;
		}

		if (subjectEnd <= intervalEnd) {
			segEnd = subjectEnd.clone();
			isEnd = true;
		}
		else {
			segEnd = intervalEnd.clone();
			isEnd = false;
		}

		return {
			start: segStart,
			end: segEnd,
			isStart: isStart,
			isEnd: isEnd
		};
	}
}


function smartProperty(obj, name) { // get a camel-cased/namespaced property of an object
	obj = obj || {};
	if (obj[name] !== undefined) {
		return obj[name];
	}
	var parts = name.split(/(?=[A-Z])/),
		i = parts.length - 1, res;
	for (; i>=0; i--) {
		res = obj[parts[i].toLowerCase()];
		if (res !== undefined) {
			return res;
		}
	}
	return obj['default'];
}


/* Date Utilities
----------------------------------------------------------------------------------------------------------------------*/

var dayIDs = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];


// Diffs the two moments into a Duration where full-days are recorded first, then the remaining time.
// Moments will have their timezones normalized.
function dayishDiff(a, b) {
	return moment.duration({
		days: a.clone().stripTime().diff(b.clone().stripTime(), 'days'),
		ms: a.time() - b.time()
	});
}


function isNativeDate(input) {
	return  Object.prototype.toString.call(input) === '[object Date]' || input instanceof Date;
}


function dateCompare(a, b) { // works with Moments and native Dates
	return a - b;
}


// Returns a boolean about whether the given input is a time string, like "06:40:00" or "06:00"
function isTimeString(str) {
	return /^\d+\:\d+(?:\:\d+\.?(?:\d{3})?)?$/.test(str);
}


/* General Utilities
----------------------------------------------------------------------------------------------------------------------*/

fc.applyAll = applyAll; // export


// Create an object that has the given prototype. Just like Object.create
function createObject(proto) {
	var f = function() {};
	f.prototype = proto;
	return new f();
}


function applyAll(functions, thisObj, args) {
	if ($.isFunction(functions)) {
		functions = [ functions ];
	}
	if (functions) {
		var i;
		var ret;
		for (i=0; i<functions.length; i++) {
			ret = functions[i].apply(thisObj, args) || ret;
		}
		return ret;
	}
}


function firstDefined() {
	for (var i=0; i<arguments.length; i++) {
		if (arguments[i] !== undefined) {
			return arguments[i];
		}
	}
}


function htmlEscape(s) {
	return (s + '').replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/'/g, '&#039;')
		.replace(/"/g, '&quot;')
		.replace(/\n/g, '<br />');
}


function stripHtmlEntities(text) {
	return text.replace(/&.*?;/g, '');
}


function capitaliseFirstLetter(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}


// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds.
// https://github.com/jashkenas/underscore/blob/1.6.0/underscore.js#L714
function debounce(func, wait) {
	var timeoutId;
	var args;
	var context;
	var timestamp; // of most recent call
	var later = function() {
		var last = +new Date() - timestamp;
		if (last < wait && last > 0) {
			timeoutId = setTimeout(later, wait - last);
		}
		else {
			timeoutId = null;
			func.apply(context, args);
			if (!timeoutId) {
				context = args = null;
			}
		}
	};

	return function() {
		context = this;
		args = arguments;
		timestamp = +new Date();
		if (!timeoutId) {
			timeoutId = setTimeout(later, wait);
		}
	};
}

;;

var ambigDateOfMonthRegex = /^\s*\d{4}-\d\d$/;
var ambigTimeOrZoneRegex =
	/^\s*\d{4}-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?)?$/;
var newMomentProto = moment.fn; // where we will attach our new methods
var oldMomentProto = $.extend({}, newMomentProto); // copy of original moment methods
var allowValueOptimization;
var setUTCValues; // function defined below
var setLocalValues; // function defined below


// Creating
// -------------------------------------------------------------------------------------------------

// Creates a new moment, similar to the vanilla moment(...) constructor, but with
// extra features (ambiguous time, enhanced formatting). When given an existing moment,
// it will function as a clone (and retain the zone of the moment). Anything else will
// result in a moment in the local zone.
fc.moment = function() {
	return makeMoment(arguments);
};

// Sames as fc.moment, but forces the resulting moment to be in the UTC timezone.
fc.moment.utc = function() {
	var mom = makeMoment(arguments, true);

	// Force it into UTC because makeMoment doesn't guarantee it
	// (if given a pre-existing moment for example)
	if (mom.hasTime()) { // don't give ambiguously-timed moments a UTC zone
		mom.utc();
	}

	return mom;
};

// Same as fc.moment, but when given an ISO8601 string, the timezone offset is preserved.
// ISO8601 strings with no timezone offset will become ambiguously zoned.
fc.moment.parseZone = function() {
	return makeMoment(arguments, true, true);
};

// Builds an enhanced moment from args. When given an existing moment, it clones. When given a
// native Date, or called with no arguments (the current time), the resulting moment will be local.
// Anything else needs to be "parsed" (a string or an array), and will be affected by:
//    parseAsUTC - if there is no zone information, should we parse the input in UTC?
//    parseZone - if there is zone information, should we force the zone of the moment?
function makeMoment(args, parseAsUTC, parseZone) {
	var input = args[0];
	var isSingleString = args.length == 1 && typeof input === 'string';
	var isAmbigTime;
	var isAmbigZone;
	var ambigMatch;
	var mom;

	if (moment.isMoment(input)) {
		mom = moment.apply(null, args); // clone it
		transferAmbigs(input, mom); // the ambig flags weren't transfered with the clone
	}
	else if (isNativeDate(input) || input === undefined) {
		mom = moment.apply(null, args); // will be local
	}
	else { // "parsing" is required
		isAmbigTime = false;
		isAmbigZone = false;

		if (isSingleString) {
			if (ambigDateOfMonthRegex.test(input)) {
				// accept strings like '2014-05', but convert to the first of the month
				input += '-01';
				args = [ input ]; // for when we pass it on to moment's constructor
				isAmbigTime = true;
				isAmbigZone = true;
			}
			else if ((ambigMatch = ambigTimeOrZoneRegex.exec(input))) {
				isAmbigTime = !ambigMatch[5]; // no time part?
				isAmbigZone = true;
			}
		}
		else if ($.isArray(input)) {
			// arrays have no timezone information, so assume ambiguous zone
			isAmbigZone = true;
		}
		// otherwise, probably a string with a format

		if (parseAsUTC) {
			mom = moment.utc.apply(moment, args);
		}
		else {
			mom = moment.apply(null, args);
		}

		if (isAmbigTime) {
			mom._ambigTime = true;
			mom._ambigZone = true; // ambiguous time always means ambiguous zone
		}
		else if (parseZone) { // let's record the inputted zone somehow
			if (isAmbigZone) {
				mom._ambigZone = true;
			}
			else if (isSingleString) {
				mom.zone(input); // if not a valid zone, will assign UTC
			}
		}
	}

	mom._fullCalendar = true; // flag for extended functionality

	return mom;
}


// A clone method that works with the flags related to our enhanced functionality.
// In the future, use moment.momentProperties
newMomentProto.clone = function() {
	var mom = oldMomentProto.clone.apply(this, arguments);

	// these flags weren't transfered with the clone
	transferAmbigs(this, mom);
	if (this._fullCalendar) {
		mom._fullCalendar = true;
	}

	return mom;
};


// Time-of-day
// -------------------------------------------------------------------------------------------------

// GETTER
// Returns a Duration with the hours/minutes/seconds/ms values of the moment.
// If the moment has an ambiguous time, a duration of 00:00 will be returned.
//
// SETTER
// You can supply a Duration, a Moment, or a Duration-like argument.
// When setting the time, and the moment has an ambiguous time, it then becomes unambiguous.
newMomentProto.time = function(time) {

	// Fallback to the original method (if there is one) if this moment wasn't created via FullCalendar.
	// `time` is a generic enough method name where this precaution is necessary to avoid collisions w/ other plugins.
	if (!this._fullCalendar) {
		return oldMomentProto.time.apply(this, arguments);
	}

	if (time == null) { // getter
		return moment.duration({
			hours: this.hours(),
			minutes: this.minutes(),
			seconds: this.seconds(),
			milliseconds: this.milliseconds()
		});
	}
	else { // setter

		this._ambigTime = false; // mark that the moment now has a time

		if (!moment.isDuration(time) && !moment.isMoment(time)) {
			time = moment.duration(time);
		}

		// The day value should cause overflow (so 24 hours becomes 00:00:00 of next day).
		// Only for Duration times, not Moment times.
		var dayHours = 0;
		if (moment.isDuration(time)) {
			dayHours = Math.floor(time.asDays()) * 24;
		}

		// We need to set the individual fields.
		// Can't use startOf('day') then add duration. In case of DST at start of day.
		return this.hours(dayHours + time.hours())
			.minutes(time.minutes())
			.seconds(time.seconds())
			.milliseconds(time.milliseconds());
	}
};

// Converts the moment to UTC, stripping out its time-of-day and timezone offset,
// but preserving its YMD. A moment with a stripped time will display no time
// nor timezone offset when .format() is called.
newMomentProto.stripTime = function() {
	var a = this.toArray(); // year,month,date,hours,minutes,seconds as an array

	this.utc(); // set the internal UTC flag (will clear the ambig flags)
	setUTCValues(this, a.slice(0, 3)); // set the year/month/date. time will be zero

	// Mark the time as ambiguous. This needs to happen after the .utc() call, which calls .zone(),
	// which clears all ambig flags. Same with setUTCValues with moment-timezone.
	this._ambigTime = true;
	this._ambigZone = true; // if ambiguous time, also ambiguous timezone offset

	return this; // for chaining
};

// Returns if the moment has a non-ambiguous time (boolean)
newMomentProto.hasTime = function() {
	return !this._ambigTime;
};


// Timezone
// -------------------------------------------------------------------------------------------------

// Converts the moment to UTC, stripping out its timezone offset, but preserving its
// YMD and time-of-day. A moment with a stripped timezone offset will display no
// timezone offset when .format() is called.
newMomentProto.stripZone = function() {
	var a = this.toArray(); // year,month,date,hours,minutes,seconds as an array
	var wasAmbigTime = this._ambigTime;

	this.utc(); // set the internal UTC flag (will clear the ambig flags)
	setUTCValues(this, a); // will set the year/month/date/hours/minutes/seconds/ms

	if (wasAmbigTime) {
		// the above call to .utc()/.zone() unfortunately clears the ambig flags, so reassign
		this._ambigTime = true;
	}

	// Mark the zone as ambiguous. This needs to happen after the .utc() call, which calls .zone(),
	// which clears all ambig flags. Same with setUTCValues with moment-timezone.
	this._ambigZone = true;

	return this; // for chaining
};

// Returns of the moment has a non-ambiguous timezone offset (boolean)
newMomentProto.hasZone = function() {
	return !this._ambigZone;
};

// this method implicitly marks a zone (will get called upon .utc() and .local())
newMomentProto.zone = function(tzo) {

	if (tzo != null) { // setter
		// these assignments needs to happen before the original zone method is called.
		// I forget why, something to do with a browser crash.
		this._ambigTime = false;
		this._ambigZone = false;
	}

	return oldMomentProto.zone.apply(this, arguments);
};

// this method implicitly marks a zone
newMomentProto.local = function() {
	var a = this.toArray(); // year,month,date,hours,minutes,seconds,ms as an array
	var wasAmbigZone = this._ambigZone;

	oldMomentProto.local.apply(this, arguments); // will clear ambig flags

	if (wasAmbigZone) {
		// If the moment was ambiguously zoned, the date fields were stored as UTC.
		// We want to preserve these, but in local time.
		setLocalValues(this, a);
	}

	return this; // for chaining
};


// Formatting
// -------------------------------------------------------------------------------------------------

newMomentProto.format = function() {
	if (this._fullCalendar && arguments[0]) { // an enhanced moment? and a format string provided?
		return formatDate(this, arguments[0]); // our extended formatting
	}
	if (this._ambigTime) {
		return oldMomentFormat(this, 'YYYY-MM-DD');
	}
	if (this._ambigZone) {
		return oldMomentFormat(this, 'YYYY-MM-DD[T]HH:mm:ss');
	}
	return oldMomentProto.format.apply(this, arguments);
};

newMomentProto.toISOString = function() {
	if (this._ambigTime) {
		return oldMomentFormat(this, 'YYYY-MM-DD');
	}
	if (this._ambigZone) {
		return oldMomentFormat(this, 'YYYY-MM-DD[T]HH:mm:ss');
	}
	return oldMomentProto.toISOString.apply(this, arguments);
};


// Querying
// -------------------------------------------------------------------------------------------------

// Is the moment within the specified range? `end` is exclusive.
// FYI, this method is not a standard Moment method, so always do our enhanced logic.
newMomentProto.isWithin = function(start, end) {
	var a = commonlyAmbiguate([ this, start, end ]);
	return a[0] >= a[1] && a[0] < a[2];
};

// When isSame is called with units, timezone ambiguity is normalized before the comparison happens.
// If no units specified, the two moments must be identically the same, with matching ambig flags.
newMomentProto.isSame = function(input, units) {
	var a;

	// only do custom logic if this is an enhanced moment
	if (!this._fullCalendar) {
		return oldMomentProto.isSame.apply(this, arguments);
	}

	if (units) {
		a = commonlyAmbiguate([ this, input ], true); // normalize timezones but don't erase times
		return oldMomentProto.isSame.call(a[0], a[1], units);
	}
	else {
		input = fc.moment.parseZone(input); // normalize input
		return oldMomentProto.isSame.call(this, input) &&
			Boolean(this._ambigTime) === Boolean(input._ambigTime) &&
			Boolean(this._ambigZone) === Boolean(input._ambigZone);
	}
};

// Make these query methods work with ambiguous moments
$.each([
	'isBefore',
	'isAfter'
], function(i, methodName) {
	newMomentProto[methodName] = function(input, units) {
		var a;

		// only do custom logic if this is an enhanced moment
		if (!this._fullCalendar) {
			return oldMomentProto[methodName].apply(this, arguments);
		}

		a = commonlyAmbiguate([ this, input ]);
		return oldMomentProto[methodName].call(a[0], a[1], units);
	};
});


// Misc Internals
// -------------------------------------------------------------------------------------------------

// given an array of moment-like inputs, return a parallel array w/ moments similarly ambiguated.
// for example, of one moment has ambig time, but not others, all moments will have their time stripped.
// set `preserveTime` to `true` to keep times, but only normalize zone ambiguity.
function commonlyAmbiguate(inputs, preserveTime) {
	var outputs = [];
	var anyAmbigTime = false;
	var anyAmbigZone = false;
	var i;

	for (i=0; i<inputs.length; i++) {
		outputs.push(fc.moment.parseZone(inputs[i]));
		anyAmbigTime = anyAmbigTime || outputs[i]._ambigTime;
		anyAmbigZone = anyAmbigZone || outputs[i]._ambigZone;
	}

	for (i=0; i<outputs.length; i++) {
		if (anyAmbigTime && !preserveTime) {
			outputs[i].stripTime();
		}
		else if (anyAmbigZone) {
			outputs[i].stripZone();
		}
	}

	return outputs;
}

// Transfers all the flags related to ambiguous time/zone from the `src` moment to the `dest` moment
function transferAmbigs(src, dest) {
	if (src._ambigTime) {
		dest._ambigTime = true;
	}
	else if (dest._ambigTime) {
		dest._ambigTime = false;
	}

	if (src._ambigZone) {
		dest._ambigZone = true;
	}
	else if (dest._ambigZone) {
		dest._ambigZone = false;
	}
}


// Sets the year/month/date/etc values of the moment from the given array.
// Inefficient because it calls each individual setter.
function setMomentValues(mom, a) {
	mom.year(a[0] || 0)
		.month(a[1] || 0)
		.date(a[2] || 0)
		.hours(a[3] || 0)
		.minutes(a[4] || 0)
		.seconds(a[5] || 0)
		.milliseconds(a[6] || 0);
}

// Can we set the moment's internal date directly?
allowValueOptimization = '_d' in moment() && 'updateOffset' in moment;

// Utility function. Accepts a moment and an array of the UTC year/month/date/etc values to set.
// Assumes the given moment is already in UTC mode.
setUTCValues = allowValueOptimization ? function(mom, a) {
	// simlate what moment's accessors do
	mom._d.setTime(Date.UTC.apply(Date, a));
	moment.updateOffset(mom, false); // keepTime=false
} : setMomentValues;

// Utility function. Accepts a moment and an array of the local year/month/date/etc values to set.
// Assumes the given moment is already in local mode.
setLocalValues = allowValueOptimization ? function(mom, a) {
	// simlate what moment's accessors do
	mom._d.setTime(+new Date( // FYI, there is now way to apply an array of args to a constructor
		a[0] || 0,
		a[1] || 0,
		a[2] || 0,
		a[3] || 0,
		a[4] || 0,
		a[5] || 0,
		a[6] || 0
	));
	moment.updateOffset(mom, false); // keepTime=false
} : setMomentValues;

;;

// Single Date Formatting
// -------------------------------------------------------------------------------------------------


// call this if you want Moment's original format method to be used
function oldMomentFormat(mom, formatStr) {
	return oldMomentProto.format.call(mom, formatStr); // oldMomentProto defined in moment-ext.js
}


// Formats `date` with a Moment formatting string, but allow our non-zero areas and
// additional token.
function formatDate(date, formatStr) {
	return formatDateWithChunks(date, getFormatStringChunks(formatStr));
}


function formatDateWithChunks(date, chunks) {
	var s = '';
	var i;

	for (i=0; i<chunks.length; i++) {
		s += formatDateWithChunk(date, chunks[i]);
	}

	return s;
}


// addition formatting tokens we want recognized
var tokenOverrides = {
	t: function(date) { // "a" or "p"
		return oldMomentFormat(date, 'a').charAt(0);
	},
	T: function(date) { // "A" or "P"
		return oldMomentFormat(date, 'A').charAt(0);
	}
};


function formatDateWithChunk(date, chunk) {
	var token;
	var maybeStr;

	if (typeof chunk === 'string') { // a literal string
		return chunk;
	}
	else if ((token = chunk.token)) { // a token, like "YYYY"
		if (tokenOverrides[token]) {
			return tokenOverrides[token](date); // use our custom token
		}
		return oldMomentFormat(date, token);
	}
	else if (chunk.maybe) { // a grouping of other chunks that must be non-zero
		maybeStr = formatDateWithChunks(date, chunk.maybe);
		if (maybeStr.match(/[1-9]/)) {
			return maybeStr;
		}
	}

	return '';
}


// Date Range Formatting
// -------------------------------------------------------------------------------------------------
// TODO: make it work with timezone offset

// Using a formatting string meant for a single date, generate a range string, like
// "Sep 2 - 9 2013", that intelligently inserts a separator where the dates differ.
// If the dates are the same as far as the format string is concerned, just return a single
// rendering of one date, without any separator.
function formatRange(date1, date2, formatStr, separator, isRTL) {
	var localeData;

	date1 = fc.moment.parseZone(date1);
	date2 = fc.moment.parseZone(date2);

	localeData = (date1.localeData || date1.lang).call(date1); // works with moment-pre-2.8

	// Expand localized format strings, like "LL" -> "MMMM D YYYY"
	formatStr = localeData.longDateFormat(formatStr) || formatStr;
	// BTW, this is not important for `formatDate` because it is impossible to put custom tokens
	// or non-zero areas in Moment's localized format strings.

	separator = separator || ' - ';

	return formatRangeWithChunks(
		date1,
		date2,
		getFormatStringChunks(formatStr),
		separator,
		isRTL
	);
}
fc.formatRange = formatRange; // expose


function formatRangeWithChunks(date1, date2, chunks, separator, isRTL) {
	var chunkStr; // the rendering of the chunk
	var leftI;
	var leftStr = '';
	var rightI;
	var rightStr = '';
	var middleI;
	var middleStr1 = '';
	var middleStr2 = '';
	var middleStr = '';

	// Start at the leftmost side of the formatting string and continue until you hit a token
	// that is not the same between dates.
	for (leftI=0; leftI<chunks.length; leftI++) {
		chunkStr = formatSimilarChunk(date1, date2, chunks[leftI]);
		if (chunkStr === false) {
			break;
		}
		leftStr += chunkStr;
	}

	// Similarly, start at the rightmost side of the formatting string and move left
	for (rightI=chunks.length-1; rightI>leftI; rightI--) {
		chunkStr = formatSimilarChunk(date1, date2, chunks[rightI]);
		if (chunkStr === false) {
			break;
		}
		rightStr = chunkStr + rightStr;
	}

	// The area in the middle is different for both of the dates.
	// Collect them distinctly so we can jam them together later.
	for (middleI=leftI; middleI<=rightI; middleI++) {
		middleStr1 += formatDateWithChunk(date1, chunks[middleI]);
		middleStr2 += formatDateWithChunk(date2, chunks[middleI]);
	}

	if (middleStr1 || middleStr2) {
		if (isRTL) {
			middleStr = middleStr2 + separator + middleStr1;
		}
		else {
			middleStr = middleStr1 + separator + middleStr2;
		}
	}

	return leftStr + middleStr + rightStr;
}


var similarUnitMap = {
	Y: 'year',
	M: 'month',
	D: 'day', // day of month
	d: 'day', // day of week
	// prevents a separator between anything time-related...
	A: 'second', // AM/PM
	a: 'second', // am/pm
	T: 'second', // A/P
	t: 'second', // a/p
	H: 'second', // hour (24)
	h: 'second', // hour (12)
	m: 'second', // minute
	s: 'second' // second
};
// TODO: week maybe?


// Given a formatting chunk, and given that both dates are similar in the regard the
// formatting chunk is concerned, format date1 against `chunk`. Otherwise, return `false`.
function formatSimilarChunk(date1, date2, chunk) {
	var token;
	var unit;

	if (typeof chunk === 'string') { // a literal string
		return chunk;
	}
	else if ((token = chunk.token)) {
		unit = similarUnitMap[token.charAt(0)];
		// are the dates the same for this unit of measurement?
		if (unit && date1.isSame(date2, unit)) {
			return oldMomentFormat(date1, token); // would be the same if we used `date2`
			// BTW, don't support custom tokens
		}
	}

	return false; // the chunk is NOT the same for the two dates
	// BTW, don't support splitting on non-zero areas
}


// Chunking Utils
// -------------------------------------------------------------------------------------------------


var formatStringChunkCache = {};


function getFormatStringChunks(formatStr) {
	if (formatStr in formatStringChunkCache) {
		return formatStringChunkCache[formatStr];
	}
	return (formatStringChunkCache[formatStr] = chunkFormatString(formatStr));
}


// Break the formatting string into an array of chunks
function chunkFormatString(formatStr) {
	var chunks = [];
	var chunker = /\[([^\]]*)\]|\(([^\)]*)\)|(LT|(\w)\4*o?)|([^\w\[\(]+)/g; // TODO: more descrimination
	var match;

	while ((match = chunker.exec(formatStr))) {
		if (match[1]) { // a literal string inside [ ... ]
			chunks.push(match[1]);
		}
		else if (match[2]) { // non-zero formatting inside ( ... )
			chunks.push({ maybe: chunkFormatString(match[2]) });
		}
		else if (match[3]) { // a formatting token
			chunks.push({ token: match[3] });
		}
		else if (match[5]) { // an unenclosed literal string
			chunks.push(match[5]);
		}
	}

	return chunks;
}

;;

/* A rectangular panel that is absolutely positioned over other content
------------------------------------------------------------------------------------------------------------------------
Options:
	- className (string)
	- content (HTML string or jQuery element set)
	- parentEl
	- top
	- left
	- right (the x coord of where the right edge should be. not a "CSS" right)
	- autoHide (boolean)
	- show (callback)
	- hide (callback)
*/

function Popover(options) {
	this.options = options || {};
}


Popover.prototype = {

	isHidden: true,
	options: null,
	el: null, // the container element for the popover. generated by this object
	documentMousedownProxy: null, // document mousedown handler bound to `this`
	margin: 10, // the space required between the popover and the edges of the scroll container


	// Shows the popover on the specified position. Renders it if not already
	show: function() {
		if (this.isHidden) {
			if (!this.el) {
				this.render();
			}
			this.el.show();
			this.position();
			this.isHidden = false;
			this.trigger('show');
		}
	},


	// Hides the popover, through CSS, but does not remove it from the DOM
	hide: function() {
		if (!this.isHidden) {
			this.el.hide();
			this.isHidden = true;
			this.trigger('hide');
		}
	},


	// Creates `this.el` and renders content inside of it
	render: function() {
		var _this = this;
		var options = this.options;

		this.el = $('<div class="fc-popover"/>')
			.addClass(options.className || '')
			.css({
				// position initially to the top left to avoid creating scrollbars
				top: 0,
				left: 0
			})
			.append(options.content)
			.appendTo(options.parentEl);

		// when a click happens on anything inside with a 'fc-close' className, hide the popover
		this.el.on('click', '.fc-close', function() {
			_this.hide();
		});

		if (options.autoHide) {
			$(document).on('mousedown', this.documentMousedownProxy = $.proxy(this, 'documentMousedown'));
		}
	},


	// Triggered when the user clicks *anywhere* in the document, for the autoHide feature
	documentMousedown: function(ev) {
		// only hide the popover if the click happened outside the popover
		if (this.el && !$(ev.target).closest(this.el).length) {
			this.hide();
		}
	},


	// Hides and unregisters any handlers
	destroy: function() {
		this.hide();

		if (this.el) {
			this.el.remove();
			this.el = null;
		}

		$(document).off('mousedown', this.documentMousedownProxy);
	},


	// Positions the popover optimally, using the top/left/right options
	position: function() {
		var options = this.options;
		var origin = this.el.offsetParent().offset();
		var width = this.el.outerWidth();
		var height = this.el.outerHeight();
		var windowEl = $(window);
		var viewportEl = getScrollParent(this.el);
		var viewportTop;
		var viewportLeft;
		var viewportOffset;
		var top; // the "position" (not "offset") values for the popover
		var left; //

		// compute top and left
		top = options.top || 0;
		if (options.left !== undefined) {
			left = options.left;
		}
		else if (options.right !== undefined) {
			left = options.right - width; // derive the left value from the right value
		}
		else {
			left = 0;
		}

		if (viewportEl.is(window) || viewportEl.is(document)) { // normalize getScrollParent's result
			viewportEl = windowEl;
			viewportTop = 0; // the window is always at the top left
			viewportLeft = 0; // (and .offset() won't work if called here)
		}
		else {
			viewportOffset = viewportEl.offset();
			viewportTop = viewportOffset.top;
			viewportLeft = viewportOffset.left;
		}

		// if the window is scrolled, it causes the visible area to be further down
		viewportTop += windowEl.scrollTop();
		viewportLeft += windowEl.scrollLeft();

		// constrain to the view port. if constrained by two edges, give precedence to top/left
		if (options.viewportConstrain !== false) {
			top = Math.min(top, viewportTop + viewportEl.outerHeight() - height - this.margin);
			top = Math.max(top, viewportTop + this.margin);
			left = Math.min(left, viewportLeft + viewportEl.outerWidth() - width - this.margin);
			left = Math.max(left, viewportLeft + this.margin);
		}

		this.el.css({
			top: top - origin.top,
			left: left - origin.left
		});
	},


	// Triggers a callback. Calls a function in the option hash of the same name.
	// Arguments beyond the first `name` are forwarded on.
	// TODO: better code reuse for this. Repeat code
	trigger: function(name) {
		if (this.options[name]) {
			this.options[name].apply(this, Array.prototype.slice.call(arguments, 1));
		}
	}

};

;;

/* A "coordinate map" converts pixel coordinates into an associated cell, which has an associated date
------------------------------------------------------------------------------------------------------------------------
Common interface:

	CoordMap.prototype = {
		build: function() {},
		getCell: function(x, y) {}
	};

*/

/* Coordinate map for a grid component
----------------------------------------------------------------------------------------------------------------------*/

function GridCoordMap(grid) {
	this.grid = grid;
}


GridCoordMap.prototype = {

	grid: null, // reference to the Grid
	rows: null, // the top-to-bottom y coordinates. including the bottom of the last item
	cols: null, // the left-to-right x coordinates. including the right of the last item

	containerEl: null, // container element that all coordinates are constrained to. optionally assigned
	minX: null,
	maxX: null, // exclusive
	minY: null,
	maxY: null, // exclusive


	// Queries the grid for the coordinates of all the cells
	build: function() {
		this.grid.buildCoords(
			this.rows = [],
			this.cols = []
		);
		this.computeBounds();
	},


	// Given a coordinate of the document, gets the associated cell. If no cell is underneath, returns null
	getCell: function(x, y) {
		var cell = null;
		var rows = this.rows;
		var cols = this.cols;
		var r = -1;
		var c = -1;
		var i;

		if (this.inBounds(x, y)) {

			for (i = 0; i < rows.length; i++) {
				if (y >= rows[i][0] && y < rows[i][1]) {
					r = i;
					break;
				}
			}

			for (i = 0; i < cols.length; i++) {
				if (x >= cols[i][0] && x < cols[i][1]) {
					c = i;
					break;
				}
			}

			if (r >= 0 && c >= 0) {
				cell = { row: r, col: c };
				cell.grid = this.grid;
				cell.date = this.grid.getCellDate(cell);
			}
		}

		return cell;
	},


	// If there is a containerEl, compute the bounds into min/max values
	computeBounds: function() {
		var containerOffset;

		if (this.containerEl) {
			containerOffset = this.containerEl.offset();
			this.minX = containerOffset.left;
			this.maxX = containerOffset.left + this.containerEl.outerWidth();
			this.minY = containerOffset.top;
			this.maxY = containerOffset.top + this.containerEl.outerHeight();
		}
	},


	// Determines if the given coordinates are in bounds. If no `containerEl`, always true
	inBounds: function(x, y) {
		if (this.containerEl) {
			return x >= this.minX && x < this.maxX && y >= this.minY && y < this.maxY;
		}
		return true;
	}

};


/* Coordinate map that is a combination of multiple other coordinate maps
----------------------------------------------------------------------------------------------------------------------*/

function ComboCoordMap(coordMaps) {
	this.coordMaps = coordMaps;
}


ComboCoordMap.prototype = {

	coordMaps: null, // an array of CoordMaps


	// Builds all coordMaps
	build: function() {
		var coordMaps = this.coordMaps;
		var i;

		for (i = 0; i < coordMaps.length; i++) {
			coordMaps[i].build();
		}
	},


	// Queries all coordMaps for the cell underneath the given coordinates, returning the first result
	getCell: function(x, y) {
		var coordMaps = this.coordMaps;
		var cell = null;
		var i;

		for (i = 0; i < coordMaps.length && !cell; i++) {
			cell = coordMaps[i].getCell(x, y);
		}

		return cell;
	}

};

;;

/* Tracks mouse movements over a CoordMap and raises events about which cell the mouse is over.
----------------------------------------------------------------------------------------------------------------------*/
// TODO: very useful to have a handler that gets called upon cellOut OR when dragging stops (for cleanup)

function DragListener(coordMap, options) {
	this.coordMap = coordMap;
	this.options = options || {};
}


DragListener.prototype = {

	coordMap: null,
	options: null,

	isListening: false,
	isDragging: false,

	// the cell/date the mouse was over when listening started
	origCell: null,
	origDate: null,

	// the cell/date the mouse is over
	cell: null,
	date: null,

	// coordinates of the initial mousedown
	mouseX0: null,
	mouseY0: null,

	// handler attached to the document, bound to the DragListener's `this`
	mousemoveProxy: null,
	mouseupProxy: null,

	scrollEl: null,
	scrollBounds: null, // { top, bottom, left, right }
	scrollTopVel: null, // pixels per second
	scrollLeftVel: null, // pixels per second
	scrollIntervalId: null, // ID of setTimeout for scrolling animation loop
	scrollHandlerProxy: null, // this-scoped function for handling when scrollEl is scrolled

	scrollSensitivity: 30, // pixels from edge for scrolling to start
	scrollSpeed: 200, // pixels per second, at maximum speed
	scrollIntervalMs: 50, // millisecond wait between scroll increment


	// Call this when the user does a mousedown. Will probably lead to startListening
	mousedown: function(ev) {
		if (isPrimaryMouseButton(ev)) {

			ev.preventDefault(); // prevents native selection in most browsers

			this.startListening(ev);

			// start the drag immediately if there is no minimum distance for a drag start
			if (!this.options.distance) {
				this.startDrag(ev);
			}
		}
	},


	// Call this to start tracking mouse movements
	startListening: function(ev) {
		var scrollParent;
		var cell;

		if (!this.isListening) {

			// grab scroll container and attach handler
			if (ev && this.options.scroll) {
				scrollParent = getScrollParent($(ev.target));
				if (!scrollParent.is(window) && !scrollParent.is(document)) {
					this.scrollEl = scrollParent;

					// scope to `this`, and use `debounce` to make sure rapid calls don't happen
					this.scrollHandlerProxy = debounce($.proxy(this, 'scrollHandler'), 100);
					this.scrollEl.on('scroll', this.scrollHandlerProxy);
				}
			}

			this.computeCoords(); // relies on `scrollEl`

			// get info on the initial cell, date, and coordinates
			if (ev) {
				cell = this.getCell(ev);
				this.origCell = cell;
				this.origDate = cell ? cell.date : null;

				this.mouseX0 = ev.pageX;
				this.mouseY0 = ev.pageY;
			}

			$(document)
				.on('mousemove', this.mousemoveProxy = $.proxy(this, 'mousemove'))
				.on('mouseup', this.mouseupProxy = $.proxy(this, 'mouseup'))
				.on('selectstart', this.preventDefault); // prevents native selection in IE<=8

			this.isListening = true;
			this.trigger('listenStart', ev);
		}
	},


	// Recomputes the drag-critical positions of elements
	computeCoords: function() {
		this.coordMap.build();
		this.computeScrollBounds();
	},


	// Called when the user moves the mouse
	mousemove: function(ev) {
		var minDistance;
		var distanceSq; // current distance from mouseX0/mouseY0, squared

		if (!this.isDragging) { // if not already dragging...
			// then start the drag if the minimum distance criteria is met
			minDistance = this.options.distance || 1;
			distanceSq = Math.pow(ev.pageX - this.mouseX0, 2) + Math.pow(ev.pageY - this.mouseY0, 2);
			if (distanceSq >= minDistance * minDistance) { // use pythagorean theorem
				this.startDrag(ev);
			}
		}

		if (this.isDragging) {
			this.drag(ev); // report a drag, even if this mousemove initiated the drag
		}
	},


	// Call this to initiate a legitimate drag.
	// This function is called internally from this class, but can also be called explicitly from outside
	startDrag: function(ev) {
		var cell;

		if (!this.isListening) { // startDrag must have manually initiated
			this.startListening();
		}

		if (!this.isDragging) {
			this.isDragging = true;
			this.trigger('dragStart', ev);

			// report the initial cell the mouse is over
			cell = this.getCell(ev);
			if (cell) {
				this.cellOver(cell, true);
			}
		}
	},


	// Called while the mouse is being moved and when we know a legitimate drag is taking place
	drag: function(ev) {
		var cell;

		if (this.isDragging) {
			cell = this.getCell(ev);

			if (!isCellsEqual(cell, this.cell)) { // a different cell than before?
				if (this.cell) {
					this.cellOut();
				}
				if (cell) {
					this.cellOver(cell);
				}
			}

			this.dragScroll(ev); // will possibly cause scrolling
		}
	},


	// Called when a the mouse has just moved over a new cell
	cellOver: function(cell) {
		this.cell = cell;
		this.date = cell.date;
		this.trigger('cellOver', cell, cell.date);
	},


	// Called when the mouse has just moved out of a cell
	cellOut: function() {
		if (this.cell) {
			this.trigger('cellOut', this.cell);
			this.cell = null;
			this.date = null;
		}
	},


	// Called when the user does a mouseup
	mouseup: function(ev) {
		this.stopDrag(ev);
		this.stopListening(ev);
	},


	// Called when the drag is over. Will not cause listening to stop however.
	// A concluding 'cellOut' event will NOT be triggered.
	stopDrag: function(ev) {
		if (this.isDragging) {
			this.stopScrolling();
			this.trigger('dragStop', ev);
			this.isDragging = false;
		}
	},


	// Call this to stop listening to the user's mouse events
	stopListening: function(ev) {
		if (this.isListening) {

			// remove the scroll handler if there is a scrollEl
			if (this.scrollEl) {
				this.scrollEl.off('scroll', this.scrollHandlerProxy);
				this.scrollHandlerProxy = null;
			}

			$(document)
				.off('mousemove', this.mousemoveProxy)
				.off('mouseup', this.mouseupProxy)
				.off('selectstart', this.preventDefault);

			this.mousemoveProxy = null;
			this.mouseupProxy = null;

			this.isListening = false;
			this.trigger('listenStop', ev);

			this.origCell = this.cell = null;
			this.origDate = this.date = null;
		}
	},


	// Gets the cell underneath the coordinates for the given mouse event
	getCell: function(ev) {
		return this.coordMap.getCell(ev.pageX, ev.pageY);
	},


	// Triggers a callback. Calls a function in the option hash of the same name.
	// Arguments beyond the first `name` are forwarded on.
	trigger: function(name) {
		if (this.options[name]) {
			this.options[name].apply(this, Array.prototype.slice.call(arguments, 1));
		}
	},


	// Stops a given mouse event from doing it's native browser action. In our case, text selection.
	preventDefault: function(ev) {
		ev.preventDefault();
	},


	/* Scrolling
	------------------------------------------------------------------------------------------------------------------*/


	// Computes and stores the bounding rectangle of scrollEl
	computeScrollBounds: function() {
		var el = this.scrollEl;
		var offset;

		if (el) {
			offset = el.offset();
			this.scrollBounds = {
				top: offset.top,
				left: offset.left,
				bottom: offset.top + el.outerHeight(),
				right: offset.left + el.outerWidth()
			};
		}
	},


	// Called when the dragging is in progress and scrolling should be updated
	dragScroll: function(ev) {
		var sensitivity = this.scrollSensitivity;
		var bounds = this.scrollBounds;
		var topCloseness, bottomCloseness;
		var leftCloseness, rightCloseness;
		var topVel = 0;
		var leftVel = 0;

		if (bounds) { // only scroll if scrollEl exists

			// compute closeness to edges. valid range is from 0.0 - 1.0
			topCloseness = (sensitivity - (ev.pageY - bounds.top)) / sensitivity;
			bottomCloseness = (sensitivity - (bounds.bottom - ev.pageY)) / sensitivity;
			leftCloseness = (sensitivity - (ev.pageX - bounds.left)) / sensitivity;
			rightCloseness = (sensitivity - (bounds.right - ev.pageX)) / sensitivity;

			// translate vertical closeness into velocity.
			// mouse must be completely in bounds for velocity to happen.
			if (topCloseness >= 0 && topCloseness <= 1) {
				topVel = topCloseness * this.scrollSpeed * -1; // negative. for scrolling up
			}
			else if (bottomCloseness >= 0 && bottomCloseness <= 1) {
				topVel = bottomCloseness * this.scrollSpeed;
			}

			// translate horizontal closeness into velocity
			if (leftCloseness >= 0 && leftCloseness <= 1) {
				leftVel = leftCloseness * this.scrollSpeed * -1; // negative. for scrolling left
			}
			else if (rightCloseness >= 0 && rightCloseness <= 1) {
				leftVel = rightCloseness * this.scrollSpeed;
			}
		}

		this.setScrollVel(topVel, leftVel);
	},


	// Sets the speed-of-scrolling for the scrollEl
	setScrollVel: function(topVel, leftVel) {

		this.scrollTopVel = topVel;
		this.scrollLeftVel = leftVel;

		this.constrainScrollVel(); // massages into realistic values

		// if there is non-zero velocity, and an animation loop hasn't already started, then START
		if ((this.scrollTopVel || this.scrollLeftVel) && !this.scrollIntervalId) {
			this.scrollIntervalId = setInterval(
				$.proxy(this, 'scrollIntervalFunc'), // scope to `this`
				this.scrollIntervalMs
			);
		}
	},


	// Forces scrollTopVel and scrollLeftVel to be zero if scrolling has already gone all the way
	constrainScrollVel: function() {
		var el = this.scrollEl;

		if (this.scrollTopVel < 0) { // scrolling up?
			if (el.scrollTop() <= 0) { // already scrolled all the way up?
				this.scrollTopVel = 0;
			}
		}
		else if (this.scrollTopVel > 0) { // scrolling down?
			if (el.scrollTop() + el[0].clientHeight >= el[0].scrollHeight) { // already scrolled all the way down?
				this.scrollTopVel = 0;
			}
		}

		if (this.scrollLeftVel < 0) { // scrolling left?
			if (el.scrollLeft() <= 0) { // already scrolled all the left?
				this.scrollLeftVel = 0;
			}
		}
		else if (this.scrollLeftVel > 0) { // scrolling right?
			if (el.scrollLeft() + el[0].clientWidth >= el[0].scrollWidth) { // already scrolled all the way right?
				this.scrollLeftVel = 0;
			}
		}
	},


	// This function gets called during every iteration of the scrolling animation loop
	scrollIntervalFunc: function() {
		var el = this.scrollEl;
		var frac = this.scrollIntervalMs / 1000; // considering animation frequency, what the vel should be mult'd by

		// change the value of scrollEl's scroll
		if (this.scrollTopVel) {
			el.scrollTop(el.scrollTop() + this.scrollTopVel * frac);
		}
		if (this.scrollLeftVel) {
			el.scrollLeft(el.scrollLeft() + this.scrollLeftVel * frac);
		}

		this.constrainScrollVel(); // since the scroll values changed, recompute the velocities

		// if scrolled all the way, which causes the vels to be zero, stop the animation loop
		if (!this.scrollTopVel && !this.scrollLeftVel) {
			this.stopScrolling();
		}
	},


	// Kills any existing scrolling animation loop
	stopScrolling: function() {
		if (this.scrollIntervalId) {
			clearInterval(this.scrollIntervalId);
			this.scrollIntervalId = null;

			// when all done with scrolling, recompute positions since they probably changed
			this.computeCoords();
		}
	},


	// Get called when the scrollEl is scrolled (NOTE: this is delayed via debounce)
	scrollHandler: function() {
		// recompute all coordinates, but *only* if this is *not* part of our scrolling animation
		if (!this.scrollIntervalId) {
			this.computeCoords();
		}
	}

};


// Returns `true` if the cells are identically equal. `false` otherwise.
// They must have the same row, col, and be from the same grid.
// Two null values will be considered equal, as two "out of the grid" states are the same.
function isCellsEqual(cell1, cell2) {

	if (!cell1 && !cell2) {
		return true;
	}

	if (cell1 && cell2) {
		return cell1.grid === cell2.grid &&
			cell1.row === cell2.row &&
			cell1.col === cell2.col;
	}

	return false;
}

;;

/* Creates a clone of an element and lets it track the mouse as it moves
----------------------------------------------------------------------------------------------------------------------*/

function MouseFollower(sourceEl, options) {
	this.options = options = options || {};
	this.sourceEl = sourceEl;
	this.parentEl = options.parentEl ? $(options.parentEl) : sourceEl.parent(); // default to sourceEl's parent
}


MouseFollower.prototype = {

	options: null,

	sourceEl: null, // the element that will be cloned and made to look like it is dragging
	el: null, // the clone of `sourceEl` that will track the mouse
	parentEl: null, // the element that `el` (the clone) will be attached to

	// the initial position of el, relative to the offset parent. made to match the initial offset of sourceEl
	top0: null,
	left0: null,

	// the initial position of the mouse
	mouseY0: null,
	mouseX0: null,

	// the number of pixels the mouse has moved from its initial position
	topDelta: null,
	leftDelta: null,

	mousemoveProxy: null, // document mousemove handler, bound to the MouseFollower's `this`

	isFollowing: false,
	isHidden: false,
	isAnimating: false, // doing the revert animation?


	// Causes the element to start following the mouse
	start: function(ev) {
		if (!this.isFollowing) {
			this.isFollowing = true;

			this.mouseY0 = ev.pageY;
			this.mouseX0 = ev.pageX;
			this.topDelta = 0;
			this.leftDelta = 0;

			if (!this.isHidden) {
				this.updatePosition();
			}

			$(document).on('mousemove', this.mousemoveProxy = $.proxy(this, 'mousemove'));
		}
	},


	// Causes the element to stop following the mouse. If shouldRevert is true, will animate back to original position.
	// `callback` gets invoked when the animation is complete. If no animation, it is invoked immediately.
	stop: function(shouldRevert, callback) {
		var _this = this;
		var revertDuration = this.options.revertDuration;

		function complete() {
			this.isAnimating = false;
			_this.destroyEl();

			this.top0 = this.left0 = null; // reset state for future updatePosition calls

			if (callback) {
				callback();
			}
		}

		if (this.isFollowing && !this.isAnimating) { // disallow more than one stop animation at a time
			this.isFollowing = false;

			$(document).off('mousemove', this.mousemoveProxy);

			if (shouldRevert && revertDuration && !this.isHidden) { // do a revert animation?
				this.isAnimating = true;
				this.el.animate({
					top: this.top0,
					left: this.left0
				}, {
					duration: revertDuration,
					complete: complete
				});
			}
			else {
				complete();
			}
		}
	},


	// Gets the tracking element. Create it if necessary
	getEl: function() {
		var el = this.el;

		if (!el) {
			this.sourceEl.width(); // hack to force IE8 to compute correct bounding box
			el = this.el = this.sourceEl.clone()
				.css({
					position: 'absolute',
					visibility: '', // in case original element was hidden (commonly through hideEvents())
					display: this.isHidden ? 'none' : '', // for when initially hidden
					margin: 0,
					right: 'auto', // erase and set width instead
					bottom: 'auto', // erase and set height instead
					width: this.sourceEl.width(), // explicit height in case there was a 'right' value
					height: this.sourceEl.height(), // explicit width in case there was a 'bottom' value
					opacity: this.options.opacity || '',
					zIndex: this.options.zIndex
				})
				.appendTo(this.parentEl);
		}

		return el;
	},


	// Removes the tracking element if it has already been created
	destroyEl: function() {
		if (this.el) {
			this.el.remove();
			this.el = null;
		}
	},


	// Update the CSS position of the tracking element
	updatePosition: function() {
		var sourceOffset;
		var origin;

		this.getEl(); // ensure this.el

		// make sure origin info was computed
		if (this.top0 === null) {
			this.sourceEl.width(); // hack to force IE8 to compute correct bounding box
			sourceOffset = this.sourceEl.offset();
			origin = this.el.offsetParent().offset();
			this.top0 = sourceOffset.top - origin.top;
			this.left0 = sourceOffset.left - origin.left;
		}

		this.el.css({
			top: this.top0 + this.topDelta,
			left: this.left0 + this.leftDelta
		});
	},


	// Gets called when the user moves the mouse
	mousemove: function(ev) {
		this.topDelta = ev.pageY - this.mouseY0;
		this.leftDelta = ev.pageX - this.mouseX0;

		if (!this.isHidden) {
			this.updatePosition();
		}
	},


	// Temporarily makes the tracking element invisible. Can be called before following starts
	hide: function() {
		if (!this.isHidden) {
			this.isHidden = true;
			if (this.el) {
				this.el.hide();
			}
		}
	},


	// Show the tracking element after it has been temporarily hidden
	show: function() {
		if (this.isHidden) {
			this.isHidden = false;
			this.updatePosition();
			this.getEl().show();
		}
	}

};

;;

/* A utility class for rendering <tr> rows.
----------------------------------------------------------------------------------------------------------------------*/
// It leverages methods of the subclass and the View to determine custom rendering behavior for each row "type"
// (such as highlight rows, day rows, helper rows, etc).

function RowRenderer(view) {
	this.view = view;
}


RowRenderer.prototype = {

	view: null, // a View object
	cellHtml: '<td/>', // plain default HTML used for a cell when no other is available


	// Renders the HTML for a row, leveraging custom cell-HTML-renderers based on the `rowType`.
	// Also applies the "intro" and "outro" cells, which are specified by the subclass and views.
	// `row` is an optional row number.
	rowHtml: function(rowType, row) {
		var view = this.view;
		var renderCell = this.getHtmlRenderer('cell', rowType);
		var cellHtml = '';
		var col;
		var date;

		row = row || 0;

		for (col = 0; col < view.colCnt; col++) {
			date = view.cellToDate(row, col);
			cellHtml += renderCell(row, col, date);
		}

		cellHtml = this.bookendCells(cellHtml, rowType, row); // apply intro and outro

		return '<tr>' + cellHtml + '</tr>';
	},


	// Applies the "intro" and "outro" HTML to the given cells.
	// Intro means the leftmost cell when the calendar is LTR and the rightmost cell when RTL. Vice-versa for outro.
	// `cells` can be an HTML string of <td>'s or a jQuery <tr> element
	// `row` is an optional row number.
	bookendCells: function(cells, rowType, row) {
		var view = this.view;
		var intro = this.getHtmlRenderer('intro', rowType)(row || 0);
		var outro = this.getHtmlRenderer('outro', rowType)(row || 0);
		var isRTL = view.opt('isRTL');
		var prependHtml = isRTL ? outro : intro;
		var appendHtml = isRTL ? intro : outro;

		if (typeof cells === 'string') {
			return prependHtml + cells + appendHtml;
		}
		else { // a jQuery <tr> element
			return cells.prepend(prependHtml).append(appendHtml);
		}
	},


	// Returns an HTML-rendering function given a specific `rendererName` (like cell, intro, or outro) and a specific
	// `rowType` (like day, eventSkeleton, helperSkeleton), which is optional.
	// If a renderer for the specific rowType doesn't exist, it will fall back to a generic renderer.
	// We will query the View object first for any custom rendering functions, then the methods of the subclass.
	getHtmlRenderer: function(rendererName, rowType) {
		var view = this.view;
		var generalName; // like "cellHtml"
		var specificName; // like "dayCellHtml". based on rowType
		var provider; // either the View or the RowRenderer subclass, whichever provided the method
		var renderer;

		generalName = rendererName + 'Html';
		if (rowType) {
			specificName = rowType + capitaliseFirstLetter(rendererName) + 'Html';
		}

		if (specificName && (renderer = view[specificName])) {
			provider = view;
		}
		else if (specificName && (renderer = this[specificName])) {
			provider = this;
		}
		else if ((renderer = view[generalName])) {
			provider = view;
		}
		else if ((renderer = this[generalName])) {
			provider = this;
		}

		if (typeof renderer === 'function') {
			return function() {
				return renderer.apply(provider, arguments) || ''; // use correct `this` and always return a string
			};
		}

		// the rendered can be a plain string as well. if not specified, always an empty string.
		return function() {
			return renderer || '';
		};
	}

};

;;

/* An abstract class comprised of a "grid" of cells that each represent a specific datetime
----------------------------------------------------------------------------------------------------------------------*/

function Grid(view) {
	RowRenderer.call(this, view); // call the super-constructor
	this.coordMap = new GridCoordMap(this);
	this.elsByFill = {};
}


Grid.prototype = createObject(RowRenderer.prototype); // declare the super-class
$.extend(Grid.prototype, {

	el: null, // the containing element
	coordMap: null, // a GridCoordMap that converts pixel values to datetimes
	cellDuration: null, // a cell's duration. subclasses must assign this ASAP
	elsByFill: null, // a hash of jQuery element sets used for rendering each fill. Keyed by fill name.


	// Renders the grid into the `el` element.
	// Subclasses should override and call this super-method when done.
	render: function() {
		this.bindHandlers();
	},


	// Called when the grid's resources need to be cleaned up
	destroy: function() {
		// subclasses can implement
	},


	/* Coordinates & Cells
	------------------------------------------------------------------------------------------------------------------*/


	// Populates the given empty arrays with the y and x coordinates of the cells
	buildCoords: function(rows, cols) {
		// subclasses must implement
	},


	// Given a cell object, returns the date for that cell
	getCellDate: function(cell) {
		// subclasses must implement
	},


	// Given a cell object, returns the element that represents the cell's whole-day
	getCellDayEl: function(cell) {
		// subclasses must implement
	},


	// Converts a range with an inclusive `start` and an exclusive `end` into an array of segment objects
	rangeToSegs: function(start, end) {
		// subclasses must implement
	},


	/* Handlers
	------------------------------------------------------------------------------------------------------------------*/


	// Attach handlers to `this.el`, using bubbling to listen to all ancestors.
	// We don't need to undo any of this in a "destroy" method, because the view will simply remove `this.el` from the
	// DOM and jQuery will be smart enough to garbage collect the handlers.
	bindHandlers: function() {
		var _this = this;

		this.el.on('mousedown', function(ev) {
			if (
				!$(ev.target).is('.fc-event-container *, .fc-more') && // not an an event element, or "more.." link
				!$(ev.target).closest('.fc-popover').length // not on a popover (like the "more.." events one)
			) {
				_this.dayMousedown(ev);
			}
		});

		this.bindSegHandlers(); // attach event-element-related handlers. in Grid.events.js
	},


	// Process a mousedown on an element that represents a day. For day clicking and selecting.
	dayMousedown: function(ev) {
		var _this = this;
		var view = this.view;
		var calendar = view.calendar;
		var isSelectable = view.opt('selectable');
		var dates = null; // the inclusive dates of the selection. will be null if no selection
		var start; // the inclusive start of the selection
		var end; // the *exclusive* end of the selection
		var dayEl;

		// this listener tracks a mousedown on a day element, and a subsequent drag.
		// if the drag ends on the same day, it is a 'dayClick'.
		// if 'selectable' is enabled, this listener also detects selections.
		var dragListener = new DragListener(this.coordMap, {
			//distance: 5, // needs more work if we want dayClick to fire correctly
			scroll: view.opt('dragScroll'),
			dragStart: function() {
				view.unselect(); // since we could be rendering a new selection, we want to clear any old one
			},
			cellOver: function(cell, date) {
				if (dragListener.origDate) { // click needs to have started on a cell

					dayEl = _this.getCellDayEl(cell);

					dates = [ date, dragListener.origDate ].sort(dateCompare);
					start = dates[0];
					end = dates[1].clone().add(_this.cellDuration);

					if (isSelectable) {
						if (calendar.isSelectionAllowedInRange(start, end)) { // allowed to select within this range?
							_this.renderSelection(start, end);
						}
						else {
							dates = null; // flag for an invalid selection
							disableCursor();
						}
					}
				}
			},
			cellOut: function(cell, date) {
				dates = null;
				_this.destroySelection();
				enableCursor();
			},
			listenStop: function(ev) {
				if (dates) { // started and ended on a cell?
					if (dates[0].isSame(dates[1])) {
						view.trigger('dayClick', dayEl[0], start, ev);
					}
					if (isSelectable) {
						// the selection will already have been rendered. just report it
						view.reportSelection(start, end, ev);
					}
				}
				enableCursor();
			}
		});

		dragListener.mousedown(ev); // start listening, which will eventually initiate a dragStart
	},


	/* Event Dragging
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of a event being dragged over the given date(s).
	// `end` can be null, as well as `seg`. See View's documentation on renderDrag for more info.
	// A returned value of `true` signals that a mock "helper" event has been rendered.
	renderDrag: function(start, end, seg) {
		// subclasses must implement
	},


	// Unrenders a visual indication of an event being dragged
	destroyDrag: function() {
		// subclasses must implement
	},


	/* Event Resizing
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of an event being resized.
	// `start` and `end` are the updated dates of the event. `seg` is the original segment object involved in the drag.
	renderResize: function(start, end, seg) {
		// subclasses must implement
	},


	// Unrenders a visual indication of an event being resized.
	destroyResize: function() {
		// subclasses must implement
	},


	/* Event Helper
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a mock event over the given date(s).
	// `end` can be null, in which case the mock event that is rendered will have a null end time.
	// `sourceSeg` is the internal segment object involved in the drag. If null, something external is dragging.
	renderRangeHelper: function(start, end, sourceSeg) {
		var view = this.view;
		var fakeEvent;

		// compute the end time if forced to do so (this is what EventManager does)
		if (!end && view.opt('forceEventDuration')) {
			end = view.calendar.getDefaultEventEnd(!start.hasTime(), start);
		}

		fakeEvent = sourceSeg ? createObject(sourceSeg.event) : {}; // mask the original event object if possible
		fakeEvent.start = start;
		fakeEvent.end = end;
		fakeEvent.allDay = !(start.hasTime() || (end && end.hasTime())); // freshly compute allDay

		// this extra className will be useful for differentiating real events from mock events in CSS
		fakeEvent.className = (fakeEvent.className || []).concat('fc-helper');

		// if something external is being dragged in, don't render a resizer
		if (!sourceSeg) {
			fakeEvent.editable = false;
		}

		this.renderHelper(fakeEvent, sourceSeg); // do the actual rendering
	},


	// Renders a mock event
	renderHelper: function(event, sourceSeg) {
		// subclasses must implement
	},


	// Unrenders a mock event
	destroyHelper: function() {
		// subclasses must implement
	},


	/* Selection
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of a selection. Will highlight by default but can be overridden by subclasses.
	renderSelection: function(start, end) {
		this.renderHighlight(start, end);
	},


	// Unrenders any visual indications of a selection. Will unrender a highlight by default.
	destroySelection: function() {
		this.destroyHighlight();
	},


	/* Highlight
	------------------------------------------------------------------------------------------------------------------*/


	// Renders an emphasis on the given date range. `start` is inclusive. `end` is exclusive.
	renderHighlight: function(start, end) {
		this.renderFill('highlight', this.rangeToSegs(start, end));
	},


	// Unrenders the emphasis on a date range
	destroyHighlight: function() {
		this.destroyFill('highlight');
	},


	// Generates an array of classNames for rendering the highlight. Used by the fill system.
	highlightSegClasses: function() {
		return [ 'fc-highlight' ];
	},


	/* Fill System (highlight, background events, business hours)
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a set of rectangles over the given segments of time.
	// Returns a subset of segs, the segs that were actually rendered.
	// Responsible for populating this.elsByFill
	renderFill: function(type, segs) {
		// subclasses must implement
	},


	// Unrenders a specific type of fill that is currently rendered on the grid
	destroyFill: function(type) {
		var el = this.elsByFill[type];

		if (el) {
			el.remove();
			delete this.elsByFill[type];
		}
	},


	// Renders and assigns an `el` property for each fill segment. Generic enough to work with different types.
	// Only returns segments that successfully rendered.
	// To be harnessed by renderFill (implemented by subclasses).
	// Analagous to renderFgSegEls.
	renderFillSegEls: function(type, segs) {
		var _this = this;
		var segElMethod = this[type + 'SegEl'];
		var html = '';
		var renderedSegs = [];
		var i;

		if (segs.length) {

			// build a large concatenation of segment HTML
			for (i = 0; i < segs.length; i++) {
				html += this.fillSegHtml(type, segs[i]);
			}

			// Grab individual elements from the combined HTML string. Use each as the default rendering.
			// Then, compute the 'el' for each segment.
			$(html).each(function(i, node) {
				var seg = segs[i];
				var el = $(node);

				// allow custom filter methods per-type
				if (segElMethod) {
					el = segElMethod.call(_this, seg, el);
				}

				if (el) { // custom filters did not cancel the render
					el = $(el); // allow custom filter to return raw DOM node

					// correct element type? (would be bad if a non-TD were inserted into a table for example)
					if (el.is(_this.fillSegTag)) {
						seg.el = el;
						renderedSegs.push(seg);
					}
				}
			});
		}

		return renderedSegs;
	},


	fillSegTag: 'div', // subclasses can override


	// Builds the HTML needed for one fill segment. Generic enought o work with different types.
	fillSegHtml: function(type, seg) {
		var classesMethod = this[type + 'SegClasses']; // custom hooks per-type
		var stylesMethod = this[type + 'SegStyles']; //
		var classes = classesMethod ? classesMethod.call(this, seg) : [];
		var styles = stylesMethod ? stylesMethod.call(this, seg) : ''; // a semi-colon separated CSS property string

		return '<' + this.fillSegTag +
			(classes.length ? ' class="' + classes.join(' ') + '"' : '') +
			(styles ? ' style="' + styles + '"' : '') +
			' />';
	},


	/* Generic rendering utilities for subclasses
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a day-of-week header row
	headHtml: function() {
		return '' +
			'<div class="fc-row ' + this.view.widgetHeaderClass + '">' +
				'<table>' +
					'<thead>' +
						this.rowHtml('head') + // leverages RowRenderer
					'</thead>' +
				'</table>' +
			'</div>';
	},


	// Used by the `headHtml` method, via RowRenderer, for rendering the HTML of a day-of-week header cell
	headCellHtml: function(row, col, date) {
		var view = this.view;
		var calendar = view.calendar;
		var colFormat = view.opt('columnFormat');

		return '' +
			'<th class="fc-day-header ' + view.widgetHeaderClass + ' fc-' + dayIDs[date.day()] + '">' +
				htmlEscape(calendar.formatDate(date, colFormat)) +
			'</th>';
	},


	// Renders the HTML for a single-day background cell
	bgCellHtml: function(row, col, date) {
		var view = this.view;
		var classes = this.getDayClasses(date);

		classes.unshift('fc-day', view.widgetContentClass);

		return '<td class="' + classes.join(' ') + '" data-date="' + date.format() + '"></td>';
	},


	// Computes HTML classNames for a single-day cell
	getDayClasses: function(date) {
		var view = this.view;
		var today = view.calendar.getNow().stripTime();
		var classes = [ 'fc-' + dayIDs[date.day()] ];

		if (
			view.name === 'month' &&
			date.month() != view.intervalStart.month()
		) {
			classes.push('fc-other-month');
		}

		if (date.isSame(today, 'day')) {
			classes.push(
				'fc-today',
				view.highlightStateClass
			);
		}
		else if (date < today) {
			classes.push('fc-past');
		}
		else {
			classes.push('fc-future');
		}

		return classes;
	}

});

;;

/* Event-rendering and event-interaction methods for the abstract Grid class
----------------------------------------------------------------------------------------------------------------------*/

$.extend(Grid.prototype, {

	mousedOverSeg: null, // the segment object the user's mouse is over. null if over nothing
	isDraggingSeg: false, // is a segment being dragged? boolean
	isResizingSeg: false, // is a segment being resized? boolean
	segs: null, // the event segments currently rendered in the grid


	// Renders the given events onto the grid
	renderEvents: function(events) {
		var segs = this.eventsToSegs(events);
		var bgSegs = [];
		var fgSegs = [];
		var i, seg;

		for (i = 0; i < segs.length; i++) {
			seg = segs[i];

			if (isBgEvent(seg.event)) {
				bgSegs.push(seg);
			}
			else {
				fgSegs.push(seg);
			}
		}

		// Render each different type of segment.
		// Each function may return a subset of the segs, segs that were actually rendered.
		bgSegs = this.renderBgSegs(bgSegs) || bgSegs;
		fgSegs = this.renderFgSegs(fgSegs) || fgSegs;

		this.segs = bgSegs.concat(fgSegs);
	},


	// Unrenders all events currently rendered on the grid
	destroyEvents: function() {
		this.triggerSegMouseout(); // trigger an eventMouseout if user's mouse is over an event

		this.destroyFgSegs();
		this.destroyBgSegs();

		this.segs = null;
	},


	// Retrieves all rendered segment objects currently rendered on the grid
	getSegs: function() {
		return this.segs || [];
	},


	/* Foreground Segment Rendering
	------------------------------------------------------------------------------------------------------------------*/


	// Renders foreground event segments onto the grid. May return a subset of segs that were rendered.
	renderFgSegs: function(segs) {
		// subclasses must implement
	},


	// Unrenders all currently rendered foreground segments
	destroyFgSegs: function() {
		// subclasses must implement
	},


	// Renders and assigns an `el` property for each foreground event segment.
	// Only returns segments that successfully rendered.
	// A utility that subclasses may use.
	renderFgSegEls: function(segs, disableResizing) {
		var view = this.view;
		var html = '';
		var renderedSegs = [];
		var i;

		if (segs.length) { // don't build an empty html string

			// build a large concatenation of event segment HTML
			for (i = 0; i < segs.length; i++) {
				html += this.fgSegHtml(segs[i], disableResizing);
			}

			// Grab individual elements from the combined HTML string. Use each as the default rendering.
			// Then, compute the 'el' for each segment. An el might be null if the eventRender callback returned false.
			$(html).each(function(i, node) {
				var seg = segs[i];
				var el = view.resolveEventEl(seg.event, $(node));

				if (el) {
					el.data('fc-seg', seg); // used by handlers
					seg.el = el;
					renderedSegs.push(seg);
				}
			});
		}

		return renderedSegs;
	},


	// Generates the HTML for the default rendering of a foreground event segment. Used by renderFgSegEls()
	fgSegHtml: function(seg, disableResizing) {
		// subclasses should implement
	},


	/* Background Segment Rendering
	------------------------------------------------------------------------------------------------------------------*/


	// Renders the given background event segments onto the grid.
	// Returns a subset of the segs that were actually rendered.
	renderBgSegs: function(segs) {
		return this.renderFill('bgEvent', segs);
	},


	// Unrenders all the currently rendered background event segments
	destroyBgSegs: function() {
		this.destroyFill('bgEvent');
	},


	// Renders a background event element, given the default rendering. Called by the fill system.
	bgEventSegEl: function(seg, el) {
		return this.view.resolveEventEl(seg.event, el); // will filter through eventRender
	},


	// Generates an array of classNames to be used for the default rendering of a background event.
	// Called by the fill system.
	bgEventSegClasses: function(seg) {
		var event = seg.event;
		var source = event.source || {};

		return [ 'fc-bgevent' ].concat(
			event.className,
			source.className || []
		);
	},


	// Generates a semicolon-separated CSS string to be used for the default rendering of a background event.
	// Called by the fill system.
	// TODO: consolidate with getEventSkinCss?
	bgEventSegStyles: function(seg) {
		var view = this.view;
		var event = seg.event;
		var source = event.source || {};
		var eventColor = event.color;
		var sourceColor = source.color;
		var optionColor = view.opt('eventColor');
		var backgroundColor =
			event.backgroundColor ||
			eventColor ||
			source.backgroundColor ||
			sourceColor ||
			view.opt('eventBackgroundColor') ||
			optionColor;

		if (backgroundColor) {
			return 'background-color:' + backgroundColor;
		}

		return '';
	},


	// Generates an array of classNames to be used for the rendering business hours overlay. Called by the fill system.
	businessHoursSegClasses: function(seg) {
		return [ 'fc-nonbusiness', 'fc-bgevent' ];
	},


	/* Handlers
	------------------------------------------------------------------------------------------------------------------*/


	// Attaches event-element-related handlers to the container element and leverage bubbling
	bindSegHandlers: function() {
		var _this = this;
		var view = this.view;

		$.each(
			{
				mouseenter: function(seg, ev) {
					_this.triggerSegMouseover(seg, ev);
				},
				mouseleave: function(seg, ev) {
					_this.triggerSegMouseout(seg, ev);
				},
				click: function(seg, ev) {
					return view.trigger('eventClick', this, seg.event, ev); // can return `false` to cancel
				},
				mousedown: function(seg, ev) {
					if ($(ev.target).is('.fc-resizer') && view.isEventResizable(seg.event)) {
						_this.segResizeMousedown(seg, ev);
					}
					else if (view.isEventDraggable(seg.event)) {
						_this.segDragMousedown(seg, ev);
					}
				}
			},
			function(name, func) {
				// attach the handler to the container element and only listen for real event elements via bubbling
				_this.el.on(name, '.fc-event-container > *', function(ev) {
					var seg = $(this).data('fc-seg'); // grab segment data. put there by View::renderEvents

					// only call the handlers if there is not a drag/resize in progress
					if (seg && !_this.isDraggingSeg && !_this.isResizingSeg) {
						return func.call(this, seg, ev); // `this` will be the event element
					}
				});
			}
		);
	},


	// Updates internal state and triggers handlers for when an event element is moused over
	triggerSegMouseover: function(seg, ev) {
		if (!this.mousedOverSeg) {
			this.mousedOverSeg = seg;
			this.view.trigger('eventMouseover', seg.el[0], seg.event, ev);
		}
	},


	// Updates internal state and triggers handlers for when an event element is moused out.
	// Can be given no arguments, in which case it will mouseout the segment that was previously moused over.
	triggerSegMouseout: function(seg, ev) {
		ev = ev || {}; // if given no args, make a mock mouse event

		if (this.mousedOverSeg) {
			seg = seg || this.mousedOverSeg; // if given no args, use the currently moused-over segment
			this.mousedOverSeg = null;
			this.view.trigger('eventMouseout', seg.el[0], seg.event, ev);
		}
	},


	/* Dragging
	------------------------------------------------------------------------------------------------------------------*/


	// Called when the user does a mousedown on an event, which might lead to dragging.
	// Generic enough to work with any type of Grid.
	segDragMousedown: function(seg, ev) {
		var _this = this;
		var view = this.view;
		var calendar = view.calendar;
		var el = seg.el;
		var event = seg.event;
		var newStart, newEnd;

		// A clone of the original element that will move with the mouse
		var mouseFollower = new MouseFollower(seg.el, {
			parentEl: view.el,
			opacity: view.opt('dragOpacity'),
			revertDuration: view.opt('dragRevertDuration'),
			zIndex: 2 // one above the .fc-view
		});

		// Tracks mouse movement over the *view's* coordinate map. Allows dragging and dropping between subcomponents
		// of the view.
		var dragListener = new DragListener(view.coordMap, {
			distance: 5,
			scroll: view.opt('dragScroll'),
			listenStart: function(ev) {
				mouseFollower.hide(); // don't show until we know this is a real drag
				mouseFollower.start(ev);
			},
			dragStart: function(ev) {
				_this.triggerSegMouseout(seg, ev); // ensure a mouseout on the manipulated event has been reported
				_this.isDraggingSeg = true;
				view.hideEvent(event); // hide all event segments. our mouseFollower will take over
				view.trigger('eventDragStart', el[0], event, ev, {}); // last argument is jqui dummy
			},
			cellOver: function(cell, date) {
				var origDate = seg.cellDate || dragListener.origDate;
				var res = _this.computeDraggedEventDates(seg, origDate, date);
				newStart = res.start;
				newEnd = res.end;

				if (calendar.isEventAllowedInRange(event, newStart, res.visibleEnd)) { // allowed to drop here?
					if (view.renderDrag(newStart, newEnd, seg)) { // have the view render a visual indication
						mouseFollower.hide(); // if the view is already using a mock event "helper", hide our own
					}
					else {
						mouseFollower.show();
					}
				}
				else {
					// have the helper follow the mouse (no snapping) with a warning-style cursor
					newStart = null; // mark an invalid drop date
					mouseFollower.show();
					disableCursor();
				}
			},
			cellOut: function() { // called before mouse moves to a different cell OR moved out of all cells
				newStart = null;
				view.destroyDrag(); // unrender whatever was done in view.renderDrag
				mouseFollower.show(); // show in case we are moving out of all cells
				enableCursor();
			},
			dragStop: function(ev) {
				var hasChanged = newStart && !newStart.isSame(event.start);

				// do revert animation if hasn't changed. calls a callback when finished (whether animation or not)
				mouseFollower.stop(!hasChanged, function() {
					_this.isDraggingSeg = false;
					view.destroyDrag();
					view.showEvent(event);
					view.trigger('eventDragStop', el[0], event, ev, {}); // last argument is jqui dummy

					if (hasChanged) {
						view.eventDrop(el[0], event, newStart, ev); // will rerender all events...
					}
				});

				enableCursor();
			},
			listenStop: function() {
				mouseFollower.stop(); // put in listenStop in case there was a mousedown but the drag never started
			}
		});

		dragListener.mousedown(ev); // start listening, which will eventually lead to a dragStart
	},


	// Given a segment, the dates where a drag began and ended, calculates the Event Object's new start and end dates.
	// Might return a `null` end (even when forceEventDuration is on).
	computeDraggedEventDates: function(seg, dragStartDate, dropDate) {
		var view = this.view;
		var event = seg.event;
		var start = event.start;
		var end = view.calendar.getEventEnd(event);
		var delta;
		var newStart;
		var newEnd;
		var newAllDay;
		var visibleEnd;

		if (dropDate.hasTime() === dragStartDate.hasTime()) {
			delta = dayishDiff(dropDate, dragStartDate);
			newStart = start.clone().add(delta);
			if (event.end === null) { // do we need to compute an end?
				newEnd = null;
			}
			else {
				newEnd = end.clone().add(delta);
			}
			newAllDay = event.allDay; // keep it the same
		}
		else {
			// if switching from day <-> timed, start should be reset to the dropped date, and the end cleared
			newStart = dropDate;
			newEnd = null; // end should be cleared
			newAllDay = !dropDate.hasTime();
		}

		// compute what the end date will appear to be
		visibleEnd = newEnd || view.calendar.getDefaultEventEnd(newAllDay, newStart);

		return { start: newStart, end: newEnd, visibleEnd: visibleEnd };
	},


	/* Resizing
	------------------------------------------------------------------------------------------------------------------*/


	// Called when the user does a mousedown on an event's resizer, which might lead to resizing.
	// Generic enough to work with any type of Grid.
	segResizeMousedown: function(seg, ev) {
		var _this = this;
		var view = this.view;
		var calendar = view.calendar;
		var el = seg.el;
		var event = seg.event;
		var start = event.start;
		var end = view.calendar.getEventEnd(event);
		var newEnd = null;
		var dragListener;

		function destroy() { // resets the rendering to show the original event
			_this.destroyResize();
			view.showEvent(event);
		}

		// Tracks mouse movement over the *grid's* coordinate map
		dragListener = new DragListener(this.coordMap, {
			distance: 5,
			scroll: view.opt('dragScroll'),
			dragStart: function(ev) {
				_this.triggerSegMouseout(seg, ev); // ensure a mouseout on the manipulated event has been reported
				_this.isResizingSeg = true;
				view.trigger('eventResizeStart', el[0], event, ev, {}); // last argument is jqui dummy
			},
			cellOver: function(cell, date) {
				// compute the new end. don't allow it to go before the event's start
				if (date.isBefore(start)) { // allows comparing ambig to non-ambig
					date = start;
				}
				newEnd = date.clone().add(_this.cellDuration); // make it an exclusive end

				if (calendar.isEventAllowedInRange(event, start, newEnd)) { // allowed to be resized here?
					if (newEnd.isSame(end)) {
						newEnd = null; // mark an invalid resize
						destroy();
					}
					else {
						_this.renderResize(start, newEnd, seg);
						view.hideEvent(event);
					}
				}
				else {
					newEnd = null; // mark an invalid resize
					destroy();
					disableCursor();
				}
			},
			cellOut: function() { // called before mouse moves to a different cell OR moved out of all cells
				newEnd = null;
				destroy();
				enableCursor();
			},
			dragStop: function(ev) {
				_this.isResizingSeg = false;
				destroy();
				enableCursor();
				view.trigger('eventResizeStop', el[0], event, ev, {}); // last argument is jqui dummy

				if (newEnd) {
					view.eventResize(el[0], event, newEnd, ev); // will rerender all events...
				}
			}
		});

		dragListener.mousedown(ev); // start listening, which will eventually lead to a dragStart
	},


	/* Rendering Utils
	------------------------------------------------------------------------------------------------------------------*/


	// Generic utility for generating the HTML classNames for an event segment's element
	getSegClasses: function(seg, isDraggable, isResizable) {
		var event = seg.event;
		var classes = [
			'fc-event',
			seg.isStart ? 'fc-start' : 'fc-not-start',
			seg.isEnd ? 'fc-end' : 'fc-not-end'
		].concat(
			event.className,
			event.source ? event.source.className : []
		);

		if (isDraggable) {
			classes.push('fc-draggable');
		}
		if (isResizable) {
			classes.push('fc-resizable');
		}

		return classes;
	},


	// Utility for generating a CSS string with all the event skin-related properties
	getEventSkinCss: function(event) {
		var view = this.view;
		var source = event.source || {};
		var eventColor = event.color;
		var sourceColor = source.color;
		var optionColor = view.opt('eventColor');
		var backgroundColor =
			event.backgroundColor ||
			eventColor ||
			source.backgroundColor ||
			sourceColor ||
			view.opt('eventBackgroundColor') ||
			optionColor;
		var borderColor =
			event.borderColor ||
			eventColor ||
			source.borderColor ||
			sourceColor ||
			view.opt('eventBorderColor') ||
			optionColor;
		var textColor =
			event.textColor ||
			source.textColor ||
			view.opt('eventTextColor');
		var statements = [];
		if (backgroundColor) {
			statements.push('background-color:' + backgroundColor);
		}
		if (borderColor) {
			statements.push('border-color:' + borderColor);
		}
		if (textColor) {
			statements.push('color:' + textColor);
		}
		return statements.join(';');
	},


	/* Converting events -> ranges -> segs
	------------------------------------------------------------------------------------------------------------------*/


	// Converts an array of event objects into an array of event segment objects.
	// A custom `rangeToSegsFunc` may be given for arbitrarily slicing up events.
	eventsToSegs: function(events, rangeToSegsFunc) {
		var eventRanges = this.eventsToRanges(events);
		var segs = [];
		var i;

		for (i = 0; i < eventRanges.length; i++) {
			segs.push.apply(
				segs,
				this.eventRangeToSegs(eventRanges[i], rangeToSegsFunc)
			);
		}

		return segs;
	},


	// Converts an array of events into an array of "range" objects.
	// A "range" object is a plain object with start/end properties denoting the time it covers. Also an event property.
	// For "normal" events, this will be identical to the event's start/end, but for "inverse-background" events,
	// will create an array of ranges that span the time *not* covered by the given event.
	eventsToRanges: function(events) {
		var _this = this;
		var eventsById = groupEventsById(events);
		var ranges = [];

		// group by ID so that related inverse-background events can be rendered together
		$.each(eventsById, function(id, eventGroup) {
			if (eventGroup.length) {
				ranges.push.apply(
					ranges,
					isInverseBgEvent(eventGroup[0]) ?
						_this.eventsToInverseRanges(eventGroup) :
						_this.eventsToNormalRanges(eventGroup)
				);
			}
		});

		return ranges;
	},


	// Converts an array of "normal" events (not inverted rendering) into a parallel array of ranges
	eventsToNormalRanges: function(events) {
		var calendar = this.view.calendar;
		var ranges = [];
		var i, event;
		var eventStart, eventEnd;

		for (i = 0; i < events.length; i++) {
			event = events[i];

			// make copies and normalize by stripping timezone
			eventStart = event.start.clone().stripZone();
			eventEnd = calendar.getEventEnd(event).stripZone();

			ranges.push({
				event: event,
				start: eventStart,
				end: eventEnd,
				eventStartMS: +eventStart,
				eventDurationMS: eventEnd - eventStart
			});
		}

		return ranges;
	},


	// Converts an array of events, with inverse-background rendering, into an array of range objects.
	// The range objects will cover all the time NOT covered by the events.
	eventsToInverseRanges: function(events) {
		var view = this.view;
		var viewStart = view.start.clone().stripZone(); // normalize timezone
		var viewEnd = view.end.clone().stripZone(); // normalize timezone
		var normalRanges = this.eventsToNormalRanges(events); // will give us normalized dates we can use w/o copies
		var inverseRanges = [];
		var event0 = events[0]; // assign this to each range's `.event`
		var start = viewStart; // the end of the previous range. the start of the new range
		var i, normalRange;

		// ranges need to be in order. required for our date-walking algorithm
		normalRanges.sort(compareNormalRanges);

		for (i = 0; i < normalRanges.length; i++) {
			normalRange = normalRanges[i];

			// add the span of time before the event (if there is any)
			if (normalRange.start > start) { // compare millisecond time (skip any ambig logic)
				inverseRanges.push({
					event: event0,
					start: start,
					end: normalRange.start
				});
			}

			start = normalRange.end;
		}

		// add the span of time after the last event (if there is any)
		if (start < viewEnd) { // compare millisecond time (skip any ambig logic)
			inverseRanges.push({
				event: event0,
				start: start,
				end: viewEnd
			});
		}

		return inverseRanges;
	},


	// Slices the given event range into one or more segment objects.
	// A `rangeToSegsFunc` custom slicing function can be given.
	eventRangeToSegs: function(eventRange, rangeToSegsFunc) {
		var segs;
		var i, seg;

		if (rangeToSegsFunc) {
			segs = rangeToSegsFunc(eventRange.start, eventRange.end);
		}
		else {
			segs = this.rangeToSegs(eventRange.start, eventRange.end); // defined by the subclass
		}

		for (i = 0; i < segs.length; i++) {
			seg = segs[i];
			seg.event = eventRange.event;
			seg.eventStartMS = eventRange.eventStartMS;
			seg.eventDurationMS = eventRange.eventDurationMS;
		}

		return segs;
	}

});


/* Utilities
----------------------------------------------------------------------------------------------------------------------*/


function isBgEvent(event) { // returns true if background OR inverse-background
	var rendering = getEventRendering(event);
	return rendering === 'background' || rendering === 'inverse-background';
}


function isInverseBgEvent(event) {
	return getEventRendering(event) === 'inverse-background';
}


function getEventRendering(event) {
	return firstDefined((event.source || {}).rendering, event.rendering);
}


function groupEventsById(events) {
	var eventsById = {};
	var i, event;

	for (i = 0; i < events.length; i++) {
		event = events[i];
		(eventsById[event._id] || (eventsById[event._id] = [])).push(event);
	}

	return eventsById;
}


// A cmp function for determining which non-inverted "ranges" (see above) happen earlier
function compareNormalRanges(range1, range2) {
	return range1.eventStartMS - range2.eventStartMS; // earlier ranges go first
}


// A cmp function for determining which segments should take visual priority
// DOES NOT WORK ON INVERTED BACKGROUND EVENTS because they have no eventStartMS/eventDurationMS
function compareSegs(seg1, seg2) {
	return seg1.eventStartMS - seg2.eventStartMS || // earlier events go first
		seg2.eventDurationMS - seg1.eventDurationMS || // tie? longer events go first
		seg2.event.allDay - seg1.event.allDay || // tie? put all-day events first (booleans cast to 0/1)
		(seg1.event.title || '').localeCompare(seg2.event.title); // tie? alphabetically by title
}


;;

/* A component that renders a grid of whole-days that runs horizontally. There can be multiple rows, one per week.
----------------------------------------------------------------------------------------------------------------------*/

function DayGrid(view) {
	Grid.call(this, view); // call the super-constructor
}


DayGrid.prototype = createObject(Grid.prototype); // declare the super-class
$.extend(DayGrid.prototype, {

	numbersVisible: false, // should render a row for day/week numbers? manually set by the view
	cellDuration: moment.duration({ days: 1 }), // required for Grid.event.js. Each cell is always a single day
	bottomCoordPadding: 0, // hack for extending the hit area for the last row of the coordinate grid

	rowEls: null, // set of fake row elements
	dayEls: null, // set of whole-day elements comprising the row's background
	helperEls: null, // set of cell skeleton elements for rendering the mock event "helper"


	// Renders the rows and columns into the component's `this.el`, which should already be assigned.
	// isRigid determins whether the individual rows should ignore the contents and be a constant height.
	// Relies on the view's colCnt and rowCnt. In the future, this component should probably be self-sufficient.
	render: function(isRigid) {
		var view = this.view;
		var html = '';
		var row;

		for (row = 0; row < view.rowCnt; row++) {
			html += this.dayRowHtml(row, isRigid);
		}
		this.el.html(html);

		this.rowEls = this.el.find('.fc-row');
		this.dayEls = this.el.find('.fc-day');

		// run all the day cells through the dayRender callback
		this.dayEls.each(function(i, node) {
			var date = view.cellToDate(Math.floor(i / view.colCnt), i % view.colCnt);
			view.trigger('dayRender', null, date, $(node));
		});

		Grid.prototype.render.call(this); // call the super-method
	},


	destroy: function() {
		this.destroySegPopover();
	},


	// Generates the HTML for a single row. `row` is the row number.
	dayRowHtml: function(row, isRigid) {
		var view = this.view;
		var classes = [ 'fc-row', 'fc-week', view.widgetContentClass ];

		if (isRigid) {
			classes.push('fc-rigid');
		}

		return '' +
			'<div class="' + classes.join(' ') + '">' +
				'<div class="fc-bg">' +
					'<table>' +
						this.rowHtml('day', row) + // leverages RowRenderer. calls dayCellHtml()
					'</table>' +
				'</div>' +
				'<div class="fc-content-skeleton">' +
					'<table>' +
						(this.numbersVisible ?
							'<thead>' +
								this.rowHtml('number', row) + // leverages RowRenderer. View will define render method
							'</thead>' :
							''
							) +
					'</table>' +
				'</div>' +
			'</div>';
	},


	// Renders the HTML for a whole-day cell. Will eventually end up in the day-row's background.
	// We go through a 'day' row type instead of just doing a 'bg' row type so that the View can do custom rendering
	// specifically for whole-day rows, whereas a 'bg' might also be used for other purposes (TimeGrid bg for example).
	dayCellHtml: function(row, col, date) {
		return this.bgCellHtml(row, col, date);
	},


	/* Coordinates & Cells
	------------------------------------------------------------------------------------------------------------------*/


	// Populates the empty `rows` and `cols` arrays with coordinates of the cells. For CoordGrid.
	buildCoords: function(rows, cols) {
		var colCnt = this.view.colCnt;
		var e, n, p;

		this.dayEls.slice(0, colCnt).each(function(i, _e) { // iterate the first row of day elements
			e = $(_e);
			n = e.offset().left;
			if (i) {
				p[1] = n;
			}
			p = [ n ];
			cols[i] = p;
		});
		p[1] = n + e.outerWidth();

		this.rowEls.each(function(i, _e) {
			e = $(_e);
			n = e.offset().top;
			if (i) {
				p[1] = n;
			}
			p = [ n ];
			rows[i] = p;
		});
		p[1] = n + e.outerHeight() + this.bottomCoordPadding; // hack to extend hit area of last row
	},


	// Converts a cell to a date
	getCellDate: function(cell) {
		return this.view.cellToDate(cell); // leverages the View's cell system
	},


	// Gets the whole-day element associated with the cell
	getCellDayEl: function(cell) {
		return this.dayEls.eq(cell.row * this.view.colCnt + cell.col);
	},


	// Converts a range with an inclusive `start` and an exclusive `end` into an array of segment objects
	rangeToSegs: function(start, end) {
		return this.view.rangeToSegments(start, end); // leverages the View's cell system
	},


	/* Event Drag Visualization
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of an event hovering over the given date(s).
	// `end` can be null, as well as `seg`. See View's documentation on renderDrag for more info.
	// A returned value of `true` signals that a mock "helper" event has been rendered.
	renderDrag: function(start, end, seg) {
		var opacity;

		// always render a highlight underneath
		this.renderHighlight(
			start,
			end || this.view.calendar.getDefaultEventEnd(true, start)
		);

		// if a segment from the same calendar but another component is being dragged, render a helper event
		if (seg && !seg.el.closest(this.el).length) {

			this.renderRangeHelper(start, end, seg);

			opacity = this.view.opt('dragOpacity');
			if (opacity !== undefined) {
				this.helperEls.css('opacity', opacity);
			}

			return true; // a helper has been rendered
		}
	},


	// Unrenders any visual indication of a hovering event
	destroyDrag: function() {
		this.destroyHighlight();
		this.destroyHelper();
	},


	/* Event Resize Visualization
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of an event being resized
	renderResize: function(start, end, seg) {
		this.renderHighlight(start, end);
		this.renderRangeHelper(start, end, seg);
	},


	// Unrenders a visual indication of an event being resized
	destroyResize: function() {
		this.destroyHighlight();
		this.destroyHelper();
	},


	/* Event Helper
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a mock "helper" event. `sourceSeg` is the associated internal segment object. It can be null.
	renderHelper: function(event, sourceSeg) {
		var helperNodes = [];
		var segs = this.eventsToSegs([ event ]);
		var rowStructs;

		segs = this.renderFgSegEls(segs); // assigns each seg's el and returns a subset of segs that were rendered
		rowStructs = this.renderSegRows(segs);

		// inject each new event skeleton into each associated row
		this.rowEls.each(function(row, rowNode) {
			var rowEl = $(rowNode); // the .fc-row
			var skeletonEl = $('<div class="fc-helper-skeleton"><table/></div>'); // will be absolutely positioned
			var skeletonTop;

			// If there is an original segment, match the top position. Otherwise, put it at the row's top level
			if (sourceSeg && sourceSeg.row === row) {
				skeletonTop = sourceSeg.el.position().top;
			}
			else {
				skeletonTop = rowEl.find('.fc-content-skeleton tbody').position().top;
			}

			skeletonEl.css('top', skeletonTop)
				.find('table')
					.append(rowStructs[row].tbodyEl);

			rowEl.append(skeletonEl);
			helperNodes.push(skeletonEl[0]);
		});

		this.helperEls = $(helperNodes); // array -> jQuery set
	},


	// Unrenders any visual indication of a mock helper event
	destroyHelper: function() {
		if (this.helperEls) {
			this.helperEls.remove();
			this.helperEls = null;
		}
	},


	/* Fill System (highlight, background events, business hours)
	------------------------------------------------------------------------------------------------------------------*/


	fillSegTag: 'td', // override the default tag name


	// Renders a set of rectangles over the given segments of days.
	// Only returns segments that successfully rendered.
	renderFill: function(type, segs) {
		var nodes = [];
		var i, seg;
		var skeletonEl;

		segs = this.renderFillSegEls(type, segs); // assignes `.el` to each seg. returns successfully rendered segs

		for (i = 0; i < segs.length; i++) {
			seg = segs[i];
			skeletonEl = this.renderFillRow(type, seg);
			this.rowEls.eq(seg.row).append(skeletonEl);
			nodes.push(skeletonEl[0]);
		}

		this.elsByFill[type] = $(nodes);

		return segs;
	},


	// Generates the HTML needed for one row of a fill. Requires the seg's el to be rendered.
	renderFillRow: function(type, seg) {
		var colCnt = this.view.colCnt;
		var startCol = seg.leftCol;
		var endCol = seg.rightCol + 1;
		var skeletonEl;
		var trEl;

		skeletonEl = $(
			'<div class="fc-' + type.toLowerCase() + '-skeleton">' +
				'<table><tr/></table>' +
			'</div>'
		);
		trEl = skeletonEl.find('tr');

		if (startCol > 0) {
			trEl.append('<td colspan="' + startCol + '"/>');
		}

		trEl.append(
			seg.el.attr('colspan', endCol - startCol)
		);

		if (endCol < colCnt) {
			trEl.append('<td colspan="' + (colCnt - endCol) + '"/>');
		}

		this.bookendCells(trEl, type);

		return skeletonEl;
	}

});

;;

/* Event-rendering methods for the DayGrid class
----------------------------------------------------------------------------------------------------------------------*/

$.extend(DayGrid.prototype, {

	rowStructs: null, // an array of objects, each holding information about a row's foreground event-rendering


	// Unrenders all events currently rendered on the grid
	destroyEvents: function() {
		this.destroySegPopover(); // removes the "more.." events popover
		Grid.prototype.destroyEvents.apply(this, arguments); // calls the super-method
	},


	// Retrieves all rendered segment objects currently rendered on the grid
	getSegs: function() {
		return Grid.prototype.getSegs.call(this) // get the segments from the super-method
			.concat(this.popoverSegs || []); // append the segments from the "more..." popover
	},


	// Renders the given background event segments onto the grid
	renderBgSegs: function(segs) {

		// don't render timed background events
		var allDaySegs = $.grep(segs, function(seg) {
			return seg.event.allDay;
		});

		return Grid.prototype.renderBgSegs.call(this, allDaySegs); // call the super-method
	},


	// Renders the given foreground event segments onto the grid
	renderFgSegs: function(segs) {
		var rowStructs;

		// render an `.el` on each seg
		// returns a subset of the segs. segs that were actually rendered
		segs = this.renderFgSegEls(segs);

		rowStructs = this.rowStructs = this.renderSegRows(segs);

		// append to each row's content skeleton
		this.rowEls.each(function(i, rowNode) {
			$(rowNode).find('.fc-content-skeleton > table').append(
				rowStructs[i].tbodyEl
			);
		});

		return segs; // return only the segs that were actually rendered
	},


	// Unrenders all currently rendered foreground event segments
	destroyFgSegs: function() {
		var rowStructs = this.rowStructs || [];
		var rowStruct;

		while ((rowStruct = rowStructs.pop())) {
			rowStruct.tbodyEl.remove();
		}

		this.rowStructs = null;
	},


	// Uses the given events array to generate <tbody> elements that should be appended to each row's content skeleton.
	// Returns an array of rowStruct objects (see the bottom of `renderSegRow`).
	// PRECONDITION: each segment shoud already have a rendered and assigned `.el`
	renderSegRows: function(segs) {
		var rowStructs = [];
		var segRows;
		var row;

		segRows = this.groupSegRows(segs); // group into nested arrays

		// iterate each row of segment groupings
		for (row = 0; row < segRows.length; row++) {
			rowStructs.push(
				this.renderSegRow(row, segRows[row])
			);
		}

		return rowStructs;
	},


	// Builds the HTML to be used for the default element for an individual segment
	fgSegHtml: function(seg, disableResizing) {
		var view = this.view;
		var isRTL = view.opt('isRTL');
		var event = seg.event;
		var isDraggable = view.isEventDraggable(event);
		var isResizable = !disableResizing && event.allDay && seg.isEnd && view.isEventResizable(event);
		var classes = this.getSegClasses(seg, isDraggable, isResizable);
		var skinCss = this.getEventSkinCss(event);
		var timeHtml = '';
		var titleHtml;

		classes.unshift('fc-day-grid-event');

		// Only display a timed events time if it is the starting segment
		if (!event.allDay && seg.isStart) {
			timeHtml = '<span class="fc-time">' + htmlEscape(view.getEventTimeText(event)) + '</span>';
		}

		titleHtml =
			'<span class="fc-title">' +
				(htmlEscape(event.title || '') || '&nbsp;') + // we always want one line of height
			'</span>';
		
		return '<a class="' + classes.join(' ') + '"' +
				(event.url ?
					' href="' + htmlEscape(event.url) + '"' :
					''
					) +
				(skinCss ?
					' style="' + skinCss + '"' :
					''
					) +
			'>' +
				'<div class="fc-content">' +
					(isRTL ?
						titleHtml + ' ' + timeHtml : // put a natural space in between
						timeHtml + ' ' + titleHtml   //
						) +
				'</div>' +
				(isResizable ?
					'<div class="fc-resizer"/>' :
					''
					) +
			'</a>';
	},


	// Given a row # and an array of segments all in the same row, render a <tbody> element, a skeleton that contains
	// the segments. Returns object with a bunch of internal data about how the render was calculated.
	renderSegRow: function(row, rowSegs) {
		var view = this.view;
		var colCnt = view.colCnt;
		var segLevels = this.buildSegLevels(rowSegs); // group into sub-arrays of levels
		var levelCnt = Math.max(1, segLevels.length); // ensure at least one level
		var tbody = $('<tbody/>');
		var segMatrix = []; // lookup for which segments are rendered into which level+col cells
		var cellMatrix = []; // lookup for all <td> elements of the level+col matrix
		var loneCellMatrix = []; // lookup for <td> elements that only take up a single column
		var i, levelSegs;
		var col;
		var tr;
		var j, seg;
		var td;

		// populates empty cells from the current column (`col`) to `endCol`
		function emptyCellsUntil(endCol) {
			while (col < endCol) {
				// try to grab a cell from the level above and extend its rowspan. otherwise, create a fresh cell
				td = (loneCellMatrix[i - 1] || [])[col];
				if (td) {
					td.attr(
						'rowspan',
						parseInt(td.attr('rowspan') || 1, 10) + 1
					);
				}
				else {
					td = $('<td/>');
					tr.append(td);
				}
				cellMatrix[i][col] = td;
				loneCellMatrix[i][col] = td;
				col++;
			}
		}

		for (i = 0; i < levelCnt; i++) { // iterate through all levels
			levelSegs = segLevels[i];
			col = 0;
			tr = $('<tr/>');

			segMatrix.push([]);
			cellMatrix.push([]);
			loneCellMatrix.push([]);

			// levelCnt might be 1 even though there are no actual levels. protect against this.
			// this single empty row is useful for styling.
			if (levelSegs) {
				for (j = 0; j < levelSegs.length; j++) { // iterate through segments in level
					seg = levelSegs[j];

					emptyCellsUntil(seg.leftCol);

					// create a container that occupies or more columns. append the event element.
					td = $('<td class="fc-event-container"/>').append(seg.el);
					if (seg.leftCol != seg.rightCol) {
						td.attr('colspan', seg.rightCol - seg.leftCol + 1);
					}
					else { // a single-column segment
						loneCellMatrix[i][col] = td;
					}

					while (col <= seg.rightCol) {
						cellMatrix[i][col] = td;
						segMatrix[i][col] = seg;
						col++;
					}

					tr.append(td);
				}
			}

			emptyCellsUntil(colCnt); // finish off the row
			this.bookendCells(tr, 'eventSkeleton');
			tbody.append(tr);
		}

		return { // a "rowStruct"
			row: row, // the row number
			tbodyEl: tbody,
			cellMatrix: cellMatrix,
			segMatrix: segMatrix,
			segLevels: segLevels,
			segs: rowSegs
		};
	},


	// Stacks a flat array of segments, which are all assumed to be in the same row, into subarrays of vertical levels.
	buildSegLevels: function(segs) {
		var levels = [];
		var i, seg;
		var j;

		// Give preference to elements with certain criteria, so they have
		// a chance to be closer to the top.
		segs.sort(compareSegs);
		
		for (i = 0; i < segs.length; i++) {
			seg = segs[i];

			// loop through levels, starting with the topmost, until the segment doesn't collide with other segments
			for (j = 0; j < levels.length; j++) {
				if (!isDaySegCollision(seg, levels[j])) {
					break;
				}
			}
			// `j` now holds the desired subrow index
			seg.level = j;

			// create new level array if needed and append segment
			(levels[j] || (levels[j] = [])).push(seg);
		}

		// order segments left-to-right. very important if calendar is RTL
		for (j = 0; j < levels.length; j++) {
			levels[j].sort(compareDaySegCols);
		}

		return levels;
	},


	// Given a flat array of segments, return an array of sub-arrays, grouped by each segment's row
	groupSegRows: function(segs) {
		var view = this.view;
		var segRows = [];
		var i;

		for (i = 0; i < view.rowCnt; i++) {
			segRows.push([]);
		}

		for (i = 0; i < segs.length; i++) {
			segRows[segs[i].row].push(segs[i]);
		}

		return segRows;
	}

});


// Computes whether two segments' columns collide. They are assumed to be in the same row.
function isDaySegCollision(seg, otherSegs) {
	var i, otherSeg;

	for (i = 0; i < otherSegs.length; i++) {
		otherSeg = otherSegs[i];

		if (
			otherSeg.leftCol <= seg.rightCol &&
			otherSeg.rightCol >= seg.leftCol
		) {
			return true;
		}
	}

	return false;
}


// A cmp function for determining the leftmost event
function compareDaySegCols(a, b) {
	return a.leftCol - b.leftCol;
}

;;

/* Methods relate to limiting the number events for a given day on a DayGrid
----------------------------------------------------------------------------------------------------------------------*/
// NOTE: all the segs being passed around in here are foreground segs

$.extend(DayGrid.prototype, {


	segPopover: null, // the Popover that holds events that can't fit in a cell. null when not visible
	popoverSegs: null, // an array of segment objects that the segPopover holds. null when not visible


	destroySegPopover: function() {
		if (this.segPopover) {
			this.segPopover.hide(); // will trigger destruction of `segPopover` and `popoverSegs`
		}
	},


	// Limits the number of "levels" (vertically stacking layers of events) for each row of the grid.
	// `levelLimit` can be false (don't limit), a number, or true (should be computed).
	limitRows: function(levelLimit) {
		var rowStructs = this.rowStructs || [];
		var row; // row #
		var rowLevelLimit;

		for (row = 0; row < rowStructs.length; row++) {
			this.unlimitRow(row);

			if (!levelLimit) {
				rowLevelLimit = false;
			}
			else if (typeof levelLimit === 'number') {
				rowLevelLimit = levelLimit;
			}
			else {
				rowLevelLimit = this.computeRowLevelLimit(row);
			}

			if (rowLevelLimit !== false) {
				this.limitRow(row, rowLevelLimit);
			}
		}
	},


	// Computes the number of levels a row will accomodate without going outside its bounds.
	// Assumes the row is "rigid" (maintains a constant height regardless of what is inside).
	// `row` is the row number.
	computeRowLevelLimit: function(row) {
		var rowEl = this.rowEls.eq(row); // the containing "fake" row div
		var rowHeight = rowEl.height(); // TODO: cache somehow?
		var trEls = this.rowStructs[row].tbodyEl.children();
		var i, trEl;

		// Reveal one level <tr> at a time and stop when we find one out of bounds
		for (i = 0; i < trEls.length; i++) {
			trEl = trEls.eq(i).removeClass('fc-limited'); // get and reveal
			if (trEl.position().top + trEl.outerHeight() > rowHeight) {
				return i;
			}
		}

		return false; // should not limit at all
	},


	// Limits the given grid row to the maximum number of levels and injects "more" links if necessary.
	// `row` is the row number.
	// `levelLimit` is a number for the maximum (inclusive) number of levels allowed.
	limitRow: function(row, levelLimit) {
		var _this = this;
		var view = this.view;
		var rowStruct = this.rowStructs[row];
		var moreNodes = []; // array of "more" <a> links and <td> DOM nodes
		var col = 0; // col #
		var cell;
		var levelSegs; // array of segment objects in the last allowable level, ordered left-to-right
		var cellMatrix; // a matrix (by level, then column) of all <td> jQuery elements in the row
		var limitedNodes; // array of temporarily hidden level <tr> and segment <td> DOM nodes
		var i, seg;
		var segsBelow; // array of segment objects below `seg` in the current `col`
		var totalSegsBelow; // total number of segments below `seg` in any of the columns `seg` occupies
		var colSegsBelow; // array of segment arrays, below seg, one for each column (offset from segs's first column)
		var td, rowspan;
		var segMoreNodes; // array of "more" <td> cells that will stand-in for the current seg's cell
		var j;
		var moreTd, moreWrap, moreLink;

		// Iterates through empty level cells and places "more" links inside if need be
		function emptyCellsUntil(endCol) { // goes from current `col` to `endCol`
			while (col < endCol) {
				cell = { row: row, col: col };
				segsBelow = _this.getCellSegs(cell, levelLimit);
				if (segsBelow.length) {
					td = cellMatrix[levelLimit - 1][col];
					moreLink = _this.renderMoreLink(cell, segsBelow);
					moreWrap = $('<div/>').append(moreLink);
					td.append(moreWrap);
					moreNodes.push(moreWrap[0]);
				}
				col++;
			}
		}

		if (levelLimit && levelLimit < rowStruct.segLevels.length) { // is it actually over the limit?
			levelSegs = rowStruct.segLevels[levelLimit - 1];
			cellMatrix = rowStruct.cellMatrix;

			limitedNodes = rowStruct.tbodyEl.children().slice(levelLimit) // get level <tr> elements past the limit
				.addClass('fc-limited').get(); // hide elements and get a simple DOM-nodes array

			// iterate though segments in the last allowable level
			for (i = 0; i < levelSegs.length; i++) {
				seg = levelSegs[i];
				emptyCellsUntil(seg.leftCol); // process empty cells before the segment

				// determine *all* segments below `seg` that occupy the same columns
				colSegsBelow = [];
				totalSegsBelow = 0;
				while (col <= seg.rightCol) {
					cell = { row: row, col: col };
					segsBelow = this.getCellSegs(cell, levelLimit);
					colSegsBelow.push(segsBelow);
					totalSegsBelow += segsBelow.length;
					col++;
				}

				if (totalSegsBelow) { // do we need to replace this segment with one or many "more" links?
					td = cellMatrix[levelLimit - 1][seg.leftCol]; // the segment's parent cell
					rowspan = td.attr('rowspan') || 1;
					segMoreNodes = [];

					// make a replacement <td> for each column the segment occupies. will be one for each colspan
					for (j = 0; j < colSegsBelow.length; j++) {
						moreTd = $('<td class="fc-more-cell"/>').attr('rowspan', rowspan);
						segsBelow = colSegsBelow[j];
						cell = { row: row, col: seg.leftCol + j };
						moreLink = this.renderMoreLink(cell, [ seg ].concat(segsBelow)); // count seg as hidden too
						moreWrap = $('<div/>').append(moreLink);
						moreTd.append(moreWrap);
						segMoreNodes.push(moreTd[0]);
						moreNodes.push(moreTd[0]);
					}

					td.addClass('fc-limited').after($(segMoreNodes)); // hide original <td> and inject replacements
					limitedNodes.push(td[0]);
				}
			}

			emptyCellsUntil(view.colCnt); // finish off the level
			rowStruct.moreEls = $(moreNodes); // for easy undoing later
			rowStruct.limitedEls = $(limitedNodes); // for easy undoing later
		}
	},


	// Reveals all levels and removes all "more"-related elements for a grid's row.
	// `row` is a row number.
	unlimitRow: function(row) {
		var rowStruct = this.rowStructs[row];

		if (rowStruct.moreEls) {
			rowStruct.moreEls.remove();
			rowStruct.moreEls = null;
		}

		if (rowStruct.limitedEls) {
			rowStruct.limitedEls.removeClass('fc-limited');
			rowStruct.limitedEls = null;
		}
	},


	// Renders an <a> element that represents hidden event element for a cell.
	// Responsible for attaching click handler as well.
	renderMoreLink: function(cell, hiddenSegs) {
		var _this = this;
		var view = this.view;

		return $('<a class="fc-more"/>')
			.text(
				this.getMoreLinkText(hiddenSegs.length)
			)
			.on('click', function(ev) {
				var clickOption = view.opt('eventLimitClick');
				var date = view.cellToDate(cell);
				var moreEl = $(this);
				var dayEl = _this.getCellDayEl(cell);
				var allSegs = _this.getCellSegs(cell);

				// rescope the segments to be within the cell's date
				var reslicedAllSegs = _this.resliceDaySegs(allSegs, date);
				var reslicedHiddenSegs = _this.resliceDaySegs(hiddenSegs, date);

				if (typeof clickOption === 'function') {
					// the returned value can be an atomic option
					clickOption = view.trigger('eventLimitClick', null, {
						date: date,
						dayEl: dayEl,
						moreEl: moreEl,
						segs: reslicedAllSegs,
						hiddenSegs: reslicedHiddenSegs
					}, ev);
				}

				if (clickOption === 'popover') {
					_this.showSegPopover(date, cell, moreEl, reslicedAllSegs);
				}
				else if (typeof clickOption === 'string') { // a view name
					view.calendar.zoomTo(date, clickOption);
				}
			});
	},


	// Reveals the popover that displays all events within a cell
	showSegPopover: function(date, cell, moreLink, segs) {
		var _this = this;
		var view = this.view;
		var moreWrap = moreLink.parent(); // the <div> wrapper around the <a>
		var topEl; // the element we want to match the top coordinate of
		var options;

		if (view.rowCnt == 1) {
			topEl = this.view.el; // will cause the popover to cover any sort of header
		}
		else {
			topEl = this.rowEls.eq(cell.row); // will align with top of row
		}

		options = {
			className: 'fc-more-popover',
			content: this.renderSegPopoverContent(date, segs),
			parentEl: this.el,
			top: topEl.offset().top,
			autoHide: true, // when the user clicks elsewhere, hide the popover
			viewportConstrain: view.opt('popoverViewportConstrain'),
			hide: function() {
				// destroy everything when the popover is hidden
				_this.segPopover.destroy();
				_this.segPopover = null;
				_this.popoverSegs = null;
			}
		};

		// Determine horizontal coordinate.
		// We use the moreWrap instead of the <td> to avoid border confusion.
		if (view.opt('isRTL')) {
			options.right = moreWrap.offset().left + moreWrap.outerWidth() + 1; // +1 to be over cell border
		}
		else {
			options.left = moreWrap.offset().left - 1; // -1 to be over cell border
		}

		this.segPopover = new Popover(options);
		this.segPopover.show();
	},


	// Builds the inner DOM contents of the segment popover
	renderSegPopoverContent: function(date, segs) {
		var view = this.view;
		var isTheme = view.opt('theme');
		var title = date.format(view.opt('dayPopoverFormat'));
		var content = $(
			'<div class="fc-header ' + view.widgetHeaderClass + '">' +
				'<span class="fc-close ' +
					(isTheme ? 'ui-icon ui-icon-closethick' : 'fc-icon fc-icon-x') +
				'"></span>' +
				'<span class="fc-title">' +
					htmlEscape(title) +
				'</span>' +
				'<div class="fc-clear"/>' +
			'</div>' +
			'<div class="fc-body ' + view.widgetContentClass + '">' +
				'<div class="fc-event-container"></div>' +
			'</div>'
		);
		var segContainer = content.find('.fc-event-container');
		var i;

		// render each seg's `el` and only return the visible segs
		segs = this.renderFgSegEls(segs, true); // disableResizing=true
		this.popoverSegs = segs;

		for (i = 0; i < segs.length; i++) {

			// because segments in the popover are not part of a grid coordinate system, provide a hint to any
			// grids that want to do drag-n-drop about which cell it came from
			segs[i].cellDate = date;

			segContainer.append(segs[i].el);
		}

		return content;
	},


	// Given the events within an array of segment objects, reslice them to be in a single day
	resliceDaySegs: function(segs, dayDate) {

		// build an array of the original events
		var events = $.map(segs, function(seg) {
			return seg.event;
		});

		var dayStart = dayDate.clone().stripTime();
		var dayEnd = dayStart.clone().add(1, 'days');

		// slice the events with a custom slicing function
		return this.eventsToSegs(
			events,
			function(rangeStart, rangeEnd) {
				var seg = intersectionToSeg(rangeStart, rangeEnd, dayStart, dayEnd); // if no intersection, undefined
				return seg ? [ seg ] : []; // must return an array of segments
			}
		);
	},


	// Generates the text that should be inside a "more" link, given the number of events it represents
	getMoreLinkText: function(num) {
		var view = this.view;
		var opt = view.opt('eventLimitText');

		if (typeof opt === 'function') {
			return opt(num);
		}
		else {
			return '+' + num + ' ' + opt;
		}
	},


	// Returns segments within a given cell.
	// If `startLevel` is specified, returns only events including and below that level. Otherwise returns all segs.
	getCellSegs: function(cell, startLevel) {
		var segMatrix = this.rowStructs[cell.row].segMatrix;
		var level = startLevel || 0;
		var segs = [];
		var seg;

		while (level < segMatrix.length) {
			seg = segMatrix[level][cell.col];
			if (seg) {
				segs.push(seg);
			}
			level++;
		}

		return segs;
	}

});

;;

/* A component that renders one or more columns of vertical time slots
----------------------------------------------------------------------------------------------------------------------*/

function TimeGrid(view) {
	Grid.call(this, view); // call the super-constructor
}


TimeGrid.prototype = createObject(Grid.prototype); // define the super-class
$.extend(TimeGrid.prototype, {

	slotDuration: null, // duration of a "slot", a distinct time segment on given day, visualized by lines
	snapDuration: null, // granularity of time for dragging and selecting

	minTime: null, // Duration object that denotes the first visible time of any given day
	maxTime: null, // Duration object that denotes the exclusive visible end time of any given day

	dayEls: null, // cells elements in the day-row background
	slatEls: null, // elements running horizontally across all columns

	slatTops: null, // an array of top positions, relative to the container. last item holds bottom of last slot

	helperEl: null, // cell skeleton element for rendering the mock event "helper"

	businessHourSegs: null,


	// Renders the time grid into `this.el`, which should already be assigned.
	// Relies on the view's colCnt. In the future, this component should probably be self-sufficient.
	render: function() {
		this.processOptions();

		this.el.html(this.renderHtml());

		this.dayEls = this.el.find('.fc-day');
		this.slatEls = this.el.find('.fc-slats tr');

		this.computeSlatTops();

		this.renderBusinessHours();

		Grid.prototype.render.call(this); // call the super-method
	},


	renderBusinessHours: function() {
		var events = this.view.calendar.getBusinessHoursEvents();
		this.businessHourSegs = this.renderFill('businessHours', this.eventsToSegs(events), 'bgevent');
	},


	// Renders the basic HTML skeleton for the grid
	renderHtml: function() {
		return '' +
			'<div class="fc-bg">' +
				'<table>' +
					this.rowHtml('slotBg') + // leverages RowRenderer, which will call slotBgCellHtml
				'</table>' +
			'</div>' +
			'<div class="fc-slats">' +
				'<table>' +
					this.slatRowHtml() +
				'</table>' +
			'</div>';
	},


	// Renders the HTML for a vertical background cell behind the slots.
	// This method is distinct from 'bg' because we wanted a new `rowType` so the View could customize the rendering.
	slotBgCellHtml: function(row, col, date) {
		return this.bgCellHtml(row, col, date);
	},


	// Generates the HTML for the horizontal "slats" that run width-wise. Has a time axis on a side. Depends on RTL.
	slatRowHtml: function() {
		var view = this.view;
		var calendar = view.calendar;
		var isRTL = view.opt('isRTL');
		var html = '';
		var slotNormal = this.slotDuration.asMinutes() % 15 === 0;
		var slotTime = moment.duration(+this.minTime); // wish there was .clone() for durations
		var slotDate; // will be on the view's first day, but we only care about its time
		var minutes;
		var axisHtml;

		// Calculate the time for each slot
		while (slotTime < this.maxTime) {
			slotDate = view.start.clone().time(slotTime); // will be in UTC but that's good. to avoid DST issues
			minutes = slotDate.minutes();

			axisHtml =
				'<td class="fc-axis fc-time ' + view.widgetContentClass + '" ' + view.axisStyleAttr() + '>' +
					((!slotNormal || !minutes) ? // if irregular slot duration, or on the hour, then display the time
						'<span>' + // for matchCellWidths
							htmlEscape(calendar.formatDate(slotDate, view.opt('axisFormat'))) +
						'</span>' :
						''
						) +
				'</td>';

			html +=
				'<tr ' + (!minutes ? '' : 'class="fc-minor"') + '>' +
					(!isRTL ? axisHtml : '') +
					'<td class="' + view.widgetContentClass + '"/>' +
					(isRTL ? axisHtml : '') +
				"</tr>";

			slotTime.add(this.slotDuration);
		}

		return html;
	},


	// Parses various options into properties of this object
	processOptions: function() {
		var view = this.view;
		var slotDuration = view.opt('slotDuration');
		var snapDuration = view.opt('snapDuration');

		slotDuration = moment.duration(slotDuration);
		snapDuration = snapDuration ? moment.duration(snapDuration) : slotDuration;

		this.slotDuration = slotDuration;
		this.snapDuration = snapDuration;
		this.cellDuration = snapDuration; // important to assign this for Grid.events.js

		this.minTime = moment.duration(view.opt('minTime'));
		this.maxTime = moment.duration(view.opt('maxTime'));
	},


	// Slices up a date range into a segment for each column
	rangeToSegs: function(rangeStart, rangeEnd) {
		var view = this.view;
		var segs = [];
		var seg;
		var col;
		var cellDate;
		var colStart, colEnd;

		// normalize
		rangeStart = rangeStart.clone().stripZone();
		rangeEnd = rangeEnd.clone().stripZone();

		for (col = 0; col < view.colCnt; col++) {
			cellDate = view.cellToDate(0, col); // use the View's cell system for this
			colStart = cellDate.clone().time(this.minTime);
			colEnd = cellDate.clone().time(this.maxTime);
			seg = intersectionToSeg(rangeStart, rangeEnd, colStart, colEnd);
			if (seg) {
				seg.col = col;
				segs.push(seg);
			}
		}

		return segs;
	},


	/* Coordinates
	------------------------------------------------------------------------------------------------------------------*/


	// Called when there is a window resize/zoom and we need to recalculate coordinates for the grid
	resize: function() {
		this.computeSlatTops();
		this.updateSegVerticals();
	},


	// Populates the given empty `rows` and `cols` arrays with offset positions of the "snap" cells.
	// "Snap" cells are different the slots because they might have finer granularity.
	buildCoords: function(rows, cols) {
		var colCnt = this.view.colCnt;
		var originTop = this.el.offset().top;
		var snapTime = moment.duration(+this.minTime);
		var p = null;
		var e, n;

		this.dayEls.slice(0, colCnt).each(function(i, _e) {
			e = $(_e);
			n = e.offset().left;
			if (p) {
				p[1] = n;
			}
			p = [ n ];
			cols[i] = p;
		});
		p[1] = n + e.outerWidth();

		p = null;
		while (snapTime < this.maxTime) {
			n = originTop + this.computeTimeTop(snapTime);
			if (p) {
				p[1] = n;
			}
			p = [ n ];
			rows.push(p);
			snapTime.add(this.snapDuration);
		}
		p[1] = originTop + this.computeTimeTop(snapTime); // the position of the exclusive end
	},


	// Gets the datetime for the given slot cell
	getCellDate: function(cell) {
		var view = this.view;
		var calendar = view.calendar;

		return calendar.rezoneDate( // since we are adding a time, it needs to be in the calendar's timezone
			view.cellToDate(0, cell.col) // View's coord system only accounts for start-of-day for column
				.time(this.minTime + this.snapDuration * cell.row)
		);
	},


	// Gets the element that represents the whole-day the cell resides on
	getCellDayEl: function(cell) {
		return this.dayEls.eq(cell.col);
	},


	// Computes the top coordinate, relative to the bounds of the grid, of the given date.
	// A `startOfDayDate` must be given for avoiding ambiguity over how to treat midnight.
	computeDateTop: function(date, startOfDayDate) {
		return this.computeTimeTop(
			moment.duration(
				date.clone().stripZone() - startOfDayDate.clone().stripTime()
			)
		);
	},


	// Computes the top coordinate, relative to the bounds of the grid, of the given time (a Duration).
	computeTimeTop: function(time) {
		var slatCoverage = (time - this.minTime) / this.slotDuration; // floating-point value of # of slots covered
		var slatIndex;
		var slatRemainder;
		var slatTop;
		var slatBottom;

		// constrain. because minTime/maxTime might be customized
		slatCoverage = Math.max(0, slatCoverage);
		slatCoverage = Math.min(this.slatEls.length, slatCoverage);

		slatIndex = Math.floor(slatCoverage); // an integer index of the furthest whole slot
		slatRemainder = slatCoverage - slatIndex;
		slatTop = this.slatTops[slatIndex]; // the top position of the furthest whole slot

		if (slatRemainder) { // time spans part-way into the slot
			slatBottom = this.slatTops[slatIndex + 1];
			return slatTop + (slatBottom - slatTop) * slatRemainder; // part-way between slots
		}
		else {
			return slatTop;
		}
	},


	// Queries each `slatEl` for its position relative to the grid's container and stores it in `slatTops`.
	// Includes the the bottom of the last slat as the last item in the array.
	computeSlatTops: function() {
		var tops = [];
		var top;

		this.slatEls.each(function(i, node) {
			top = $(node).position().top;
			tops.push(top);
		});

		tops.push(top + this.slatEls.last().outerHeight()); // bottom of the last slat

		this.slatTops = tops;
	},


	/* Event Drag Visualization
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of an event being dragged over the specified date(s).
	// `end` and `seg` can be null. See View's documentation on renderDrag for more info.
	renderDrag: function(start, end, seg) {
		var opacity;

		if (seg) { // if there is event information for this drag, render a helper event
			this.renderRangeHelper(start, end, seg);

			opacity = this.view.opt('dragOpacity');
			if (opacity !== undefined) {
				this.helperEl.css('opacity', opacity);
			}

			return true; // signal that a helper has been rendered
		}
		else {
			// otherwise, just render a highlight
			this.renderHighlight(
				start,
				end || this.view.calendar.getDefaultEventEnd(false, start)
			);
		}
	},


	// Unrenders any visual indication of an event being dragged
	destroyDrag: function() {
		this.destroyHelper();
		this.destroyHighlight();
	},


	/* Event Resize Visualization
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of an event being resized
	renderResize: function(start, end, seg) {
		this.renderRangeHelper(start, end, seg);
	},


	// Unrenders any visual indication of an event being resized
	destroyResize: function() {
		this.destroyHelper();
	},


	/* Event Helper
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a mock "helper" event. `sourceSeg` is the original segment object and might be null (an external drag)
	renderHelper: function(event, sourceSeg) {
		var segs = this.eventsToSegs([ event ]);
		var tableEl;
		var i, seg;
		var sourceEl;

		segs = this.renderFgSegEls(segs); // assigns each seg's el and returns a subset of segs that were rendered
		tableEl = this.renderSegTable(segs);

		// Try to make the segment that is in the same row as sourceSeg look the same
		for (i = 0; i < segs.length; i++) {
			seg = segs[i];
			if (sourceSeg && sourceSeg.col === seg.col) {
				sourceEl = sourceSeg.el;
				seg.el.css({
					left: sourceEl.css('left'),
					right: sourceEl.css('right'),
					'margin-left': sourceEl.css('margin-left'),
					'margin-right': sourceEl.css('margin-right')
				});
			}
		}

		this.helperEl = $('<div class="fc-helper-skeleton"/>')
			.append(tableEl)
				.appendTo(this.el);
	},


	// Unrenders any mock helper event
	destroyHelper: function() {
		if (this.helperEl) {
			this.helperEl.remove();
			this.helperEl = null;
		}
	},


	/* Selection
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of a selection. Overrides the default, which was to simply render a highlight.
	renderSelection: function(start, end) {
		if (this.view.opt('selectHelper')) { // this setting signals that a mock helper event should be rendered
			this.renderRangeHelper(start, end);
		}
		else {
			this.renderHighlight(start, end);
		}
	},


	// Unrenders any visual indication of a selection
	destroySelection: function() {
		this.destroyHelper();
		this.destroyHighlight();
	},


	/* Fill System (highlight, background events, business hours)
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a set of rectangles over the given time segments.
	// Only returns segments that successfully rendered.
	renderFill: function(type, segs, className) {
		var view = this.view;
		var segCols;
		var skeletonEl;
		var trEl;
		var col, colSegs;
		var tdEl;
		var containerEl;
		var dayDate;
		var i, seg;

		if (segs.length) {

			segs = this.renderFillSegEls(type, segs); // assignes `.el` to each seg. returns successfully rendered segs
			segCols = this.groupSegCols(segs); // group into sub-arrays, and assigns 'col' to each seg

			className = className || type.toLowerCase();
			skeletonEl = $(
				'<div class="fc-' + className + '-skeleton">' +
					'<table><tr/></table>' +
				'</div>'
			);
			trEl = skeletonEl.find('tr');

			for (col = 0; col < segCols.length; col++) {
				colSegs = segCols[col];
				tdEl = $('<td/>').appendTo(trEl);

				if (colSegs.length) {
					containerEl = $('<div class="fc-' + className + '-container"/>').appendTo(tdEl);
					dayDate = view.cellToDate(0, col);

					for (i = 0; i < colSegs.length; i++) {
						seg = colSegs[i];
						containerEl.append(
							seg.el.css({
								top: this.computeDateTop(seg.start, dayDate),
								bottom: -this.computeDateTop(seg.end, dayDate) // the y position of the bottom edge
							})
						);
					}
				}
			}

			this.bookendCells(trEl, type);

			this.el.append(skeletonEl);
			this.elsByFill[type] = skeletonEl;
		}

		return segs;
	}

});

;;

/* Event-rendering methods for the TimeGrid class
----------------------------------------------------------------------------------------------------------------------*/

$.extend(TimeGrid.prototype, {

	eventSkeletonEl: null, // has cells with event-containers, which contain absolutely positioned event elements


	// Renders the given foreground event segments onto the grid
	renderFgSegs: function(segs) {
		segs = this.renderFgSegEls(segs); // returns a subset of the segs. segs that were actually rendered

		this.el.append(
			this.eventSkeletonEl = $('<div class="fc-content-skeleton"/>')
				.append(this.renderSegTable(segs))
		);

		return segs; // return only the segs that were actually rendered
	},


	// Unrenders all currently rendered foreground event segments
	destroyFgSegs: function(segs) {
		if (this.eventSkeletonEl) {
			this.eventSkeletonEl.remove();
			this.eventSkeletonEl = null;
		}
	},


	// Renders and returns the <table> portion of the event-skeleton.
	// Returns an object with properties 'tbodyEl' and 'segs'.
	renderSegTable: function(segs) {
		var tableEl = $('<table><tr/></table>');
		var trEl = tableEl.find('tr');
		var segCols;
		var i, seg;
		var col, colSegs;
		var containerEl;

		segCols = this.groupSegCols(segs); // group into sub-arrays, and assigns 'col' to each seg

		this.computeSegVerticals(segs); // compute and assign top/bottom

		for (col = 0; col < segCols.length; col++) { // iterate each column grouping
			colSegs = segCols[col];
			placeSlotSegs(colSegs); // compute horizontal coordinates, z-index's, and reorder the array

			containerEl = $('<div class="fc-event-container"/>');

			// assign positioning CSS and insert into container
			for (i = 0; i < colSegs.length; i++) {
				seg = colSegs[i];
				seg.el.css(this.generateSegPositionCss(seg));

				// if the height is short, add a className for alternate styling
				if (seg.bottom - seg.top < 30) {
					seg.el.addClass('fc-short');
				}

				containerEl.append(seg.el);
			}

			trEl.append($('<td/>').append(containerEl));
		}

		this.bookendCells(trEl, 'eventSkeleton');

		return tableEl;
	},


	// Refreshes the CSS top/bottom coordinates for each segment element. Probably after a window resize/zoom.
	// Repositions business hours segs too, so not just for events. Maybe shouldn't be here.
	updateSegVerticals: function() {
		var allSegs = (this.segs || []).concat(this.businessHourSegs || []);
		var i;

		this.computeSegVerticals(allSegs);

		for (i = 0; i < allSegs.length; i++) {
			allSegs[i].el.css(
				this.generateSegVerticalCss(allSegs[i])
			);
		}
	},


	// For each segment in an array, computes and assigns its top and bottom properties
	computeSegVerticals: function(segs) {
		var i, seg;

		for (i = 0; i < segs.length; i++) {
			seg = segs[i];
			seg.top = this.computeDateTop(seg.start, seg.start);
			seg.bottom = this.computeDateTop(seg.end, seg.start);
		}
	},


	// Renders the HTML for a single event segment's default rendering
	fgSegHtml: function(seg, disableResizing) {
		var view = this.view;
		var event = seg.event;
		var isDraggable = view.isEventDraggable(event);
		var isResizable = !disableResizing && seg.isEnd && view.isEventResizable(event);
		var classes = this.getSegClasses(seg, isDraggable, isResizable);
		var skinCss = this.getEventSkinCss(event);
		var timeText;
		var fullTimeText; // more verbose time text. for the print stylesheet
		var startTimeText; // just the start time text

		classes.unshift('fc-time-grid-event');

		if (view.isMultiDayEvent(event)) { // if the event appears to span more than one day...
			// Don't display time text on segments that run entirely through a day.
			// That would appear as midnight-midnight and would look dumb.
			// Otherwise, display the time text for the *segment's* times (like 6pm-midnight or midnight-10am)
			if (seg.isStart || seg.isEnd) {
				timeText = view.getEventTimeText(seg.start, seg.end);
				fullTimeText = view.getEventTimeText(seg.start, seg.end, 'LT');
				startTimeText = view.getEventTimeText(seg.start, null);
			}
		} else {
			// Display the normal time text for the *event's* times
			timeText = view.getEventTimeText(event);
			fullTimeText = view.getEventTimeText(event, 'LT');
			startTimeText = view.getEventTimeText(event.start, null);
		}

		return '<a class="' + classes.join(' ') + '"' +
			(event.url ?
				' href="' + htmlEscape(event.url) + '"' :
				''
				) +
			(skinCss ?
				' style="' + skinCss + '"' :
				''
				) +
			'>' +
				'<div class="fc-content">' +
					(timeText ?
						'<div class="fc-time"' +
						' data-start="' + htmlEscape(startTimeText) + '"' +
						' data-full="' + htmlEscape(fullTimeText) + '"' +
						'>' +
							'<span>' + htmlEscape(timeText) + '</span>' +
						'</div>' :
						''
						) +
					(event.title ?
						'<div class="fc-title">' +
							htmlEscape(event.title) +
						'</div>' :
						''
						) +
				'</div>' +
				'<div class="fc-bg"/>' +
				(isResizable ?
					'<div class="fc-resizer"/>' :
					''
					) +
			'</a>';
	},


	// Generates an object with CSS properties/values that should be applied to an event segment element.
	// Contains important positioning-related properties that should be applied to any event element, customized or not.
	generateSegPositionCss: function(seg) {
		var view = this.view;
		var isRTL = view.opt('isRTL');
		var shouldOverlap = view.opt('slotEventOverlap');
		var backwardCoord = seg.backwardCoord; // the left side if LTR. the right side if RTL. floating-point
		var forwardCoord = seg.forwardCoord; // the right side if LTR. the left side if RTL. floating-point
		var props = this.generateSegVerticalCss(seg); // get top/bottom first
		var left; // amount of space from left edge, a fraction of the total width
		var right; // amount of space from right edge, a fraction of the total width

		if (shouldOverlap) {
			// double the width, but don't go beyond the maximum forward coordinate (1.0)
			forwardCoord = Math.min(1, backwardCoord + (forwardCoord - backwardCoord) * 2);
		}

		if (isRTL) {
			left = 1 - forwardCoord;
			right = backwardCoord;
		}
		else {
			left = backwardCoord;
			right = 1 - forwardCoord;
		}

		props.zIndex = seg.level + 1; // convert from 0-base to 1-based
		props.left = left * 100 + '%';
		props.right = right * 100 + '%';

		if (shouldOverlap && seg.forwardPressure) {
			// add padding to the edge so that forward stacked events don't cover the resizer's icon
			props[isRTL ? 'marginLeft' : 'marginRight'] = 10 * 2; // 10 is a guesstimate of the icon's width 
		}

		return props;
	},


	// Generates an object with CSS properties for the top/bottom coordinates of a segment element
	generateSegVerticalCss: function(seg) {
		return {
			top: seg.top,
			bottom: -seg.bottom // flipped because needs to be space beyond bottom edge of event container
		};
	},


	// Given a flat array of segments, return an array of sub-arrays, grouped by each segment's col
	groupSegCols: function(segs) {
		var view = this.view;
		var segCols = [];
		var i;

		for (i = 0; i < view.colCnt; i++) {
			segCols.push([]);
		}

		for (i = 0; i < segs.length; i++) {
			segCols[segs[i].col].push(segs[i]);
		}

		return segCols;
	}

});


// Given an array of segments that are all in the same column, sets the backwardCoord and forwardCoord on each.
// Also reorders the given array by date!
function placeSlotSegs(segs) {
	var levels;
	var level0;
	var i;

	segs.sort(compareSegs); // order by date
	levels = buildSlotSegLevels(segs);
	computeForwardSlotSegs(levels);

	if ((level0 = levels[0])) {

		for (i = 0; i < level0.length; i++) {
			computeSlotSegPressures(level0[i]);
		}

		for (i = 0; i < level0.length; i++) {
			computeSlotSegCoords(level0[i], 0, 0);
		}
	}
}


// Builds an array of segments "levels". The first level will be the leftmost tier of segments if the calendar is
// left-to-right, or the rightmost if the calendar is right-to-left. Assumes the segments are already ordered by date.
function buildSlotSegLevels(segs) {
	var levels = [];
	var i, seg;
	var j;

	for (i=0; i<segs.length; i++) {
		seg = segs[i];

		// go through all the levels and stop on the first level where there are no collisions
		for (j=0; j<levels.length; j++) {
			if (!computeSlotSegCollisions(seg, levels[j]).length) {
				break;
			}
		}

		seg.level = j;

		(levels[j] || (levels[j] = [])).push(seg);
	}

	return levels;
}


// For every segment, figure out the other segments that are in subsequent
// levels that also occupy the same vertical space. Accumulate in seg.forwardSegs
function computeForwardSlotSegs(levels) {
	var i, level;
	var j, seg;
	var k;

	for (i=0; i<levels.length; i++) {
		level = levels[i];

		for (j=0; j<level.length; j++) {
			seg = level[j];

			seg.forwardSegs = [];
			for (k=i+1; k<levels.length; k++) {
				computeSlotSegCollisions(seg, levels[k], seg.forwardSegs);
			}
		}
	}
}


// Figure out which path forward (via seg.forwardSegs) results in the longest path until
// the furthest edge is reached. The number of segments in this path will be seg.forwardPressure
function computeSlotSegPressures(seg) {
	var forwardSegs = seg.forwardSegs;
	var forwardPressure = 0;
	var i, forwardSeg;

	if (seg.forwardPressure === undefined) { // not already computed

		for (i=0; i<forwardSegs.length; i++) {
			forwardSeg = forwardSegs[i];

			// figure out the child's maximum forward path
			computeSlotSegPressures(forwardSeg);

			// either use the existing maximum, or use the child's forward pressure
			// plus one (for the forwardSeg itself)
			forwardPressure = Math.max(
				forwardPressure,
				1 + forwardSeg.forwardPressure
			);
		}

		seg.forwardPressure = forwardPressure;
	}
}


// Calculate seg.forwardCoord and seg.backwardCoord for the segment, where both values range
// from 0 to 1. If the calendar is left-to-right, the seg.backwardCoord maps to "left" and
// seg.forwardCoord maps to "right" (via percentage). Vice-versa if the calendar is right-to-left.
//
// The segment might be part of a "series", which means consecutive segments with the same pressure
// who's width is unknown until an edge has been hit. `seriesBackwardPressure` is the number of
// segments behind this one in the current series, and `seriesBackwardCoord` is the starting
// coordinate of the first segment in the series.
function computeSlotSegCoords(seg, seriesBackwardPressure, seriesBackwardCoord) {
	var forwardSegs = seg.forwardSegs;
	var i;

	if (seg.forwardCoord === undefined) { // not already computed

		if (!forwardSegs.length) {

			// if there are no forward segments, this segment should butt up against the edge
			seg.forwardCoord = 1;
		}
		else {

			// sort highest pressure first
			forwardSegs.sort(compareForwardSlotSegs);

			// this segment's forwardCoord will be calculated from the backwardCoord of the
			// highest-pressure forward segment.
			computeSlotSegCoords(forwardSegs[0], seriesBackwardPressure + 1, seriesBackwardCoord);
			seg.forwardCoord = forwardSegs[0].backwardCoord;
		}

		// calculate the backwardCoord from the forwardCoord. consider the series
		seg.backwardCoord = seg.forwardCoord -
			(seg.forwardCoord - seriesBackwardCoord) / // available width for series
			(seriesBackwardPressure + 1); // # of segments in the series

		// use this segment's coordinates to computed the coordinates of the less-pressurized
		// forward segments
		for (i=0; i<forwardSegs.length; i++) {
			computeSlotSegCoords(forwardSegs[i], 0, seg.forwardCoord);
		}
	}
}


// Find all the segments in `otherSegs` that vertically collide with `seg`.
// Append into an optionally-supplied `results` array and return.
function computeSlotSegCollisions(seg, otherSegs, results) {
	results = results || [];

	for (var i=0; i<otherSegs.length; i++) {
		if (isSlotSegCollision(seg, otherSegs[i])) {
			results.push(otherSegs[i]);
		}
	}

	return results;
}


// Do these segments occupy the same vertical space?
function isSlotSegCollision(seg1, seg2) {
	return seg1.bottom > seg2.top && seg1.top < seg2.bottom;
}


// A cmp function for determining which forward segment to rely on more when computing coordinates.
function compareForwardSlotSegs(seg1, seg2) {
	// put higher-pressure first
	return seg2.forwardPressure - seg1.forwardPressure ||
		// put segments that are closer to initial edge first (and favor ones with no coords yet)
		(seg1.backwardCoord || 0) - (seg2.backwardCoord || 0) ||
		// do normal sorting...
		compareSegs(seg1, seg2);
}

;;

/* An abstract class from which other views inherit from
----------------------------------------------------------------------------------------------------------------------*/
// Newer methods should be written as prototype methods, not in the monster `View` function at the bottom.

View.prototype = {

	calendar: null, // owner Calendar object
	coordMap: null, // a CoordMap object for converting pixel regions to dates
	el: null, // the view's containing element. set by Calendar

	// important Moments
	start: null, // the date of the very first cell
	end: null, // the date after the very last cell
	intervalStart: null, // the start of the interval of time the view represents (1st of month for month view)
	intervalEnd: null, // the exclusive end of the interval of time the view represents

	// used for cell-to-date and date-to-cell calculations
	rowCnt: null, // # of weeks
	colCnt: null, // # of days displayed in a week

	isSelected: false, // boolean whether cells are user-selected or not

	// subclasses can optionally use a scroll container
	scrollerEl: null, // the element that will most likely scroll when content is too tall
	scrollTop: null, // cached vertical scroll value

	// classNames styled by jqui themes
	widgetHeaderClass: null,
	widgetContentClass: null,
	highlightStateClass: null,

	// document handlers, bound to `this` object
	documentMousedownProxy: null,
	documentDragStartProxy: null,


	// Serves as a "constructor" to suppliment the monster `View` constructor below
	init: function() {
		var tm = this.opt('theme') ? 'ui' : 'fc';

		this.widgetHeaderClass = tm + '-widget-header';
		this.widgetContentClass = tm + '-widget-content';
		this.highlightStateClass = tm + '-state-highlight';

		// save references to `this`-bound handlers
		this.documentMousedownProxy = $.proxy(this, 'documentMousedown');
		this.documentDragStartProxy = $.proxy(this, 'documentDragStart');
	},


	// Renders the view inside an already-defined `this.el`.
	// Subclasses should override this and then call the super method afterwards.
	render: function() {
		this.updateSize();
		this.trigger('viewRender', this, this, this.el);

		// attach handlers to document. do it here to allow for destroy/rerender
		$(document)
			.on('mousedown', this.documentMousedownProxy)
			.on('dragstart', this.documentDragStartProxy); // jqui drag
	},


	// Clears all view rendering, event elements, and unregisters handlers
	destroy: function() {
		this.unselect();
		this.trigger('viewDestroy', this, this, this.el);
		this.destroyEvents();
		this.el.empty(); // removes inner contents but leaves the element intact

		$(document)
			.off('mousedown', this.documentMousedownProxy)
			.off('dragstart', this.documentDragStartProxy);
	},


	// Used to determine what happens when the users clicks next/prev. Given -1 for prev, 1 for next.
	// Should apply the delta to `date` (a Moment) and return it.
	incrementDate: function(date, delta) {
		// subclasses should implement
	},


	/* Dimensions
	------------------------------------------------------------------------------------------------------------------*/


	// Refreshes anything dependant upon sizing of the container element of the grid
	updateSize: function(isResize) {
		if (isResize) {
			this.recordScroll();
		}
		this.updateHeight();
		this.updateWidth();
	},


	// Refreshes the horizontal dimensions of the calendar
	updateWidth: function() {
		// subclasses should implement
	},


	// Refreshes the vertical dimensions of the calendar
	updateHeight: function() {
		var calendar = this.calendar; // we poll the calendar for height information

		this.setHeight(
			calendar.getSuggestedViewHeight(),
			calendar.isHeightAuto()
		);
	},


	// Updates the vertical dimensions of the calendar to the specified height.
	// if `isAuto` is set to true, height becomes merely a suggestion and the view should use its "natural" height.
	setHeight: function(height, isAuto) {
		// subclasses should implement
	},


	// Given the total height of the view, return the number of pixels that should be used for the scroller.
	// Utility for subclasses.
	computeScrollerHeight: function(totalHeight) {
		var both = this.el.add(this.scrollerEl);
		var otherHeight; // cumulative height of everything that is not the scrollerEl in the view (header+borders)

		// fuckin IE8/9/10/11 sometimes returns 0 for dimensions. this weird hack was the only thing that worked
		both.css({
			position: 'relative', // cause a reflow, which will force fresh dimension recalculation
			left: -1 // ensure reflow in case the el was already relative. negative is less likely to cause new scroll
		});
		otherHeight = this.el.outerHeight() - this.scrollerEl.height(); // grab the dimensions
		both.css({ position: '', left: '' }); // undo hack

		return totalHeight - otherHeight;
	},


	// Called for remembering the current scroll value of the scroller.
	// Should be called before there is a destructive operation (like removing DOM elements) that might inadvertently
	// change the scroll of the container.
	recordScroll: function() {
		if (this.scrollerEl) {
			this.scrollTop = this.scrollerEl.scrollTop();
		}
	},


	// Set the scroll value of the scroller to the previously recorded value.
	// Should be called after we know the view's dimensions have been restored following some type of destructive
	// operation (like temporarily removing DOM elements).
	restoreScroll: function() {
		if (this.scrollTop !== null) {
			this.scrollerEl.scrollTop(this.scrollTop);
		}
	},


	/* Events
	------------------------------------------------------------------------------------------------------------------*/


	// Renders the events onto the view.
	// Should be overriden by subclasses. Subclasses should call the super-method afterwards.
	renderEvents: function(events) {
		this.segEach(function(seg) {
			this.trigger('eventAfterRender', seg.event, seg.event, seg.el);
		});
		this.trigger('eventAfterAllRender');
	},


	// Removes event elements from the view.
	// Should be overridden by subclasses. Should call this super-method FIRST, then subclass DOM destruction.
	destroyEvents: function() {
		this.segEach(function(seg) {
			this.trigger('eventDestroy', seg.event, seg.event, seg.el);
		});
	},


	// Given an event and the default element used for rendering, returns the element that should actually be used.
	// Basically runs events and elements through the eventRender hook.
	resolveEventEl: function(event, el) {
		var custom = this.trigger('eventRender', event, event, el);

		if (custom === false) { // means don't render at all
			el = null;
		}
		else if (custom && custom !== true) {
			el = $(custom);
		}

		return el;
	},


	// Hides all rendered event segments linked to the given event
	showEvent: function(event) {
		this.segEach(function(seg) {
			seg.el.css('visibility', '');
		}, event);
	},


	// Shows all rendered event segments linked to the given event
	hideEvent: function(event) {
		this.segEach(function(seg) {
			seg.el.css('visibility', 'hidden');
		}, event);
	},


	// Iterates through event segments. Goes through all by default.
	// If the optional `event` argument is specified, only iterates through segments linked to that event.
	// The `this` value of the callback function will be the view.
	segEach: function(func, event) {
		var segs = this.getSegs();
		var i;

		for (i = 0; i < segs.length; i++) {
			if (!event || segs[i].event._id === event._id) {
				func.call(this, segs[i]);
			}
		}
	},


	// Retrieves all the rendered segment objects for the view
	getSegs: function() {
		// subclasses must implement
	},


	/* Event Drag Visualization
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of an event hovering over the specified date.
	// `end` is a Moment and might be null.
	// `seg` might be null. if specified, it is the segment object of the event being dragged.
	//       otherwise, an external event from outside the calendar is being dragged.
	renderDrag: function(start, end, seg) {
		// subclasses should implement
	},


	// Unrenders a visual indication of event hovering
	destroyDrag: function() {
		// subclasses should implement
	},


	// Handler for accepting externally dragged events being dropped in the view.
	// Gets called when jqui's 'dragstart' is fired.
	documentDragStart: function(ev, ui) {
		var _this = this;
		var calendar = this.calendar;
		var eventStart = null; // a null value signals an unsuccessful drag
		var eventEnd = null;
		var visibleEnd = null; // will be calculated event when no eventEnd
		var el;
		var accept;
		var meta;
		var eventProps; // if an object, signals an event should be created upon drop
		var dragListener;

		if (this.opt('droppable')) { // only listen if this setting is on
			el = $(ev.target);

			// Test that the dragged element passes the dropAccept selector or filter function.
			// FYI, the default is "*" (matches all)
			accept = this.opt('dropAccept');
			if ($.isFunction(accept) ? accept.call(el[0], el) : el.is(accept)) {

				meta = getDraggedElMeta(el); // data for possibly creating an event
				eventProps = meta.eventProps;

				// listener that tracks mouse movement over date-associated pixel regions
				dragListener = new DragListener(this.coordMap, {
					cellOver: function(cell, cellDate) {
						eventStart = cellDate;
						eventEnd = meta.duration ? eventStart.clone().add(meta.duration) : null;
						visibleEnd = eventEnd || calendar.getDefaultEventEnd(!eventStart.hasTime(), eventStart);

						// keep the start/end up to date when dragging
						if (eventProps) {
							$.extend(eventProps, { start: eventStart, end: eventEnd });
						}

						if (calendar.isExternalDragAllowedInRange(eventStart, visibleEnd, eventProps)) {
							_this.renderDrag(eventStart, visibleEnd);
						}
						else {
							eventStart = null; // signal unsuccessful
							disableCursor();
						}
					},
					cellOut: function() {
						eventStart = null;
						_this.destroyDrag();
						enableCursor();
					}
				});

				// gets called, only once, when jqui drag is finished
				$(document).one('dragstop', function(ev, ui) {
					var renderedEvents;

					_this.destroyDrag();
					enableCursor();

					if (eventStart) { // element was dropped on a valid date/time cell

						// if dropped on an all-day cell, and element's metadata specified a time, set it
						if (meta.startTime && !eventStart.hasTime()) {
							eventStart.time(meta.startTime);
						}

						// trigger 'drop' regardless of whether element represents an event
						_this.trigger('drop', el[0], eventStart, ev, ui);

						// create an event from the given properties and the latest dates
						if (eventProps) {
							renderedEvents = calendar.renderEvent(eventProps, meta.stick);
							_this.trigger('eventReceive', null, renderedEvents[0]); // signal an external event landed
						}
					}
				});

				dragListener.startDrag(ev); // start listening immediately
			}
		}
	},


	/* Selection
	------------------------------------------------------------------------------------------------------------------*/


	// Selects a date range on the view. `start` and `end` are both Moments.
	// `ev` is the native mouse event that begin the interaction.
	select: function(start, end, ev) {
		this.unselect(ev);
		this.renderSelection(start, end);
		this.reportSelection(start, end, ev);
	},


	// Renders a visual indication of the selection
	renderSelection: function(start, end) {
		// subclasses should implement
	},


	// Called when a new selection is made. Updates internal state and triggers handlers.
	reportSelection: function(start, end, ev) {
		this.isSelected = true;
		this.trigger('select', null, start, end, ev);
	},


	// Undoes a selection. updates in the internal state and triggers handlers.
	// `ev` is the native mouse event that began the interaction.
	unselect: function(ev) {
		if (this.isSelected) {
			this.isSelected = false;
			this.destroySelection();
			this.trigger('unselect', null, ev);
		}
	},


	// Unrenders a visual indication of selection
	destroySelection: function() {
		// subclasses should implement
	},


	// Handler for unselecting when the user clicks something and the 'unselectAuto' setting is on
	documentMousedown: function(ev) {
		var ignore;

		// is there a selection, and has the user made a proper left click?
		if (this.isSelected && this.opt('unselectAuto') && isPrimaryMouseButton(ev)) {

			// only unselect if the clicked element is not identical to or inside of an 'unselectCancel' element
			ignore = this.opt('unselectCancel');
			if (!ignore || !$(ev.target).closest(ignore).length) {
				this.unselect(ev);
			}
		}
	}

};


// We are mixing JavaScript OOP design patterns here by putting methods and member variables in the closed scope of the
// constructor. Going forward, methods should be part of the prototype.
function View(calendar) {
	var t = this;
	
	// exports
	t.calendar = calendar;
	t.opt = opt;
	t.trigger = trigger;
	t.isEventDraggable = isEventDraggable;
	t.isEventResizable = isEventResizable;
	t.eventDrop = eventDrop;
	t.eventResize = eventResize;
	
	// imports
	var reportEventChange = calendar.reportEventChange;
	
	// locals
	var options = calendar.options;
	var nextDayThreshold = moment.duration(options.nextDayThreshold);


	t.init(); // the "constructor" that concerns the prototype methods
	
	
	function opt(name) {
		var v = options[name];
		if ($.isPlainObject(v) && !isForcedAtomicOption(name)) {
			return smartProperty(v, t.name);
		}
		return v;
	}

	
	function trigger(name, thisObj) {
		return calendar.trigger.apply(
			calendar,
			[name, thisObj || t].concat(Array.prototype.slice.call(arguments, 2), [t])
		);
	}
	


	/* Event Editable Boolean Calculations
	------------------------------------------------------------------------------*/

	
	function isEventDraggable(event) {
		var source = event.source || {};

		return firstDefined(
			event.startEditable,
			source.startEditable,
			opt('eventStartEditable'),
			event.editable,
			source.editable,
			opt('editable')
		);
	}
	
	
	function isEventResizable(event) {
		var source = event.source || {};

		return firstDefined(
			event.durationEditable,
			source.durationEditable,
			opt('eventDurationEditable'),
			event.editable,
			source.editable,
			opt('editable')
		);
	}
	
	
	
	/* Event Elements
	------------------------------------------------------------------------------*/


	// Compute the text that should be displayed on an event's element.
	// Based off the settings of the view. Possible signatures:
	//   .getEventTimeText(event, formatStr)
	//   .getEventTimeText(startMoment, endMoment, formatStr)
	//   .getEventTimeText(startMoment, null, formatStr)
	// `timeFormat` is used but the `formatStr` argument can be used to override.
	t.getEventTimeText = function(event, formatStr) {
		var start;
		var end;

		if (typeof event === 'object' && typeof formatStr === 'object') {
			// first two arguments are actually moments (or null). shift arguments.
			start = event;
			end = formatStr;
			formatStr = arguments[2];
		}
		else {
			// otherwise, an event object was the first argument
			start = event.start;
			end = event.end;
		}

		formatStr = formatStr || opt('timeFormat');

		if (end && opt('displayEventEnd')) {
			return calendar.formatRange(start, end, formatStr);
		}
		else {
			return calendar.formatDate(start, formatStr);
		}
	};

	
	
	/* Event Modification Reporting
	---------------------------------------------------------------------------------*/

	
	function eventDrop(el, event, newStart, ev) {
		var mutateResult = calendar.mutateEvent(event, newStart, null);

		trigger(
			'eventDrop',
			el,
			event,
			mutateResult.dateDelta,
			function() {
				mutateResult.undo();
				reportEventChange();
			},
			ev,
			{} // jqui dummy
		);

		reportEventChange();
	}


	function eventResize(el, event, newEnd, ev) {
		var mutateResult = calendar.mutateEvent(event, null, newEnd);

		trigger(
			'eventResize',
			el,
			event,
			mutateResult.durationDelta,
			function() {
				mutateResult.undo();
				reportEventChange();
			},
			ev,
			{} // jqui dummy
		);

		reportEventChange();
	}


	// ====================================================================================================
	// Utilities for day "cells"
	// ====================================================================================================
	// The "basic" views are completely made up of day cells.
	// The "agenda" views have day cells at the top "all day" slot.
	// This was the obvious common place to put these utilities, but they should be abstracted out into
	// a more meaningful class (like DayEventRenderer).
	// ====================================================================================================


	// For determining how a given "cell" translates into a "date":
	//
	// 1. Convert the "cell" (row and column) into a "cell offset" (the # of the cell, cronologically from the first).
	//    Keep in mind that column indices are inverted with isRTL. This is taken into account.
	//
	// 2. Convert the "cell offset" to a "day offset" (the # of days since the first visible day in the view).
	//
	// 3. Convert the "day offset" into a "date" (a Moment).
	//
	// The reverse transformation happens when transforming a date into a cell.


	// exports
	t.isHiddenDay = isHiddenDay;
	t.skipHiddenDays = skipHiddenDays;
	t.getCellsPerWeek = getCellsPerWeek;
	t.dateToCell = dateToCell;
	t.dateToDayOffset = dateToDayOffset;
	t.dayOffsetToCellOffset = dayOffsetToCellOffset;
	t.cellOffsetToCell = cellOffsetToCell;
	t.cellToDate = cellToDate;
	t.cellToCellOffset = cellToCellOffset;
	t.cellOffsetToDayOffset = cellOffsetToDayOffset;
	t.dayOffsetToDate = dayOffsetToDate;
	t.rangeToSegments = rangeToSegments;
	t.isMultiDayEvent = isMultiDayEvent;


	// internals
	var hiddenDays = opt('hiddenDays') || []; // array of day-of-week indices that are hidden
	var isHiddenDayHash = []; // is the day-of-week hidden? (hash with day-of-week-index -> bool)
	var cellsPerWeek;
	var dayToCellMap = []; // hash from dayIndex -> cellIndex, for one week
	var cellToDayMap = []; // hash from cellIndex -> dayIndex, for one week
	var isRTL = opt('isRTL');


	// initialize important internal variables
	(function() {

		if (opt('weekends') === false) {
			hiddenDays.push(0, 6); // 0=sunday, 6=saturday
		}

		// Loop through a hypothetical week and determine which
		// days-of-week are hidden. Record in both hashes (one is the reverse of the other).
		for (var dayIndex=0, cellIndex=0; dayIndex<7; dayIndex++) {
			dayToCellMap[dayIndex] = cellIndex;
			isHiddenDayHash[dayIndex] = $.inArray(dayIndex, hiddenDays) != -1;
			if (!isHiddenDayHash[dayIndex]) {
				cellToDayMap[cellIndex] = dayIndex;
				cellIndex++;
			}
		}

		cellsPerWeek = cellIndex;
		if (!cellsPerWeek) {
			throw 'invalid hiddenDays'; // all days were hidden? bad.
		}

	})();


	// Is the current day hidden?
	// `day` is a day-of-week index (0-6), or a Moment
	function isHiddenDay(day) {
		if (moment.isMoment(day)) {
			day = day.day();
		}
		return isHiddenDayHash[day];
	}


	function getCellsPerWeek() {
		return cellsPerWeek;
	}


	// Incrementing the current day until it is no longer a hidden day, returning a copy.
	// If the initial value of `date` is not a hidden day, don't do anything.
	// Pass `isExclusive` as `true` if you are dealing with an end date.
	// `inc` defaults to `1` (increment one day forward each time)
	function skipHiddenDays(date, inc, isExclusive) {
		var out = date.clone();
		inc = inc || 1;
		while (
			isHiddenDayHash[(out.day() + (isExclusive ? inc : 0) + 7) % 7]
		) {
			out.add(inc, 'days');
		}
		return out;
	}


	//
	// TRANSFORMATIONS: cell -> cell offset -> day offset -> date
	//

	// cell -> date (combines all transformations)
	// Possible arguments:
	// - row, col
	// - { row:#, col: # }
	function cellToDate() {
		var cellOffset = cellToCellOffset.apply(null, arguments);
		var dayOffset = cellOffsetToDayOffset(cellOffset);
		var date = dayOffsetToDate(dayOffset);
		return date;
	}

	// cell -> cell offset
	// Possible arguments:
	// - row, col
	// - { row:#, col:# }
	function cellToCellOffset(row, col) {
		var colCnt = t.colCnt;

		// rtl variables. wish we could pre-populate these. but where?
		var dis = isRTL ? -1 : 1;
		var dit = isRTL ? colCnt - 1 : 0;

		if (typeof row == 'object') {
			col = row.col;
			row = row.row;
		}
		var cellOffset = row * colCnt + (col * dis + dit); // column, adjusted for RTL (dis & dit)

		return cellOffset;
	}

	// cell offset -> day offset
	function cellOffsetToDayOffset(cellOffset) {
		var day0 = t.start.day(); // first date's day of week
		cellOffset += dayToCellMap[day0]; // normlize cellOffset to beginning-of-week
		return Math.floor(cellOffset / cellsPerWeek) * 7 + // # of days from full weeks
			cellToDayMap[ // # of days from partial last week
				(cellOffset % cellsPerWeek + cellsPerWeek) % cellsPerWeek // crazy math to handle negative cellOffsets
			] -
			day0; // adjustment for beginning-of-week normalization
	}

	// day offset -> date
	function dayOffsetToDate(dayOffset) {
		return t.start.clone().add(dayOffset, 'days');
	}


	//
	// TRANSFORMATIONS: date -> day offset -> cell offset -> cell
	//

	// date -> cell (combines all transformations)
	function dateToCell(date) {
		var dayOffset = dateToDayOffset(date);
		var cellOffset = dayOffsetToCellOffset(dayOffset);
		var cell = cellOffsetToCell(cellOffset);
		return cell;
	}

	// date -> day offset
	function dateToDayOffset(date) {
		return date.clone().stripTime().diff(t.start, 'days');
	}

	// day offset -> cell offset
	function dayOffsetToCellOffset(dayOffset) {
		var day0 = t.start.day(); // first date's day of week
		dayOffset += day0; // normalize dayOffset to beginning-of-week
		return Math.floor(dayOffset / 7) * cellsPerWeek + // # of cells from full weeks
			dayToCellMap[ // # of cells from partial last week
				(dayOffset % 7 + 7) % 7 // crazy math to handle negative dayOffsets
			] -
			dayToCellMap[day0]; // adjustment for beginning-of-week normalization
	}

	// cell offset -> cell (object with row & col keys)
	function cellOffsetToCell(cellOffset) {
		var colCnt = t.colCnt;

		// rtl variables. wish we could pre-populate these. but where?
		var dis = isRTL ? -1 : 1;
		var dit = isRTL ? colCnt - 1 : 0;

		var row = Math.floor(cellOffset / colCnt);
		var col = ((cellOffset % colCnt + colCnt) % colCnt) * dis + dit; // column, adjusted for RTL (dis & dit)
		return {
			row: row,
			col: col
		};
	}


	//
	// Converts a date range into an array of segment objects.
	// "Segments" are horizontal stretches of time, sliced up by row.
	// A segment object has the following properties:
	// - row
	// - cols
	// - isStart
	// - isEnd
	//
	function rangeToSegments(start, end) {

		var rowCnt = t.rowCnt;
		var colCnt = t.colCnt;
		var segments = []; // array of segments to return

		// day offset for given date range
		var dayRange = computeDayRange(start, end); // convert to a whole-day range
		var rangeDayOffsetStart = dateToDayOffset(dayRange.start);
		var rangeDayOffsetEnd = dateToDayOffset(dayRange.end); // an exclusive value

		// first and last cell offset for the given date range
		// "last" implies inclusivity
		var rangeCellOffsetFirst = dayOffsetToCellOffset(rangeDayOffsetStart);
		var rangeCellOffsetLast = dayOffsetToCellOffset(rangeDayOffsetEnd) - 1;

		// loop through all the rows in the view
		for (var row=0; row<rowCnt; row++) {

			// first and last cell offset for the row
			var rowCellOffsetFirst = row * colCnt;
			var rowCellOffsetLast = rowCellOffsetFirst + colCnt - 1;

			// get the segment's cell offsets by constraining the range's cell offsets to the bounds of the row
			var segmentCellOffsetFirst = Math.max(rangeCellOffsetFirst, rowCellOffsetFirst);
			var segmentCellOffsetLast = Math.min(rangeCellOffsetLast, rowCellOffsetLast);

			// make sure segment's offsets are valid and in view
			if (segmentCellOffsetFirst <= segmentCellOffsetLast) {

				// translate to cells
				var segmentCellFirst = cellOffsetToCell(segmentCellOffsetFirst);
				var segmentCellLast = cellOffsetToCell(segmentCellOffsetLast);

				// view might be RTL, so order by leftmost column
				var cols = [ segmentCellFirst.col, segmentCellLast.col ].sort();

				// Determine if segment's first/last cell is the beginning/end of the date range.
				// We need to compare "day offset" because "cell offsets" are often ambiguous and
				// can translate to multiple days, and an edge case reveals itself when we the
				// range's first cell is hidden (we don't want isStart to be true).
				var isStart = cellOffsetToDayOffset(segmentCellOffsetFirst) == rangeDayOffsetStart;
				var isEnd = cellOffsetToDayOffset(segmentCellOffsetLast) + 1 == rangeDayOffsetEnd;
				                                                   // +1 for comparing exclusively

				segments.push({
					row: row,
					leftCol: cols[0],
					rightCol: cols[1],
					isStart: isStart,
					isEnd: isEnd
				});
			}
		}

		return segments;
	}


	// Returns the date range of the full days the given range visually appears to occupy.
	// Returns object with properties `start` (moment) and `end` (moment, exclusive end).
	function computeDayRange(start, end) {
		var startDay = start.clone().stripTime(); // the beginning of the day the range starts
		var endDay;
		var endTimeMS;

		if (end) {
			endDay = end.clone().stripTime(); // the beginning of the day the range exclusively ends
			endTimeMS = +end.time(); // # of milliseconds into `endDay`

			// If the end time is actually inclusively part of the next day and is equal to or
			// beyond the next day threshold, adjust the end to be the exclusive end of `endDay`.
			// Otherwise, leaving it as inclusive will cause it to exclude `endDay`.
			if (endTimeMS && endTimeMS >= nextDayThreshold) {
				endDay.add(1, 'days');
			}
		}

		// If no end was specified, or if it is within `startDay` but not past nextDayThreshold,
		// assign the default duration of one day.
		if (!end || endDay <= startDay) {
			endDay = startDay.clone().add(1, 'days');
		}

		return { start: startDay, end: endDay };
	}


	// Does the given event visually appear to occupy more than one day?
	function isMultiDayEvent(event) {
		var range = computeDayRange(event.start, event.end);

		return range.end.diff(range.start, 'days') > 1;
	}

}


/* Utils
----------------------------------------------------------------------------------------------------------------------*/

// Require all HTML5 data-* attributes used by FullCalendar to have this prefix.
// A value of '' will query attributes like data-event. A value of 'fc' will query attributes like data-fc-event.
fc.dataAttrPrefix = '';

// Given a jQuery element that might represent a dragged FullCalendar event, returns an intermediate data structure
// to be used for Event Object creation.
// A defined `.eventProps`, even when empty, indicates that an event should be created.
function getDraggedElMeta(el) {
	var prefix = fc.dataAttrPrefix;
	var eventProps; // properties for creating the event, not related to date/time
	var startTime; // a Duration
	var duration;
	var stick;

	if (prefix) { prefix += '-'; }
	eventProps = el.data(prefix + 'event') || null;

	if (eventProps) {
		if (typeof eventProps === 'object') {
			eventProps = $.extend({}, eventProps); // make a copy
		}
		else { // something like 1 or true. still signal event creation
			eventProps = {};
		}

		// pluck special-cased date/time properties
		startTime = eventProps.start;
		if (startTime == null) { startTime = eventProps.time; } // accept 'time' as well
		duration = eventProps.duration;
		stick = eventProps.stick;
		delete eventProps.start;
		delete eventProps.time;
		delete eventProps.duration;
		delete eventProps.stick;
	}

	// fallback to standalone attribute values for each of the date/time properties
	if (startTime == null) { startTime = el.data(prefix + 'start'); }
	if (startTime == null) { startTime = el.data(prefix + 'time'); } // accept 'time' as well
	if (duration == null) { duration = el.data(prefix + 'duration'); }
	if (stick == null) { stick = el.data(prefix + 'stick'); }

	// massage into correct data types
	startTime = startTime != null ? moment.duration(startTime) : null;
	duration = duration != null ? moment.duration(duration) : null;
	stick = Boolean(stick);

	return { eventProps: eventProps, startTime: startTime, duration: duration, stick: stick };
}

;;

/* An abstract class for the "basic" views, as well as month view. Renders one or more rows of day cells.
----------------------------------------------------------------------------------------------------------------------*/
// It is a manager for a DayGrid subcomponent, which does most of the heavy lifting.
// It is responsible for managing width/height.

function BasicView(calendar) {
	View.call(this, calendar); // call the super-constructor
	this.dayGrid = new DayGrid(this);
	this.coordMap = this.dayGrid.coordMap; // the view's date-to-cell mapping is identical to the subcomponent's
}


BasicView.prototype = createObject(View.prototype); // define the super-class
$.extend(BasicView.prototype, {

	dayGrid: null, // the main subcomponent that does most of the heavy lifting

	dayNumbersVisible: false, // display day numbers on each day cell?
	weekNumbersVisible: false, // display week numbers along the side?

	weekNumberWidth: null, // width of all the week-number cells running down the side

	headRowEl: null, // the fake row element of the day-of-week header


	// Renders the view into `this.el`, which should already be assigned.
	// rowCnt, colCnt, and dayNumbersVisible have been calculated by a subclass and passed here.
	render: function(rowCnt, colCnt, dayNumbersVisible) {

		// needed for cell-to-date and date-to-cell calculations in View
		this.rowCnt = rowCnt;
		this.colCnt = colCnt;

		this.dayNumbersVisible = dayNumbersVisible;
		this.weekNumbersVisible = this.opt('weekNumbers');
		this.dayGrid.numbersVisible = this.dayNumbersVisible || this.weekNumbersVisible;

		this.el.addClass('fc-basic-view').html(this.renderHtml());

		this.headRowEl = this.el.find('thead .fc-row');

		this.scrollerEl = this.el.find('.fc-day-grid-container');
		this.dayGrid.coordMap.containerEl = this.scrollerEl; // constrain clicks/etc to the dimensions of the scroller

		this.dayGrid.el = this.el.find('.fc-day-grid');
		this.dayGrid.render(this.hasRigidRows());

		View.prototype.render.call(this); // call the super-method
	},


	// Make subcomponents ready for cleanup
	destroy: function() {
		this.dayGrid.destroy();
		View.prototype.destroy.call(this); // call the super-method
	},


	// Builds the HTML skeleton for the view.
	// The day-grid component will render inside of a container defined by this HTML.
	renderHtml: function() {
		return '' +
			'<table>' +
				'<thead>' +
					'<tr>' +
						'<td class="' + this.widgetHeaderClass + '">' +
							this.dayGrid.headHtml() + // render the day-of-week headers
						'</td>' +
					'</tr>' +
				'</thead>' +
				'<tbody>' +
					'<tr>' +
						'<td class="' + this.widgetContentClass + '">' +
							'<div class="fc-day-grid-container">' +
								'<div class="fc-day-grid"/>' +
							'</div>' +
						'</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>';
	},


	// Generates the HTML that will go before the day-of week header cells.
	// Queried by the DayGrid subcomponent when generating rows. Ordering depends on isRTL.
	headIntroHtml: function() {
		if (this.weekNumbersVisible) {
			return '' +
				'<th class="fc-week-number ' + this.widgetHeaderClass + '" ' + this.weekNumberStyleAttr() + '>' +
					'<span>' + // needed for matchCellWidths
						htmlEscape(this.opt('weekNumberTitle')) +
					'</span>' +
				'</th>';
		}
	},


	// Generates the HTML that will go before content-skeleton cells that display the day/week numbers.
	// Queried by the DayGrid subcomponent. Ordering depends on isRTL.
	numberIntroHtml: function(row) {
		if (this.weekNumbersVisible) {
			return '' +
				'<td class="fc-week-number" ' + this.weekNumberStyleAttr() + '>' +
					'<span>' + // needed for matchCellWidths
						this.calendar.calculateWeekNumber(this.cellToDate(row, 0)) +
					'</span>' +
				'</td>';
		}
	},


	// Generates the HTML that goes before the day bg cells for each day-row.
	// Queried by the DayGrid subcomponent. Ordering depends on isRTL.
	dayIntroHtml: function() {
		if (this.weekNumbersVisible) {
			return '<td class="fc-week-number ' + this.widgetContentClass + '" ' +
				this.weekNumberStyleAttr() + '></td>';
		}
	},


	// Generates the HTML that goes before every other type of row generated by DayGrid. Ordering depends on isRTL.
	// Affects helper-skeleton and highlight-skeleton rows.
	introHtml: function() {
		if (this.weekNumbersVisible) {
			return '<td class="fc-week-number" ' + this.weekNumberStyleAttr() + '></td>';
		}
	},


	// Generates the HTML for the <td>s of the "number" row in the DayGrid's content skeleton.
	// The number row will only exist if either day numbers or week numbers are turned on.
	numberCellHtml: function(row, col, date) {
		var classes;

		if (!this.dayNumbersVisible) { // if there are week numbers but not day numbers
			return '<td/>'; //  will create an empty space above events :(
		}

		classes = this.dayGrid.getDayClasses(date);
		classes.unshift('fc-day-number');

		return '' +
			'<td class="' + classes.join(' ') + '" data-date="' + date.format() + '">' +
				date.date() +
			'</td>';
	},


	// Generates an HTML attribute string for setting the width of the week number column, if it is known
	weekNumberStyleAttr: function() {
		if (this.weekNumberWidth !== null) {
			return 'style="width:' + this.weekNumberWidth + 'px"';
		}
		return '';
	},


	// Determines whether each row should have a constant height
	hasRigidRows: function() {
		var eventLimit = this.opt('eventLimit');
		return eventLimit && typeof eventLimit !== 'number';
	},


	/* Dimensions
	------------------------------------------------------------------------------------------------------------------*/


	// Refreshes the horizontal dimensions of the view
	updateWidth: function() {
		if (this.weekNumbersVisible) {
			// Make sure all week number cells running down the side have the same width.
			// Record the width for cells created later.
			this.weekNumberWidth = matchCellWidths(
				this.el.find('.fc-week-number')
			);
		}
	},


	// Adjusts the vertical dimensions of the view to the specified values
	setHeight: function(totalHeight, isAuto) {
		var eventLimit = this.opt('eventLimit');
		var scrollerHeight;

		// reset all heights to be natural
		unsetScroller(this.scrollerEl);
		uncompensateScroll(this.headRowEl);

		this.dayGrid.destroySegPopover(); // kill the "more" popover if displayed

		// is the event limit a constant level number?
		if (eventLimit && typeof eventLimit === 'number') {
			this.dayGrid.limitRows(eventLimit); // limit the levels first so the height can redistribute after
		}

		scrollerHeight = this.computeScrollerHeight(totalHeight);
		this.setGridHeight(scrollerHeight, isAuto);

		// is the event limit dynamically calculated?
		if (eventLimit && typeof eventLimit !== 'number') {
			this.dayGrid.limitRows(eventLimit); // limit the levels after the grid's row heights have been set
		}

		if (!isAuto && setPotentialScroller(this.scrollerEl, scrollerHeight)) { // using scrollbars?

			compensateScroll(this.headRowEl, getScrollbarWidths(this.scrollerEl));

			// doing the scrollbar compensation might have created text overflow which created more height. redo
			scrollerHeight = this.computeScrollerHeight(totalHeight);
			this.scrollerEl.height(scrollerHeight);

			this.restoreScroll();
		}
	},


	// Sets the height of just the DayGrid component in this view
	setGridHeight: function(height, isAuto) {
		if (isAuto) {
			undistributeHeight(this.dayGrid.rowEls); // let the rows be their natural height with no expanding
		}
		else {
			distributeHeight(this.dayGrid.rowEls, height, true); // true = compensate for height-hogging rows
		}
	},


	/* Events
	------------------------------------------------------------------------------------------------------------------*/


	// Renders the given events onto the view and populates the segments array
	renderEvents: function(events) {
		this.dayGrid.renderEvents(events);

		this.updateHeight(); // must compensate for events that overflow the row

		View.prototype.renderEvents.call(this, events); // call the super-method
	},


	// Retrieves all segment objects that are rendered in the view
	getSegs: function() {
		return this.dayGrid.getSegs();
	},


	// Unrenders all event elements and clears internal segment data
	destroyEvents: function() {
		View.prototype.destroyEvents.call(this); // do this before dayGrid's segs have been cleared

		this.recordScroll(); // removing events will reduce height and mess with the scroll, so record beforehand
		this.dayGrid.destroyEvents();

		// we DON'T need to call updateHeight() because:
		// A) a renderEvents() call always happens after this, which will eventually call updateHeight()
		// B) in IE8, this causes a flash whenever events are rerendered
	},


	/* Event Dragging
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of an event being dragged over the view.
	// A returned value of `true` signals that a mock "helper" event has been rendered.
	renderDrag: function(start, end, seg) {
		return this.dayGrid.renderDrag(start, end, seg);
	},


	// Unrenders the visual indication of an event being dragged over the view
	destroyDrag: function() {
		this.dayGrid.destroyDrag();
	},


	/* Selection
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of a selection
	renderSelection: function(start, end) {
		this.dayGrid.renderSelection(start, end);
	},


	// Unrenders a visual indications of a selection
	destroySelection: function() {
		this.dayGrid.destroySelection();
	}

});

;;

/* A month view with day cells running in rows (one-per-week) and columns
----------------------------------------------------------------------------------------------------------------------*/

setDefaults({
	fixedWeekCount: true
});

fcViews.month = MonthView; // register the view

function MonthView(calendar) {
	BasicView.call(this, calendar); // call the super-constructor
}


MonthView.prototype = createObject(BasicView.prototype); // define the super-class
$.extend(MonthView.prototype, {

	name: 'month',


	incrementDate: function(date, delta) {
		return date.clone().stripTime().add(delta, 'months').startOf('month');
	},


	render: function(date) {
		var rowCnt;

		this.intervalStart = date.clone().stripTime().startOf('month');
		this.intervalEnd = this.intervalStart.clone().add(1, 'months');

		this.start = this.intervalStart.clone();
		this.start = this.skipHiddenDays(this.start); // move past the first week if no visible days
		this.start.startOf('week');
		this.start = this.skipHiddenDays(this.start); // move past the first invisible days of the week

		this.end = this.intervalEnd.clone();
		this.end = this.skipHiddenDays(this.end, -1, true); // move in from the last week if no visible days
		this.end.add((7 - this.end.weekday()) % 7, 'days'); // move to end of week if not already
		this.end = this.skipHiddenDays(this.end, -1, true); // move in from the last invisible days of the week

		rowCnt = Math.ceil( // need to ceil in case there are hidden days
			this.end.diff(this.start, 'weeks', true) // returnfloat=true
		);
		if (this.isFixedWeeks()) {
			this.end.add(6 - rowCnt, 'weeks');
			rowCnt = 6;
		}

		this.title = this.calendar.formatDate(this.intervalStart, this.opt('titleFormat'));

		BasicView.prototype.render.call(this, rowCnt, this.getCellsPerWeek(), true); // call the super-method
	},


	// Overrides the default BasicView behavior to have special multi-week auto-height logic
	setGridHeight: function(height, isAuto) {

		isAuto = isAuto || this.opt('weekMode') === 'variable'; // LEGACY: weekMode is deprecated

		// if auto, make the height of each row the height that it would be if there were 6 weeks
		if (isAuto) {
			height *= this.rowCnt / 6;
		}

		distributeHeight(this.dayGrid.rowEls, height, !isAuto); // if auto, don't compensate for height-hogging rows
	},


	isFixedWeeks: function() {
		var weekMode = this.opt('weekMode'); // LEGACY: weekMode is deprecated
		if (weekMode) {
			return weekMode === 'fixed'; // if any other type of weekMode, assume NOT fixed
		}

		return this.opt('fixedWeekCount');
	}

});

;;

/* A week view with simple day cells running horizontally
----------------------------------------------------------------------------------------------------------------------*/
// TODO: a WeekView mixin for calculating dates and titles

fcViews.basicWeek = BasicWeekView; // register this view

function BasicWeekView(calendar) {
	BasicView.call(this, calendar); // call the super-constructor
}


BasicWeekView.prototype = createObject(BasicView.prototype); // define the super-class
$.extend(BasicWeekView.prototype, {

	name: 'basicWeek',


	incrementDate: function(date, delta) {
		return date.clone().stripTime().add(delta, 'weeks').startOf('week');
	},


	render: function(date) {

		this.intervalStart = date.clone().stripTime().startOf('week');
		this.intervalEnd = this.intervalStart.clone().add(1, 'weeks');

		this.start = this.skipHiddenDays(this.intervalStart);
		this.end = this.skipHiddenDays(this.intervalEnd, -1, true);

		this.title = this.calendar.formatRange(
			this.start,
			this.end.clone().subtract(1), // make inclusive by subtracting 1 ms
			this.opt('titleFormat'),
			' \u2014 ' // emphasized dash
		);

		BasicView.prototype.render.call(this, 1, this.getCellsPerWeek(), false); // call the super-method
	}
	
});
;;

/* A view with a single simple day cell
----------------------------------------------------------------------------------------------------------------------*/

fcViews.basicDay = BasicDayView; // register this view

function BasicDayView(calendar) {
	BasicView.call(this, calendar); // call the super-constructor
}


BasicDayView.prototype = createObject(BasicView.prototype); // define the super-class
$.extend(BasicDayView.prototype, {

	name: 'basicDay',


	incrementDate: function(date, delta) {
		var out = date.clone().stripTime().add(delta, 'days');
		out = this.skipHiddenDays(out, delta < 0 ? -1 : 1);
		return out;
	},


	render: function(date) {

		this.start = this.intervalStart = date.clone().stripTime();
		this.end = this.intervalEnd = this.start.clone().add(1, 'days');

		this.title = this.calendar.formatDate(this.start, this.opt('titleFormat'));

		BasicView.prototype.render.call(this, 1, 1, false); // call the super-method
	}

});
;;

/* An abstract class for all agenda-related views. Displays one more columns with time slots running vertically.
----------------------------------------------------------------------------------------------------------------------*/
// Is a manager for the TimeGrid subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
// Responsible for managing width/height.

setDefaults({
	allDaySlot: true,
	allDayText: 'all-day',

	scrollTime: '06:00:00',

	slotDuration: '00:30:00',

	axisFormat: generateAgendaAxisFormat,
	timeFormat: {
		agenda: generateAgendaTimeFormat
	},

	minTime: '00:00:00',
	maxTime: '24:00:00',
	slotEventOverlap: true
});

var AGENDA_ALL_DAY_EVENT_LIMIT = 5;


function generateAgendaAxisFormat(options, langData) {
	return langData.longDateFormat('LT')
		.replace(':mm', '(:mm)')
		.replace(/(\Wmm)$/, '($1)') // like above, but for foreign langs
		.replace(/\s*a$/i, 'a'); // convert AM/PM/am/pm to lowercase. remove any spaces beforehand
}


function generateAgendaTimeFormat(options, langData) {
	return langData.longDateFormat('LT')
		.replace(/\s*a$/i, ''); // remove trailing AM/PM
}


function AgendaView(calendar) {
	View.call(this, calendar); // call the super-constructor

	this.timeGrid = new TimeGrid(this);

	if (this.opt('allDaySlot')) { // should we display the "all-day" area?
		this.dayGrid = new DayGrid(this); // the all-day subcomponent of this view

		// the coordinate grid will be a combination of both subcomponents' grids
		this.coordMap = new ComboCoordMap([
			this.dayGrid.coordMap,
			this.timeGrid.coordMap
		]);
	}
	else {
		this.coordMap = this.timeGrid.coordMap;
	}
}


AgendaView.prototype = createObject(View.prototype); // define the super-class
$.extend(AgendaView.prototype, {

	timeGrid: null, // the main time-grid subcomponent of this view
	dayGrid: null, // the "all-day" subcomponent. if all-day is turned off, this will be null

	axisWidth: null, // the width of the time axis running down the side

	noScrollRowEls: null, // set of fake row elements that must compensate when scrollerEl has scrollbars

	// when the time-grid isn't tall enough to occupy the given height, we render an <hr> underneath
	bottomRuleEl: null,
	bottomRuleHeight: null,


	/* Rendering
	------------------------------------------------------------------------------------------------------------------*/


	// Renders the view into `this.el`, which has already been assigned.
	// `colCnt` has been calculated by a subclass and passed here.
	render: function(colCnt) {

		// needed for cell-to-date and date-to-cell calculations in View
		this.rowCnt = 1;
		this.colCnt = colCnt;

		this.el.addClass('fc-agenda-view').html(this.renderHtml());

		// the element that wraps the time-grid that will probably scroll
		this.scrollerEl = this.el.find('.fc-time-grid-container');
		this.timeGrid.coordMap.containerEl = this.scrollerEl; // don't accept clicks/etc outside of this

		this.timeGrid.el = this.el.find('.fc-time-grid');
		this.timeGrid.render();

		// the <hr> that sometimes displays under the time-grid
		this.bottomRuleEl = $('<hr class="' + this.widgetHeaderClass + '"/>')
			.appendTo(this.timeGrid.el); // inject it into the time-grid

		if (this.dayGrid) {
			this.dayGrid.el = this.el.find('.fc-day-grid');
			this.dayGrid.render();

			// have the day-grid extend it's coordinate area over the <hr> dividing the two grids
			this.dayGrid.bottomCoordPadding = this.dayGrid.el.next('hr').outerHeight();
		}

		this.noScrollRowEls = this.el.find('.fc-row:not(.fc-scroller *)'); // fake rows not within the scroller

		View.prototype.render.call(this); // call the super-method

		this.resetScroll(); // do this after sizes have been set
	},


	// Make subcomponents ready for cleanup
	destroy: function() {
		this.timeGrid.destroy();
		if (this.dayGrid) {
			this.dayGrid.destroy();
		}
		View.prototype.destroy.call(this); // call the super-method
	},


	// Builds the HTML skeleton for the view.
	// The day-grid and time-grid components will render inside containers defined by this HTML.
	renderHtml: function() {
		return '' +
			'<table>' +
				'<thead>' +
					'<tr>' +
						'<td class="' + this.widgetHeaderClass + '">' +
							this.timeGrid.headHtml() + // render the day-of-week headers
						'</td>' +
					'</tr>' +
				'</thead>' +
				'<tbody>' +
					'<tr>' +
						'<td class="' + this.widgetContentClass + '">' +
							(this.dayGrid ?
								'<div class="fc-day-grid"/>' +
								'<hr class="' + this.widgetHeaderClass + '"/>' :
								''
								) +
							'<div class="fc-time-grid-container">' +
								'<div class="fc-time-grid"/>' +
							'</div>' +
						'</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>';
	},


	// Generates the HTML that will go before the day-of week header cells.
	// Queried by the TimeGrid subcomponent when generating rows. Ordering depends on isRTL.
	headIntroHtml: function() {
		var date;
		var weekNumber;
		var weekTitle;
		var weekText;

		if (this.opt('weekNumbers')) {
			date = this.cellToDate(0, 0);
			weekNumber = this.calendar.calculateWeekNumber(date);
			weekTitle = this.opt('weekNumberTitle');

			if (this.opt('isRTL')) {
				weekText = weekNumber + weekTitle;
			}
			else {
				weekText = weekTitle + weekNumber;
			}

			return '' +
				'<th class="fc-axis fc-week-number ' + this.widgetHeaderClass + '" ' + this.axisStyleAttr() + '>' +
					'<span>' + // needed for matchCellWidths
						htmlEscape(weekText) +
					'</span>' +
				'</th>';
		}
		else {
			return '<th class="fc-axis ' + this.widgetHeaderClass + '" ' + this.axisStyleAttr() + '></th>';
		}
	},


	// Generates the HTML that goes before the all-day cells.
	// Queried by the DayGrid subcomponent when generating rows. Ordering depends on isRTL.
	dayIntroHtml: function() {
		return '' +
			'<td class="fc-axis ' + this.widgetContentClass + '" ' + this.axisStyleAttr() + '>' +
				'<span>' + // needed for matchCellWidths
					(this.opt('allDayHtml') || htmlEscape(this.opt('allDayText'))) +
				'</span>' +
			'</td>';
	},


	// Generates the HTML that goes before the bg of the TimeGrid slot area. Long vertical column.
	slotBgIntroHtml: function() {
		return '<td class="fc-axis ' + this.widgetContentClass + '" ' + this.axisStyleAttr() + '></td>';
	},


	// Generates the HTML that goes before all other types of cells.
	// Affects content-skeleton, helper-skeleton, highlight-skeleton for both the time-grid and day-grid.
	// Queried by the TimeGrid and DayGrid subcomponents when generating rows. Ordering depends on isRTL.
	introHtml: function() {
		return '<td class="fc-axis" ' + this.axisStyleAttr() + '></td>';
	},


	// Generates an HTML attribute string for setting the width of the axis, if it is known
	axisStyleAttr: function() {
		if (this.axisWidth !== null) {
			 return 'style="width:' + this.axisWidth + 'px"';
		}
		return '';
	},


	/* Dimensions
	------------------------------------------------------------------------------------------------------------------*/

	updateSize: function(isResize) {
		if (isResize) {
			this.timeGrid.resize();
		}
		View.prototype.updateSize.call(this, isResize);
	},


	// Refreshes the horizontal dimensions of the view
	updateWidth: function() {
		// make all axis cells line up, and record the width so newly created axis cells will have it
		this.axisWidth = matchCellWidths(this.el.find('.fc-axis'));
	},


	// Adjusts the vertical dimensions of the view to the specified values
	setHeight: function(totalHeight, isAuto) {
		var eventLimit;
		var scrollerHeight;

		if (this.bottomRuleHeight === null) {
			// calculate the height of the rule the very first time
			this.bottomRuleHeight = this.bottomRuleEl.outerHeight();
		}
		this.bottomRuleEl.hide(); // .show() will be called later if this <hr> is necessary

		// reset all dimensions back to the original state
		this.scrollerEl.css('overflow', '');
		unsetScroller(this.scrollerEl);
		uncompensateScroll(this.noScrollRowEls);

		// limit number of events in the all-day area
		if (this.dayGrid) {
			this.dayGrid.destroySegPopover(); // kill the "more" popover if displayed

			eventLimit = this.opt('eventLimit');
			if (eventLimit && typeof eventLimit !== 'number') {
				eventLimit = AGENDA_ALL_DAY_EVENT_LIMIT; // make sure "auto" goes to a real number
			}
			if (eventLimit) {
				this.dayGrid.limitRows(eventLimit);
			}
		}

		if (!isAuto) { // should we force dimensions of the scroll container, or let the contents be natural height?

			scrollerHeight = this.computeScrollerHeight(totalHeight);
			if (setPotentialScroller(this.scrollerEl, scrollerHeight)) { // using scrollbars?

				// make the all-day and header rows lines up
				compensateScroll(this.noScrollRowEls, getScrollbarWidths(this.scrollerEl));

				// the scrollbar compensation might have changed text flow, which might affect height, so recalculate
				// and reapply the desired height to the scroller.
				scrollerHeight = this.computeScrollerHeight(totalHeight);
				this.scrollerEl.height(scrollerHeight);

				this.restoreScroll();
			}
			else { // no scrollbars
				// still, force a height and display the bottom rule (marks the end of day)
				this.scrollerEl.height(scrollerHeight).css('overflow', 'hidden'); // in case <hr> goes outside
				this.bottomRuleEl.show();
			}
		}
	},


	// Sets the scroll value of the scroller to the intial pre-configured state prior to allowing the user to change it.
	resetScroll: function() {
		var _this = this;
		var scrollTime = moment.duration(this.opt('scrollTime'));
		var top = this.timeGrid.computeTimeTop(scrollTime);

		// zoom can give weird floating-point values. rather scroll a little bit further
		top = Math.ceil(top);

		if (top) {
			top++; // to overcome top border that slots beyond the first have. looks better
		}

		function scroll() {
			_this.scrollerEl.scrollTop(top);
		}

		scroll();
		setTimeout(scroll, 0); // overrides any previous scroll state made by the browser
	},


	/* Events
	------------------------------------------------------------------------------------------------------------------*/


	// Renders events onto the view and populates the View's segment array
	renderEvents: function(events) {
		var dayEvents = [];
		var timedEvents = [];
		var daySegs = [];
		var timedSegs;
		var i;

		// separate the events into all-day and timed
		for (i = 0; i < events.length; i++) {
			if (events[i].allDay) {
				dayEvents.push(events[i]);
			}
			else {
				timedEvents.push(events[i]);
			}
		}

		// render the events in the subcomponents
		timedSegs = this.timeGrid.renderEvents(timedEvents);
		if (this.dayGrid) {
			daySegs = this.dayGrid.renderEvents(dayEvents);
		}

		// the all-day area is flexible and might have a lot of events, so shift the height
		this.updateHeight();

		View.prototype.renderEvents.call(this, events); // call the super-method
	},


	// Retrieves all segment objects that are rendered in the view
	getSegs: function() {
		return this.timeGrid.getSegs().concat(
			this.dayGrid ? this.dayGrid.getSegs() : []
		);
	},


	// Unrenders all event elements and clears internal segment data
	destroyEvents: function() {
		View.prototype.destroyEvents.call(this); // do this before the grids' segs have been cleared

		// if destroyEvents is being called as part of an event rerender, renderEvents will be called shortly
		// after, so remember what the scroll value was so we can restore it.
		this.recordScroll();

		// destroy the events in the subcomponents
		this.timeGrid.destroyEvents();
		if (this.dayGrid) {
			this.dayGrid.destroyEvents();
		}

		// we DON'T need to call updateHeight() because:
		// A) a renderEvents() call always happens after this, which will eventually call updateHeight()
		// B) in IE8, this causes a flash whenever events are rerendered
	},


	/* Event Dragging
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of an event being dragged over the view.
	// A returned value of `true` signals that a mock "helper" event has been rendered.
	renderDrag: function(start, end, seg) {
		if (start.hasTime()) {
			return this.timeGrid.renderDrag(start, end, seg);
		}
		else if (this.dayGrid) {
			return this.dayGrid.renderDrag(start, end, seg);
		}
	},


	// Unrenders a visual indications of an event being dragged over the view
	destroyDrag: function() {
		this.timeGrid.destroyDrag();
		if (this.dayGrid) {
			this.dayGrid.destroyDrag();
		}
	},


	/* Selection
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of a selection
	renderSelection: function(start, end) {
		if (start.hasTime() || end.hasTime()) {
			this.timeGrid.renderSelection(start, end);
		}
		else if (this.dayGrid) {
			this.dayGrid.renderSelection(start, end);
		}
	},


	// Unrenders a visual indications of a selection
	destroySelection: function() {
		this.timeGrid.destroySelection();
		if (this.dayGrid) {
			this.dayGrid.destroySelection();
		}
	}

});

;;

/* A week view with an all-day cell area at the top, and a time grid below
----------------------------------------------------------------------------------------------------------------------*/
// TODO: a WeekView mixin for calculating dates and titles

fcViews.agendaWeek = AgendaWeekView; // register the view

function AgendaWeekView(calendar) {
	AgendaView.call(this, calendar); // call the super-constructor
}


AgendaWeekView.prototype = createObject(AgendaView.prototype); // define the super-class
$.extend(AgendaWeekView.prototype, {

	name: 'agendaWeek',


	incrementDate: function(date, delta) {
		return date.clone().stripTime().add(delta, 'weeks').startOf('week');
	},


	render: function(date) {

		this.intervalStart = date.clone().stripTime().startOf('week');
		this.intervalEnd = this.intervalStart.clone().add(1, 'weeks');

		this.start = this.skipHiddenDays(this.intervalStart);
		this.end = this.skipHiddenDays(this.intervalEnd, -1, true);

		this.title = this.calendar.formatRange(
			this.start,
			this.end.clone().subtract(1), // make inclusive by subtracting 1 ms
			this.opt('titleFormat'),
			' \u2014 ' // emphasized dash
		);

		AgendaView.prototype.render.call(this, this.getCellsPerWeek()); // call the super-method
	}

});

;;

/* A day view with an all-day cell area at the top, and a time grid below
----------------------------------------------------------------------------------------------------------------------*/

fcViews.agendaDay = AgendaDayView; // register the view

function AgendaDayView(calendar) {
	AgendaView.call(this, calendar); // call the super-constructor
}


AgendaDayView.prototype = createObject(AgendaView.prototype); // define the super-class
$.extend(AgendaDayView.prototype, {

	name: 'agendaDay',


	incrementDate: function(date, delta) {
		var out = date.clone().stripTime().add(delta, 'days');
		out = this.skipHiddenDays(out, delta < 0 ? -1 : 1);
		return out;
	},


	render: function(date) {

		this.start = this.intervalStart = date.clone().stripTime();
		this.end = this.intervalEnd = this.start.clone().add(1, 'days');

		this.title = this.calendar.formatDate(this.start, this.opt('titleFormat'));

		AgendaView.prototype.render.call(this, 1); // call the super-method
	}

});

;;

});
// IF Global Settings

var userLat;
var userLon;
var global_mapCenter;

var local_icons = {
    defaultIcon: {},
    yellowIcon: {
    
      iconUrl: 'img/marker-icon.png',
      shadowUrl: 'img/marker-shadow.png',
      iconSize:     [25, 41], // size of the icon
      shadowSize:   [41, 41], // size of the shadow
      iconAnchor:   [12, 40], // point of the icon which will correspond to marker's location
      shadowAnchor: [12, 40],  // the same for the shadow
      popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor

    },
    leafIcon: {
        iconUrl: 'img/leaf-green.png',
        shadowUrl: 'img/leaf-shadow.png',
        iconSize:     [38, 95], // size of the icon
        shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    },
    orangeLeafIcon: {
        iconUrl: 'img/leaf-orange.png',
      shadowUrl: 'img/leaf-shadow.png',
      iconSize:     [38, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    },
    divIcon: {
        type: 'div',
      iconSize: [200, 0],
      popupAnchor:  [0, 0],
        html: 'Using <strong>Bold text as an icon</strong>:'
    }
}

//https://bubbl.io/maps/53c4a0ab0ee5d8ccfa68a034_warped.vrt/{z}/{x}/{y}.png < extension for tile server

var tilesDict = {
    openstreetmap: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        options: {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    },
    mapbox: {
        url: 'https://{s}.tiles.mapbox.com/v3/interfacefoundry.ig1oichl/{z}/{x}/{y}.png',
        options: {
            attribution: 'IF',
            minZoom: 1,
            maxZoom: 23,
            reuseTiles: true
        }
    },
    aicp: {
        url: '1.0.0/aicpweek/{z}/{x}/{y}.png',
        options: {
            minZoom: 16,
            maxZoom: 23,
            
            reuseTiles: true
        }
    },
    urban: {
	    url: 'https://{s}.tiles.mapbox.com/v3/interfacefoundry.ig6a7dkn/{z}/{x}/{y}.png',
	    option: {
		    attribution: 'IF',
		    minZoom: 1,
		    maxZoom: 19,
		    reuseTiles: true
	    }   
    },
    fairy: {
	    url: 'https://{s}.tiles.mapbox.com/v3/interfacefoundry.ig9jd86b/{z}/{x}/{y}.png',
	    option: {
		    attribution: 'IF',
		    minZoom: 1,
		    maxZoom: 23,
		    reuseTiles: true
	    }
    },
    sunset: {
	    url: 'https://{s}.tiles.mapbox.com/v3/interfacefoundry.ig6f6j6e/{z}/{x}/{y}.png',
	    option: {
		    attribution: 'IF',
		    minZoom: 1,
		    maxZoom: 23,
		    reuseTiles: true
	    }
    },
    arabesque: {
	    url: 'https://{s}.tiles.mapbox.com/v3/interfacefoundry.ig67e7eb/{z}/{x}/{y}.png',
	    option: {
		    attribution: 'IF',
		    minZoom: 1,
		    maxZoom: 23,
		    reuseTiles: true
	    }
    }
};




//----------- THIS LOADS A CLOUD MAP --------//

var mapSelect = 'cloud'; //loading 'cloud' setting as specified in: js/angular-leaflet-directive.js
// var global_mapCenter = { //this is the "center" of your community or event, for mapping purposes
//     lat: 40.676752,
//     lng: -74.004618,
//     zoom: 15
// };

//--------------------------------------------------//

// //AN EXAMPLE using local AMC2013 map
 //----------- THIS LOADS A LOCAL MAP -----------------//

  // var mapSelect = 'amc2013'; //loading 'amc2013' local map setting as specified in: js/angular-leaflet-directive.js
  // var global_mapCenter = {
  //     lat: 42.356886,
  //     lng: -83.069523,
  //     zoom: 14
  // };

//----------------------------------------------------//


//---------- TWEET STREAM -------//
//one or more hashtags for base twitter gathering 
var global_hashtag = "#HappyHourShowcase";
//can also be multiple:
//var global_hashtag = '#lol,#what,#soitgoes';
//-------------------------------//

// var fakeTime = 


var eventCategories = ['lecture','show','award'];

//var placeCategories = ['lecture','show','award'];

var placeCategories = ['food','bars','sponsors','washrooms','exhibits','smoking'];




var globalEditLoc = {}; //this is a temp variable for an issue with angular leaflet directive in landmark-edit

//parsing node.js usage of file
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports.hashtag = global_hashtag;
}

var mainWindow;


// $(document).ready(function() {

//   mainWindow = $(window).height();

//   $('#main').css('height', mainWindow + 'px');
//   $('#wrapper').css('height', mainWindow + 'px');

// });


        



//------ SHELF PAN CONTROL ------//

var he;


 // $(window).resize(function() {

 //    var mainWindow = $(window).height();

 //    $('#main').css('height', mainWindow + 'px');
 //    $('#wrapper').css('height', mainWindow + 'px');

 //  });



function shelfPan(amount,special){



 
    if (amount == 'return'){

 
      if ( $("body").hasClass("lense2") ) {

        $('body').toggleClass('lense2');


        $("#shelf").css({
          "-webkit-transform": "translateY(" + 0 + "px" + ")",
          "-moz-transform": "translateY(" + 0 + "px" + ")", 
          "-ms-transform": "translateY(" + 0 + "px" + ")", 
          "-o-transform": "translateY(" + 0 + "px" + ")",
          "transform": "translateY(" + 0 + "px" + ")"
        });

        $("#leafletmap").css({"height": 183 + "px" });

      }

      if ( $("body").hasClass("lense") ) {
        $('body').toggleClass('lense');


        $("#shelf").css({
          "-webkit-transform": "translateY(" + 0 + "px" + ")",
          "-moz-transform": "translateY(" + 0 + "px" + ")", 
          "-ms-transform": "translateY(" + 0 + "px" + ")", 
          "-o-transform": "translateY(" + 0 + "px" + ")",
          "transform": "translateY(" + 0 + "px" + ")"
        });

        $("#leafletmap").css({"height": 183 + "px" });
      }


    }


    if (amount == 'full'){

  
  
      if ( $("body").hasClass("lense") ) {


        // THIS IS A TEMP WAY TO FIX A BUG
        if (special == "navbar"){

            he = $(window).height();

            if (special == "navbar"){
              he = he - 72;
            }

            else {
              he = he - 172;
            }
            
            $('body').toggleClass('lense2');
            $('body').toggleClass('lense');


            $("#shelf").css({
              "-webkit-transform": "translateY(" + he + "px" + ")",
              "-moz-transform": "translateY(" + he + "px" + ")", 
              "-ms-transform": "translateY(" + he + "px" + ")", 
              "-o-transform": "translateY(" + he + "px" + ")",
              "transform": "translateY(" + he + "px" + ")"
            });


            $("#leafletmap").css({"height": he + "px" }); 
            /// END BUG FIX
            
        }    

        else {

          $('body').toggleClass('lense');

          $("#shelf").css({
            "-webkit-transform": "translateY(" + 0 + "px" + ")",
            "-moz-transform": "translateY(" + 0 + "px" + ")", 
            "-ms-transform": "translateY(" + 0 + "px" + ")", 
            "-o-transform": "translateY(" + 0 + "px" + ")",
            "transform": "translateY(" + 0 + "px" + ")"
          });

          console.log('here2');

          $("#leafletmap").css({"height": 183 + "px" });

        }




        

        



      }

      else if ( $("body").hasClass("lense2") ) {



        console.log('here3');

        he = $(window).height();

        if (special == "navbar"){
          he = he - 72;
        }

        else {
          he = he - 172;
        }
        

        $('body').toggleClass('lense2');
        $('body').toggleClass('lense');


        $("#shelf").css({
          "-webkit-transform": "translateY(" + he + "px" + ")",
          "-moz-transform": "translateY(" + he + "px" + ")", 
          "-ms-transform": "translateY(" + he + "px" + ")", 
          "-o-transform": "translateY(" + he + "px" + ")",
          "transform": "translateY(" + he + "px" + ")"
        });



        $("#leafletmap").css({"height": he + "px" });



      }

      else {

        console.log('here1');

        // console.log(amount);
        // console.log('noclass');

        he = $(window).height();


        if (special == "navbar"){
          he = he - 72;
        }

        else {
          he = he - 172;
        }

        $('body').toggleClass('lense');
       // $("#shelf").css({"-webkit-transform": "translateY(" + he + "px" + ")"});

        $("#shelf").css({
          "-webkit-transform": "translateY(" + he + "px" + ")",
          "-moz-transform": "translateY(" + he + "px" + ")", 
          "-ms-transform": "translateY(" + he + "px" + ")", 
          "-o-transform": "translateY(" + he + "px" + ")",
          "transform": "translateY(" + he + "px" + ")"
        });

        $("#leafletmap").css({"height": he + "px" });

       
      }

    }


    if (amount == 'partial'){


      if ( $("body").hasClass("lense") ) {

        // console.log(amount);
        // console.log('lense');

        $('body').toggleClass('lense');
        // $('body').toggleClass('lense2');

        $("#shelf").css({
          "-webkit-transform": "translateY(" + 0 + "px" + ")",
          "-moz-transform": "translateY(" + 0 + "px" + ")", 
          "-ms-transform": "translateY(" + 0 + "px" + ")", 
          "-o-transform": "translateY(" + 0 + "px" + ")",
          "transform": "translateY(" + 0 + "px" + ")"
        });
        //$('body').toggleClass('lense2');

        $("#leafletmap").css({"height": 149 + "px" });
      }

      else if ( $("body").hasClass("lense2") ) {

        // console.log(amount);
        // console.log('lense2 else if');
        $('body').toggleClass('lense2');

        $("#shelf").css({
          "-webkit-transform": "translateY(" + 0 + "px" + ")",
          "-moz-transform": "translateY(" + 0 + "px" + ")", 
          "-ms-transform": "translateY(" + 0 + "px" + ")", 
          "-o-transform": "translateY(" + 0 + "px" + ")",
          "transform": "translateY(" + 0 + "px" + ")"
        });

        $("#leafletmap").css({"height": 149 + "px" });
      }

      else {
        // console.log(amount);
        // console.log('lense2 else');
        $('body').toggleClass('lense2');

        $("#shelf").css({
          "-webkit-transform": "translateY(" + 149 + "px" + ")",
          "-moz-transform": "translateY(" + 149 + "px" + ")", 
          "-ms-transform": "translateY(" + 149 + "px" + ")", 
          "-o-transform": "translateY(" + 149 + "px" + ")",
          "transform": "translateY(" + 149 + "px" + ")"
        });

        $("#leafletmap").css({"height": 149 + "px" });

      }


    }


    // //ONLY FOR LANDMARK DETAIL//
    // if (amount == 'partialDetail'){



    //     console.log(amount);
    //     console.log('lense2 else');

    //     $('body').toggleClass('lense2');

    //     $("#shelf").css({
    //       "-webkit-transform": "translateY(" + 149 + "px" + ")",
    //       "-moz-transform": "translateY(" + 149 + "px" + ")", 
    //       "-ms-transform": "translateY(" + 149 + "px" + ")", 
    //       "-o-transform": "translateY(" + 149 + "px" + ")",
    //       "transform": "translateY(" + 149 + "px" + ")"
    //     });

    //     $("#leafletmap").css({"height": 149 + "px" });

      

    // }

    // //////////

    if (amount == "new"){

        $('body').toggleClass('lense');

        $("#shelf").css({
          "-webkit-transform": "translateY(" + 250 + "px" + ")",
          "-moz-transform": "translateY(" + 250 + "px" + ")", 
          "-ms-transform": "translateY(" + 250 + "px" + ")", 
          "-o-transform": "translateY(" + 250 + "px" + ")",
          "transform": "translateY(" + 250 + "px" + ")"
        });

        $("#leafletmap").css({"height": 250 + "px" });

    }



  }



  //---------------------//

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

L.AreaSelect = L.Class.extend({
    includes: L.Mixin.Events,
    
    options: {
        width: 200,
        height: 300,
        keepAspectRatio: false,
    },

    initialize: function(options) {
        L.Util.setOptions(this, options);

        // TEMPORARY!!!!
        //map the dimension of the image to a ratio to divide it by, so if >2000px && <3000px then divide by range of 1-10
        if (this.options.width > 1000 || this.options.height > 1000){
            this._width = this.options.width / 8;
            this._height = this.options.height / 8;
        }
        else {
            this._width = this.options.width;
            this._height = this.options.height;
        }

    },
    
    addTo: function(map) {
        this.map = map;
        this._createElements();
        this._render();
        return this;
    },
    
    getBounds: function() {
        var size = this.map.getSize();
        var topRight = new L.Point();
        var bottomLeft = new L.Point();
        
        bottomLeft.x = Math.round((size.x - this._width) / 2);
        topRight.y = Math.round((size.y - this._height) / 2);
        topRight.x = size.x - bottomLeft.x;
        bottomLeft.y = size.y - topRight.y;
        
        var sw = this.map.containerPointToLatLng(bottomLeft);
        var ne = this.map.containerPointToLatLng(topRight);
        
        return new L.LatLngBounds(sw, ne);
    },
    
    remove: function() {
        this.map.off("moveend", this._onMapChange);
        this.map.off("zoomend", this._onMapChange);
        this.map.off("resize", this._onMapResize);
        
        this._container.remove();
    },
    
    _createElements: function() {
        if (!!this._container)
            return;
        
        this._container = L.DomUtil.create("div", "leaflet-areaselect-container", this.map._controlContainer)
        this._topShade = L.DomUtil.create("div", "leaflet-areaselect-shade", this._container);
        this._bottomShade = L.DomUtil.create("div", "leaflet-areaselect-shade", this._container);
        this._leftShade = L.DomUtil.create("div", "leaflet-areaselect-shade", this._container);
        this._rightShade = L.DomUtil.create("div", "leaflet-areaselect-shade", this._container);
        
        this._nwHandle = L.DomUtil.create("div", "leaflet-areaselect-handle", this._container);
        this._swHandle = L.DomUtil.create("div", "leaflet-areaselect-handle", this._container);
        this._neHandle = L.DomUtil.create("div", "leaflet-areaselect-handle", this._container);
        this._seHandle = L.DomUtil.create("div", "leaflet-areaselect-handle", this._container);
        
        this._setUpHandlerEvents(this._nwHandle);
        this._setUpHandlerEvents(this._neHandle, -1, 1);
        this._setUpHandlerEvents(this._swHandle, 1, -1);
        this._setUpHandlerEvents(this._seHandle, -1, -1);
        
        this.map.on("moveend", this._onMapChange, this);
        this.map.on("zoomend", this._onMapChange, this);
        this.map.on("resize", this._onMapResize, this);
        
        this.fire("change");
    },
    
    _setUpHandlerEvents: function(handle, xMod, yMod) {
        xMod = xMod || 1;
        yMod = yMod || 1;
        
        var self = this;
        function onMouseDown(event) {
            event.stopPropagation();
            L.DomEvent.removeListener(this, "mousedown", onMouseDown);
            var curX = event.x;
            var curY = event.y;
            var ratio = self._width / self._height;
            var size = self.map.getSize();
            
            function onMouseMove(event) {
                if (self.options.keepAspectRatio) {
                    var maxHeight = (self._height >= self._width ? size.y : size.y * (1/ratio) ) - 30;
                    self._height += (curY - event.originalEvent.y) * 2 * yMod;
                    self._height = Math.max(30, self._height);
                    self._height = Math.min(maxHeight, self._height);
                    self._width = self._height * ratio;
                } else {
                    self._width += (curX - event.originalEvent.x) * 2 * xMod;
                    self._height += (curY - event.originalEvent.y) * 2 * yMod;
                    self._width = Math.max(30, self._width);
                    self._height = Math.max(30, self._height);
                    self._width = Math.min(size.x-30, self._width);
                    self._height = Math.min(size.y-30, self._height);
                    
                }
                
                curX = event.originalEvent.x;
                curY = event.originalEvent.y;
                self._render();
            }
            function onMouseUp(event) {
                L.DomEvent.removeListener(self.map, "mouseup", onMouseUp);
                L.DomEvent.removeListener(self.map, "mousemove", onMouseMove);
                L.DomEvent.addListener(handle, "mousedown", onMouseDown);
                self.fire("change");
            }
            
            L.DomEvent.addListener(self.map, "mousemove", onMouseMove);
            L.DomEvent.addListener(self.map, "mouseup", onMouseUp);
        }
        L.DomEvent.addListener(handle, "mousedown", onMouseDown);
    },
    
    _onMapResize: function() {
        this._render();
    },
    
    _onMapChange: function() {
        this.fire("change");
    },
    
    _render: function() {
        var size = this.map.getSize();
        var handleOffset = Math.round(this._nwHandle.offsetWidth/2);
        
        var topBottomHeight = Math.round((size.y-this._height)/2);
        var leftRightWidth = Math.round((size.x-this._width)/2);

        console.log(handleOffset);
        console.log(topBottomHeight);
        console.log(leftRightWidth);
        
        function setDimensions(element, dimension) {
            element.style.width = dimension.width + "px";
            element.style.height = dimension.height + "px";
            element.style.top = dimension.top + "px";
            element.style.left = dimension.left + "px";
            element.style.bottom = dimension.bottom + "px";
            element.style.right = dimension.right + "px";
        }
        
        //dimensions for shadows
        setDimensions(this._topShade, {width:size.x, height:topBottomHeight, top:0, left:0});
        setDimensions(this._bottomShade, {width:size.x, height:topBottomHeight, bottom:0, left:0});
        setDimensions(this._leftShade, {
            width: leftRightWidth, 
            height: size.y-(topBottomHeight*2), 
            top: topBottomHeight, 
            left: 0
        });
        setDimensions(this._rightShade, {
            width: leftRightWidth, 
            height: size.y-(topBottomHeight*2), 
            top: topBottomHeight, 
            right: 0
        });
        
        //dimensions for handles
        setDimensions(this._nwHandle, {left:leftRightWidth-handleOffset, top:topBottomHeight-7});
        setDimensions(this._neHandle, {right:leftRightWidth-handleOffset, top:topBottomHeight-7});
        setDimensions(this._swHandle, {left:leftRightWidth-handleOffset, bottom:topBottomHeight-7});
        setDimensions(this._seHandle, {right:leftRightWidth-handleOffset, bottom:topBottomHeight-7});
    }
});

L.areaSelect = function(options) {
    return new L.AreaSelect(options);
}

'use strict';

/* Services */

var res;

angular.module('tidepoolsServices', ['ngResource'])

	.factory('Landmark', ['$resource', '$http',
        function($resource, $http) {
			var actions = {
                'count': {method:'PUT', params:{_id: 'count'}, server: true},                           
                'distinct': {method:'PUT', params:{_id: 'distinct'}, server: true},      
                'find': {method:'PUT', params:{_id: 'find'}, isArray:true, server: true},              
                'group': {method:'PUT', params:{_id: 'group'}, isArray:true, server: true},            
                'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true, server: true},  
                'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true, server: true},
                'del': {method:'DELETE', params:{_id: 'del'}, isArray:false, server: true},
                'get': {method: 'GET', server: true}
            }
            res = $resource('/api/landmarks/:_id:id', {}, actions);
            return res;
        }
    ])

    .factory('World', ['$resource', '$http', 'leafletData', 
        function($resource, $http, leafletData) {
            var actions = {
                'count': {method:'PUT', params:{_id: 'count'}, server: true},                           
                'distinct': {method:'PUT', params:{_id: 'distinct'}, server: true},      
                'find': {method:'PUT', params:{_id: 'find'}, isArray:true, server: true},              
                'group': {method:'PUT', params:{_id: 'group'}, isArray:true, server: true},            
                'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true, server: true},  
                'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true, server: true},
                'del': {method:'DELETE', params:{_id: 'del'}, isArray:true, server: true},
                'get': {method: 'GET', server: true}
            }
            res = $resource('/api/worlds/:_id:id', {}, actions);
            return res;
        }
    ])
    .factory('db', ['$resource', '$http',    
        function($resource, $http) {
    		var actions = {
                    'count': {method:'PUT', params:{_id: 'count', server: true}},                           
                    'distinct': {method:'PUT', params:{_id: 'distinct', server: true}},      
                    'find': {method:'PUT', params:{_id: 'find'}, isArray:true, server: true},              
                    'group': {method:'PUT', params:{_id: 'group'}, isArray:true, server: true},            
                    'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true, server: true},  
                    'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true, server: true},
                    'create':  {method:'POST', params:{_id: 'create'}, isArray:true, server: true},
                    'locsearch':  {method:'GET', params:{_id: 'locsearch'}, isArray:true, server: true},
                    'query':  {method:'GET', isArray:true, server: true},
                }
            var db = {};
            db.worlds = $resource('/api/worlds/:_id', {}, actions);
            db.landmarks = $resource('/api/landmarks/:_id:id', {}, actions);
            db.styles = $resource('/api/styles/:_id', {}, actions);
            db.projects = $resource('/api/projects/:_id', {}, actions);
            db.tweets = $resource('/api/tweets/:_id', {}, actions);
            db.instagrams = $resource('/api/instagrams/:_id', {}, actions);
            db.messages = $resource('/api/worldchat/:_id', {}, actions);
            db.visit = $resource('/api/visit/:_id', {}, actions);
            return db;
        }
    ])
    .factory('apertureService', ['leafletData','mapManager',
    	function(leafletData,mapManager) {
	    	var aperture = {
				off: true,
				state: 'aperture-off',
				navfix:  'navfix'
	    	}
	    	var map = mapManager;
	    	
	    	
	    	aperture.toggle = function(state) {
	    		if (aperture.state != 'aperture-full')  {
		    			aperture.off = false;
		    			console.log('toggling aperture on');
		    			aperture.navfix = '';
						if (state == 'half') {
						aperture.set('half');
						}
						if (state == 'full') {
						aperture.set('full');
						}
				} else {
					console.log('off');
					aperture.off = true;
					aperture.state = 'aperture-off';
					aperture.navfix = 'navfix';
				}
				
			
			}
			
			aperture.set = function(state) {
				switch (state) {
					case 'off':
						if (aperture.state!='aperture-off') {
							aperture.off = true;
							aperture.state = 'aperture-off';
							aperture.navfix = 'navfix';
							map.apertureUpdate('aperture-off');
						}
						break;
					case 'third': 
						if (aperture.state!='aperture-third') {
							aperture.off = false;
							aperture.state = 'aperture-third';
							aperture.navfix = '';
							map.apertureUpdate('aperture-third');
						}
						break;
					case 'half':
						if (aperture.state!='aperture-half') {
							aperture.off = false;
							aperture.state = 'aperture-half';
							aperture.navfix = '';
							map.apertureUpdate('aperture-half');
						}
						break;
					case 'full':
						if (aperture.state!='aperture-full') {
							aperture.off = false;
							aperture.state = 'aperture-full';
							aperture.navfix = '';
							map.apertureUpdate('aperture-full');
						}
						break;
				}
				}
			return aperture;
    }])

    // .service('mapper', ['$scope', function($scope) {
            
    //         this.view = function() {
    //             //console.log('MAP');
    //             angular.extend($scope, {
    //                 center: {
    //                     lat: 42.356810,
    //                     lng: -83.0610023,
    //                     zoom: 14
    //                 }
    //             });
    //         }
            
    //     }
    // ]);


    // .factory('map', ['$resource', '$http',    
    //     function(type,filter) {
    //        console.log("asdf")
    //     }
    // ]);


    // .factory('map', function(type,filter) {

    //     console.log(type,filter);

    // });

	//handling alerts


   //socket connection
	.factory('socket', function ($rootScope) {
	  var socket = io.connect();
	  return {
	    on: function (eventName, callback) {
	      socket.on(eventName, function () {  
	        var args = arguments;
	        $rootScope.$apply(function () {
	          callback.apply(socket, args);
	        });
	      });
	    },
	    emit: function (eventName, data, callback) {
	      socket.emit(eventName, data, function () {
	        var args = arguments;
	        $rootScope.$apply(function () {
	          if (callback) {
	            callback.apply(socket, args);
	          }
	        });
	      })
	    }
	  };
	});
app.factory('alertManager', ['$timeout', function ($timeout) {
   		var alerts = {
   			'list':[ 
   			]
   		}; //Used to manage alerts posted to top of page. Needs better API 

   		alerts.addAlert = function(alertType, alertMsg, timeout) {
   			var alertClass;
   			switch (alertType) {
	   			case 'success':
	   				alertClass = 'alert-success';
	   				break;
	   			case 'info':
	   				alertClass = 'alert-info';
	   				break;
	   			case 'warning':
	   				alertClass = 'alert-warning';
	   				break;
	   			case 'danger': 
	   				alertClass = 'alert-danger';
	   				break;
   			}
   			var len = alerts.list.push(
 {class: alertClass, msg: alertMsg, id: alertMsg});
   			if (timeout) {
   			$timeout(function () {
	   			alerts.list.splice(len-1, 1);
   			}, 1500);
   			
   			}
   		}

   		alerts.closeAlert = function(index) {
   			alerts.list.splice(index, 1);
   		}
   		
   		alerts.notify = function(alert) {
	   		alerts.list.push(alert); 
   		}

   		return alerts;
   }])
'use strict';
// keep track of which type of bubble user is currently viewing
app
	.factory('bubbleTypeService', [
		function() {
			
			var currentBubbleType;

			return {
				set: set,
				get: get
			}

			function set(type) {
				currentBubbleType = type;
			}

			function get() {
				return currentBubbleType;
			}
}]);
angular.module('tidepoolsServices')
	.factory('dialogs', ['$rootScope', '$compile', 
function($rootScope, $compile) {
var dialogs = {
	dialogTemplate: null
} //used to manage different popup dialogs and modals

dialogs.showDialog = function(name) {
	dialogs.template = "templates/"+name;
	dialogs.show = true;
}

dialogs.close = function($event) {
	if($event.target.className.indexOf('dialog-bg')>-1 || $event.target.className.indexOf('closeElement')>-1){ 
		dialogs.show = false;
	}
}

return dialogs;
}]);
angular.module('tidepoolsServices')
    .factory('geoService', [ '$q', 'alertManager',
    	function($q, alertManager) {
//abstract & promisify geolocation, queue requests.
var geoService = {
	location: {
		//lat,
		//lng
		//timestamp  
	},
	inProgress: false,
	requestQueue: [] 
}	
 
geoService.getLocation = function(maxAge) {
	var deferred = $q.defer();
	
	geoService.requestQueue.push(deferred);

	if (geoService.inProgress) {
		// inprog
	} else if (navigator.geolocation) {
		geoService.inProgress = true;
		console.log('geo: using navigator');
		
		function geolocationSuccess(position) {
			geoService.location.lat = position.coords.latitude;
			geoService.location.lng = position.coords.longitude;
			geoService.location.timestamp = Date.now();
			geoService.resolveQueue({
				lat: position.coords.latitude,
				lng: position.coords.longitude
			})
		}

		function geolocationError(error) {
			geoService.resolveQueue({err: error.code});
		}
		
		navigator.geolocation.getCurrentPosition(geolocationSuccess, 
			geolocationError);

	} else {
		//browser update message
		alerts.addAlert('warning', 'Your browser does not support location services.')
	}
	
	return deferred.promise;
}

geoService.resolveQueue = function (position) {
	while (geoService.requestQueue.length > 0) {
		var request = geoService.requestQueue.pop();
		if (position.err) {
			request.reject(position.err);
		} else {
			request.resolve(position);
		}
	}
	geoService.inProgress = false;
}

return geoService;
}]);
'use strict';
//maintain globals across app, centralize some constants
angular.module('tidepoolsServices')
	.factory('ifGlobals', [
		function() {
			var ifGlobals = {
				kinds: {
					Convention: {
						name: 'Convention', 
						hasTime: true, 
						img: 'convention.png', 
						icon: 'convention.svg'
					},
					Event: {
						name: 'Event', 
						hasTime: true, 
						img: 'event.png', 
						icon: 'event.svg'
					},
					Neighborhood: {
						name: 'Neighborhood', 
						hasTime: false, 
						img: 'neighborhood.png', 
						icon: 'neighborhood.svg'
					},
					Venue: {
						name: 'Venue', 
						hasTime: false, 
						img: 'venue.png', 
						icon: 'venue.svg'
					},
					Park: {
						name: 'Park', 
						hasTime: false, 
						img: 'park.png', 
						icon: 'park.svg'
					},
					Retail: {
						name: 'Retail', 
						hasTime: false, 
						img: 'retail.png', 
						icon: 'retail.svg'
					},
					Campus: {
						name: 'Campus', 
						hasTime: false, 
						img: 'campus.png', 
						icon: 'campus.svg'
					},
					Home: {
						name: 'Home', 
						hasTime: false, 
						img: 'home.png', 
						icon: 'home.svg'
					},
					Other: {
						name: 'Other', 
						hasTime: true, 
						img: 'other.png'
					}
				},
				stickers: {
					Favorite: {
						name: 'Favorite', 
						img: 'img/stickers/favorite.png', 
						iconInfo: {
							iconUrl: 'img/stickers/favorite.png', 
							iconSize: [100,100], 
							iconAnchor: [50, 100], 
							popupAnchor: [0, -80]
						}
					},
					FixThis: {
						name: 'Fix This', 
						img: 'img/stickers/fixthis.png', 
						iconInfo: {
							iconUrl: 'img/stickers/fixthis.png', 
							iconSize: [100,100], 
							iconAnchor: [50, 100], 
							popupAnchor: [0, -80]
						}
					},
					Food: {
						name: 'Food', 
						img: 'img/stickers/food.png', 
						iconInfo: {
							iconUrl: 'img/stickers/food.png', 
							iconSize: [100,100], 
							iconAnchor: [50, 100], 
							popupAnchor: [0, -80]
						}
					},
					ImHere: {
						name: "I'm Here", 
						img: 'img/stickers/im_here.png', 
						iconInfo: {
							iconUrl: 'img/stickers/im_here.png', 
							iconSize: [100,100], 
							iconAnchor: [50, 100], 
							popupAnchor: [0, -80]
						}
					},
					Interesting: {
						name: 'Interesting', 
						img: 'img/stickers/interesting.png', 
						iconInfo: {
							iconUrl: 'img/stickers/interesting.png', 
							iconSize: [100,100], 
							iconAnchor: [50, 100], 
							popupAnchor: [0, -80]
						}
					},
					WereHere: {
						name: "We're Here", 
						img: 'img/stickers/were_here.png', 
						iconInfo: {
							iconUrl: 'img/stickers/were_here.png', 
							iconSize: [100,100], 
							iconAnchor: [50, 100], 
							popupAnchor: [0, -80]
						}
					}
				},
				mapThemes: {
					arabesque: {
						name: 'Arabesque', 
						cloudMapName:'arabesque', 
						cloudMapID:'interfacefoundry.ig67e7eb', 
						img: 'img/mapbox/arabesque_small.png'
					},
					fairy: {
						name: 'Fairy', 
						cloudMapName:'fairy', 
						cloudMapID:'interfacefoundry.ig9jd86b', 
						img: 'img/mapbox/fairy_small.png'
					},
					sunset: {
						name: 'Sunset', 
						cloudMapName:'sunset', 
						cloudMapID:'interfacefoundry.ig6f6j6e', 
						img: 'img/mapbox/sunset_small.png'
					},
					urban: {
						name: 'Urban', 
						cloudMapName:'urban', 
						cloudMapID:'interfacefoundry.ig6a7dkn', 
						img: 'img/mapbox/urban_small.png'
					},
					haze: {
						name: 'Haze', 
						cloudMapName:'purple haze', 
						cloudMapID:'interfacefoundry.ig1oichl', 
						img: 'img/mapbox/haze_small.png'
					},
					mimis: {
						name: 'Mimis', 
						cloudMapName: 'mimis', 
						cloudMapID: 'interfacefoundry.b28f1c55', 
						img: 'img/mapbox/mimis_small.png'
					}
				}
			}

			ifGlobals.getBasicHeader = function() {
				var string = ifGlobals.username+":"+ifGlobals.password;
				var encodedString = window.btoa(string);
				return "Basic "+encodedString;
			}

		return ifGlobals;
}]);
'use strict';

angular.module('tidepoolsServices')
    .factory('mapManager', ['leafletData', '$rootScope', 'bubbleTypeService',
		function(leafletData, $rootScope, bubbleTypeService) { //manages and abstracts interfacing to leaflet directive
var mapManager = {
	center: {
		lat: 42,
		lng: -83,
		zoom: 14
	},
	markers: {},
	layers: {
		baselayers: {
			baseMap: {
				name: "Urban",
				url: 'https://{s}.tiles.mapbox.com/v3/interfacefoundry.ig6a7dkn/{z}/{x}/{y}.png',
				type: 'xyz',
				top: true,
				maxZoom: 23,
    			maxNativeZoom: 23
			}
		},
		overlays: {
		}
	},
	paths: {/*
worldBounds: {
			type: 'circle',
			radius: 150,
			latlngs: {lat:40, lng:20}
		}
*/},
	maxbounds: {},
	defaults: {
		controls: {
			layers: {
				visible: false,
				position: 'bottomright',
				collapsed: true
			}
		},
		zoomControlPosition: 'bottomleft',
	}
};

mapManager.setCenter = function(latlng, z, state) { //state is aperture state
	console.log('--mapManager--');
	console.log('--setCenter--', latlng, z, state);
	mapManager._actualCenter = latlng;
	mapManager._z = z;
	
	switch (state) {
		case 'aperture-half':
			mapManager.setCenterWithAperture(latlng, z, 0, .25)
			break;
		case 'aperture-third': 
			mapManager.setCenterWithAperture(latlng, z, 0, .35);
			break;
		case 'editor':
			mapManager.setCenterWithAperture(latlng, z, -.2,0);
			break;
		default:
			angular.extend(mapManager.center, {lat: latlng[1], lng: latlng[0], zoom: z});
			mapManager.refresh();
	}
}

mapManager.setCenterWithAperture = function(latlng, z, xpart, ypart) {
	console.log('setCenterWithAperture', latlng, z, xpart, ypart);
	var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
		w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
		targetPt, targetLatLng;
	console.log(h,w);
	
	leafletData.getMap().then(function(map) {
			targetPt = map.project([latlng[1], latlng[0]], z).add([w*xpart,h*ypart-(68/2)]); // where 68px is the height of #top-shelf
			console.log(targetPt);
			targetLatLng = map.unproject(targetPt, z);
			console.log(targetLatLng);
			angular.extend(mapManager.center, {lat: targetLatLng.lat, lng: targetLatLng.lng, zoom: z});
			console.log(mapManager.center);
			mapManager.refresh();
	});
}

mapManager.setCenterWithFixedAperture = function(latlng, z, xOffset, yOffset) {
	var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
		w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0), targetPt, targetLatLng, dX, dY;

	if (xOffset) { dX = w/2 - xOffset/2;} else {dX = 0}
	if (yOffset) { dY = h/2 - yOffset/2 - 30;} else {dY = -30}

	leafletData.getMap().then(function(map) {
		targetPt = map.project([latlng[1], latlng[0]], z).add([dX, dY]);
		targetLatLng = map.unproject(targetPt, z);
		angular.extend(mapManager.center, {lat: targetLatLng.lat, lng: targetLatLng.lng, zoom: z});
		mapManager.refresh();
	});
}

mapManager.apertureUpdate = function(state) {
	if (mapManager._actualCenter && mapManager._z) {
		mapManager.setCenter(mapManager._actualCenter, mapManager._z, state);
	}
}

//use bounds from array of markers to set more accruate center
mapManager.setCenterFromMarkers = function(markers) {
	leafletData.getMap().then(function(map) {
		map.fitBounds(
			L.latLngBounds(markers.map(latLngFromMarker)),
			{maxZoom: 20}
		)
	});
	
	function latLngFromMarker(marker) {
		return [marker.lat, marker.lng];
	}
}

mapManager.resetMap = function() {
	mapManager.removeAllMarkers();
	mapManager.removeAllPaths();
	mapManager.removeOverlays();
	mapManager.removeCircleMask();
	mapManager.removePlaceImage();
	mapManager.refresh();
}

/* addMarker
Key: Name of marker to be added
Marker: Object representing marker
Safe: Optional. If true, does not overwrite existing markers. Default false
*/
mapManager.addMarker = function(key, marker, safe) {
		console.log('--addMarker('+key+','+marker+','+safe+')--');
	if (mapManager.markers.hasOwnProperty(key)) { //key is in use
		if (safe == true) {
			//dont replace
			console.log('Safe mode cant add marker: Key in use');
			return false;
		} else {
			mapManager.markers[key] = marker;
			console.log('Marker added');
		}
	} else {
		mapManager.markers[key] = marker;
		console.log('Marker added');
	}
	return true;
}

mapManager.addMarkers = function(markers) {
	if (_.isArray(markers)) {
		angular.extend(mapManager.markers, _.indexBy(markers, function(marker) {
			return marker._id;
		}))
	} else {
		angular.extend(mapManager.markers, markers);
	}
}


mapManager.getMarker = function(key) {
	console.log('--getMarker('+key+')--');
	if (mapManager.markers.hasOwnProperty(key)) {
		console.log('Marker found!');
		console.log(mapManager.markers[key]);
		return mapManager.markers[key];
	} else {
		console.log('Key not found in Markers');
		return false;
	}
}

mapManager.removeMarker = function(key) {
	console.log('--removeMarker('+key+')--');
	if (mapManager.markers.hasOwnProperty(key)) {
		console.log('Deleting marker');
		delete mapManager.markers[key];
		return true;
	} else {
		console.log('Key not found in Markers');
		return false;
	}
}

mapManager.removeAllMarkers = function() {
	console.log('--removeAllMarkers--');
	mapManager.markers = {};
}

mapManager.setMarkers = function(markers) {
	if (_.isArray(markers)) {
		mapManager.markers = _.indexBy(markers, function(marker) {
			return marker._id;
		})
	} else {
		mapManager.markers = markers;
	}
}

mapManager.setMarkerMessage = function(key, msg) {
	console.log('--setMarkerMessage()--');
	if (mapManager.markers.hasOwnProperty(key)) {
		console.log('Setting marker message');
		angular.extend(mapManager.markers[key], {'message': msg});
		//refreshMap();
		return true;
	} else {
		console.log('Key not found in Markers');
		return false;
	}
}

mapManager.setMarkerFocus = function(key) {
	console.log('--setMarkerFocus('+key+')--');
	if (mapManager.markers.hasOwnProperty(key)) {
		console.log('Setting marker focus');
		angular.forEach(mapManager.markers, function(marker) {					
			marker.focus = false;
			console.log(marker);
		});
		mapManager.markers[key].focus = true; 
		console.log(mapManager.markers);
		return true;
	} else {
		console.log('Key not found in Markers');
		return false;
	}
}

mapManager.setMarkerSelected = function(key) {
	console.log('--setMarkerSelected()--');
	
	// reset all marker images to default
	angular.forEach(mapManager.markers, function(marker) {
		if (bubbleTypeService.get() !== 'Retail') {
			marker.icon.iconUrl = 'img/marker/bubble-marker-50.png';
		}
	});

	// set new image for selected marker
	if (mapManager.markers.hasOwnProperty(key)) {
		console.log('setting marker as selected');
		if (bubbleTypeService.get() !== 'Retail' ||	mapManager.markers[key].icon.iconUrl === 'img/marker/bubble-marker-50.png') {
			mapManager.markers[key].icon.iconUrl = 'img/marker/bubble-marker-50_selected.png';
		}
		return true;
	} else {
		console.log('Key not found in markers');
		return false;
	}
};

mapManager.setNewIcon = function(landmark) {
	mapManager.markers[landmark._id].icon.iconUrl = landmark.avatar;
	mapManager.markers[landmark._id].icon.iconAnchor = [25, 25];
	mapManager.markers[landmark._id].icon.iconSize = [50, 50];
}

mapManager.bringMarkerToFront = function(key) {
	console.log('--bringMarkerToFront--');

	// reset all z-indices to 0
	angular.forEach(mapManager.markers, function(marker) {
		marker.zIndexOffset = 0;
	});

	// set z-index for selected marker
	if (mapManager.markers.hasOwnProperty(key)) {
		console.log('setting z-index offset');
		mapManager.markers[key].zIndexOffset = 1000;
		return true;
	} else {
		console.log('Key not found in markers');
		return false;
	}
};

/* addPath
Key: Name of path to be added
Path: Object representing path in leafletjs style
Safe: Optional. If true, does not overwrite existing paths. Default false.
*/
mapManager.addPath = function(key, path, safe) {
	console.log('--addPath('+key+','+path+','+safe+')--');
	if (mapManager.paths.hasOwnProperty(key)) { //key is in use
		if (safe == true) {		
			//dont delete
			console.log('Safe mode cant add path: Key in use'); 
			return false;
		} else {
			console.log('else1');
			mapManager.paths[key] = path;
			console.log(mapManager.paths[key]);
			return mapManager.paths[key];
		}	
	} else { //key is free
		console.log('else2');
		mapManager.paths[key] = path; 
		console.log(mapManager.paths[key]);
		return mapManager.paths[key];
	}
	
	refreshMap();
}

mapManager.removeAllPaths = function() {
	mapManager.paths = {};
}

/* setTiles
Name: Name of tileset from dictionary
*/
mapManager.setTiles = function(name) {
	console.log('DO NOT USE');
	console.log('--setTiles('+name+'--');
	angular.extend(mapManager.tiles, tilesDict[name]); 
	refreshMap();
}

/* setMaxBounds
	set the two corners of the map view maxbounds
southWest: array of latitude, lng
northEast: array of latitude, lng
*/
mapManager.setMaxBounds = function(sWest, nEast) {
		console.log('--setMaxBounds('+sWest+','+nEast+')--');
	leafletData.getMap().then(function(map) {
		map.setMaxBounds([
			[sWest[0], sWest[1]],
			[nEast[0], nEast[1]]
		]);
	mapManager.refresh();
	});
}

/* setMaxBoundsFromPoint
	set max bounds with a point and a distance
	point: the center of the max bounds
	distance: orthogonal distance from point to bounds
*/ 
mapManager.setMaxBoundsFromPoint = function(point, distance) {
	leafletData.getMap().then(function(map) {
		setTimeout(function() {map.setMaxBounds([
			[point[0]-distance, point[1]-distance],
			[point[0]+distance, point[1]+distance]
		])}, 400);
	mapManager.refresh();
	});
	return true;
}

mapManager.refresh = function() {
	refreshMap();
}

function refreshMap() { 
	console.log('--refreshMap()--');
    console.log('invalidateSize() called');
    leafletData.getMap().then(function(map){
   	 setTimeout(function(){ map.invalidateSize()}, 400);
    });
}

mapManager.setBaseLayer = function(layerURL, localMaps) {
	console.log('new base layer');

	mapManager.layers.baselayers = {};
	mapManager.layers.baselayers[layerURL] = {
		name: 'newBaseMap',
		url: layerURL,
		type: 'xyz',
		layerParams: {},
		layerOptions: {
			minZoom: 1,
			maxZoom: 23
		}
	};	
}

mapManager.findZoomLevel = function(localMaps) {
	if (!localMaps) {
		return;
	}
	var zooms = _.chain(localMaps)
		.map(function(m) {
			if (m.localMapOptions){
				return m.localMapOptions.minZoom;
			}
		})
		.filter(function(m) {
			return m;
		})
		.value();
	var lowestZoom = _.isEmpty(zooms) ? null : _.min(zooms);

	return lowestZoom;
}

mapManager.setBaseLayerFromID = function(ID) {
	mapManager.setBaseLayer(
	'https://{s}.tiles.mapbox.com/v3/'+
	ID+
	'/{z}/{x}/{y}.png');
}

mapManager.findMapFromArray = function(mapArray) {
	// sort floors low to high and get rid of null floor_nums
	var sortedFloors = _.chain(mapArray)
		.filter(function(floor) {
			return floor.floor_num;
		})
		.sortBy(function(floor) {
			return floor.floor_num;
		})
		.value();
	// will return lowest number floor or undefined if none
	sortedFloors = sortedFloors.filter(function(floor) {
		return floor.floor_num === sortedFloors[0].floor_num;
	});

	return sortedFloors;
}


mapManager.addOverlay = function(localMapID, localMapName, localMapOptions) {
	console.log('addOverlay');

	var newOverlay = {};
	// if (localMapOptions.maxZoom>19) {
	// 	localMapOptions.maxZoom = 19;
	// }
	localMapOptions.zIndex = 10;
	console.log('requesting new overlay')
	mapManager.layers.overlays[localMapName] = {
		name: localMapName,
		type: 'xyz',
		url: 'https://bubbl.io/maps/'+localMapID+'/{z}/{x}/{y}.png',
		layerOptions: localMapOptions,
		visible: true,
		opacity: 0.8
	};/*
	

	mapManager.layers.overlays = newOverlay;
*/
	console.log(mapManager);
	console.log(newOverlay);
	// mapManager.refresh();
};

mapManager.removeOverlays = function() {
	mapManager.layers.overlays = {};
	mapManager.refresh();
}


mapManager.addCircleMaskToMarker = function(key, radius, state) {
	console.log('addCircleMaskToMarker');
	mapManager.circleMaskLayer = new L.IFCircleMask(mapManager.markers[key], 120, state);
	leafletData.getMap().then(function(map) {
	map.addLayer(mapManager.circleMaskLayer);
	mapManager._cMLdereg = $rootScope.$on('leafletDirectiveMarker.dragend', function(event) {
		mapManager.circleMaskLayer._draw();
	});
	});
}

mapManager.localMapArrayExists = function(world) {
	return world && world.style && world.style.maps 
		&& world.style.maps.localMapArray && world.style.maps.localMapArray.length > 0;
}

mapManager.filterToCurrentFloor = function(sortedFloors, currentFloor) {
	return sortedFloors.filter(function(f) {
		return f.floor_num === currentFloor;
	});
}

mapManager.sortFloors = function(mapArray) {
	// sort floors low to high and get rid of null floor_nums
	return _.chain(mapArray)
		.filter(function(floor) {
			return floor.floor_num;
		})
		.sortBy(function(floor) {
			return floor.floor_num;
		})
		.value();
}

mapManager.setCircleMaskState = function(state) {
	if (mapManager.circleMaskLayer) {
		mapManager.circleMaskLayer._setState(state);
	} else {
		console.log('no circleMaskLayer');
	}
}

mapManager.setCircleMaskMarker = function(key) {
	if (mapManager.circleMaskLayer) {
		mapManager.circleMaskLayer._setMarker(mapManager.markers[key]);
	}
}

mapManager.removeCircleMask = function() {
	var layer = mapManager.circleMaskLayer;
	if (mapManager.circleMaskLayer) {
		console.log('removeCircleMask');
		leafletData.getMap().then(function(map) {
			map.removeLayer(layer);
			mapManager._cMLdereg();
		});
	} else {
		console.log('No circle mask layer.');
	}
}

mapManager.placeImage = function(key, url) {
	console.log('placeImage');
	mapManager.placeImageLayer = new L.IFPlaceImage(url, mapManager.markers[key]);
	leafletData.getMap().then(function(map) {
		map.addLayer(mapManager.placeImageLayer);
	});
	return function(i) {mapManager.placeImageLayer.setScale(i)}
}

mapManager.setPlaceImageScale = function(i) {
	mapManager.placeImageLayer.setScale(i);
}

mapManager.removePlaceImage = function() {
	if (mapManager.placeImageLayer) {
		leafletData.getMap().then(function(map) {
			map.removeLayer(mapManager.placeImageLayer);
		});
	} else {
		console.log('No place image layer.');
	}
}

mapManager.getPlaceImageBounds = function() {
	if (mapManager.placeImageLayer) {
		return mapManager.placeImageLayer.getBounds();
	}
}

mapManager.fadeMarkers = function(bool) {
	leafletData.getMap().then(function(map) {
		var container = map.getContainer();
		if (bool===true) {
			container.classList.add('fadeMarkers');
			console.log(container.classList);
		} else {
			container.classList.remove('fadeMarkers')
		}
	})
}

mapManager.hasMarker = function(key) {
	return mapManager.markers.hasOwnProperty(key);
}

mapManager.loadBubble = function(bubble, config) {
	//config is of form
	//{center: true/false, 	//set the center
	//	marker: true/false  //add marker
	var zoomLevel = 18,
		config = config || {};
	if (bubble.hasOwnProperty('loc') && bubble.loc.hasOwnProperty('coordinates')) {
		if (config.center) {mapManager.setCenter([bubble.loc.coordinates[0], bubble.loc.coordinates[1]], zoomLevel, apertureService.state);}
		if (config.marker) {mapManager.addMarker('c', {
				lat: bubble.loc.coordinates[1],
				lng: bubble.loc.coordinates[0],
				icon: {
					iconUrl: 'img/marker/bubble-marker-50.png',
					shadowUrl: '',
					iconSize: [35, 67], 
					iconAnchor: [17, 67],
					popupAnchor:[0, -40]
				},
				message:'<a href="#/w/'+bubble.id+'/">'+bubble.name+'</a>',
		});}
		
		} else {
			console.error('No center found! Error!');
		}
		
		if (bubble.style.hasOwnProperty('maps')) {
				if (bubble.style.maps.localMapID) {
					mapManager.addOverlay(bubble.style.maps.localMapID, 
							bubble.style.maps.localMapName, 
							bubble.style.maps.localMapOptions);
				}
				
				if (bubble.style.maps.hasOwnProperty('localMapOptions')) {
					zoomLevel = bubble.style.maps.localMapOptions.maxZoom || 19;
				}
		
				if (tilesDict.hasOwnProperty(bubble.style.maps.cloudMapName)) {
					mapManager.setBaseLayer(tilesDict[bubble.style.maps.cloudMapName]['url']);
				} else if (bubble.style.maps.hasOwnProperty('cloudMapID')) {
					mapManager.setBaseLayer('https://{s}.tiles.mapbox.com/v3/'+bubble.style.maps.cloudMapID+'/{z}/{x}/{y}.png');
				} else {
					console.warn('No base layer found! Defaulting to forum.');
					mapManager.setBaseLayer('https://{s}.tiles.mapbox.com/v3/interfacefoundry.jh58g2al/{z}/{x}/{y}.png');
				}
		}
	
}

return mapManager;
    }]);
'use strict';

angular.module('tidepoolsServices')
    .factory('beaconManager', [ 'alertManager', '$interval', '$timeout', 'beaconData',
    	function(alertManager, $interval, $timeout, beaconData) {
var beaconManager = {
	supported: false
}

return beaconManager;
	    	
}]);

angular.module('tidepoolsServices')
    .factory('beaconData', [ 
    	function() {
var beaconData = {
	beaconTree: {
		'E3CA511F-B1F1-4AA6-A0F4-32081FBDD40D': {
			'28040': {
				title: 'Main Room A',
				href: 'w/Creative_Technologies_2014/BubblBot_s_Body'
			},
			'28041': {
				title: 'Main Room B',
				href: 'w/Creative_Technologies_2014/BubblBot_s_Antenna'
			},
			'28042': {
				title: 'Workshop Room A',
				href: 'w/Creative_Technologies_2014/BubblBot_s_Legs/'
			},
			'28043': {
				title: 'Workshop Room B',
				href: 'w/Creative_Technologies_2014/BubblBot_s_Arms/'
			},
			'14163': { //test only
				title: 'Main Room A',
				href: 'w/Creative_Technologies_2014/BubblBot_s_Body/'
			}
		},
		'B9407F30-F5F8-466E-AFF9-25556B57FE6D': {
			'62861': {
				title: "Ross's Random Beacon"
			}
		}
	}
}

beaconData.fromBeacon = function(beacon) {
	return beaconData.beaconTree[beacon.proximityUUID][beacon.major];
}

return beaconData;

}]);


//// Main Room A 
// Bot part: Body
// Major: 28040
// Minors: 27664, 27665, 27666, 27667
// https://bubbl.li/w/Creative_Technologies_2014/BubblBot_s_Body/

//// Main Room B
// Bot part: Antenna
// Major: 28041
// Minors: 1000, 1001, 1002
// https://bubbl.li/w/Creative_Technologies_2014/BubblBot_s_Antenna/

//// Workshop Room A
// Bot part: Legs
// Major: 28042
// Minors: 1000, 1001, 1002
// https://bubbl.li/w/Creative_Technologies_2014/BubblBot_s_Legs/

//// Workshop Room B
// Bot part: Arms
// Major: 28043
// Minors: 1000, 1001, 1002
// https://bubbl.li/w/Creative_Technologies_2014/BubblBot_s_Arms/
'use strict';

//Phonegap only!
//Uses the keychain plugin to store credentials on iOS. 
//Implementation should eventually be platform agnostic

angular.module('tidepoolsServices')
    .factory('lockerManager', ['$q', function($q) {
var lockerManager = {
	supported: true,
	keychain: new Keychain()
}

//getCredentials returns a promise->map of the available credentials. 
//	Consider reimplementing this to propogate errors properly; currently it doesn't reject promises
//	because all will return rejected if you do.

lockerManager.getCredentials = function() {
	var username = $q.defer(), password = $q.defer(), fbToken = $q.defer();
	
	lockerManager.keychain.getForKey(function(value) {
		username.resolve(value);
	}, function(error) {
		username.resolve(undefined);
		console.log(error);
	}, 'username', 'Bubbl.li');

	lockerManager.keychain.getForKey(function(value) {
		password.resolve(value);
	}, function(error) {
		password.resolve(undefined);
		console.log(error);
	}, 'password', 'Bubbl.li');
	
	lockerManager.keychain.getForKey(function(value) {
		fbToken.resolve(value);
	}, function(error) {
		fbToken.resolve(undefined);
		console.log(error);
	}, 'fbToken', 'Bubbl.li');
	
	return $q.all({username: username.promise, password: password.promise, fbToken: fbToken.promise});
}

//saves username and password. Should be changed to use a map instead of args?

lockerManager.saveCredentials = function(username, password) {
	var usernameSuccess = $q.defer(), passwordSuccess = $q.defer();
	
	lockerManager.keychain.setForKey(function(success) {
		usernameSuccess.resolve(success);
	}, function(error) {
		usernameSuccess.reject(error);
	},
	'username', 'Bubbl.li', username);
	
	lockerManager.keychain.setForKey(function(success) {
		passwordSuccess.resolve(success);
	}, function(error) {
		passwordSuccess.reject(error);
	},
	'password', 'Bubbl.li', password);
	
	return $q.all([usernameSuccess, passwordSuccess]);
}


//saves the FB token
lockerManager.saveFBToken = function(fbToken) {
	var deferred = $q.defer();
	lockerManager.keychain.setForKey(function(success) {
		deferred.resolve(success);
	}, function(error) {
		deferred.reject(error);
	},
	'fbToken', 'Bubbl.li', fbToken);
	
	return deferred;
}

	 
return lockerManager;
	   
}
])
app.factory('stickerManager', ['$http', '$q', function($http, $q) {
var stickerManager = {
	
}//manages interfacing with stickers on the server

stickerManager.postSticker = function(sticker) {
	var deferred = $q.defer();
	console.log(sticker);
	$http.post('/api/stickers/create', sticker, {server: true})
		.success(function(success) {
			console.log(success);
			deferred.resolve(success);
		})
		.error(function(error) {
			console.log(error)
			deferred.reject(error);
		})

	return deferred.promise;
}

stickerManager.getStickers = function(stickerReq) {
	var deferred = $q.defer();
	console.log(stickerReq);
	$http.get('/api/stickers/', {params: {'worldID': stickerReq._id}, server: true})
		.success(function(result) {
			console.log(result);
			deferred.resolve(result);
		})
		.error(function(error) {
			console.log(error);
			deferred.reject(error);
		})		
	return deferred.promise;
}

stickerManager.getSticker = function(_id) {
	var deferred = $q.defer();
	$http.get('/api/stickers/'+_id, {server: true})
		.success(function(result) {
			console.log(result);
			deferred.resolve(result);
		})
		.error(function(error) {
			console.log(error);
			deferred.reject(error);
		})
	return deferred.promise;
}

//loc: Objectcoordinates: Array[2]0: -73.989127278327961: 40.74133129511772
// Array[2]0: -73.989127278327961: 40.74133129511772


return stickerManager;
}]);
'use strict';

angular.module('tidepoolsServices')

	.factory('styleManager', [
		function() {
var styleManager = {
	navBG_color: 'rgba(62, 82, 181, 0.96)' 
	//---local settings---
	/*bodyBG_color: '#FFF',
	titleBG_color,
	//text settings
	title_color,
	worldTitle_color,
	landmarkTitle_color		*/
}

styleManager.resetNavBG = function() {
	styleManager.navBG_color = 'rgba(62, 82, 181, 0.96)';
}

return styleManager;
		}
	]);
angular.module('tidepoolsServices')
    .factory('userGrouping', [
    	function() {
    	
var userGrouping = {
	
} //groups bubbles for user page display.

userGrouping.groupByTime = function (bubbles) {
	var groups = {
		places: {
			label: 'Places',
			bubbles: [],
			order: 10
		},
		today: {
			label: 'Today',
			bubbles:[],
			order: 6
		},
		thisWeek: {
			label: 'This Week',
			bubbles: [],
			order: 5
		},
		thisMonth: {
			label: 'This Month',
			bubbles: [],
			order: 4
		},
		nextMonths: {
			label: 'Next Few Months',
			bubbles: [],
			order: 3
		},
		thisYear: {
			label: 'This Year',
			bubbles: [],
			order: 2
		},
		future: {
			label: 'Future',
			bubbles: [],
			order: 1
		},
		lastWeek: {
			label: 'Last Week',
			bubbles: [],
			order: 7
		},
		lastMonth: {
			label: 'Last Month',
			bubbles: [],
			order: 8
		},
		past: {
			label: 'Past',
			bubbles: [],
			order: 9
		}
	}, group, bubble, now = moment();

	for (var i = 0; i < bubbles.length; i++) {
		var bubble = bubbles[i], startTime;
		if (bubble.time.start) { 
			var startTime = moment(bubble.time.start); 
		} else {
			startTime = undefined;
		}
		console.log(startTime);
		
		if (!startTime) {
			groups.places.bubbles.push(bubble);
		} else if (startTime.isSame(now, 'day')) {
			groups.today.bubbles.push(bubble);
		} else if (startTime.isAfter(now)) {
			if (startTime.isSame(now, 'week')) {
				groups.thisWeek.bubbles.push(bubble);
			} else if (startTime.isSame(now, 'month')) {
				groups.thisMonth.bubbles.push(bubble);
			} else if (startTime.isBefore(now.add(3, 'months'))) {
				groups.nextMonths.bubbles.push(bubble);
			} else if (startTime.isSame(now, 'year')) {
				groups.thisYear.bubbles.push(bubble);
			} else {
				groups.future.bubbles.push(bubble);
			}
		} else if (startTime.isBefore(now)) {
			if (startTime.isAfter(now.subtract(1, 'week'))) {
				groups.lastWeek.bubbles.push(bubble);
			} else if (startTime.isAfter(now.subtract(1, 'month'))) {
				groups.lastMonth.bubbles.push(bubble);
			} else {
				groups.past.bubbles.push(bubble);
			}
		}
	}
	
	angular.forEach(groups, function(group, key, groups) {
		if (key == 'places') {
			//skip 
		} else if (group.bubbles.length > 1) {
			group.bubbles.sort(function(a, b) {
				if (moment(a.time.start).isBefore(b.time.start)) {
					return -1;
				} else {
					return 1; 
				}
			});
		}
	});
	
	var groupsArray = Object.keys(groups)
		.map(function(key) {return groups[key]}) //returns new array, properties > elements
		.filter(function(group) {return group.bubbles.length > 0}) //remove empty groups
		.sort(function(a, b) {return a.order-b.order}) //sorts 
	
	return groupsArray;
}


userGrouping.groupForCalendar = function (bubbles) {
	return bubbles.filter(function(bubble) {
		return bubble.time.start;
	})
	.map(function(bubble) {
		return {
			id: bubble._id,
			title: bubble.name,
			start: bubble.time.start,
			end: bubble.time.end,
			bubble: bubble
		}
	});
}

return userGrouping;

}]);
angular.module('tidepoolsServices')
    .factory('userManager', ['$rootScope', '$http', '$resource', '$q', '$location', 'dialogs', 'alertManager', 'lockerManager', 'ifGlobals', 'worldTree',  
    	function($rootScope, $http, $resource, $q, $location, dialogs, alertManager, lockerManager, ifGlobals, worldTree) {
var alerts = alertManager;
   
   
   //deals with loading, saving, managing user info. 
   
var userManager = {
	userRes: $resource('https://bubbl.li/api/updateuser'),
	loginStatus: false,
	login: {},
	signup: {}
}


userManager.getUser = function() { //gets the user object
	var deferred = $q.defer();

	var user = userManager._user; //user cached in memory 
	if (user) {  
		deferred.resolve(user);
	} else {
		$http.get('/api/user/loggedin', {server: true}).
		success(function(user){
			if (user && user!=0) {
				console.log(user);
				userManager._user = user;
				deferred.resolve(user);
			} else {
				deferred.reject(0);
			}
		}).
		error(function(data, status, header, config) {
			//failure
			deferred.reject(data);
		});
	}
	return deferred.promise;
}

userManager.saveUser = function(user) { //saves user object then updates memory cache
	userManager.userRes.save(user, function() {
		console.log('saveUser() succeeded');
		userManager._user = user;
	});
}

userManager.getDisplayName = function() { //gets a first name to display in the UI from wherever.
	if (userManager._user) {
		var user = userManager._user;	
		if (user.name) {displayName = user.name}
		else if (user.facebook && user.facebook.name) {displayName = user.facebook.name}
		else if (user.twitter && user.twitter.displayName) {displayName = user.twitter.displayName} 
		else if (user.meetup && user.meetup.displayName) {displayName = user.meetup.displayName}
		else if (user.local && user.local.email) {displayName = user.local.email.substring(0, user.local.email.indexOf("@"))}
		else {displayName = "Me"; console.log("how did this happen???");}
			
		var i = displayName.indexOf(" ");
		if (i > -1) {
			var _displayName = displayName.substring(0, i);
		} else {
			var _displayName = displayName;
		}
		
		return _displayName;
	} else {
		return undefined;
	}
}

userManager.checkLogin = function() { //checks if user is logged in with side effects. would be better to redesign.
	console.log('checklogin');
    var deferred = $q.defer();
      
	userManager.getUser().then(function(user) {
	  	console.log('getting user');
		  userManager.loginStatus = true;
		  $rootScope.user = user;
		  if (user._id){
			  $rootScope.userID = user._id;
			  userManager._user = user;
		  }
		  worldTree.getUserWorlds();
		  deferred.resolve(1);
	  }, function(reason) {
		  console.log(reason);
		  userManager.loginStatus = false;
		  deferred.reject(0);
	});
	
	$rootScope.$broadcast('loginSuccess');
		  
    return deferred.promise;
};

userManager.signin = function(username, password) { //given a username and password, sign in 
	console.log('signin');
	var deferred = $q.defer();
	var data = {
		email: username,
		password: password
	}
	
	
	ifGlobals.username = username;
	ifGlobals.password = password;
	$http.post('/api/user/login-basic', data, {server: true})
		.success(function(data) {
			userManager.loginStatus = true;
			ifGlobals.loginStatus = true;
			
			deferred.resolve(data);
		})
		.error(function(data, status, headers, config) {
			console.error(data, status, headers, config);
			deferred.reject(data); 
		})
	
	return deferred.promise;
}

userManager.fbLogin = function() { //login based on facebook approval
	var deferred = $q.defer();
	
	facebookConnectPlugin.login(['public_profile', 'email'], 
		function(success) {
			var fbToken = success.authResponse.accessToken;
			var authHeader = 'Bearer ' + fbToken;
			console.log(success);
			$http.get('/auth/bearer', {server: true, headers: {'Authorization': authHeader}}).then(function(success) {
				lockerManager.saveFBToken(fbToken)
				ifGlobals.fbToken = fbToken;
				deferred.resolve(success);
			}, function(failure) {
				deferred.reject(failure);
			})
		}, 
		function(failure) {
			alerts.addAlert('warning', "Please allow access to Facebook!", true);
			deferred.reject(failure);
		})
	
	return deferred.promise;
}

userManager.logout = function() { 
	$http.get('/api/user/logout', {server: true});
	userManager.loginStatus = false;
	$location.path('/');
	alerts.addAlert('success', "You're signed out!", true);
}

userManager.login.login = function() { //login based on login form
	console.log('login');
    var data = {
      email: userManager.login.email,
      password: userManager.login.password
    }
    userManager.signin(data.email, data.password).then(function(success) {
	    console.log(success);
		userManager.checkLogin();
		alerts.addAlert('success', "You're signed in!", true);
		userManager.login.error = false;
		dialogs.showDialog('keychainDialog.html');
	}, function (err) {
		if (err) {
			console.log('failure', err);
		}
		userManager.login.error = true;
	});
}

userManager.signup.signup = function() { //signup based on signup form 
	var data = {
      email: userManager.signup.email,
      password: userManager.signup.password
    }

    $http.post('/api/user/signup', data, {server: true})
    .success(function(user) {
	    dialogs.show = false;
		userManager.checkLogin();
		alertManager.addAlert('success', "You're logged in!", true);
		userManager.signup.error = undefined;	
	})
	.error(function(err) {
	if (err) {
		userManager.signup.error = "Error signing up!";
        alertManager.addAlert('danger',err, true);   
	}
	});
}

userManager.saveToKeychain = function() { 
	lockerManager.saveCredentials(userManager.login.email, userManager.login.password);
}

return userManager;
}]);
angular.module('tidepoolsServices')
	.factory('worldTree', ['$cacheFactory', '$q', 'World', 'db', 'geoService', '$http', '$location', 'alertManager', 'bubbleTypeService',
	function($cacheFactory, $q, World, db, geoService, $http, $location, alertManager, bubbleTypeService) {

var worldTree = {
	worldCache: $cacheFactory('worlds'),
	styleCache: $cacheFactory('styles'),
	landmarkCache: $cacheFactory('landmarks')
}

var alert = alertManager;

worldTree.getWorld = function(id) { //returns a promise with a world and corresponding style object
	var deferred = $q.defer();

	var world = worldTree.worldCache.get(id);
	if (world && world.style) {
		console.log('world and world style');
		bubbleTypeService.set(world.category);
		var style = worldTree.styleCache.get(world.style.styleID);
			if (style) {
				deferred.resolve({world: world, style: style});
				console.log('world & style in cache!');
			} else {
				console.log('missing style');
				askServer();
			}
	} else {
		askServer();
	}
		
	function askServer() {
		console.log('ask server')
		World.get({id: id}, function(data) {
			if (data.err) {
				deferred.reject(data.err);
	 		} else {
	 			worldTree.worldCache.put(data.world.id, data.world);
	 			worldTree.styleCache.put(data.style._id, data.style);
		 		deferred.resolve(data);
		 		bubbleTypeService.set(data.world.category);
		 	}
		 });
	}
	
	return deferred.promise;
}

worldTree.getLandmarks = function(_id) { //takes world's _id
	var deferred = $q.defer();
	console.log('getLandmarks');
	var landmarks = worldTree.landmarkCache.get(_id);
	if (landmarks) {
		deferred.resolve(landmarks);
		console.log('landmarks in cache!');
	} else {
		$http.get('/api/landmarks', {params: {parentID: _id}, server: true})
			.success(function(success) {
				console.log(success);
				deferred.resolve(success.landmarks)})
			.error(function(err) {
				console.log(success);
				deferred.resolve(err)});
	}
	
	return deferred.promise;
}

worldTree.getLandmark = function(_id, landmarkId) {
	var deferred = $q.defer(), result;
	
	worldTree.getLandmarks(_id).then(function(landmarks) {
		result = landmarks.find(function(landmark, index, landmarks) {
			return landmark.id === landmarkId;
		});
		
		if (result) {
			deferred.resolve(result);
		} else {
			deferred.reject('Landmark not found');
		}
	});	

	return deferred.promise;
}

worldTree.getUpcoming = function(_id) {
	var userTime = new Date(), data = {}, deferred = $q.defer();
	
	db.landmarks.query({queryFilter:'upcoming', parentID: _id, userTime: userTime}, function(uResult){
		data.upcomingIDs = uResult;
		
		db.landmarks.query({queryFilter:'now', parentID: _id, userTime: userTime}, function(nResult){
		console.log('queryFilter:now');
			data.nowID = nResult[0];
			deferred.resolve(data);
		}, function(reason) {
			deferred.reject(reason);
		}); 
	}, function(reason) {
		deferred.reject(reason); 
	});
	
	return deferred.promise;
}

worldTree.getNearby = function() {
	
	//current nearby format
	//{150m: [worlds],
	// 150mPast: [worlds],
	// 2.5k: [worlds],
	// 2.5kPast: [worlds]}
	
	var deferred = $q.defer();
	var now = Date.now() / 1000;

	if (worldTree._nearby && (worldTree._nearby.timestamp + 30) > now) {
		deferred.resolve(worldTree._nearby);
	} else {
		console.log('nearbies not cached');
	geoService.getLocation().then(function(location) {
		db.worlds.query({localTime: new Date(), 
			userCoordinate: [location.lng, location.lat]},
			function(data) {
				worldTree._nearby = data[0];
				worldTree._nearby.timestamp = now;
				deferred.resolve(data[0]);
				
				worldTree.cacheWorlds(data[0]['150m']);
				worldTree.cacheWorlds(data[0]['2.5km']);
			});
	}, function(reason) {
		deferred.reject(reason);
	})
	}
	
	return deferred.promise;
}

worldTree.cacheWorlds = function(worlds) {
	if (!worlds) {return}
	worlds.forEach(function(world) {
		worldTree.worldCache.put(world.id, world);
	});
}

worldTree.getUserWorlds = function(_id) {
	console.log('getUserWorlds')
	var now = Date.now() / 1000; 
	
	if (_id) {
		//other user -- need api endpoint
	} else if (worldTree._userWorlds && (worldTree._userWorlds.timestamp + 60) > now) {
		return $q.when(worldTree._userWorlds);
	} else {
		return $http.get('/api/user/profile', {server: true}).success(function(bubbles){	
			worldTree._userWorlds = bubbles;
			worldTree._userWorlds.timestamp = now;
			worldTree.cacheWorlds(bubbles);
		});
	}
}

worldTree.createWorld = function() {
	alert.addAlert('warning', "Creating New Bubbles coming soon to the iOS app. For now, login to build through https://bubbl.li", true);
	return;
	
	var world = {newStatus: true};
	
	db.worlds.create(world, function(response){
		console.log('##Create##');
		console.log('response', response);
		$location.path('/edit/walkthrough/'+response[0].worldID);
	});
}

return worldTree;
}
]);
var themeDict = {
	urban: {
		name: 'urban',
		
		bodyBG_color: '#80DEEA',
		cardBG_color: '#FFFFFF',
		titleBG_color: '#00BCD4',
		navBG_color: 'rgba(0, 172, 193, 0.8)',
		
		worldTitle_color: '#FFF',
		landmarkTitle_color: '#304FFE',
		categoryTitle_color: '#536DFE'
	},
	sunset: {
		name: 'sunset',
		
		bodyBG_color: '#FFE0B2',
		cardBG_color: '#FFFFFF',
		titleBG_color: '#FF9800',
		navBG_color: 'rgba(245, 124, 0, 0.8)',
		
		worldTitle_color: '#FFF',
		landmarkTitle_color: '#FF4081',
		categoryTitle_color: '#F48FB1'
	},
	fairy: {
		name: 'fairy',
		
		bodyBG_color: '#7E57C2',
		cardBG_color: '#FFFFFF',
		titleBG_color: '#673AB7',
		navBG_color: 'rgba(81, 45, 168, 0.8)',
		
		worldTitle_color: '#FFF',
		landmarkTitle_color: '#FF5722',
		categoryTitle_color: '#D1C4E9'
	},
	arabesque: {
		name: 'arabesque',
		
		bodyBG_color: '#C5CAE9',
		cardBG_color: '#FFFFFF',
		titleBG_color: '#3F51B5',
		navBG_color: 'rgba(57, 73, 171, 0.8)',
		
		worldTitle_color: '#FFF',
		landmarkTitle_color: '#FF4081',
		categoryTitle_color: '#F48FB1'
	},
	haze: {
		name: 'haze',
		
		bodyBG_color: '#000830',
		cardBG_color: '#FFFFFF',
		titleBG_color: '#2c22cf',
		navBG_color: '#2c22cf',
		
		worldTitle_color: '#FFF',
		landmarkTitle_color: '#6ff4ff',
		categoryTitle_color: '#6ff4ff'
	}
};
app.controller('TweetlistCtrl', ['$location', '$scope', 'db', '$rootScope', '$routeParams', 'apertureService', function ($location, $scope, db, $rootScope,$routeParams,apertureService) {	
	
	$rootScope.showSwitch = false;
    var aperture = apertureService
    aperture.set('off');
    //query tweets
    $scope.currentTag = $routeParams.hashTag;
    $scope.tweets = db.tweets.query({limit:60, tag:$scope.currentTag}); // make infinite scroll?
    // $scope.globalhashtag = global_hashtag;
	
    //not enabled right now
    $scope.tagSearch = function() { 
        var tagged = $scope.searchText.replace("#","");
        $scope.tweets = db.tweets.query({tag: tagged});
    };

    $scope.goBack = function(){
        window.history.back();
    }
}]);

app.controller('InstalistCtrl', ['$location', '$scope', 'db', '$rootScope', '$routeParams', 'apertureService', function( $location, $scope, db, $rootScope,$routeParams, apertureService) {

	var aperture = apertureService;
	aperture.set('off');
    $rootScope.showSwitch = false;  

    //query instagram
    $scope.currentTag = $routeParams.hashTag;
    $scope.instagrams = db.instagrams.query({limit:30, tag:$scope.currentTag}); // make infinite scroll?

    // $scope.globalhashtag = global_hashtag;

    $scope.goBack = function(){
        window.history.back();
    }
}]);

function TalktagCtrl( $location, $scope, $routeParams, db, $rootScope) {

    $rootScope.showSwitch = false;

    $scope.currentTag = $routeParams.hashTag;
    $scope.globalhashtag = global_hashtag;

    $scope.time = "all";
    $scope.tweets = db.tweets.query({limit:60, tag: $routeParams.hashTag, time:$scope.time});

    $scope.goBack = function(){
        window.history.back();
    }

    $scope.goTalk = function(url) {
      $location.path('talk');
    };

}
TalktagCtrl.$inject = [ '$location', '$scope', '$routeParams', 'db', '$rootScope'];



function MenuCtrl( $location, $scope, db, $routeParams, $rootScope) {

    // TURN THIS PAGE INTO RAW HTML PAGE, A LA MENU page
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

    $scope.menuType = $routeParams.type;

}
MenuCtrl.$inject = [ '$location', '$scope', 'db', '$routeParams', '$rootScope'];


function ListCtrl( $location, $scope, db, $routeParams, $rootScope) {
	
    shelfPan('return');

    window.scrollTo(0, 0);

    //fixing back button showing up glitches
    $rootScope.showBack = false;
    $rootScope.showBackPage = false;
    $rootScope.showBackMark = false;
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
    }

    //------------------------//

    //query function for all sorting buttons
    $scope.filter = function(type, filter) {
        $scope.landmarks = db.landmarks.query({ queryType: type, queryFilter: filter });
    };
}
ListCtrl.$inject = [ '$location', '$scope', 'db', '$routeParams', '$rootScope'];


// function ChatCtrl($scope, socket, $sce, $rootScope, apertureService) {
	
// 	$scope.aperture = apertureService;	
//     $scope.aperture.set('off');

	
//   // Socket listeners
//   // ================

//   socket.on('init', function (data) {
//     $rootScope.chatName = data.name;
//     $rootScope.users = data.users;
//   });

//   socket.on('send:message', function (message) {
//     $rootScope.messages.push(message);
//   });

//   socket.on('change:name', function (data) {
//     changeName(data.oldName, data.newName);
//   });

//   // socket.on('reconnect');
  
//   // socket.on('user:join', function (data) {
//   //   $scope.messages.push({
//   //     user: 'chatroom',
//   //     text: 'User ' + data.name + ' has joined.'
//   //   });
//   //   $scope.users.push(data.name);
//   // });

//   // // add a message to the conversation when a user disconnects or leaves the room
//   // socket.on('user:left', function (data) {
//   //   $scope.messages.push({
//   //     user: 'chatroom',
//   //     text: 'User ' + data.name + ' has left.'
//   //   });
//   //   var i, user;
//   //   for (i = 0; i < $scope.users.length; i++) {
//   //     user = $scope.users[i];
//   //     if (user === data.name) {
//   //       $scope.users.splice(i, 1);
//   //       break;
//   //     }
//   //   }
//   // });

//   // Private helpers
//   // ===============

//   var changeName = function (oldName, newName) {
//     // rename user in list of users
//     var i;
//     for (i = 0; i < $rootScope.users.length; i++) {
//       if ($rootScope.users[i] === oldName) {
//         $rootScope.users[i] = newName;
//       }
//     }

//     // $scope.messages.push({
//     //   user: 'chatroom',
//     //   text: 'User ' + oldName + ' is now known as ' + newName + '.'
//     // });
//   }

//   // Methods published to the scope
//   // ==============================

//   $scope.changeName = function () {
//     socket.emit('change:name', {
//       name: $scope.newName
//     }, function (result) {
//       if (!result) {
//         alert('That name is already in use');
//       } else {
//         changeName($rootScope.chatName, $scope.newName);
//         $rootScope.chatName = $scope.newName;
//         $scope.newName = '';
//       }
//     });
//   };

//   //$scope.messages = [];

//   $scope.sendMessage = function () {

//     socket.emit('send:message', {
//       message: $scope.message
//     });

//     var date = new Date;
//     var seconds = (date.getSeconds()<10?'0':'') + date.getSeconds();
//     var minutes = (date.getMinutes()<10?'0':'') + date.getMinutes();
//     var hour = date.getHours();

//     // add the message to our model locally
//     $rootScope.messages.push({
//       user: $rootScope.chatName,
//       text: $scope.message,
//       time: hour + ":" + minutes + ":" + seconds
//     });

//     // clear message box
//     $scope.message = '';
//   };

//   $scope.sendEmo = function (input) {
//     var path = "/img/emoji/";
//     var emoji;

//     switch(input) {
//         case "cool":
//             emoji = path+"cool.png";
//             break;
//         case "dolphin":
//             emoji = path+"dolphin.png";
//             break;
//         case "ghost":
//             emoji = path+"ghost.png";
//             break;
//         case "heart":
//             emoji = path+"heart.png";
//             break;
//         case "love":
//             emoji = path+"love.png";
//             break;
//         case "party":
//             emoji = path+"party.png";
//             break;
//         case "smile":
//             emoji = path+"smile.png";
//             break;
//         case "woah":
//             emoji = path+"woah.png";
//             break;
//         default:
//             emoji = path+"love.png";
//             break;
//     }
//     $scope.message = '<img src="'+emoji+'">';
//     $scope.sendMessage();
//   }


// }



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





app.directive('drawer', ['worldTree', '$rootScope', '$routeParams', 'userManager', 'dialogs', function(worldTree, $rootScope, $routeParams, userManager, dialogs) {
	return {
		restrict: 'EA',
		scope: true,
		link: function (scope, element, attrs) {
//would prefer if this method of bubble checking was replaced with an event bus (ie instead of depending on worldURL
//can just watch for events on new bubble viewing. Or make a more centralized model)
scope._currentBubble = false;
	
$rootScope.$on('toggleDrawer', function() {
	scope.drawerOn = !scope.drawerOn;
});

scope.$on('$routeChangeSuccess', function() {
	//check if sharing and editing are available on this route
	scope._currentBubble = false;
	if ($routeParams.worldURL) {
		scope.shareAvailable = true;
	} else {
		scope.shareAvailable = false;
	}
}) //keeps shareavailable and editavailable up to date on route watching

scope.$watch('drawerOn', function(drawerOn, oldDrawerOn) {
	if (drawerOn === true) {
		element.addClass('drawer');	
	} else {
		element.removeClass('drawer');
	}
}) //toggles drawer

scope.currentBubble = function () {
	if (!scope._currentBubble && $routeParams.worldURL) {
		scope._currentBubble = worldTree.worldCache.get($routeParams.worldURL);
	}
	return scope._currentBubble;	
} 
//weird hack to expose current bubble on scope

scope.avatar = function () {
	try {
		return userManager._user.avatar;
	}
	catch (e) {
		return undefined;
	}
}
//mirroring avatar on directive scope

scope.username = function () {
	return userManager.getDisplayName();
}
//^^


scope.userBubbles = function () {
	return worldTree._userWorlds;
}
//exposes current userworlds on scope

scope.editAvailable = function () {
	try {
			return scope.currentBubble().permissions.ownerID === userManager._user._id;
	}
	catch (e) {
		return false;
	}
}
//check if user can edit. 

scope.closeDrawer = function() {
	scope.drawerOn = false;
}

scope.shareDialog = function() {
	dialogs.showDialog('shareDialog.html');
}
//pop up share dialog

scope.create = worldTree.createWorld;
//alias createworld on drawer

scope.feedback = function() {
	dialogs.showDialog('feedbackDialog.html')
}
//show feedback

scope.logout = userManager.logout;
//alias logout

		},
		templateUrl: 'components/drawer/drawer.html' 
	}
}])
app.controller('EditController', ['$scope', 'db', 'World', '$rootScope', '$route', '$routeParams', 'apertureService', 'mapManager', 'styleManager', 'alertManager', '$upload', '$http', '$timeout', '$interval', 'dialogs', '$window', '$location', '$anchorScroll', 'ifGlobals', function($scope, db, World, $rootScope, $route, $routeParams, apertureService, mapManager, styleManager, alertManager, $upload, $http, $timeout, $interval, dialogs, $window, $location, $anchorScroll, ifGlobals) {

dialogs.showDialog('mobileDialog.html');
$window.history.back();
//isnt ready for mobile yet
var aperture = apertureService,
	map = mapManager,
	style = styleManager,
	alerts = alertManager;
var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];
zoomControl.style.top = "50px";
zoomControl.style.left = "40%"; 
//TODO: do this in map controller

var lastRoute = $route.current;
$scope.worldURL = $routeParams.worldURL;

aperture.set('full');

$scope.mapThemeSelect = 'arabesque';

$scope.kinds = [
	{name:'Convention'},
	{name: 'Park'},
	{name: 'Retail'},
	{name: 'Venue'},
	{name: 'Event'},
	{name: 'Venue'},
	{name: 'Campus'},
	{name: 'Home'},
	{name: 'Neighborhood'}
]; 
//TODO: Switch to ifGlobal source 

$scope.mapThemes = ifGlobals.mapThemes;

function tempID() { 
	//Used because angular leaflet has issues with watching when a marker is replaced with a marker of the same name. 
	//Kind of stupid.
	return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12);
}

var markerID = tempID();

$scope.temp = {
	scale: 1
}
 //Used for local map scaling

$http.get('/components/edit/edit.locale-en-us.json').success(function(data) { 
	$scope.locale = angular.fromJson(data);
	$scope.tooltips = $scope.locale.tooltips;
}); 
//weird way of throwing tooltip text on before we had solidified it. TODO: centralize localization method.

if ($routeParams.view) {
	$scope.view = $routeParams.view; 
	//switching between the three subviews
} else {
	$scope.view = 'details';
}

$scope.initView = function() {
	//switch the state of the circle mask on or off, style view wants flat black
	switch ($scope.view) {
		case 'details':
		map.setCircleMaskState('mask');
			break;
		case 'maps': 
		map.setCircleMaskState('mask');
			break;
		case 'styles':
		// console.log('switching to styles');
		map.setCircleMaskState('cover');
			break;
	}
}

$scope.onWorldIconSelect = function($files) { 
	//file uploading, uses angular-file-upload
	var file = $files[0];
	$scope.upload = $upload.upload({
		url: '/api/upload/',
		file: file,
	}).progress(function(e) {
		// console.log('%' + parseInt(100.0 * e.loaded/e.total));
	}).success(function(data, status, headers, config) {
		$scope.world.avatar = data;
		$scope.uploadFinished = true;
	});
}

$scope.onLandmarkCategoryIconSelect = function($files) {
	//same as above
	var file = $files[0];
	$scope.upload = $upload.upload({
		url: '/api/upload/',
		file: file,
	}).progress(function(e) {
		// console.log('%' + parseInt(100.0 * e.loaded/e.total));
	}).success(function(data, status, headers, config) {
		// console.log(data);
		$scope.temp.LandmarkCatAvatar = data;
		$scope.uploadFinishedLandmark = true;
	});
}

$scope.setUploadFinished = function(bool, type) { 
	if (type == 'world') {
		if (bool) {
			$scope.uploadFinished = true;
		}
		else {
			$scope.uploadFinished = false;
			$scope.world.avatar = null;
		}
	}
	if (type == 'landmark') {
		if (bool) {
			$scope.uploadFinishedLandmark = true;
		}
		else {
			$scope.uploadFinishedLandmark = false;
			$scope.temp.LandmarkCatAvatar = null;
		}
	}
};

$scope.onLocalMapSelect = function($files, floor_num, floor_name) {
	if (floor_num === 0 || floor_num === '0') {
		alerts.addAlert('info', "The floor number can't be 0", true);
	} 
	else if (floor_num == '') {
		alerts.addAlert('info', "Please enter a floor number", true);
	}
	else {
		//local map image upload, then places image on map
		var file = $files[0];
		$scope.upload = $upload.upload({
			url: '/api/upload_maps',
			file: file
		}).progress(function(e) {
			// console.log('%' + parseInt(100.0 * e.loaded/e.total));
			if (!$scope.temp) {$scope.temp = {}}
			$scope.temp.picProgress = parseInt(100.0 * e.loaded/e.total)+'%';
		}).success(function(data, status, headers, config) {
			$scope.mapImage = data;
			map.placeImage(markerID, data);
			// post details to /api/temp_map_upload
			// will update floor_num and floor_name
			var newData = {
				worldID: $scope.world._id,
				map_marker_viewID: markerID,
				temp_upload_path: data,
				floor_num: floor_num,
				floor_name: floor_name
			};
			$http.post('/api/temp_map_upload', newData).
				success(function(data, status, headers, config) {
					// console.log('success: ', data);
					$scope.world = data;
					$scope.selectLastMap();
				}).
				error(function(data, status, headers, config) {
					// console.log('error: ', data);
				});
			});
		scrollToBottom(300);
	}
}

$scope.selectMapTheme = function(key) {
	if (typeof name === 'string') {
		$scope.mapThemeSelect = key;
		map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/'+$scope.mapThemes[key].cloudMapID+'/{z}/{x}/{y}.png');
		
		$scope.world.style.maps.cloudMapName = $scope.mapThemes[key].cloudMapName;
		$scope.world.style.maps.cloudMapID = $scope.mapThemes[key].cloudMapID;
		
		if ($scope.style.hasOwnProperty('navBG_color')==false) {
			$scope.setThemeFromMap();
		}
	}
}

$scope.setThemeFromMap = function() {
	switch ($scope.world.style.maps.cloudMapName) {
		case 'urban':
			angular.extend($scope.style, themeDict['urban']);
			break;
		case 'sunset':
			angular.extend($scope.style, themeDict['sunset']);
			break;
		case 'fairy':
			angular.extend($scope.style, themeDict['fairy']);
			break;
		case 'arabesque':
			angular.extend($scope.style, themeDict['arabesque']);
			break;
		case 'purple haze': 
			angular.extend($scope.style, themeDict['haze']);
			break;
	}
}

$scope.addLandmarkCategory = function() {
	//adds landmark categories one by one to list
	if ($scope.temp) {

		$scope.world.landmarkCategories.unshift({name: $scope.temp.LandmarkCategory, avatar: $scope.temp.LandmarkCatAvatar, present: $scope.temp.landmarkPresent});

		// console.log('----- TEST')
		// console.log($scope.world.landmarkCategories);
		delete $scope.temp.LandmarkCatAvatar;
		delete $scope.temp.LandmarkCategory;
		$scope.temp.landmarkPresent = false;
		$scope.uploadFinishedLandmark = false;
	}
}

$scope.removeLandmarkCategory = function(index) {
	$scope.world.landmarkCategories.splice(index, 1);
}

$scope.removeAllMaps = function() {
	map.removePlaceImage();
	map.removeOverlays();
};

$scope.getHighestFloor = function() {
	// gets the highest floor_num in array of map objects
	var array = $scope.world.style.maps.localMapArray;
	array = $.map(array, function(obj) {
		return obj.floor_num;
	});
	return Math.max.apply(this, array);
};

$scope.increaseFloor = function(map) {
	if (!$scope.mapIsUploaded(map)) {
		map.floor_num++;
	}
};

$scope.decreaseFloor = function(map) {
	if (!$scope.mapIsUploaded(map)) {
		map.floor_num--;
	}
};

$scope.mapIsUploaded = function(map) {
	return map.temp_upload_path || map.localMapName;
};

$scope.mapIsBuilt = function(map) {
	if (map) {
		return map.localMapName;
	}
	else {
		// check if the last map in the array is built
		if ($scope.world) {
			if ($scope.world.style.maps.localMapArray &&
				$scope.world.style.maps.localMapArray.length>0) {
				var len = $scope.world.style.maps.localMapArray.length;
				return $scope.world.style.maps.localMapArray[len-1].hasOwnProperty('localMapName');
			}
		}
		// no localMapArrat
		return true;
	}
}

$scope.selectMap = function(clickedMap) {
	// show panel body
	$scope.selectedMap = clickedMap;
	// clickedMap.isSelected = true;

	// remove any maps showing (built or unbuilt)
	$scope.removeAllMaps();

	// add new maps
	if (clickedMap.temp_upload_path == '') { // map has been built
		// the timeout is necessary (for some reason)
		var showMapDelay = $timeout(function() {
			map.addOverlay(clickedMap.localMapID,
						clickedMap.localMapName,
						clickedMap.localMapOptions); // populate this correctly
		}, 100);
	} else { // map has not been built
		var showMapDelay = $timeout(function() {
			map.placeImage(clickedMap.map_marker_viewID, clickedMap.temp_upload_path);
		}, 100);
	}
};

$scope.selectLastMap = function() {
	var len = $scope.world.style.maps.localMapArray.length;
	$scope.selectMap($scope.world.style.maps.localMapArray[len-1]);
};

$scope.addMapPlaceholder = function() {
	// creates new temporary li in edit/maps.html
	if ($scope.world.style.maps.localMapArray && $scope.world.style.maps.localMapArray.length>0) {
		$scope.world.style.maps.localMapArray.push({
			floor_num: $scope.getHighestFloor()+1,
			floor_name: 'Floor ' + ($scope.getHighestFloor()+1)
		});
	} else { // first map to upload
		$scope.world.style.maps.localMapArray = [{
			floor_num: 1,
			floor_name: 'Lobby'
		}];
	}
	//scroll to bottom
	scrollToBottom(100);

	// select li
	$scope.selectLastMap();
};

$scope.removeMap = function(map) {
	if (window.confirm('Are you sure you want to delete this local map?')) {
		if ($scope.mapIsUploaded(map)) {
			deleteMap(map);
		}
		else {
			// remove last object in map array
			$scope.world.style.maps.localMapArray.pop();
		}
		
	}
};

function deleteMap(map) {
	var data = {
		worldID: $scope.world._id,
		map_marker_viewID: map.map_marker_viewID
	};
	$http.post('/api/delete_map', data).
		success(function(data) {
			// console.log('success: ', data);
			$scope.world = data;
		}).
		error(function(data) {
			// console.log('error', data);
		});
}

function scrollToBottom(timeout) {
	$location.hash('scrollToBottom');
	if (timeout) {
		var scroll = $timeout(function() {
			// give ngRepeat time to add new DOM element
			$anchorScroll();
			// console.log('scrolled with timeout');
		}, timeout);
	}
	else {
		$anchorScroll;
		// console.log('scrolled without timeout');
	}
}

$scope.loadWorld = function(data) { 
	// initialize world
	  	$scope.world = data.world;
		// console.log('$scope.world: ', $scope.world);

	  	// don't load unbuilt maps (can only be last map in array)
	  	if ($scope.world.style.maps.localMapArray && 
	  		$scope.world.style.maps.localMapArray.length>0) {
			var len = $scope.world.style.maps.localMapArray.length;
			if ($scope.world.style.maps.localMapArray[len-1].temp_upload_path != '') {
				// delete unbuilt map
				deleteMap($scope.world.style.maps.localMapArray[len-1]);
			}
	  	}

		$scope.style = data.style;
		style.navBG_color = $scope.style.navBG_color;
		if ($scope.world.hasLoc) {
			console.log('hasLoc');
			showPosition({
				coords: {
					latitude: $scope.world.loc.coordinates[1],
					longitude: $scope.world.loc.coordinates[0]
				}
			});
		} else {
			console.log('findLoc');
			findLoc();
		}
		
		if ($scope.world.hasOwnProperty('style')==false) {$scope.world.style = {};}
		if ($scope.world.style.hasOwnProperty('maps')==false) {$scope.world.style.maps = {};}
		if ($scope.world.hasOwnProperty('landmarkCategories')==false) {$scope.world.landmarkCategories = [];}
		
		if ($scope.world.style.maps.cloudMapName) {
			map.setBaseLayerFromID($scope.world.style.maps.cloudMapID);
			$scope.mapThemeSelect = $scope.world.style.maps.cloudMapName;
		} else {
			$scope.selectMapTheme('arabesque');
		}
		
		/*if ($scope.world.style.maps.type == "both" || $scope.world.style.maps.type == "local") {
			map.addOverlay($scope.world.style.maps.localMapID, $scope.world.style.maps.localMapName, $scope.world.style.maps.localMapOptions);
			map.refresh();
		}*/
		

		var theseMaps = [$scope.world.style.maps];

		if (theseMaps[0].localMapArray && theseMaps[0].localMapArray.length > 0) {
			theseMaps = map.findMapFromArray(theseMaps[0].localMapArray);
		}

		theseMaps.forEach(function(thisMap) {
			if (thisMap.localMapID !== undefined && thisMap.localMapID.length > 0) {
				map.addOverlay(thisMap.localMapID, 
								thisMap.localMapName, 
								thisMap.localMapOptions);
			}
		})

		
		if (!$scope.style.bodyBG_color) {
			$scope.style.bodyBG_color = "#FFFFFF";
			$scope.style.cardBG_color = "#FFFFFF";
		}		
}

$scope.saveWorld = function() {
	$scope.whenSaving = true;
	console.log('saveWorld(edit)');
	$scope.world.newStatus = false; //not new
	//$scope.world.worldID = $scope.worldID;
	$scope.world.hasLoc = true;
	console.log($scope.world);
	tempMarker = map.getMarker(markerID);
	$scope.world.loc.coordinates[0] = tempMarker.lng;
	$scope.world.loc.coordinates[1] = tempMarker.lat;
	
	if (typeof $scope.world.style.maps == undefined) {
		$scope.world.style.maps = {};
	}
	console.log($scope.mapThemeSelect);
	//$scope.world.style.maps.cloudMapName = $scope.mapThemeSelect.cloudMapName;
	//$scope.world.style.maps.cloudMapID = $scope.mapThemeSelect.cloudMapID;
	
	
	console.log($scope.world);
    db.worlds.create($scope.world, function(response) {
    	console.log('--db.worlds.create response--');
    	console.log(response);
    	$scope.world.id = response[0].id; //updating world id with server new ID
    	$scope.whenSaving = false;
    	alerts.addAlert('success', 'Save successful! Go to <a class="alert-link" target="_blank" href="#/w/'+$scope.world.id+'">'+$scope.world.name+'</a>', true);
    	$timeout.cancel(saveTimer);
    });
	
    console.log('scope world');
    console.log($scope.world);

    //adding world data to pass to style save function (for widget processing not saving to style)
    

    if ($scope.world.resources){
    	if ($scope.world.resources.hashtag){
    		$scope.style.hashtag = $scope.world.resources.hashtag;
    	}
    }
    if ($scope.world._id){
    	$scope.style.world_id = $scope.world._id;
    }

    console.log($scope.style);
    //end extra data

    db.styles.create($scope.style, function(response){
        console.log(response);
    });
    
}

$scope.search = function() {
	console.log('--search()--');
	var geocoder = new google.maps.Geocoder();
	if (geocoder) {
			geocoder.geocode({'address': $scope.searchText},
				function (results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						showPosition({
							coords: {
								latitude: results[0].geometry.location.lat(),
								longitude: results[0].geometry.location.lng()
							}
						});
						
					} else { console.log('No results found.')}
				});
	}
}

$scope.setStartTime = function() {
	var timeStart = new Date();
	$scope.world.time.start = timeStart.toISO8601String();
}

$scope.setEndTime = function() {
	var timeStart = new Date();
	console.log(timeStart);
	
	if (typeof $scope.world.time.start === 'string') {
		timeStart.setISO8601($scope.world.time.start);
	} //correct, its a string
	
	if ($scope.world.time.start instanceof Date) {
		//incorrect but deal with it anyway
		timeStart = $scope.world.time.start;
	}
	//timeStart is currently a date object
	console.log('timeStart', timeStart.toString());	 
	timeStart.setUTCHours(timeStart.getUTCHours()+3);
	
	//timeStart is now the default end time.
	var timeEnd = timeStart;
	console.log('--timeEnd', timeEnd.toString());
	$scope.world.time.end = timeEnd.toISO8601String();
	
}

$scope.removePlaceImage = function () {
	$scope.mapImage = null;
	map.removePlaceImage();
}

$scope.buildLocalMap = function () {
	console.log('--buildLocalMap--');
	$scope.building = true;
	//get image geo coordinates, add to var to send
	var bounds = map.getPlaceImageBounds(),
		southEast = bounds.getSouthEast(),
		northWest = bounds.getNorthWest(),
		southWest = bounds.getSouthWest(),
		northEast = bounds.getNorthEast(),
		coordBox = {
			worldID: $scope.world._id,
			localMapID: $scope.world._id + '_' + markerID,
			nw_loc_lng: northWest.lng,
		    nw_loc_lat: northWest.lat,
		    sw_loc_lng: southWest.lng,
			sw_loc_lat: southWest.lat,
			ne_loc_lng: northEast.lng,
			ne_loc_lat: northEast.lat,
			se_loc_lng: southEast.lng,
			se_loc_lat: southEast.lat 
		};
	// console.log('bounds', bounds);
	// console.log('coordBox', coordBox);
	var coords_text = JSON.stringify(coordBox);
		var data = {
		    mapIMG: $scope.mapImage,
		    coords: coords_text,
		    map_marker_viewID: markerID
		}
	//build map
	alerts.addAlert('warning', 'Building local map, this may take some time!', true);
	$http.post('/api/build_map', data).success(function(response){
		//response = JSON.parse(response);
		alerts.addAlert('success', 'Map built!', true);
		// console.log(response);
		if (!$scope.world.hasOwnProperty('style')){$scope.world.style={}}
		if (!$scope.world.style.hasOwnProperty('maps')){$scope.world.style.maps={}} 
		//remove this when world objects arent fd up
		if (response[0]) {
			
			 //the server sends back whatever it wants. sometimes an array, sometimes not. :(99
			$scope.world = response[0];
			// $scope.world.style.maps.localMapID = response[0].style.maps.localMapID;
			// $scope.world.style.maps.localMapName = response[0].style.maps.localMapName;
			// $scope.world.style.maps.localMapOptions = response[0].style.maps.localMapOptions;
		} else {
			$scope.world = response;
			// $scope.world.style.maps.localMapID = response.style.maps.localMapID;
			// $scope.world.style.maps.localMapName = response.style.maps.localMapName;
			// $scope.world.style.maps.localMapOptions = response.style.maps.localMapOptions;
		}
		$scope.building = false;
		// reload to reset markerID, etc.
		$route.reload();
		scrollToBottom(1000);
		// $scope.saveWorld();
		}).error(function(response) {
			$scope.building = false;
		});
}

function findLoc() {
	if (navigator.geolocation && !$scope.world.hasLoc) {
   // Get the user's current position
   		navigator.geolocation.getCurrentPosition(showPosition, locError, {timeout:15000});
   }
}

function showPosition(position) {
	// console.log('--showPosition--');
	userLat = position.coords.latitude;
	userLng = position.coords.longitude;
	
	// console.log(userLng);
	map.setCenter([userLng, userLat], 18, 'editor');
 
	markerID = tempID();
 
	map.removeAllMarkers();
	map.addMarker(markerID, {
		lat: userLat,
		lng: userLng,
		message: "<p style='color:black;'>Drag to Bubble Location</p>",
		focus: true,
		draggable: true,
		icon: {
			iconUrl: 'img/marker/bubble-marker-50.png',
			shadowUrl: '',
			iconSize: [35, 67],
			iconAnchor: [17.5, 55],
			popupAnchor:  [0, -40]
		}
	});
	
	var state;
	// console.log('$scope.view', $scope.view);
	switch ($scope.view) {
		case 'details':
		state = 'mask';
		break;
		case 'maps':
		state = 'mask';
		break;
		case 'styles':
		state = 'cover';
		break;
	}
	
	if (map.circleMaskLayer) {
		map.setCircleMaskMarker(markerID)		
	} else {
		map.addCircleMaskToMarker(markerID, 100, state);     
	}
}

function locError(){
        // console.log('no loc');
}





	// //---- Adding Local Maps -----//

	// $scope.addLandmarkCategory = function() {

	// 	if ($scope.temp) {

	// 		$scope.world.landmarkCategories.unshift({name: $scope.temp.LandmarkCategory, avatar: $scope.temp.LandmarkCatAvatar, present: $scope.temp.landmarkPresent});

	// 		// console.log('----- TEST')
	// 		// console.log($scope.world.landmarkCategories);

	// 		console.log($scope.world);
	// 		delete $scope.temp.LandmarkCatAvatar;
	// 		delete $scope.temp.LandmarkCategory;
	// 		$scope.temp.landmarkPresent = false;
	// 		$scope.uploadFinishedLandmark = false;
	// 		console.log($scope.temp.LandmarkCatAvatar);
	// 	}
	// }

	// $scope.removeLandmarkCategory = function(index) {
	// 	$scope.world.landmarkCategories.splice(index, 1);
	// }



	// $scope.newMap = function(){

	// 	//check if there are floor numbers registered, default to 0
	// 	//populate dropdown with registered floors

	// 	//if loc_info already exists, add 1
	// 	if ($scope.landmark.loc_info){		
	// 		if ($scope.landmark.loc_info.floor_num == null){
	// 			$scope.landmark.loc_info.floor_num = 1;
	// 		}
	// 	}

	// 	addLocInfo();
	// }

	// //if loc info, then load floor numbers / room names
	// if ($scope.$parent.landmark.loc_info){
	// 	addLocInfo();
	// }

	// function addLocInfo() {

	// 	//read landmark floor array, cp to $scope

	// 	$scope.$parent.floors = [{"val":-1,"label":"-1 Floor"},{"val":1,"label":"1st Floor"},{"val":2,"label":"2nd Floor"}];  

	// 	//IF no loc_info, then floor_num = 0
	// 	if (!$scope.$parent.landmark.loc_info){
	// 		$scope.$parent.landmark.loc_info = {
	// 			floor_num: 1
	// 		};  		
	// 	}
	// }
	// //onclick hide location details
	// $scope.clearMap = function(){

	// 	//console.log('asdfasdfasdf');
	// 	//delete $scope.$parent.landmark.loc_info;

	// 	$scope.landmark.loc_info.floor_num = null;
	// 	$scope.landmark.loc_info.room_name = null;
	// }
	// //--------------------------//

////////////////////////////////////////////////////////////
/////////////////////////LISTENERS//////////////////////////
////////////////////////////////////////////////////////////
$scope.$on('$locationChangeSuccess', function (event, args) {
	//stops route from changing if just changing subview
	// console.log(event, args);
	// console.log($route.current.$$route);
	
    if (lastRoute.$$route.originalPath === $route.current.$$route.originalPath) {
        $scope.view = $route.current.params.view;
        $route.current = lastRoute;
        // console.log($scope.view);
    }
    $scope.initView();
});

$scope.$on('$destroy', function (event) { //controller cleanup
	// console.log('$destroy event', event);
	if (event.targetScope===$scope) {
	map.removeCircleMask();
	map.removePlaceImage();
	if (zoomControl.style) {
		zoomControl.style.top = "";
		zoomControl.style.left = "";
	}
	}
	
	angular.extend($rootScope, {navTitle: "Bubbl.li"});
});

$scope.$watch('style.navBG_color', function(current, old) {
	style.navBG_color = current;
});

/*
$scope.$watch('world.name', function(current, old) {
	console.log('world name watch', current);
	angular.extend($rootScope, {navTitle: "Edit &raquo; "+current+" <a href='#/w/"+$routeParams.worldURL+"' class='preview-link' target='_blank'>Preview</a>"});
});
*/

$scope.$watch('temp.scale', function(current, old) {
	if (current!=old) {
		map.setPlaceImageScale(current);
		// console.log(map.getPlaceImageBounds());
	}
});

var saveTimer = null;
$scope.$watchCollection('world', function (newCol, oldCol) {
	if (oldCol!=undefined) {
		if (saveTimer) {
			$timeout.cancel(saveTimer);
		}
		saveTimer = $timeout($scope.saveWorld, 1500);
	}
});


////////////////////////////////////////////////////////////
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////
World.get({id: $routeParams.worldURL}, function(data) {
	if (data.err) {
		 // console.log('World not found!');
		 // console.log(data.err);
	} else {
		$scope.loadWorld(data);
	}
	map.refresh();
})

//end editcontroller
}]);

app.controller('LandmarkEditorController', ['$scope', '$rootScope', '$location', '$route', '$routeParams', 'db', 'World', 'leafletData', 'apertureService', 'mapManager', 'Landmark', 'alertManager', '$upload', '$http', '$window', 'dialogs', 'worldTree', 'bubbleTypeService', function ($scope, $rootScope, $location, $route, $routeParams, db, World, leafletData, apertureService, mapManager, Landmark, alertManager, $upload, $http, $window, dialogs, worldTree, bubbleTypeService) {
	
dialogs.showDialog('mobileDialog.html');
$window.history.back();
////////////////////////////////////////////////////////////
///////////////////INITIALIZING VARIABLES///////////////////
////////////////////////////////////////////////////////////
	var map = mapManager;
	
var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];
	zoomControl.style.top = "50px";
	zoomControl.style.left = "40%";

var worldLoaded = false;
var landmarksLoaded = false;
	
	$scope.landmarks = [];
	$scope.selectedIndex = 0;
	$scope.alerts = alertManager;

	
////////////////////////////////////////////////////////////
//////////////////////DEFINE FUNCTIONS//////////////////////
////////////////////////////////////////////////////////////
	
	$scope.addLandmark = function() {
		console.log('--addLandmark--');
		if (!worldLoaded || !landmarksLoaded) {console.log('loading not complete');}
		else {
		var tempLandmark = landmarkDefaults();
		db.landmarks.create(tempLandmark, function(response) {
			console.log('--db.landmarks.create--');
			console.log('Response ID:'+response[0]._id);
			tempLandmark._id = response[0]._id;
			
			//add to array 
			$scope.landmarks.unshift(tempLandmark);		
			
			var landmarkIcon = 'img/marker/bubble-marker-50.png',
					popupAnchorValues = [0, -50],
					shadowUrl = '',
					// shadowAnchor = [12, 20],
					iconAnchor = [25, 100];

			//add marker
			map.addMarker(tempLandmark._id, {
				lat:tempLandmark.loc.coordinates[1],
				lng:tempLandmark.loc.coordinates[0],
				icon: {
					iconUrl: landmarkIcon,
					shadowUrl: shadowUrl,
					// shadowAnchor: shadowAnchor,
					iconSize: [50, 95],
					iconAnchor: [25, 100],
					popupAnchor: popupAnchorValues,
				},
				draggable:true,
				message:'Drag to location on map',
				focus:true
			});				
		});
		}
	}
	
	$scope.removeItem = function(i) {		
		var deleteItem = confirm('Are you sure you want to delete this item?'); 
		
	    if (deleteItem) {
			//notify parent to remove from array with $index
	    	console.log($scope.landmarks[i]._id);
	        map.removeMarker($scope.landmarks[i]._id);
	        Landmark.del({_id: $scope.landmarks[i]._id}, function(landmark) {
	            //$location.path('/');
	            console.log('Delete');
	            $scope.landmarks.splice(i, 1); //Removes from local array
	        });
	    }
	}	
	
	$scope.saveItem = function(i) {
		console.log('--saveItem--');
		$scope.landmarks[i].newStatus = false;
		var tempMarker = map.getMarker($scope.landmarks[i]._id);
		if (tempMarker == false) {
			console.log('Problem finding marker, save failed');
			return false;}
		$scope.landmarks[i].loc.coordinates = [tempMarker.lng, tempMarker.lat];

		// if($scope.landmarks[i].hiddenPresent == true){
		// 	$scope.landmarks[i].category.hiddenPresent = true;
		// }
		// else{
		// 	$scope.landmarks[i].category.hiddenPresent = false;
		// }
		
		/*
if ($scope.landmark.hasTime) {
	   
	   	    //if no end date added, use start date
	        if (!$scope.landmark[i].date.end) {
	            $scope.landmark[i].date.end = $scope.landmark[i].date.start;
	        }

	        $scope.landmark[i].datetext = {
	            start: $scope.landmark[i].date.start,
	            end: $scope.landmark[i].date.end
	        }
	        //---- Date String converter to avoid timezone issues...could be optimized probably -----//
	        $scope.landmark[i].date.start = new Date($scope.landmark[i].date.start).toISOString();
	        $scope.landmark[i].date.end = new Date($scope.landmark[i].date.end).toISOString();

	        $scope.landmark[i].date.start = dateConvert($scope.landmark[i].date.start);
	        $scope.landmark[i].date.end = dateConvert($scope.landmark[i].date.end);

	        $scope.landmark[i].date.start = $scope.landmark[i].date.start.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1'); //rearranging so value still same in input field
	        $scope.landmark[i].date.end = $scope.landmark[i].date.end.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1');

	        function dateConvert(input){
	            var s = input;
	            var n = s.indexOf('T');
	            return s.substring(0, n != -1 ? n : s.length);
	        }
	        //-----------//

	        if (!$scope.landmark[i].time.start){
	            $scope.landmark[i].time.start = "00:00";
	        }

	        if (!$scope.landmark[i].time.end){
	            $scope.landmark[i].time.end = "23:59";
	        }

	        $scope.landmark[i].timetext = {
	            start: $scope.landmark[i].time.start,
	            end: $scope.landmark[i].time.end
	        } 
	        //------- END TIME --------//
		}
*/	
		console.log('Saving...');
		console.log($scope.landmarks[i]);
		db.landmarks.create($scope.landmarks[i], function(response) {
			console.log('--db.landmarks.create--');
			console.log(response);
		});
		console.log('Save complete');
		$scope.alerts.addAlert('success','Landmark Saved', true);
	}
	
	$scope.selectItem = function(i) {
		console.log('--selectItem--');
		if ($scope.selectedIndex != i) {
			//$scope.saveItem($scope.selectedIndex);//save previous landmark
			console.log('Continue w select');
			$scope.selectedIndex = i; //change landmarks
			map.setCenter($scope.landmarks[i].loc.coordinates, 18);//center map on new markers
			console.log($scope.landmarks[i].name);
			map.setMarkerMessage($scope.landmarks[i]._id, $scope.landmarks[i].name);
			map.bringMarkerToFront($scope.landmarks[i]._id);
			map.setMarkerSelected($scope.landmarks[i]._id);
			map.setMarkerFocus($scope.landmarks[i]._id);
			console.log('Complete select');
		}
	}
	
	$scope.addLandmarkMarker = function(landmark) {
		var landmarkIcon = 'img/marker/bubble-marker-50.png',
				popupAnchorValues = [0, -40],
				shadowUrl = '',
				shadowAnchor = [4, -3],
				iconAnchor = [17, 67],
				iconSize = [35, 67];

		if (bubbleTypeService.get() === 'Retail' && landmark.avatar !== 'img/tidepools/default.jpg') {
			landmarkIcon = landmark.avatar;
			popupAnchorValues = [0, -14];
			// shadowUrl = 'img/marker/blue-pointer.png';
			iconAnchor = [25, 25];
			iconSize = [50, 50]
		}
	
		map.addMarker(landmark._id, {
				lat:landmark.loc.coordinates[1],
				lng:landmark.loc.coordinates[0],
				icon: {
					iconUrl: landmarkIcon,
					shadowUrl: shadowUrl,
					shadowAnchor: shadowAnchor,
					iconSize: iconSize,
					iconAnchor: iconAnchor,
					popupAnchor: popupAnchorValues
				},
				draggable:true,
				message:landmark.name || 'Drag to location on map',
				focus:true
			});
	}
	
	function landmarkDefaults() {
		console.log('--landmarkDefaults()--');
		var defaults = {
			name: 'Landmark '+($scope.landmarks.length+1),
			_id: 0,
			world: false,
			newStatus: true,
			parentID: 0,
			loc: {type:'Point', coordinates:[-74.0059,40.7127]}, 
			avatar: "img/tidepools/default.jpg",
			time: {}
		};
		if (worldLoaded) {
			defaults.parentID = $scope.world._id;
			defaults.loc.coordinates = $scope.world.loc.coordinates;
		}
		console.log('Defaults Updated');
		console.log(defaults);
		return defaults;
	}



////////////////////////////////////////////////////////////
/////////////////////////LISTENERS//////////////////////////
////////////////////////////////////////////////////////////

$scope.$on('$destroy', function (event) {
	console.log('$destroy event', event);
	if (event.targetScope===$scope) {
	map.removeCircleMask();
	
	if (zoomControl.style) {
	zoomControl.style.top = "";
	zoomControl.style.left = "";
	}
	}
});

////////////////////////////////////////////////////////////
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////
worldTree.getWorld($routeParams.worldURL).then(function(data) {
		$scope.world = data.world;
		$scope.style = data.style;
		
		$scope.worldURL = $routeParams.worldURL;
		//initialize map with world settings
		map.setCenter($scope.world.loc.coordinates, 18, 'editor');

		if ($scope.world.style) {
			if ($scope.world.style.maps) {
			map.setBaseLayerFromID($scope.world.style.maps.cloudMapID)}}
			map.removeAllMarkers();
		
			map.addMarker('m', {
				lat: $scope.world.loc.coordinates[1],
				lng: $scope.world.loc.coordinates[0],
				focus: false,
				draggable: false,
				icon: {
					iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=',
					shadowUrl: '',
					iconSize: [0,0],
					shadowSize: [0,0],
					iconAnchor: [0,0],
					shadowAnchor: [0,0]
				}
			});

			map.removeCircleMask();
			map.addCircleMaskToMarker('m', 150, 'mask');
		
			map.setMaxBoundsFromPoint([$scope.world.loc.coordinates[1],$scope.world.loc.coordinates[0]], 0.05);
		
			var theseMaps = [$scope.world.style.maps];

			if (theseMaps[0].localMapArray){
				if (theseMaps[0].localMapArray.length > 0) {
					theseMaps = map.findMapFromArray(theseMaps[0].localMapArray);
				}				
			}


			theseMaps.forEach(function(thisMap) {
				if (thisMap.localMapID !== undefined && thisMap.localMapID.length > 0) {
					map.addOverlay(thisMap.localMapID, 
									thisMap.localMapName, 
									thisMap.localMapOptions);
				}
				
			});
			
			if ($scope.world.style.maps.hasOwnProperty('localMapOptions')) {
				zoomLevel = $scope.world.style.maps.localMapOptions.maxZoom || 19;
			}
		map.refresh();
		
		//world is finished loading
		worldLoaded = true;
		
		//begin loading landmarks
	worldTree.getLandmarks(data.world._id).then(function(data) {
		$scope.landmarks = data;
					
		//add markers to map
		angular.forEach($scope.landmarks, function(value, key) {
			//for each landmark add a marker
			$scope.addLandmarkMarker(value);
		});
		landmarksLoaded = true;
			
	});
	});	
	
}])

app.controller('LandmarkEditorItemController', ['$scope', 'db', 'Landmark', 'mapManager', '$upload', 'bubbleTypeService', 'worldTree', '$q', '$log', function ($scope, db, Landmark, mapManager, $upload, bubbleTypeService, worldTree, $q, $log) {
	console.log('LandmarkEditorItemController', $scope);
	$scope.time = false;
	
	$scope.deleteLandmark = function() {
		$scope.$parent.removeItem($scope.$index);
	}
	
	$scope.saveLandmark = function() {
		$scope.$parent.saveItem($scope.$index);
	}
	
	$scope.selectLandmark = function(index) {
		if (index === $scope.$parent.selectedIndex) {
			return;
		}
		// updateFloor sets up a promise chain to allow markers to
		// disappear and regenerate before selectItem is run
		$scope.updateFloor()
			.then(function() {
				$scope.$parent.selectItem($scope.$index);		
			});
	}
	
	$scope.setStartTime = function() {
	var timeStart = new Date();
	$scope.$parent.landmark.time.start = timeStart.toISO8601String();
	}
	
	$scope.setEndTime = function() {
		var timeStart = new Date();
		console.log(timeStart);
		
		if (typeof $scope.$parent.landmark.time.start === 'string') {
			timeStart.setISO8601($scope.$parent.landmark.time.start);
		} //correct, its a string
		
		if ($scope.$parent.landmark.time.start instanceof Date) {
			//incorrect but deal with it anyway
			timeStart = $scope.$parent.landmark.time.start;
		}
		
		//timeStart is currently a date object
		console.log('timeStart', timeStart.toString());	 
		
		timeStart.setUTCHours(timeStart.getUTCHours()+3); //!!!Mutates timeStart itself, ECMA Date() design sucks!
		//timeStart is now the default end time
		var timeEnd = timeStart;
		console.log('--timeEnd', timeEnd.toString());
		$scope.$parent.landmark.time.end = timeEnd.toISO8601String();
	
	}

	//---- LOCATION DETAILS -----//
	$scope.setLocation = function(){

		//check if there are floor numbers registered, default to 0
		//populate dropdown with registered floors

		//if loc_info already exists, add 1
		if ($scope.$parent.landmark.loc_info){		
			if ($scope.$parent.landmark.loc_info.floor_num == null){
				$scope.$parent.landmark.loc_info.floor_num = 1;
			}
		}

		addLocInfo();
	}

	//if loc info, then load floor numbers / room names
	if ($scope.$parent.landmark.loc_info){
		addLocInfo();
	}

	function populateFloorsDropdown(localMap) {
		var newFloor = {};
		newFloor.val = localMap.floor_num;
		newFloor.label = localMap.floor_name;
		return newFloor;
	}

	$scope.$on('leafletDirectiveMarker.dragend',function (marker, ev) {
		mapManager.markers[ev.markerName].lat = ev.leafletEvent.target._latlng.lat;
		mapManager.markers[ev.markerName].lng = ev.leafletEvent.target._latlng.lng;
  });

	function addLocInfo() {
		//read landmark floor array, cp to $scope

		if (mapManager.localMapArrayExists($scope.world)) {
			var floors = [];
			var localMaps = _.chain($scope.world.style.maps.localMapArray)
				.filter(function(m) {
					return m.floor_num;
				})
				.sortBy(function(m) {
					return m.floor_num;
				})
				.uniq(function(m) {
					return m.floor_num;
				})
				.value();

			localMaps.forEach(function(m) {
				floors.push(populateFloorsDropdown(m));
			});

			$scope.$parent.floors = floors;
		} else {
			$scope.$parent.floors = [{"val":-1,"label":"-1 Floor"},{"val":1,"label":"1st Floor"},{"val":2,"label":"2nd Floor"},{"val":3,"label":"3rd Floor"},{"val":4,"label":"4th Floor"},{"val":5,"label":"5th Floor"},{"val":6,"label":"6th Floor"},{"val":7,"label":"7th Floor"},{"val":8,"label":"8th Floor"},{"val":9,"label":"9th Floor"},{"val":10,"label":"10th Floor"}];  
		}

		//IF no loc_info, then floor_num = 0
		if (!$scope.$parent.landmark.loc_info){
			$scope.$parent.landmark.loc_info = {
				floor_num: 1
			};  		
		}
	}
	//onclick hide location details
$scope.clearLoc = function(){
	//delete $scope.$parent.landmark.loc_info;

	$scope.$parent.landmark.loc_info.floor_num = null;
	$scope.$parent.landmark.loc_info.room_name = null;
}
	//--------------------------//


$scope.updateFloor = function() {

	var deferred = $q.defer(),
			// landmarks without floor info will default to floor 1
			currentFloor = $scope.landmark.loc_info ? $scope.landmark.loc_info.floor_num : 1;

	if (mapManager.localMapArrayExists($scope.world)) {
		var localMaps = $scope.world.style.maps.localMapArray;

		// sort and then filter floors
		var floorMaps = mapManager.filterToCurrentFloor(mapManager.sortFloors(localMaps), currentFloor);	

		mapManager.removeOverlays();
		setTimeout(function() {
			floorMaps.forEach(function(thisMap) {
				if (thisMap.localMapID !== undefined && thisMap.localMapID.length) {
					mapManager.addOverlay(thisMap.localMapID, 
									thisMap.localMapName, 
									thisMap.localMapOptions);
				}	
			});
		}, 100);
	}
	getLandmarks(currentFloor).then(function() {
		deferred.resolve(true);
	});

	return deferred.promise;
}

function getLandmarks(currentFloor) {
	var deferred = $q.defer();

	showLandmarksOnFloor(filterLandmarks($scope.$parent.landmarks, currentFloor))
		.then(function() {
			deferred.resolve(true);
		});

	return deferred.promise;
}

function filterLandmarks(landmarks, currentFloor) {
	var filtered = _.chain(landmarks)
		.filter(function(l) {
			return l.loc_info;
		})
		.filter(function(l) {
			return l.loc_info.floor_num === currentFloor;
		})
		.value();

	// if showing the first floor then include all landmarks without a floor num
	if (currentFloor === 1) {
		filtered = filtered.concat(landmarks.filter(function(l) {
			return !l.loc_info;
		}));
	}

	return filtered;
}

function showLandmarksOnFloor(landmarks) {
	var deferred = $q.defer();

	// remove all landmarks
	mapManager.removeAllMarkers();
	angular.forEach(landmarks, function(mark) {
		// for each landmark add a marker
		$scope.$parent.addLandmarkMarker(mark);
	});

	deferred.resolve(true);

	return deferred.promise;
}

$scope.onUploadAvatar = function($files) {
	console.log('uploadAvatar');
	var file = $files[0];
	$scope.upload = $upload.upload({
		url: '/api/upload/',
		file: file,
	}).progress(function(e) {
		console.log('%' + parseInt(100.0 * e.loaded/e.total));
	}).success(function(data, status, headers, config) {
		console.log(data);
	$scope.$parent.landmark.avatar = data;
	if (bubbleTypeService.get() === 'Retail') {
		mapManager.setNewIcon($scope.$parent.landmark);
	}
	$scope.uploadFinished = true;
	});
}		
	
	//------- TAGGING -------//

	$scope.$parent.landmark.landmarkTagsRemoved = [];

	$scope.tagDetect = function(keyEvent) {
		if (keyEvent.which === 13){
			$scope.addTag();
		}
	}

	$scope.addTag = function() {
		if($scope.addTagName !== ''){
			if (!$scope.$parent.landmark.tags){
				$scope.$parent.landmark.tags = []; //if no array, then add
			}
			$scope.addTagName = $scope.addTagName.replace(/[^\w\s]/gi, '');

			$scope.addTagName = $scope.addTagName.toLowerCase();

			if($scope.$parent.landmark.tags.indexOf($scope.addTagName) > -1){ 
				//check for dupes, if dupe dont added
			}
			else {
				$scope.$parent.landmark.tags.push($scope.addTagName);
			}
			$scope.addTagName = '';			
		}
	};

	$scope.closeTag = function(index) {
		$scope.$parent.landmark.landmarkTagsRemoved.push($scope.$parent.landmark.tags[index]); //add remove to tags removed arr
		$scope.$parent.landmark.tags.splice(index, 1);
	};

	//--------------------------//
	
}]);

app.controller('WalkthroughController', ['$scope', '$location', '$route', '$routeParams', '$timeout', 'ifGlobals', 'leafletData', '$upload', 'mapManager', 'World', 'db', '$window', 'dialogs', function($scope, $location, $route, $routeParams, $timeout, ifGlobals, leafletData, $upload, mapManager, World, db, $window, dialogs) {
dialogs.showDialog('mobileDialog.html');
$window.history.back();
	
////////////////////////////////////////////////////////////
///////////////////INITIALIZING VARIABLES///////////////////
////////////////////////////////////////////////////////////
$scope.global = ifGlobals;
$scope.position = 0;
$scope.world = {};
$scope.world.time = {};
$scope.world.time.start = new Date();
$scope.world.time.end = new Date();
$scope.world.style = {};
$scope.world.style.maps = {};
$scope.temp = {};
var map = mapManager;
var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];

zoomControl.style.display = 'none'; 

$scope.world.name = "bubble"; //make sure there's a default world name
map.setCenter([-83,42], 15); //setting to blue coast on load so arrows show up on background

$scope.next = function() {
	if ($scope.position < $scope.walk.length-1) {
		$scope.position++; 
		//check if new position has 'jump'
		if ($scope.walk[$scope.position].hasOwnProperty('jump')) {
			if ($scope.walk[$scope.position].jump()) {
				$scope.next();
			}
		}
	}
	$scope.save();
}

$scope.prev = function() {
	if ($scope.position > 0) {
		$scope.position--;
		if ($scope.walk[$scope.position].hasOwnProperty('jump')) {
			if ($scope.walk[$scope.position].jump()) {
				$scope.prev();
			}
		}
	}
	$scope.save();
}

$scope.slowNext = function() {
	$timeout(function() {
		$scope.next();
	}, 200);
	$scope.save();
}

$scope.pictureSelect = function($files) {
	var file = $files[0];
	$scope.upload = $upload.upload({
		url: '/api/upload/',
		file: file,
	}).progress(function(e) {
		console.log('%' + parseInt(100.0 * e.loaded/e.total));
		$scope.picProgress = parseInt(100.0 * e.loaded/e.total)+'%';
	}).success(function(data, status, headers, config) {
		console.log(data);
		$scope.world.avatar = data;
	});
}

$scope.selectMapTheme = function(name) {
	var mapThemes = $scope.global.mapThemes;

	if (typeof name === 'string') {
		$scope.mapThemeSelect = name;
		map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/'+mapThemes[name].cloudMapID+'/{z}/{x}/{y}.png');
		
		$scope.world.style.maps.cloudMapName = mapThemes[name].cloudMapName;
		$scope.world.style.maps.cloudMapID = mapThemes[name].cloudMapID;
		
		//if ($scope.style.hasOwnProperty('navBG_color')==false) {
		//	$scope.setThemeFromMap();
		$scope.setThemeFromMap(name);
		//}
	}
}

$scope.setThemeFromMap = function(name) {
	switch (name) { 
		case 'urban':
			angular.extend($scope.style, themeDict['urban']);
			break;
		case 'sunset':
			angular.extend($scope.style, themeDict['sunset']);
			break;
		case 'fairy':
			angular.extend($scope.style, themeDict['fairy']);
			break;
		case 'arabesque':
			angular.extend($scope.style, themeDict['arabesque']);
			break;
		case 'haze':
			angular.extend($scope.style, themeDict['haze']);
			break;
		case 'mimis':
			angular.extend($scope.style, themeDict['mimis']);
			break;
	}
	console.log($scope.style)

	    db.styles.create($scope.style, function(response){
	        console.log(response);
	    });
}	
	
$scope.saveAndExit = function() {

	//prevent bug
	if (!$scope.world.name){
		$scope.world.name = "bubble";
	}

	$scope.save();
	if ($scope.world.id) {

		// console.log('corrd');
		// console.log($scope.world);
		// so it goes to the right map area on exit
		// if ($scope.world.loc){
		// 	if($scope.world.loc.coordinates){
		// 		console.log('asfasdf');
		// 		map.setCenter([$scope.world.loc.coordinates[0],$scope.world.loc.coordinates[1]], 17);
		// 	}
		// }

		$location.path("/w/"+$scope.world.id);
		$window.location.reload();
		map.refresh();
	} else {
		//console
		console.log('no world id'); 
	}
}

$scope.save = function() {
	$scope.world.newStatus = false;
	console.log($scope.world);
	db.worlds.create($scope.world, function(response) {
    	console.log('--db.worlds.create response--');
    	console.log(response);
    	$scope.world.id = response[0].id; //updating world id with server new ID
    });
    
    if ($scope.style) {
	    
	    if ($scope.world.resources){
    		if ($scope.world.resources.hashtag){
    			$scope.style.hashtag = $scope.world.resources.hashtag;
    		}
    	}
		if ($scope.world._id){
    		$scope.style.world_id = $scope.world._id;
    	}
	    
    	console.log('saving style');
	    db.styles.create($scope.style, function(response){
      		console.log(response);
		});
    }
}

var firstWalk = [
	{
		title: 'Need a hand?',
		caption: 'If you haven’t built a bubble before, we can walk you through it.',
		height: 0,
		view: '0.html',
		valid: function() {return true},
		skip: false
	},
	{
		title: 'Kind',
		caption: 'What kind of bubble is it?',
		view: 'kind.html',
		height: 220,
		valid: function() {return typeof $scope.world.category == "string"},
		skip: true
	},
	{
		title: 'Location', 
		caption: 'Find its location',
		view: 'location.html',
		height: 290,
		valid: function() {return $scope.world.hasLoc},
		skip: false
	},
	{
		title: 'Name',
		caption: 'What\'s your bubble named?',
		view: 'name.html',
		height: 62,
		valid: function() {return $scope.form.worldName.$valid},
		skip: false
	},
	{
		title: 'Time',
		caption: 'Give it a start and end time',
		view: 'time.html',
		height: 288,
		valid: function() {return $scope.form.time.$valid},
		jump: function() {return !$scope.global.kinds[$scope.world.category].hasTime;},
		skip: true
	},
	{
		title: 'Picture',
		caption: 'Upload a picture for your bubble',
		view: 'picture.html',
		height: 194,
		valid: function() {return true},
		skip: true
	},
	{
		title: 'Maps',
		caption: 'Choose a map',
		view: 'maptheme.html',
		height: 426,
		valid: function() {return true},
		skip: true
	},
	{
		title: 'Hashtag',
		caption: 'Connect your bubble\'s social media',
		view: 'hashtag.html',
		height: 132,
		valid: function() {return true},
		skip: true,
	},
	{
		title: 'Done!',
		caption: 'Now spread the word :)',
		view: 'done.html',
		height: 200,
		skip: false
	}
];

var meetupWalk = [
	//0 intro
	{
		title: 'Claim your Meetup',
		caption: "We'll use your Meetup group to create a bubble.",
		view:'0.html',
		height: 0,
		valid: function() {return true},
		skip: false
	},
	//1 
	{
		title: 'Confirm',
		caption: 'Make sure this information from Meetup.com is correct',
		view: 'meetup_confirm.html',
		height: 300,
		valid: function() {return true},
		skip: false
	},
	{
		title: 'Kind',
		caption: 'What kind of bubble is it?',
		view: 'kind.html',
		height: 220,
		valid: function() {return typeof $scope.world.category == "string"},
		skip: false
	},
	{
		title: 'Hashtag',
		caption: 'Connect your bubble\'s social media',
		view: 'hashtag.html',
		height: 132,
		valid: function() {return true},
		skip: true,
	},
	{
		title: 'Picture',
		caption: 'Upload a picture',
		view: 'picture.html',
		height: 194,
		valid: function() {return true},
		skip: true
	},
	{
		title: 'Maps',
		caption: 'Choose a map',
		view: 'maptheme.html',
		height: 426,
		valid: function() {return true},
		skip: true
	},
	{
		title: 'Done!',
		caption: 'Now spread the word :)',
		view: 'done_meetup.html',
		height: 200,
		skip: false
	}
];

$scope.walk = firstWalk;

function setUpProgress() {
	$scope.progress = [];

	var i = 0;
	if ($scope.walk) {
		while (i < $scope.walk.length) {
			$scope.progress[i] = {status: ''};
			i++;
		}
	}
	
	$scope.progress[$scope.position].status = 'active';

}

$scope.getProgress = function() {
	return {
		'width': (100*$scope.position)/($scope.walk.length-1) + '%'
	};
}

////////////////////////////////////////////////////////////
////////////////////////LISTENERS///////////////////////////
////////////////////////////////////////////////////////////
/*$scope.$on('$destroy', function (event) {
	console.log('$destroy event', event);
	if (event.targetScope===$scope) {
		if (zoomControl) {
			zoomControl.style.display = 'block';
		}
	}
});*/

////////////////////////////////////////////////////////////
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////

console.log($routeParams._id);
World.get({id: $routeParams._id, m: true}, function(data) {
	if (data.err) {
		 console.log('World not found!');
		 console.log(data.err);
	} else {
		console.log(data);
		angular.extend($scope.world, data.world);
		angular.extend($scope.style, data.style);
		
		if ($scope.world.source_meetup && $scope.world.source_meetup.id) {
			$scope.walk = meetupWalk;
		}
		map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/interfacefoundry.jh58g2al/{z}/{x}/{y}.png');
		setUpProgress();
	}
});

}]);

app.controller('WalkLocationController', ['$scope', '$rootScope', '$timeout', 'leafletData', function($scope, $rootScope, $timeout, leafletData) {
	angular.extend($scope, {tiles: tilesDict['arabesque']});
	angular.extend($scope, {center: {lat: 42,
									lng: -83,
									zoom: 15}});
	angular.extend($scope, {markers: {}});
	
	$scope.$watch('temp.MapActive', function(current, old) {
		console.log('scopewatch');
		console.log(current, old);
		if (current==true) {
		leafletData.getMap('locMap').then(function(map) {
			console.log('invalidating size');
			map.invalidateSize();
		});
		}
	});
	
	$scope.showPosition = function(lat, lng) {
		var tempLat = lat.valueOf(),
			tempLng = lng.valueOf();
		angular.extend($scope, {markers: {
							m: {
								lat: tempLat,
								lng: tempLng,
								icon: {
									iconUrl: 'img/marker/bubble-marker-50.png',
									iconSize: [35, 67]
								},
								draggable: true
							}}});		
		$scope.center.lat = tempLat;
		$scope.center.lng = tempLng;
		$scope.world.loc = { 
			coordinates: [tempLng,tempLat]
		}
		
		$scope.world.hasLoc = true;
		$scope.$apply(function() {
			$scope.locLoading = false;
		});
		leafletData.getMap('locMap').then(function(map) {
			console.log('invalidating size');
			map.invalidateSize();
		});
		console.log('showPosition done', $scope.locLoading);
	}
	
	$scope.searchByAddress = function() {
		console.log('--searchByAddress()--');
		var geocoder = new google.maps.Geocoder();
		if (geocoder) {
			$scope.locLoading = true; 
			geocoder.geocode({'address': $scope.temp.address},
				function (results, status) {
					if (status == google.maps.GeocoderStatus.OK) {

						console.log('invalidating size');
						//map.invalidateSize();
						
						console.log(results[0].geometry.location.lat());
						$scope.showPosition(results[0].geometry.location.lat(),
						 					results[0].geometry.location.lng());
						 
					} else { console.log('No results found.')}
					
				});
		}
		
	}
	
	$scope.searchByLocation = function() {
		if (navigator.geolocation) {
			$scope.locLoading = true;
   			navigator.geolocation.getCurrentPosition(function(position) {
   				//position
				$scope.showPosition(position.coords.latitude, position.coords.longitude);	
   				
   				}, function() {
   				console.log('location error');
   			}, {timeout:5000});
   		} else {
	   		console.log('No geolocation!');
   		}
   		
	}

}]);

app.directive('floorSelector', floorSelector);

floorSelector.$inject = ['mapManager'];

function floorSelector(mapManager) {
	return {
		restrict: 'E',
		scope: {
			world: '=world',
			style: '=style',
			landmarks: '=landmarks',
			loadLandmarks: '&'
		},
		templateUrl: 'components/floor_selector/floor.selector.html',
		link: link
	};

	function link(scope, elem, attr) {

		scope.showFloors = false;
		scope.floors = _.chain(scope.world.style.maps.localMapArray)
			.filter(function(f) {
				return f.floor_num;
			})
			.groupBy(function(f) {
				return f.floor_num;
			})
			.sortBy(function(f) {
				return -f.floor_num;
			})
			.value()
			.reverse();

		scope.currentFloor = scope.floors.slice(-1)[0][0] > 0 ? 
											   scope.floors.slice(-1)[0][0] : findCurrentFloor(scope.floors);

		function findCurrentFloor(floors) {
			var tempFiltered = floors.filter(function(f) {
				return f[0].floor_num > 0;
			});
			return tempFiltered.length ? tempFiltered.slice(-1)[0][0] : floors[0][0];
		}

		scope.selectFloor = function(index) {
			scope.currentFloor = scope.floors[index][0];
			showCurrentFloorMaps(index);
			showCurrentFloorLandmarks(index);
		}

		scope.openFloorMenu = function() {
			scope.showFloors = !scope.showFloors;
		}

		function showCurrentFloorMaps(index) {
			mapManager.removeOverlays();
			setTimeout(function() {
				var floorMaps = scope.floors[index];
				floorMaps.forEach(function(m) {
					mapManager.addOverlay(m.localMapID, m.localMapName, m.localMapOptions);
				});

					
			}, 100)
		}

		function showCurrentFloorLandmarks(index) {
			scope.loadLandmarks();

			setTimeout(function() {

				var removeLandmarks = _.chain(scope.landmarks)
					.filter(function(l) {
						return l.loc_info;
					})
					.filter(function(l) {
						return l.loc_info.floor_num !== scope.currentFloor.floor_num;
					})
					.value();

					removeLandmarks.forEach(function(l) {
						mapManager.removeMarker(l._id);
					});
					
				}, 500)
		}	
	}
}

app.filter('floorNumberFilter', floorNumberFilter);

function floorNumberFilter() {
	return function(floor) {
		if (!floor) {
			return;
		}
		if (floor.floor_num <= 1) {
			return floor.floor_name[0];
		} else {
			return floor.floor_num;
		}
	}
}
app.controller('HomeController', ['$scope', '$rootScope', '$location', 'worldTree', 'styleManager', 'mapManager', 'geoService', 'ifGlobals', function ($scope, $rootScope, $location, worldTree, styleManager, mapManager, geoService, ifGlobals) {
var map = mapManager, style = styleManager;

style.resetNavBG();
map.resetMap();

$scope.temp = {};
$scope.loadState = 'loading';
$scope.kinds = ifGlobals.kinds;

$scope.select = function(bubble) {
	if ($scope.temp.mapOn) {
		if ($scope.selected==bubble) {
			// already selected
			$location.path('w/'+bubble.id);
		} else {
			$scope.selected = bubble;
			map.setMarkerFocus(bubble._id);
			map.setCenterWithFixedAperture(bubble.loc.coordinates, 18, 0, 240);
		}
	} else {
		$location.path('w/'+bubble.id);
	}
}

function initMarkers() {
	var bubbles = $scope.bubbles;
	bubbles.forEach(function(bubble, index, bubbles) {
		if (bubble) {
		map.addMarker(bubble._id, {
			lat:bubble.loc.coordinates[1],
			lng:bubble.loc.coordinates[0],
			draggable: false,
			message: '<a if-href="#w/'+bubble.id+'">'+bubble.name+'</a>',
			enable: 'leafletDirectiveMarker.click',
			icon: {
				iconUrl: 'img/marker/bubble-marker-50.png',
				shadowUrl: '',
				iconSize: [35, 67],
				iconAnchor: [17, 67],
				popupAnchor: [0, -30]
			},
			_id: bubble._id	
		});
		}
	});
	map.setCenterWithFixedAperture([geoService.location.lng, geoService.location.lat], 18, 0, 240);
}

//LISTENERS//

$scope.$watch('temp.mapOn', function(newVal, oldVal) {
	switch (newVal) {
		case true:
			style.navBG_color = 'rgba(245, 67, 54, 0.96)';
		break;
		case false:
			style.resetNavBG();
		break;
	}
}) 

$rootScope.$on('leafletDirectiveMarker.click', function(event, args) { //marker clicks beget list selection
	var bubble = $scope.bubbles.find(function(element, index, array) {
		if (element._id==args.markerName) {
			return true;
		} else { 
			return false;
		}
	});
	$scope.select(bubble);
});

//INIT

worldTree.getNearby().then(function(data) { 
	$scope.$evalAsync(function($scope) {
		$scope.homeBubbles = data['150m'] || [];
		$scope.nearbyBubbles = data['2.5km'] || [];
		
		if ($scope.nearbyBubbles.length>0 && $scope.homeBubbles.length>0) {
			$scope.bubbles = $scope.homeBubbles.concat($scope.nearbyBubbles);
		} else if ($scope.nearbyBubbles.length>0) {
			$scope.bubbles = $scope.nearbyBubbles;
		} else if ($scope.homeBubbles.length>0) {
			$scope.bubbles = $scope.homeBubbles;
		} else {
			$scope.bubbles = [];
		}
		
		$scope.loadState = 'success';
		initMarkers();
	});
}, function(reason) {
	//failure
	console.log(reason);
	$scope.loadState = 'failure';
});

}]);
app.controller('indexIF', ['$location', '$scope', 'db', 'leafletData', '$rootScope', 'apertureService', 'mapManager', 'styleManager', 'alertManager', 'userManager', '$route', '$routeParams', '$location', '$timeout', '$http', '$q', '$sanitize', '$anchorScroll', '$window', 'dialogs', 'worldTree', 'beaconManager', 'lockerManager', function($location, $scope, db, leafletData, $rootScope, apertureService, mapManager, styleManager, alertManager, userManager, $route, $routeParams, $location, $timeout, $http, $q, $sanitize, $anchorScroll, $window, dialogs, worldTree, beaconManager, lockerManager) {
console.log('init controller-indexIF');
$scope.aperture = apertureService;
$scope.map = mapManager;
$scope.style = styleManager;
$scope.alerts = alertManager;
$scope.userManager = userManager;

$scope.dialog = dialogs;
    
angular.extend($rootScope, {globalTitle: "Bubbl.li"}); 

$rootScope.hideBack = true; //controls back button showing

var deregFirstShow = $scope.$on('$routeChangeSuccess', _.after(2, function() {
	console.log('$routeChangeSuccess');
	console.log(arguments);
	$rootScope.hideBack = false;
	deregFirstShow();
}))

$scope.$on('viewTabSwitch', function(event, tab) {
	$scope.viewTab = tab;
})  //for home/explore/search tabs

$scope.newWorld = function() {
    console.log('newWorld()');
    $scope.world = {};
    $scope.world.newStatus = true; //new
    db.worlds.create($scope.world, function(response){
      console.log('##Create##');
      console.log('response', response);
      $location.path('/edit/walkthrough/'+response[0].worldID);
    });
} //candidate for removal, should use worldTree.createWorld instead

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
	
$scope.go = function(path) {
	$location.path(path);
} 
	
$scope.goBack = function() {
	$window.history.back();
	$scope.$emit('viewTabSwitch', 'home');
}

$scope.logout = function() {
      $http.get('/api/user/logout', {server:true});
      userManager.loginStatus = false;
      //$location.url('/');
} //switch to userManager method

$scope.sendFeedback = function(text) { //sends feedback email. move to dialog directive

    var data = {
      emailText: ('FEEDBACK:\n' + $sanitize(text) + '\n===\n===\n' + $rootScope.userName)
    }

    $http.post('feedback', data).
      success(function(data){
        console.log('feedback sent');
        alert('Feedback sent, thanks!');

      }).
      error(function(err){
        console.log('there was a problem');
    });
};

/*
$scope.sessionSearch = function() { 
    $scope.landmarks = db.landmarks.query({queryType:"search", queryFilter: $scope.searchText});
};
*/
    
$scope.getNearby = function($event) {
	$scope.nearbyLoading = true;
	worldTree.getNearby().then(function(data) {
    $scope.altBubbles = data['150m'];
    $scope.nearbyBubbles = data['2.5km'];
		$scope.nearbyLoading = false;
	}, function(reason) {
		console.log('getNearby error');
		console.log(reason);
		$scope.nearbyLoading = false;
	})
	$event.stopPropagation();
}

$scope.share = function(platform) {
  var link;
  var height = 450;
  var width = 560;
  //center popup on screen
  var left = (screen.width - width)/2;
  var top = (screen.height - height)/2;
  
  if (platform == 'facebook') {
    link = 'https://www.facebook.com/sharer/sharer.php?u=https://bubbl.li'+$location.url();
  }
  else if (platform == 'twitter') {
    link = 'https://twitter.com/intent/tweet?url=https://bubbl.li'+$location.url();
  }
  window.open(
    link,
    'Bubbl.li',
    'height=450,width=558,top='+top+',left='+left+'scrollbars'
  );
};

$scope.fbLogin = function() {
	userManager.fbLogin().then(
		function (success) {
			console.log(success);
			userManager.checkLogin();
		}, function (failure) {
			console.log(failure);	
		})
}
//On Phonegap startup, try to login with either saved username/pw or facebook
lockerManager.getCredentials().then(function(credentials) {
	if (credentials.username, credentials.password) {
		userManager.signin(credentials.username, credentials.password).then(function(success) {
			userManager.checkLogin().then(function(success) {
			console.log(success);
			});
		}, function (reason) {
			console.log('credential signin error', reason)
		});
	} else if (credentials.fbToken) {
		ifGlobals.fbToken = credentials.fbToken;
		userManager.checkLogin().then(function(success) {
			console.log(success);	
		})
	}
}, function(err) {
	console.log('credential error', error); 
});
}]);
app.directive('exploreView', ['worldTree', '$rootScope', 'ifGlobals', function(worldTree, $rootScope, ifGlobals) {
	return {
		restrict: 'EA',
		scope: true,
		link: function (scope, element, attrs) {
			scope.loadState = 'loading';
			scope.kinds = ifGlobals.kinds;

			
			$rootScope.$on('viewTabSwitch', function(event, tab) {
				if (tab === 'explore') {
					scope.loadState = 'loading';
					worldTree.getNearby().then(function(data) {
						scope.homeBubbles = data['150m'] || [];
						scope.nearbyBubbles = data['2.5km'] || [];			
						scope.loadState = 'success';
					}, function(reason) {
						scope.loadState = 'failure'; 
					});
				}
			});
	
		},
		templateUrl: 'components/nav/exploreView.html' 
	}
}])
app.directive('navTabs', ['$rootScope', '$routeParams', '$location', 'worldTree', '$document',  function($rootScope, $routeParams, $location, worldTree, $document) {
	return {
		restrict: 'EA',
		scope: true,
		link: function(scope, element, attrs) {
			scope.selected = 'home';
			scope.select = function (tab) {
				if (scope.selected===tab && tab === 'home') {
					if ($routeParams.worldURL) {
						var wRoute = "/w/"+$routeParams.worldURL;
						$location.path() === wRoute ? $location.path("/") : $location.path(wRoute);

					} else {
						$location.path('/');
					}
				}
				scope.$emit('viewTabSwitch', tab);
			}
			
			scope.$on('$locationChangeSuccess', function(event) {
				scope.$emit('viewTabSwitch', 'home');
			});
			
			$rootScope.$on('viewTabSwitch', function(event, tab) {
				scope.selected=tab;
			});
			
/*
			$document.on('keydown', function(e) {
				console.log('keydown', e, scope.selected)
			if (e.keyCode===8 && scope.selected !== 'home') {
				console.log('keycode 8 & selected not home')
				e.stopPropagation();
				e.preventDefault();
				scope.$apply(function() {
					scope.$emit('viewTabSwitch', 'home');
				});
			}
			});
*/
			
			scope.nearbiesLength = function() {
				if (worldTree._nearby) {
					return _.reduce(worldTree._nearby, function(memo, value) {return memo+_.size(value)}, 0);
				} else {
					return 0;
				}
			}
		},
		template: 
'<button class="view-tab home-tab" ng-class="{selected: selected==\'home\'}" ng-click="select(\'home\')"></button>'+
'<button class="view-tab explore-tab" ng-class="{selected: selected==\'explore\'}" ng-click="select(\'explore\')">'+
'<span ng-show="nearbiesLength()>0" class="compass-badge badge" ng-cloak>{{nearbiesLength()}}</span></button>'+
'<button class="view-tab search-tab" ng-class="{selected: selected==\'search\'}" ng-click="select(\'search\')"></button>'
	}
}])
app.directive('searchView', ['$http', 'geoService', function($http, geoService) {
	return {
		restrict: 'EA',
		scope: true,
		link: function(scope, element, attrs) {
			scope.search = function(searchText) {
				scope.lastSearch = searchText;
				geoService.getLocation().then(function(coords) {
				
				scope.searching = $http.get('/api/textsearch', {server: true, params: 
					{textQuery: searchText, userLat: coords.lat, userLng: coords.lng, localTime: new Date()}})
					.success(function(result) {
						if (!result.err) {
							scope.searchResult = result;
						} else {
							scope.searchResult = [];
						}
					})
					.error(function(err) {console.log(err)});
				});		
			}
			
			scope.searchOnEnter = function($event, searchText) {
				if ($event.keyCode === 13) {
					scope.search(searchText);
				}
			}
		},
		templateUrl: 'components/nav/searchView.html' 
	}
}])
app.controller('MeetupController', ['$scope', '$window', '$location', 'styleManager', '$rootScope','dialogs', function ($scope, $window, $location, styleManager, $rootScope, dialogs) {


	var style = styleManager;

	style.navBG_color = "#3d66ca";

	angular.element('#view').bind("scroll", function () {
		console.log(this.scrollTop);
	});
	
	angular.element('#wrap').scroll(
	_.debounce(function() {
		console.log(this.scrollTop);
		$scope.scroll = this.scrollTop;
		$scope.$apply();
		}, 20));

	$scope.openSignup = function(){
		dialogs.showDialog('authDialog.html');
	}
	
	// $scope.loadmeetup = function() {
	// 	$location.path('/auth/meetup');
	// }

}]);

app.controller('WelcomeController', ['$scope', '$window', '$location', 'styleManager', '$rootScope', 'dialogs', function ($scope, $window, $location, styleManager, $rootScope, dialogs) {
	var style = styleManager;

	style.navBG_color = "#3d66ca";

	angular.element('#view').bind("scroll", function () {
		console.log(this.scrollTop);
	});
	
	angular.element('#wrap').scroll(
	_.debounce(function() {
		console.log(this.scrollTop);
		$scope.scroll = this.scrollTop;
		$scope.$apply();
		}, 20));

	$scope.openSignup = function(){
		dialogs.showDialog('authDialog.html');
	}
	// $scope.loadmeetup = function() {
	// 	$location.path('/auth/meetup');
	// }

}]);
/**********************************************************************
 * Login controller
 **********************************************************************/
app.controller('LoginCtrl', ['$scope', '$rootScope', '$http', '$location', 'apertureService', 'alertManager', function ($scope, $rootScope, $http, $location, apertureService, alertManager) {
	
  //if already logged in
  if ($rootScope.showLogout){
    $location.url('/profile');
  }

  $scope.alerts = alertManager;
  $scope.aperture = apertureService;  

  $scope.aperture.set('off');

  // This object will be filled by the form
  $scope.user = {};


  //fire socialLogin
$scope.socialLogin = function(type){

    console.log(type);

    $location.url('/auth/'+type);

    $http.post('/auth/'+type).
      success(function(user){
  
      }).
      error(function(err){
        if (err){
          $scope.alerts.addAlert('danger',err);
        }
      });
  };

  // Register the login() function
  $scope.login = function(){

    var data = {
      email: $scope.user.email,
      password: $scope.user.password
    }

    $http.post('/api/user/login', data).
      success(function(user){
          if (user){
            $location.url('/profile');
          }
      }).
      error(function(err){
        if (err){
          $scope.alerts.addAlert('danger',err);
        }
      });
  };

}]);

app.controller('SignupCtrl', ['$scope', '$rootScope', '$http', '$location', 'apertureService', 'alertManager', 
function ($scope, $rootScope, $http, $location, apertureService, alertManager) {
  $scope.alerts = alertManager;
  $scope.aperture = apertureService;  
  $scope.aperture.set('off');

  // This object will be filled by the form
  $scope.user = {};

  if ($routeParams.incoming == 'messages'){
    $scope.showMessages = true;
  }

  // Register the login() function
  $scope.signup = function(){

    var data = {
      email: $scope.user.email,
      password: $scope.user.password
    }

    $http.post('/api/user/signup', data).
      success(function(user){
          if (user){

              //if incoming from chat sign up, then go back to chat
              if ($routeParams.incoming == 'messages'){
                window.history.back();
              }
              //otherwise go to profile
              else {
                $location.url('/profile');
              } 
          }
      }).
      error(function(err){
        if (err){
          $scope.alerts.addAlert('danger',err);
        }
      });
  }

  $scope.goBack = function() {
    window.history.back();
  }
}]);

app.controller('ForgotCtrl', ['$scope', '$http', '$location', 'apertureService', 'alertManager', function ($scope, $http, $location, apertureService, alertManager) {

  $scope.alerts = alertManager;
  $scope.aperture = apertureService;  

  $scope.aperture.set('off');

  // This object will be filled by the form
  $scope.user = {};

  $scope.sendForgot = function(){

    var data = {
      email: $scope.user.email
    }

    $http.post('/forgot', data).
      success(function(data){
          // console.log(data);
          $scope.alerts.addAlert('success','Instructions for resetting your password were emailed to you');
          $scope.user.email = '';
          // if (user){
          //   $location.url('/profile');
          // }
      }).
      error(function(err){
        if (err){
          $scope.alerts.addAlert('danger',err);
        }
      });
  };

}]);


app.controller('ResetCtrl', ['$scope', '$http', '$location', 'apertureService', 'alertManager', '$routeParams', function ($scope, $http, $location, apertureService, alertManager, $routeParams) {
  $scope.alerts = alertManager;
  $scope.aperture = apertureService;  

  $scope.aperture.set('off');

  $http.post('/resetConfirm/'+$routeParams.token).
    success(function(data){
        
    }).
    error(function(err){
      if (err){
        //$scope.alerts.addAlert('danger',err);
        $location.path('/forgot');
      }
    });


  $scope.sendUpdatePassword = function(){

    var data = {
      password: $scope.user.password
    }

    $http.post('/reset/'+$routeParams.token, data).
      success(function(data){
        $location.path('/profile');
      }).
      error(function(err){
        if (err){
          $scope.alerts.addAlert('danger',err);
        }
      });
  };

}]);


app.controller('resolveAuth', ['$scope', '$rootScope', function ($scope, $rootScope) {

  angular.extend($rootScope, {loading: true});

  location.reload(true);

}]); 


app.controller('UserController', ['$scope', '$rootScope', '$http', '$location', '$route', '$routeParams', 'userManager', '$q', '$timeout', '$upload', 'Landmark', 'db', 'alertManager', '$interval', 'ifGlobals', 'userGrouping', function ($scope, $rootScope, $http, $location, $route, $routeParams, userManager, $q, $timeout, $upload, Landmark, db, alertManager, $interval, ifGlobals, userGrouping) {

angular.extend($rootScope, {loading: false});
$scope.fromMessages = false;
$scope.state = {};
$scope.subnav = {
	profile: ['me', 'contacts', 'history'],
	worlds: ['worlds', 'drafts', 'filter']
}
$scope.files = {
	avatar: undefined
};

$scope.kinds = ifGlobals.kinds;

$scope.spinLeft = false;
$scope.spinLeftLong = false;

var saveTimer = null;
var alert = alertManager;

$scope.$watch('files.avatar', function(newValue, oldValue) {
	console.log(newValue, oldValue);
	if (newValue===undefined) {
		return;
	}
	console.log($scope.files);
	var file = newValue[0];
	$scope.upload = $upload.upload({
		url: '/api/upload',
		method: 'POST',
		file: file,
		server: true
	}).progress(function(e) {
		console.log('progress');
		console.log(e);
		//console.log('%' + parseInt(100.0 * e.loaded/e.total));
		$scope.spinLeft = true;
	}).success(function(data, status, headers, config) {
		console.log(data);
		$scope.user.avatar = data;
		$rootScope.avatar = data;
		$scope.uploadFinished = true;

		$scope.spinLeftLong = true;
		$timeout(function() {
			$scope.spinLeft = false;
			$scope.spinLeftLong = false;
		}, 1000);		
	});
});

function saveUser() {
	if ($scope.user) {
		userManager.saveUser($scope.user);
		alert.addAlert('success', 'Your contact info has been successfully saved!', true);
	} else {
		console.log('error');
	}
}

$scope.update = function(tab) {
	$scope.state.myProfile = $scope.subnav.profile.indexOf(tab) > -1 || !tab;
	$scope.state.myWorlds = $scope.subnav.worlds.indexOf(tab) > -1;
	$scope.state.profile = tab == 'me';
	$scope.state.contacts = tab == 'contacts';
	$scope.state.history = tab == 'history';
	$scope.state.worlds = tab == 'worlds';
	$scope.state.drafts = tab == 'drafts';
	
	$scope.state.template = 'components/user/templates/'+tab+'.html';
	if ($scope.state.myProfile) {$scope.menuLink = '/profile/me';}
	if ($scope.state.myWorlds) {$scope.menuLink = '/profile/worlds';}
	
	console.log($scope.state);
}


$scope.inspect = function(bubble) {
	if (bubble) {
		$scope.selected = bubble;
	} else {
		$scope.selected = false;
	}
}

$scope.inspectEvent = function(calEvent) {
	console.log('test');
	$scope.inspect(calEvent.bubble);
}

$scope.showCalendar = function() {
	if ($scope.calendarActive) {
		$scope.calendarActive = false;
	} else if ($scope.calendarLoaded) {
		$scope.calendarActive = true;
	} else {
		$scope.calendar = {events: userGrouping.groupForCalendar($scope.bubbles)}
		$scope.calendarLoaded = true;
		$scope.calendarActive = true;
	}	
}


$scope.calConfig = {
	// 	height: 360,
		eventClick: $scope.inspectEvent
}

////////////////////////////////////////////////////////////
/////////////////////////LISTENERS//////////////////////////
////////////////////////////////////////////////////////////
var lastRoute = $route.current;
$scope.$on('$locationChangeSuccess', function (event) {
    if (lastRoute.$$route.originalPath === $route.current.$$route.originalPath) {
        $scope.update($route.current.params.tab);
        $route.current = lastRoute;        
    }
});

$scope.$watchCollection('user', function (newCol, oldCol) {
	if (newCol != oldCol && oldCol!=undefined) {
		if (saveTimer) {
			$timeout.cancel(saveTimer);
		}
		saveTimer = $timeout(saveUser, 1000);
	}
});

////////////////////////////////////////////////////////////
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////


$scope.update($route.current.params.tab);

$scope.waitingforMeetup = false; //if from meetup, hide worlds until complete 

//if user login came from Meetup, then process new meetup worlds
if ($routeParams.incoming == 'meetup'){
	$scope.fromMeetup = true;
	$scope.waitingforMeetup = true;

	$http.post('/api/process_meetups').success(function(response){
		checkProfileUpdates(); //now wait until meetup bubbles come in
		// $http.get('/api/user/profile').success(function(user){
		// 	$scope.worlds = user;		
			
		// });
	}).
	error(function(data) {
		angular.extend($rootScope, {loading: false});
		$http.get('/api/user/profile', {server: true}).success(function(user){
			$scope.worlds = user;	
			$scope.waitingforMeetup = false;	
		});
	});
	
}
else if ($routeParams.incoming == 'messages'){
	$scope.fromMessages = true;
}
else {
	$http.get('/api/user/profile', {server: true}).success(function(user){
		console.log(user);
		
		//$scope.worlds = user;
		$scope.groups = userGrouping.groupByTime(user);
		console.log($scope.groups);
		
		$scope.bubbles = user;

		//sortWorlds(user);
	});
}

/*
function sortWorlds(user,incoming){


	switch(incoming) {
	    case 'meetup':

	        console.log('meetup');
	        break;

	    default:

	    	var eventBubbles = [];
	    	var eventBubblesFuzzy = [];
	    	var staticBubbles = [];
	    	var tempFuzzyTime;

	    	for (i = 0; i < user.length; i++) { 
	    		if(user[i].time.start){
	    			eventBubbles.push(user[i]);
	    		}
	    		else {
	    			staticBubbles.push(user[i]);
	    		}
	    	}

	    	if (eventBubbles.length > -1){
		    	//sort events descending
		    	eventBubbles.sort(function(a, b){
				    var d1 = new Date(a.time.start);
				    var d2 = new Date(b.time.start);
				    return d2-d1; // d2-d1 for ascending order
				});
			}

			if (staticBubbles.length > -1){
		    	//sort events descending
		    	staticBubbles.sort(function(a, b){
				    var d1 = new Date(a.time.created);
				    var d2 = new Date(b.time.created);
				    return d2-d1; // d2-d1 for ascending order
				});
			}

	    	for (i = 0; i < eventBubbles.length; i++) {

    			var MM = new Date(eventBubbles[i].time.start).getUTCMonth() + 1;
    			MM = MM.toString();
    			if (MM < 10){
    				MM = "0" + MM;
    			}
    			var DD = new Date(eventBubbles[i].time.start).getUTCDate();
    			DD = DD.toString();
    			if (DD < 10){
    				DD = "0" + DD;
    			}
    			var YY = new Date(eventBubbles[i].time.start).getUTCFullYear(); //get year of bubble event

    			var fuzzyTime = fuzzyTimeFormat(DD,MM,YY);

    			//new fuzzy group
    			if (tempFuzzyTime !== fuzzyTime){

	    			//get yesterday-ish date to display stuff sort of in future but a little past too
	    			var currentDate = new Date();
	    			currentDate.setDate(currentDate.getDate() - 1);

	    			//is date in the past-ish?
	    			if(new Date(eventBubbles[i].time.start) < currentDate){
						var fuzzyPast = true;
					}
					else{
						var fuzzyPast = false;
					}

    				var fuzzCat = {
    					fuzzyHeader: fuzzyTime,
    					fuzzyEvents: [eventBubbles[i]],
    					fuzzyPast: fuzzyPast
    				};

    				eventBubblesFuzzy.push(fuzzCat);
    				tempFuzzyTime = fuzzyTime;
    			}
    			//same fuzzy group
    			else {
    				eventBubblesFuzzy.filter(function ( obj ) {
					    if(obj.fuzzyHeader === fuzzyTime){
					    	obj.fuzzyEvents.push(eventBubbles[i]);
					    }
					})[0];
    			}

	    	}
	    	$scope.eventTimes = eventBubblesFuzzy;
	    	$scope.staticWorlds = staticBubbles;
	}
	

}
*/

//if came from meetup, keep checking for new meetups until route change
function checkProfileUpdates(){
	$scope.stop = $interval(checkProfile, 2000);

	function checkProfile(){
		$http.get('/api/user/profile', {server: true}).success(function(user){
		$scope.groups = userGrouping.groupByTime(user);
		console.log($scope.groups);
		
		$scope.bubbles = user;
			$scope.waitingforMeetup = false;	
			//$interval.cancel(checkProfile);
		});
	}
	//stops interval on route change
	var dereg = $rootScope.$on('$locationChangeSuccess', function() {
	    $interval.cancel($scope.stop);
	    dereg();
  	});

}

//showing "pretty" aka fuzzy time style dates
function fuzzyTimeFormat(DD,MM,YY) {
	//Fuzzy Time *~ - - - - ~ - - - ~ - - - ~ - - 
	//=========================================//
	/*
	 * JavaScript Pretty Date
	 * Copyright (c) 2011 John Resig (ejohn.org)
	 * Licensed under the MIT and GPL licenses.
	 */
	 //original code was modified

	// Takes an ISO time and returns a string representing how
	// long ago the date represents.
	function prettyDate(MMDDYY){
		var date = new Date((MMDDYY || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
			diff = (((new Date()).getTime() - date.getTime()) / 1000),
			day_diff = Math.floor(diff / 86400);
		if ( isNaN(day_diff) )
			return;	
		return day_diff == 0 && (
				diff < 60 && "just now" ||
				diff < 120 && "1 minute ago" ||
				//diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
				diff < 7200 && "1 hour ago" ||
				diff < 86400 && "Today") ||
			day_diff == -1 && "Tomorrow" ||
			day_diff == 1 && "Yesterday" ||	
			//future
			(day_diff > -7 && day_diff < -1) && day_diff + " days from now" ||  
			day_diff == -7 && "Next Week" ||  
			(day_diff > -14 && day_diff < -7) && "Next Week" ||
			(day_diff > -31 && day_diff < -14) && day_diff && Math.ceil( day_diff / -4 ) + " weeks from now" ||
			day_diff < -31 && Math.ceil( day_diff / -12) + " months from now" ||
			//past
			(day_diff < 7 && day_diff > 1) && day_diff + " days ago" ||
			day_diff == 7 && "Last Week" ||  
			(day_diff < 31 && day_diff > 7) && Math.ceil( day_diff / 7 ) + " weeks ago" ||
			day_diff > 31 && day_diff && Math.ceil( day_diff / 12 ) + " months ago";
	}
	//=========================================//
    return prettyDate(MM+'-'+DD+'-'+YY).toString().replace('-','');
}


$scope.deleteWorld = function(i) {
	var deleteConfirm = confirm("Are you sure you want to delete this?");
	if (deleteConfirm) {
		Landmark.del({_id: $scope.worlds[i]._id}, function(data) {
		//$location.path('/');
		console.log('##Delete##');
		console.log(data);
		$scope.worlds.splice(i, 1); //Removes from local array
	  });
	  }
  	}
  
$scope.deleteBubble = function(_id) {
	var deleteConfirm = confirm("Are you sure you want to delete this?");
	if (deleteConfirm) {
		Landmark.del({_id: _id}, function(data) {
		//$location.path('/');
		console.log('##Delete##');
		console.log(data);
		
		$route.reload();
		});
	 }
}

$scope.newWorld = function() {
	console.log('newWorld()');
	
	alert.addAlert('warning', "Creating New Bubbles coming soon to the iOS app. For now, login to build through https://bubbl.li", true);
	return;
	
	$scope.world = {};
	$scope.world.newStatus = true; //new
	db.worlds.create($scope.world, function(response){
		console.log('##Create##');
		console.log('response', response);
		$location.path('/edit/walkthrough/'+response[0].worldID);
	});
}

$scope.go = function(url) {
	$location.path(url);
}

userManager.getUser().then(
	function(response) {
	console.log('response', response);
	$scope.user = response;
}, function(reason) {
	console.log('reason', reason);
	$location.path('/');
	alert.addAlert('warning', "You're not logged in!", true);
})

}]);

function CategoryController( World, db, $route, $routeParams, $scope, $location, leafletData, $rootScope, apertureService, mapManager, styleManager) {
   	var map = mapManager;
  	var style = styleManager;
  	$scope.worldURL = $routeParams.worldURL;
  	$scope.category = $routeParams.category;
    $scope.aperture = apertureService;
    $scope.aperture.set('full');
    
    $scope.landmarks = [];
    
    var lastRoute = $route.current;
$scope.$on('$locationChangeSuccess', function (event) {
    if (lastRoute.$$route.originalPath === $route.current.$$route.originalPath) {
        $scope.category = $route.current.params.category;
        $route.current = lastRoute;
        
        console.log($scope.category);
        loadLandmarks();
    }
});
 	
 	function loadLandmarks() {
		console.log('--loadLandmarks--');
		//$scope.queryType = "all";
		//$scope.queryFilter = "all";
		map.removeAllMarkers();
		$scope.landmarks = [];
		db.landmarks.query({ queryType:'all', queryFilter:'all', parentID: $scope.world._id}, function(data){
				console.log('--db.landmarks.query--');
				console.log('data');
				console.log(data);
				angular.forEach(data, function(landmark) {
					if (landmark.category==$scope.category) {
						$scope.landmarks.push(landmark);
						map.addMarker(landmark._id, {
							lat:landmark.loc.coordinates[1],
							lng:landmark.loc.coordinates[0],
							draggable: false,
							message:landmark.name
						});
					}	
				});
				console.log('$scope.landmarks');
				console.log($scope.landmarks);
		});	
			
	}
 	
////////////////////////////////////////////////////////////
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////	
	 	
 	World.get({id: $scope.worldURL}, function(data) {
 			console.log('--World.get--');
			console.log(data);
		$scope.world = data.world;
			console.log('-World-');
			console.log($scope.world);
		$scope.style = data.style;
			console.log('-Style-');
			console.log($scope.style);
			
			 map.setMaxBoundsFromPoint([$scope.world.loc.coordinates[1],$scope.world.loc.coordinates[0]], 0.05);
		 map.setCenter($scope.world.loc.coordinates, 17); //pull zoom from mapoptions if exists
			
			loadLandmarks();
 	});
 	   
}
app.controller('LandmarkController', ['World', 'Landmark', 'db', '$routeParams', '$scope', '$location', '$window', 'leafletData', '$rootScope', 'apertureService', 'mapManager', 'styleManager', 'userManager', 'alertManager', '$http', 'worldTree', 
function (World, Landmark, db, $routeParams, $scope, $location, $window, leafletData, $rootScope, apertureService, mapManager, styleManager, userManager, alertManager, $http, worldTree) {

var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];
zoomControl.style.top = "100px";
zoomControl.style.left = "1%";

console.log('--Landmark Controller--');
var map = mapManager;
var style = styleManager;
var alerts = alertManager;
//$scope.aperture = apertureService;
var aperture = apertureService;

$scope.worldURL = $routeParams.worldURL;
$scope.landmarkURL = $routeParams.landmarkURL;
	
$scope.collectedPresents = [];


worldTree.getWorld($routeParams.worldURL).then(function(data) {
	$scope.world = data.world;
	$scope.style = data.style;
	style.navBG_color = $scope.style.navBG_color;
	map.loadBubble(data.world);
		
worldTree.getLandmark($scope.world._id, $routeParams.landmarkURL).then(function(landmark) {
	$scope.landmark = landmark;
	console.log(landmark); 
	
	var zoomLevel = 18;
	// find min zoom level of all maps on the current floor
	if (findMapsOnThisFloor($scope.world, landmark)) {
		zoomLevel = mapManager.findZoomLevel($scope.world.style.maps.localMapArray);
	}

	goToMark(zoomLevel);

	// add local maps for current floor
	addLocalMapsForCurrentFloor($scope.world, landmark);
	
console.log($scope.style.widgets.presents);

console.log($scope.landmark.category);

				//present collecting enabled and landmark has present
				if ($scope.style.widgets.presents && $scope.landmark.category){

					if ($scope.landmark.category.hiddenPresent && $scope.landmark.category.name){

						// userManager.getUser({},function(user){
						// 	console.log(userManager);
						// });
						$scope.temp = {
							showInitialPresent: true,
							presentCollected: false,
							presentAlreadyCollected: false,
							showPresentCard: true
						}
						// $scope.showPresentCard = true;
						// $scope.showInitialPresent = true;
						// $scope.presentCollected = false;
						// $scope.presentAlreadyCollected = false;

						$http.get('/api/user/loggedin', {server: true}).success(function(user){
							if (user !== '0'){
								userManager.getUser().then(
									function(response) {

									$scope.user = response;

									if(!$scope.user.presents){
										$scope.user.presents = {
											collected:[]
										};
									}
									
									//check if present already collected
									var found = false;	
									for(var i = 0; i < $scope.user.presents.collected.length; i++) {
									    if ($scope.user.presents.collected[i].landmarkID == $scope.landmark._id || $scope.user.presents.collected[i].categoryname == $scope.landmark.category.name) {
									    	if ($scope.user.presents.collected[i].worldID == $scope.world._id){
										        found = true;
										        $scope.temp.presentAlreadyCollected = true;
										        $scope.temp.showInitialPresent = false;
										        break;						    		
									    	}
									    }
									}
									//new present
									if (!found){
										savePresent();
									}
									else {
										checkFinalState();
									}

									function savePresent(){
										$scope.user.presents.collected.unshift({
											avatar: $scope.landmark.category.avatar, 
											landmarkID: $scope.landmark._id,
											landmarkName: $scope.landmark.name,
											worldID: $scope.world._id,
											worldName: $scope.world.name,
											categoryname: $scope.landmark.category.name
										});
										userManager.saveUser($scope.user);
										// display card with avatar + name

										$scope.temp.presentCollected = true;
										$scope.temp.showIntialPresent = false;
										alerts.addAlert('success', 'You found a present!', true);

										checkFinalState();
									}

									//showing collected presents in this world
									for(var i = 0; i < $scope.user.presents.collected.length; i++) {
									    if ($scope.user.presents.collected[i].worldID == $scope.world._id){
											$scope.collectedPresents.push($scope.user.presents.collected[i].categoryname);
									    }
									}

									//to see if user reached world collect goal for final present
									function checkFinalState(){

										var numPresents = $scope.world.landmarkCategories.filter(function(x){return x.present == true}).length;
										var numCollected = $scope.user.presents.collected.filter(function(x){return x.worldID == $scope.world._id}).length;

										//are # of present user collected in the world == to number of presents available in the world?
										if (numPresents == numCollected){
											console.log('final state!');
											//DISPLAY THANK YOU MESSAGE TO USER, collected all
											$scope.temp.finalPresent = true;
											$scope.temp.showInitialPresent = false;
											$scope.temp.presentCollected = false;
											$scope.temp.presentAlreadyCollected = false;
										}
										else{
											$scope.presentsLeft = numPresents - numCollected;
											console.log('presents left '+ $scope.presentsLeft);
										}
									}	

								});
							}
							else {
								$scope.temp.signupCollect = true;
								
							}
						});

					}				
				}


})
});
		

function goToMark(zoomLevel) {
	map.setCenter($scope.landmark.loc.coordinates, zoomLevel, 'aperture-half'); 
	aperture.set('half');
  	// var markers = map.markers;
  	// angular.forEach(markers, function(marker) {
  	// 	console.log(marker);
	  // 	map.removeMarker(marker._id);
  	// });
	map.removeAllMarkers();
  	

  	map.addMarker($scope.landmark._id, {
  			lat: $scope.landmark.loc.coordinates[1],
  			lng: $scope.landmark.loc.coordinates[0],
  			draggable:false,
  			message:$scope.landmark.name,
		  	icon: {
				iconUrl: 'img/marker/bubble-marker-50.png',
				shadowUrl: '',
				iconSize: [35, 67],
				iconAnchor: [17.5, 60],
				popupAnchor: [0, -40]
			},
  			_id: $scope.landmark._id
  			});
  	map.setMarkerFocus($scope.landmark._id);
  	
  	map.refresh();
};

function addLocalMapsForCurrentFloor(world, landmark) {
	if (!(world.style && world.style.maps && world.style.maps.localMapArray)) {
		return;
	}
	map.removeOverlays();

	findMapsOnThisFloor(world, landmark).forEach(function(thisMap) {
		if (thisMap.localMapID !== undefined && thisMap.localMapID.length > 0) {
			map.addOverlay(thisMap.localMapID, 
						thisMap.localMapName, 
						thisMap.localMapOptions);
		}
	});
}

function findMapsOnThisFloor(world, landmark) {
	if (!(world.style && world.style.maps && world.style.maps.localMapArray)) {
		return;
	}
	var localMaps = $scope.world.style.maps.localMapArray;

	var currentFloor;
	if (landmark.loc_info && landmark.loc_info.floor_num) {
		currentFloor = landmark.loc_info.floor_num;
	} else {
		lowestFloor = _.chain(localMaps)
			.map(function(m) {
				return m.floor_num;
			})
			.sortBy(function(m) {
				return m;
			})
			.filter(function(m) {
				return m;
			})
			.value();

		currentFloor = lowestFloor[0] || 1;
	}

	var mapsOnThisFloor = localMaps.filter(function(localMap) {
		return localMap.floor_num === currentFloor;
	});

	return mapsOnThisFloor;
}
		
}]);
app.directive('messageView', function() {
	return {
restrict: 'E',
link: function(scope, element, attrs) {
	
	scope.$watchCollection('messages', function (newCollection, oldCollection, scope) {
		m.render(element[0], newCollection.map(messageTemplate));
	})
	//rerenders whenever messages changes using mithril js
	
	function messageTemplate(message) { //each message object is passed to this function
		return m('li.message',
			{key:message._id, 
			class: message.userID===scope.userID ? 'message-self' : '', //message-self designates a message sent by user
			onclick: function(e) {scope.messageLink(message)}}, //for stickers currently
			[
				m('picture.message-avatar',
					m('img.small-avatar', {src: bubUrl(message.avatar) || 'img/icons/profile.png'})),
				m('h6.message-heading', message.nick || 'Visitor'),
				messageContent(message) //message object passed to next function to switch content templates
			]);
	}
	
	function messageContent(message) { //content template switches based on message kind
		var content,
			kind = message.kind || 'text';
		switch (kind) {
			case 'text':
				content = m('.message-body', message.msg);
				break;
			case 'pic': 
				content = [
					m('img.img-responsive', {src:message.pic, onload: imageLoad}),
					m('.message-body')
				];
				break;
			case 'sticker': 
				content =	[m('.message-sticker-background', [
								m('img.message-sticker-img', {src: message.sticker.img}),
								m('img.message-sticker-link', {src: 'img/icons/ic_map_48px.svg'})
							]),
							m('.message-body', message.msg)]
				break;
			case 'editUser': 
				content = [
					m('.message-body', message.msg),
					m('hr.divider'),
					m('img.msg-chip-img', {src: bubUrl(scope.user.avatar)}),
					m('.msg-chip-label', scope.nick),
					m('img.msg-chip-edit', {src: 'img/icons/ic_edit_grey600.png'})
				];
				break;
		}

		return m('.message-content', content); //end of message building process
	}

	function bubUrl(string) { //some urls don't have an absolute path which will break on iOS
		if (string === undefined) {
			return '';	
		}
		if (string.indexOf('http') > -1) {
			return string;
		} else {
			return 'https://bubbl.li/'+string;
		}
	}
	
	function imageLoad() { //current method to keep scroll at bottom when a message is posted. Could be improved
		element[0].scrollTop = element[0].scrollTop + this.offsetHeight;
	}
	
}
	}
}); 
app.controller('MessagesController', ['$location', '$scope', '$sce', 'db', '$rootScope', '$routeParams', 'apertureService', '$http', '$timeout', 'worldTree', '$upload', 'styleManager', 'alertManager', 'dialogs', 'userManager', 'mapManager', 'ifGlobals', 'leafletData', 'stickerManager', function ($location, $scope,  $sce, db, $rootScope, $routeParams, apertureService, $http, $timeout, worldTree, $upload, styleManager, alertManager, dialogs, userManager, mapManager, ifGlobals, leafletData, stickerManager) {

////////////////////////////////////////////////////////////
///////////////////////INITIALIZE///////////////////////////
////////////////////////////////////////////////////////////
var checkMessagesTimeout;
var alerts = alertManager;
var style = styleManager;
var aperture = apertureService;
var map = mapManager;
aperture.set('off');

var messageList = $('.message-list');

$scope.loggedIn = false;
$scope.nick = 'Visitor';

$scope.msg = {};
$scope.messages = [];
$scope.localMessages = [];
$scope.stickers = ifGlobals.stickers;
$scope.editing = false;

var sinceID = 'none';
var firstScroll = true;

function scrollToBottom() {
	$timeout(function() {
		messageList.animate({scrollTop: messageList[0].scrollHeight * 2}, 300); //JQUERY USED HERE
	},0);
	if (firstScroll==true) {
		firstScroll = false;
		profileEditMessage();
	}
}

//Initiates message checking loop, calls itself. 
function checkMessages() {
	var doScroll = firstScroll;
db.messages.query({roomID:$scope.world._id, sinceID:sinceID}, function(data){
	if (messageList[0].scrollHeight - messageList.scrollTop() - messageList.outerHeight() < 50) {
		doScroll = true;
	}

	if (data.length>0) {
		for (i = 0; i < data.length; i++) { 
		    if ($scope.localMessages.indexOf(data[i]._id) == -1) {
		        if (data[i]._id) {
					$scope.messages.push(data[i]);
		        }
		    }
		}
	    sinceID = data[data.length-1]._id;
	    checkMessages();
	} else {
		checkMessagesTimeout = $timeout(checkMessages, 3000);
	if (doScroll) {
		scrollToBottom();
	}
	}
	 
});
}

function sendMsgToServer(msg) {
$http.post('/api/worldchat/create', msg, {server: true})
	.success(function(success) {
		sinceID = success[0]._id;
		msg._id = success[0]._id;
		$scope.messages.push(msg);
		$scope.localMessages.push(success[0]._id);
		scrollToBottom();
	})
	.error(function(error) {
		//HANDLE
	})
}

$scope.toggleMap = function() {
	if ($scope.editing) {
		$scope.editing = false;
	}
	aperture.toggle('full');
}

$scope.sendMsg = function (e) {
	if ($scope.editing) {
		$scope.pinSticker();
		return;
	}
	if (e) {e.preventDefault()}
	if ($scope.msg.text == null) {return;}
	if (userManager.loginStatus) {
		var newChat = {
		    roomID: $scope.world._id,
			nick: $scope.nick,
			msg: $scope.msg.text,
			avatar: $scope.user.avatar || 'img/icons/profile.png',
		    userID: $scope.userID,
		};
		
		sendMsgToServer(newChat);		
		$scope.msg.text = "";
	}
}

$scope.alert = function (msg) {
	alerts.addAlert('warning', msg, true);
}

$scope.onImageSelect = function($files) {
	$scope.uploading = true;
	$scope.uploadProgress = 0;
	$scope.upload = $upload.upload({
		url: '/api/uploadPicture',
		file: $files[0]
	}).progress(function(e) {
		console.log(e);
		$scope.uploadProgress = parseInt(100.0 * e.loaded / e.total);
	}).success(function(data, status) {
		console.log(data);
		sendMsgToServer({
			roomID: $scope.world._id,
			userID: $scope.userID,
	        nick: $scope.nick,
	        avatar: $scope.user.avatar || 'img/icons/profile.png',
	        msg: '',
	        pic: data,
	        kind: 'pic'
		});
		$scope.uploading = false;
		//console.log(data);
	})
}	

$scope.showStickers = function() {
	$scope.editing = true;
	aperture.set('full');
}

$scope.selectSticker = function(sticker) {
	$scope.selected = sticker;
	$scope.stickerChange = true;
	$scope.msg.text = sticker.name;
	$timeout(function() {
		$scope.stickerChange = false
	}, 500);
}

$scope.messageLink = function(message) {
	console.log(message);
	if (message.sticker) {
		aperture.set('full');
		stickerManager.getSticker(message.sticker._id).then(function(sticker) {
			console.log('getSticker', sticker);
			map.setCenter(sticker.loc.coordinates, 18, $scope.aperture.state);
			if (map.hasMarker(sticker._id)) {
				map.setMarkerFocus(sticker._id);
			} else {
				addStickerToMap(sticker);
			}
		})
	} else if (message.href) {
		$location.path(message.href);
	}
}

$scope.pinSticker = function() {
	//getStickerLoc//
	var sticker = angular.copy($scope.selected),
		h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
		w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0), 
		left = w/2,
		top = (h-220-40)/2+40;
	leafletData.getMap().then(function(map) {
		var latlng = map.containerPointToLatLng([left, top]);
		sticker.loc = {
			coordinates: [latlng.lng, latlng.lat]
		}
	//end getStickerLoc//
		sticker.time = Date.now();
		sticker.roomID = $scope.world._id;
		sticker.message = $scope.msg.text || sticker.name;
		sticker.avatar = $scope.user.avatar;
		
		stickerManager.postSticker(sticker).then(function(success) {
			addStickerToMap(success)			

			$timeout(function() {
				sendMsgToServer({
				roomID: $scope.world._id,
				userID: $scope.userID,
				nick: $scope.nick,
				avatar: $scope.user.avatar || 'img/icons/profile.png',
				msg: $scope.msg.text || sticker.name,
				sticker: {
					img: sticker.img,
					_id: success._id
				},
				kind: 'sticker'
				});
				$scope.msg.text = "";
			}, 500);

		}, function(error) {
			console.log(error);
			//handle error
		})
	})
	
	$scope.selected = undefined;
	$scope.editing = false;
	aperture.set('off');
}

function getAvatar() {
	return $scope.user.avatar || 'img/icons/profile.png';
}

//add welcome message 
function welcomeMessage() {
	var newChat = {
	    roomID: $scope.world._id,
	    nick: 'BubblyBot',
	    msg: 'Hey there, this is a Bubble chat created just for '+$scope.world.name+'. Chat, share pictures & leave notes with others here!',
	    avatar: $scope.world.avatar || 'img/tidepools/default.png',
	    userID: 'chatbot',
	    _id: 'welcomeMessage'
	};
	$scope.messages.push(newChat);
}

function profileEditMessage() {
	var newChat = {
		roomID: $scope.world._id,
		nick: 'BubblyBot',
		kind: 'editUser',
		msg: 'You are currently using the name '+ $scope.nick + '. Click here to edit it.',
		avatar: $scope.world.avatar || 'img/tidepools/default.png',
		userID: 'chatbot',
		_id: 'profileEditMessage',
		href: 'profile/me/messages'
	}
	$scope.messages.push(newChat);
}

function loadWorld() {
	if ($scope.world.hasOwnProperty('loc') && $scope.world.loc.hasOwnProperty('coordinates')) {
			map.setCenter([$scope.world.loc.coordinates[0], $scope.world.loc.coordinates[1]], 18, $scope.aperture.state);
			console.log('setcenter');
			map.addMarker('c', {
				lat: $scope.world.loc.coordinates[1],
				lng: $scope.world.loc.coordinates[0],
				icon: {
					iconUrl: 'img/marker/bubble-marker-50.png',
					shadowUrl: '',
					iconSize: [35, 67], 
					iconAnchor: [17, 67],
					popupAnchor:[0, -40]
				},
				message:'<a href="#/w/'+$scope.world.id+'/">'+$scope.world.name+'</a>',

			});
		} else {
			console.error('No center found! Error!');
		}
		
		if ($scope.world.style.hasOwnProperty('maps')) {
			if ($scope.world.style.maps.localMapID) {
			map.addOverlay($scope.world.style.maps.localMapID, 
							$scope.world.style.maps.localMapName, 
							$scope.world.style.maps.localMapOptions);
			}
			if ($scope.world.style.maps.hasOwnProperty('localMapOptions')) {
				zoomLevel = $scope.world.style.maps.localMapOptions.maxZoom || 19;
			}
		
			if (tilesDict.hasOwnProperty($scope.world.style.maps.cloudMapName)) {
				map.setBaseLayer(tilesDict[$scope.world.style.maps.cloudMapName]['url']);
			} else if ($scope.world.style.maps.hasOwnProperty('cloudMapID')) {
				map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/'+$scope.world.style.maps.cloudMapID+'/{z}/{x}/{y}.png');
			} else {
				console.warn('No base layer found! Defaulting to forum.');
				map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/interfacefoundry.jh58g2al/{z}/{x}/{y}.png');
			}
		}
}

function loadStickers() {
	console.log('loadStickers');
	stickerManager.getStickers({_id: $scope.world._id}).then(function(stickers) {
		console.log(stickers);
		addStickersToMap(stickers);
	})
}

function addStickersToMap(stickers) {
	stickers.forEach(function(sticker, index, stickers) {
		addStickerToMap(sticker);
	})
}

function addStickerToMap(sticker) {
	mapManager.addMarker(sticker._id, {
		lat: sticker.loc.coordinates[1],
		lng: sticker.loc.coordinates[0],
		icon: {
			iconUrl: sticker.iconInfo.iconUrl,
			shadowUrl: '',
			iconSize: [100, 100], 
			iconAnchor: [50, 100],
			popupAnchor: [0, -80]
		},
		message: '<div class="avatarWrapper"><img class="user-chip-img user-map-img" src="' + getAvatar() + '"/>' + '<strong>' + $scope.nick + '</strong></div>' + '<p class="user-map-text">' + sticker.message + '</p>'
	});
}

////////////////////////////////////////////////////////////
///////////////////LISTENERS&INTERVALS//////////////////////
////////////////////////////////////////////////////////////



var dereg = $rootScope.$on('$locationChangeSuccess', function() {
    $timeout.cancel(checkMessagesTimeout);
    dereg();
});

$scope.$watch('editing', function(newBool, oldBool) {
	if (newBool===true) {
		//editing
		console.log('editing true');
		map.fadeMarkers(true);
	} else if (newBool===false) {
		//not editing
		map.fadeMarkers(false);
	}
})

////////////////////////////////////////////////////////////
//////////////////////EXECUTING/////////////////////////////
////////////////////////////////////////////////////////////

worldTree.getWorld($routeParams.worldURL).then(function(data) {
	$scope.style=data.style;
		style.navBG_color = $scope.style.navBG_color;

	$scope.world=data.world;

	loadWorld();
	welcomeMessage();
	loadStickers();
	checkMessages();
});

userManager.getUser().then(function(user) {
		$scope.user = user;
		$scope.nick = userManager.getDisplayName();	
	}, function(reason) {
	dialogs.showDialog('messageAuthDialog.html');
});


} ]);
app.controller('InstagramListController', ['$scope', '$routeParams', 'styleManager', 'worldTree', 'db', function($scope, $routeParams, styleManager, worldTree, db) {
	worldTree.getWorld($routeParams.worldURL).then(function(data) {
		$scope.world = data.world;
		$scope.style = data.style;
		styleManager.navBG_color = $scope.style.navBG_color; 
		
		$scope.instagrams = db.instagrams.query({limit:30, tag:$scope.world.resources.hashtag}); // make infinite scroll?	
	})
}])

//instagrams is an array of form
// [{"objectID":string,
//	"text":string,
//	"_id": mongoid,
//	"tags": array of strings
//	"local_path": array of 1 string (?)
//	"user": {"name": string,
//			"screen_name": string,
//			"userId": number
//			"userID_str": number
//			"profile_image_url": abs url},
//	"__v": 0


app.directive('scheduleView', function() {
	return {
restrict: 'E',
link: function(scope, element, attrs) {
	
	scope.$watchCollection('schedule', function (newCollection, oldCollection, scope) {
		viewRender(newCollection);
	}) //view rerenders on changes to schedule
	
	var cache;
	
	function viewRender(newCollection) { //baby version of m.module, allows for rerenders outside watch
		if (newCollection) {
			m.render(element[0], scheduleTree(newCollection));	
			cache = newCollection;
		} else if (cache) {
			m.render(element[0], scheduleTree(cache));
		}
	}
	
	//schedule form is
	//{supergroup: [{group: []}, 
	//				{group: []}],
	//	supergroup...}
	
	
	//schedule tree form is
	//supergroup: (collapsed/uncollapsed) (future/today/past)
	//---ul.group (last year/this week/etc)
	//------li.item (landmark)
	
	function scheduleTree(schedule) {
		var scheduleTree = _.map(schedule, superGroupTemplate);
		return scheduleTree;
	} //maps first children of scheduleTree out, each goes through supergrouptemplate
	
	function superGroupTemplate(superGroup) { //template built once for each supergroup
		//{'title': [{group}, {group}]}
		var pair = _.pairs(superGroup)[0],
			title = pair[0],
			groups = pair[1];		
		if (_.isEmpty(groups)) {
			return;
		} else {
			return m('section.bubble-supergroup', 
				{className: toggle[title] ? "closed" : ""}, //toggle logic stored here
				[m('button.bubble-supergroup-label',
				{onclick: toggleSuperGroup.bind(undefined, title)}, //toggle logic
				 title)].concat( //concatenate bc these elements are siblings to the label not children
				_.map(groups, groupTemplate))); //for each group in supergroup, build grouptemplate
		}
	}
	
	var toggle = {'Upcoming': true, 'Places': true, 'Previous': true}; //default toggle states
	
	function toggleSuperGroup(title) {
		toggle[title] = !toggle[title];	
		console.log(toggle, title);
		viewRender(); //rerender on toggle
	}
	
	function groupTemplate(group) { //built for each group in each supergroup
		//{'title': [landmarks...]}
		var pair = _.pairs(group)[0],
			title = pair[0],
			landmarks = pair[1];
		
		return m('div.bubble-group', [
			m('header.bubble-group-label', title),
			m('ul.bubble-list', _.map(landmarks, landmarkTemplate)) //built for each landmark in each group
			]);
	}
	
	function landmarkTemplate(landmark) {
		return m('li.bubble-list-item', 
			m('a.bubble-list-item-link', {href: ifURL('#w/'+scope.world.id+'/'+landmark.id)}, //safe if hrefs for phonegap
				[m('img.bubble-list-item-img', {src: landmark.avatar}), 
				m('span.bubble-list-item-label', [landmark.name, m('small', landmark.category)]), 
				m('footer.bubble-list-item-detail', landmarkDetail(landmark)), 
				m('footer.bubble-list-item-room-info', landmarkRoomDetail(landmark))
			]));
	}
	
	function landmarkDetail(landmark) {
		return [
			m('span', landmark.time.start && ('Starts ' + moment(landmark.time.start).format('ddd, MMM Do, hA'))),
			m('span', landmark.time.end && ('Ends ' + moment(landmark.time.end).format("ddd, MMM Do, hA")))
		]
	}
	
	function landmarkRoomDetail(landmark) {
		if (landmark.loc_info) {
			return [
				m('span', 'Floor: '+landmark.loc_info.floor_num),
				m('span', 'Room: '+landmark.loc_info.room_name)
			]
		} else {
			return []
		}
	}
	
	function ifURL(url) {
		return url;
	}
}
	}
}); 
app.controller('ScheduleController', ['$scope', 'worldTree', '$routeParams', 'styleManager', '$window', '$location', function($scope, worldTree, $routeParams, styleManager, $window, $location) {
	$scope.schedule = [];
	var timeMap = {
		'Upcoming': 0,
		'This Year': 1,
		'Next Month': 2,
		'This Month': 3,
		'Next Week': 4,
		'This Week': 5,
		'Tomorrow': 6,
		'Today': 7,
		'Yesterday': 8,
		'Last Week': 9,
		'Last Month': 10,
		'Last Year': 11,
		'Past': 12,
		'Places': 13
	}
	
	$scope.showCalendar = function() {
		if ($scope.calendarActive) {
			$scope.calendarActive = false;
		} else {
			$scope.calendarActive = true;
			handleWindowResize();
		}
	}
	
	$scope.inspectLandmark = function(calEvent) {
		$location.path('w/'+$scope.world.id+'/'+calEvent.landmark.id)
	}


	$scope.calConfig = {
		height: 360,
		eventClick: $scope.inspectLandmark,
		defaultView: 'agendaWeek'
	}

	var handleWindowResize = _.throttle(function(e) {
		$scope.calConfig.height = windowEl.height()-116;
		if (windowEl.width() < 600) {
			$scope.calConfig.defaultView = 'agendaDay';
		} else {
			$scope.calConfig.defaultView = 'agendaWeek';
		}
	}, 100)

var windowEl = $($window);
windowEl.on('resize', handleWindowResize);
	
	worldTree.getWorld($routeParams.worldURL).then(function(data) {
		$scope.world = data.world;
		$scope.style = data.style;
		styleManager.navBG_color = $scope.style.navBG_color;

		return $scope.world._id;
	}).then(function(_id) {return worldTree.getLandmarks(_id)})
	.then(function(landmarks) {
		$scope.landmarks = landmarks;
		
		setUpCalendar(landmarks);
		setUpSchedule(landmarks);
	});
	
	function setUpCalendar(landmarks) {
		$scope.calendar = {
			events: landmarks.filter(function(landmark) {return landmark.time.start})
						.map(function(landmark) {
							return {
								id: landmark._id,
								title: landmark.name,
								start: moment(landmark.time.start),
								end: moment(landmark.time.end),
								landmark: landmark
							}
						})
		}
		//console.log($scope.calendar.events);
	}
	
	function setUpSchedule(landmarks) {	 //deals with making a tree out of flat landmark array
		var now = moment();
		var schedule = [];
		var superGroups = {
			'Upcoming': {},
			'This Week': {},
			'Today': {},
			'Previous': {},
			'Places': {}
		}
		
		var groupOrderMap = {
			'Upcoming': 0,
			'This Year': 10,
			'Next Month': 20,
			'This Month': 30,
			'Next Week': 40,
			'This Week': 50,
			'6': 55,
			'5': 56,
			'4': 57,
			'3': 58,
			'2': 59,
			'1': 60,
			'Today': 70,
			'Yesterday': 80,
			'Last Week': 90,
			'Last Month': 100,
			'Last Year': 110,
			'Past': 120,
			'Places': 130
		}
		
		 /* [{'Upcoming': []},
						{'Today': []},
						{'Previous': []},
						{'Places': []}];
		/*	schedule = [{'Upcoming': [{'Tomorrow': Bubbles},
									...]
						},
						...] */
		
		_.each(landmarks, function(landmark, index, landmarks) {
			var superGroup = getSuperGroup(landmark);
			var group = getGroup(landmark, superGroup);
			
			if (superGroups[superGroup][group]) {
				superGroups[superGroup][group].push(landmark);
			} else {
				superGroups[superGroup][group] = [landmark];
			}
		});
		
		//current structure {'upcoming': {'group': [],}}
		//first 									^ sort these
		//then							^to array 
		//then 				^to array
		

		_.each(superGroups, function(superGroup, superGroupKey, superGroups) {
			if (superGroupKey!=="Places") {
			_.each(superGroup, function(group, groupKey, superGroup) {
				superGroup[groupKey] = _.sortBy(group, function(landmark) {
					moment(landmark.time.start).unix()
				});
			})
			}
			
			superGroups[superGroupKey] = 
				_.sortBy(
					_.map(superGroup, function(group, groupKey) {
						var temp = {};
						temp[groupKey]=group;
						return temp;
					}), function (group, index, list) {
						var key = _.keys(group)[0];
						return groupOrderMap[key];
				})
		})
		
		console.log('thisweek', superGroups['This Week']);
		
if (superGroups['This Week'].length > 0) {
			superGroups['This Week'] = _.map(superGroups['This Week'], function(group, index, superGroup) {
				var pair = _.pairs(group)[0], //["key", value]
					title = getThisWeekString(pair[0]),
					group = pair[1],
					thisWeek = {};
				thisWeek[title] = group;
				console.log(thisWeek);
				return thisWeek;
			})
		}

				
		$scope.schedule = [
			{'Upcoming': superGroups['Upcoming']},
			{'This Week': superGroups['This Week']},
			{'Today': superGroups['Today']},
			{'Places': superGroups['Places']},
			{'Previous': superGroups['Previous']}
		];
		
		console.log($scope.schedule);
					
		function getSuperGroup(landmark) {
			var t;
			if (!landmark.time.start) {return 'Places'}
			
			t = moment(landmark.time.start);

			if (t.isBefore(now)) {
				return 'Previous';
			} else if (t.isSame(now, 'day')) {
				return 'Today';
			} else if (t.isBefore(moment().add(7, 'days'))) {
				return 'This Week';
			} else {
				return 'Upcoming'
			}
		}
		
		function getGroup(landmark, superGroup) {
			var t;
			switch (superGroup) {
				case 'This Week':
					t = moment(landmark.time.start);
					if (t.isSame(now)) {
						return 0;
					} else if (t.isSame(moment().add(1, 'day'), 'day')) {
						return 1;
					} else if (t.isSame(moment().add(2, 'day'), 'day')) {
						return 2;
					} else if (t.isSame(moment().add(3, 'day'), 'day')) {
						return 3;
					} else if (t.isSame(moment().add(4, 'day'), 'day')) {
						return 4;
					} else if (t.isSame(moment().add(5, 'day'), 'day')) {
						return 5;
					} else if (t.isSame(moment().add(6, 'day'), 'day')) {
						return 6;
					}
					break;
				case 'Today': 
					return 'Today';
					break;
				case 'Upcoming': 
					t = moment(landmark.time.start);
					if (t.isBefore(moment().add(2, 'week'))) {
						return 'Next Week';
					} else if (t.isSame(now, 'month')) {
						return 'This Month';	
					} else if (t.isBefore(moment().add(2, 'month'))) {
						return 'Next Month'; 
					} else if (t.isSame(now, 'year')) {
						return 'This Year';
					} else {
						return 'Upcoming';
					}
					break;
				case 'Previous':
					t = moment(landmark.time.start);
					if (t.isAfter(moment().subtract(2, 'day'))) {
						return 'Yesterday';
					} else if (t.isAfter(moment().subtract(1, 'week'))) {
						return 'Last Week';
					} else if (t.isAfter(moment().subtract(1, 'month'))) {
						return 'Last Month';
					} else if (t.isAfter(moment().subtract(1, 'year'))) {
						return 'Last Year';
					} else {
						return 'Past';
					}	
					break;
				case 'Places':
					return 'Places';
					break;
			}
		}
		
		function getThisWeekString(key) {
			if (key == 1) {
				return 'Tomorrow';
			} else if (key == 2) {
				return moment().add(2, 'day').format('dddd, MMMM Do');
			} else if (key == 3) {
				return moment().add(3, 'day').format('dddd, MMMM Do');
			} else if (key == 4) {
				return moment().add(4, 'day').format('dddd, MMMM Do');
			} else if (key == 5) {
				return moment().add(5, 'day').format('dddd, MMMM Do');
			} else if (key == 6) {
				return moment().add(6, 'day').format('dddd, MMMM Do');
			} 
		}
	}

	
}])
app.filter('httpsify', function() {
	return function(input) {
		input = input || "";
		return input.replace(/^http:\/\//i, 'https://'); 
	}
}) 

app.controller('TwitterListController', ['$scope', '$routeParams', 'styleManager', 'worldTree', 'db', function($scope, $routeParams, styleManager, worldTree, db) {
	worldTree.getWorld($routeParams.worldURL).then(function(data) {
		$scope.world = data.world;
		$scope.style = data.style;
		styleManager.navBG_color = $scope.style.navBG_color; 
		
		$scope.tweets = db.tweets.query({limit:50, tag:$scope.world.resources.hashtag});
	})

//tweets is an array of form
// [{"text": string,
//	"tweetID_str":string,
//	"tweetID": number,
//	"_id": mongoID
//	"created": iso date,
//	"hashtags": array of strings
//	"media": {"media_url": string,
//				"media_type": string}
//	"user": {"profile_image_url": url,
//			"screen_name": string,
//			"name": string}
//	"__v": 0}....]

}])
app.directive('categoryWidget', [function() {
return {
	restrict: 'E',
	link: function(scope, element, attrs) {
		scope.$watchGroup(['world.landmarkCategories', 'selectedCategory'], function (newValues, oldValues) {
			m.render(element[0], categoryWidget(scope.world.landmarkCategories));
		}) //rerenders on category selection
		// kind of a weird way to do it but necessary to allow above scope to handle map stuff 
		
		function categoryWidget(landmarkCategories) {
			return m('.category-widget', 
				groupCategories(landmarkCategories))
		} //groupCategories handles mapping
		
		function groupCategories(landmarkCategories) {
			 //separates landmark categories into button groups in place of mapping
			if (landmarkCategories.length < 4) {
				return buttonGroup(landmarkCategories); //3x1 grid
			} else if (landmarkCategories.length === 4) { //2x2 grid
				return [
					buttonGroup(landmarkCategories.slice(0, 2)),
					buttonGroup(landmarkCategories.slice(2))
				]
			} else { 
				return [ //3x2, 3x3 grid
					buttonGroup(landmarkCategories.slice(0, 3)),
					buttonGroup(landmarkCategories.slice(3))
				]
			}
		}
		
		function buttonGroup(categoryList) { //from a category list, create each button.
			return m('.category-btn-group', categoryList.map(categoryButton));
		}
		
		function categoryButton(category, index, categoryList) { //create category button, needs list length
			return m('.category-btn', {
				style: {width: 100 / categoryList.length + '%'}, 
				colspan: 6/categoryList.length, //table display attribute
				onclick: emitCategory(category.name), //emits selection on scope
				class: scope.selectedCategory === category.name ? 'selected-category' : null //category toggle classes
			}, [
			category.avatar ? m('img.category-btn-img', {src: category.avatar}) : null,
			category.name]);
		}
		
		function emitCategory(landmarkCategoryName) {
			return function (event) {
				event.stopPropagation();
				scope.$emit('landmarkCategoryChange', landmarkCategoryName)	
			}
		}
	}
}
}])
app.controller('WorldController', ['World', 'db', '$routeParams', '$scope', '$location', 'leafletData', '$rootScope', 'apertureService', 'mapManager', 'styleManager', '$sce', 'worldTree', '$q', '$http', 'userManager', 'stickerManager', 'geoService', 'bubbleTypeService', function (World, db, $routeParams, $scope, $location, leafletData, $rootScope, apertureService, mapManager, styleManager, $sce, worldTree, $q, $http, userManager, stickerManager, geoService, bubbleTypeService) {

var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];
zoomControl.style.top = "60px";
zoomControl.style.left = "1%";
zoomControl.style.display = 'none';
var map = mapManager;
	map.resetMap();
var style = styleManager;
$scope.worldURL = $routeParams.worldURL;  
$scope.aperture = apertureService;	
$scope.aperture.set('third');

$scope.world = {};
$scope.landmarks = [];
$scope.lookup = {};

$scope.collectedPresents = [];
	
$scope.selectedIndex = 0;
	
var landmarksLoaded;
  	
$scope.zoomOn = function() {
	  	zoomControl.style.display = "block";
}
 
$scope.loadWorld = function(data) { //this doesn't need to be on the scope
	  	 $scope.world = data.world;
		 $scope.style = data.style;
		 style.navBG_color = $scope.style.navBG_color;

		 //show edit buttons if user is world owner
		 if ($rootScope.userID && $scope.world.permissions){
			 if ($rootScope.userID == $scope.world.permissions.ownerID){
			 	$scope.showEdit = true;
			 }
			 else {
			 	$scope.showEdit = false;
			 }
		 } 

		//console.log($scope.world);
		//console.log($scope.style);
		 
		 if ($scope.world.name) {
			 angular.extend($rootScope, {globalTitle: $scope.world.name});
		 } //TODO: cleanup on $destroy
		 
		//switching between descrip and summary for descrip card
		if ($scope.world.description || $scope.world.summary) {
			$scope.description = true;
			if ($scope.world.description){
				$scope.descriptionType = "description";
			}
			else {
				$scope.descriptionType = "summary";
			}
		}
		
		// set appropriate zoom level based on local maps
		var zoomLevel = 18;

		if ($scope.world.style.hasOwnProperty('maps') && $scope.world.style.maps.hasOwnProperty('localMapOptions')) {
			if ($scope.world.style.maps.localMapArray){
				if ($scope.world.style.maps.localMapArray.length > 0) {
					zoomLevel = mapManager.findZoomLevel($scope.world.style.maps.localMapArray);
				} 
			}
			else {
				zoomLevel = $scope.world.style.maps.localMapOptions.minZoom || 18;
			}

		};

		//map setup
		if ($scope.world.hasOwnProperty('loc') && $scope.world.loc.hasOwnProperty('coordinates')) {
			map.setCenter([$scope.world.loc.coordinates[0], $scope.world.loc.coordinates[1]], zoomLevel, $scope.aperture.state);
			console.log('setcenter');
			map.addMarker('c', {
				lat: $scope.world.loc.coordinates[1],
				lng: $scope.world.loc.coordinates[0],
				icon: {
					iconUrl: 'img/marker/bubble-marker-50.png',
					shadowUrl: '',
					iconSize: [35, 67],
					iconAnchor: [17, 67],
					popupAnchor:[0, -40]
				},
				message:'<a href="#/w/'+$scope.world.id+'/">'+$scope.world.name+'</a>',

			});
		} else {
			console.error('No center found! Error!');
		}


		var worldStyle = $scope.world.style;

		if (worldStyle.hasOwnProperty('maps')) {
			// default local map is localMapID
			var theseMaps = [worldStyle.maps];

			// if localMapArray exists, replace local map with lowest floor from array
			if (worldStyle.maps.localMapArray){
				if (worldStyle.maps.localMapArray.length > 0) {
					theseMaps = map.findMapFromArray(worldStyle.maps.localMapArray);
				}			
			}
			
			theseMaps.forEach(function(thisMap) {
				if (thisMap.localMapID !== undefined && thisMap.localMapID.length > 0) {
					map.addOverlay(thisMap.localMapID, 
								thisMap.localMapName, 
								thisMap.localMapOptions);
				}
				
			})

			if (worldStyle.maps.hasOwnProperty('localMapOptions')) {
				zoomLevel = worldStyle.maps.localMapOptions.maxZoom || 22;
			}

			if (tilesDict.hasOwnProperty(worldStyle.maps.cloudMapName)) {
				map.setBaseLayer(tilesDict[worldStyle.maps.cloudMapName]['url']);
			} else if (worldStyle.maps.hasOwnProperty('cloudMapID')) {
				map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/'+worldStyle.maps.cloudMapID+'/{z}/{x}/{y}.png');
			} else {
				console.warn('No base layer found! Defaulting to forum.');
				map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/interfacefoundry.jh58g2al/{z}/{x}/{y}.png');
			}
		}
		
		$scope.loadLandmarks();
}

  	
function loadWidgets() { //needs to be generalized
	console.log($scope.world);
	if ($scope.style.widgets) {
		if ($scope.style.widgets.twitter == true) {
			$scope.twitter = true;
		}
		if ($scope.style.widgets.instagram == true) {
	  		$scope.instagrams = db.instagrams.query({limit:1, tag:$scope.world.resources.hashtag});
	  		$scope.instagram = true;
		}

		if ($scope.style.widgets.streetview == true) {

			var mapAPI = '&key=AIzaSyDbEMuXZS67cFLAaTtmrKjFNlrdNm1H-KE';
			//var mapAPI = '';

			$scope.streetview = true;

			if($scope.world.source_meetup){
				if($scope.world.source_meetup.venue){
					if($scope.world.source_meetup.venue.address_1){

						var venueArr = [];

						typeof $scope.world.source_meetup.venue.address_1 && venueArr.push($scope.world.source_meetup.venue.address_1);
						typeof $scope.world.source_meetup.venue.address_2 && venueArr.push($scope.world.source_meetup.venue.address_2);
						typeof $scope.world.source_meetup.venue.city && venueArr.push($scope.world.source_meetup.venue.city);
						typeof $scope.world.source_meetup.venue.state && venueArr.push($scope.world.source_meetup.venue.state);
						typeof $scope.world.source_meetup.venue.zip && venueArr.push($scope.world.source_meetup.venue.zip);
						typeof $scope.world.source_meetup.venue.country && venueArr.push($scope.world.source_meetup.venue.country);

						venueArr = venueArr.join("+").replace(/ /g,"+");
						$scope.streetviewLoc = venueArr + mapAPI;
					}
					else{
						coordsURL();
					}
				}
				else{
					coordsURL();
				}
			}
			else if($scope.world.source_yelp){
				if($scope.world.source_yelp.locationInfo){
					if($scope.world.source_yelp.locationInfo){
						if($scope.world.source_yelp.locationInfo.address){

							var venueArr = [];

							typeof $scope.world.source_yelp.locationInfo.address && venueArr.push($scope.world.source_yelp.locationInfo.address);
							typeof $scope.world.source_yelp.locationInfo.city && venueArr.push($scope.world.source_yelp.locationInfo.city);
							typeof $scope.world.source_yelp.locationInfo.state_code && venueArr.push($scope.world.source_yelp.locationInfo.state_code);
							typeof $scope.world.source_yelp.locationInfo.postal_code && venueArr.push($scope.world.source_yelp.locationInfo.postal_code);
							typeof $scope.world.source_yelp.locationInfo.country_code && venueArr.push($scope.world.source_yelp.locationInfo.country_code);

							venueArr = venueArr.join("+").replace(/ /g,"+");
							$scope.streetviewLoc = venueArr + mapAPI;

						}
						else {
							coordsURL();
						}
					}
					else{
						coordsURL();
					}
				}
				else{
					coordsURL();
				}
			}
			else {
				coordsURL();
			}

			function coordsURL(){
				if ($scope.world.loc){
					if ($scope.world.loc.coordinates){
						if ($scope.world.loc.coordinates.length){
							$scope.streetviewLoc = $scope.world.loc.coordinates[1]+','+$scope.world.loc.coordinates[0] + mapAPI;

						}
						
					}
				}
			}

		}
		if ($scope.style.widgets.presents && $scope.world.landmarkCategories) {
			$scope.temp = {
				showInitialPresent: true,
				presentCollected: false,
				presentAlreadyCollected: false,
				presents: true
			}

			$http.get('/api/user/loggedin', {server: true}).success(function(user){
				if (user !== '0'){
					userManager.getUser().then(
						function(response) {

						$scope.user = response;

						//showing collected presents in this world
						if ($scope.user.presents.collected){
							for(var i = 0; i < $scope.user.presents.collected.length; i++) {
							    if ($scope.user.presents.collected[i].worldID == $scope.world._id){
									$scope.collectedPresents.push($scope.user.presents.collected[i].categoryname);
							    }
							}
							checkFinalState();
						}

						//to see if user reached world collect goal for final present
						function checkFinalState(){

							var numPresents = $scope.world.landmarkCategories.filter(function(x){return x.present == true}).length;
							var numCollected = $scope.user.presents.collected.filter(function(x){return x.worldID == $scope.world._id}).length;

							//are # of present user collected in the world == to number of presents available in the world?
							if (numPresents == numCollected){
								console.log('final state!');
								$scope.temp.finalPresent = true;
								$scope.temp.showInitialPresent = false;
								$scope.temp.presentCollected = false;
								$scope.temp.presentAlreadyCollected = false;
							}
							else{
								$scope.presentsLeft = numPresents - numCollected;
								console.log('presents left '+ $scope.presentsLeft);
							}
						}	
					});

				}
				else {
					$scope.temp.signupCollect = true;
				}
			});


		}
		if ($scope.style.widgets.messages==true||$scope.style.widgets.chat==true) {
			$scope.messages = true;

			db.messages.query({limit:1, roomID:$scope.world._id}, function(data){ 
				console.log('db.messages', data);
				if (data.length>0) {
					$scope.msg = data[0];
				}
			});
		}
		
		if ($scope.style.widgets.category) {
			$scope.category = true;
		}
		
		}
		
	   if ($scope.world.resources) {
		$scope.tweets = db.tweets.query({limit:1, tag:$scope.world.resources.hashtag});
	   }

	   if ($scope.style.widgets.nearby == true) {
	      $scope.nearby = true;
	      $scope.loadState = 'loading';

	      worldTree.getNearby().then(function(data){

	      	if(!data){
	      		$scope.loadState = 'failure';
	      	}

	      	if(data['150m'].length > 0 || data['2.5km'].length > 0){

	      		//probably a better way to do this =_=
	      		if (data['150m'].length > 0 && data['2.5km'].length > 0){
					$scope.nearbyBubbles = data['150m'].concat(data['2.5km']);
	      		}
	      		else if (data['150m'].length > 0 && data['2.5km'].length < 0){
	      			$scope.nearbyBubbles = data['150m'];
	      		}
	      		else if (data['150m'].length < 0 && data['2.5km'].length > 0){
	      			$scope.nearbyBubbles = data['2.5km'];
	      		}
	      		else {
	      			$scope.loadState = 'failure';
	      		}

	      		//remove bubble you're inside
	      		for(var i = 0; i < $scope.nearbyBubbles.length; i++) {
				    if($scope.nearbyBubbles[i]._id == $scope.world._id) {
				        $scope.nearbyBubbles.splice(i, 1);
				    }
				}

				//only 3 bubbles
				if ($scope.nearbyBubbles.length > 3){
					$scope.nearbyBubbles.length = 3;
				}
		
	      	}

	      	$scope.loadState = 'success';

	      	
	      });

	      $scope.findRandom = function(){
	      	  $scope.loadState = 'loading';
		      geoService.getLocation().then(function(coords){
		      	  $http.get('/api/find/random', {params: {userCoordinate: [coords.lng,coords.lat], localTime:new Date()}, server:true}).success(function(data){		
						if(data.length > 0){
							if (data[0].id){
								$location.path("/w/"+data[0].id);
							}
						}
						else {
							$scope.loadState = 'success';
						}
		      	  });
		      });
	      }
	     




	   }

	}

$scope.loadLandmarks = function() {
	console.log('--loadLandmarks--');
	//STATE: EXPLORE
	worldTree.getLandmarks($scope.world._id).then(function(data) {
		console.log('landmarks', {landmarks: data});
  		
		initLandmarks({landmarks: data});
		loadWidgets(); //load widget data
	});
}
  	
function initLandmarks(data) {
	var now = moment(); 
	var groups = _.groupBy(data.landmarks, function(landmark) {
		if (landmark.time.start) {
			var startTime = moment(landmark.time.start); 
			var endTime = moment(landmark.time.end) || moment(startTime).add(1, 'hour');
		if (now.isAfter(startTime) && now.isBefore(endTime)) {
			return 'Now';
		} else if (now.isBefore(startTime)) {
			if (now.isSame(startTime, 'day')) {
				return 'Today';
			} else {
				return 'Upcoming';
			}
		} else if (now.isAfter(startTime)) {
			return 'Past';
		}
		} else {
			return 'Places';
		}
	})
	console.log(groups);
	$scope.places = groups['Places'] || [];
	$scope.upcoming = _.compact([].concat(groups['Upcoming'], groups['Today']));
	$scope.past = groups['Past'] || []; 
	$scope.now = groups['Now'] || [];
	$scope.landmarks = data.landmarks || [];
	$scope.today = groups['Today'] || [];
	console.log($scope.upcoming);
		
	if ($scope.now.length > 0) {
		var tempMarkers = [].concat($scope.places, $scope.now);
	} else if ($scope.today.length > 0) {
		var tempMarkers = [].concat($scope.places, $scope.today);
	} else {
		var tempMarkers = [].concat($scope.places);
	}
	//markers should contain now + places, if length of now is 0, 
	// upcoming today + places

	mapManager.addMarkers(tempMarkers.map(markerFromLandmark));
}

function markerFromLandmark(landmark) {

	var landmarkIcon = 'img/marker/bubble-marker-50.png',
			popupAnchorValues = [0, -40],
			shadowUrl = '',
			shadowAnchor = [4, -3],
			iconAnchor = [17, 67],
			iconSize = [35, 67];

	if (bubbleTypeService.get() === 'Retail' && landmark.avatar !== 'img/tidepools/default.jpg') {
		landmarkIcon = landmark.avatar;
		popupAnchorValues = [0, -14];
		// shadowUrl = 'img/marker/blue-pointer.png';
		iconAnchor = [25, 25];
		iconSize = [50, 50]
	}

	return {
		lat:landmark.loc.coordinates[1],
		lng:landmark.loc.coordinates[0],
		draggable:false,
		message: '<a if-href="#w/'+$scope.world.id+'/'+landmark.id+'">'+landmark.name+'</a>',
		icon: {
			iconUrl: landmarkIcon,
			shadowUrl: shadowUrl,
			shadowAnchor: shadowAnchor,
			iconSize: iconSize,
			iconAnchor: iconAnchor,
			popupAnchor: popupAnchorValues
		},
		_id: landmark._id
	}
}


$scope.$on('landmarkCategoryChange', function(event, landmarkCategoryName) {
	var markers = $scope.landmarks.filter(testCategory).map(markerFromLandmark);
	console.log(markers);
	if (markers.length>0) {
		map.setCenterFromMarkers(markers);
		map.setMarkers(markers);
		$scope.aperture.set('full');
		$scope.selectedCategory = landmarkCategoryName;
	} else {
		//handle no landmarks in category
	}
	
	function testCategory (landmark, index, landmarks) {
		return landmark.category === landmarkCategoryName;
	}
})


worldTree.getWorld($routeParams.worldURL).then(function(data) {
	console.log('worldtree success');
	console.log(data);
	$scope.loadWorld(data);
}, function(error) {
	console.log(error);
	//handle this better
});


}]);
