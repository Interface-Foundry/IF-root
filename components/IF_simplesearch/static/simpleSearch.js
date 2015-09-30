var simpleSearchApp = angular.module('simpleSearchApp',['ngHolder','angularMoment','ngRoute', 'angular-inview', 'smoothScroll'])

.factory('location', [
    '$location',
    '$route',
    '$rootScope',
    function ($location, $route, $rootScope) {
        $location.skipReload = function () {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
            return $location;
        };
        return $location;
    }
])
.config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/home.html',
        controller: 'HomeCtrl'
      })
      .when('/q/:query/:lat/:lng/:cityName', {
        templateUrl: 'partials/results.html',
        controller: 'HomeCtrl'
      })
      .when('/t/:mongoId', {
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
  });




simpleSearchApp.controller('HomeCtrl', function ($scope, $http, $location, $document, $timeout, $interval, amMoment, $window, $routeParams, location, $rootScope) {

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

    $scope.showGPS = true;
    $scope.searchIndex = 0;
    $scope.items = [];
    $scope.newQuery = null;
    $scope.expandedIndex = null;
    $scope.isExpanded = false;
    $scope.outerWidth = $(window)[0].outerWidth;
    $scope.mobileFooterPos;
    $scope.mobileScreen = false;
    $scope.mobileScreenIndex;
    $scope.showReportModal = null;
    $scope.report = {};

    $rootScope.$on('$locationChangeState', function(event) {
        event.preventDefault();
    });

    $scope.returnHome = function() {
        $location.path('/partials/home.html');
        $scope.items = [];
    }
    
    $scope.emptyQuery = function() {
        $scope.query = '';   
    }

    if ($scope.outerWidth < 651) {
        $scope.mobileScreen = true;
    }

    $scope.sayHello = function() {
        if (!httpBool) {
                $scope.searchQuery();
        }
    }

    $scope.closeMobileWrapper = function(index) {
        if ($scope.mobileScreen) {
            var el = $('.expandMobileWrapper.mWrapper'+index);
            el.css({
                'width': ''+$scope.outerWidth+'px',
                'height': '0'
            });
            $scope.mobileScreenIndex = null;
        }
    }

    $scope.expandContent = function(index, event) {
        if ($scope.mobileScreen) {
//            $scope.mobileScreenIndex = index;
//            var el = $('.expandMobileWrapper.mWrapper'+index);
//            console.log('mobview', el);
//            el.css({
//                'width': ''+$scope.outerWidth+'px',
//                'height': '100%'
//            });
        } else {
            if ($scope.expandedIndex === index) {
                $scope.expandedIndex = null;
                $('.row'+index).removeClass('expand');
                $scope.isExpanded = false;
            }else if ($scope.expandedIndex !== null) {
                $('.row'+$scope.expandedIndex).removeClass('expand');
                $('.row'+index).addClass('expand');
                $scope.expandedIndex = index;
            } else {
                $('.row'+index).addClass('expand');
                $scope.expandedIndex = index;
            }
            
        }
        
    }

    $(window).on('click', function(event) {
        if (event.target.className === "collapsedContent"){
            $('.row'+$scope.expandedIndex).removeClass('expand');
            $scope.expandedIndex = null;
        }
    })

    $scope.enlargeImage = function(parIndex, imgIndex) {
        console.log(parIndex, imgIndex);
        if ($scope.mobileScreen) {
            $('.mobileImg'+parIndex).css({
                'background-image': "url("+imgIndex+")"
            });
        } else {
            $('.largeImage'+parIndex).css({
                'background-image': "url("+imgIndex+")"
            });
        }
    }

    $scope.swipeImage = function(direction, parIndex, item, imgIndex) {
        var newIndex;
        if (direction == "left") {
            if (imgIndex < item.itemImageURL.length - 1) {
                newIndex = imgIndex++;
            } else {
                newIndex = 0;
            }
        } else if (direction == "right") {
            if (imgIndex !== 0) {
                newIndex = imgIndex--;
            } else {
                newIndex = item.itemImageURL.length - 1;
            }
        }
        $('.mobileImg'+parIndex).css({
            'background-image': "url("+item.itemImageURL[newIndex]+")"
        });
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
        $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+userLat+','+userLng+'&sensor=true').
            then(function(res) {
                for (var i = 0; i < res.data.results.length; i++) {
                    if (res.data.results[i].geometry.location_type == 'APPROXIMATE'){
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


    $scope.scrollTop = function(){
        $location.hash('topQueryBar');
        $anchorScroll();
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

        //$scope.items = [{"_id":"55a75e5d80df850e1bcc0bbd","source_shoptiques_item":{"source":"shoptiques","name":"French Bulldog","idString":"p-131180","id":131180,"priceString":"$98.00","price":98,"loves":0,"description":"","brand":"Two's Company","categories":["Home & Gifts","Gifts For...","Gifts for host / hostess","French Bulldog "],"url":"http://www.shoptiques.com/products/two-s_company-french-bulldog","related":["http://www.shoptiques.com/products/golden-braid-bracelet","http://www.shoptiques.com/products/two-s_company-large-desk-clock","http://www.shoptiques.com/products/golf-bottle-opener","http://www.shoptiques.com/products/patina-candle","http://www.shoptiques.com/products/two-s_company-french-bulldog","http://www.shoptiques.com/products/two-s_company-dog-scarf","http://www.shoptiques.com/products/knot-rectangle-tray","http://www.shoptiques.com/products/white-statement-necklace-1"],"color":"White","colorName":"White","colorImage":"http://ecdn2.shoptiques.net/products/f301cac1-50c5-4b95-97f1-9a9ef78b4463_t.jpg","colorId":"145888","images":["http://ecdn1.shoptiques.net/products/f9ce95ff-a92d-434b-85f4-a4acf6d65fa7_m.jpg"]},"world":false,"name":"French Bulldog","id":"131180.145888","price":98,"priceRange":2,"description":"This fun french bulldog is a great decoration for any space to add some character and liveliness. 7'' W x 12'' D x 15'' H.","__v":1,"linkback":"http://www.shoptiques.com/products/two-s_company-french-bulldog","linkbackname":"shoptiques.com","processedImages":true,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/melimelohome1242/f9ce95ff-a92d-434b-85f4-a4acf6d65fa7_m.jpg"],"itemTags":{"auto":[],"text":["Home & Gifts","Gifts For...","Gifts for host / hostess","French Bulldog ","White"],"categories":["Home & Gifts","Gifts For...","Gifts for host / hostess","French Bulldog "],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T07:33:49.195Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.182Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T07:33:49.195Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.3752916,40.7394339],"type":"Point"},"owner":{"mongoId":"55ddd63318e959462dbc17c1","profileID":"melimelohome1242","name":"Meli Melo Home"},"parents":[{"_id":"55a759abcb5db1f5093c8ef0","source_shoptiques_store":{"source":"shoptiques","name":"Meli Melo Home","url":"http://www.shoptiques.com/boutiques/meli-melo","neighborhood":"New Jersey","addressText":"82 Main St, Chatham Township","city":"Chatham Township","state":"NJ","description":"Meli Melo, which translates to \"a mixture of a little bit of this and a little bit of that\", is the perfect name for a store that carries a mix of beautiful objects that reflect todays' relaxed lifestyle with a  sense of luxury and comfort. The store carries furniture, accessories, and fine gifts\r\n","image":"http://ecdn1.shoptiques.net/boutiques/7705e332-f84e-4660-a033-66273e5c79c2_l.jpg","followersCount":"285","idString":"1242","id":1242},"name":"Meli Melo Home","id":"melimelohome1242","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T07:13:47.538Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.282Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T07:13:47.538Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.3752916,40.7394339],"type":"Point"},"parents":[]}],"parent":{"_id":"55a759abcb5db1f5093c8ef0","source_shoptiques_store":{"source":"shoptiques","name":"Meli Melo Home","url":"http://www.shoptiques.com/boutiques/meli-melo","neighborhood":"New Jersey","addressText":"82 Main St, Chatham Township","city":"Chatham Township","state":"NJ","description":"Meli Melo, which translates to \"a mixture of a little bit of this and a little bit of that\", is the perfect name for a store that carries a mix of beautiful objects that reflect todays' relaxed lifestyle with a  sense of luxury and comfort. The store carries furniture, accessories, and fine gifts\r\n","image":"http://ecdn1.shoptiques.net/boutiques/7705e332-f84e-4660-a033-66273e5c79c2_l.jpg","followersCount":"285","idString":"1242","id":1242},"name":"Meli Melo Home","id":"melimelohome1242","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T07:13:47.538Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.282Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T07:13:47.538Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.3752916,40.7394339],"type":"Point"},"parents":[]}},{"_id":"55a78c25cab99be67680c7d4","source_shoptiques_item":{"source":"shoptiques","name":"Marble Roll Clutch","idString":"p-138691","id":138691,"priceString":"$140.00","price":140,"loves":1,"description":"","brand":"La Regale","categories":["Bags","Clutches & Evening","Marble Roll Clutch "],"url":"http://www.shoptiques.com/products/la_regale-marble-roll-clutch","related":["http://www.shoptiques.com/products/wildflower_cases-turquoise-iphone6-case-1","http://www.shoptiques.com/products/vivienne-shoulder-bag","http://www.shoptiques.com/products/urban_expressions-urban-expressions-aiden-1-2","http://www.shoptiques.com/products/wildflower-iphone-6-1","http://www.shoptiques.com/products/urban_expressions-urban-expressions-kerri","http://www.shoptiques.com/products/punch_case-gigi-quilted-powerbag","http://www.shoptiques.com/products/elephant-pouch","http://www.shoptiques.com/products/mz_wallace-large-magnet-tote"],"color":"Black","colorName":"Black","colorImage":"http://ecdn2.shoptiques.net/products/ab232099-b4e1-4b94-8cfa-e3edf538615c_t.jpg","colorId":"154243","images":["http://ecdn2.shoptiques.net/products/la_regale-marble-roll-clutch-black-e18e7e65_m.jpg"]},"world":false,"name":"Marble Roll Clutch","id":"138691.154243","price":140,"priceRange":3,"description":"Snap-flap closure. Interior wall pocket. 9\"W x 3 ½\"H x 1 ½\"D. 22 ½\" cross body strap drop.","__v":1,"linkback":"http://www.shoptiques.com/products/la_regale-marble-roll-clutch","linkbackname":"shoptiques.com","processedImages":true,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/letsbagit1563/la_regale-marble-roll-clutch-black-e18e7e65_m.jpg"],"itemTags":{"auto":[],"text":["Bags","Clutches & Evening","Marble Roll Clutch ","Black"],"categories":["Bags","Clutches & Evening","Marble Roll Clutch "],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T10:49:09.913Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.184Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T10:49:09.913Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.5426696,40.6598946],"type":"Point"},"owner":{"mongoId":"55ddd70218e959462dbc17fd","profileID":"letsbagit1563","name":"Let's Bag It"},"parents":[{"_id":"55a77bd10f55da7d6261e941","source_shoptiques_store":{"source":"shoptiques","name":"Let's Bag It","url":"http://www.shoptiques.com/boutiques/Lets-Bag-It","neighborhood":"New York","addressText":"2203 Merrick Rd, Merrick","city":"Merrick","state":"NY","description":"\r\n\tAt Let's Bag It, we pride ourselves in discovering the hottest designers from all over the world. We are proud to present the most unique lines that will not only complete your outfit, but also make you a trendsetter. \r\n","image":"http://ecdn1.shoptiques.net/boutiques/d9a260df-ff71-479b-9e64-174bcd5f3d04_l.jpg","followersCount":"620","idString":"1563","id":1563},"name":"Let's Bag It","id":"letsbagit1563","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T09:39:29.840Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.285Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T09:39:29.827Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.5426696,40.6598946],"type":"Point"},"parents":[]}],"parent":{"_id":"55a77bd10f55da7d6261e941","source_shoptiques_store":{"source":"shoptiques","name":"Let's Bag It","url":"http://www.shoptiques.com/boutiques/Lets-Bag-It","neighborhood":"New York","addressText":"2203 Merrick Rd, Merrick","city":"Merrick","state":"NY","description":"\r\n\tAt Let's Bag It, we pride ourselves in discovering the hottest designers from all over the world. We are proud to present the most unique lines that will not only complete your outfit, but also make you a trendsetter. \r\n","image":"http://ecdn1.shoptiques.net/boutiques/d9a260df-ff71-479b-9e64-174bcd5f3d04_l.jpg","followersCount":"620","idString":"1563","id":1563},"name":"Let's Bag It","id":"letsbagit1563","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T09:39:29.840Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.285Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T09:39:29.827Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.5426696,40.6598946],"type":"Point"},"parents":[]}},{"_id":"55a78c429dcaca1e77ec6036","source_shoptiques_item":{"source":"shoptiques","name":"Rushed Satin Clutch","idString":"p-138639","id":138639,"priceString":"$50.00","price":50,"loves":0,"description":"","brand":"La Regale","categories":["Bags","Clutches & Evening","Rushed Satin Clutch "],"url":"http://www.shoptiques.com/products/la_regale-rushed-satin-clutch","related":["http://www.shoptiques.com/products/mini-snake-satchel","http://www.shoptiques.com/products/laggo-remy-fringe","http://www.shoptiques.com/products/urban_expressions-urban-expressions-delaynie","http://www.shoptiques.com/products/sun_n_sand-floral-beach-bag","http://www.shoptiques.com/products/wildflower_cases-iphone-6-case-1-1-2-3-4","http://www.shoptiques.com/products/carla_mancini-penelope-shoulder-bag","http://www.shoptiques.com/products/laggo-remy-leather-tote","http://www.shoptiques.com/products/yeet-iphone-6"],"color":"Black","colorName":"Black","colorImage":"http://ecdn1.shoptiques.net/products/fa025749-c797-42b1-b8ce-44f92d7602bf_t.jpg","colorId":"154163","images":["http://ecdn1.shoptiques.net/products/la_regale-rushed-satin-clutch-black-07b0046a_m.jpg","http://ecdn1.shoptiques.net/products/la_regale-rushed-satin-clutch-black-d8a65444_m.jpg","http://ecdn2.shoptiques.net/products/la_regale-rushed-satin-clutch-black-b89c997c_m.jpg"]},"world":false,"name":"Rushed Satin Clutch","id":"138639.154163","price":50,"priceRange":2,"description":"Rushed Satin Roll Clutch. Dimensions: • 9\"W x 3 ¼\"H x 1 ½\"D. • 20\" strap drop.","__v":1,"linkback":"http://www.shoptiques.com/products/la_regale-rushed-satin-clutch","linkbackname":"shoptiques.com","processedImages":true,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/letsbagit1563/la_regale-rushed-satin-clutch-black-07b0046a_m.jpg","https://s3.amazonaws.com/if.kip.apparel.images/letsbagit1563/la_regale-rushed-satin-clutch-black-d8a65444_m.jpg","https://s3.amazonaws.com/if.kip.apparel.images/letsbagit1563/la_regale-rushed-satin-clutch-black-b89c997c_m.jpg"],"itemTags":{"auto":[],"text":["Bags","Clutches & Evening","Rushed Satin Clutch ","Black"],"categories":["Bags","Clutches & Evening","Rushed Satin Clutch "],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T10:49:38.077Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.187Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T10:49:38.076Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.5426696,40.6598946],"type":"Point"},"owner":{"mongoId":"55ddd70218e959462dbc17fd","profileID":"letsbagit1563","name":"Let's Bag It"},"parents":[{"_id":"55a77bd10f55da7d6261e941","source_shoptiques_store":{"source":"shoptiques","name":"Let's Bag It","url":"http://www.shoptiques.com/boutiques/Lets-Bag-It","neighborhood":"New York","addressText":"2203 Merrick Rd, Merrick","city":"Merrick","state":"NY","description":"\r\n\tAt Let's Bag It, we pride ourselves in discovering the hottest designers from all over the world. We are proud to present the most unique lines that will not only complete your outfit, but also make you a trendsetter. \r\n","image":"http://ecdn1.shoptiques.net/boutiques/d9a260df-ff71-479b-9e64-174bcd5f3d04_l.jpg","followersCount":"620","idString":"1563","id":1563},"name":"Let's Bag It","id":"letsbagit1563","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T09:39:29.840Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.285Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T09:39:29.827Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.5426696,40.6598946],"type":"Point"},"parents":[]}],"parent":{"_id":"55a77bd10f55da7d6261e941","source_shoptiques_store":{"source":"shoptiques","name":"Let's Bag It","url":"http://www.shoptiques.com/boutiques/Lets-Bag-It","neighborhood":"New York","addressText":"2203 Merrick Rd, Merrick","city":"Merrick","state":"NY","description":"\r\n\tAt Let's Bag It, we pride ourselves in discovering the hottest designers from all over the world. We are proud to present the most unique lines that will not only complete your outfit, but also make you a trendsetter. \r\n","image":"http://ecdn1.shoptiques.net/boutiques/d9a260df-ff71-479b-9e64-174bcd5f3d04_l.jpg","followersCount":"620","idString":"1563","id":1563},"name":"Let's Bag It","id":"letsbagit1563","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T09:39:29.840Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.285Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T09:39:29.827Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.5426696,40.6598946],"type":"Point"},"parents":[]}},{"_id":"55a7901e3592e4b47f381ca4","source_shoptiques_item":{"source":"shoptiques","name":"Charlee Chain Crossbody","idString":"p-131164","id":131164,"priceString":"$38.00","price":38,"loves":0,"description":"","brand":"Steve Madden","categories":["Bags","Cross Body Bags","Charlee Chain Crossbody "],"url":"http://www.shoptiques.com/products/steve_madden-charlee-chain-crossbody","related":["http://www.shoptiques.com/products/toss_designs-coated-canvas-salbag","http://www.shoptiques.com/products/lydc-scallope-tote","http://www.shoptiques.com/products/torrey-black","http://www.shoptiques.com/products/wildflower_cases-turquoise-iphone6-case-1","http://www.shoptiques.com/products/sondra_roberts-faux-snake-clutch-1","http://www.shoptiques.com/products/cara-crochet-pant","http://www.shoptiques.com/products/urban_expressions-urban-expression-finn","http://www.shoptiques.com/products/toss_designs-toss-beach-bag"],"color":"Beige","colorName":"Beige","colorImage":"http://ecdn2.shoptiques.net/products/a786cad5-d572-4901-91b0-9e2ca1298ac5_t.jpg","colorId":"145869","images":["http://ecdn2.shoptiques.net/products/5518e79d-519b-4898-bd4d-96c5e9175515_m.jpg"]},"world":false,"name":"Charlee Chain Crossbody","id":"131164.145869","price":38,"priceRange":1,"description":"Charlee Chain Crossbody 4\"H x 6\"W x 4\"H x 2 Â½\"D","__v":1,"linkback":"http://www.shoptiques.com/products/steve_madden-charlee-chain-crossbody","linkbackname":"shoptiques.com","processedImages":true,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/letsbagit1563/5518e79d-519b-4898-bd4d-96c5e9175515_m.jpg"],"itemTags":{"auto":[],"text":["Bags","Cross Body Bags","Charlee Chain Crossbody ","Beige"],"categories":["Bags","Cross Body Bags","Charlee Chain Crossbody "],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T11:06:06.884Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.189Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T11:06:06.884Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.5426696,40.6598946],"type":"Point"},"owner":{"mongoId":"55ddd70218e959462dbc17fd","profileID":"letsbagit1563","name":"Let's Bag It"},"parents":[{"_id":"55a77bd10f55da7d6261e941","source_shoptiques_store":{"source":"shoptiques","name":"Let's Bag It","url":"http://www.shoptiques.com/boutiques/Lets-Bag-It","neighborhood":"New York","addressText":"2203 Merrick Rd, Merrick","city":"Merrick","state":"NY","description":"\r\n\tAt Let's Bag It, we pride ourselves in discovering the hottest designers from all over the world. We are proud to present the most unique lines that will not only complete your outfit, but also make you a trendsetter. \r\n","image":"http://ecdn1.shoptiques.net/boutiques/d9a260df-ff71-479b-9e64-174bcd5f3d04_l.jpg","followersCount":"620","idString":"1563","id":1563},"name":"Let's Bag It","id":"letsbagit1563","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T09:39:29.840Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.285Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T09:39:29.827Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.5426696,40.6598946],"type":"Point"},"parents":[]}],"parent":{"_id":"55a77bd10f55da7d6261e941","source_shoptiques_store":{"source":"shoptiques","name":"Let's Bag It","url":"http://www.shoptiques.com/boutiques/Lets-Bag-It","neighborhood":"New York","addressText":"2203 Merrick Rd, Merrick","city":"Merrick","state":"NY","description":"\r\n\tAt Let's Bag It, we pride ourselves in discovering the hottest designers from all over the world. We are proud to present the most unique lines that will not only complete your outfit, but also make you a trendsetter. \r\n","image":"http://ecdn1.shoptiques.net/boutiques/d9a260df-ff71-479b-9e64-174bcd5f3d04_l.jpg","followersCount":"620","idString":"1563","id":1563},"name":"Let's Bag It","id":"letsbagit1563","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T09:39:29.840Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.285Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T09:39:29.827Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.5426696,40.6598946],"type":"Point"},"parents":[]}},{"_id":"55a7901e3592e4b47f381ca5","source_shoptiques_item":{"source":"shoptiques","name":"Charlee Chain Crossbody","idString":"p-131164","id":131164,"priceString":"$38.00","price":38,"loves":0,"description":"","brand":"Steve Madden","categories":["Bags","Cross Body Bags","Charlee Chain Crossbody "],"url":"http://www.shoptiques.com/products/steve_madden-charlee-chain-crossbody","related":["http://www.shoptiques.com/products/toss_designs-coated-canvas-salbag","http://www.shoptiques.com/products/lydc-scallope-tote","http://www.shoptiques.com/products/torrey-black","http://www.shoptiques.com/products/wildflower_cases-turquoise-iphone6-case-1","http://www.shoptiques.com/products/sondra_roberts-faux-snake-clutch-1","http://www.shoptiques.com/products/cara-crochet-pant","http://www.shoptiques.com/products/urban_expressions-urban-expression-finn","http://www.shoptiques.com/products/toss_designs-toss-beach-bag"],"color":"Black","colorName":"Black","colorImage":"http://ecdn1.shoptiques.net/products/f374078f-20f9-4fdc-b9fb-1c9f72ad35cb_t.jpg","colorId":"145868","images":["http://ecdn1.shoptiques.net/products/a12dfe06-e6ff-4290-a8ba-93df221b8eec_m.jpg"]},"world":false,"name":"Charlee Chain Crossbody","id":"131164.145868","price":38,"priceRange":1,"description":"Charlee Chain Crossbody 4\"H x 6\"W x 4\"H x 2 Â½\"D","__v":1,"linkback":"http://www.shoptiques.com/products/steve_madden-charlee-chain-crossbody","linkbackname":"shoptiques.com","processedImages":true,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/letsbagit1563/a12dfe06-e6ff-4290-a8ba-93df221b8eec_m.jpg"],"itemTags":{"auto":[],"text":["Bags","Cross Body Bags","Charlee Chain Crossbody ","Black"],"categories":["Bags","Cross Body Bags","Charlee Chain Crossbody "],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T11:06:06.902Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.197Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T11:06:06.902Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.5426696,40.6598946],"type":"Point"},"owner":{"mongoId":"55ddd70218e959462dbc17fd","profileID":"letsbagit1563","name":"Let's Bag It"},"parents":[{"_id":"55a77bd10f55da7d6261e941","source_shoptiques_store":{"source":"shoptiques","name":"Let's Bag It","url":"http://www.shoptiques.com/boutiques/Lets-Bag-It","neighborhood":"New York","addressText":"2203 Merrick Rd, Merrick","city":"Merrick","state":"NY","description":"\r\n\tAt Let's Bag It, we pride ourselves in discovering the hottest designers from all over the world. We are proud to present the most unique lines that will not only complete your outfit, but also make you a trendsetter. \r\n","image":"http://ecdn1.shoptiques.net/boutiques/d9a260df-ff71-479b-9e64-174bcd5f3d04_l.jpg","followersCount":"620","idString":"1563","id":1563},"name":"Let's Bag It","id":"letsbagit1563","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T09:39:29.840Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.285Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T09:39:29.827Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.5426696,40.6598946],"type":"Point"},"parents":[]}],"parent":{"_id":"55a77bd10f55da7d6261e941","source_shoptiques_store":{"source":"shoptiques","name":"Let's Bag It","url":"http://www.shoptiques.com/boutiques/Lets-Bag-It","neighborhood":"New York","addressText":"2203 Merrick Rd, Merrick","city":"Merrick","state":"NY","description":"\r\n\tAt Let's Bag It, we pride ourselves in discovering the hottest designers from all over the world. We are proud to present the most unique lines that will not only complete your outfit, but also make you a trendsetter. \r\n","image":"http://ecdn1.shoptiques.net/boutiques/d9a260df-ff71-479b-9e64-174bcd5f3d04_l.jpg","followersCount":"620","idString":"1563","id":1563},"name":"Let's Bag It","id":"letsbagit1563","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T09:39:29.840Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.285Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T09:39:29.827Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.5426696,40.6598946],"type":"Point"},"parents":[]}},{"_id":"55a7980526901395159a5364","source_shoptiques_item":{"source":"shoptiques","name":"Bluetooth Wireless Speaker","idString":"p-111964","id":111964,"priceString":"$60.00","price":60,"loves":0,"description":"","brand":"Tripe C","categories":["Home & Gifts","Gifts & Things","Bluetooth Wireless Speaker"],"url":"http://www.shoptiques.com/products/tripe_c-bluetooth-wireless-speaker-1","related":["http://www.shoptiques.com/products/dena_lyons-dena-lyons-scarf-1-2-3-4-5-6","http://www.shoptiques.com/products/thymes-mandarin-coriander-candle","http://www.shoptiques.com/products/count_me_healthy-count-me-healthy-1-2-3-4","http://www.shoptiques.com/products/dena_lyons-dena-lyons-scarf","http://www.shoptiques.com/products/rock_flower_paper-market-tote","http://www.shoptiques.com/products/madame_mathilde-tassel-earrings-3","http://www.shoptiques.com/products/madame_mathilde-pendant-necklace-3","http://www.shoptiques.com/products/rock_flower_paper-isabella-bucket-bag"],"color":"Black","colorName":"Black","colorImage":"http://ecdn2.shoptiques.net/products/1d6ca3ae-2162-46a0-a1eb-1579e22ca1ad_t.jpg","colorId":"124914","images":["http://ecdn1.shoptiques.net/products/9c21a4cd-3384-4524-a87a-ae539d59b688_m.jpg"]},"world":false,"name":"Bluetooth Wireless Speaker","id":"111964.124914","price":60,"priceRange":2,"description":"Dimensions:  3\" H x 2.5\"D x 2.5\"W","__v":1,"linkback":"http://www.shoptiques.com/products/tripe_c-bluetooth-wireless-speaker-1","linkbackname":"shoptiques.com","processedImages":true,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/thesilkroadny2390/9c21a4cd-3384-4524-a87a-ae539d59b688_m.jpg"],"itemTags":{"auto":[],"text":["Home & Gifts","Gifts & Things","Bluetooth Wireless Speaker","Black"],"categories":["Home & Gifts","Gifts & Things","Bluetooth Wireless Speaker"],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T11:39:49.001Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.200Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T11:39:49.000Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.83291849999999,40.9395292],"type":"Point"},"owner":{"mongoId":"55ddd70418e959462dbc1801","profileID":"thesilkroadny2390","name":"The Silk Road NY"},"parents":[{"_id":"55a77c752c22c751632417c4","source_shoptiques_store":{"source":"shoptiques","name":"The Silk Road NY","url":"http://www.shoptiques.com/boutiques/The-Silk-Road-NY","neighborhood":"Westchester County","addressText":"101 Pondfield Road, Bronxville","city":"Bronxville","state":"NY","description":"\r\n\tThe Silk Road NY features unique home décor, gifts, jewelry, textiles, and clothing; especially merchandise from Thailand, Vietnam, China, Peru, South African and the US.\r\n","image":"http://ecdn2.shoptiques.net/boutiques/fae75a62-564b-483b-ae71-5319a11afef7_l.jpg","followersCount":"214","idString":"2390","id":2390},"name":"The Silk Road NY","id":"thesilkroadny2390","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T09:42:13.789Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.288Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T09:42:13.788Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.83291849999999,40.9395292],"type":"Point"},"parents":[]}],"parent":{"_id":"55a77c752c22c751632417c4","source_shoptiques_store":{"source":"shoptiques","name":"The Silk Road NY","url":"http://www.shoptiques.com/boutiques/The-Silk-Road-NY","neighborhood":"Westchester County","addressText":"101 Pondfield Road, Bronxville","city":"Bronxville","state":"NY","description":"\r\n\tThe Silk Road NY features unique home décor, gifts, jewelry, textiles, and clothing; especially merchandise from Thailand, Vietnam, China, Peru, South African and the US.\r\n","image":"http://ecdn2.shoptiques.net/boutiques/fae75a62-564b-483b-ae71-5319a11afef7_l.jpg","followersCount":"214","idString":"2390","id":2390},"name":"The Silk Road NY","id":"thesilkroadny2390","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T09:42:13.789Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.288Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T09:42:13.788Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.83291849999999,40.9395292],"type":"Point"},"parents":[]}},{"_id":"55a79813085feab9155a1b10","source_shoptiques_item":{"source":"shoptiques","name":"Bluetooth Wireless Speaker","idString":"p-111937","id":111937,"priceString":"$60.00","price":60,"loves":2,"description":"","brand":"Triple C","categories":["Home & Gifts","Gifts & Things","Bluetooth Wireless Speaker"],"url":"http://www.shoptiques.com/products/triple_c-bluetooth-wireless-speaker-1","related":["http://www.shoptiques.com/products/dash-albert-rug","http://www.shoptiques.com/products/dash_and_albert-dash-albert-rug-5","http://www.shoptiques.com/products/madame_mathilde-tassel-earrings-3-1-2-3","http://www.shoptiques.com/products/audrey-rain-coat","http://www.shoptiques.com/products/dash_-_albert-dash-albert-rug-5-1","http://www.shoptiques.com/products/rock_flower_paper-isabella-bucket-bag","http://www.shoptiques.com/products/design_hype-brooklyn-metro-cuff","http://www.shoptiques.com/products/buckhead_betties-zipper-bag-set"],"color":"Pink","colorName":"Pink","colorImage":"http://ecdn1.shoptiques.net/products/594ebf1c-b458-45f9-84a1-628ac6e89a9d_t.jpg","colorId":"124892","images":["http://ecdn2.shoptiques.net/products/5cf2d13f-ff91-4ac5-b9cb-1c80a85fbcb6_m.jpg"]},"world":false,"name":"Bluetooth Wireless Speaker","id":"111937.124892","price":60,"priceRange":2,"description":"Dimensions:  2\"H x 1.75\"W x 1.75\"D","__v":1,"linkback":"http://www.shoptiques.com/products/triple_c-bluetooth-wireless-speaker-1","linkbackname":"shoptiques.com","processedImages":true,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/thesilkroadny2390/5cf2d13f-ff91-4ac5-b9cb-1c80a85fbcb6_m.jpg"],"itemTags":{"auto":[],"text":["Home & Gifts","Gifts & Things","Bluetooth Wireless Speaker","Pink"],"categories":["Home & Gifts","Gifts & Things","Bluetooth Wireless Speaker"],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T11:40:03.168Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.203Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T11:40:03.168Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.83291849999999,40.9395292],"type":"Point"},"owner":{"mongoId":"55ddd70418e959462dbc1801","profileID":"thesilkroadny2390","name":"The Silk Road NY"},"parents":[{"_id":"55a77c752c22c751632417c4","source_shoptiques_store":{"source":"shoptiques","name":"The Silk Road NY","url":"http://www.shoptiques.com/boutiques/The-Silk-Road-NY","neighborhood":"Westchester County","addressText":"101 Pondfield Road, Bronxville","city":"Bronxville","state":"NY","description":"\r\n\tThe Silk Road NY features unique home décor, gifts, jewelry, textiles, and clothing; especially merchandise from Thailand, Vietnam, China, Peru, South African and the US.\r\n","image":"http://ecdn2.shoptiques.net/boutiques/fae75a62-564b-483b-ae71-5319a11afef7_l.jpg","followersCount":"214","idString":"2390","id":2390},"name":"The Silk Road NY","id":"thesilkroadny2390","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T09:42:13.789Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.288Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T09:42:13.788Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.83291849999999,40.9395292],"type":"Point"},"parents":[]}],"parent":{"_id":"55a77c752c22c751632417c4","source_shoptiques_store":{"source":"shoptiques","name":"The Silk Road NY","url":"http://www.shoptiques.com/boutiques/The-Silk-Road-NY","neighborhood":"Westchester County","addressText":"101 Pondfield Road, Bronxville","city":"Bronxville","state":"NY","description":"\r\n\tThe Silk Road NY features unique home décor, gifts, jewelry, textiles, and clothing; especially merchandise from Thailand, Vietnam, China, Peru, South African and the US.\r\n","image":"http://ecdn2.shoptiques.net/boutiques/fae75a62-564b-483b-ae71-5319a11afef7_l.jpg","followersCount":"214","idString":"2390","id":2390},"name":"The Silk Road NY","id":"thesilkroadny2390","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-16T09:42:13.789Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.288Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-16T09:42:13.788Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.83291849999999,40.9395292],"type":"Point"},"parents":[]}},{"_id":"55b374a3534749bb0397aa94","id":"cloakndaggernyc_1032113714247446505_25205458","world":false,"valid":true,"description":"Greetings from Croatia babies! You'll need lots of C&D #CUTESHIT before coming to this must see destination!!","__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/cloakndaggernyc/11327047_1167138503302461_443490171_n.jpg"],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"id":"1032113714247446505_25205458","created_time":1437257564,"img_url":"https://s3.amazonaws.com/if.kip.apparel.images/cloakndaggernyc/11327047_1167138503302461_443490171_n.jpg","original_url":"https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/e15/11327047_1167138503302461_443490171_n.jpg","text":"Greetings from Croatia babies! You'll need lots of C&D #CUTESHIT before coming to this must see destination!!","created":"2015-07-25T11:36:03.648Z","tags":["croatia","nocuteclotheshere","bucketlist","gameofthrones","got","dubrovnik","travel","cuteshit","wherecloakgirlsvacation"],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.206Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-25T11:36:03.648Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.98606099999999,40.728456],"type":"Point"},"owner":{"mongoId":"55b290073a4c7a9c2b868762","name":"Cloak & Dagger","profileID":"cloakdagger_25205458"},"parents":[{"_id":"55b290073a4c7a9c2b868762","source_instagram_user":{"username":"cloakndaggernyc","bio":"THE CUTEST BOUTIQUE FOR THE MOST BADASS BABES!! 💋 \n334 East 9th St., EAST VILLAGE, New York City 212.673.0500 shop@cloakanddaggernyc.com #CUTESHIT","website":"http://www.CloakAndDaggerNyc.com","profile_picture":"https://instagramimages-a.akamaihd.net/profiles/profile_25205458_75sq_1379185893.jpg","full_name":"Cloak & Dagger  NYC","counts":{"media":1637,"followed_by":4952,"follows":1012},"id":"25205458"},"addressString":"334 E 9th St New York, NY 10003","name":"Cloak & Dagger","id":"cloakdagger_25205458","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-24T19:20:39.215Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.293Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-24T19:20:39.215Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.98606099999999,40.728456],"type":"Point"},"parents":[]}],"parent":{"_id":"55b290073a4c7a9c2b868762","source_instagram_user":{"username":"cloakndaggernyc","bio":"THE CUTEST BOUTIQUE FOR THE MOST BADASS BABES!! 💋 \n334 East 9th St., EAST VILLAGE, New York City 212.673.0500 shop@cloakanddaggernyc.com #CUTESHIT","website":"http://www.CloakAndDaggerNyc.com","profile_picture":"https://instagramimages-a.akamaihd.net/profiles/profile_25205458_75sq_1379185893.jpg","full_name":"Cloak & Dagger  NYC","counts":{"media":1637,"followed_by":4952,"follows":1012},"id":"25205458"},"addressString":"334 E 9th St New York, NY 10003","name":"Cloak & Dagger","id":"cloakdagger_25205458","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-24T19:20:39.215Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.293Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-24T19:20:39.215Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.98606099999999,40.728456],"type":"Point"},"parents":[]}},{"_id":"55b374a5534749bb0397abc8","id":"maviusa_1036269253770712159_11907660","world":false,"valid":true,"description":"F R I D A Y !","__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/maviusa/11325259_506940472794400_319864168_n.jpg"],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"id":"1036269253770712159_11907660","created_time":1437752943,"img_url":"https://s3.amazonaws.com/if.kip.apparel.images/maviusa/11325259_506940472794400_319864168_n.jpg","original_url":"https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/s640x640/e15/11325259_506940472794400_319864168_n.jpg","text":"F R I D A Y !","created":"2015-07-25T11:36:05.595Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.208Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-25T11:36:05.595Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.98015699999999,40.6764269],"type":"Point"},"owner":{"mongoId":"55b290153a4c7a9c2b8687a2","name":"Mavi Jeans","profileID":"mavijeans_11907660"},"parents":[{"_id":"55b290153a4c7a9c2b8687a2","source_instagram_user":{"username":"maviusa","bio":"Official Instagram of Mavi | Inspirational. Modern. Accessible. #moveinmavi","website":"http://mavi.me/Adriana_ripped","profile_picture":"https://instagramimages-a.akamaihd.net/profiles/profile_11907660_75sq_1383238067.jpg","full_name":"Mavi","counts":{"media":894,"followed_by":3464,"follows":566},"id":"11907660"},"addressString":"205 5th Ave Brooklyn NY 11217","name":"Mavi Jeans","id":"mavijeans_11907660","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-24T19:20:53.228Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.296Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-24T19:20:53.228Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.98015699999999,40.6764269],"type":"Point"},"parents":[]}],"parent":{"_id":"55b290153a4c7a9c2b8687a2","source_instagram_user":{"username":"maviusa","bio":"Official Instagram of Mavi | Inspirational. Modern. Accessible. #moveinmavi","website":"http://mavi.me/Adriana_ripped","profile_picture":"https://instagramimages-a.akamaihd.net/profiles/profile_11907660_75sq_1383238067.jpg","full_name":"Mavi","counts":{"media":894,"followed_by":3464,"follows":566},"id":"11907660"},"addressString":"205 5th Ave Brooklyn NY 11217","name":"Mavi Jeans","id":"mavijeans_11907660","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-24T19:20:53.228Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.296Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-24T19:20:53.228Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.98015699999999,40.6764269],"type":"Point"},"parents":[]}},{"_id":"55b374ad534749bb0397b067","id":"shopworship_1031325169681471894_360264645","world":false,"valid":true,"description":"D&Y black bucket hat. Has the look of patent leather. Cotton/poly lined. Can't get my mind off of Boys II Men. 💦 Says \"One size fits most\". $16 #shopworship #buckethat #d&y #boysIImen #llcoolj #wearwithoverallswithonestrap #duh","__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/shopworship/11379697_1699390363622463_924250443_n.jpg"],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"id":"1031325169681471894_360264645","created_time":1437163562,"img_url":"https://s3.amazonaws.com/if.kip.apparel.images/shopworship/11379697_1699390363622463_924250443_n.jpg","original_url":"https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/e15/11379697_1699390363622463_924250443_n.jpg","text":"D&Y black bucket hat. Has the look of patent leather. Cotton/poly lined. Can't get my mind off of Boys II Men. 💦 Says \"One size fits most\". $16 #shopworship #buckethat #d&y #boysIImen #llcoolj #wearwithoverallswithonestrap #duh","created":"2015-07-25T11:36:13.092Z","tags":["duh","wearwithoverallswithonestrap","boysiimen","d","llcoolj","buckethat","shopworship"],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.211Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-25T11:36:13.092Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.92627540000001,40.7012372],"type":"Point"},"owner":{"mongoId":"55b290063a4c7a9c2b868728","name":"Worship","profileID":"worship_360264645"},"parents":[{"_id":"55b290063a4c7a9c2b868728","source_instagram_user":{"username":"shopworship","bio":"Vintage Clothing\nBuy Sell Trade by appointment\n117 Wilson Avenue \nBrooklyn NY 11237 12-8pm\nCall 718-484-3660 to purchase💋","website":"http://shopworship.com","profile_picture":"https://igcdn-photos-e-a.akamaihd.net/hphotos-ak-xpa1/t51.2885-19/10691669_734259776663740_123436414_a.jpg","full_name":"Worship","counts":{"media":6534,"followed_by":4391,"follows":541},"id":"360264645"},"addressString":"117 Wilson Ave Brooklyn NY 11237","name":"Worship","id":"worship_360264645","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-24T19:20:38.332Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.291Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-24T19:20:38.331Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.92627540000001,40.7012372],"type":"Point"},"parents":[]}],"parent":{"_id":"55b290063a4c7a9c2b868728","source_instagram_user":{"username":"shopworship","bio":"Vintage Clothing\nBuy Sell Trade by appointment\n117 Wilson Avenue \nBrooklyn NY 11237 12-8pm\nCall 718-484-3660 to purchase💋","website":"http://shopworship.com","profile_picture":"https://igcdn-photos-e-a.akamaihd.net/hphotos-ak-xpa1/t51.2885-19/10691669_734259776663740_123436414_a.jpg","full_name":"Worship","counts":{"media":6534,"followed_by":4391,"follows":541},"id":"360264645"},"addressString":"117 Wilson Ave Brooklyn NY 11237","name":"Worship","id":"worship_360264645","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-24T19:20:38.332Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.291Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-24T19:20:38.331Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.92627540000001,40.7012372],"type":"Point"},"parents":[]}},{"_id":"55c9139c5a2a48b51520e933","source_shoptiques_item":{"source":"shoptiques","name":"Crystal Door Knob","idString":"p-102464","id":102464,"priceString":"$42.00","price":42,"loves":0,"description":"","brand":"ReCreateU","categories":["Home & Gifts","Wall Art","Crystal Door Knob"],"url":"http://www.shoptiques.com/products/crystal-door-knob","related":["http://www.shoptiques.com/products/metallic-palm-scarf","http://www.shoptiques.com/products/cleopatra-candela","http://www.shoptiques.com/products/pop-open-cards-behappy","http://www.shoptiques.com/products/recreateu-antler-hook","http://www.shoptiques.com/products/virgo-coin-signet-ring","http://www.shoptiques.com/products/recreateu-willow-water-bubble-bath","http://www.shoptiques.com/products/recreateu-happy-little-family","http://www.shoptiques.com/products/lollia-lollia-candle-no-21"],"color":"Multicolor","colorName":"Multicolor","colorImage":"http://ecdn2.shoptiques.net/products/3d9b4887-2f47-4a34-8192-e468a751ec21_t.jpg","colorId":"114497","images":["http://ecdn1.shoptiques.net/products/65ab1516-383f-447d-992a-b6628fba77cc_m.jpg"]},"world":false,"name":"Crystal Door Knob","id":"102464.114497","price":42,"priceRange":1,"description":"Crystal Door Knob Wall Hook with Vintage Antique Finish Assorted 3 Shapes/Colors: Mint, Off White, Taupe - Resin/Acrylic Material: RESIN Dimensions: 3\" W x 4\" D x 2\" H 3 1/2\" W x 3 1/2\" D x 2\" H 3 3/4\" W x 5 1/2\" D x 2 1/4\" H","__v":2,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/recreateu2197/65ab1516-383f-447d-992a-b6628fba77cc_l.jpg"],"itemTags":{"auto":[],"text":["Home & Gifts","Wall Art","Crystal Door Knob","Multicolor"],"categories":["Home & Gifts","Wall Art","Crystal Door Knob"],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:11:56.244Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.214Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:11:56.244Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-73.64785049999999,40.6558914],"type":"Point"},"owner":{"mongoId":"55ddd11718e959462dbc14dc","profileID":"recreateu2197","name":"ReCreateU"},"parents":[{"_id":"55a5409ed2b8940926871950","source_shoptiques_store":{"source":"shoptiques","name":"ReCreateU","url":"http://www.shoptiques.com/boutiques/ReCreateU","neighborhood":"New York City","addressText":"19 S Village Ave, Rockville Centre","city":"Rockville Centre","state":"NY","description":"\r\n\tRecreateU is a beautiful boutique that expresses the sophistication in you by featuring unique home decorative accessories, one of a kind hand painted furniture, special jewelry, and signature gift collections. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/b1acdd66-b879-4ffa-8e80-ed0ba3e3f30e_l.jpg","followersCount":"94","idString":"2197","id":2197},"name":"ReCreateU","id":"recreateu2197","world":true,"valid":true,"__v":1,"linkbackname":"google.com","flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-14T17:02:22.905Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-15T15:56:33.421Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-14T17:02:22.904Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[[-73.64785049999999,40.6558914]],"type":"MultiPoint"},"parents":[]}],"parent":{"_id":"55a5409ed2b8940926871950","source_shoptiques_store":{"source":"shoptiques","name":"ReCreateU","url":"http://www.shoptiques.com/boutiques/ReCreateU","neighborhood":"New York City","addressText":"19 S Village Ave, Rockville Centre","city":"Rockville Centre","state":"NY","description":"\r\n\tRecreateU is a beautiful boutique that expresses the sophistication in you by featuring unique home decorative accessories, one of a kind hand painted furniture, special jewelry, and signature gift collections. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/b1acdd66-b879-4ffa-8e80-ed0ba3e3f30e_l.jpg","followersCount":"94","idString":"2197","id":2197},"name":"ReCreateU","id":"recreateu2197","world":true,"valid":true,"__v":1,"linkbackname":"google.com","flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-07-14T17:02:22.905Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-15T15:56:33.421Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-07-14T17:02:22.904Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[[-73.64785049999999,40.6558914]],"type":"MultiPoint"},"parents":[]}},{"_id":"55c91c345a2a48b51520ebbd","source_shoptiques_item":{"source":"shoptiques","name":"Paula Dress","idString":"p-164641","id":164641,"priceString":"$265.00","price":265,"loves":2,"description":"","brand":"Betsy Moss","categories":["Clothing","Dresses","Evening","Paula Dress"],"url":"http://www.shoptiques.com/products/betsy_moss-paula-dress-2","related":["http://www.shoptiques.com/products/betsy_moss-paula-dress-2","http://www.shoptiques.com/products/dvf-white-lace-romper-1","http://www.shoptiques.com/products/dvf-dakota-lace-dress","http://www.shoptiques.com/products/dvf-purdy-crepe-jumpsuit","http://www.shoptiques.com/products/french_connection-layla-lace-dress","http://www.shoptiques.com/products/de_rosairo-leather-5way-cardigan","http://www.shoptiques.com/products/dvf-olivia-lace-dress-1","http://www.shoptiques.com/products/ronny_kobo-helouise-crop-top"],"color":"Red","colorName":"Red","colorImage":"http://ecdn2.shoptiques.net/products/93ac1c47-5190-4148-9427-97bc96d3733a_t.jpg","colorId":"182813","images":["http://ecdn2.shoptiques.net/products/betsy_moss-paula-dress-2-red-944454e2_m.jpg"]},"world":false,"name":"Paula Dress","id":"164641.182813","price":265,"priceRange":4,"description":"One shoulder silk jersey gown with a front slit. Dry clean only.","__v":2,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/poschebykimd2974/betsy_moss-paula-dress-2-red-944454e2_l.jpg"],"itemTags":{"auto":[],"text":["Clothing","Dresses","Evening","Paula Dress","Red"],"categories":["Clothing","Dresses","Evening","Paula Dress"],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.685Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.217Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.685Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"owner":{"mongoId":"55ddd82318e959462dbc183c","profileID":"poschebykimd2974","name":"POSCHE By Kim D"},"parents":[{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}],"parent":{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}},{"_id":"55c91c355a2a48b51520ebbe","source_shoptiques_item":{"source":"shoptiques","name":"Layla Lace Dress","idString":"p-164635","id":164635,"priceString":"$168.00","price":168,"loves":0,"description":"","brand":"French Connection","categories":["Clothing","Dresses","LBD","Layla Lace Dress"],"url":"http://www.shoptiques.com/products/french_connection-layla-lace-dress","related":["http://www.shoptiques.com/products/dvf-purdy-crepe-jumpsuit","http://www.shoptiques.com/products/betsy_moss-paula-dress-2","http://www.shoptiques.com/products/french_connection-layla-lace-dress","http://www.shoptiques.com/products/dvf-olivia-lace-dress-1","http://www.shoptiques.com/products/dvf-white-lace-romper-1","http://www.shoptiques.com/products/de_rosairo-leather-5way-cardigan","http://www.shoptiques.com/products/ronny_kobo-evie-bandage-skirt","http://www.shoptiques.com/products/ronny_kobo-helouise-crop-top"],"color":"Black","colorName":"Black","colorImage":"http://ecdn2.shoptiques.net/products/7732a164-716d-4dab-9260-34f63d03c97c_t.jpg","colorId":"182807","images":["http://ecdn2.shoptiques.net/products/french_connection-layla-lace-dress-black-70710054_m.jpg"]},"world":false,"name":"Layla Lace Dress","id":"164635.182807","price":168,"priceRange":3,"description":"Gauzy panels of lace and a draped skirt make this little black dress the ultimate scene-stealer. Stretchy lace embellished dress. Draped skirt. Exposed zip at back. Lace detail at chest, back and arms. Dry clean only.","__v":2,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/poschebykimd2974/french_connection-layla-lace-dress-black-70710054_l.jpg"],"itemTags":{"auto":[],"text":["Clothing","Dresses","LBD","Layla Lace Dress","Black"],"categories":["Clothing","Dresses","LBD","Layla Lace Dress"],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:37.013Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.220Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:37.013Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"owner":{"mongoId":"55ddd82318e959462dbc183c","profileID":"poschebykimd2974","name":"POSCHE By Kim D"},"parents":[{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}],"parent":{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}},{"_id":"55c91c355a2a48b51520ebbf","source_shoptiques_item":{"source":"shoptiques","name":"Evie Bandage Skirt","idString":"p-164631","id":164631,"priceString":"$328.00","price":328,"loves":0,"description":"","brand":"Ronny Kobo","categories":["Clothing","Skirts","Knee","Evie Bandage Skirt"],"url":"http://www.shoptiques.com/products/ronny_kobo-evie-bandage-skirt","related":["http://www.shoptiques.com/products/ronny_kobo-helouise-crop-top","http://www.shoptiques.com/products/french_connection-layla-lace-dress","http://www.shoptiques.com/products/dvf-olivia-lace-dress-1","http://www.shoptiques.com/products/dvf-purdy-crepe-jumpsuit","http://www.shoptiques.com/products/betsy_moss-paula-dress-2","http://www.shoptiques.com/products/dvf-dakota-lace-dress","http://www.shoptiques.com/products/de_rosairo-leather-5way-cardigan","http://www.shoptiques.com/products/dvf-white-lace-romper-1"],"color":"Black","colorName":"Black","colorImage":"http://ecdn1.shoptiques.net/products/e097ed81-e557-47d4-8398-1c49f599798f_t.jpg","colorId":"182803","images":["http://ecdn2.shoptiques.net/products/ronny_kobo-evie-bandage-skirt-multicolor-6c1b4830_m.jpg"]},"world":false,"name":"Evie Bandage Skirt","id":"164631.182803","price":328,"priceRange":4,"description":"A simple black bodycon skirt that is a bandage material. Dry clean only. \r\n\r\nMeasures: 28\" L","__v":2,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/poschebykimd2974/ronny_kobo-evie-bandage-skirt-multicolor-6c1b4830_l.jpg"],"itemTags":{"auto":[],"text":["Clothing","Skirts","Knee","Evie Bandage Skirt","Black"],"categories":["Clothing","Skirts","Knee","Evie Bandage Skirt"],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:37.615Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.223Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:37.615Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"owner":{"mongoId":"55ddd82318e959462dbc183c","profileID":"poschebykimd2974","name":"POSCHE By Kim D"},"parents":[{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}],"parent":{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}},{"_id":"55c91c365a2a48b51520ebc0","source_shoptiques_item":{"source":"shoptiques","name":"Helouise Crop Top","idString":"p-164629","id":164629,"priceString":"$324.00","price":324,"loves":0,"description":"","brand":"Ronny Kobo","categories":["Clothing","Tops","Crop Tops","Helouise Crop Top"],"url":"http://www.shoptiques.com/products/ronny_kobo-helouise-crop-top","related":["http://www.shoptiques.com/products/ronny_kobo-helouise-crop-top","http://www.shoptiques.com/products/french_connection-layla-lace-dress","http://www.shoptiques.com/products/de_rosairo-leather-5way-cardigan","http://www.shoptiques.com/products/betsy_moss-paula-dress-2","http://www.shoptiques.com/products/dvf-olivia-lace-dress-1","http://www.shoptiques.com/products/dvf-dakota-lace-dress","http://www.shoptiques.com/products/ronny_kobo-evie-bandage-skirt","http://www.shoptiques.com/products/dvf-white-lace-romper-1"],"color":"Quartz","colorName":"Multicolor","colorImage":"http://ecdn1.shoptiques.net/products/cae88183-f0eb-464e-9d53-d1a3c213c6e2_t.jpg","colorId":"182801","images":["http://ecdn2.shoptiques.net/products/ronny_kobo-helouise-crop-top-multicolor-4503973a_m.jpg"]},"world":false,"name":"Helouise Crop Top","id":"164629.182801","price":324,"priceRange":4,"description":"This slant-cropped Ronny Kobo pullover is punctuated with one contrast cuff. Crew neckline. Long sleeves.\r\n\r\nMeasures: 16.25\" shoulder to hem","__v":2,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/poschebykimd2974/ronny_kobo-helouise-crop-top-multicolor-4503973a_l.jpg"],"itemTags":{"auto":[],"text":["Clothing","Tops","Crop Tops","Helouise Crop Top","Multicolor"],"categories":["Clothing","Tops","Crop Tops","Helouise Crop Top"],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:38.185Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.226Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:38.185Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"owner":{"mongoId":"55ddd82318e959462dbc183c","profileID":"poschebykimd2974","name":"POSCHE By Kim D"},"parents":[{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}],"parent":{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}},{"_id":"55c91c3f5a2a48b51520ebd8","source_shoptiques_item":{"source":"shoptiques","name":"Dakota Lace Dress","idString":"p-163433","id":163433,"priceString":"$375.00","price":375,"loves":1,"description":"","brand":"DVF","categories":["Clothing","Dresses","LBD","Dakota Lace Dress"],"url":"http://www.shoptiques.com/products/dvf-dakota-lace-dress","related":["http://www.shoptiques.com/products/dvf-olivia-lace-dress-1","http://www.shoptiques.com/products/dvf-dakota-lace-dress","http://www.shoptiques.com/products/betsy_moss-paula-dress-2","http://www.shoptiques.com/products/de_rosairo-leather-5way-cardigan","http://www.shoptiques.com/products/dvf-purdy-crepe-jumpsuit","http://www.shoptiques.com/products/ronny_kobo-evie-bandage-skirt","http://www.shoptiques.com/products/dvf-white-lace-romper-1","http://www.shoptiques.com/products/french_connection-layla-lace-dress"],"color":"Black","colorName":"Black","colorImage":"http://ecdn1.shoptiques.net/products/59d2dbde-faad-4e45-bbff-f4140963bc11_t.jpg","colorId":"181500","images":["http://ecdn2.shoptiques.net/products/dvf-dakota-lace-dress-black-665fa344_m.jpg"]},"world":false,"name":"Dakota Lace Dress","id":"163433.181500","price":375,"priceRange":4,"description":"A beautiful black bodycon dress with scalloped edges, a hidden seam zipper closure, and full lining. Dry clean only. \r\n\r\nMeasures: 33\" L shoulder to hem","__v":2,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/poschebykimd2974/dvf-dakota-lace-dress-black-665fa344_l.jpg"],"itemTags":{"auto":[],"text":["Clothing","Dresses","LBD","Dakota Lace Dress","Black"],"categories":["Clothing","Dresses","LBD","Dakota Lace Dress"],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:47.196Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.229Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:47.196Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"owner":{"mongoId":"55ddd82318e959462dbc183c","profileID":"poschebykimd2974","name":"POSCHE By Kim D"},"parents":[{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}],"parent":{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}},{"_id":"55c91c475a2a48b51520ebed","source_shoptiques_item":{"source":"shoptiques","name":"Leather 5way Cardigan","idString":"p-163089","id":163089,"priceString":"$225.00","price":225,"loves":0,"description":"","brand":"De Rosairo","categories":["Clothing","Sweaters","Cardigans","Leather 5way Cardigan"],"url":"http://www.shoptiques.com/products/de_rosairo-leather-5way-cardigan","related":["http://www.shoptiques.com/products/ronny_kobo-evie-bandage-skirt","http://www.shoptiques.com/products/ronny_kobo-helouise-crop-top","http://www.shoptiques.com/products/de_rosairo-leather-5way-cardigan","http://www.shoptiques.com/products/dvf-white-lace-romper-1","http://www.shoptiques.com/products/dvf-purdy-crepe-jumpsuit","http://www.shoptiques.com/products/dvf-dakota-lace-dress","http://www.shoptiques.com/products/french_connection-layla-lace-dress","http://www.shoptiques.com/products/dvf-olivia-lace-dress-1"],"color":"Black with Quartz","colorName":"Black","colorImage":"http://ecdn2.shoptiques.net/products/5c27f511-d0e0-42f7-851d-8d7aa9c2b5ef_t.jpg","colorId":"181126","images":["http://ecdn1.shoptiques.net/products/de_rosairo-leather-5way-cardigan-black-55ab360f_m.jpg"]},"world":false,"name":"Leather 5way Cardigan","id":"163089.181126","price":225,"priceRange":4,"description":"Scoop neckline with hood, shoulder leather detail with peaked edge, felt placket, silk trim on front and side. Asymmetrical front and back. Falls to just below the knee. One of our signature pieces that is suitable for all occasions. Can be worn 5 different ways under a jacket, over a dress, or with your favorite jeans.","__v":2,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/poschebykimd2974/de_rosairo-leather-5way-cardigan-black-55ab360f_l.jpg"],"itemTags":{"auto":[],"text":["Clothing","Sweaters","Cardigans","Leather 5way Cardigan","Black"],"categories":["Clothing","Sweaters","Cardigans","Leather 5way Cardigan"],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:55.805Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.232Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:55.805Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"owner":{"mongoId":"55ddd82318e959462dbc183c","profileID":"poschebykimd2974","name":"POSCHE By Kim D"},"parents":[{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}],"parent":{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}},{"_id":"55c91c4a5a2a48b51520ebf2","source_shoptiques_item":{"source":"shoptiques","name":"Purdy Crepe Jumpsuit","idString":"p-162918","id":162918,"priceString":"$468.00","price":468,"loves":0,"description":"","brand":"DVF","categories":["Clothing","Jumpsuits & Rompers","Purdy Crepe Jumpsuit"],"url":"http://www.shoptiques.com/products/dvf-purdy-crepe-jumpsuit","related":["http://www.shoptiques.com/products/dvf-dakota-lace-dress","http://www.shoptiques.com/products/betsy_moss-paula-dress-2","http://www.shoptiques.com/products/french_connection-layla-lace-dress","http://www.shoptiques.com/products/dvf-white-lace-romper-1","http://www.shoptiques.com/products/ronny_kobo-helouise-crop-top","http://www.shoptiques.com/products/ronny_kobo-evie-bandage-skirt","http://www.shoptiques.com/products/dvf-purdy-crepe-jumpsuit","http://www.shoptiques.com/products/de_rosairo-leather-5way-cardigan"],"color":"Black","colorName":"Black","colorImage":"http://ecdn2.shoptiques.net/products/28ca44c3-6746-45ef-bf60-33d300d00868_t.jpg","colorId":"180926","images":["http://ecdn1.shoptiques.net/products/dvf-purdy-crepe-jumpsuit-black-447b941a_m.jpg"]},"world":false,"name":"Purdy Crepe Jumpsuit","id":"162918.180926","price":468,"priceRange":4,"description":"New for spring, the DVF Purdy is a versatile jumpsuit with a flattering cap sleeve. With a deep v-neck, banded waist, and self-tie belt. Hidden side zip and hook and eye closure and pockets.\r\n\r\nInseam measures: 34\"","__v":2,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/poschebykimd2974/dvf-purdy-crepe-jumpsuit-black-447b941a_l.jpg"],"itemTags":{"auto":[],"text":["Clothing","Jumpsuits & Rompers","Purdy Crepe Jumpsuit","Black"],"categories":["Clothing","Jumpsuits & Rompers","Purdy Crepe Jumpsuit"],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:58.617Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.235Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:58.617Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"owner":{"mongoId":"55ddd82318e959462dbc183c","profileID":"poschebykimd2974","name":"POSCHE By Kim D"},"parents":[{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}],"parent":{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}},{"_id":"55c91c4a5a2a48b51520ebf3","source_shoptiques_item":{"source":"shoptiques","name":"Olivia Lace Dress","idString":"p-162913","id":162913,"priceString":"$428.00","price":428,"loves":0,"description":"","brand":"DVF","categories":["Clothing","Dresses","LBD","Olivia Lace Dress"],"url":"http://www.shoptiques.com/products/dvf-olivia-lace-dress-1","related":["http://www.shoptiques.com/products/de_rosairo-leather-5way-cardigan","http://www.shoptiques.com/products/dvf-white-lace-romper-1","http://www.shoptiques.com/products/dvf-dakota-lace-dress","http://www.shoptiques.com/products/ronny_kobo-helouise-crop-top","http://www.shoptiques.com/products/french_connection-layla-lace-dress","http://www.shoptiques.com/products/dvf-purdy-crepe-jumpsuit","http://www.shoptiques.com/products/ronny_kobo-evie-bandage-skirt","http://www.shoptiques.com/products/betsy_moss-paula-dress-2"],"color":"Black","colorName":"Black","colorImage":"http://ecdn2.shoptiques.net/products/b668da15-306a-4a0d-b987-0a302d34458d_t.jpg","colorId":"180920","images":["http://ecdn2.shoptiques.net/products/dvf-olivia-lace-dress-1-black-4fdcabb4_m.jpg"]},"world":false,"name":"Olivia Lace Dress","id":"162913.180920","price":428,"priceRange":4,"description":"Our favorite Zarita stretch lace is back in a stunning camisole style. Perfect for summer events, the DVF Olivia features a black lace overlay with contrast lining, scalloped edging, and a flattering scoop front and back neckline. With side zip. Falls to above the knee.","__v":2,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/poschebykimd2974/dvf-olivia-lace-dress-1-black-4fdcabb4_l.jpg"],"itemTags":{"auto":[],"text":["Clothing","Dresses","LBD","Olivia Lace Dress","Black"],"categories":["Clothing","Dresses","LBD","Olivia Lace Dress"],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:58.972Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.238Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:58.971Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"owner":{"mongoId":"55ddd82318e959462dbc183c","profileID":"poschebykimd2974","name":"POSCHE By Kim D"},"parents":[{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}],"parent":{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}},{"_id":"55c91c4b5a2a48b51520ebf4","source_shoptiques_item":{"source":"shoptiques","name":"White Lace Romper","idString":"p-162907","id":162907,"priceString":"$498.00","price":498,"loves":1,"description":"","brand":"DVF","categories":["Clothing","Jumpsuits & Rompers","White Lace Romper"],"url":"http://www.shoptiques.com/products/dvf-white-lace-romper-1","related":["http://www.shoptiques.com/products/de_rosairo-leather-5way-cardigan","http://www.shoptiques.com/products/dvf-white-lace-romper-1","http://www.shoptiques.com/products/dvf-dakota-lace-dress","http://www.shoptiques.com/products/dvf-purdy-crepe-jumpsuit","http://www.shoptiques.com/products/french_connection-layla-lace-dress","http://www.shoptiques.com/products/ronny_kobo-helouise-crop-top","http://www.shoptiques.com/products/ronny_kobo-evie-bandage-skirt","http://www.shoptiques.com/products/dvf-olivia-lace-dress-1"],"color":"White","colorName":"White","colorImage":"http://ecdn2.shoptiques.net/products/ea871197-d4fe-4269-bd23-3b7439f46227_t.jpg","colorId":"180912","images":["http://ecdn1.shoptiques.net/products/dvf-white-lace-romper-1-white-f6a17dbe_m.jpg"]},"world":false,"name":"White Lace Romper","id":"162907.180912","price":498,"priceRange":4,"description":"The DVF Purdette is short and sweet with a flattering cap sleeve. A tailored romper with a deep v-neck, banded waist, and self-tie belt. Hidden side zip and hook and eye closure, pockets, and cuffed hem.","__v":2,"valid":true,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":false},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":["https://s3.amazonaws.com/if.kip.apparel.images/poschebykimd2974/dvf-white-lace-romper-1-white-f6a17dbe_l.jpg"],"itemTags":{"auto":[],"text":["Clothing","Jumpsuits & Rompers","White Lace Romper","White"],"categories":["Clothing","Jumpsuits & Rompers","White Lace Romper"],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:59.305Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.241Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:59.304Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"owner":{"mongoId":"55ddd82318e959462dbc183c","profileID":"poschebykimd2974","name":"POSCHE By Kim D"},"parents":[{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}],"parent":{"_id":"55c91c345a2a48b51520ebbc","source_shoptiques_store":{"source":"shoptiques","name":"POSCHE By Kim D","url":"http://www.shoptiques.com/boutiques/POSCHE-By-Kim-D","neighborhood":"Wyckoff","addressText":"1210 Hamburg Turnpike, Wayne","city":"Wayne","state":"NJ","description":"Posche by Kim D provides a great selection of trendy and chic clothing for every woman alongside jewelry and accessories. \r\n","image":"http://ecdn2.shoptiques.net/boutiques/aa8c4195-6bca-41e2-9c71-5126adb25503_l.jpg","followersCount":"1","idString":"2974","id":2974},"name":"POSCHE By Kim D","id":"poschebykimd2974","world":true,"valid":true,"__v":0,"flags":{"mustProcessImages":true,"mustUpdateElasticsearch":true},"meta":{"humanTags":{"colors":[]}},"testData":false,"reports":[],"itemImageURL":[],"itemTags":{"auto":[],"text":[],"categories":[],"colors":[]},"comments":[],"rejects":[],"faves":[],"tags":[],"source_cloudsight":{"categories":[]},"source_justvisual":{"keywords":[],"images":[]},"source_instagram_post":{"created":"2015-08-10T21:48:36.674Z","tags":[],"local_path":[]},"source_google":{"opening_hours":[],"types":[]},"source_meetup":{"event_hosts":[]},"updated_time":"2015-09-16T21:59:21.298Z","permissions":{"admins":[],"viewers":[]},"time":{"created":"2015-08-10T21:48:36.673Z"},"style":{"maps":{"localMapArray":[]}},"landmarkCategories":[],"subType":[],"loc":{"coordinates":[-74.24397619999999,40.9629038],"type":"Point"},"parents":[]}}];

    $scope.searchQuery = function(type){
        if (type === 'button') {
            $scope.items = [];
            $scope.searchIndex = 0;
        }

        httpBool = true;

        //* * * * * * * * * * * * *
        //Tap images to see more?
        //* * * * * * * * * * * * *

        //check if location was modified by user
        if ($scope.userCity !== historyCity){

            historyCity = $scope.userCity;
            var encodeCity = encodeURI(historyCity);

            $http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+encodeCity+'&key=AIzaSyCABdI8Lpm5XLQZh-O4SpmShqMEKqKteUg').
                then(function(res) {

                    if (res.data.results[0] && res.data.results[0].geometry){
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



        }
        else {
            $scope.searchItems();
        }

    };

    //https://kipapp.co/styles/api/items/search?page=
    //http://pikachu.kipapp.co/api/items/search?page



    $scope.searchItems = function(){
        var encodeQuery = null;
        var encodeCity = null;
        
        var encodeQuery = encodeURI($scope.query);
        var encodeCity = encodeURI($scope.userCity);
        
        $location.path('/q/'+ encodeQuery + '/' + userLat + '/' + userLng + '/' + encodeCity);
        if ($scope.newQuery) {
            $scope.newQuery = false;
        }

        $http.post('https://kipapp.co/styles/api/items/search?page='+$scope.searchIndex, {
            text: $scope.query,
            loc: {lat: userLat, lon: userLng},
            radius: 5,
        }).
            then(function(response) {
            
//                location.path('/q/'+ encodeQuery + '/' + userLat + '/' + userLng + '/' + encodeCity);
                location.skipReload().path('/q/'+ encodeQuery + '/' + userLat + '/' + userLng + '/' + encodeCity).replace();
                //* * * * * * * * * * * * *
                //if no results, re-query with US size radius
                //* * * * * * * * * * * * *

                $scope.items = $scope.items.concat(response.data.results);

                if ($scope.items.length < 1){
                     $scope.noResults = true;
                     console.log('no results');
                }

//                console.log('data', response.data);

                if ($scope.items && $scope.items.length){
                    $scope.noResults = false;
                    for (var i = 0; i < $scope.items.length; i++) {
                        
                        // normalize phone numbers
                        if ($scope.items[i].parent.tel) {
                            var tmpTel = $scope.items[i].parent.tel;
                            tmpTel = tmpTel.replace(/[+-\s]/g, '');
                            
                            if (tmpTel.length === 11) {
                                tmpTel = tmpTel.replace(/^1/g, '');   
                            }
                            
                            $scope.items[i].parent.tel = tmpTel.slice(0,3) + '-' + tmpTel.slice(2,5) + '-' + tmpTel.slice(6);
                            
                        }
                        //filter out usernames
                        if ($scope.items[i].loc && !$scope.items[i].profileID){

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
                        else {
                            if (i > -1) { //remove users from results
                                $scope.items.splice(i,1);
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
    
    $scope.searchOneItem = function(){

        console.log('asdf');


        $scope.mongoId = $scope.mongoId.replace(/[^\w\s]/gi, ''); //remove special char
        $scope.mongoId = $scope.mongoId.replace(/\s+/g,' ').trim(); //remove extra spaces
        
        var encodeId = encodeURI($scope.mongoId);

        $location.path('/t/'+ encodeId);
        // if ($scope.newQuery) {
        //     $scope.newQuery = false;
        // }

        $http.get('https://kipapp.co/styles/api/items/'+$scope.mongoId, {}).
            then(function(response) {
            
                //location.path('/t/'+ encodeId);
                //location.skipReload().path('/q/'+ encodeQuery + '/' + userLat + '/' + userLng + '/' + encodeCity).replace();
                //* * * * * * * * * * * * *
                //if no results, re-query with US size radius
                //* * * * * * * * * * * * * 

               //  console.log(response.data.item);

               // $scope.items = response.data.item ;
                $scope.items = $scope.items.concat(response.data.item);

                if ($scope.items.length < 1){
                     $scope.noResults = true;
                     console.log('no results');
                }

                console.log('data', response.data);

                if ($scope.items && $scope.items.length){
                    $scope.noResults = false;
                    for (var i = 0; i < $scope.items.length; i++) {
                        
                        // normalize phone numbers
                        if ($scope.items[i].parent.tel) {
                            var tmpTel = $scope.items[i].parent.tel;
                            tmpTel = tmpTel.replace(/[+-\s]/g, '');
                            
                            if (tmpTel.length === 11) {
                                tmpTel = tmpTel.replace(/^1/g, '');   
                            }
                            
                            $scope.items[i].parent.tel = tmpTel.slice(0,3) + '-' + tmpTel.slice(2,5) + '-' + tmpTel.slice(6);
                            
                        }
                        //filter out usernames
                        if ($scope.items[i].loc && !$scope.items[i].profileID){

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
                        else {
                            if (i > -1) { //remove users from results
                                $scope.items.splice(i,1);
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
            }). then(function (res) {
            $timeout(function() {$scope.showReportModal = null;}, 15000);    
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
    }
    else if ($routeParams.mongoId) { //process singleItem
        $scope.mongoId = decodeURI($routeParams.mongoId);
        $scope.searchOneItem();
    }
    else {
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
            $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+res.data.lat+','+res.data.lng+'&sensor=true').
            then(function(res2) {
                for (var i = 0; i < res2.data.results.length; i++) {
                    if (res2.data.results[i].geometry.location_type == 'APPROXIMATE'){
                        res2.data.results[i].formatted_address = res2.data.results[i].formatted_address.replace(", USA", ""); //remove COUNTRY from USA rn (temp)
                        $scope.userCity = res2.data.results[i].formatted_address;
                        historyCity = $scope.userCity;
                        $scope.loadingLoc = false;
                        break;
                    }
                }
            }, function() {
            });

        }, function(res) {
            //if IP broken get HTML5 geoloc
            $scope.getGPSLocation();
        });

        //check if mobile or tablet. warning: there is no perfect way to do this, so need to keep testing on this.
        //via: http://jstricks.com/detect-mobile-devices-javascript-jquery/
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            $scope.getGPSLocation(); //get GPS loc cause mobile device
            $scope.hideGPSIcon = true;
        }
    }



    angular.element(document).ready(function () {
        $scope.windowHeight = $window.height + 'px'; //position
        $scope.windowWidth = window.width + 'px';
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

simpleSearchApp.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter, {'event': event});
                    });

                    event.preventDefault();
                }
            });
        };
    });

simpleSearchApp.directive('tooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).hover(function(){
                // on mouseenter
                $(element).tooltip('show');
            }, function(){
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

  var getSearch = function(){
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
.filter('tel', function() {
    return function(tel) {
        if (!tel) { return '';}
        
        if (tel.length === 10) {
            
        }
    }
})