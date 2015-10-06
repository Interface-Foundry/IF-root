var simpleSearchApp = angular.module('simpleSearchApp', ['ngHolder', 'angularMoment', 'ngRoute', 'angular-inview', 'smoothScroll'])
    .filter('httpsURL', function() {

        return function(input) {
            if (input.indexOf('https') > -1) {
                //do nothing
            } else {
                var regex = /http/gi;
                input = input.replace(regex, 'https');
            }
            return input;
        }
    })
    .filter('deCapslock', function() {
        return function(input) {
            input = input.toLowerCase();
            var reg = /\s((a[lkzr])|(c[aot])|(d[ec])|(fl)|(ga)|(hi)|(i[dlna])|(k[sy])|(la)|(m[edainsot])|(n[evhjmycd])|(o[hkr])|(pa)|(ri)|(s[cd])|(t[nx])|(ut)|(v[ta])|(w[aviy]))$/;
            var state = input.match(reg);
            if (state !== null) {
                state = state[0].toUpperCase();
                input = input.replace(reg, state);
            }
            return input;
        }
    })
    .factory('location', [
        '$location',
        '$route',
        '$rootScope',
        function($location, $route, $rootScope) {
            $location.skipReload = function() {
                var lastRoute = $route.current;
                var un = $rootScope.$on('$locationChangeSuccess', function() {
                    $route.current = lastRoute;
                    un();
                });
                return $location;
            };
            return $location;
        }
    ])
    .factory('storeFactory', function() {
        return {
            store: {},
            setStore: function(newStore) {
                this.store = newStore;
            }
        }
    })
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'partials/home.html',
                controller: 'HomeCtrl'
            })
            .when('/q/:query/:lat/:lng/:cityName', {
                templateUrl: 'partials/results.html',
                controller: 'HomeCtrl'
            })
            //Individual page
            //add place ID parameter
            //Add address/ phone # and store name, hours on this page
            .when('/t/:parentId/:mongoId', {
                templateUrl: 'partials/item.html',
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

simpleSearchApp.controller('HomeCtrl', ['$scope', '$http', '$location', '$document', '$timeout', '$interval', 'amMoment', '$window', '$routeParams', 'location', '$rootScope', '$route', 'storeFactory', function($scope, $http, $location, $document, $timeout, $interval, amMoment, $window, $routeParams, location, $rootScope, $route, storeFactory) {

    console.log('Want to API with us? Get in touch: hello@interfacefoundry.com');
    // * * * * * * * * ** * * * * * * * * *
    //ON LOAD PAGE, first get IP loc. banner pop up, get more accurate results? use GPS?
    //popup little menu after search with miles adjuster & button to get GPS results
    //* * * * * * * * * * * * * * * * * * *

    var userLat;
    var userLng;
    var historyCity;
    var resultsContainer;
    var httpBool = false;
    var xDown = null;
    var yDown = null;
    var swipeActive = false;

    $scope.showGPS = true;
    $scope.searchIndex = 0;
    $scope.items = [];
    $scope.newQuery = null;
    $scope.expandedIndex = null;
    $scope.isExpanded = false;
    $scope.outerWidth = $(window)[0].outerWidth;
    $scope.outerHeight = $(window)[0].outerHeight;
    $scope.mobileModalHeight;
    $scope.mobileFooterPos;
    $scope.mobileScreen = false;
    $scope.mobileScreenIndex;
    $scope.showReportModal = null;
    $scope.report = {};
    $scope.mobileImgIndex = 0;
    $scope.mobileImgCnt = 0;
    $scope.parent = storeFactory.store;

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        $scope.mobileScreen = true;
    }

    $rootScope.$on('$locationChangeState', function(event) {
        event.preventDefault();
    });
    //Fix here
    $scope.returnHome = function(loc) {
        if (loc === 'home') {
            $location.path('/');
            $timeout(function() {
                $route.reload();
            }, 0);
            $route.reload();
        } else if (loc._id) {
            $location.path('/t/' + loc.parent._id + '/' + loc._id);
            storeFactory.setStore(loc.parent)
            console.log('storeFactory: ', storeFactory, 'loc: ', loc)
            $timeout(function() {
                $route.reload();
            }, 0);
        }
    }

    $scope.emptyQuery = function() {
        $scope.query = '';
    }

    $scope.sayHello = function() {
        if (!httpBool) {
            $scope.searchQuery();
        }
    }

    $scope.closeMobileWrapper = function(index) {
        if ($scope.mobileScreen) {
            var el = $('.expandMobileWrapper.mWrapper' + index);
            el.css({
                'width': '' + $scope.outerWidth + 'px',
                'height': '0'
            });
            $scope.mobileScreenIndex = null;
        }
    }

    $scope.chooseImage = function(index) {
        $scope.mobileImgIndex = index;
    }

    $scope.singleItemMobile = function(index, imgCnt, item) {
        //        console.log(item);
        $timeout(function() {
            $scope.mobileModalHeight = $('#expandedModal' + index)[0].clientHeight + ((imgCnt - 1) * 40);
            var thumbs = $('#thumbContainer' + index);
            thumbs.css({
                'bottom': $scope.mobileModalHeight
            });
        }, 100);
    }

    $scope.expandContent = function(index, event, imgCnt) {
        if ($scope.mobileScreen) {
            if (event === 'close') {
                $scope.mobileScreenIndex = null;
                $('body').removeClass('modalOpen');
                $('html').removeClass('modalOpen');
                $('div.container-fluid').removeClass('modalOpen');
                $(window).off();
                $(window).off();
                $scope.mobileImgIndex = 0;
                $scope.mobileModalHeight = 0;
            } else {
                $timeout(function() {
                    $scope.mobileModalHeight = $('#expandedModal' + index)[0].clientHeight + ((imgCnt - 1) * 40);
                    var thumbs = $('#thumbContainer' + index);
                    thumbs.css({
                        'bottom': $scope.mobileModalHeight
                    });
                }, 100);
                $scope.mobileScreenIndex = index;
                $('body').addClass('modalOpen');
                $('html').addClass('modalOpen');
                $('div.container-fluid').addClass('modalOpen');
                $(window).on('touchstart', function(event) {
                    //                console.log('start', event.originalEvent.targetTouches[0].clientX);
                    xDown = event.originalEvent.targetTouches[0].clientX;
                    yDown = event.originalEvent.targetTouches[0].clientY;
                });

            }

        } else {
            if ($scope.expandedIndex === index) {
                $scope.expandedIndex = null;
                $('.row' + index).removeClass('expand');
                $scope.isExpanded = false;
            } else if ($scope.expandedIndex !== null) {
                $('.row' + $scope.expandedIndex).removeClass('expand');
                $('.row' + index).addClass('expand');
                $scope.expandedIndex = index;
            } else {
                $('.row' + index).addClass('expand');
                $scope.expandedIndex = index;
            }
        }

    }

    $(window).on('click', function(event) {
        if (event.target.className === "collapsedContent") {
            $('.row' + $scope.expandedIndex).removeClass('expand');
            $scope.expandedIndex = null;
        }
    })

    $scope.enlargeImage = function(parIndex, imgIndex) {
        //        console.log(parIndex, imgIndex);
        if ($scope.mobileScreen) {
            $('.mobileImg' + parIndex).css({
                'background-image': "url(" + imgIndex + ")"
            });
        } else {
            $('.largeImage' + parIndex).css({
                'background-image': "url(" + imgIndex + ")"
            });
        }
    }

    $('#locInput').geocomplete({
        details: 'form',
        types: ['geocode']
    }).bind("geocode:result", function(event, result) {
        $scope.userCity = result.formatted_address;
        $scope.newQuery = true;
    });


    //* * * * * * * * *
    // LOAD FUNCTIONS

    //get loc from GPS
    $scope.getGPSLocation = function() {
        $scope.loadingLoc = true;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            console.log('no geolocation support');
        }
    }

    function showPosition(position) {
        console.log(position);
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;

        //get neighborhood name via lat lng from google
        $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + userLat + ',' + userLng + '&sensor=true').
        then(function(res) {
            for (var i = 0; i < res.data.results.length; i++) {
                if (res.data.results[i].geometry.location_type == 'APPROXIMATE') {
                    res.data.results[i].formatted_address = res.data.results[i].formatted_address.replace(", USA", ""); //remove COUNTRY from USA rn (temp)
                    $scope.userCity = res.data.results[i].formatted_address;
                    historyCity = $scope.userCity;
                    $scope.loadingLoc = false;

                    break;
                }
            }
        }, function(res) {
            //if IP broken get HTML5 geoloc
            //$scope.getLocation();
        });
    }

    //why isn't this working to update ng-class :\ can't unselect input box right now
    document.onclick = function(e) {
        $scope.itemHighlight = "form-grey";
        $scope.locationHighlight = "form-grey";
    };


    $scope.scrollTop = function() {
        $location.hash('topQueryBar');
        $anchorScroll();
    }

    $scope.randomSearch = function(query) {
        var tempRandomTrends = ['70s', 'vintage', 'fur', 'orange', 'health goth'];
        $scope.query = tempRandomTrends[Math.floor(Math.random() * tempRandomTrends.length)];
        $scope.searchQuery();
    }

    $scope.searchThis = function(query) {
        $scope.query = query;
        $scope.searchQuery();
    }

    $scope.searchQuery = function(type) {
        if (type === 'button') {
            $scope.items = [];
            $scope.searchIndex = 0;
            $('input').blur();
        }

        httpBool = true;

        //* * * * * * * * * * * * *
        //Tap images to see more?
        //* * * * * * * * * * * * *

        //check if location was modified by user
        if ($scope.userCity !== historyCity) {

            historyCity = $scope.userCity;
            var encodeCity = encodeURI(historyCity);

            $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeCity + '&key=AIzaSyCABdI8Lpm5XLQZh-O4SpmShqMEKqKteUg').
            then(function(res) {

                if (res.data.results[0] && res.data.results[0].geometry) {
                    userLat = res.data.results[0].geometry.location.lat;
                    userLng = res.data.results[0].geometry.location.lng;
                }



                //put in new lat/lng then fire searchItems();
                $scope.searchItems();


                // userLat = res.data.lat;
                // userLng = res.data.lng;

                // historyLat = userLat;
                // historyLng = userLng;
                // $scope.userCity = res.data.cityName;

            }, function(res) {
                //if IP broken get HTML5 geoloc
                //$scope.getGPSLocation();
            });



        } else {
            $scope.searchItems();
        }

    };

    //https://kipapp.co/styles/api/items/search?page=
    //http://pikachu.kipapp.co/api/items/search?page



    $scope.searchItems = function() {
        var encodeQuery = null;
        var encodeCity = null;

        var encodeQuery = encodeURI($scope.query);
        var encodeCity = encodeURI($scope.userCity);

        $location.path('/q/' + encodeQuery + '/' + userLat + '/' + userLng + '/' + encodeCity);
        if ($scope.newQuery) {

            $scope.newQuery = false;
        }

        $http.post('https://kipapp.co/styles/api/items/search?page=' + $scope.searchIndex, {
            text: $scope.query,
            loc: {
                lat: userLat,
                lon: userLng
            },
            radius: 5,
        }).
        then(function(response) {

            //                location.path('/q/'+ encodeQuery + '/' + userLat + '/' + userLng + '/' + encodeCity);
            location.skipReload().path('/q/' + encodeQuery + '/' + userLat + '/' + userLng + '/' + encodeCity).replace();
            //* * * * * * * * * * * * *
            //if no results, re-query with US size radius
            //* * * * * * * * * * * * *

            $scope.items = $scope.items.concat(response.data.results);

            if ($scope.items.length < 1) {
                $scope.noResults = true;
                console.log('no results');
            }

            //                console.log('data', response.data);

            if ($scope.items && $scope.items.length) {
                $scope.noResults = false;
                for (var i = 0; i < $scope.items.length; i++) {

                    //remove user objects
                    if (!$scope.items[i].owner) {
                        $scope.items.splice(i, 1);
                    }

                    // if num of images is greater than 6, remove imgs from middle of array
                    if ($scope.items[i].itemImageURL.length > 6) {
                        var counter = $scope.items[i].itemImageURL.length - 6;
                        var imageArray = $scope.items[i].itemImageURL;
                        var midIndex = imageArray.length / 2;
                        imageArray = imageArray.splice(midIndex, 2);
                    }

                    // normalize phone numbers
                    if ($scope.items[i].parent.tel) {
                        var tmpTel = $scope.items[i].parent.tel;
                        tmpTel = tmpTel.replace(/[+-\s]/g, '');

                        if (tmpTel.length === 11) {
                            tmpTel = tmpTel.replace(/^1/g, '');
                        }
                        $scope.items[i].parent.tel = tmpTel.slice(0, 3) + '-' + tmpTel.slice(2, 5) + '-' + tmpTel.slice(6);
                    }
                    //filter out usernames
                    if ($scope.items[i].loc && !$scope.items[i].profileID) {

                        //make link for directions URL
                        $scope.items[i].directionsURL = $scope.items[i].loc.coordinates[1] + ',' + $scope.items[i].loc.coordinates[0];

                        //calculate distance btwn user and items
                        var distance = calcDistance( //haversine
                            $scope.items[i].loc.coordinates[1], $scope.items[i].loc.coordinates[0], userLat, userLng
                        );
                        $scope.items[i].distanceKM = roundFloat(distance, 1); //distance in kilometers to 1 decimal
                        //convert from km to miles
                        var miles = distance * 1000; //km to m
                        miles = miles * 0.000621371192; //meters to miles
                        $scope.items[i].distanceMI = roundFloat(miles, 1); //distance in miles
                    } else {
                        if (i > -1) { //remove users from results
                            $scope.items.splice(i, 1);
                        }
                    }

                }
            }

            $scope.showQueryBar = true;
            $scope.windowHeight = $document[0].body.scrollHeight;

            $timeout(function() {
                $("img.holderPlace").lazyload();
                $scope.searchIndex++;
                resultsContainer = $('div.resultsContainer');
                resultsContainer = resultsContainer[0].clientHeight;
                httpBool = false;
            }, 500);

            $('#locInputTop').geocomplete({
                details: 'form',
                types: ['geocode']
            }).bind("geocode:result", function(event, result) {
                $scope.userCity = result.formatted_address;
                $scope.newQuery = true;
            });

        }, function(response) {

        });
    }

    $scope.searchOneItem = function() {

        // console.log('asdf');


        $scope.mongoId = $scope.mongoId.replace(/[^\w\s]/gi, ''); //remove special char
        $scope.mongoId = $scope.mongoId.replace(/\s+/g, ' ').trim(); //remove extra spaces

        var encodedMongoId = encodeURI($scope.mongoId);

        $scope.parentId = $scope.parentId.replace(/[^\w\s]/gi, ''); //remove special char
        $scope.parentId = $scope.parentId.replace(/\s+/g, ' ').trim(); //remove extra spaces

        var encodedParentId = encodeURI($scope.parentId);

        $location.path('/t/' + encodedParentId + '/' + encodedMongoId);
        // if ($scope.newQuery) {
        //     $scope.newQuery = false;
        // }

        $http.get('https://kipapp.co/styles/api/items/' + $scope.mongoId, {}).
        then(function(response) {

            //location.path('/t/'+ encodeId);
            //location.skipReload().path('/q/'+ encodeQuery + '/' + userLat + '/' + userLng + '/' + encodeCity).replace();
            //* * * * * * * * * * * * *
            //if no results, re-query with US size radius
            //* * * * * * * * * * * * * 

            //  console.log(response.data.item);

            // $scope.items = response.data.item ;
            $scope.items = $scope.items.concat(response.data.item);

            if ($scope.items.length < 1) {
                $scope.noResults = true;
                console.log('no results');
            }

            //                console.log('data', response.data);

            if ($scope.items && $scope.items.length) {
                $scope.noResults = false;
                for (var i = 0; i < $scope.items.length; i++) {

                    // normalize phone numbers
                    if ($scope.items[i].parent.tel) {
                        var tmpTel = $scope.items[i].parent.tel;
                        tmpTel = tmpTel.replace(/[+-\s]/g, '');

                        if (tmpTel.length === 11) {
                            tmpTel = tmpTel.replace(/^1/g, '');
                        }

                        $scope.items[i].parent.tel = tmpTel.slice(0, 3) + '-' + tmpTel.slice(2, 5) + '-' + tmpTel.slice(6);

                    }
                    //filter out usernames
                    if ($scope.items[i].loc && !$scope.items[i].profileID) {

                        //make link for directions URL
                        $scope.items[i].directionsURL = $scope.items[i].loc.coordinates[1] + ',' + $scope.items[i].loc.coordinates[0];

                        //calculate distance btwn user and items
                        var distance = calcDistance( //haversine
                            $scope.items[i].loc.coordinates[1], $scope.items[i].loc.coordinates[0], userLat, userLng
                        );
                        $scope.items[i].distanceKM = roundFloat(distance, 1); //distance in kilometers to 1 decimal
                        //convert from km to miles
                        var miles = distance * 1000; //km to m
                        miles = miles * 0.000621371192; //meters to miles
                        $scope.items[i].distanceMI = roundFloat(miles, 1); //distance in miles
                    } else {
                        if (i > -1) { //remove users from results
                            $scope.items.splice(i, 1);
                        }
                    }

                }
            }

            $scope.showQueryBar = true;
            $scope.windowHeight = $document[0].body.scrollHeight;

            // $timeout(function() {
            //     $("img.holderPlace").lazyload();
            //     $scope.searchIndex++;
            //     resultsContainer = $('div.resultsContainer');
            //     resultsContainer = resultsContainer[0].clientHeight;
            //     httpBool = false;
            // }, 500);

            $('#locInputTop').geocomplete({
                details: 'form',
                types: ['geocode']
            }).bind("geocode:result", function(event, result) {
                $scope.userCity = result.formatted_address;
                $scope.newQuery = true;
            });

        }, function(response) {

        });
    }

    $scope.reportItem = function(status, item, index) {
        if (status === 'open') {
            $scope.showReportModal = index;
        } else if (status === 'close') {
            $scope.showReportModal = null;
        } else if (status === 'submit') {
            $http.post('https://kipapp.co/styles/api/items/' + item._id + '/report', {
                timeReported: new Date(),
                comment: $scope.report.comment,
                reason: $scope.report.reason
            }).then(function(res) {
                $timeout(function() {
                    $scope.showReportModal = null;
                }, 15000);
                //                console.log('res', res);
                if (res.data.err) {

                } else {}
            });

        }

    }

    //* * * * * * * * *  * * * * * * * * * * * * * *
    //     RUN KIP

    if ($routeParams.query) { //process a search query //this is a search from URL
        $scope.query = decodeURI($routeParams.query);
        $scope.userCity = decodeURI($routeParams.cityName);
        userLat = $routeParams.lat;
        userLng = $routeParams.lng;
        $scope.searchItems();
    } else if ($routeParams.mongoId) { //process singleItem
        $scope.mongoId = decodeURI($routeParams.mongoId);
        $scope.parentId = decodeURI($routeParams.parentId);
        $scope.searchOneItem();
    } else {
        //get location from IP
        $http.get('https://kipapp.co/styles/api/geolocation').
        then(function(res) {
            if (res.data.lat === 38) {
                $('#locInput').geocomplete("find", "NYC");
                return;
            }
            userLat = res.data.lat;
            userLng = res.data.lng;

            //get neighborhood name via lat lng from google
            $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + res.data.lat + ',' + res.data.lng + '&sensor=true').
            then(function(res2) {
                for (var i = 0; i < res2.data.results.length; i++) {
                    if (res2.data.results[i].geometry.location_type == 'APPROXIMATE') {
                        res2.data.results[i].formatted_address = res2.data.results[i].formatted_address.replace(", USA", ""); //remove COUNTRY from USA rn (temp)
                        $scope.userCity = res2.data.results[i].formatted_address;
                        historyCity = $scope.userCity;
                        $scope.loadingLoc = false;
                        break;
                    }
                }
            }, function() {});

        }, function(res) {
            //if IP broken get HTML5 geoloc
            $scope.getGPSLocation();
        });

        //check if mobile or tablet. warning: there is no perfect way to do this, so need to keep testing on this.
        //via: http://jstricks.com/detect-mobile-devices-javascript-jquery/
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            $scope.getGPSLocation(); //get GPS loc cause mobile device
            $scope.hideGPSIcon = true;
        }
    }



    angular.element(document).ready(function() {
        $scope.windowHeight = $window.height + 'px'; //position
        $scope.windowWidth = window.width + 'px';
    });

}]);


