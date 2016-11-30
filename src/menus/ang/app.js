var app = angular.module('app', []);

app.factory('MenuFactory', function ($http, $location) {
  // return result of http call
  var mf = {};
  var key = $location.search().k;

  mf.getMenu = function () {
    return $http.post('/session/menu', {k: key})
    .then(function (menu) {
      return menu.data;
    });
  }

  mf.getRestaurant = function () {
    return $http.post('/session/name', {k: key})
    .then(function (name) {
      console.log(name);
      return name.data;
    });
  }

  return mf;
});

app.controller('menuController', function ($scope, MenuFactory) {
  $scope.name = "Zafra";
  $scope.menu = MenuFactory.getMenu();
  $scope.name = MenuFactory.getRestaurant();
  $scope.model = {};
});
