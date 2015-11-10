var simpleSearchApp = angular.module('simpleSearchApp', ['ngHolder', 'angularMoment', 'ngRoute', 'angular-inview', 'smoothScroll'])
    .filter('httpsURL', [function() {

        return function(input) {
            if (input.indexOf('https') > -1) {
                //do nothing
            } else {
                var regex = /http/gi;
                input = input.replace(regex, 'https');
            }
            return input;
        };
    }])
    .factory('ResCache', ['$cacheFactory', function($cacheFactory) {
        return $cacheFactory('resCache', {
            capacity: 3
        });
    }])
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
    ]);
