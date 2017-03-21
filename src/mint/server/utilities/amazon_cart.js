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

const opHelper = new OperationHelper(amazonCreds[0]);

/**
 * the idea of this is that you can add functionality later
 * @param  {string} item_identifier is url/asin/etc that is given
 * @return {string} asin to lookup
 */
function getAsin(item_identifier) {
  if (item_identifier.includes('amazon.com')) {
    var asin = item_identifier.split('dp')[1].split('/')[1];
  }
  return asin;
}

/**
 * from whatever item type is given, get corresponding item from amazon
 * @param {string} original_url entered into box or whatever
 * @y just return item title for now
 */
exports.getAmazonItem = function * (item_identifier) {
  var asin = getAsin(item_identifier);
  var res = yield exports.lookupAmazonItem(asin);
  var item = res[0];
  var title = item.ItemAttributes[0].Title[0];
  return title;
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
    return results;
  } catch (err) {
    throw new Error('Error on lookup');
  }
};

/**
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CartCreate.html
 * @param {[type]} items         [description]
 * @yield {[type]} [description]
 */
exports.createAmazonCart = function * (items) {
  if (!(items instanceof Array)) {
    items = [items];
  }
  var amazonParams = {
    items: items
  };
  var cart = yield opHelper.execute('CartCreate', amazonParams);
  return cart;
};

/**
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CartGet.html
 * @param {[type]} cart          [description]
 * @yield {[type]} [description]
 */
exports.getAmazonCart = function * (cart_id) {
  var amazonParams = {
    'cart_id': cart_id
  };

  var cart = yield opHelper.execute('CartGet', amazonParams);
  return cart;
};

/**
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CartAdd.html
 * @param {[type]} item          [description]
 * @param {[type]} cart_id       [description]
 * @yield {[type]} [description]
 */
exports.addAmazonItemToCart = function * (item, cart_id) {
  var amazonParams = {
    'cart_id': cart_id
  };

  var cart = yield opHelper.execute('CartAdd', amazonParams);
  return cart;
};

/**
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CartModify.html
 * @param {[type]} item          [description]
 * @param {[type]} cart_id       [description]
 * @yield {[type]} [description]
 */
exports.removeAmazonItemFromCart = function * (item, cart_id) {
  var amazonParams = {
    'cart_id': cart_id
  };

  var cart = yield opHelper.execute('CartModify', amazonParams);
  return cart;
};
