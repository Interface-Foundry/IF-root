var app = angular.module('app', []);

app.factory('MenuFactory', function ($http, $location) {
  // return result of http call
  var mf = {};
  var key = $location.search().k;

  var ms = $http.post('/session', {session_token: key})
    .then(function (response) {
      return response.data;
    });

  mf.getMenu = function () {
    return ms.then(function (ms) {
      return ms.menu.data;
    });
  };

  mf.getRestaurant = function () {
    return ms.then(function (ms) {
      console.log('ms', ms);
      var name = ms && ms.merchant && ms.merchant.name;
      if (name) return name
      else return "No name listed";
      //else console.log('no merchant information');
    });
  };

  return mf;
});

app.controller('menuController', function ($scope, MenuFactory) {
  $scope.name = "Zafra";
  $scope.menu = MenuFactory.getMenu();
  $scope.name = MenuFactory.getRestaurant();
  $scope.test = {};
});
