'use strict';

var app = angular.module('IF', ['ngRoute','tidepoolsFilters','tidepoolsServices','ngSanitize','leaflet-directive','angularFileUpload', 'IF-directives', 'ngAnimate', 'mgcrea.ngStrap', 'angularSpectrumColorpicker', 'ui.slider', 'monospaced.elastic'])
  .config(function($routeProvider,$locationProvider, $httpProvider, $animateProvider, $tooltipProvider) {
  // $httpProvider.defaults.useXDomain = true;
	var reg = $animateProvider.classNameFilter(/if-animate/i);
	console.log(reg);
    //================================================
    // Check if the user is connected
    //================================================
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){

      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/api/user/loggedin').success(function(user){


        // Authenticated
        if (user !== '0'){

              if (user._id){
                $rootScope.userID = user._id;
              }
              //determine name to display on login (should check for name extension before adding...)
              if (user.name){
                  $rootScope.userName = user.name;
              }
              else if (user.facebook){
                  $rootScope.userName = user.facebook.name;
              }
              else if (user.twitter){
                  $rootScope.userName = user.twitter.displayName;
              }
              else if (user.meetup){
                  $rootScope.userName = user.meetup.displayName;
              }
              else if (user.local){
                  $rootScope.userName = user.local.email;
              }
              else {
                  $rootScope.userName = "Me";
              }
              
          $rootScope.avatar = user.avatar;
          $rootScope.showLogout = true;

          console.log($rootScope.showLogout);
          
          $timeout(deferred.resolve, 0);
        }

        // Not Authenticated
        else {
          $rootScope.showLogout = false;
          $rootScope.message = 'You need to log in.';
          $timeout(function(){deferred.reject();}, 0);
          $location.url('/login');
        }
      });

      return deferred.promise;
    };
    //================================================
    
    //================================================
    // Add an interceptor for AJAX errors
    //================================================
    $httpProvider.responseInterceptors.push(function($q, $location) {
      return function(promise) {
        return promise.then(
          // Success: just return the response
          function(response){
            return response;
          }, 
          // Error: check the error status to get only the 401
          function(response) {
            if (response.status === 401)
            	$location.url('/login');
            return $q.reject(response);
          }
        );
      }
    });
    //================================================


    //================================================
    // Define all the routes
    //================================================
  $routeProvider.
      when('/', {templateUrl: 'components/nearby/nearby.html', controller: WorldRouteCtrl}).
      when('/nearby', {templateUrl: 'components/nearby/nearby.html', controller: WorldRouteCtrl}).
      when('/login', {templateUrl: 'components/user/login.html', controller: LoginCtrl}).
      when('/forgot', {templateUrl: 'components/user/forgot.html', controller: ForgotCtrl}).
      when('/reset/:token', {templateUrl: 'components/user/change-password.html', controller: ResetCtrl}).
      when('/signup', {templateUrl: 'components/user/signup.html', controller: SignupCtrl}).
      //when('/profile', {templateUrl: 'components/user/profile.html', controller: ProfileCtrl, resolve: {loggedin: checkLoggedin}}).
      //when('/profile/:incoming', {templateUrl: 'components/user/profile.html', controller: ProfileCtrl, resolve: {loggedin: checkLoggedin}}).
      when('/auth/:type', {templateUrl: 'components/user/loading.html', controller: resolveAuth}).
      when('/auth/:type/:callback', {templateUrl: 'components/user/loading.html', controller: resolveAuth}).
      // when('/connect/:type', {templateUrl: '_self'}).
      // when('/unlink/:type', {templateUrl: '_self'}).
      // when('/nearby', {templateUrl: 'partials/nearby-world.html', controller: NearbyWorldCtrl}).
      
      when('/profile', {redirectTo:'/profile/worlds'}).
      when('/profile/:tab', {templateUrl: 'components/user/user.html', controller: UserController, resolve: {loggedin: checkLoggedin}}).
      when('/profile/:tab/:incoming', {templateUrl: 'components/user/user.html', controller: UserController, resolve: {loggedin: checkLoggedin}}).
      
      when('/w/:worldURL', {templateUrl: 'components/world/world.html', controller: WorldController}).
      when('/w/:worldURL/upcoming', {templateUrl: 'components/world/upcoming.html', controller: WorldController}).
      when('/w/:worldURL/messages', {templateUrl: 'components/world/messages/messages.html', controller: 'MessagesController'}).
      when('/w/:worldURL/:landmarkURL', {templateUrl: 'components/world/landmark.html', controller: LandmarkController}).
      when('/w/:worldURL/category/:category', {templateUrl: 'components/world/category.html', controller: CategoryController}).

      
      //when('/w/:worldID/edit', {templateUrl: 'partials/world-edit.html', controller: WorldEditCtrl}). 
      // when('/world/:bubbleId/:option', {templateUrl: 'partials/world-detail.html', controller: WorldDetailCtrl}).

      when('/list/:category/:filter', {templateUrl: 'partials/list.html', controller: ListCtrl}).

      //when('/w/:worldID/:pageID', {templateUrl: 'partials/menu.html', controller: MenuCtrl}).

      //when('/post/:landmarkID', {templateUrl: 'partials/landmark-view.html', controller: LandmarkViewCtrl}).
      //when('/post/:landmarkID/:option', {templateUrl: 'partials/landmark-view.html', controller: LandmarkViewCtrl}).
      //when('/post/:landmarkID/edit', {templateUrl: 'partials/landmark-edit.html', controller: LandmarkEditCtrl}).

      when('/newworld', {templateUrl: 'components/editor/world-maker.html', controller: WorldMakerCtrl, resolve: {loggedin: checkLoggedin}}).
      when('/newworld/:projectID', {templateUrl: 'components/editor/world-maker.html', controller: WorldMakerCtrl, resolve: {loggedin: checkLoggedin}}).
      
      when('/edit/w/:worldURL/landmarks', {templateUrl: 'components/editor/landmark-editor.html', controller: LandmarkEditorController, resolve: {loggedin: checkLoggedin}}).
      
      when('/edit/w/:worldURL/', {templateUrl: 'components/edit/edit_world.html', controller: EditController, resolve: {loggedin: checkLoggedin}}).

	    when('/edit/w/:worldURL/:view', {templateUrl: 'components/edit/edit_world.html', controller: EditController, resolve: {loggedin: checkLoggedin}}).
	 
	    when('/edit/walkthrough/:_id', {templateUrl: 'components/edit/walkthrough/walkthrough.html', controller: WalkthroughController, resolve: {loggedin: checkLoggedin}}).
      
      when('/meetup', {templateUrl: 'components/tour/meetup.html', controller: MeetupController}).
      when('/welcome', {templateUrl: 'components/tour/welcome.html', controller: WelcomeController}).
      
      when('/search/:searchQuery', {templateUrl: 'components/search/search.html', controller: SearchController}).
      
      // when('/twitter/:', {templateUrl: 'partials/talk-list.html', controller: TalklistCtrl}).
      when('/twitter/:hashTag', {templateUrl: 'partials/tweet-list.html', controller: TweetlistCtrl}).
      when('/instagram/:hashTag', {templateUrl: 'partials/insta-list.html', controller: InstalistCtrl}).

      //when('/user/:userID', {templateUrl: 'partials/user-view.html', controller: UserCtrl, resolve: {loggedin: checkLoggedin}}).

      otherwise({redirectTo: '/'}); 
      
      // use the HTML5 History API
      $locationProvider.html5Mode(true);
      
      //animation

	angular.extend($tooltipProvider.defaults, {
  		animation: 'am-fade',
  		placement: 'right',
  		delay: {show: '0', hide: '250'}
  	});

})
 .run(function($rootScope, $http, $location){
    $rootScope.message = '';

    // Logout function is available in any pages
    $rootScope.logout = function(){
      $rootScope.message = 'Logged out.';
      $http.get('/api/user/logout');
      $rootScope.showLogout = false;
      $location.url('/');
    };
  });

