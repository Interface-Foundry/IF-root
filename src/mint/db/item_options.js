var Waterline = require('waterline');
var uuid = require('uuid');

/**
 * Item options are like chosen size, style, color, etc
 */
var itemOptionsCollection = Waterline.Collection.extend({
  identity: 'item_options',
  connection: 'default',
  attributes: {
    /**
     * @type {string} id the option id, which for amazon items is the asin
     * it's this way because:
     *  - if you're on Medium Black shirt, mousing over the asin for Medium Red shirt should say "Red"
     *  - but if you're on Large Red shirt, mousing over the asin for Medium Red shirt should say "Medium"
     */
    id: {
      type: 'string',
      primaryKey: true,
      unique: true,
      index: true,
      uuidv4: true,
      defaultsTo: () => uuid.v4()
    },

    /** @type {string} the option type, like "size" or "color" */
    type: 'string',

    /** @type {string} name of the option */
    name: 'string',

    /** @type {string} option description */
    description: 'string',

    /** @type {string} the url that links to this option, if it exists */
    url: 'string',

    /** @type {string} the asin for this option, because every option on amazon has its own asin **/
    asin: 'string',

    /** @type {number} the amount by which this option increases or decreases the item's base price per unit. not available for amazon */
    price_difference: 'float',

    /** @type {string} small image for this option */
    thumbnail_url: 'string',

    /** @type {string} larger image for this option*/
    main_image_url: 'string',

    /** @type {boolean} available whether this option is available **/
    available: 'boolean',

    /** @type {boolean} whether the option is selected or not */
    selected: 'boolean'
  }
});

module.exports = itemOptionsCollection;
