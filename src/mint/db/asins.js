var Waterline = require('waterline');
var uuid = require('uuid');

/**
 * Our very own database of asins
 */
var itemsCollection = Waterline.Collection.extend({
  identity: 'asins',
  connection: 'default',
  attributes: {
    /** id is the asin */
    id: {
      type: 'string',
      primaryKey: true,
      unique: true,
      index: true
    },

    /** the latest json response from amazon **/
    full_json: 'string',


  }
});

module.exports = itemsCollection;
