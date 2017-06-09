const Waterline = require('waterline')
const uuid = require('uuid')

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

    /** payment can have one invoice associated with the payment */
    invoice: Waterline.isA('invoice'),

    /** user can have many payments, payment would be one user */
    user: Waterline.isA('user_accounts'),

    /**
     * the source id
     */
    payment_source: Waterline.isA('payment_source'),

    /** amount user paid */
    amount: 'float',

    /** allow for generalized response back from stripe/coinbase/etc
     * i guess after posting payment?*/
    data: 'json'
  }
})

module.exports = paymentsCollection
