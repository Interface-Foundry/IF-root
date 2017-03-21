var Waterline = require('waterline');

var AmazonBlurbsCollection = Waterline.Collection.extend({
  identity: 'amazon_blurbs',
  connection: 'default',
  attributes: {
    /** @type {text} informational text about an amazon item*/
    text: 'text'
  }
});

module.exports = AmazonBlurbsCollection;
