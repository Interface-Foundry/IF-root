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
  $scope.menu = MenuFactory.getMenu();
  $scope.name = MenuFactory.getRestaurant();
  $scope.cart = [];
  $scope.total = 0;
  $scope.inProgress = {};

  $scope.itemDetails = function (item) {
    var details = {item_qty: 1, name: item.name, id: item.unique_id, price: item.price, options: {}};
    for (var child in item.children) {
      details.options[item.children[child].name] = {};
      var opt = item.children[child];
      for (var s in opt.children) {
        var selection = opt.children[s];
        console.log(selection, "selection is what i think it is right?");
        details.options[item.children[child].name][opt.children[s].unique_id] = {
          chosen: false,
          price: selection.price,
          name: selection.name
        };
      }
    }
    $scope.inProgress[item.id] = details;
    console.log($scope.inProgress);
  }

  $scope.validateItem = function (item) {

    var validateRadio = function (option) {
      var radio = $scope.inProgress[item.id].options[option];
      if (Object.keys(radio).indexOf('radio') >= 0) return true;
      else return false;
    }

    console.log('item to validate:', item);
    for (var i = 0; i < item.children.length; i++) {
      var opGroup = item.children[i];
      if (opGroup.min_selection) {
          if (! validateRadio(opGroup.name)) return false;
      }
    }
    return true;
  }

  $scope.addToCart = function (item) {
    $scope.cart.push($scope.inProgress[item.id]);
    console.log($scope.cart, 'carttt');
    $scope.inProgress[item.id] = null;
  }
});
