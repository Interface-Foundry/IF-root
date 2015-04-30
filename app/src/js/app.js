'use strict';

var app = angular.module('IF', ['ngRoute','ngSanitize','ngAnimate','ngTouch', 'ngMessages', 'tidepoolsFilters','tidepoolsServices','leaflet-directive','angularFileUpload', 'IF-directives',  'dbaq.emoji', 'mgcrea.ngStrap', 'angularSpectrumColorpicker', 'ui.slider', 'swipe', 'monospaced.elastic', 'ui.calendar', 'textAngular', 'ui.bootstrap'])
  .config(function($routeProvider, $locationProvider, $httpProvider, $animateProvider, $tooltipProvider, $provide) {
  // $httpProvider.defaults.useXDomain = true;
	var reg = $animateProvider.classNameFilter(/if-animate/i);
	console.log(reg);
    //================================================
    // Check if the user is connected
    //================================================


var checkLoggedin = function(userManager) {
  return userManager.checkLogin();
}

var checkAdminStatus = function(userManager, $location) {
	userManager.checkAdminStatus()
	.then(function(isAdmin) {
		if (isAdmin) {
			return true;
		} else {
			return $location.path('/');
		}
	}, function(err) {
		return $location.path('/');
	});
}

var updateTitle = function($rootScope) {
  angular.extend($rootScope, {globalTitle: 'Kip'});
}

// var setWelcome = function(welcomeService) {
//   welcomeService.needsWelcome = true;
// }

    //================================================
    
    //================================================
    // Add an interceptor for AJAX errors
    //================================================
	$httpProvider.interceptors.push(function($q, $location, lockerManager, ifGlobals) {
    	return {
    		'request': function(request) {
	    			//@IFDEF PHONEGAP
	    			if (request.server) { //interceptor for requests that need auth--gives fb auth or basic auth

              // TODO use a environment-specific config
              // http://stackoverflow.com/a/18343298
		    			// request.url = 'https://kipapp.co' + request.url;
              request.url = 'http://192.168.1.6:2997' + request.url;

		    			if (ifGlobals.username&&ifGlobals.password) {
							request.headers['Authorization'] = ifGlobals.getBasicHeader();
							//console.log(request);
						} else if (ifGlobals.fbToken) {
							request.headers['Authorization'] = 'Bearer '+ifGlobals.fbToken;
						}
	    			}
	    			//@ENDIF
				return request;
    		},
	    	'response': function(response) {
		    	//do something on success
		    	return response;
	    	},
	    	'responseError': function(rejection) {
		    	if (rejection.status === 401) {
			    	//$location.path('/login');
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

  when('/', {
    templateUrl: 'components/home/home.html', 
    controller: 'HomeController', 
    resolve: {
      'updateTitle': updateTitle
    }
  }).
  when('/nearby', {
    templateUrl: 'components/nearby/nearby.html', 
    controller: 'NearbyCtrl'
  }).
  when('/home', {
    templateUrl: 'components/home/home.html', 
    controller: 'HomeController'
  }).
  when('/nearby', {
    templateUrl: 'components/nearby/nearby.html', 
    controller: 'WorldRouteCtrl'
  }).
  when('/login', {
    templateUrl: 'components/user/login.html', 
    controller: 'LoginCtrl'
  }).
  when('/forgot', {
    templateUrl: 'components/user/forgot.html', 
    controller: 'ForgotCtrl'
  }).
  when('/reset/:token', {
    templateUrl: 'components/home/home.html', 
    controller: 'HomeController'
  }).
  when('/signup', {
    templateUrl: 'components/user/signup.html', 
    controller: 'SignupCtrl'
  }).
  when('/signup/:incoming', {
    templateUrl: 'components/user/signup.html', 
    controller: 'SignupCtrl'
  }).

  when('/auth/:type', {
    templateUrl: 'components/user/loading.html', 
    controller: 'resolveAuth'
  }).
  when('/auth/:type/:callback', {
    templateUrl: 'components/user/loading.html', 
    controller: 'resolveAuth'
  }).
  
  when('/profile', {
    redirectTo:'/profile/worlds'
  }).
  when('/profile/:tab', {
    templateUrl: 'components/user/user.html', 
    controller: 'UserController'
  }).
  when('/profile/:tab/:incoming', {
    templateUrl: 'components/user/user.html', 
    controller: 'UserController'
  }).
  when('/w/:worldURL', {
    templateUrl: 'components/world/world.html', 
    controller: 'WorldController'
  }).
  when('/w/:worldURL/upcoming', {
    templateUrl: 'components/world/upcoming.html', 
    controller: 'WorldController'
  }).
  when('/w/:worldURL/messages', {
    templateUrl: 'components/world/messages/messages.html', 
    controller: 'MessagesController'
  }).

  when('/w/:worldURL/schedule', {
    templateUrl: 'components/world/subviews/schedule.html', 
    controller: 'ScheduleController'
  }).
  when('/w/:worldURL/instagram', {
    templateUrl: 'components/world/subviews/instagram.html', 
    controller: 'InstagramListController'
  }).
  when('/w/:worldURL/twitter', {
    templateUrl: 'components/world/subviews/twitter.html', 
    controller: 'TwitterListController'
  }).
  when('/w/:worldURL/contestentries/:hashTag', {
    templateUrl: 'components/world/subviews/contestentries.html', 
    controller: 'ContestEntriesController'
  }).

  when('/w/:worldURL/search', {
    templateUrl: 'components/world/search.html', 
    controller: 'SearchController'
  }).
  when('/w/:worldURL/search/all', {
    templateUrl: 'components/world/search.html', 
    controller: 'SearchController'
  }).
  when('/w/:worldURL/search/category/:category', {
    templateUrl: 'components/world/search.html', 
    controller: 'SearchController'
  }).
  when('/w/:worldURL/search/text/:text', {
    templateUrl: 'components/world/search.html', 
    controller: 'SearchController'
  }).

  when('/w/:worldURL/:landmarkURL', {
    templateUrl: 'components/world/landmark.html', 
    controller: 'LandmarkController'
  }).
  when('/w/:worldURL/category/:category', {
    templateUrl: 'components/world/category.html', 
    controller: 'CategoryController'
  }).
  
  when('/edit/w/:worldURL/landmarks', {
    templateUrl: 'components/edit/landmark-editor.html', 
    controller: 'LandmarkEditorController', 
    resolve: {
      loggedin: checkLoggedin
    }
  }).
  when('/edit/w/:worldURL/', {
    templateUrl: 'components/edit/edit_world.html', 
    controller: 'EditController', 
    resolve: {
      loggedin: checkLoggedin
    }
  }).
  when('/edit/w/:worldURL/:view', {
    templateUrl: 'components/edit/edit_world.html', 
    controller: 'EditController', 
    resolve: {
      loggedin: checkLoggedin
    }
  }).
  when('/edit/walkthrough/:_id', {
    templateUrl: 'components/edit/walkthrough/walkthrough.html', 
    controller: 'WalkthroughController', 
    resolve: {
      loggedin: checkLoggedin
    }
  }).

  when('/c/:cityName/search/:latLng', {
    templateUrl: 'components/world/citySearch.html', 
    controller: 'SearchController'
  }).
  when('/c/:cityName/search/:latLng/category/:category', {
    templateUrl: 'components/world/citySearch.html', 
    controller: 'SearchController'
  }).
  when('/c/:cityName/search/:latLng/text/:text', {
    templateUrl: 'components/world/citySearch.html', 
    controller: 'SearchController'
  }).
    
  when('/meetup', {
    templateUrl: 'components/tour/meetup.html', 
    controller: 'MeetupController'
  }).
  when('/welcome', {
    templateUrl: 'components/tour/welcome.html', 
    controller: 'WelcomeController'
  }).
  
  when('/twitter/:hashTag', {
    templateUrl: 'partials/tweet-list.html', 
    controller: 'TweetlistCtrl'
  }).

	when('/su/announcements/:region', {
    templateUrl: 'components/super_user/announcements/superuser_announcements.html', 
    controller: 'SuperuserAnnouncementController', 
    resolve: {
      isAdmin: checkAdminStatus
    }
  }).
	when('/su/contests/:region', {
    templateUrl: 'components/super_user/contests/superuser_contests.html', 
    controller: 'SuperuserContestController', 
    resolve: {
      isAdmin: checkAdminStatus
    }
  }).
	when('/su/entries/:region', {
    templateUrl: 'components/super_user/entries/superuser_entries.html', 
    controller: 'SuperuserEntriesController', 
    resolve: {
      isAdmin: checkAdminStatus
    }
  }).
	when('/contest/:region', {
    templateUrl: 'components/contest/contest.html', 
    controller: 'ContestController'
  }).
  otherwise({
    redirectTo: '/'
  });
    // when('/user/:userID', {templateUrl: 'partials/user-view.html', controller: UserCtrl, resolve: {loggedin: checkLoggedin}}).

      
//@IFDEF WEB
$locationProvider.html5Mode({
	enabled: true
});
//@ENDIF

angular.extend($tooltipProvider.defaults, {
	animation: 'am-fade',
	placement: 'right',
	delay: {show: '0', hide: '250'}
});

})
.run(function($rootScope, $http, $location, userManager, lockerManager){
	
	//@IFDEF WEB
	userManager.checkLogin();
	//@ENDIF
	
	
	//@IFDEF PHONEGAP
	navigator.splashscreen.hide();
	//@ENDIF
	
//@IFDEF KEYCHAIN
/*
lockerManager.getCredentials().then(function(credentials) {
userManager.signin(credentials.username, credentials.password).then(function(success) {
		userManager.checkLogin().then(function(success) {
			console.log(success);
		});
	}, function (reason) {
		console.log('credential signin error', reason)
	});
}, function(err) {
	console.log('credential error', error); 
});
*/
//@ENDIF

});

//@ifdef PHONEGAP
document.addEventListener('deviceready', onDeviceReady, true);
function onDeviceReady() {
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['IF']);
	});
}
//@endif

//@ifdef WEB
angular.element(document).ready(function() {
	angular.bootstrap(document, ['IF']);

});
//@endif

app.run(['$route', '$timeout', '$rootScope', '$location', function ($route, $timeout, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
                $timeout(function() {
                  $rootScope.pageLoading = false;
                }, 0.5 * 1000);
            });
        }
        return original.apply($location, [path]);
    };
}]);


  app.run(function() {
      FastClick.attach(document.body);
  });

