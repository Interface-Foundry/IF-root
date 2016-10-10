var mongoose = require('mongoose')

/**
 * show items with multiple variations that cant be added directly
 * itemvariation_schema.js
 */
var itemvariationSchema = mongoose.Schema({
  cart_id: mongoose.Schema.ObjectId,

  ts: {
    type: Date,
    default: Date.now
  },

  ASIN: String,

  mode: String,

  variationValues: {},

  asins: [],

  source: {},

  variationSelected: {}

})

module.exports = mongoose.model('ItemVariations', itemvariationSchema)
