var mongoose = require('mongoose');

/**
 * show items with multiple variations that cant be added directly
 * itemvariation_schema.js
 */
var itemvariationSchema = mongoose.Schema({
  cart_id: mongoose.Schema.ObjectId,

  ASIN: String,

  variationValues: {},

  asins: [],

  source: {}

});

module.exports = mongoose.model('ItemVariations', itemvariationSchema);