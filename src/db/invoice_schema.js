var mongoose = require('mongoose')

/**
 *
 * FROM db.mb:
 * # Invoice
 * - has many Items (or N/A because it's an even split)
 * - UserAccount
 * - status [paid, failed, etc]
 * - payment
 * - collection emails sent
 */
var invoiceSchema = mongoose.Schema({
  cart: mongoose.Schema.ObjectId,
  items: [], // unsure
  created: {type: Date, default: Date.now()},
  status: {
    type: String, // status of the invoice
    enum: ['paid', 'failed', 'other'],
    required: true
  },
  payment: {},
  delivery_post: {},
  delivery_raw_response: {}, //this is the full json response from delivery.com (inc order id and points)
  delivery_response: {}
})

module.exports = mongoose.model('Payment', paymentSchema)
