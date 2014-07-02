'use strict';

var app = angular.module('IF', ['ngRoute','tidepoolsFilters','tidepoolsServices','ngSanitize','ui.bootstrap', 'leaflet-directive','infinite-scroll','$strap.directives','IF-directives']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/', {templateUrl: 'partials/loading.html', controller: WorldRouteCtrl}).

      // when('/nearby', {templateUrl: 'partials/nearby-world.html', controller: NearbyWorldCtrl}).

      when('/w/:worldURL', {templateUrl: 'components/world/world.html', controller: WorldController}).
      //when('/w/:worldID/edit', {templateUrl: 'partials/world-edit.html', controller: WorldEditCtrl}). 
      // when('/world/:bubbleId/:option', {templateUrl: 'partials/world-detail.html', controller: WorldDetailCtrl}).

      when('/lectures', {templateUrl: 'partials/lectures.html', controller: LecturesCtrl}).
      when('/awards', {templateUrl: 'partials/awards.html', controller: AwardsCtrl}).
      when('/show/', {templateUrl: 'partials/show.html', controller: ShowCtrl}).


      when('/list/:category/:filter', {templateUrl: 'partials/list.html', controller: ListCtrl}).

      when('/w/:worldID/:pageID', {templateUrl: 'partials/menu.html', controller: MenuCtrl}).

      when('/post/:landmarkID', {templateUrl: 'partials/landmark-view.html', controller: LandmarkViewCtrl}).
      when('/post/:landmarkID/:option', {templateUrl: 'partials/landmark-view.html', controller: LandmarkViewCtrl}). 
      when('/post/:landmarkID/edit', {templateUrl: 'partials/landmark-edit.html', controller: LandmarkEditCtrl}). 

      when('/newpost', {templateUrl: 'partials/landmark-new.html'}). 
      when('/newpost/:type', {templateUrl: 'partials/landmark-new-type.html', controller: LandmarkNewCtrl}). 

      when('/newworld', {templateUrl: 'components/editor/world-maker.html', controller: WorldMakerCtrl}).
      when('/newworld/:projectID', {templateURL: 'components/editor/world-maker.html', controller: WorldMakerCtrl}). 
      
      when('/talk', {templateUrl: 'partials/talk-list.html', controller: TalklistCtrl}). 
      when('/talk/:hashTag', {templateUrl: 'partials/talk-tag.html', controller: TalktagCtrl}). 

      when('/insta', {templateUrl: 'partials/insta-list.html', controller: InstalistCtrl}). 

      when('/user/:userID', {templateUrl: 'partials/user-view.html', controller: UserCtrl}). 

      otherwise({redirectTo: '/'}); 
}]);


