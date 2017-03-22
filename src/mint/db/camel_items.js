var Waterline = require('waterline');

var camelItemsCollection = Waterline.Collection.extend({
  identity: 'camel_items',
  connection: 'default',
  attributes: {
    name: 'string',
    asin: 'string',
    price: 'float',
    previousPrice: 'float',
    category: 'string',
    savePercent: {
      type: 'float',
      defaultsTo: function () {
        return (1.00 - this.price / this.previousPrice).toFixed(2);
      }
    },
    skipped: {
      type: 'boolean',
      defaultsTo: false
    },
    url: 'string',
    // info: ['text'],
    small_image: 'string',
    medium_image: 'string',
    large_image: 'string',
    /** @type {reference} descriptive blurbs associated with this item */
    blurbs: Waterline.isMany('amazon_blurbs')
  }
});

module.exports = camelItemsCollection;
