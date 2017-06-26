const moment = require('moment');

const amazon = require('./amazon_cart.js');
const ypo = require('./ypo_cart.js')
const constants = require('../constants.js');
/**
 * Models loaded from the waterline ORM
 */
var db;
const dbReady = require('../../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

// not necessary anymore but keeping for longevity
function amazonHandlersMerge(fn) {
  let obj = {}
  constants.AMAZON_LOCALES.map(store => {
    obj[store] = fn
  })
  return obj
}

/************************************************
 * generalized handlers
 ************************************************
 */

const syncCartHandlers = {
  'Amazon': amazon.syncAmazon
}

const getItemHandlers = {
  'Amazon': amazon.getAmazonItem
}

const getCartHandlers = {
  'Amazon': amazon.getAmazonCart
}

const addItemHandlers = {
  'Amazon': amazon.addItemAmazon, // uses asin
  'YPO': ypo.addItem
}

const clearCartHandlers = {
  'Amazon': amazon.clearAmazonCart
}

const itemPreviewHandlers = {
  'Amazon': amazon.itemPreview,
  'YPO': ypo.itemPreview,
}

const checkoutHandlers = {
  'Amazon': amazon.checkout,
  'YPO': ypo.checkout
}


/************************************************
 * functions for carts
 ************************************************
 */

/**
 * checkout for a specified cart
 *
 * @param      {object}  cart    The
 * @param      {object}  res    The res
 */
exports.checkout = function * (cart, req, res) {
  if (cart.store === undefined) {
    throw new Error('Store required for checkout')
  }

  yield checkoutHandlers[cart.store](cart, req, res)
}


/**
 * get info for item based on retailer
 *
 * @param      {string}  query   The query with asin/url/item code/title
 * @param      {string}  store   The store type
 * @return     {object}  item    the item preview object for that store
 */
exports.itemPreview = function * (query, store, locale, page, category) {
  console.log('itemPreview', query, store, locale, page, category)
  if (store === undefined) {
    throw new Error('Store required for item preview')
  }

  const item = yield itemPreviewHandlers[store](query, locale, page, category)
  return item
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
  // check for pasted URL
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
 * create item in db.Items for a specified store
 *
 * @param      {string}  item  The item, which who even fucking knows what it could be
 * @param      {string}          cartId  the cart identifier
 * @param      {number}          quantity the item quantity
 * @return     {object}          item object that was created
 */
exports.addItem = function * (item, cart, quantity) {
  if (quantity === undefined) {
    quantity = 1
  }

  // make sure cart and item exist
  if (!cart) {
    throw new Error('Cart not found')
  }

  item = yield addItemHandlers[cart.store](item, cart.store_locale)
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


/**
 * send generic receipt email
 *
 * @param      {<type>}  cart         The cartesian
 * @param      {<type>}  userAccount  The user account
 * @return     {<type>}  { description_of_the_return_value }
 */
exports.sendReceipt = function * (cart, req) {
  console.log('cart : ', cart);
  const userAccount = req.UserSession.user_account
  //send receipt email
  const cartItems = cart.items;
  logging.info('creating receipt...')
  if (userAccount) {
    var receipt = yield db.Emails.create({
      recipients: userAccount.email_address,
      sender: 'hello@kip.ai',
      subject: `Kip Cart List for ${cart.name}`,
      template_name: 'summary_email',
      unsubscribe_group_id: 2485
    });

    var userItems = {}; //organize items according to which user added them
    var items= []
    var users = []
    var total = 0;
    var totalItems = 0;
    cartItems.map(function (item) {
      if (!userItems[item.added_by]) userItems[item.added_by] = [];
      userItems[item.added_by].push(item);
      totalItems += Number(item.quantity || 1);
      total += (Number(item.price) * Number(item.quantity || 1));
    });

    for (var k in userItems) {
      var addingUser = yield db.UserAccounts.findOne({id: k});
      if (!addingUser.name) addingUser.name || addingUser.email
      users.push(addingUser);
      items.push(userItems[k]);
    }

    yield receipt.template('summary_email', {
      username: userAccount.name || userAccount.email_address,
      baseUrl: 'http://' + (req.get('host') || 'mint-dev.kipthis.com'),
      id: cart.id,
      items: items,
      users: users,
      date: moment().format('dddd, MMMM Do, h:mm a'),
      total: '$' + total.toFixed(2),
      totalItems: totalItems,
      cart: cart
    })

    yield receipt.send();
    logging.info('receipt sent')
  }
}
