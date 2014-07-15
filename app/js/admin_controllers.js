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
        }
    });


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
