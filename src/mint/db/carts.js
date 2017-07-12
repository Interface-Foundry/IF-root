const Waterline = require('waterline');
const uuid = require('uuid');
const constants = require('../server/constants.js');
const archive = require('./cold_storage');

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
     * Optional description of the cart
     * @type {text}
     */
     description: 'text',

    /**
     * Cloudinary url
     * @type {String}
     */
    thumbnail_url: 'string',

    /** @type {String} image link for Cart banner */
    banner_url: 'string',

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
      enum: [
        'Amazon',
        'YPO'
      ],
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

    store_locale: {
      type: 'string',
      enum: [
        'US',
        'GB',
        'CA'
      ],
      required: true
    },

    /** indicates that the cart has been modified since the last time a checkout url was generated */
    dirty: 'boolean',

    address: Waterline.isA('addresses'),

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

    /** shoud show the Pay with Stripe button */
    kip_pay_allowed: {
      type: 'boolean',
      default: false
    },

    invoice: Waterline.isA('invoices'),


    //
    // YPO only
    //
    order_number: 'string',
    account_number: 'string',
    delivery_message: 'string',
    voucher_code: 'string',

    //
    // Instance Methods
    //

    /**
     * gets the store for the current cart and checks it out
     * @return {Store}
     */
    async checkout() {
      const StoreFactory = require('../server/cart/StoreFactory');
      return await StoreFactory.GetStore(this).checkout(this)
    },

    /**
     * Removes a user from the order. Doesn't do anything with invoices.
     * @param  {[type]}  user_id [description]
     * @return {Promise}         [description]
     */
    async removeUser(user_id) {
      if (!user_id) {
        throw new Error('must supply user_id')
      }

      if (user_id === _.get(this, 'leader.id', this.leader)) {
        throw new Error('cannot remove the leader from the order')
      }

      console.log(`removing user ${user_id} from cart ${this.id}`)

      // remove the member from the order
      if (_.get(this, 'members.remove')) {
        this.members.remove(user_id)
      } else {
        throw new Error('not implemented yet')
      }
      await this.save()
    },

    /** function to archive this object */
    archive: archive,
  }
});

module.exports = cartsCollection;
