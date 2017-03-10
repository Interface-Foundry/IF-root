var Waterline = require('waterline');

/**
 * Session collection is the database side of the node-client-session cookie
 */
var cartsCollection = Waterline.Collection.extend({
  identity: 'carts',
  connection: 'default',
  attributes: {
    /** Generated when a cart is created for the first time */
    cart_id: 'string',

    /** @type {cart_leader} cart may have multiple leaders  */
    cart_leader: {
      collection: 'user_accounts',
      via: 'cart_leader'
    },

    /** @type {cart_member} carts may have multiple members */
    cart_members: {
      collection: 'user_accounts',
      via: 'cart_member'
    }
  }
});

module.exports = cartsCollection;
