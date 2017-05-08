var Waterline = require('waterline');

var AmazonBlurbsCollection = Waterline.Collection.extend({
  identity: 'amazon_blurbs',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    /** @type {text} informational text about an amazon item*/
    text: 'text',
    item: {
      model: 'camel_items'
    }
  }
});

module.exports = AmazonBlurbsCollection;
