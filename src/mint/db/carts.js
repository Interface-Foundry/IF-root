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

    /** @type {cart_leader} cart may have multiple leaders  */
    leader: Waterline.isA('user_accounts'),

    /** @type {cart_member} carts may have multiple members */
    members: Waterline.isMany('user_accounts'),

    /** @type {reference} items in the cart */
    items: Waterline.isMany('items'),

    /**
     * THe name of the cart, if one exists
     * @type {String}
     */
    name: 'string',

    /** @type {String} string that is a hmac which is necessary for amazon */
    HMAC: 'string',
    /** @type {String} CartId is needed for amazon cart stuff */
    CartId: 'string'

  }
});

module.exports = cartsCollection;