function calcDistance(lat2, lon2, lat1, lon1) {
    //haversine formula
    //http://stackoverflow.com/a/14561433/665082
    var radians = Array.prototype.map.call(arguments, function(deg) {
        return deg / 180.0 * Math.PI;
    });
    var lat1 = radians[0],
        lon1 = radians[1],
        lat2 = radians[2],
        lon2 = radians[3];
    var R = 6372.8; // km
    var dLat = lat2 - lat1;
    var dLon = lon2 - lon1;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.asin(Math.sqrt(a));
    return R * c;
}

function roundFloat(value, exp) {
    //http://stackoverflow.com/a/21323330/665082
    if (typeof exp === 'undefined' || +exp === 0)
        return Math.round(value);
    value = +value;
    exp = +exp;
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
simpleSearchApp.directive('autoFocus', ['$timeout', function($timeout) {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
            $timeout(function() {
                _element[0].focus();
            }, 0);
        }
    };
}]);

simpleSearchApp.directive('afterResults', ['$document', function($document) {
    return {
        restrict: "E",
        replace: true,
        scope: {
            windowHeight: '='
        },
        link: function(scope, element, attrs) {
            console.log(scope.$parent.windowHeight);
            if (scope.$parent.$last) {
                // console.log(scope.windowHeight);
                // console.log($document[0].body.scrollHeight);
                // console.log($document[0].body.clientHeight);

                scope.windowHeight = $document[0].body.clientHeight;
                console.log(scope.windowHeight);
            }
        }
    };
}]);

simpleSearchApp.directive('selectOnClick', ['$window', function($window) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.on('click', function() {
                if (!$window.getSelection().toString()) {
                    // Required for mobile Safari
                    this.setSelectionRange(0, this.value.length)
                }
            });
        }
    };
}]);

simpleSearchApp.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter, {
                        'event': event
                    });
                });

                event.preventDefault();
            }
        });
    };
});

simpleSearchApp.directive('tooltip', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).hover(function() {
                // on mouseenter
                $(element).tooltip('show');
            }, function() {
                // on mouseleave
                $(element).tooltip('hide');
            });
        }
    };
});

simpleSearchApp.service('searchQuery', function() {
        var searchParams = [];

        var addSearch = function(newObj) {
            searchParams = [];
            searchParams.push(newObj);
        };

        var getSearch = function() {
            return searchParams;
        };

        return {
            addSearch: addSearch,
            getSearch: getSearch
        };

    })
    // simpleSearchApp.directive('stringToTimestamp', function() {
    //         return {
    //             require: 'ngModel',
    //             link: function(scope, ele, attr, ngModel) {
    //                 // view to model
    //                 ngModel.$parsers.push(function(value) {
    //                     return Date.parse(value);
    //                 });
    //             }
    //         }
    //     });
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