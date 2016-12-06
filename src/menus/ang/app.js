var app = angular.module('app', []);

app.controller('menuController', function ($scope, $window, MenuFactory) {
  $scope.menu = MenuFactory.getMenu();
  $scope.name = MenuFactory.getRestaurant();
  $scope.minimum = MenuFactory.getMinimum();
  $scope.total = 0;
  $scope.cart = [];
  $scope.inProgress = {};
  $scope.categories = {};
  $scope.options = {};

  // console.log(MenuFactory.getMinimum(), 'get min called');
  // console.log(MenuFactory.getRestaurant(), 'get name called')

  $scope.toggleCategory = function (cat) {
    if ($scope.categories[cat]) $scope.categories[cat] = false;
    else $scope.categories[cat] = true;
  };

  $scope.itemDetails = function (item) {
    if ($scope.inProgress[item.id]) {
      $scope.inProgress[item.id] = null;
    }
    else {
      var details = {item_qty: 1, max_qty: item.max_qty, name: item.name, id: item.unique_id, price: item.price, options: {}};
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
      console.log('in progress:', details)
      $scope.inProgress[item.id] = details;
    }
  };

  $scope.formatPrice = function (price) {
    //console.log('price', price)
    return (price !== 0 ? " + " + price : "");
  };

  $scope.validateItem = function (item) {

    var validateRadio = function (option) {
      var radio = $scope.inProgress[item.id].options[option];
      if (Object.keys(radio).indexOf('radio') >= 0) return true;
      else return false;
    };

    //console.log('item to validate:', item);
    for (var i = 0; i < item.children.length; i++) {
      var opGroup = item.children[i];
      if (opGroup.min_selection) {
          if (! validateRadio(opGroup.name)) return false;
      }
    }
    return true;
  };

  $scope.addItemPrice = function (item) {
    var cost = item.price;
    for (var opt in item.options) {
      var optGroup = item.options[opt];
      for (var optId in optGroup) {
        var option = optGroup[optId];
        if (option != 'radio' && option.chosen) cost += option.price;
      }
    }
    item.price = cost;
    $scope.total += cost;
  };

  $scope.addToCart = function (item) {
    console.log('ITEM', item);
    var foodItem = $scope.inProgress[item.id];
    if (foodItem.item_qty > item.max_qty) foodItem.item_qty = item.max_qty;
    for (var k in foodItem.options) {
      opGroup = foodItem.options[k];
      // console.log('opGroup!!', opGroup)
      if (Object.keys(opGroup).indexOf('radio') > -1) {
        var selectionId = opGroup.radio;
        opGroup[selectionId].chosen = true;
      }
      for (var key in opGroup) {
        if (opGroup[key].chosen) {
          if ($scope.options[item.unique_id]) $scope.options[item.unique_id].push([opGroup[key].name, opGroup[key].price]);
          else $scope.options[item.unique_id] = [[opGroup[key].name, opGroup[key].price]];
        }
      }
    }
    console.log($scope.cart, 'cart');

    $scope.inProgress[item.id].instructions = window.prompt("Do you have any special instructions?");

    $scope.cart.push($scope.inProgress[item.id]);
    $scope.addItemPrice($scope.inProgress[item.id]);
    $scope.inProgress[item.id] = null;
  };

  $scope.changeQuantity = function (item_id, diff) {
    for (var i = 0; i < $scope.cart.length; i++) {
      if ($scope.cart[i].id == item_id) {
        $scope.cart[i].item_qty = Number($scope.cart[i].item_qty);
        if (diff + $scope.cart[i].item_qty <= 0) {
          if (! window.confirm("Are you sure you want to delete this item from your cart?")) {
            return null;
          }
          $scope.total -= $scope.cart[i].price;
          $scope.cart.splice(i, 1);

          console.log($scope.cart);
        }
        else if ($scope.cart[i].item_qty + diff > $scope.cart[i].max_qty) {
          return;
        }
        else {
          $scope.cart[i].item_qty += diff;
        }
      }
    }
  };

  $scope.checkout = function () {
    MenuFactory.submitOrder(MenuFactory.formatCart($scope.cart));
    window.close();
  };
});
