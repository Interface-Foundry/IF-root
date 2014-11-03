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

            // Set width and height if they are defined
            if (isDefined(attrs.width)) {
                if (isNaN(attrs.width)) {
                    element.css('width', attrs.width);
                } else {
                    element.css('width', attrs.width + 'px');
                }
            }
            if (isDefined(attrs.height)) {
                if (isNaN(attrs.height)) {
                    element.css('height', attrs.height);
                } else {
                    element.css('height', attrs.height + 'px');
                }
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
                leafletData.getMap().then(function(map) {
                    map.remove();
                });
                leafletData.unresolveMap(attrs.id);
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

                    geojson.options = {
                        style: geojson.style,
                        filter: geojson.filter,
                        onEachFeature: onEachFeature,
                        pointToLayer: geojson.pointToLayer
                    };

                    leafletGeoJSON = L.geoJson(geojson.data, geojson.options);
                    leafletData.setGeoJSON(leafletGeoJSON, attrs.id);
                    leafletGeoJSON.addTo(map);
                });
            });
        }
    };
}]);

angular.module("leaflet-directive").directive('layers', ["$log", "$q", "leafletData", "leafletHelpers", "leafletLayerHelpers", "leafletControlHelpers", function ($log, $q, leafletData, leafletHelpers, leafletLayerHelpers, leafletControlHelpers) {
    var _leafletLayers;

    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'leaflet',
        controller: function () {
            _leafletLayers = $q.defer();
            this.getLayers = function() {
                return _leafletLayers.promise;
            };
        },
        link: function(scope, element, attrs, controller) {
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
                _leafletLayers.resolve(leafletLayers);
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
                    map.fitBounds(bounds);
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
            return new L.LatLng(latlng.lat, latlng.lng);
        });
    }

    function _convertToLeafletLatLng(latlng) {
        return new L.LatLng(latlng.lat, latlng.lng);
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

angular.module("leaflet-directive").factory('leafletMarkersHelpers', ["$rootScope", "leafletHelpers", "$log", function ($rootScope, leafletHelpers, $log) {

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
            var clearWatch = leafletScope.$watch("markers."+name, function(markerData, oldMarkerData) {
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
            return angular.isDefined(point) && angular.isNumber(point.lat) &&
                   angular.isNumber(point.lng);
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

document.addEventListener('deviceready', onDeviceReady, true);
function onDeviceReady() {
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['IF']);
	});
}
var app = angular.module('IF', ['ngRoute','ngSanitize','ngAnimate','ngTouch', 'ngMessages', 'tidepoolsFilters','tidepoolsServices','leaflet-directive','angularFileUpload', 'IF-directives',  'mgcrea.ngStrap', 'angularSpectrumColorpicker', 'ui.slider', 'monospaced.elastic'])
  .config(function($routeProvider, $locationProvider, $httpProvider, $animateProvider, $tooltipProvider) {
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
	$httpProvider.interceptors.push(function($q, $location) {
    	return {
    		'request': function(request) {
	    		return request;
    		},
	    	'response': function(response) {
		    	//do something on success
		    	return response;
	    	},
	    	'responseError': function(rejection) {
		    	if (rejection.status === 401) {
			    	$location.path('/login');
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
      when('/', {templateUrl: 'components/nearby/nearby.html', controller: 'WorldRouteCtrl'}).
      when('/nearby', {templateUrl: 'components/nearby/nearby.html', controller: 'WorldRouteCtrl'}).
      when('/login', {templateUrl: 'components/user/login.html', controller: 'LoginCtrl'}).
      when('/forgot', {templateUrl: 'components/user/forgot.html', controller: 'ForgotCtrl'}).
      when('/reset/:token', {templateUrl: 'components/user/change-password.html', controller: 'ResetCtrl'}).
      when('/signup', {templateUrl: 'components/user/signup.html', controller: 'SignupCtrl'}).

      when('/auth/:type', {templateUrl: 'components/user/loading.html', controller: 'resolveAuth'}).
      when('/auth/:type/:callback', {templateUrl: 'components/user/loading.html', controller: 'resolveAuth'}).
      
      when('/profile', {redirectTo:'/profile/worlds'}).
      when('/profile/:tab', {templateUrl: 'components/user/user.html', controller: 'UserController', resolve: {loggedin: checkLoggedin}}).
      when('/profile/:tab/:incoming', {templateUrl: 'components/user/user.html', controller: 'UserController', resolve: {loggedin: checkLoggedin}}).
      
      when('/w/:worldURL', {templateUrl: 'components/world/world.html', controller: 'WorldController'}).
      when('/w/:worldURL/upcoming', {templateUrl: 'components/world/upcoming.html', controller: 'WorldController'}).
      when('/w/:worldURL/messages', {templateUrl: 'components/world/messages/messages.html', controller: 'MessagesController'}).
      when('/w/:worldURL/:landmarkURL', {templateUrl: 'components/world/landmark.html', controller: 'LandmarkController'}).
      when('/w/:worldURL/category/:category', {templateUrl: 'components/world/category.html', controller: 'CategoryController'}).

      when('/edit/w/:worldURL/landmarks', {templateUrl: 'components/editor/landmark-editor.html', controller: 'LandmarkEditorController', resolve: {loggedin: checkLoggedin}}).
      
      when('/edit/w/:worldURL/', {templateUrl: 'components/edit/edit_world.html', controller: 'EditController', resolve: {loggedin: checkLoggedin}}).

	  when('/edit/w/:worldURL/:view', {templateUrl: 'components/edit/edit_world.html', controller: 'EditController', resolve: {loggedin: checkLoggedin}}).
	 
	    when('/edit/walkthrough/:_id', {templateUrl: 'components/edit/walkthrough/walkthrough.html', controller: 'WalkthroughController', resolve: {loggedin: checkLoggedin}}).
      
      when('/meetup', {templateUrl: 'components/tour/meetup.html', controller: 'MeetupController'}).
      
      when('/search/:searchQuery', {templateUrl: 'components/search/search.html', controller: 'SearchController'}).
      
      when('/twitter/:hashTag', {templateUrl: 'partials/tweet-list.html', controller: 'TweetlistCtrl'}).
      when('/instagram/:hashTag', {templateUrl: 'partials/insta-list.html', controller: 'InstalistCtrl'}).

      //when('/user/:userID', {templateUrl: 'partials/user-view.html', controller: UserCtrl, resolve: {loggedin: checkLoggedin}}).

      otherwise({redirectTo: '/'});
      
      

	angular.extend($tooltipProvider.defaults, {
  		animation: 'am-fade',
  		placement: 'right',
  		delay: {show: '0', hide: '250'}
  	});

})
.run(function($rootScope, $http, $location, userManager){
	userManager.checkLogin();

});


_ = {};

_.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };


_.now = Date.now || function() {
    return new Date().getTime();
 };
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

angular.module('IF-directives', [])
.directive('fitFont', function($rootScope) {
	return {
		restrict: 'A',
		link: function($scope, $element, attrs) {
			var fontSize = parseInt($element.css('font-size'));
			var domElement = $element[0];
			var ears = []; //listeners
			
			function hasOverflow(e) {
				if (e.offsetHeight < e.scrollHeight || e.offsetWidth < e.scrollWidth) {
					return true;
					} else {
					return false;
				}
			}
			
			function resolveOverflow() {
				while (hasOverflow(domElement) && fontSize > 12) {
					fontSize--;
					$element.css('font-size', fontSize+'px');
				} 
			}
			
			ears.push(
			$scope.$watch( //watch for resizes
				function() {
					return domElement.clientWidth;
				}, 
				function (newWidth, oldWidth) {
					if (newWidth != oldWidth ) {
					if (newWidth < oldWidth) {
							resolveOverflow();
						} else {
							do {
								fontSize++;
								$element.css('font-size', fontSize+'px');
							} while(hasOverflow(domElement)==false);
							resolveOverflow();
						}			
					}
			}))
			
			ears.push(
			$scope.$watch('world.name', function(value) {
				resolveOverflow();
			}))
			
		/*$scope.$on("$destroy", function() {
				for (var i = 0, len = ears.length; i < len; i++) {
					ears[i].pop()();
				}
			});*/
		}
	}
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
.directive('userChip', function($rootScope, userManager, dialogs, $location) {
	return {
		restrict: 'A',
		link: function($scope, $element, attrs) {
		
$element.on('click', function($event) {
	console.log(userManager.loginStatus);
	console.log($event.target.id);
	switch ($event.target.id) {
		case 'logout': 
			userManager.logout();
			$scope.userMenu = false;
			$event.stopPropagation();
			break;
		case 'profile':
			$location.path('#/profile/me');
			$scope.userMenu = false;
			$event.stopPropagation();
			break;
		case 'bubbles':
			$location.path('#/profile/worlds');
			$scope.userMenu = false;
			$event.stopPropagation();
			break;
		default: //click on user chip
			switch (userManager.loginStatus) {
				case true:
					$scope.userMenu = true;
					$scope.$digest();
					$event.stopPropagation();
					break;
				case false:
					console.log('showLogin');
					dialogs.showDialog('authDialog.html')
					break;
			}
			
			angular.element(document).on('click', function() {
				$scope.userMenu = false;
				$scope.$digest();
				angular.element(document).off('click');
			});

	}
})

		},
		templateUrl: 'templates/userChip.html'
	}
		
});
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

//http://107.170.180.141/maps/53c4a0ab0ee5d8ccfa68a034_warped.vrt/{z}/{x}/{y}.png <<< extension for tile server

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

//searching for bubbles
app.controller('WorldRouteCtrl', ['$location', '$scope', '$routeParams', 'db', '$rootScope', 'styleManager', 'mapManager', 
function ($location, $scope, $routeParams, db, $rootScope, styleManager, mapManager) {

var map = mapManager;
// map.resetMap();

angular.extend($rootScope, {loading: true});
var style = styleManager;
style.resetNavBG();
	  
console.log('world routing');
    
$scope.initGeo = function() {

      //--- GEO LOCK -----//

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
		noLoc();
	}
	
	navigator.geolocation.getCurrentPosition(showPosition, locError, {timeout:15000, enableHighAccuracy : true});

} else {
	console.log('no geo');
	alert('Your browser does not support geolocation :(');
}

      //--------------//     
}

//initial loc bubble query
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
		} else {
			console.log('world has no id');
	        noWorlds(lat,lon);
		}
	} else {
		console.log('not inside any worlds');
		noWorlds(lat,lon); //not inside any worlds
	}
});
}

function noWorlds(lat,lon){
	map.setCenter([lon, lat], 18, $scope.aperture.state);
		console.log('no worlds');  
		$scope.showCreateNew = true;
		angular.extend($rootScope, {loading: false});
    }

$scope.addWorld = function (){
  $location.path( '/profile' );
};

}]);

//loads everytime

app.controller('indexIF', ['$location', '$scope', 'db', 'leafletData', '$rootScope', 'apertureService', 'mapManager', 'styleManager', 'alertManager', 'userManager', '$route', '$routeParams', '$location', '$timeout', '$http', '$q', '$sanitize', '$anchorScroll', '$window', 'dialogs', function($location, $scope, db, leafletData, $rootScope, apertureService, mapManager, styleManager, alertManager, userManager, $route, $routeParams, $location, $timeout, $http, $q, $sanitize, $anchorScroll, $window, dialogs) {
	console.log('init controller-indexIF');
    $scope.aperture = apertureService;
    $scope.map = mapManager;
    $scope.style = styleManager;
    $scope.alerts = alertManager;
    $scope.userManager = userManager;
    
    $scope.dialog = dialogs;
    $rootScope.messages = [];
    //$rootScope.loadMeetup = false;
    
    angular.extend($rootScope, {globalTitle: "Bubbl.li"});
    angular.extend($rootScope, {navTitle: "Bubbl.li"})
	angular.extend($rootScope, {loading: false});
	
	/*$scope.$on('$viewContentLoaded', function() {
		document.getElementById("wrap").scrollTop = 0
	});*/
	
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
	
$scope.logout = function() {
      $rootScope.message = 'Logged out.';
      $http.get('/api/user/logout');
      userManager.loginStatus = false;
      $location.url('/');
};
	  
    // /!\ /!\ Change this to call to function in app.js instead /!\ /!\
    //================================================
    // Check if the user is connected
    //================================================
/*
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
      //============== Refresh page to show Login auth =====//
      // Initialize a new promise
      var deferred = $q.defer();
      
	  userManager.getUser().then(function(user) {
		  $scope.loginStatus = true;
		  $scope.user = user;
		  if (user._id){
			  $rootScope.userID = user._id;
		  }
		  $timeout(deferred.resolve, 0);
	  }, function(reason) {
		  console.log(reason);
		  $scope.loginStatus = false;
		  $timeout(function(){deferred.reject();}, 0);
	  });
	  
	  userManager.getDisplayName().then(function(displayName) {
		  $scope.user.displayName = displayName;
	  });

      return deferred.promise;
};
*/
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
    //checkLoggedin($q, $timeout, $http, $location, $rootScope);

    //search query
    $scope.sessionSearch = function() { 
        $scope.landmarks = db.landmarks.query({queryType:"search", queryFilter: $scope.searchText});
    };
    
    
    

}]);


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
                'count': {method:'PUT', params:{_id: 'count'}},                           
                'distinct': {method:'PUT', params:{_id: 'distinct'}},      
                'find': {method:'PUT', params:{_id: 'find'}, isArray:true},              
                'group': {method:'PUT', params:{_id: 'group'}, isArray:true},            
                'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true},  
                'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true},
                'del': {method:'DELETE', params:{_id: 'del'}, isArray:false}
            }
            res = $resource('/api/landmarks/:_id:id', {}, actions);
            return res;
        }
    ])

    .factory('World', ['$resource', '$http', 'leafletData', 
        function($resource, $http, leafletData) {
            var actions = {
                'count': {method:'PUT', params:{_id: 'count'}},                           
                'distinct': {method:'PUT', params:{_id: 'distinct'}},      
                'find': {method:'PUT', params:{_id: 'find'}, isArray:true},              
                'group': {method:'PUT', params:{_id: 'group'}, isArray:true},            
                'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true},  
                'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true},
                'del': {method:'DELETE', params:{_id: 'del'}, isArray:true}
            }
            res = $resource('/api/worlds/:_id:id', {}, actions);
            return res;
        }
    ])
    .factory('db', ['$resource', '$http',    
        function($resource, $http) {
    		var actions = {
                    'count': {method:'PUT', params:{_id: 'count'}},                           
                    'distinct': {method:'PUT', params:{_id: 'distinct'}},      
                    'find': {method:'PUT', params:{_id: 'find'}, isArray:true},              
                    'group': {method:'PUT', params:{_id: 'group'}, isArray:true},            
                    'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true},  
                    'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true},
                    'create':  {method:'POST', params:{_id: 'create'}, isArray:true},
                    'locsearch':  {method:'GET', params:{_id: 'locsearch'}, isArray:true}
                }
            var db = {};
            db.worlds = $resource('/api/worlds/:_id', {}, actions);
            db.landmarks = $resource('api/landmarks/:_id:id', {}, actions);
            db.styles = $resource('api/styles/:_id', {}, actions);
            db.projects = $resource('api/projects/:_id', {}, actions);
            db.tweets = $resource('api/tweets/:_id', {}, actions);
            db.instagrams = $resource('api/instagrams/:_id', {}, actions);
            db.messages = $resource('api/worldchat/:_id', {}, actions);
            db.visit = $resource('api/visit/:_id', {}, actions);
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
						aperture.off = true;
						aperture.state = 'aperture-off';
						aperture.navfix = 'navfix';
						map.apertureUpdate('aperture-off');
						break;
					case 'third': 
						aperture.off = false;
						aperture.state = 'aperture-third';
						aperture.navfix = '';
						map.apertureUpdate('aperture-third');
						break;
					case 'half':
						aperture.off = false;
						aperture.state = 'aperture-half';
						aperture.navfix = '';
						map.apertureUpdate('aperture-half');
						break;
					case 'full':
						aperture.off = false;
						aperture.state = 'aperture-full';
						aperture.navfix = '';
						map.apertureUpdate('aperture-full');
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
   .factory('alertManager', ['$timeout', function ($timeout) {
   		var alerts = {
   			'list':[]
   		};

   		alerts.addAlert = function(alertType, alertMsg, timeout) {
   			alerts.list = []; //clear alerts automatically for now to show onerror
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
   			var len = alerts.list.push({class: alertClass, msg: alertMsg});
   			if (timeout) {
   			$timeout(function () {
	   			alerts.list.splice(len-1, 1);
   			}, 1500);
   			
   			}
   		}

   		alerts.closeAlert = function(index) {
   			alerts.list.splice(index, 1);
   		}

   		return alerts;
   }])

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
angular.module('tidepoolsServices')
	.factory('dialogs', ['$rootScope', '$compile', 
function($rootScope, $compile) {
var dialogs = {
	dialogTemplate: null
}

dialogs.showDialog = function(name) {
	dialogs.template = "templates/"+name;
	dialogs.show = true;
}

dialogs.close = function($event) {
	console.log($event);
	if($event.target.className.indexOf('dialog-bg')>-1){ 
		dialogs.show = false;
	}
}

return dialogs;
}]);
'use strict';

angular.module('tidepoolsServices')
	.factory('ifGlobals', [
	
function() {
var ifGlobals = {
	kinds: {
		Convention: {name: 'Convention', hasTime: true, img: 'convention.png'},
		Event: {name: 'Event', hasTime: true, img: 'event.png'},
		Neighborhood: {name: 'Neighborhood', hasTime: false, img: 'neighborhood.png'},
		Venue: {name: 'Venue', hasTime: false, img: 'venue.png'},
		Park: {name: 'Park', hasTime: false, img: 'park.png'},
		Retail: {name: 'Retail', hasTime: false, img: 'retail.png'},
		Campus: {name: 'Campus', hasTime: false, img: 'campus.png'},
		Home: {name: 'Home', hasTime: false, img: 'home.png'},
		Other: {name: 'Other', hasTime: false, img: 'other.png'}
	}
}

return ifGlobals;
}]);
'use strict';

angular.module('tidepoolsServices')
    .factory('mapManager', ['leafletData', '$rootScope', 
    	function(leafletData, $rootScope) {
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
			name: "Sunset",
			url: 'https://{s}.tiles.mapbox.com/v3/interfacefoundry.ig6f6j6e/{z}/{x}/{y}.png',
			type: 'xyz',
			top: true,
			maxZoom: 25
			}
		},
		overlays: {}
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
	console.log('--setCenter--');
	mapManager._actualCenter = latlng;
	mapManager._z = z;
	
	switch (state) {
		case 'aperture-half':
			mapManager.setCenterWithAperture(latlng, z, 0, .5)
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
	console.log('setCenterWithAperture');
	var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
		w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
		targetPt, targetLatLng;
		
	leafletData.getMap().then(function(map) {
			targetPt = map.project([latlng[1], latlng[0]], z).add([w*xpart,h*ypart]);
			console.log(targetPt);
			targetLatLng = map.unproject(targetPt, z);
			console.log(targetLatLng);
			angular.extend(mapManager.center, {lat: targetLatLng.lat, lng: targetLatLng.lng, zoom: z});
			console.log(mapManager.center);
			mapManager.refresh();
	});
}

mapManager.apertureUpdate = function(state) {
	if (mapManager._actualCenter && mapManager._z) {
		mapManager.setCenter(mapManager._actualCenter, mapManager._z, state);
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

mapManager.setBaseLayer = function(layerURL) {
	console.log('new base layer');
	mapManager.layers.baselayers = {};
	mapManager.layers.baselayers[layerURL] = {
		name: 'newBaseMap',
		url: layerURL,
		type: 'xyz',
		layerParams: {},
		layerOptions: {
			minZoom: 1,
			maxZoom: 19
		}
	};	
}

mapManager.setBaseLayerFromID = function(ID) {
	mapManager.setBaseLayer(
	'https://{s}.tiles.mapbox.com/v3/'+
	ID+
	'/{z}/{x}/{y}.png');
}

mapManager.addOverlay = function(localMapID, localMapName, localMapOptions) {
	console.log('addOverlay');
	var newOverlay = {};
	if (localMapOptions.maxZoom>19) {
		localMapOptions.maxZoom = 19;
	}
	localMapOptions.zIndex = 10;
	mapManager.layers.overlays[localMapName] = {
		name: localMapName,
		type: 'xyz',
		url: 'http://107.170.180.141/maps/'+localMapID+'/{z}/{x}/{y}.png',
		layerOptions: localMapOptions,
		visible: true,
		opacity: 0.8,
	};/*
	

	mapManager.layers.overlays = newOverlay;
*/
	console.log(mapManager);
	console.log(newOverlay);
};

mapManager.removeOverlays = function() {
	mapManager.layers.overlays = {};
	mapManager.refresh();
}


mapManager.addCircleMaskToMarker = function(key, radius, state) {
	console.log('addCircleMaskToMarker');
	mapManager.circleMaskLayer = new L.IFCircleMask(mapManager.markers[key], 150, state);
	leafletData.getMap().then(function(map) {
	map.addLayer(mapManager.circleMaskLayer);
	$rootScope.$on('leafletDirectiveMarker.dragend', function(event) {
		mapManager.circleMaskLayer._draw();
	});
	});
}

mapManager.setCircleMaskState = function(state) {
	if (mapManager.circleMaskLayer) {
		mapManager.circleMaskLayer._setState(state);
	} else {
		console.log('no circleMaskLayer');
	}
}

mapManager.removeCircleMask = function() {
	if (mapManager.circleMaskLayer) {
		leafletData.getMap().then(function(map) {
			map.removeLayer(mapManager.circleMaskLayer);
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


return mapManager;
    }]);
'use strict';

angular.module('tidepoolsServices')

	.factory('styleManager', [
		function() {
var styleManager = {
	navBG_color: 'rgba(92,107,191,0.96)' 
	//---local settings---
	/*bodyBG_color: '#FFF',
	titleBG_color,
	//text settings
	title_color,
	worldTitle_color,
	landmarkTitle_color		*/
}

styleManager.resetNavBG = function() {
	styleManager.navBG_color = 'rgba(0,188,212,0.96)';
}

return styleManager;
		}
	]);
angular.module('tidepoolsServices')
    .factory('userManager', ['$rootScope', '$http', '$resource', '$q', '$location',
    	function($rootScope, $http, $resource, $q, $location) {
    	
var userManager = {
	userRes: $resource('/api/updateuser', {}),
	loginStatus: false,
	login: {}
}


userManager.getUser = function() {
	var deferred = $q.defer();
	console.log('user', userManager._user);
	var user = userManager._user;
	if (user) {
		deferred.resolve(user);
	} else {
		$http.get('http://localhost:2997/api/user/loggedin').
		success(function(user){
			if (user!=='0') {
				$rootScope.user = user; 
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

userManager.saveUser = function(user) {
	userManager.userRes.save(user, function() {
		console.log('saveUser() succeeded');
	});
}

userManager.getDisplayName = function() {
	var deferred = $q.defer();
	
	var displayName = userManager._displayName;
	if (displayName) {
		deferred.resolve(displayName);
	} else {
		userManager.getUser().then(function(user) {
			if (user.name) {displayName = user.name}
			else if (user.facebook && user.facebook.name) {displayName = user.facebook.name}
			else if (user.twitter && user.twitter.displayName) {displayName = user.twitter.displayName} 
			else if (user.meetup && user.meetup.displayName) {displayName = user.meetup.displayName}
			else if (user.local && user.local.email) {displayName = user.local.email.substring(0, user.local.email.indexOf("@"))}
			else { displayName = "Me"; console.log("how did this happen???");}
			
			displayName = displayName.substring(0, displayName.indexOf(" "));
			
			userManager._displayName = displayName;
			deferred.resolve(displayName);
		}, function(reason) {
			deferred.reject(reason);
		});
	}
	
	return deferred.promise;
}

userManager.checkLogin = function(){
      var deferred = $q.defer();
	  userManager.getUser().then(function(user) {
	  	console.log('getting user');
		  userManager.loginStatus = true;
		  $rootScope.user = user;
		  if (user._id){
			  $rootScope.userID = user._id;
			  userManager._user = user;
		  }
		  deferred.resolve(0);
		  //$rootScope.$digest();
	  }, function(reason) {
		  console.log(reason);
		  userManager.loginStatus = false;
		  deferred.reject(0);
		  //$rootScope.$digest();
	  });
	  
	  userManager.getDisplayName().then(function(displayName) {
		  $rootScope.user.displayName = displayName;
	  });
	  
      return deferred.promise;
};

userManager.logout = function() {
	$http.get('http://localhost:2997/api/user/logout');
	userManager.loginStatus = false;
	$location.path('/');
}

userManager.login.login = function() {
	console.log('login');
    var data = {
      email: userManager.login.email,
      password: userManager.login.password
    }
    
	$http.post('http://localhost:2997/api/user/login', data).
	success(function(user){
		if (user) {
			userManager.checkLogin();
		}
	}).
	error(function(err){
		if (err){
			$scope.alerts.addAlert('danger',err);
		}
	});
}

userManager.signup = function() {
	
}


return userManager;
}]);
angular.module('tidepoolsServices')
	.factory('worldTree', ['$cacheFactory', '$q', 'World', 'db',
	function($cacheFactory, $q, World, db) {

var worldTree = {
	worldCache: $cacheFactory('worlds'),
	styleCache: $cacheFactory('styles'),
	landmarkCache: $cacheFactory('landmarks')
}

worldTree.getWorld = function(id) { //returns a promise with a world and corresponding style object
	var deferred = $q.defer();
	
	var world = worldTree.worldCache.get(id);
	if (world && world.style) {
		var style = worldTree.styleCache.get(world.style.styleID);
			if (style) {
				deferred.resolve({world: world, style: style});
				console.log('world & style in cache!');
			} else {
				askServer();
			}
	} else {
		askServer();
	}
		
	function askServer() {
		World.get({id: id}, function(data) {
			if (data.err) {
				deferred.reject(data.err);
	 		} else {
	 			worldTree.worldCache.put(data.world.id, data.world);
	 			worldTree.styleCache.put(data.style._id, data.style);
		 		deferred.resolve(data);
		 	}
		 });
	}
	
	return deferred.promise;
}

worldTree.getLandmarks = function(_id) { //takes world's _id
	var deferred = $q.defer();
	
	var landmarks = worldTree.landmarkCache.get(_id);
	if (landmarks) {
		deferred.resolve(landmarks);
		console.log('landmarks in cache!');
	} else {
		db.landmarks.query({queryFilter:'all', parentID: _id}, function(data) {
			if (data.err) {
				deferred.reject(data.err);
			} else {
				worldTree.landmarkCache.put(_id, data);
				deferred.resolve(data);
			}
		});
	}
	
	return deferred.promise;
}

return worldTree;
}
]);
(function() {
  var Evented, MIRROR_ATTACH, addClass, allDrops, clickEvents, createContext, end, extend, hasClass, name, removeClass, removeFromArray, sortAttach, tempEl, touchDevice, transitionEndEvent, transitionEndEvents, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = Tether.Utils, extend = _ref.extend, addClass = _ref.addClass, removeClass = _ref.removeClass, hasClass = _ref.hasClass, Evented = _ref.Evented;

  touchDevice = 'ontouchstart' in document.documentElement;

  clickEvents = ['click'];

  if (touchDevice) {
    clickEvents.push('touchstart');
  }

  transitionEndEvents = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'otransitionend',
    'transition': 'transitionend'
  };

  transitionEndEvent = '';

  for (name in transitionEndEvents) {
    end = transitionEndEvents[name];
    tempEl = document.createElement('p');
    if (tempEl.style[name] !== void 0) {
      transitionEndEvent = end;
    }
  }

  sortAttach = function(str) {
    var first, second, _ref1, _ref2;
    _ref1 = str.split(' '), first = _ref1[0], second = _ref1[1];
    if (first === 'left' || first === 'right') {
      _ref2 = [second, first], first = _ref2[0], second = _ref2[1];
    }
    return [first, second].join(' ');
  };

  MIRROR_ATTACH = {
    left: 'right',
    right: 'left',
    top: 'bottom',
    bottom: 'top',
    middle: 'middle',
    center: 'center'
  };

  allDrops = {};

  removeFromArray = function(arr, item) {
    var index, _results;
    _results = [];
    while ((index = arr.indexOf(item)) !== -1) {
      _results.push(arr.splice(index, 1));
    }
    return _results;
  };

  createContext = function(options) {
    var DropInstance, defaultOptions, drop, _name;
    if (options == null) {
      options = {};
    }
    drop = function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(DropInstance, arguments, function(){});
    };
    extend(drop, {
      createContext: createContext,
      drops: [],
      defaults: {}
    });
    defaultOptions = {
      classPrefix: 'drop',
      defaults: {
        position: 'bottom left',
        openOn: 'click',
        constrainToScrollParent: true,
        constrainToWindow: true,
        classes: '',
        remove: false,
        tetherOptions: {}
      }
    };
    extend(drop, defaultOptions, options);
    extend(drop.defaults, defaultOptions.defaults, options.defaults);
    if (allDrops[_name = drop.classPrefix] == null) {
      allDrops[_name] = [];
    }
    drop.updateBodyClasses = function() {
      var anyOpen, _drop, _i, _len, _ref1;
      anyOpen = false;
      _ref1 = allDrops[drop.classPrefix];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        _drop = _ref1[_i];
        if (!(_drop.isOpened())) {
          continue;
        }
        anyOpen = true;
        break;
      }
      if (anyOpen) {
        return addClass(document.body, "" + drop.classPrefix + "-open");
      } else {
        return removeClass(document.body, "" + drop.classPrefix + "-open");
      }
    };
    DropInstance = (function(_super) {
      __extends(DropInstance, _super);

      function DropInstance(options) {
        this.options = options;
        this.options = extend({}, drop.defaults, this.options);
        this.target = this.options.target;
        if (this.target == null) {
          throw new Error('Drop Error: You must provide a target.');
        }
        if (this.options.classes) {
          addClass(this.target, this.options.classes);
        }
        drop.drops.push(this);
        allDrops[drop.classPrefix].push(this);
        this._boundEvents = [];
        this.setupElements();
        this.setupEvents();
        this.setupTether();
      }

      DropInstance.prototype._on = function(element, event, handler) {
        this._boundEvents.push({
          element: element,
          event: event,
          handler: handler
        });
        return element.addEventListener(event, handler);
      };

      DropInstance.prototype.setupElements = function() {
        this.drop = document.createElement('div');
        addClass(this.drop, drop.classPrefix);
        if (this.options.classes) {
          addClass(this.drop, this.options.classes);
        }
        this.content = document.createElement('div');
        addClass(this.content, "" + drop.classPrefix + "-content");
        if (typeof this.options.content === 'object') {
          this.content.appendChild(this.options.content);
        } else {
          this.content.innerHTML = this.options.content;
        }
        return this.drop.appendChild(this.content);
      };

      DropInstance.prototype.setupTether = function() {
        var constraints, dropAttach;
        dropAttach = this.options.position.split(' ');
        dropAttach[0] = MIRROR_ATTACH[dropAttach[0]];
        dropAttach = dropAttach.join(' ');
        constraints = [];
        if (this.options.constrainToScrollParent) {
          constraints.push({
            to: 'scrollParent',
            pin: 'top, bottom',
            attachment: 'together none'
          });
        } else {
          constraints.push({
            to: 'scrollParent'
          });
        }
        if (this.options.constrainToWindow !== false) {
          constraints.push({
            to: 'window',
            attachment: 'together'
          });
        } else {
          constraints.push({
            to: 'window'
          });
        }
        options = {
          element: this.drop,
          target: this.target,
          attachment: sortAttach(dropAttach),
          targetAttachment: sortAttach(this.options.position),
          classPrefix: drop.classPrefix,
          offset: '0 0',
          targetOffset: '0 0',
          enabled: false,
          constraints: constraints
        };
        if (this.options.tetherOptions !== false) {
          return this.tether = new Tether(extend({}, options, this.options.tetherOptions));
        }
      };

      DropInstance.prototype.setupEvents = function() {
        var clickEvent, closeHandler, events, onUs, openHandler, out, outTimeout, over, _i, _len,
          _this = this;
        if (!this.options.openOn) {
          return;
        }
        if (this.options.openOn === 'always') {
          setTimeout(this.open.bind(this));
          return;
        }
        events = this.options.openOn.split(' ');
        if (__indexOf.call(events, 'click') >= 0) {
          openHandler = function(event) {
            _this.toggle();
            return event.preventDefault();
          };
          closeHandler = function(event) {
            if (!_this.isOpened()) {
              return;
            }
            if (event.target === _this.drop || _this.drop.contains(event.target)) {
              return;
            }
            if (event.target === _this.target || _this.target.contains(event.target)) {
              return;
            }
            return _this.close();
          };
          for (_i = 0, _len = clickEvents.length; _i < _len; _i++) {
            clickEvent = clickEvents[_i];
            this._on(this.target, clickEvent, openHandler);
            this._on(document, clickEvent, closeHandler);
          }
        }
        if (__indexOf.call(events, 'hover') >= 0) {
          onUs = false;
          over = function() {
            onUs = true;
            return _this.open();
          };
          outTimeout = null;
          out = function() {
            onUs = false;
            if (outTimeout != null) {
              clearTimeout(outTimeout);
            }
            return outTimeout = setTimeout(function() {
              if (!onUs) {
                _this.close();
              }
              return outTimeout = null;
            }, 50);
          };
          this._on(this.target, 'mouseover', over);
          this._on(this.drop, 'mouseover', over);
          this._on(this.target, 'mouseout', out);
          return this._on(this.drop, 'mouseout', out);
        }
      };

      DropInstance.prototype.isOpened = function() {
        return hasClass(this.drop, "" + drop.classPrefix + "-open");
      };

      DropInstance.prototype.toggle = function() {
        if (this.isOpened()) {
          return this.close();
        } else {
          return this.open();
        }
      };

      DropInstance.prototype.open = function() {
        var _ref1, _ref2,
          _this = this;
        if (this.isOpened()) {
          return;
        }
        if (!this.drop.parentNode) {
          document.body.appendChild(this.drop);
        }
        if ((_ref1 = this.tether) != null) {
          _ref1.enable();
        }
        addClass(this.drop, "" + drop.classPrefix + "-open");
        addClass(this.drop, "" + drop.classPrefix + "-open-transitionend");
        setTimeout(function() {
          return addClass(_this.drop, "" + drop.classPrefix + "-after-open");
        });
        if ((_ref2 = this.tether) != null) {
          _ref2.position();
        }
        this.trigger('open');
        return drop.updateBodyClasses();
      };

      DropInstance.prototype.close = function() {
        var handler, _ref1,
          _this = this;
        if (!this.isOpened()) {
          return;
        }
        removeClass(this.drop, "" + drop.classPrefix + "-open");
        removeClass(this.drop, "" + drop.classPrefix + "-after-open");
        this.drop.addEventListener(transitionEndEvent, handler = function() {
          if (!hasClass(_this.drop, "" + drop.classPrefix + "-open")) {
            removeClass(_this.drop, "" + drop.classPrefix + "-open-transitionend");
          }
          return _this.drop.removeEventListener(transitionEndEvent, handler);
        });
        this.trigger('close');
        if ((_ref1 = this.tether) != null) {
          _ref1.disable();
        }
        drop.updateBodyClasses();
        if (this.options.remove) {
          return this.remove();
        }
      };

      DropInstance.prototype.remove = function() {
        var _ref1;
        this.close();
        return (_ref1 = this.drop.parentNode) != null ? _ref1.removeChild(this.drop) : void 0;
      };

      DropInstance.prototype.position = function() {
        var _ref1;
        if (this.isOpened()) {
          return (_ref1 = this.tether) != null ? _ref1.position() : void 0;
        }
      };

      DropInstance.prototype.destroy = function() {
        var element, event, handler, _i, _len, _ref1, _ref2, _ref3;
        this.remove();
        if ((_ref1 = this.tether) != null) {
          _ref1.destroy();
        }
        _ref2 = this._boundEvents;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          _ref3 = _ref2[_i], element = _ref3.element, event = _ref3.event, handler = _ref3.handler;
          element.removeEventListener(event, handler);
        }
        this._boundEvents = [];
        this.tether = null;
        this.drop = null;
        this.content = null;
        this.target = null;
        removeFromArray(allDrops[drop.classPrefix], this);
        return removeFromArray(drop.drops, this);
      };

      return DropInstance;

    })(Evented);
    return drop;
  };

  window.Drop = createContext();

  document.addEventListener('DOMContentLoaded', function() {
    return Drop.updateBodyClasses();
  });

}).call(this);

(function() {
  var DOWN, ENTER, ESCAPE, Evented, SPACE, Select, UP, addClass, clickEvent, extend, getBounds, getFocusedSelect, hasClass, isRepeatedChar, lastCharacter, removeClass, searchText, searchTextTimeout, touchDevice, useNative, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = Tether.Utils, extend = _ref.extend, addClass = _ref.addClass, removeClass = _ref.removeClass, hasClass = _ref.hasClass, getBounds = _ref.getBounds, Evented = _ref.Evented;

  ENTER = 13;

  ESCAPE = 27;

  SPACE = 32;

  UP = 38;

  DOWN = 40;

  touchDevice = 'ontouchstart' in document.documentElement;

  clickEvent = touchDevice ? 'touchstart' : 'click';

  useNative = function() {
    return touchDevice && (innerWidth <= 640 || innerHeight <= 640);
  };

  isRepeatedChar = function(str) {
    return Array.prototype.reduce.call(str, function(a, b) {
      if (a === b) {
        return b;
      } else {
        return false;
      }
    });
  };

  getFocusedSelect = function() {
    var _ref1;
    return (_ref1 = document.querySelector('.select-target-focused')) != null ? _ref1.selectInstance : void 0;
  };

  searchText = '';

  searchTextTimeout = void 0;

  lastCharacter = void 0;

  document.addEventListener('keypress', function(e) {
    var options, repeatedOptions, select, selected;
    if (!(select = getFocusedSelect())) {
      return;
    }
    if (e.charCode === 0) {
      return;
    }
    if (e.keyCode === SPACE) {
      e.preventDefault();
    }
    clearTimeout(searchTextTimeout);
    searchTextTimeout = setTimeout(function() {
      return searchText = '';
    }, 500);
    searchText += String.fromCharCode(e.charCode);
    options = select.findOptionsByPrefix(searchText);
    if (options.length === 1) {
      select.selectOption(options[0]);
      return;
    }
    if (searchText.length > 1 && isRepeatedChar(searchText)) {
      repeatedOptions = select.findOptionsByPrefix(searchText[0]);
      if (repeatedOptions.length) {
        selected = repeatedOptions.indexOf(select.getChosen());
        selected += 1;
        selected = selected % repeatedOptions.length;
        select.selectOption(repeatedOptions[selected]);
        return;
      }
    }
    if (options.length) {
      select.selectOption(options[0]);
    }
  });

  document.addEventListener('keydown', function(e) {
    var select, _ref1, _ref2;
    if (!(select = getFocusedSelect())) {
      return;
    }
    if ((_ref1 = e.keyCode) === UP || _ref1 === DOWN || _ref1 === ESCAPE) {
      e.preventDefault();
    }
    if (select.isOpen()) {
      switch (e.keyCode) {
        case UP:
        case DOWN:
          return select.moveHighlight(e.keyCode);
        case ENTER:
          return select.selectHighlightedOption();
        case ESCAPE:
          select.close();
          return select.target.focus();
      }
    } else {
      if ((_ref2 = e.keyCode) === UP || _ref2 === DOWN || _ref2 === SPACE) {
        return select.open();
      }
    }
  });

  Select = (function(_super) {
    __extends(Select, _super);

    Select.defaults = {
      alignToHighlighed: 'auto',
      className: 'select-theme-default'
    };

    function Select(options) {
      this.options = options;
      this.update = __bind(this.update, this);
      this.options = extend({}, Select.defaults, this.options);
      this.select = this.options.el;
      if (this.select.selectInstance != null) {
        throw new Error("This element has already been turned into a Select");
      }
      this.setupTarget();
      this.renderTarget();
      this.setupDrop();
      this.renderDrop();
      this.setupSelect();
      this.setupTether();
      this.bindClick();
      this.bindMutationEvents();
      this.value = this.select.value;
    }

    Select.prototype.useNative = function() {
      return this.options.useNative === true || (useNative() && this.options.useNative !== false);
    };

    Select.prototype.setupTarget = function() {
      var tabIndex,
        _this = this;
      this.target = document.createElement('a');
      this.target.href = 'javascript:;';
      addClass(this.target, 'select-target');
      tabIndex = this.select.getAttribute('tabindex') || 0;
      this.target.setAttribute('tabindex', tabIndex);
      if (this.options.className) {
        addClass(this.target, this.options.className);
      }
      this.target.selectInstance = this;
      this.target.addEventListener('click', function() {
        if (!_this.isOpen()) {
          return _this.target.focus();
        } else {
          return _this.target.blur();
        }
      });
      this.target.addEventListener('focus', function() {
        return addClass(_this.target, 'select-target-focused');
      });
      this.target.addEventListener('blur', function(e) {
        if (_this.isOpen()) {
          if (e.relatedTarget && !_this.drop.contains(e.relatedTarget)) {
            _this.close();
          }
        }
        return removeClass(_this.target, 'select-target-focused');
      });
      return this.select.parentNode.insertBefore(this.target, this.select.nextSibling);
    };

    Select.prototype.setupDrop = function() {
      var _this = this;
      this.drop = document.createElement('div');
      addClass(this.drop, 'select');
      if (this.options.className) {
        addClass(this.drop, this.options.className);
      }
      document.body.appendChild(this.drop);
      this.drop.addEventListener('click', function(e) {
        if (hasClass(e.target, 'select-option')) {
          return _this.pickOption(e.target);
        }
      });
      this.drop.addEventListener('mousemove', function(e) {
        if (hasClass(e.target, 'select-option')) {
          return _this.highlightOption(e.target);
        }
      });
      this.content = document.createElement('div');
      addClass(this.content, 'select-content');
      return this.drop.appendChild(this.content);
    };

    Select.prototype.open = function() {
      var positionSelectStyle, selectedOption,
        _this = this;
      addClass(this.target, 'select-open');
      if (this.useNative()) {
        this.select.style.display = 'block';
        setTimeout(function() {
          var event;
          event = document.createEvent("MouseEvents");
          event.initEvent("mousedown", true, true);
          return _this.select.dispatchEvent(event);
        });
        return;
      }
      addClass(this.drop, 'select-open');
      setTimeout(function() {
        return _this.tether.enable();
      });
      selectedOption = this.drop.querySelector('.select-option-selected');
      if (!selectedOption) {
        return;
      }
      this.highlightOption(selectedOption);
      this.scrollDropContentToOption(selectedOption);
      positionSelectStyle = function() {
        var dropBounds, offset, optionBounds;
        if (hasClass(_this.drop, 'tether-abutted-left') || hasClass(_this.drop, 'tether-abutted-bottom')) {
          dropBounds = getBounds(_this.drop);
          optionBounds = getBounds(selectedOption);
          offset = dropBounds.top - (optionBounds.top + optionBounds.height);
          return _this.drop.style.top = (parseFloat(_this.drop.style.top) || 0) + offset + 'px';
        }
      };
      if (this.options.alignToHighlighted === 'always' || (this.options.alignToHighlighted === 'auto' && this.content.scrollHeight <= this.content.clientHeight)) {
        setTimeout(positionSelectStyle);
      }
      return this.trigger('open');
    };

    Select.prototype.close = function() {
      removeClass(this.target, 'select-open');
      if (this.useNative()) {
        this.select.style.display = 'none';
        return;
      }
      this.tether.disable();
      removeClass(this.drop, 'select-open');
      return this.trigger('close');
    };

    Select.prototype.toggle = function() {
      if (this.isOpen()) {
        return this.close();
      } else {
        return this.open();
      }
    };

    Select.prototype.isOpen = function() {
      return hasClass(this.drop, 'select-open');
    };

    Select.prototype.bindClick = function() {
      var _this = this;
      this.target.addEventListener(clickEvent, function(e) {
        e.preventDefault();
        return _this.toggle();
      });
      return document.addEventListener(clickEvent, function(event) {
        if (!_this.isOpen()) {
          return;
        }
        if (event.target === _this.drop || _this.drop.contains(event.target)) {
          return;
        }
        if (event.target === _this.target || _this.target.contains(event.target)) {
          return;
        }
        return _this.close();
      });
    };

    Select.prototype.setupTether = function() {
      return this.tether = new Tether({
        element: this.drop,
        target: this.target,
        attachment: 'top left',
        targetAttachment: 'bottom left',
        classPrefix: 'select',
        constraints: [
          {
            to: 'window',
            attachment: 'together'
          }
        ]
      });
    };

    Select.prototype.renderTarget = function() {
      var option, _i, _len, _ref1;
      this.target.innerHTML = '';
      _ref1 = this.select.querySelectorAll('option');
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        option = _ref1[_i];
        if (option.selected) {
          this.target.innerHTML = option.innerHTML;
          break;
        }
      }
      return this.target.appendChild(document.createElement('b'));
    };

    Select.prototype.renderDrop = function() {
      var el, option, optionList, _i, _len, _ref1;
      optionList = document.createElement('ul');
      addClass(optionList, 'select-options');
      _ref1 = this.select.querySelectorAll('option');
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        el = _ref1[_i];
        option = document.createElement('li');
        addClass(option, 'select-option');
        option.setAttribute('data-value', el.value);
        option.innerHTML = el.innerHTML;
        if (el.selected) {
          addClass(option, 'select-option-selected');
        }
        optionList.appendChild(option);
      }
      this.content.innerHTML = '';
      return this.content.appendChild(optionList);
    };

    Select.prototype.update = function() {
      this.renderDrop();
      return this.renderTarget();
    };

    Select.prototype.setupSelect = function() {
      this.select.selectInstance = this;
      addClass(this.select, 'select-select');
      return this.select.addEventListener('change', this.update);
    };

    Select.prototype.bindMutationEvents = function() {
      if (window.MutationObserver != null) {
        this.observer = new MutationObserver(this.update);
        return this.observer.observe(this.select, {
          childList: true,
          attributes: true,
          characterData: true,
          subtree: true
        });
      } else {
        return this.select.addEventListener('DOMSubtreeModified', this.update);
      }
    };

    Select.prototype.findOptionsByPrefix = function(text) {
      var options;
      options = this.drop.querySelectorAll('.select-option');
      text = text.toLowerCase();
      return Array.prototype.filter.call(options, function(option) {
        return option.innerHTML.toLowerCase().substr(0, text.length) === text;
      });
    };

    Select.prototype.findOptionsByValue = function(val) {
      var options;
      options = this.drop.querySelectorAll('.select-option');
      return Array.prototype.filter.call(options, function(option) {
        return option.getAttribute('data-value') === val;
      });
    };

    Select.prototype.getChosen = function() {
      if (this.isOpen()) {
        return this.drop.querySelector('.select-option-highlight');
      } else {
        return this.drop.querySelector('.select-option-selected');
      }
    };

    Select.prototype.selectOption = function(option) {
      if (this.isOpen()) {
        this.highlightOption(option);
        return this.scrollDropContentToOption(option);
      } else {
        return this.pickOption(option, false);
      }
    };

    Select.prototype.resetSelection = function() {
      return this.selectOption(this.drop.querySelector('.select-option'));
    };

    Select.prototype.highlightOption = function(option) {
      var highlighted;
      highlighted = this.drop.querySelector('.select-option-highlight');
      if (highlighted != null) {
        removeClass(highlighted, 'select-option-highlight');
      }
      addClass(option, 'select-option-highlight');
      return this.trigger('highlight', {
        option: option
      });
    };

    Select.prototype.moveHighlight = function(directionKeyCode) {
      var highlighted, highlightedIndex, newHighlight, options;
      if (!(highlighted = this.drop.querySelector('.select-option-highlight'))) {
        this.highlightOption(this.drop.querySelector('.select-option'));
        return;
      }
      options = this.drop.querySelectorAll('.select-option');
      highlightedIndex = Array.prototype.indexOf.call(options, highlighted);
      if (!(highlightedIndex >= 0)) {
        return;
      }
      if (directionKeyCode === UP) {
        highlightedIndex -= 1;
      } else {
        highlightedIndex += 1;
      }
      if (highlightedIndex < 0 || highlightedIndex >= options.length) {
        return;
      }
      newHighlight = options[highlightedIndex];
      this.highlightOption(newHighlight);
      return this.scrollDropContentToOption(newHighlight);
    };

    Select.prototype.scrollDropContentToOption = function(option) {
      var contentBounds, optionBounds;
      if (this.content.scrollHeight > this.content.clientHeight) {
        contentBounds = getBounds(this.content);
        optionBounds = getBounds(option);
        return this.content.scrollTop = optionBounds.top - (contentBounds.top - this.content.scrollTop);
      }
    };

    Select.prototype.selectHighlightedOption = function() {
      return this.pickOption(this.drop.querySelector('.select-option-highlight'));
    };

    Select.prototype.pickOption = function(option, close) {
      var _this = this;
      if (close == null) {
        close = true;
      }
      this.value = this.select.value = option.getAttribute('data-value');
      this.triggerChange();
      if (close) {
        return setTimeout(function() {
          _this.close();
          return _this.target.focus();
        });
      }
    };

    Select.prototype.triggerChange = function() {
      var event;
      event = document.createEvent("HTMLEvents");
      event.initEvent("change", true, false);
      this.select.dispatchEvent(event);
      return this.trigger('change', {
        value: this.select.value
      });
    };

    Select.prototype.change = function(val) {
      var options;
      options = this.findOptionsByValue(val);
      if (!options.length) {
        throw new Error("Select Error: An option with the value \"" + val + "\" doesn't exist");
      }
      return this.pickOption(options[0], false);
    };

    return Select;

  })(Evented);

  Select.init = function(options) {
    var el, _i, _len, _ref1, _results;
    if (options == null) {
      options = {};
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        return Select.init(options);
      });
      return;
    }
    if (options.selector == null) {
      options.selector = 'select';
    }
    _ref1 = document.querySelectorAll(options.selector);
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      el = _ref1[_i];
      if (!el.selectInstance) {
        _results.push(new Select(extend({
          el: el
        }, options)));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  window.Select = Select;

}).call(this);

(function() {
  var DropTooltip, Tooltip, defaults;

  DropTooltip = Drop.createContext();

  defaults = {
    attach: 'top center'
  };

  Tooltip = (function() {
    function Tooltip(options) {
      this.options = options;
      this.$target = $(this.options.el);
      this.createDrop();
    }

    Tooltip.prototype.createDrop = function() {
      var _ref;
      if (this.options.attach == null) {
        this.options.attach = defaults.attach;
      }
      return this.dropTooltip = new DropTooltip({
        target: this.$target[0],
        className: 'drop-tooltip-theme-arrows',
        attach: this.options.attach,
        constrainToWindow: true,
        constrainToScrollParent: false,
        openOn: 'hover',
        content: (_ref = this.options.content) != null ? _ref : this.$target.attr('data-tooltip-content')
      });
    };

    return Tooltip;

  })();

  window.Tooltip = Tooltip;

}).call(this);

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
	}
};
function TweetlistCtrl( $location, $scope, db, $rootScope,$routeParams,apertureService) {	
    olark('api.box.hide'); //hides olark tab on this page
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
}
TweetlistCtrl.$inject = [ '$location', '$scope', 'db', '$rootScope','$routeParams', 'apertureService'];



function InstalistCtrl( $location, $scope, db, $rootScope,$routeParams, apertureService) {
    olark('api.box.hide'); //hides olark tab on this page
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
}
InstalistCtrl.$inject = [ '$location', '$scope', 'db', '$rootScope','$routeParams', 'apertureService'];



function TalktagCtrl( $location, $scope, $routeParams, db, $rootScope) {
    olark('api.box.hide'); //hides olark tab on this page

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
    olark('api.box.hide'); //hides olark tab on this page


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
    olark('api.box.hide'); //hides olark tab on this page


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





app.controller('EditController', ['$scope', 'db', 'World', '$rootScope', '$route', '$routeParams', 'apertureService', 'mapManager', 'styleManager', 'alertManager', '$upload', '$http', '$timeout', function($scope, db, World, $rootScope, $route, $routeParams, apertureService, mapManager, styleManager, alertManager, $upload, $http, $timeout) {
console.log('--EditController--');

var aperture = apertureService,
	ears = [],
	map = mapManager,
	style = styleManager,
	alerts = alertManager;
var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];
zoomControl.style.top = "50px";
zoomControl.style.left = "40%";
aperture.set('full');

olark('api.box.show'); //shows olark tab on this page

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

$scope.temp = {
	scale: 1
}


$http.get('/components/edit/edit.locale-en-us.json').success(function(data) { 
	$scope.locale = angular.fromJson(data);
	$scope.tooltips = $scope.locale.tooltips;
});

if ($routeParams.view) {
	$scope.view = $routeParams.view;
} else {
	$scope.view = 'details';
}

console.log($scope.view); 
$scope.worldURL = $routeParams.worldURL;

var lastRoute = $route.current;


$scope.initView = function() {
	switch ($scope.view) {
		case 'details':
		map.setCircleMaskState('mask');
		
			break;
		case 'maps': 
		map.setCircleMaskState('mask');
		
			break;
		case 'styles':
		console.log('switching to styles');
		map.setCircleMaskState('cover');
			break;
	}
}

$scope.onWorldIconSelect = function($files) {
	var file = $files[0];
	$scope.upload = $upload.upload({
		url: '/api/upload/',
		file: file,
	}).progress(function(e) {
		console.log('%' + parseInt(100.0 * e.loaded/e.total));
	}).success(function(data, status, headers, config) {
		console.log(data);
		$scope.world.avatar = data;
		$scope.uploadFinished = true;
	});
}

$scope.onLocalMapSelect = function($files) {
	var file = $files[0];
	$scope.upload = $upload.upload({
		url: '/api/upload_maps',
		file: file
	}).progress(function(e) {
		console.log('%' + parseInt(100.0 * e.loaded/e.total));
	}).success(function(data, status, headers, config) {
		console.log(data);
		$scope.mapImage = data;
		map.placeImage('m', data);
	})
}

$scope.selectMapTheme = function(name) {
	console.log('--selectMapTheme--', name);
	var mapThemes = {
		arabesque: {cloudMapName:'arabesque', cloudMapID:'interfacefoundry.ig67e7eb'},
		fairy: {cloudMapName:'fairy', cloudMapID:'interfacefoundry.ig9jd86b'},
		sunset: {cloudMapName:'sunset', cloudMapID:'interfacefoundry.ig6f6j6e'},
		urban: {cloudMapName:'urban', cloudMapID:'interfacefoundry.ig6a7dkn'}
	};
	if (typeof name === 'string') {
		$scope.mapThemeSelect = name;
		map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/'+mapThemes[name].cloudMapID+'/{z}/{x}/{y}.png');
		
		$scope.world.style.maps.cloudMapName = mapThemes[name].cloudMapName;
		$scope.world.style.maps.cloudMapID = mapThemes[name].cloudMapID;
		
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
}
}

$scope.addLandmarkCategory = function() {
	if ($scope.temp) {
	console.log($scope.temp.LandmarkCategory);
	$scope.world.landmarkCategories.unshift({name: $scope.temp.LandmarkCategory});
	console.log($scope.world);
	}
}

$scope.removeLandmarkCategory = function(index) {
	$scope.world.landmarkCategories.splice(index, 1);
}

$scope.loadWorld = function(data) {
	  	$scope.world = data.world;
		$scope.style = data.style;
		style.navBG_color = $scope.style.navBG_color;
		
		console.log($scope.world);
		console.log($scope.style);
		
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
	tempMarker = map.getMarker('m');
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
	//get image geo coordinates, add to var to send
	var bounds = map.getPlaceImageBounds(),
		southEast = bounds.getSouthEast(),
		northWest = bounds.getNorthWest(),
		southWest = bounds.getSouthWest(),
		northEast = bounds.getNorthEast(),
		coordBox = {
			worldID: $scope.world._id,
			nw_loc_lng: northWest.lng,
		    nw_loc_lat: northWest.lat,
		    sw_loc_lng: southWest.lng,
			sw_loc_lat: southWest.lat,
			ne_loc_lng: northEast.lng,
			ne_loc_lat: northEast.lat,
			se_loc_lng: southEast.lng,
			se_loc_lat: southEast.lat 
		};
	console.log('bounds', bounds);
	console.log('coordBox', coordBox);
	var coords_text = JSON.stringify(coordBox);
		var data = {
		      mapIMG: $scope.mapImage,
		      coords: coords_text
		    }
	//build map
	alerts.addAlert('warning', 'Building local map, this may take some time!', true);
	$http.post('/api/build_map', data).success(function(response){
		//response = JSON.parse(response);
		alerts.addAlert('success', 'Map built!', true);
		console.log(response);
		if (!$scope.world.hasOwnProperty('style')){$scope.world.style={}}
		if (!$scope.world.style.hasOwnProperty('maps')){$scope.world.style.maps={}} //remove this when world objects arent fd up
		if (response[0]) { //the server sends back whatever it wants. sometimes an array, sometimes not. :(99
			$scope.world.style.maps.localMapID = response[0].style.maps.localMapID;
			$scope.world.style.maps.localMapName = response[0].style.maps.localMapName;
			$scope.world.style.maps.localMapOptions = response[0].style.maps.localMapOptions;
		} else {
			$scope.world.style.maps.localMapID = response.style.maps.localMapID;
			$scope.world.style.maps.localMapName = response.style.maps.localMapName;
			$scope.world.style.maps.localMapOptions = response.style.maps.localMapOptions;
		}
		$scope.saveWorld();
		});
}

function findLoc() {
	if (navigator.geolocation && !$scope.world.hasLoc) {
   // Get the user's current position
   		navigator.geolocation.getCurrentPosition(showPosition, locError, {timeout:15000});
   }
}

function showPosition(position) {
	console.log('--showPosition--');
	userLat = position.coords.latitude;
	userLng = position.coords.longitude;
	
	map.setCenter([userLng, userLat], 17, 'editor');
 
	map.removeAllMarkers();
	map.addMarker('m', {
		lat: userLat,
		lng: userLng,
		message: "<p style='color:black;'>Drag to World's Location</p>",
		focus: true,
		draggable: true,
		icon: {
			iconUrl: 'img/marker/bubble-marker-50.png',
			shadowUrl: '',
			iconSize: [30, 57.60],
			iconAnchor: [15, 50],
			popupAnchor:  [0, -40]
		}
	});
	
	var state;
	console.log('$scope.view', $scope.view);
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
	
	map.removeCircleMask();
	map.addCircleMaskToMarker('m', 150, state);

/*
map.addPath('worldBounds', {
		type: 'circle',
		radius: 150,
		latlngs: {lat:userLat,
					lng:userLng}
	});
*/
			
			//disable this for 2nd page of editor...
		//	$scope.$on('leafletDirectiveMap.drag', function(event){
            //        console.log('moveend');
                    /*$scope.paths.worldBounds.latlngs = {lat:$scope.markers.m.lat,
							lng:$scope.markers.m.lng};*/
          //  });
            
}

function locError(){
        console.log('no loc');
}

////////////////////////////////////////////////////////////
/////////////////////////LISTENERS//////////////////////////
////////////////////////////////////////////////////////////
$scope.$on('$locationChangeSuccess', function (event) {
    if (lastRoute.$$route.originalPath === $route.current.$$route.originalPath) {
        $scope.view = $route.current.params.view;
        $route.current = lastRoute;
        console.log($scope.view);
    }
    $scope.initView();
});

$scope.$on('$destroy', function (event) {
	console.log('$destroy event', event);
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
		console.log(map.getPlaceImageBounds());
	}
});

var saveTimer = null;
$scope.$watchCollection('world', function (newCol, oldCol) {
	if (oldCol!=undefined) {
		if (saveTimer) {
			$timeout.cancel(saveTimer);
		}
		saveTimer = $timeout($scope.saveWorld, 5000);
	}
});



////////////////////////////////////////////////////////////
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////
World.get({id: $routeParams.worldURL}, function(data) {
	if (data.err) {
		 console.log('World not found!');
		 console.log(data.err);
	} else {
		$scope.loadWorld(data);
	}
	map.refresh();
})

//end editcontroller
}]);
app.controller('LandmarkEditorController', ['$scope', '$rootScope', '$location', '$route', '$routeParams', 'db', 'World', 'leafletData', 'apertureService', 'mapManager', 'Landmark', 'alertManager', '$upload', '$http', function ($scope, $rootScope, $location, $route, $routeParams, db, World, leafletData, apertureService, mapManager, Landmark, alertManager, $upload, $http) {
	console.log('Landmark Editor Controller initializing');
////////////////////////////////////////////////////////////
///////////////////INITIALIZING VARIABLES///////////////////
////////////////////////////////////////////////////////////
	var map = mapManager;
	
	var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];
		zoomControl.style.top = "50px";
		zoomControl.style.left = "40%";
	/*

	$scope.aperture = apertureService;
	$scope.aperture.set('half');
	*/
		
	var worldLoaded = false;
	var landmarksLoaded = false;
	
	$scope.landmarks = [];
	$scope.selectedIndex = 0;
	$scope.alerts = alertManager;

	
////////////////////////////////////////////////////////////
//////////////////////DEFINE FUNCTIONS//////////////////////
////////////////////////////////////////////////////////////
/*
	$scope.addFileUploads = function() {
		angular.element('.fileupload').fileupload({
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
            $scope.landmarks[$scope.selectedIndex].avatar = data.result;
        }
    });
	}
*/
	
	$scope.addLandmark = function() {
		console.log('--addLandmark--');
		if (!worldLoaded || !landmarksLoaded) {console.log('loading not complete');}
		else {
		console.log('Adding a new Landmark');
		var tempLandmark = landmarkDefaults();
		db.landmarks.create(tempLandmark, function(response) {
				console.log('--db.landmarks.create--');
				console.log('Response ID:'+response[0]._id);
			tempLandmark._id = response[0]._id;
				console.log('tempLandmark');
				console.log(tempLandmark);
				console.log(tempLandmark.loc.coordinates);
			
			//add to array 
			$scope.landmarks.unshift(tempLandmark);		
			
			//add marker
			map.addMarker(tempLandmark._id, {
				lat:tempLandmark.loc.coordinates[1],
				lng:tempLandmark.loc.coordinates[0],
				icon: {
					iconUrl: 'img/marker/bubble-marker-50.png',
					shadowUrl: '',
					iconSize: [25, 48],
					iconAnchor: [13, 10]
				},
				draggable:true,
			});
			
			//$scope.selectItem(0)
			console.log("$scope.landmarks");
			console.log($scope.landmarks);				
				
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
		//$scope.saveItem($scope.selectedIndex);//save previous landmark
		console.log('Continue w select');
		$scope.selectedIndex = i; //change landmarks
		map.setCenter($scope.landmarks[i].loc.coordinates, 18);//center map on new markers
		console.log($scope.landmarks[i].name);
		map.setMarkerMessage($scope.landmarks[i]._id, $scope.landmarks[i].name);
		map.setMarkerFocus($scope.landmarks[i]._id);
		console.log('Complete select');
	}
		
	
	
	function loadLandmarks() {
		console.log('--loadLandmarks--');
		//$scope.queryType = "all";
		//$scope.queryFilter = "all";
		db.landmarks.query({ queryType:'all', queryFilter:'all', parentID: $scope.world._id}, function(data){
				console.log('--db.landmarks.query--');
				console.log('data');
				console.log(data);
			//data.shift();
			$scope.landmarks = $scope.landmarks.concat(data);
				console.log('$scope.landmarks');
				console.log($scope.landmarks);
			
			//add markers to map
			angular.forEach($scope.landmarks, function(value, key) {
				//for each landmark add a marker
				map.addMarker(value._id, {
					lat:value.loc.coordinates[1],
					lng:value.loc.coordinates[0],
					draggable: true,
					icon: {
						iconUrl: 'img/marker/bubble-marker-50.png',
						shadowUrl: '',
						iconSize: [25, 48],
						iconAnchor: [13, 10]
					},
					message:value.name
				});
			});
			landmarksLoaded = true;
			
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
			avatar: "img/tidepools/default.jpg"
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
		console.log('controller active');
	World.get({id: $routeParams.worldURL}, function(data) {
			console.log('--World.get--');
			console.log(data);
		$scope.world = data.world;
			console.log('-World-');
			console.log($scope.world);
		$scope.style = data.style;
			console.log('-Style-');
			console.log($scope.style);
		
		$scope.worldURL = $routeParams.worldURL;
		//initialize map with world settings
		if ($scope.world.style) {
		if ($scope.world.style.maps) {
		map.setBaseLayerFromID($scope.world.style.maps.cloudMapID)}}
		map.setCenter($scope.world.loc.coordinates, 18);
		map.addMarker('m', {
			lat: $scope.world.loc.coordinates[1],
			lng: $scope.world.loc.coordinates[0],
			focus: false,
			draggable: false,
			icon: {
				iconUrl: 'img/marker/bubble-marker-50.png',
				shadowUrl: '',
				iconSize: [0,0],
				shadowSize: [0,0],
				iconAnchor: [0,0],
				shadowAnchor: [0,0]
			}
		});
		map.removeCircleMask();
		map.addCircleMaskToMarker('m', 150, 'mask');
		
		/*map.addPath('worldBounds', {
				type: 'circle',
                radius: 150,
				latlngs: {lat:$scope.world.loc.coordinates[1], lng:$scope.world.loc.coordinates[0]}
				});*/
		//map.setTiles($scope.world.style.maps.cloudMapName);
		map.setMaxBoundsFromPoint([$scope.world.loc.coordinates[1],$scope.world.loc.coordinates[0]], 0.05);
		
		if ($scope.world.style.maps.type == "local" || $scope.world.style.maps.type == "both") {
			map.addOverlay($scope.world.style.maps.localMapID, $scope.world.style.maps.localMapName, $scope.world.style.maps.localMapOptions);
		}
		map.refresh();
		
		//world is finished loading
		worldLoaded = true;
		
		//begin loading landmarks
		loadLandmarks();
	});
}])

app.controller('LandmarkEditorItemController', ['$scope', 'db', 'Landmark', 'mapManager', '$upload', function ($scope, db, Landmark, mapManager, $upload) {
	console.log('LandmarkEditorItemController', $scope);
	$scope.time = false;
	
	$scope.deleteLandmark = function() {
		$scope.$parent.removeItem($scope.$index);
	}
	
	$scope.saveLandmark = function() {
		$scope.$parent.saveItem($scope.$index);
	}
	
	$scope.selectLandmark = function() {
		$scope.$parent.selectItem($scope.$index);
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
		$scope.uploadFinished = true;
		});
	}
	
}]);
app.controller('WalkthroughController', ['$scope', '$location', '$route', '$routeParams', '$timeout', 'ifGlobals', 'leafletData', '$upload', 'mapManager', 'World', 'db', function($scope, $location, $route, $routeParams, $timeout, ifGlobals, leafletData, $upload, mapManager, World, db) {
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

olark('api.box.show'); //shows olark tab on this page

zoomControl.style.display = 'none'; 

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
	}).success(function(data, status, headers, config) {
		console.log(data);
		$scope.world.avatar = data;
	});
}

$scope.selectMapTheme = function(name) {
		var mapThemes = {
			arabesque: {cloudMapName:'arabesque', cloudMapID:'interfacefoundry.ig67e7eb'},
			fairy: {cloudMapName:'fairy', cloudMapID:'interfacefoundry.ig9jd86b'},
			sunset: {cloudMapName:'sunset', cloudMapID:'interfacefoundry.ig6f6j6e'},
			urban: {cloudMapName:'urban', cloudMapID:'interfacefoundry.ig6a7dkn'}
		};
	
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
}
console.log($scope.style)

    db.styles.create($scope.style, function(response){
        console.log(response);
    });
}	
	
$scope.saveAndExit = function() {
	$scope.save();
	if ($scope.world.id) {
		$location.path("/edit/w/"+$scope.world.id);
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
    	console.log('saving style');
	    db.styles.create($scope.style, function(response){
      		console.log(response);
		});
    }
}

var firstWalk = [
	{title: 'Need a hand?',
	caption: 'If you haven’t built a bubble before, we can walk you through it.',
	height: 0,
	view: '0.html',
	valid: function() {return true},
	skip: false},
	{title: 'Kind',
	caption: 'What kind of bubble is it?',
	view: 'kind.html',
	height: 220,
	valid: function() {return typeof $scope.world.category == "string"},
	skip: false},
	{title: 'Location', 
	caption: 'Find its location',
	view: 'location.html',
	height: 290,
	valid: function() {return $scope.world.hasLoc},
	skip: false},
	{title: 'Name',
	caption: 'What\'s your bubble named?',
	view: 'name.html',
	height: 62,
	valid: function() {return $scope.form.worldName.$valid},
	skip: false},
	{title: 'Time',
	caption: 'Give it a start and end time',
	view: 'time.html',
	height: 88,
	valid: function() {return $scope.form.time.$valid},
	jump: function() {return !$scope.global.kinds[$scope.world.category].hasTime;},
	skip: true},
	{title: 'Picture',
	caption: 'Upload a picture for your bubble',
	view: 'picture.html',
	height: 194,
	valid: function() {return true},
	skip: true},
	{title: 'Maps',
	caption: 'Choose a map',
	view: 'maptheme.html',
	height: 426,
	valid: function() {return true},
	skip: true},
	{title: 'Hashtag',
	caption: 'Connect your bubble\'s social media',
	view: 'hashtag.html',
	height: 132,
	valid: function() {return true},
	skip: true,
	},
	{title: 'Done!',
	caption: 'Now spread the word :)',
	view: 'done.html',
	height: 200,
	skip: false}
];

var meetupWalk = [
	//0 intro
	{title: 'Claim your Meetup',
	caption: "We'll use your Meetup group to create a bubble.",
	view:'0.html',
	height: 0,
	valid: function() {return true},
	skip: false
	},
	//1 
	{title: 'Confirm',
	caption: 'Make sure this information from Meetup.com is correct',
	view: 'meetup_confirm.html',
	height: 300,
	valid: function() {return true},
	skip: false
	},
	{title: 'Kind',
	caption: 'What kind of bubble is it?',
	view: 'kind.html',
	height: 220,
	valid: function() {return typeof $scope.world.category == "string"},
	skip: false},
	{title: 'Hashtag',
	caption: 'Connect your bubble\'s social media',
	view: 'hashtag.html',
	height: 132,
	valid: function() {return true},
	skip: true,
	},
	{title: 'Picture',
	caption: 'Upload a picture',
	view: 'picture.html',
	height: 194,
	valid: function() {return true},
	skip: true},
	{title: 'Maps',
	caption: 'Choose a map',
	view: 'maptheme.html',
	height: 426,
	valid: function() {return true},
	skip: true},
	{title: 'Done!',
	caption: 'Now spread the word :)',
	view: 'done_meetup.html',
	height: 200,
	skip: false}
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
								draggable: false
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
app.controller('HomeController', ['$scope', function ($scope) {

}]);
app.controller('SearchController', ['$location', '$scope', 'db', '$rootScope', 'apertureService', 'mapManager', 'styleManager', '$route', '$routeParams', '$timeout', function ($location, $scope, db, $rootScope, apertureService, mapManager, styleManager, $route, $routeParams, $timeout){
	/*$scope.sessionSearch = function() { 
        $scope.landmarks = db.landmarks.query({queryType:"search", queryFilter: $scope.searchText});
    };*/    
    // db.landmarks.query({queryType:"search", queryFilter: $routeParams.searchQuery}, function(data) {
	   //  console.log(data);
    // });


}]);
app.controller('MeetupController', ['$scope', '$window', '$location', 'styleManager', '$rootScope', function ($scope, $window, $location, styleManager, $rootScope) {

	olark('api.box.show'); //shows olark tab on this page

	var style = styleManager;

	style.navBG_color = "rgba(244, 81, 30, 0.8)";

	angular.element('#view').bind("scroll", function () {
		console.log(this.scrollTop);
	});
	
	angular.element('#wrap').scroll(
	_.debounce(function() {
		console.log(this.scrollTop);
		$scope.scroll = this.scrollTop;
		$scope.$apply();
		}, 20));


	// $scope.loadmeetup = function() {
	// 	$location.path('/auth/meetup');
	// }

}]);
/**********************************************************************
 * Login controller
 **********************************************************************/
app.controller('LoginCtrl', ['$scope', '$rootScope', '$http', '$location', 'apertureService', 'alertManager', function ($scope, $rootScope, $http, $location, apertureService, alertManager) {

  olark('api.box.show'); //shows olark tab on this page

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



  //FIRE function on click
  //---> http.post(/auth/meetup)




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

  olark('api.box.show'); //shows olark tab on this page

  $scope.alerts = alertManager;
  $scope.aperture = apertureService;  
  $scope.aperture.set('off');

  // This object will be filled by the form
  $scope.user = {};


  // Register the login() function
  $scope.signup = function(){
    var data = {
      email: $scope.user.email,
      password: $scope.user.password
    }



    $http.post('/api/user/signup', data).
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




    // $http.post('/api/user/signup', data).
    //   success(function(user){
    //       if (user){
    //         $location.url('/profile');
    //       }
    //   }).
    //   error(function(err){
    //     if (err){
    //       $scope.alerts.addAlert('danger',err);
    //     }
    //   });
  }
}]);

app.controller('ForgotCtrl', ['$scope', '$http', '$location', 'apertureService', 'alertManager', function ($scope, $http, $location, apertureService, alertManager) {

  olark('api.box.show'); //shows olark tab on this page

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

  olark('api.box.show'); //shows olark tab on this page

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


app.controller('UserController', ['$scope', '$rootScope', '$http', '$location', '$route', '$routeParams', 'userManager', '$q', '$timeout', '$upload', 'Landmark', 'db', 'alertManager', '$interval', function ($scope, $rootScope, $http, $location, $route, $routeParams, userManager, $q, $timeout, $upload, Landmark, db, alertManager, $interval) {

angular.extend($rootScope, {loading: false});

$scope.state = {};
$scope.subnav = {
	profile: ['me', 'contacts', 'history'],
	worlds: ['worlds', 'drafts', 'filter']
}
var saveTimer = null;
var alert = alertManager;

olark('api.box.show'); //shows olark tab on this page

$scope.onAvatarSelect = function($files) {
	var file = $files[0];
	$scope.upload = $upload.upload({
		url: '/api/upload/',
		file: file,
	}).progress(function(e) {
		console.log('%' + parseInt(100.0 * e.loaded/e.total));
	}).success(function(data, status, headers, config) {
		console.log(data);
		$scope.user.avatar = data;
		$rootScope.avatar = data;
		$scope.uploadFinished = true;
	});
}


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
	angular.extend($rootScope, {loading: true});
	$scope.fromMeetup = true;
	$scope.waitingforMeetup = true;

	$http.post('/api/process_meetups').success(function(response){
		angular.extend($rootScope, {loading: false});
		checkProfileUpdates(); //now wait until meetup bubbles come in
		// $http.get('/api/user/profile').success(function(user){
		// 	$scope.worlds = user;		
			
		// });
	}).
	error(function(data) {
		angular.extend($rootScope, {loading: false});
		$http.get('/api/user/profile').success(function(user){
			$scope.worlds = user;	
			$scope.waitingforMeetup = false;	
		});
	});
	
}
else {
	$http.get('/api/user/profile').success(function(user){
		console.log(user);
		$scope.worlds = user;		
	});
}

//if came from meetup, keep checking for new meetups until route change
function checkProfileUpdates(){
	$scope.stop = $interval(checkProfile, 2000);
	function checkProfile(){
		$http.get('/api/user/profile').success(function(user){
			$scope.worlds = user;	
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

$scope.newWorld = function() {
		console.log('newWorld()');
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
	console.log(response);
	$scope.user = response;
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
function LandmarkController( World, Landmark, db, $routeParams, $scope, $location, $log, $window, leafletData, $rootScope, apertureService, mapManager, styleManager) {

		var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];
		zoomControl.style.top = "100px";
		zoomControl.style.left = "1%";

		console.log('--Landmark Controller--');
		var map = mapManager;
		var style = styleManager;
		$scope.aperture = apertureService;
		$scope.aperture.set('half');
		
		olark('api.box.hide'); //shows olark tab on this page

		$scope.worldURL = $routeParams.worldURL;
		$scope.landmarkURL = $routeParams.landmarkURL;
		
		//eventually landmarks can have non-unique names
		$scope.landmark = Landmark.get({id: $routeParams.landmarkURL}, function(landmark) {
			console.log(landmark);
			console.log('trying to get landmark');
			//goto landmarker
			goToMark();	
		});
		
		World.get({id: $routeParams.worldURL}, function(data) {
			console.log(data)
			if (data.err) {
				$log.error(data.err);
				$location.path('/#/');
			} else {
				$scope.world = data.world;
				$scope.style = data.style;
				style.navBG_color = $scope.style.navBG_color;
			}
		});
		
		function goToMark() {
			
			map.setCenter($scope.landmark.loc.coordinates, 20); 
		  	var markers = map.markers;
		  	angular.forEach(markers, function(marker) {
		  		console.log(marker);
			  	map.removeMarker(marker._id);
		  	});
		  	

		  	map.addMarker($scope.landmark._id, {
		  			lat: $scope.landmark.loc.coordinates[1],
		  			lng: $scope.landmark.loc.coordinates[0],
		  			draggable:false,
		  			message:$scope.landmark.name,
				  	icon: {
						iconUrl: 'img/marker/bubble-marker-50.png',
						shadowUrl: '',
						iconSize: [25, 48],
						iconAnchor: [13, 48]
					},
		  			_id: $scope.landmark._id
		  			});
		  	map.setMarkerFocus($scope.landmark._id);
		 };
		 
		map.refresh();
}
app.controller('MessagesController', ['$location', '$scope', '$sce', 'db', '$rootScope', '$routeParams', 'apertureService', '$http', '$timeout', 'worldTree', '$upload', function ( $location, $scope,  $sce, db, $rootScope, $routeParams, apertureService, $http, $timeout, worldTree, $upload) {

////////////////////////////////////////////////////////////
///////////////////////INITIALIZE///////////////////////////
////////////////////////////////////////////////////////////
var checkMessagesTimeout;
$scope.loggedIn = false;
$scope.nick = 'Visitor';

$scope.msg = {};
$scope.messages = [];
$scope.localMessages = [];

$scope.currentChatID = $routeParams.worldID;
$scope.messageList = angular.element('.message-list');

olark('api.box.hide'); //shows olark tab on this page

var sinceID = 'none';
var firstScroll = true;


function scrollMessages() {
	$timeout(function() {
    	$scope.messageList.animate({scrollTop: $scope.messageList[0].scrollHeight}, 300); //JQUERY USED HERE
    	firstScroll=false;
    },0);
}

function checkMessages(){
db.messages.query({worldID:$routeParams.worldURL, sinceID:sinceID}, function(data){
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
		if (firstScroll==true) {
		scrollMessages();
		}
		checkMessagesTimeout = $timeout(checkMessages, 3000);	
	}
	 
});


}

$scope.sendMsg = function (e) {
	if (e) {e.preventDefault()}
	if ($scope.msg.text == null) { return;}
	if ($scope.loggedIn){
	    var newChat = {
	        worldID: $routeParams.worldURL,
	        nick: $scope.nick,
	        msg: $scope.msg.text,
	        avatar: $scope.user.avatar || 'img/icons/profile.png',
	        userID: $scope.userID
	    };
		
		sendMsgToServer(newChat);		
	    $scope.msg.text = "";
	}
}

function sendMsgToServer(msg) {
db.messages.create(msg, function(res) {
	sinceID = res[0]._id;
	
	$scope.messages.push(msg);
	$scope.localMessages.push(res[0]._id);
	scrollMessages();
});
}
	
$scope.onImageSelect = function($files) {
	$scope.upload = $upload.upload({
		url: '/api/uploadPicture',
		file: $files[0]
	}).success(function(data, status) {
		sendMsgToServer({
			worldID: $routeParams.worldURL,
	        nick: $scope.nick,
	        avatar: $scope.user.avatar || 'img/icons/profile.png',
	        msg: '',
	        pic: data,
	        userID: $scope.userID
		});
		//console.log(data);
	})
}	


////////////////////////////////////////////////////////////
///////////////////LISTENERS&INTERVALS//////////////////////
////////////////////////////////////////////////////////////


/*
var dereg = $rootScope.$on('$locationChangeSuccess', function() {
        $interval.cancel(checkMessagesInterval);
        dereg();
});
*/


////////////////////////////////////////////////////////////
//////////////////////EXECUTING/////////////////////////////
////////////////////////////////////////////////////////////

worldTree.getWorld($routeParams.worldURL).then(function(data) {
	$scope.style=data.style;
	$scope.world=data.world;
	console.log($scope.style);
});

$http.get('/api/user/loggedin').success(function(user){

// Authenticated
if (user !== '0'){
	$scope.loggedIn = true;
	if (user._id){
    	$scope.userID = user._id;
	}
	//nickname
	if (user.name){
	  $scope.nick = user.name;
	}
	else if (user.facebook){
	  $scope.nick = user.facebook.name;
	}
	else if (user.twitter){
	  $scope.nick = user.twitter.displayName;
	}
	else if (user.meetup){
	  $scope.nick = user.meetup.displayName;
	}
	else if (user.local){
	  $scope.nick = user.local.email;
	}
	else {
	  $scope.nick = "Visitor";
	}
}

$scope.user = user;
console.log(user._id);
checkMessages();
});


} ]);
app.controller('WorldController', ['World', 'db', '$routeParams', '$scope', '$location', 'leafletData', '$rootScope', 'apertureService', 'mapManager', 'styleManager', '$sce', 'worldTree', '$q', function ( World, db, $routeParams, $scope, $location, leafletData, $rootScope, apertureService, mapManager, styleManager, $sce, worldTree, $q) {

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
	
    angular.extend($rootScope, {loading: false});
	
	$scope.selectedIndex = 0;
	
	var landmarksLoaded;

	olark('api.box.hide'); //hides olark tab on this page

  	//currently only for upcoming...
  	function setLookup() {
	  	$scope.lookup = {}; 
	  	
	  	for (var i = 0, len = $scope.landmarks.length; i<len; i++) {
		  	$scope.lookup[$scope.landmarks[i]._id] = i;
	  	}
	  	console.log($scope.lookup);
  	}
  	
  	
  	function reorderById (idArray) {
  		console.log('reorderById');
	  	
	  	$scope.upcoming = [];
	  	for (var i = 0, len = idArray.length; i<len; i++) {
		  	$scope.upcoming[i] = $scope.landmarks.splice($scope.lookup[idArray[i]._id],1)[0];
	  	}
	  	
	  	console.log($scope.upcoming);
  	}
  	
  	
  	$scope.zoomOn = function() {
	  	zoomControl.style.display = "block";
  	}
  	
  	$scope.loadWorld = function(data) {
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

		 console.log($scope.world);
		 console.log($scope.style);
		 
		 if ($scope.world.name) {
			 angular.extend($rootScope, {globalTitle: $scope.world.name});
		 }
		 
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
		
		var zoomLevel = 19;
		
		if ($scope.world.hasOwnProperty('loc') && $scope.world.loc.hasOwnProperty('coordinates')) {
			map.setCenter([$scope.world.loc.coordinates[0], $scope.world.loc.coordinates[1]], zoomLevel, $scope.aperture.state);
			console.log('setcenter');
			map.addMarker('c', {
				lat: $scope.world.loc.coordinates[1],
				lng: $scope.world.loc.coordinates[0],
				icon: {
					iconUrl: 'img/marker/bubble-marker-50.png',
					shadowUrl: '',
					iconSize: [25, 48],
					iconAnchor: [13, 48]
				}
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
		
		$scope.loadLandmarks();
  	}
  	
  	function loadWidgets() {
		console.log($scope.world);
		if ($scope.style.widgets) {
		if ($scope.style.widgets.twitter) {
			$scope.twitter = true;
		}
		if ($scope.style.widgets.instagram) {
			$scope.instagram = true;
		}
		if ($scope.world.id == "StartFast_Demo_Day_2014") {
			console.log('wyzerr');
			$scope.wyzerr = true;
		}

		if ($scope.style.widgets.messages==true||$scope.style.widgets.chat==true) {
			$scope.messages = true;

			//angular while loop the query every 2 seconds
			db.messages.query({limit:1, worldID:$routeParams.worldURL}, function(data){ 
				console.log('db.messages', data);
				if (data.length>0) {
					$scope.msg = data[0];
				}
			});
		}
		
		if ($scope.style.widgets.category) {
			$scope.category = true;
		}
		
	  	if ($scope.style.widgets.upcoming) {
	  		$scope.upcoming = true;
	  		var userTime = new Date();
	  		db.landmarks.query({queryFilter:'now', parentID: $scope.world._id, userTime: userTime}, function(data){
				console.log('queryFilter:now');
				console.log(data);
				if (data[0]) $scope.now = $scope.landmarks.splice($scope.lookup[data[0]._id],1)[0];
				console.log($scope.now);
			}); 
			
			db.landmarks.query({queryFilter:'upcoming', parentID: $scope.world._id, userTime: userTime}, function(data){
				console.log('queryFilter:upcoming');
				console.log(data);
				//console.log(angular.fromJson(data[0]));
				reorderById(data);
			}); 
		}
		}
		
	   if ($scope.world.resources) {
		$scope.tweets = db.tweets.query({limit:1, tag:$scope.world.resources.hashtag});
	    $scope.instagrams = db.instagrams.query({limit:1, tag:$scope.world.resources.hashtag});
	   }
	     	 
	}

  	$scope.loadLandmarks = function(data) {
  		console.log('--loadLandmarks--');
  		//STATE: EXPLORE
	  	db.landmarks.query({queryFilter:'all', parentID: $scope.world._id}, function(data) { 
	  		console.log(data);
	  		$scope.landmarks = data;
	  		console.log($scope.landmarks);
	  		setLookup();
	  		loadWidgets(); //load widget data
	  		initLandmarks($scope.landmarks);
	  	});
  	}
  	
  	function initLandmarks(landmarks) {
	  	angular.forEach($scope.landmarks, function(landmark) {
					map.addMarker(landmark._id, {
						lat:landmark.loc.coordinates[1],
						lng:landmark.loc.coordinates[0],
						draggable:false,
						message:'<a href="#/w/'+$scope.world.id+'/'+landmark.id+'">'+landmark.name+'</a>',
						icon: {
			  				/*iconUrl: 'img/marker/red-marker-100.png',
			  				iconSize: [100,100],
			  				iconAnchor: [50, 100],
			  				shadowUrl: '',
			  				shadowRetinaUrl: '',
			  				shadowSize: [0,0],
			  				popupAnchor: [0, -80]*/
		  				},
						_id: landmark._id
					});
				});
  	}

	/*
World.get({id: $routeParams.worldURL}, function(data) {
		 if (data.err) {
		 	console.log('Data error! Returning to root!');
		 	console.log(data.err);
		 	$location.path('/#/');
		 } else {
			$scope.loadWorld(data); 
		}
	});
*/

	//===== VISITS =====//
	saveVisit();

	function saveVisit(){
	    var newVisit = {
	        worldID: 'somemongoid',
	        userName: 'nickname'
	    };

	    db.visit.create(newVisit, function(res) {
	    	console.log(res);
	    });		
	}

	//query for visits within one hour
	db.visit.query({ worldID:'somemongoid'}, function(data){

		console.log('WITHIN HOUR');
		console.log(data);
	});

	//query for visits from User
	db.visit.query({ option:'userHistory'}, function(data){

		console.log('USER');
		console.log(data);
	});

	//==================//


		
	worldTree.getWorld($routeParams.worldURL).then(function(data) {
		console.log('worldtree success');
		console.log(data);
		$scope.loadWorld(data);
	}, function(error) {
		console.log(error);
		//handle this better
	});
}]);