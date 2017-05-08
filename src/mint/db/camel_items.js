var Waterline = require('waterline');

var camelItemsCollection = Waterline.Collection.extend({
  identity: 'camel_items',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    name: 'string',
    original_name: 'string',
    asin: 'string',
    price: 'float',
    previousPrice: 'float',
    category: 'string',
    position: 'integer',
    savePercent: {
      type: 'float',
      defaultsTo: function () {
        return (1.00 - this.price / this.previousPrice).toFixed(2);
      }
    },
    active: {
      type: 'boolean',
      defaultsTo: true
    },
    url: 'string',
    thumbnail: 'string',
    main_image: 'string',
    /** @type {reference} descriptive blurbs associated with this item */
    blurbs: Waterline.isMany('amazon_blurbs')
  }
});

module.exports = camelItemsCollection;
