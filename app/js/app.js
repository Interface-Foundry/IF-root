'use strict';

/* App Module */
//Loading Angular routes, filters, directives, etc.

//Controllers located in controllers.js
//Partials located in the Partials folder

var app = angular.module('Tidepools', ['ngRoute','tidepoolsFilters','tidepoolsServices','ngSanitize','ui.bootstrap', 'leaflet-directive','infinite-scroll','$strap.directives','IF-directives']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/', {templateUrl: 'partials/loading.html', controller: BubbleRouteCtrl}).

      when('/lectures', {templateUrl: 'partials/lectures.html', controller: LecturesCtrl}).

      when('/awards', {templateUrl: 'partials/awards.html', controller: AwardsCtrl}).

      when('/show', {templateUrl: 'partials/show.html', controller: ShowCtrl}).

      when('/list/:category/:filter', {templateUrl: 'partials/list.html', controller: ListCtrl}).

      when('/menu/:type', {templateUrl: 'partials/menu.html', controller: MenuCtrl}).




      when('/post/:landmarkId', {templateUrl: 'partials/landmark-detail.html', controller: LandmarkDetailCtrl}). 
      when('/post/:landmarkId', {templateUrl: 'partials/landmark-detail.html', controller: LandmarkDetailCtrl}).
      when('/post/:landmarkId/ramen/edit', {templateUrl: 'partials/landmark-edit.html', controller: LandmarkEditCtrl}). 
      when('/post/:landmarkId/:option', {templateUrl: 'partials/landmark-detail.html', controller: LandmarkDetailCtrl}). 

      when('/new', {templateUrl: 'partials/landmark-new.html'}). 
      when('/new/:type', {templateUrl: 'partials/landmark-new-type.html', controller: LandmarkNewCtrl}). 

      // when('/build', {templateUrl: 'partials/world-new.html'}). 
      // when('/build/:type', {templateUrl: 'partials/world-new-type.html', controller: WorldNewCtrl}). 

      when('/talk', {templateUrl: 'partials/talk-list.html', controller: talklistCtrl}). 
      when('/talk/:hashTag', {templateUrl: 'partials/talk-tag.html', controller: talktagCtrl}). 


      otherwise({redirectTo: '/'}); 
}]);



