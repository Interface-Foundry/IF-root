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

        //$scope.selectedOption = $scope.options[1];

        $scope.$watch('selectedOption', function(v) {
            if (v.name){
              getItems(v.name,v.value);  
            }
            
          // for (var i in $scope.options) {
          //   var option = $scope.options[i];
          //   if (option.name === v) {
          //     $scope.selectedOption = option;
          //     break;
          //   }
          // }

        });

        function getItems(name,val){

            $scope.itemCount = '...';
            $scope.loading = true;

            var data = {
                name:name,
                val:val
            }
            
            $http.post('/query',data).
            then(function(res) {        
                console.log(res);

                var markers = new L.MarkerClusterGroup();

                for (var i = 0; i < res.data.length; i++) {
                    var marker = L.marker(new L.LatLng(res.data[i].lat, res.data[i].lng), {
                        icon: L.mapbox.marker.icon({'marker-symbol': 'post', 'marker-color': '0044FF'}),
                        title: res.data[i].name
                    });
                    marker.bindPopup('<p>'+res.data[i].name+'<br>Item Id: '+res.data[i].item_id+'<br>Parent Id: '+res.data[i].parent_id+'</p>');
                    markers.addLayer(marker);
                }

                $scope.itemCount = res.data.length;
                map.addLayer(markers);
                $scope.loading = false;

            });
            
        }



}]);


