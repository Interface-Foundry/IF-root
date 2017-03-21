var Waterline = require('waterline');

/**
 * the Amazon Items collection holds details specific only to amazon items
 * Examples
 *   - "description" is in the items schema because you can describe any item
 *   - "ASIN" is in the amazon_items schema because it's specific to amazon.com
 */
var AmazonItemsCollection = Waterline.Collection.extend({
  identity: 'amazon_items',
  connection: 'default',
  attributes: {
    /** @type {string} ASIN id number */
    asin: 'string',

  }
});

module.exports = AmazonItemsCollection;
