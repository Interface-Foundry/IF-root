const amazon = require('./amazon_cart.js');

/**
 * Models loaded from the waterline ORM
 */
var db;
const dbReady = require('../../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));


/**
 * figure out who the retailer is for an item pasted,
 * very rudimentary since idk what to expect at this time
 * @param  {string} item is the way the item is passed in
 * @return {string} retail api one of: amazon,
 */
exports.getRetailer = function (item) {
  if (item.includes('amazon.com')) {
    return 'amazon'
  } else {
    throw new Error('Not currently supported')
  }
};

var getItemHandlers = {
  'amazon': amazon.getAmazonItem
}

var getCartHandlers = {
  'amazon': amazon.getAmazonCart
}

var createCartHandlers = {
  'amazon': amazon.createAmazonCart
}

var addItemHandlers = {
  'amazon': amazon.addAmazonItemToCart
}

var removeItemHandlers = {
  'amazon': amazon.removeAmazonItemFromCart
}

var clearCartHandlers = {
  'amazon': amazon.cleaAmazonCart
}
/**
 * the idea of this is that you can be agnostic if you match up the functionality
 * per item to the respective retailer function in the handlers above
 * @param  {string} item_identifier is url/asin/etc that is given
 * @return {string} asin to lookup
 */
exports.getItem = function * (item) {
  var retailer = exports.getRetailer(item)
  if (!Object.keys(getItemHandlers).includes(retailer)) {
    throw new Error('retailer not currently supported')
  }
  var retailerItem = yield getItemHandlers[retailer](item)
  return retailerItem;
};

exports.createCart = function * (item) {
  var retailer = exports.getRetailer(item)
  var cart = yield createCartHandlers[retailer](item)
  return cart
}

exports.getCart = function * (cart, retailer) {
  var cart = yield getCartHandlers[retailer](cart)
  return cart
};

exports.clearCart = function * (cart, retailer) {
  var cart = yield clearCartHandlers[retailer](cart)
};

exports.addItemToCart = function * (item, cart) {
  var cart = yield addItemHandlers[retailer](item, cart)
};

exports.removeItemFromCart = function * (item, cart) {
  var cart = yield removeItemHandlers[retailer](item, cart)
};
