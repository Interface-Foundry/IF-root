const amazon = require('./amazon_cart.js');
const ypo = require('./ypo_cart.js')
const constants = require('../constants.js');
/**
 * Models loaded from the waterline ORM
 */
var db;
const dbReady = require('../../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));


/************************************************
 * generalized handlers
 ************************************************
 */

const syncCartHandlers = {
  'amazon': amazon.syncAmazon
}

const getItemHandlers = {
  'amazon': amazon.getAmazonItem
}

const getCartHandlers = {
  'amazon': amazon.getAmazonCart
}

const addItemHandlers = {
  'amazon': amazon.addItemAmazon // uses asin
}

const clearCartHandlers = {
  'amazon': amazon.clearAmazonCart
}

const itemPreviewHandlers = {
  'amazon': amazon.itemPreview,
  'ypo': ypo.itemPreview
}

/************************************************
 * functions for carts
 ************************************************
 */

/**
 * get info for item based on retailer
 *
 * @param      {string}  query   The query with asin/url/item code/title
 * @param      {string}  store   The store type
 * @return     {object}  item    the item preview object for that store
 */
exports.itemPreview = function * (query, store) {
  if (store === undefined) {
    throw new Error('Store required for item preview')
  }
  const item = yield itemPreviewHandlers[store](query)
  return item
}

/**
 * create a cart
 *
 * @param      {string}  store -  the store type to create
 * @return     {object}  cart - the cart object
 */
exports.createCart = function * (store) {
  const cartOpts = {
    // store can be ypo or amazon
    store: (store === undefined) ? 'amazon' : store,
  }

  // create a cart
  const cart = yield db.Carts.create(cartOpts)
  return cart;
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

exports.syncCart = function * (cart) {
  var cart = yield syncCartHandlers(cart)
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


/**
 * delete item from cart
 *
 * @param      {string}  itemId  The item identifier
 * @param      {string}  cartId  the cart identifier
 * @param      {string}  userId  The user identifier
 * @return     {string}  status of if item was deleted
 */
exports.deleteItemFromCart = function * (item, cart, userId) {
  // make sure cart and item exist
  if (!cart) {
    throw new Error('Cart not found')
  }
  if (!item) {
    throw new Error('Item not found')
  }

  // Make sure user has permission to delete it, leaders can delete anything,
  // members can delete their own stuff
  if (cart.leader !== userId && item.added_by !== userId) {
    throw new Error('Unauthorized')
  }

  cart.items.remove(item.id)
  yield cart.save()
  return cart
}

/**
 * create item by user in a cart
 *
 * @param      {string}  itemId  The item identifier/asin
 * @param      {string}          userId  The user identifier
 * @param      {string}          cartId  the cart identifier
 * @param      {number}          quantity the item quantity
 * @return     {object}          item object that was created
 */
exports.addItemToCart = function * (itemId, cart, userId, quantity) {
  if (quantity === undefined) {
    quantity = 1
  }

  // make sure cart and item exist
  if (!cart) {
    throw new Error('Cart not found')
  }

  let item = yield addItemHandlers[cart.store](itemId)
  item.added_by = userId
  item.cart = cart.id
  item.quantity = quantity

  cart.items.add(item.id)

  yield [item.save(), cart.save()]
  return item
}




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

