'use strict';

var app = angular.module('IF', ['ngRoute','tidepoolsFilters','tidepoolsServices','ngSanitize','ui.bootstrap', 'leaflet-directive','infinite-scroll','$strap.directives','IF-directives','ngMessages', 'ngAnimate']).
  config(function($routeProvider,$locationProvider, $httpProvider, $animateProvider) {
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
              //determine name to display on login (should check for name extension before adding...)
              if (user.facebook){
                  $rootScope.userName = user.facebook.name;
              }
              else if (user.twitter){
                  $rootScope.userName = user.twitter.displayName;
              }
              else if (user.local){
                  $rootScope.userName = user.local.email;
              }
              else {
                  $rootScope.userName = "Me";
              }

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
      when('/login', {templateUrl: 'components/auth/login.html', controller: LoginCtrl}).
      when('/forgot', {templateUrl: 'components/auth/forgot.html', controller: ForgotCtrl}).
      when('/reset/:token', {templateUrl: 'components/auth/change-password.html', controller: ResetCtrl}).
      when('/signup', {templateUrl: 'components/auth/signup.html', controller: SignupCtrl}).
      when('/profile', {templateUrl: 'components/auth/profile.html', controller: ProfileCtrl, resolve: {loggedin: checkLoggedin}}).

      // when('/nearby', {templateUrl: 'partials/nearby-world.html', controller: NearbyWorldCtrl}).
      
      when('/w/:worldURL', {templateUrl: 'components/world/world.html', controller: WorldController}).
      when('/w/:worldURL/:landmarkURL', {templateUrl: 'components/world/landmark.html', controller: LandmarkController}).
      when('/w/:worldURL/category/:category', {templateUrl: 'components/world/category.html', controller: CategoryController}).
      
      //when('/w/:worldID/edit', {templateUrl: 'partials/world-edit.html', controller: WorldEditCtrl}). 
      // when('/world/:bubbleId/:option', {templateUrl: 'partials/world-detail.html', controller: WorldDetailCtrl}).

      when('/list/:category/:filter', {templateUrl: 'partials/list.html', controller: ListCtrl}).

      //when('/w/:worldID/:pageID', {templateUrl: 'partials/menu.html', controller: MenuCtrl}).

      //when('/post/:landmarkID', {templateUrl: 'partials/landmark-view.html', controller: LandmarkViewCtrl}).
      //when('/post/:landmarkID/:option', {templateUrl: 'partials/landmark-view.html', controller: LandmarkViewCtrl}).
      //when('/post/:landmarkID/edit', {templateUrl: 'partials/landmark-edit.html', controller: LandmarkEditCtrl}).

      when('/newpost', {templateUrl: 'partials/landmark-new.html'}). 
      when('/newpost/:type', {templateUrl: 'partials/landmark-new-type.html', controller: LandmarkNewCtrl, resolve: {loggedin: checkLoggedin}}).

      when('/newworld', {templateUrl: 'components/editor/world-maker.html', controller: WorldMakerCtrl, resolve: {loggedin: checkLoggedin}}).
      when('/newworld/:projectID', {templateUrl: 'components/editor/world-maker.html', controller: WorldMakerCtrl, resolve: {loggedin: checkLoggedin}}).
      
      when('/edit/:worldURL', {templateUrl: 'components/edit/edit_world.html', controller: EditController, resolve: {loggedin: checkLoggedin}}).
	  when('/edit/:worldID/landmarks', {templateUrl: 'components/editor/landmark-editor.html', controller: LandmarkEditorController, resolve: {loggedin: checkLoggedin}}).
	    
      
      when('/search/:searchQuery', {templateUrl: 'components/search/search.html', controller: SearchController}).
      
      // when('/twitter/:', {templateUrl: 'partials/talk-list.html', controller: TalklistCtrl}).
      when('/twitter/:hashTag', {templateUrl: 'partials/tweet-list.html', controller: TweetlistCtrl}).
      when('/instagram/:hashTag', {templateUrl: 'partials/insta-list.html', controller: InstalistCtrl}).
      when('/chat/:worldID', {templateUrl:'partials/chat.html', controller:ChatCtrl}).

      //when('/user/:userID', {templateUrl: 'partials/user-view.html', controller: UserCtrl, resolve: {loggedin: checkLoggedin}}).

      otherwise({redirectTo: '/'}); 
      
      
      //animation

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

