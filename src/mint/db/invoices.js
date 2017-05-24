const Waterline = require('waterline')
const uuid = require('uuid')

const constants = require('../server/constants.js')

/**
 * Payments collection is the collection of payments
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

    /** enter documentation here */
    invoice_type: {
      type: 'string',
      enum: constants.INVOICE_TYPE
    },

    /** cart associated with the payment */
    cart: Waterline.isA('cart'),

    /** Many-to-one relation with user accounts, so multiple users could pay */
    payments: Waterline.isMany('payments'),

    /** total of order */
    total: {
      type: 'float'
    },

    /** everything that would be a cafe db.payments*/
    cafe: {
      type: 'json',
    }
  }
})

module.exports = invoiceCollection
