'use strict';

/* App Module */

var simpleSearchApp = angular.module('simpleSearchApp', [
  'ngRoute',
  'simpleSearchControllers'
]);

simpleSearchApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/home.html',
        controller: 'SimpleSearchCtrl'
      }).
      // when('/phones/:phoneId', {
      //   templateUrl: 'partials/phone-detail.html',
      //   controller: 'PhoneDetailCtrl'
      // }).
      otherwise({
        redirectTo: '/'
      });
  }]);