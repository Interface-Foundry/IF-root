// 'use strict';

// var app = angular.module('IF', ['ngRoute','tidepoolsFilters','tidepoolsServices','ngSanitize','ui.bootstrap', 'leaflet-directive','infinite-scroll','$strap.directives','IF-directives']).
//   config(['$routeProvider', function($routeProvider) {
//   $routeProvider.
//       when('/', {templateUrl: 'partials/loading.html', controller: WorldRouteCtrl}).

//       // when('/nearby', {templateUrl: 'partials/nearby-world.html', controller: NearbyWorldCtrl}).

//       when('/w/:worldURL', {templateUrl: 'components/world/world.html', controller: WorldController}).
//       //when('/w/:worldID/edit', {templateUrl: 'partials/world-edit.html', controller: WorldEditCtrl}). 
//       // when('/world/:bubbleId/:option', {templateUrl: 'partials/world-detail.html', controller: WorldDetailCtrl}).

//       when('/list/:category/:filter', {templateUrl: 'partials/list.html', controller: ListCtrl}).

//       when('/w/:worldID/:pageID', {templateUrl: 'partials/menu.html', controller: MenuCtrl}).

//       //when('/post/:landmarkID', {templateUrl: 'partials/landmark-view.html', controller: LandmarkViewCtrl}).
//       //when('/post/:landmarkID/:option', {templateUrl: 'partials/landmark-view.html', controller: LandmarkViewCtrl}). 
//       //when('/post/:landmarkID/edit', {templateUrl: 'partials/landmark-edit.html', controller: LandmarkEditCtrl}). 

//       when('/newpost', {templateUrl: 'partials/landmark-new.html'}). 
//       when('/newpost/:type', {templateUrl: 'partials/landmark-new-type.html', controller: LandmarkNewCtrl}). 

//       when('/newworld', {templateUrl: 'components/editor/world-maker.html', controller: WorldMakerCtrl}).
//       when('/newworld/:projectID', {templateURL: 'components/editor/world-maker.html', controller: WorldMakerCtrl}). 
      
//       when('/talk', {templateUrl: 'partials/talk-list.html', controller: TalklistCtrl}). 
//       when('/talk/:hashTag', {templateUrl: 'partials/talk-tag.html', controller: TalktagCtrl}). 

//       when('/insta', {templateUrl: 'partials/insta-list.html', controller: InstalistCtrl}). 

//       when('/user/:userID', {templateUrl: 'partials/user-view.html', controller: UserCtrl}). 

//       otherwise({redirectTo: '/'}); 
// }]);





'use strict';

var app = angular.module('IF', ['ngRoute','tidepoolsFilters','tidepoolsServices','ngSanitize','ui.bootstrap', 'leaflet-directive','infinite-scroll','$strap.directives','IF-directives']).
  config(function($routeProvider,$locationProvider, $httpProvider) {

  //================================================
    // Check if the user is connected
    //================================================
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user){
        // Authenticated
        if (user !== '0')
          $timeout(deferred.resolve, 0);

        // Not Authenticated
        else {
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
      when('/', {templateUrl: 'partials/loading.html', controller: WorldRouteCtrl}).
      when('/login', {templateUrl: 'components/auth/login.html', controller: LoginCtrl}).
      when('/profile', {templateUrl: 'components/auth/profile.html', controller: ProfileCtrl, resolve: {loggedin: checkLoggedin}}).

      // when('/nearby', {templateUrl: 'partials/nearby-world.html', controller: NearbyWorldCtrl}).

      when('/w/:worldURL', {templateUrl: 'components/world/world.html', controller: WorldController}).
      //when('/w/:worldID/edit', {templateUrl: 'partials/world-edit.html', controller: WorldEditCtrl}). 
      // when('/world/:bubbleId/:option', {templateUrl: 'partials/world-detail.html', controller: WorldDetailCtrl}).

      when('/list/:category/:filter', {templateUrl: 'partials/list.html', controller: ListCtrl}).

      when('/w/:worldID/:pageID', {templateUrl: 'partials/menu.html', controller: MenuCtrl}).

      //when('/post/:landmarkID', {templateUrl: 'partials/landmark-view.html', controller: LandmarkViewCtrl}).
      //when('/post/:landmarkID/:option', {templateUrl: 'partials/landmark-view.html', controller: LandmarkViewCtrl}). 
      //when('/post/:landmarkID/edit', {templateUrl: 'partials/landmark-edit.html', controller: LandmarkEditCtrl}). 

      when('/newpost', {templateUrl: 'partials/landmark-new.html'}). 
      when('/newpost/:type', {templateUrl: 'partials/landmark-new-type.html', controller: LandmarkNewCtrl}). 

      when('/newworld', {templateUrl: 'components/editor/world-maker.html', controller: WorldMakerCtrl}).
      when('/newworld/:projectID', {templateURL: 'components/editor/world-maker.html', controller: WorldMakerCtrl}). 
      
      when('/talk', {templateUrl: 'partials/talk-list.html', controller: TalklistCtrl}). 
      when('/talk/:hashTag', {templateUrl: 'partials/talk-tag.html', controller: TalktagCtrl}). 

      when('/insta', {templateUrl: 'partials/insta-list.html', controller: InstalistCtrl}). 

      when('/user/:userID', {templateUrl: 'partials/user-view.html', controller: UserCtrl}). 

      otherwise({redirectTo: '/'}); 
})
 .run(function($rootScope, $http){
    $rootScope.message = '';

    // Logout function is available in any pages
    $rootScope.logout = function(){
      $rootScope.message = 'Logged out.';
      $http.post('/logout');
    };
  });

