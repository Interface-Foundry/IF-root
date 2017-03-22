const _ = require('lodash');
const {OperationHelper} = require('apac');

// amazon creds -> move to constants later
const amazonCreds = [{
  'awsId': 'AKIAIQWK3QCI5BOJTT5Q',
  'awsSecret': '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',
  'assocId': 'motorwaytoros-20',
  'maxRequestsPerSecond': 1
}, {
  'awsId': 'AKIAJLM6YRRSPF4UQHOA',
  'awsSecret': '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',
  'assocId': 'motorwaytoros-20',
  'maxRequestsPerSecond': 1
}];

const associateTag = 'motorwaytoros-20';

const opHelper = new OperationHelper(amazonCreds[0]);

/**
 * the idea of this is that you can add functionality later
 * @param  {string} item_identifier is url/asin/etc that is given
 * @return {string} asin to lookup
 */
exports.getAsin = function (item_identifier) {
  if (item_identifier.includes('amazon.com')) {
    var asin = item_identifier.split('dp')[1].split('/')[1];
  }
  return asin;
};

/**
 * for a cart, given amazon functionality you need to use modify for cart
 * @param  {[type]} item [description]
 * @param  {[type]} cart [description]
 * @return {[type]}      [description]
 */
function checkAmazonItemInCart (item, cart) {
  // item can be array or single object
  if (!(cart.CartItems.CartItem instanceof Array)) {
    // coerce object into array so we dont have complicated logic
    var cartItems = [cart.CartItems.CartItem];
  } else {
    cartItems = cart.CartItems;
  }
  var cartItem = cartItems.find(i => i.ASIN === item.ASIN);
  if (cartItem) {
    return cartItem;
  }
  return false;
};

/**
 * from whatever item type is given, get corresponding item from amazon
 * @param {string} original_url entered into box or whatever
 * @y just return item title for now
 */
exports.getAmazonItem = function * (item_identifier) {
  var asin = exports.getAsin(item_identifier);
  var res = yield exports.lookupAmazonItem(asin);
  return res;
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// FUNCTIONS BELOW USE APAC TO INTERACT WITH AMAZON PRODUCT API
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/ItemLookup.html
 * lookup item by asin
 * @param {string} asin of item
 * @returns {[type]} [description]
 */
exports.lookupAmazonItem = function * (asin) {
  var amazonParams = {
    Availability: 'Available',
    Condition: 'New',
    IdType: 'ASIN',
    ItemId: asin,
    ResponseGroup: 'ItemAttributes,Images,OfferFull,BrowseNodes,SalesRank'
  };
  try {
    var results = yield opHelper.execute('ItemLookup', amazonParams);
    return results.result.ItemLookupResponse.Items;
  } catch (err) {
    throw new Error('Error on lookup');
  }
};

/**
 * should create a cart with some associatetag with either offer listing ID or asin
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CartCreate.html
 * @param {[type]} items         [description]
 * @return {Object} cart object from amazon that has
      - CartId
      - HMAC
      - URLEncodedHMAC
      - PurchaseURL
      - SubTotal
      - CartItems
 */
exports.createAmazonCart = function * (item) {
  if (item instanceof Array) {
    throw new Error('Only create cart for single item at a time');
  }

  if (_.get(item, 'OfferListingId')) {
    throw new Error('Need ASIN, not using OfferListingId for time being');
  }
  var amazonParams = {
    'AssociateTag': associateTag,
    'Item.1.ASIN': item.ASIN,
    'Item.1.Quantity': (item.quantity === undefined) ? 1 : item.quantity
  };
  var cart = yield opHelper.execute('CartCreate', amazonParams);
  return cart.result.CartCreateResponse.Cart;
};

/**
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CartGet.html
 * @param {[type]} cart          [description]
 * @yield {[type]} [description]
 */
exports.getAmazonCart = function * (cart) {
  var amazonParams = {
    'AssociateTag': associateTag,
    'CartId': cart.CartId,
    'HMAC': cart.HMAC
  };

  cart = yield opHelper.execute('CartGet', amazonParams);
  return cart.result.CartGetResponse.Cart;
};

/**
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CartAdd.html
 * @param {[type]} item          [description]
 * @param {[type]} cart_id       [description]
 * @yield {[type]} [description]
 */
exports.addAmazonItemToCart = function * (item, cart) {
  if (item instanceof Array) {
    throw new Error('Only add one Item to a cart at a time');
  }

  var itemAlreadyAdded = checkAmazonItemInCart(item, cart)
  if (itemAlreadyAdded) {
    // need to use modify
    // var cart = yield exports.
  }

  var amazonParams = {
    'AssociateTag': associateTag,
    'CartId': cart.CartId,
    'HMAC': cart.HMAC,
    'Item.1.ASIN': item.ASIN,
    'Item.1.Quantity': (item.quantity === undefined) ? 1 : item.quantity
  };

  cart = yield opHelper.execute('CartAdd', amazonParams);
  return cart.result.CartAddResponse.Cart;
};

/**
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CartModify.html
 * @param {[type]} item          [description]
 * @param {[type]} cart_id       [description]
 * @yield {[type]} [description]
 */
exports.removeAmazonItemFromCart = function * (item, cart_id) {
  var amazonParams = {
    'CartId': cart_id
  };

  var cart = yield opHelper.execute('CartModify', amazonParams);
  return cart;
};

/**
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CartClear.html
 * @param {[type]} item          [description]
 * @yield {[type]} [description]
 */
exports.cleaAmazonCart = function * (cart) {
  var amazonParams = {
    'AssociateTag': associateTag,
    'CartId': cart.CartId,
    'HMAC': cart.HMAC
  };

  cart = yield opHelper.execute('CartClear', amazonParams);
  return cart;
};
