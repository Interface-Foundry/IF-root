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
    id: {
      type: 'string',
      primaryKey: true,
      unique: true,
      defaultsTo: function () {
        return uuid.v4().replace(/-/g, '').slice(0, constants.CART_ID_LENGTH);
      }
    },

    /** "Forgot" link for re-authenticating */
    magic_link: {
      type: 'string',
      unique: true,
      defaultsTo: function () {
        return uuid.v4().replace(/-/g, '').slice(0, constants.MAGIC_URL_LENGTH);
      }
    },

    /** @type {cart_leader} cart may have multiple leaders  */
    leader: Waterline.isA('user_accounts'),

    /** @type {cart_member} carts may have multiple members */
    members: Waterline.isMany('user_accounts'),

    /** @type {reference} items in the cart */
    items: Waterline.isMany('items')
  }
});

module.exports = cartsCollection;
