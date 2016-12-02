var app = angular.module('app', []);

app.controller('menuController', function ($scope, MenuFactory) {
  $scope.menu = MenuFactory.getMenu();
  $scope.name = MenuFactory.getRestaurant();
  $scope.total = 0;
  $scope.cart = [];
  $scope.inProgress = {};
  $scope.categories = {};

  $scope.toggleCategory = function (cat) {
    if ($scope.categories[cat]) $scope.categories[cat] = false;
    else $scope.categories[cat] = true;
    console.log(cat);
  }

  $scope.itemDetails = function (item) {
    if ($scope.inProgress[item.id]) {
      $scope.inProgress[item.id] = null;
    }
    else {
      var details = {item_qty: 1, name: item.name, id: item.unique_id, price: item.price, options: {}};
      for (var child in item.children) {
        details.options[item.children[child].name] = {};
        var opt = item.children[child];
        for (var s in opt.children) {
          var selection = opt.children[s];
          //console.log(selection, "selection is what i think it is right?");
          details.options[item.children[child].name][opt.children[s].unique_id] = {
            chosen: false,
            price: selection.price,
            name: selection.name
          };
        }
      }
      $scope.inProgress[item.id] = details;
    }
  }

  $scope.formatPrice = function (price) {
    //console.log('price', price)
    return (price != 0 ? " + " + price : "");
  }

  $scope.validateItem = function (item) {

    var validateRadio = function (option) {
      var radio = $scope.inProgress[item.id].options[option];
      if (Object.keys(radio).indexOf('radio') >= 0) return true;
      else return false;
    }

    //console.log('item to validate:', item);
    for (var i = 0; i < item.children.length; i++) {
      var opGroup = item.children[i];
      if (opGroup.min_selection) {
          if (! validateRadio(opGroup.name)) return false;
      }
    }
    return true;
  }

  $scope.addItemPrice = function (item) {
    var cost = item.price;
    // console.log(item, 'item');
    for (var opt in item.options) {
      // console.log('in second for loop');
      var optGroup = item.options[opt];
      // console.log('optGroup', optGroup)
      for (var optId in optGroup) {
        //console.log('does this say radio?', optId)
        var option = optGroup[optId];
        //  console.log('option', option);
        if (option != 'radio' && option.chosen) cost += option.price;
      }
      // console.log('OPTGROUP', optGroup)
    }
    console.log('these should both be numbers:', $scope.total, cost);
    $scope.total += cost;
    console.log('cart total is now', $scope.total);
  }

  $scope.addToCart = function (item) {
    var foodItem = $scope.inProgress[item.id]
    for (var k in foodItem.options) {
      opGroup = foodItem.options[k];
      if (Object.keys(opGroup).indexOf('radio') > -1) {
        var selectionId = opGroup.radio;
        opGroup[selectionId].chosen = true;
        //_.remove(opGroup, function (k) {k=='radio'});
      }
    }
    console.log($scope.cart, 'cart');
    $scope.cart.push($scope.inProgress[item.id]);
    $scope.addItemPrice($scope.inProgress[item.id]);
    $scope.inProgress[item.id] = null;
  }

  $scope.checkout = function () {
    MenuFactory.submitOrder(MenuFactory.formatCart($scope.cart));
  }
});
