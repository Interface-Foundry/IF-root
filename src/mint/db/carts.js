var Waterline = require('waterline');
var uuid = require('uuid');
var constants = require('../server/constants.js');
var archive = require('./cold_storage')

/**
 * Session collection is the database side of the node-client-session cookie
 */
var cartsCollection = Waterline.Collection.extend({
  identity: 'carts',
  connection: 'default',
  migrate: 'safe',
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
     * The name of the cart, if one exists
     * @type {String}
     */
    name: 'string',

    /**
     * If the cart has been locked by the leader
     * @type {boolean}
     */
    locked: 'boolean',

    /**
     * If archived, the cart will not show up in user's side bar
     * @type {String}
     */
    archived: 'boolean',

    /**
     * Cloudinary url
     * @type {String}
     */
    thumbnail_url: 'string',

    /** @type {String} equivalent to CartId from amazon */
    amazon_cartid: 'string',

    /** @type {String} equivalent to HMAC for amazon */
    amazon_hmac: 'string',

    /** @type {String} affiliate_checkout_url url that goes through the "airport" (really we still have this thing) */
    affiliate_checkout_url: 'string',

    /** @type {String} amazon_purchase_url the url that goes directly to amazon */
    amazon_purchase_url: 'string',

    /** @type {string} the online retailer */
    store: {
      type: 'string',
      defaultsTo: 'amazon',
      required: true
    },

    /** @type {string} the cart's privacy setting*/
    privacy: {
      type: 'string',
      enum: [
        'private', // you can only view or join the cart if you have the same email domain as the leader
        'public', // anyone with the link can view or join the cart -- this is the current and default setting
        'display' // anyone can view the cart but only the admin can join, i.e. add items to it
      ],
      defaultsTo: 'public'
    },

    archive: archive,

    store_locale: {
      type: 'string',
      required: true
    },

    dirty: 'boolean',

    archive: archive,

    // social validation metrics

    /** @type {user_accounts} people who have liked this cart */
    likes: {
      collection: 'user_accounts',
      via: 'likes'
    },

    /** @type {integer} the number of times this cart has been #viewed */
    views: {
      type: 'integer',
      defaultsTo: '0'
    },

    /** @type {cart} if this is a clone, specific cart this cart was cloned from */
    parent_clone: 'string',

    /** @type {cart} if this is a reorder, specific cart this cart was cloned from */
    parent_reorder: 'string',

    /** @type {[user_accounts]} times this cart has been checked out */
    checkouts: Waterline.isMany('checkout_events'),

    /** cart subtotal from store */
    subtotal: 'float',

    archive: archive
  }
});

module.exports = cartsCollection;
