var simpleSearchApp = angular.module('simpleSearchApp', ['ngRoute'])

    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'partials/home.html',
                controller: 'HomeCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }]);

simpleSearchApp.controller('HomeCtrl',['$scope', '$http', '$document', '$timeout', '$interval','$window', '$routeParams', '$rootScope', '$route', function ($scope, $http, $document, $timeout, $interval, $window, $routeParams, $rootScope, $route) {

        L.mapbox.accessToken = 'pk.eyJ1IjoiaW50ZXJmYWNlZm91bmRyeSIsImEiOiItT0hjYWhFIn0.2X-suVcqtq06xxGSwygCxw';
        var map = L.mapbox.map('map', 'interfacefoundry.ig1oichl', {attributionControl: false})
            .setView([42.877742, -97.380979 ], 4);

        var myLayer = L.mapbox.featureLayer().addTo(map);

        var geoJson = [{
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-97.380979, 42.877742 ]
            },
            properties: {
                title: 'Interface Foundry',
                description: '902 Broadway 6F New York, NY 10010',
                icon: {
                    iconUrl: "assets/images/bubblimarker.png",
                    iconSize: [31, 41], // size of the icon
                    iconAnchor: [0, 50], // point of the icon which will correspond to marker's location
                    popupAnchor: [16, -43], // point from which the popup should open relative to the iconAnchor
                    className: "dot"
                }
            }
        }];

        // Set a custom icon on each marker based on feature properties.
        myLayer.on('layeradd', function(e) {
            var marker = e.layer,
                feature = marker.feature;

            marker.setIcon(L.icon(feature.properties.icon));

             marker.openPopup();
        });

        // Add features to the map.
        myLayer.setGeoJSON(geoJson);

        var credits = L.control.attribution().addTo(map);
        credits.addAttribution('IF Maps');


        $scope.options = [{
          name: 'nordstrom.com',
          value: 'linkback',
        }, 
        {
          name: 'urbanoutfitters.com',
          value: 'linkback'
        },
        {
          name: 'zara.com',
          value: 'linkback'
        },
        {
          name: 'menswearhouse.com',
          value: 'linkback'
        },
        {
          name: 'shoptiques.com',
          value: 'linkback'
        },
        {
          name: 'instagram',
          value: 'instasource'
        }
        ];

        $scope.selectedOption = $scope.options[0];

        $scope.$watch('selectedOption', function(v) {
            getItems(v.name,v.value);
          // for (var i in $scope.options) {
          //   var option = $scope.options[i];
          //   if (option.name === v) {
          //     $scope.selectedOption = option;
          //     break;
          //   }
          // }

        });

        function getItems(name,val){
            var data = {
                name:name,
                val:val
            }
            
            $http.post('/query',data).
            then(function(res) {        
                console.log(res);
            });

            // if (val == 'linkback'){



            // }
            // else if (val == 'instasource'){
            //     //{'source_instagram_post.id': {$exists: true}}
            // }


            
        }


    //* * * * * * * * *  * * * * * * * * * * * * * *
    //     RUN KIP

    // if ($routeParams.query) { //process a search query //this is a search from URL
    //     $scope.query = decodeURI($routeParams.query);
    //     $scope.userCity = decodeURI($routeParams.cityName);
    //     userLat = $routeParams.lat;
    //     userLng = $routeParams.lng;
    //     $scope.searchItems();
    // } else if ($routeParams.mongoId) { //process singleItem
    //     $scope.mongoId = decodeURI($routeParams.mongoId);

    //     $scope.parentId = decodeURI($routeParams.parentId);

    //            //get location from IP
    //     $http.get('https://kipapp.co/styles/api/geolocation').
    //     then(function(res) {
    //         if (res.data.lat === 38) {
    //           $('#locInput').geocomplete("find", "NYC");
    //           return;
    //         }
    //         userLat = res.data.lat;
    //         userLng = res.data.lng;

    //         //get neighborhood name via lat lng from google
    //         $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+res.data.lat+','+res.data.lng+'&sensor=true').
    //         then(function(res2) {
    //             for (var i = 0; i < res2.data.results.length; i++) {
    //                 if (res2.data.results[i].geometry.location_type == 'APPROXIMATE'){
    //                     res2.data.results[i].formatted_address = res2.data.results[i].formatted_address.replace(", USA", ""); //remove COUNTRY from USA rn (temp)
    //                     $scope.userCity = res2.data.results[i].formatted_address;
    //                     historyCity = $scope.userCity;
    //                     $scope.loadingLoc = false;
    //                     break;
    //                 }
    //             }
    //         }, function() {
    //         });

    //     }, function(res) {
    //         //if IP broken get HTML5 geoloc
    //         $scope.getGPSLocation();
    //     });        

    //     $scope.searchOneItem();
    // } else {
    //     //get location from IP
    //     $http.get('https://kipapp.co/styles/api/geolocation').
    //     then(function(res) {
    //         if (res.data.lat === 38) {
    //             $('#locInput').geocomplete("find", "NYC");
    //             return;
    //         }
    //         userLat = res.data.lat;
    //         userLng = res.data.lng;

    //         //get neighborhood name via lat lng from google
    //         $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + res.data.lat + ',' + res.data.lng + '&sensor=true').
    //         then(function(res2) {
    //             for (var i = 0; i < res2.data.results.length; i++) {
    //                 if (res2.data.results[i].geometry.location_type == 'APPROXIMATE') {
    //                     res2.data.results[i].formatted_address = res2.data.results[i].formatted_address.replace(", USA", ""); //remove COUNTRY from USA rn (temp)
    //                     $scope.userCity = res2.data.results[i].formatted_address;
    //                     historyCity = $scope.userCity;
    //                     $scope.loadingLoc = false;
    //                     break;
    //                 }
    //             }
    //         }, function() {});

    //     }, function(res) {
    //         //if IP broken get HTML5 geoloc
    //         $scope.getGPSLocation();
    //     });

    //     //check if mobile or tablet. warning: there is no perfect way to do this, so need to keep testing on this.
    //     //via: http://jstricks.com/detect-mobile-devices-javascript-jquery/
    //     if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    //         $scope.getGPSLocation(); //get GPS loc cause mobile device
    //         $scope.hideGPSIcon = true;
    //     }
    // }



    // angular.element(document).ready(function() {
    //     $scope.windowHeight = $window.height + 'px'; //position
    //     $scope.windowWidth = window.width + 'px';
    // });

}]);


