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
        return this.price / this.previousPrice;
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
    info: Waterline.isMany('amazon_blurbs')
  }
});

module.exports = camelItemsCollection;
