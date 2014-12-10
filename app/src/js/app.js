'use strict';

var app = angular.module('IF', ['ngRoute','ngSanitize','ngAnimate','ngTouch', 'ngMessages', 'tidepoolsFilters','tidepoolsServices','leaflet-directive','angularFileUpload', 'IF-directives',  'mgcrea.ngStrap', 'angularSpectrumColorpicker', 'ui.slider', 'swipe', 'monospaced.elastic', 'ui.calendar'])
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

    //================================================
    
    //================================================
    // Add an interceptor for AJAX errors
    //================================================
	$httpProvider.interceptors.push(function($q, $location) {
    	return {
    		'request': function(request) {
	    			//@IFDEF PHONEGAP
	    			if (request.server) {
		    			request.url = 'https://bubbl.li' + request.url; 
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
			    	$location.path('/login');
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
      when('/', {templateUrl: 'components/home/home.html', controller: 'HomeController'}).
      when('/nearby', {templateUrl: 'components/nearby/nearby.html', controller: 'NearbyCtrl'}).
      when('home', {templateUrl: 'components/home/home.html', controller: 'HomeController'}).
      when('/nearby', {templateUrl: 'components/nearby/nearby.html', controller: 'WorldRouteCtrl'}).
      
      when('/login', {templateUrl: 'components/user/login.html', controller: 'LoginCtrl'}).
      when('/forgot', {templateUrl: 'components/user/forgot.html', controller: 'ForgotCtrl'}).
      when('/reset/:token', {templateUrl: 'components/user/change-password.html', controller: 'ResetCtrl'}).
      when('/signup', {templateUrl: 'components/user/signup.html', controller: 'SignupCtrl'}).
      when('/signup/:incoming', {templateUrl: 'components/user/signup.html', controller: 'SignupCtrl'}).

      when('/auth/:type', {templateUrl: 'components/user/loading.html', controller: 'resolveAuth'}).
      when('/auth/:type/:callback', {templateUrl: 'components/user/loading.html', controller: 'resolveAuth'}).
      
      when('/profile', {redirectTo:'/profile/worlds'}).
      when('/profile/:tab', {templateUrl: 'components/user/user.html', controller: 'UserController'}).
      when('/profile/:tab/:incoming', {templateUrl: 'components/user/user.html', controller: 'UserController'}).
      when('/w/:worldURL', {templateUrl: 'components/world/world.html', controller: 'WorldController'}).
      when('/w/:worldURL/upcoming', {templateUrl: 'components/world/upcoming.html', controller: 'WorldController'}).
      when('/w/:worldURL/messages', {templateUrl: 'components/world/messages/messages.html', controller: 'MessagesController'}).
      when('/w/:worldURL/:landmarkURL', {templateUrl: 'components/world/landmark.html', controller: 'LandmarkController'}).
      when('/w/:worldURL/category/:category', {templateUrl: 'components/world/category.html', controller: 'CategoryController'}).

      
      when('/edit/w/:worldURL/landmarks', {templateUrl: 'components/editor/landmark-editor.html', controller: 'LandmarkEditorController', resolve: {loggedin: checkLoggedin}}).
      when('/edit/w/:worldURL/', {templateUrl: 'components/edit/edit_world.html', controller: 'EditController', resolve: {loggedin: checkLoggedin}}).
	  when('/edit/w/:worldURL/:view', {templateUrl: 'components/edit/edit_world.html', controller: 'EditController', resolve: {loggedin: checkLoggedin}}).
	  when('/edit/walkthrough/:_id', {templateUrl: 'components/edit/walkthrough/walkthrough.html', controller: 'WalkthroughController', resolve: {loggedin: checkLoggedin}}).
      
      when('/meetup', {templateUrl: 'components/tour/meetup.html', controller: 'MeetupController'}).
      when('/welcome', {templateUrl: 'components/tour/welcome.html', controller: 'WelcomeController'}).

      
      when('/search/:searchQuery', {templateUrl: 'components/search/search.html', controller: 'SearchController'}).
      
      when('/twitter/:hashTag', {templateUrl: 'partials/tweet-list.html', controller: 'TweetlistCtrl'}).
      when('/instagram/:hashTag', {templateUrl: 'partials/insta-list.html', controller: 'InstalistCtrl'}).

      //when('/user/:userID', {templateUrl: 'partials/user-view.html', controller: UserCtrl, resolve: {loggedin: checkLoggedin}}).

      otherwise({redirectTo: '/'});
      
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
lockerManager.getCredentials().then(function(credentials) {
userManager.signin(credentials.username, credentials.password).then(function(success) {
		userManager.checkLogin().then(function(user) {
		$scope.user = user;
		});
	}, function (reason) {
		console.log('credential signin error', reason)
	});
}, function(err) {
	console.log('credential error', error); 
});
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

