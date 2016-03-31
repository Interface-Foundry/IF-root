/*eslint-env es6*/
var db = require('db')
var _ = require('lodash')
var moment = require('moment')
var co = require('co')
var amazon = require('../amazon-product-api_modified'); //npm amazon-product-api
// var client = amazon.createClient({
//   awsId: "AKIAILD2WZTCJPBMK66A",
//   awsSecret: "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",
//   awsTag: "bubboorev-20"
// });
var client = amazon.createClient({
  awsId: "AKIAIYTURL6C5PID2GZA",
  awsSecret: "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",
  awsTag: "krista08-20"
});

var getCartLink = require('./process').getCartLink;
var fs = require('fs')

module.exports = {};

//
// Add an item to the db
// slack_id: either the team id or the user id if a personal cart
// user_id: the user who added the item
// item: the item from amazon result i guess
//
module.exports.addToCart = function(slack_id, user_id, item) {
  console.log('adding item to cart for ' + slack_id + ' by user ' + user_id);
  console.log(item)

  // Handle the case where the search api returns items that we can't add to cart
  var total_offers = parseInt(_.get(item, 'Offers[0].TotalOffers[0]') || '0');
  if (total_offers === 0) {
    // This item is not available.  According to the amazon documentation, the search
    // api can and will return items that you cannot buy.  So we have to just
    // ignore these things.
    // http://docs.aws.amazon.com/AWSECommerceService/latest/DG/AvailabilityParameter.html
    return Promise.reject('Item not available');
  }

  return co(function*() {
    var cart = yield getCart(slack_id);
    console.log(cart);

    console.log('creating item in database')
    var i = yield (new db.Item({
      cart_id: cart._id,
      ASIN: _.get(item, 'ASIN[0]'),
      title: _.get(item, 'ItemAttributes[0].Title'),
      link: _.get(item, 'ItemLinks[0].ItemLink[0].URL[0]'), // so obviously converted to json from xml
      image: item.altImage || _.get(item, 'SmallImage[0].URL[0]'),
      price: item.realPrice,
      rating: _.get(item, 'reviews.rating'),
      review_count: _.get(item, 'reviews.reviewCount'),
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

// Remove item from the db
// slack_id: either the team id or the user id if a personal cart
// number: the item to remove in cart array, as listed in View Carts
//
module.exports.removeFromCart = function(slack_id, number) {
  console.log(`removing item #${number} from cart`)

  return co(function*() {
    var cart = yield getCart(slack_id);

    // need to watch out for items that have multiple quantities
    // check to make sure this item exists
    var ASIN_to_remove = _.get(cart, `aggregate_items[${number - 1}].ASIN`);

    if (!ASIN_to_remove) {
      return cart;
    }

    // remove the last item that matched this one
    var matching_items = cart.items.filter(function(i) {
      return i.ASIN === ASIN_to_remove;
    })

    module.exports.removeFromCartByItem(matching_items.pop());
  })
}


// Removes one item from the cart at a time
//
module.exports.removeFromCartByItem = function(item) {
  return co(function*() {
    if (!(item instanceof db.Item)) {
      console.error("can only remove mongoose models of type db.Item")
      throw new Error('Cannot remove item - must be a db.Item model')
    }
    var cart = yield db.Carts.findById(item.cart_id).exec();
    item.deleted = true;
    cart.items = cart.items.filter(function(i) {
      return i.toString() !== item._id.toString();
    })
    yield [cart.save(), item.save()]

    // rebuild the cart
    return getCart(cart.slack_id);
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
      cart.link = yield getCartLink(_.get(cart, 'amazon.PurchaseURL[0]'), cart._id)
      yield cart.save();

      return cart;
    }


    // otherwize rebuild their current cart
    // make sure the cart has not been checked out (purchased) yet
    var amazonCart = yield client.getCart({
      'CartId': _.get(cart, 'amazon.CartId.0'),
      'HMAC': _.get(cart, "amazon.HMAC[0]")
    })

    // console.log(JSON.stringify(amazonCart, null, 2))
    console.log('got amazon cart')
    console.log(amazonCart);

    // if the cart is not there, then i guess it has been purchased
    // Although maybe the cart has expired? TODO
    // mark cart as purchased and create a new one
    if (!amazonCart.Request[0].IsValid[0] || amazonCart.Request[0].Errors) {
      console.log('cart has already been purchased')
      cart.purchased = true;
      cart.purchased_date = new Date();
      yield cart.save();
      yield cart.items.map(function(i) {
        i.purchased = true;
        i.purchased_date = cart.purchased_date;
        return i.save();
      })

      console.log('creating a new cart for ' + slack_id)
      cart = new db.Cart({
        slack_id: slack_id,
        items: []
      })
      console.log('creating new cart in amazon')
      var amazonCart = yield client.createCart(cart_items)

      // console.log(amazonCart.Request[0].Errors[0].Message[0]);

      //console.log(JSON.stringify(amazonCart.Request[0]));

      //ERROR TEMP FIX: can't save item to cart, example item: "VELCANS® Fashion Transparent and Flat Ladies Rain Boots" to cart
      if(amazonCart.Request[0].Errors && amazonCart.Request[0].Errors[0] && amazonCart.Request[0].Errors[0].Error && amazonCart.Request[0].Errors[0].Error[0].Message && amazonCart.Request[0].Errors[0].Error[0].Message[0].indexOf('not eligible to be added to the cart') > -1){

        console.log('ERR: Amazon item is not eligible to be added to the cart');
        //cart.amazon = amazonCart;

        console.log('# cart ',cart);
        //console.log('# amz ',cart.amazon);

        //cart.link =
        //cart.link = yield getCartLink(_.get(cart, 'amazon.PurchaseURL[0]'), cart._id)
        //yield cart.save()
        return cart;

      }
      //no error adding item to cart
      else {
        console.log(JSON.stringify(amazonCart, null, 2))
        cart.amazon = amazonCart;
        cart.link = yield getCartLink(_.get(cart, 'amazon.PurchaseURL[0]'), cart._id)
        yield cart.save()
        return cart;
      }

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

    yield cart.save()
    return cart;
  })
}

//
// Get the summary of all the things ppl ordered on slack in the past week
//
function weeklySummary(slack_id) {
  return co(function*() {
    var last_week = moment().subtract(1, 'week');
    var carts = yield db.Carts.find({
      slack_id: slack_id,
      deleted: false,
      $or: [
        {purchased_date: {$exists: false}}, // all open carts
        {purchased_date: {$gt: last_week}} // carts purchased in the last week
      ]
    })

    // TODO format the weekly summary somehow
  })
}


//
// Testing
//
if (!module.parent) {
  co(function*() {
    var item = yield db.Items.findById('56f2c006d045b96c1eb14acb').select('-source_json');
    var cart = yield module.exports.removeFromCart(item)
    console.log(item);
    console.log(cart);
  })
}
