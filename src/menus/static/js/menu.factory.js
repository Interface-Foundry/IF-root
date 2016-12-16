app.factory('MenuFactory', function ($http, $location) {
  // return result of http call
  var mf = {};
  var key = $location.search().k;
  var ms = $http.post('/session', {session_token: key})
    .then(function (response) {
      console.log('made an http response')
      return response.data;
    })

  mf.getMenu = function () {
    return ms.then(function (ms) {
      console.log('MENU', ms.menu.data[0].children)
      return ms.menu.data[0].children;
    });
  };

  mf.getMinimum = function () {
    return ms.then(function (ms) {
      console.log('does this merchant have a min', ms.merchant.minimum)
      return ms.merchant.minimum;
    })
    ms.catch(function (err) {
      console.log('error', err)
    });
  }

  mf.getRestaurant = function () {
    return ms.then(function (ms) {
      console.log('ms', ms);
      var name = ms && ms.merchant && ms.merchant.name;
      if (name) return name
      else return "No name listed";
    });
  };

  mf.formatCart = function (oldCart) {
    console.log('old cart', oldCart)
    var cart = [];

    for (var i in oldCart) {
      var item = {};
      item.item_id = String(oldCart[i].id);
      item.item_qty = oldCart[i].item_qty;
      item.instructions = oldCart[i].instructions;
      //item.long_id = whatever
      item.options = {};
      for (var group in oldCart[i].options) {
        var opGroup = oldCart[i].options[group];
        for (var opId in opGroup) {
          if (opGroup[opId].chosen) {
            item.options[opId] = 1; // might as well set this equal to the long_id
          }
        }
      }
      cart.push(item);
    }

    //console.log('new cart::', cart);
    return cart;
  };

  mf.submitOrder = function (cart) {
    ms.then(function (ms) {
      return $http.post('/order', {
        order: cart, //the "order" should have a long_id field (see above)
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
