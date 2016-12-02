app.factory('MenuFactory', function ($http, $location) {
  // return result of http call
  var mf = {};
  var key = $location.search().k;

  var ms = $http.post('/session', {session_token: key})
    .then(function (response) {
      return response.data;
    })

  mf.getMenu = function () {
    return ms.then(function (ms) {
      console.log('MENU', ms.menu.data)
      return ms.menu.data;
    });
  };

  mf.getRestaurant = function () {
    return ms.then(function (ms) {
      console.log('ms', ms);
      var name = ms && ms.merchant && ms.merchant.name;
      if (name) return name
      else return "No name listed";
    });
  };

  mf.formatCart = function (oldCart) {
    var cart = [];

    for (var i in oldCart) {
      var item = {};
      item.item_id = oldCart[i].id;
      item.item_qty = oldCart[i].item_qty;
      item.options = {};
      for (var group in oldCart[i].options) {
        var opGroup = oldCart[i].options[group];
        for (var opId in opGroup) {
          if (opGroup[opId].chosen) {
            item.options[opId] = 1;
          }
        }
      }
      cart.push(item);
    }

    console.log('new cart::', cart);
    return cart;
  };

  mf.submitOrder = function (cart) {
    ms.then(function (ms) {
      return $http.post('/order', {
        order: cart,
        user_id: ms.userId,
        deliv_id: ms.foodSessionId
      })
      .then(function (result) {
        console.log('order submission successful');
      });
    });
  };

  return mf;
});
