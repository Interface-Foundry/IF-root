var Waterline = require('waterline');
var uuid = require('uuid');

/**
 * Items collection holds all the COMMON FIELDS for any item
 * Fields which are specific to a certain provider are held in their respective tables
 * Examples
 *   - "description" is in this schema because you can describe any item
 *   - "ASIN" is in the amazon_item schema because it's specific to amazon.com
 */
var itemsCollection = Waterline.Collection.extend({
  identity: 'items',
  connection: 'default',
  attributes: {
    /** Generated when an item is added for the first time */
    id: {
      type: 'string',
      primaryKey: true,
      unique: true,
      index: true,
      uuidv4: true,
      defaultsTo: () => uuid.v4()
    },

    /** @type {string} original link posted */
    original_link: 'string',

    /** @type {string} the online retailer */
    store: {
      type: 'string',
      enum: [
        'amazon'
      ]
    },

    /** @type {number} amount of this product in cart */
    quantity: {
      type: 'integer',
      defaultsTo: 1
    },

    /** could be any type of option, size, color, style */
    options: Waterline.isMany('item_options'),

    /** @type {string} item name or whatever we present maybe */
    name: 'string',

    /** @type {string} item description */
    description: 'string',

    /** @type {number} item price per unit */
    price: 'number',

    /** @type {string} small image */
    thumbnail_url: 'string',

    /** @type {string} larger image */
    main_image_url: 'string',

    /** @type {number} stars out of five */
    rating: 'number',

    /** @type {number} number of reviews */
    number_reviews: 'integer',

    /** the user that addded the item */
    added_by: Waterline.isA('user_accounts'),

    /** @type {string} current status of the item's payment process */
    payment_status: {
      type: 'string',
      enum: [
        'not paid',
        'payment pending',
        'paid',
      ]
    },

    /**TODO reference payment schema here and get rid of payment status */
    // payment: Waterline.isA('payment'),

    /** @type {boolean} whether the user can modify the item */
    locked: {
      type: 'boolean',
      defaultsTo: false
    },

    cart: Waterline.isA('carts')
  }
});

module.exports = itemsCollection;
