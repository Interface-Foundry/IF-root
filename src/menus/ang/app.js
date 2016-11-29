var app = angular.module('app', []);

app.factory('MenuFactory', function ($http) {
  // return result of http call

  var mf = {};

  var testId = "583db964d421373ebe0adf11";

  mf.getMenu = function () {
    return $http.get('/menu/'+ testId, function (res) {
      return res.data;
    }).then(function (m) {
      console.log(m.data);
      return m.data;
    })
  }

  mf.getRestaurantName = function () {
    return $http.get('/name/' + testId, function (res) {
      return res.data;
    });
  }

  return mf;
});

app.controller('menuController', function ($scope, MenuFactory) {
  $scope.menu = MenuFactory.getMenu();
  $scope.name = MenuFactory.getRestaurantName();
  $scope.model = {};
});
