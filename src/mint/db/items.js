var Waterline = require('waterline');

/**
 * Session collection is the database side of the node-client-session cookie
 */
var itemsCollection = Waterline.Collection.extend({
  identity: 'items',
  connection: 'default',
  attributes: {
    /** Generated when a cart is created for the first time */
    cart: {
      collection: 'carts'
    },
    item_name: 'string'
    // added_by: {}
  }
});

module.exports = itemsCollection;
