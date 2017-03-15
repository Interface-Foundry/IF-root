var Waterline = require('waterline');
var uuid = require('uuid');
var constants = require('../server/constants.js');

/**
 * Session collection is the database side of the node-client-session cookie
 */
var cartsCollection = Waterline.Collection.extend({
  identity: 'carts',
  connection: 'default',
  attributes: {
    /** Generated when a cart is created for the first time */

    /** @type {string} unique uuid */
    cart_id: {
      type: 'string',
      primaryKey: true,
      unique: true,
      defaultsTo: function () {
        return uuid.v4().replace(/-/g, '').slice(0, constants.CART_ID_LENGTH);
      }
    },
    magic_link: {
      type: 'string',
      unique: true,
      defaultsTo: function () {
        return uuid.v4().replace(/-/g, '').slice(0, constants.MAGIC_URL_LENGTH);
      }
    },

    /** @type {cart_leader} cart may have multiple leaders  */
    cart_leader: 'string', // incorrect but using for now since idk how the session stuff works
    // cart_leader: {
    //   collection: 'user_accounts',
    //   via: 'cart_leader'
    // },

    /** @type {cart_member} carts may have multiple members */
    cart_members: {
      collection: 'user_accounts',
      via: 'cart_member'
    },

    /** @type {reference} items in the cart */
    items: {
      collection: 'items',
      via: 'cart'
    }
  }
});

module.exports = cartsCollection;
