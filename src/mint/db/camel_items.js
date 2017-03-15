var Waterline = require('waterline');

var camelItemsCollection = Waterline.Collection.extend({
  identity: 'camel_items',
  connection: 'default',
  attributes: {
    name: 'string',
    asin: 'string',
    price: 'float',
    previousPrice: 'float',
    savePercent: {
      type: float,
      defaultsTo: function () {
        return this.price / this.previousPrice;
      }
    }
  }
});
