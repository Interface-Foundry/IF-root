var simpleSearchApp = angular.module('simpleSearchApp',[]);

simpleSearchApp.controller('SimpleSearchCtrl', function ($scope, $http, $location, $document) {

    console.log('Want to API with us? Get in touch: hello@interfacefoundry.com');
    // * * * * * * * * ** * * * * * * * * * 
    //ON LOAD PAGE, first get IP loc. banner pop up, get more accurate results? use GPS?
    //popup little menu after search with miles adjuster & button to get GPS results
    //* * * * * * * * * * * * * * * * * * * 

    var userLat;
    var userLng;
    $scope.showGPS = true;
    $scope.locationMsg = 'Use precise location';
    $scope.itemHighlight = "form-grey";
    $scope.locationHighlight = "form-grey";


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

        //get neighborhood name via lat lng from google
        $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng='+userLat+','+userLng+'&sensor=true').
            then(function(res) {
                for (var i = 0; i < res.data.results.length; i++) {   
                    if (res.data.results[i].geometry.location_type == 'APPROXIMATE'){ 
                        res.data.results[i].formatted_address = res.data.results[i].formatted_address.replace(", USA", ""); //remove COUNTRY from USA rn (temp)
                        $scope.userCity = res.data.results[i].formatted_address;
                        break;                               
                    }
                }
                $scope.locationMsg = 'Update Location';
            }, function(res) {
                //if IP broken get HTML5 geoloc
                //$scope.getLocation();
            });
    }

    //why isn't this working to update ng-class :\ can't unselect input box right now
    document.onclick= function(e) {
        $scope.itemHighlight = "form-grey"; 
        $scope.locationHighlight = "form-grey"; 
    };

    $scope.toggleHighlight = function($event){
         
        if ($event.currentTarget.id == 'search_item'){
            if ($scope.itemHighlight === "form-grey"){
                $scope.itemHighlight = "form-highlight";
                $scope.locationHighlight = "form-grey";
            }
            $event.stopPropagation();

        }
        else if ($event.currentTarget.id == 'search_location'){
            if ($scope.locationHighlight === "form-grey"){
                $scope.locationHighlight = "form-highlight";
                $scope.itemHighlight = "form-grey";
            }
            $event.stopPropagation();
        }
        else {
            $scope.itemHighlight = "form-grey";
            $scope.locationHighlight = "form-grey"; 
        }

    }

    $scope.randomSearch = function(query){
        var tempRandomTrends = ['70s','vintage','fur','orange','health goth'];
        $scope.query = tempRandomTrends[Math.floor(Math.random()*tempRandomTrends.length)];
        $scope.searchQuery();
    }

    $scope.searchThis = function(query){
        $scope.query = query;
        $scope.searchQuery();
    }

    $scope.searchQuery = function(){

        //* * * * * * * * * * * * * 
        //CHANGE CSS SO SEARCH BAR ON TOP OF PAGE NOW

        //Tap images to see more?
        //* * * * * * * * * * * * * 
        $http.post('https://kipapp.co/styles/api/items/search', {
            text: $scope.query,
            loc: {lat: userLat, lon: userLng},
            radius: 5,
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

                //if not mobile, move query bar to top of page
                // if (window.innerWidth > 992){
                    $scope.showQueryBar = true;
                // }

                //console.log($document[0].body.scrollHeight);

                $scope.windowHeight = $document[0].body.scrollHeight;




        }, function(response) {

        });

    };


    angular.element(document).ready(function () {
        $scope.windowHeight = window.innerHeight;
        //console.log($scope.windowHeight);
    });



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

simpleSearchApp.directive('afterResults', function($document) {
    return {
        restrict: "E",
        replace: true,
        scope: {
            windowHeight:'='
        },
        link: function(scope, element, attrs) {
            console.log(scope.$parent.windowHeight);
            if (scope.$parent.$last){
                // console.log(scope.windowHeight);
                // console.log($document[0].body.scrollHeight);
                // console.log($document[0].body.clientHeight);

                scope.windowHeight = $document[0].body.clientHeight;
                console.log(scope.windowHeight);
            }
        }
    };
});

simpleSearchApp.directive('selectOnClick', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                if (!$window.getSelection().toString()) {
                    // Required for mobile Safari
                    this.setSelectionRange(0, this.value.length)
                }
            });
        }
    };
}]);

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

