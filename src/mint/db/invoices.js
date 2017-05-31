const Waterline = require('waterline')
const uuid = require('uuid')

const constants = require('../server/constants.js')

/**
 * Payments collection is the collection of payments
 * http://schema.org/Invoice
 */
const invoiceCollection = Waterline.Collection.extend({
  identity: 'invoice',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    /** Generated when a cart is paid */
    id: {
      type: 'string',
      primaryKey: true,
      defaultsTo: () => uuid.v4()
    },

    /** is a leader for invoice necessary or is that cart leader? */
    leader: Waterline.isA('user_accounts'),

    /** enter documentation here */
    invoice_type: {
      type: 'string',
      enum: constants.INVOICE_TYPE
    },

    /** cart associated with the payment */
    cart: Waterline.isA('cart'),

    /** Many-to-one relation with user accounts, so multiple users could pay */
    payments: Waterline.isMany('payments'),

    /** if the whole order has been paid for */
    paid: 'boolean',

    /** total of order */
    total: {
      type: 'float'
    },

    /** everything that would be a order in old db.payments*/
    cafe_order: {
      type: 'json',
    }
  }
})

module.exports = invoiceCollection
