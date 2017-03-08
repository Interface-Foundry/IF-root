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
  payments: [{
    sender: mongoose.Schema.ObjectId,
    amount: Number,
    confirmed: { // if user says they gave money but creator needs to confirm
      type: Boolean,
      default: true
    }
  }],
  collection_emails: [{type: mongoose.Schema.ObjectId, ref: 'Email'}]
})

module.exports = mongoose.model('Invoice', invoiceSchema)
