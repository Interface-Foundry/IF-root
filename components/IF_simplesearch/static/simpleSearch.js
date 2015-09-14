var simpleSearchApp = angular.module('simpleSearchApp',[]);

simpleSearchApp.controller('SimpleSearchCtrl', function ($scope, $http, $location) {

    console.log('Want to API with us? Get in touch: hello@interfacefoundry.com');
    // * * * * * * * * ** * * * * * * * * * 
    //ON LOAD PAGE, first get IP loc. banner pop up, get more accurate results? use GPS?
    //popup little menu after search with miles adjuster & button to get GPS results
    //* * * * * * * * * * * * * * * * * * * 

    var userLat;
    var userLng;

    $scope.windowHeight = $(window).height();

    $http.get('https://kipapp.co/api/geolocation').
        then(function(res) {
            userLat = res.lat; 
            userLng = res.lng;
            $scope.userCity = res.cityName;

        }, function(res) {
            //if IP broken get HTML5 geoloc
            $scope.getLocation();
        });

    $scope.getLocation = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            console.log('no geolocation support');
        }
    }
    function showPosition(position) {
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;
    }



    $scope.searchQuery = function(){

        //* * * * * * * * * * * * * 
        //CHANGE CSS SO SEARCH BAR ON TOP OF PAGE NOW

        //Tap images to see more?
        //* * * * * * * * * * * * * 
        $http.post('https://kipapp.co/styles/api/items/search', {
            text: $scope.query,
            loc: {lat: userLat, lon: userLng},
            radius: 2,
        }).
            then(function(response) {

                //* * * * * * * * * * * * * 
                //if no results, re-query with US size radius
                //* * * * * * * * * * * * * 

                $scope.items = response.data.results;

                console.log($scope.items);

                if ($scope.items && $scope.items.length){
                    for (var i = 0; i < $scope.items.length; i++) {    
                        //filter out usernames
                        if ($scope.items[i].loc){ 

                            //make link for directions URL
                            $scope.items[i].directionsURL = $scope.items[i].loc.coordinates[1] + ',' + $scope.items[i].loc.coordinates[0];

                            //calculate distance btwn user and items
                            var distance = calcDistance( //haversine
                                $scope.items[i].loc.coordinates[1],$scope.items[i].loc.coordinates[0],userLat,userLng
                                );
                            $scope.items[i].distanceKM = roundFloat(distance,1); //distance in kilometers to 1 decimal
                            //convert from km to miles
                            var miles = distance * 1000; //km to m
                            miles = miles * 0.000621371192; //meters to miles
                            $scope.items[i].distanceMI = roundFloat(miles,1); //distance in miles                           
                        }

                    }
                }

        }, function(response) {

        });

    };




});

function calcDistance(lat2,lon2,lat1,lon1){
    //haversine formula
    //http://stackoverflow.com/a/14561433/665082
   var radians = Array.prototype.map.call(arguments, function(deg) { return deg/180.0 * Math.PI; });
   var lat1 = radians[0], lon1 = radians[1], lat2 = radians[2], lon2 = radians[3];
   var R = 6372.8; // km
   var dLat = lat2 - lat1;
   var dLon = lon2 - lon1;
   var a = Math.sin(dLat / 2) * Math.sin(dLat /2) + Math.sin(dLon / 2) * Math.sin(dLon /2) * Math.cos(lat1) * Math.cos(lat2);
   var c = 2 * Math.asin(Math.sqrt(a));
   return R * c;  
}

function roundFloat(value, exp) {
    //http://stackoverflow.com/a/21323330/665082
  if (typeof exp === 'undefined' || +exp === 0)
    return Math.round(value);
  value = +value;
  exp  = +exp;
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
    return NaN;
  // Shift
  value = value.toString().split('e');
  value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));
  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
}


//auto focus the search input box
simpleSearchApp.directive('autoFocus', function($timeout) {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
            $timeout(function(){
                _element[0].focus();
            }, 0);
        }
    };
});

// app.directive('hires', function() {
//   return {
//     restrict: 'A',
//     scope: { hires: '@' },
//     link: function(scope, element, attrs) {
//         element.one('load', function() {
//             element.attr('src', scope.hires);
//         });
//     }
//   };
// });

