'use strict';

/* App Module */
//Loading Angular routes, filters, directives, etc.

//Controllers located in controllers.js
//Partials located in the Partials folder

var app = angular.module('Tidepools', ['ngRoute','tidepoolsFilters','tidepoolsServices','ngSanitize','ui.bootstrap', 'leaflet-directive','infinite-scroll','$strap.directives']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      // when('/', {templateUrl: 'partials/landmark-list.html', controller: LandmarkListCtrl}).

      when('/lectures', {templateUrl: 'partials/lectures.html', controller: LecturesCtrl}).

      when('/awards', {templateUrl: 'partials/awards.html', controller: AwardsCtrl}).

      when('/show', {templateUrl: 'partials/show.html', controller: ShowCtrl}).



      when('/landmark/:landmarkId', {templateUrl: 'partials/landmark-detail.html', controller: LandmarkDetailCtrl}). 
      when('/landmark/:landmarkId', {templateUrl: 'partials/landmark-detail.html', controller: LandmarkDetailCtrl}).
      when('/landmark/:landmarkId/edit', {templateUrl: 'partials/landmark-edit.html', controller: LandmarkEditCtrl}). 
      when('/landmark/:landmarkId/:option', {templateUrl: 'partials/landmark-detail.html', controller: LandmarkDetailCtrl}). 
      when('/poll',{templateUrl: 'partials/poll.html', controller: pollCtrl}).

      when('/new', {templateUrl: 'partials/landmark-new.html'}). 
      when('/new/:type', {templateUrl: 'partials/landmark-new-type.html', controller: LandmarkNewCtrl}). 

      when('/build', {templateUrl: 'partials/world-new.html'}). 
      when('/build/:type', {templateUrl: 'partials/world-new-type.html', controller: WorldNewCtrl}). 

      when('/talk', {templateUrl: 'partials/talk-list.html', controller: talklistCtrl}). 
      when('/talk/:hashTag', {templateUrl: 'partials/talk-tag.html', controller: talktagCtrl}). 
      when('/map', {templateUrl: 'partials/map.html', controller: mapCtrl}). 
      when('/map/:loc', {templateUrl: 'partials/map-loc.html', controller: maplocCtrl}). 
      when('/map/coordinates/:lat/:lng/:id', {templateUrl: 'partials/map-loc.html', controller: maplocCtrl}). 
      otherwise({redirectTo: '/lectures'}); 
}]);


