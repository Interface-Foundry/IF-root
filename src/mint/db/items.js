var Waterline = require('waterline');

/**
 * Session collection is the database side of the node-client-session cookie
 */
var itemsCollection = Waterline.Collection.extend({
  identity: 'items',
  connection: 'default',
  attributes: {
    /** Generated when an item is added for the first time */

    /** @type {reference} cart which item belongs to */
    cart: {
      model: 'carts'
    },

    /** @type {string} original link posted */
    original_link: 'string',

    /** @type {number} amount of this product in cart */
    quantity: 'number',

    /** @type {string} item name or whatever we present maybe */
    item_name: 'string',

    /** @type {string} amazon specific asin */
    asin: 'string',

    /** @type {boolean} if item has been added or removed */
    added: function() {
      return (this.quantity >= 1);
    }

    // added_by: {
    //   model: 'user_accounts'
    // }
  }
});

module.exports = itemsCollection;
