var Waterline = require('waterline');

/**
 * the Amazon Items collection is our own catalog of amazon items from the db
 * Examples
 *   - "description" is in the items schema because you can describe any item
 *   - "ASIN" is in the amazon_items schema because it's specific to amazon.com
 */
var AmazonItemsCollection = Waterline.Collection.extend({
  identity: 'amazon_items',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    /** @type {string} ASIN id number */
    asin: {
      type: 'string',
      unique: true,
      index: true,
      required: true
    },
    parent_asin: 'string',
    options: 'string',
    name: 'string',
    description: 'string',
    price: 'float',
    rating: 'float',
    iframe_review_url: 'string',
    editorial_review: 'string',
    number_reviews: 'integer'
  }
});

module.exports = AmazonItemsCollection;
