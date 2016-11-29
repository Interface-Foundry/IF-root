var app = angular.module('app', []);

app.factory('MenuFactory', function ($http) {
  // return result of http call
  return $http.get('/menu', function (res) {
    return res.data;
  }).then(function (m) {
    console.log(m.data);
    return m.data;
  })
  // .then(function (m) {
  //   var itemNames = [];
  //   console.log('in the dot then');
  //   for (var i = 0; i < m.length; i++) {
  //     itemNames.push(m[i].name);
  //   }
  //   return itemNames;
  // });

  //return "I am a menu, yes i am!";
});

app.controller('menuController', function ($scope, MenuFactory) {
  $scope.menu = MenuFactory;
});
