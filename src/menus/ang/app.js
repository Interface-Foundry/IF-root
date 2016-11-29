var app = angular.module('app', []);

app.factory('menu', function ($http) {
  // return result of http call
  return "I am a menu, yes i am!"
})

app.controller('menuController', function ($scope, menu) {
  $scope.menu = menu; 
});
