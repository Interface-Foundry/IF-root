var mongoose = require('mongoose')

/**
 * Food item on order from Delivery.com
 */
var deliveryItem = mongoose.Schema({
  cart_id: mongoose.Schema.ObjectId,

  item_label: String,

  name: String,

  laundry_type: String,

  item_key: Number,

  price: Number,

  price_compare_item: Boolean,

  anonymous_id: String,

  images: [String],

  id: String,

  type: String,

  // options: [deliveryItem],

  quantity: Number

})

var DeliveryItem = mongoose.model('DeliveryItem', deliveryItem)

module.exports = DeliveryItem
