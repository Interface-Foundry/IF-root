const Waterline = require('waterline')
const uuid = require('uuid')

const constants = require('../server/constants.js')

/**
 * Payments collection is the collection of payments to invoices
 */
const paymentsCollection = Waterline.Collection.extend({
  identity: 'payments',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    /** Generated when a payment is made */
    id: {
      type: 'string',
      primaryKey: true,
      defaultsTo: () => uuid.v4()
    },

    /** cart can have one invoice associated with the payment */
    cart: Waterline.isA('invoice'),

    /** user can have many payments, payment would be one user */
    user: Waterline.isA('user_accounts'),

    /** amount user paid */
    amount: {
      type: 'float'
    },

    payment_source: {
      type: 'string',
      enum: constants.PAYMENT_SOURCE,
      required: true
    }
  }
})

module.exports = paymentsCollection
