var Waterline = require('waterline');

/**
 * Item options are like chosen size, style, color, etc
 */
var itemOptionsCollection = Waterline.Collection.extend({
  identity: 'item_options',
  connection: 'default',
  attributes: {
    /** @type {string} the option type, like "size" or "color" */
    type: 'string',

    /** @type {string} name of the option */
    name: 'string',

    /** @type {string} item description */
    description: 'string',

    /** @type {string} the url that links to this option, if it exists */
    url: 'string',

    /** @type {number} the amount by which this option increases or decreases the item's base price per unit */
    price_difference: 'number',

    /** @type {string} small image for this option */
    thumbnail_url: 'string',

    /** @type {string} larger image for this option*/
    main_image_url: 'string',

    /** @type {boolean} whether the option is selected or not */
    selected: {
      type: 'boolean',
      defaultsTo: false
    }
  }
});

module.exports = itemOptionsCollection;
