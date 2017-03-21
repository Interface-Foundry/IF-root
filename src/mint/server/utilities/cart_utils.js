const amazon = require('amazon_cart.js');

/**
 * Models loaded from the waterline ORM
 */
var db;
const dbReady = require('../../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

/**
 * the idea of this is that you can add functionality later
 * @param  {string} item_identifier is url/asin/etc that is given
 * @return {string} asin to lookup
 */
exports.getItemRetailer = function * (item) {
  if (item.retailer === 'amazon') {
    var obj = yield amazon.getAmazonItem(item);
  } else if (item.retailer === 'walmart.com') {
    throw new Error('walmart not currently supported');
  }
  return obj;
};

exports.addItemToCart = function * (item, cart) {
  if (item.retailer === 'amazon') { // make this into a dict

  }
};

exports.removeItemFromCart = function * (item, cart) {

};

// {
//   'retailer': 'amazon'
// }