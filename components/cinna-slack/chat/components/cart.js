/*eslint-env es6*/
var db = require('db')
var _ = require('lodash')
var co = require('co')
var amazon = require('../amazon-product-api_modified'); //npm amazon-product-api
var client = amazon.createClient({
  awsId: "AKIAILD2WZTCJPBMK66A",
  awsSecret: "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",
  awsTag: "bubboorev-20"
});
var getCartLink = require('./process').getCartLink;

module.exports = {};

//
// Add an item to the db
// slack_id: either the team id or the user id if a personal cart
// user_id: the user who added the item
// item: the item from amazon result i guess
//
module.exports.addToCart = function(slack_id, user_id, item) {
  console.log('adding item to cart for ' + slack_id + ' by user ' + user_id)

  return co(function*() {
    var cart = yield getCart(slack_id);
    console.log(cart);

    console.log('creating item in database')
    var i = yield (new db.Item({
      cart_id: cart._id,
      ASIN: item.ASIN[0],
      title: item.ItemAttributes[0].Title,
      link: item.ItemLinks[0].ItemLink[0].URL[0], // so obviously converted to json from xml
      image: item.altImage,
      price: item.realPrice,
      rating: item.reviews.rating,
      review_count: item.reviews.reviewCount,
      added_by: user_id,
      slack_id: slack_id,
      source_json: JSON.stringify(item)
    })).save();

    console.log('adding item ' + i._id + ' to cart ' + cart._id);
    cart.items.push(i._id);
    yield cart.save();

    console.log('calling getCart again to rebuild amazon cart')
    return getCart(slack_id);
  })
}

//
// Syncs cart with amazon and returns a nicely formatted object
// Right now there is no saved amazon cart, so if they delete something from
// amazon,
// Returns a promise for yieldy things
//
var getCart = module.exports.getCart = function(slack_id) {
  return co(function*() {
    //
    // Get the Kip mongodb cart first (amazon cart next)
    //
    var cart;
    console.log('getting team cart for ' + slack_id)
    var team_carts = yield db.Carts.find({slack_id: slack_id, purchased: false, deleted: false}).populate('items', '-source_json').exec();

    if (!team_carts || team_carts.length === 0) {
      // create a new cart
      console.log('no carts found, creating new cart for ' + slack_id)
      cart = new db.Cart({
        amazon: amazonCart,
        slack_id: slack_id,
        items: []
      })
    } else {
      // yay already have a cart
      cart = team_carts[0];
    }


    //
    // get the amazon cart for this Kip cart
    //

    // can't have an empty amazon cart
    if (cart.items.length === 0) {
      return cart;
    }

    // ugh items/quanitites XML/json nastiness
    var cart_items = cart.aggregate_items.reduce(function(cart_items, item, index) {
      cart_items['Item.' + index + '.ASIN'] = item.ASIN;
      cart_items['Item.' + index + '.Quantity'] = item.quantity;
      return cart_items;
    }, {})

    // create a new cart if they don't have one
    if (!cart.amazon) {
      console.log('creating new cart in amazon')
      var amazonCart = yield client.createCart(cart_items)
      console.log(JSON.stringify(amazonCart, null, 2))
      cart.amazon = amazonCart;
      yield cart.save();
      return cart;
    }


    // otherwize rebuild their current cart
    // make sure the cart has not been checked out (purchased) yet
    var amazonCart = yield client.getCart({
      'CartId': cart.amazon.CartId[0],
      'HMAC': cart.amazon.HMAC[0]
    })

    // console.log(JSON.stringify(amazonCart, null, 2))
    console.log('got amazon cart')
    console.log(amazonCart);

    // if the cart is not there, then i guess it has been purchased
    // mark cart as purchased and create a new one
    if (!amazonCart.Request[0].IsValid[0] || amazonCart.Request[0].Errors) {
      console.log('cart has already been purchased')
      cart.purchased = true;
      cart.purchased_date = new Date();
      yield cart.save();

      console.log('creating a new cart for ' + slack_id)
      cart = new db.Cart({
        slack_id: slack_id,
        items: []
      })
      yield cart.save()
      return cart;
    }

    // rebuild amazon cart off of the contents we have in the db
    console.log('clearing cart for rebuild ' + cart.amazon.CartId)
    yield client.clearCart({
      'CartId': cart.amazon.CartId[0],
      'HMAC': cart.amazon.HMAC[0]
    })

    console.log('rebuilding cart ' + cart.amazon.CartId)
    yield client.addCart(_.merge({}, cart_items, {
      CartId: cart.amazon.CartId[0],
      HMAC: cart.amazon.HMAC[0],
    }))

    cart.link = yield getCartLink(cart.amazon.PurchaseURL[0], cart._id)
    yield cart.save()
    return cart;
  })
}


//
// Testing
//
if (!module.parent) {
  getCart('peter').then(function(r) {
    console.log(r);
  }).catch(function(e) {
    console.log('error')
    console.error(e)
    console.log(e.stack)
  })
}
