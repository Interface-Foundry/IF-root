simpleSearchApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
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