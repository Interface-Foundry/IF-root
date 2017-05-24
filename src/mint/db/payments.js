const Waterline = require('waterline')
const uuid = require('uuid');
/**
 * Payments collection is the collection of payments
 */
const paymentsCollection = Waterline.Collection.extend({
  identity: 'payments',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    /** Generated when a cart is paid */
    id: {
      type: 'string',
      primaryKey: true,
      defaultsTo: () => uuid.v4()
    },


    payment_type: {
      type: 'string',
      enum: ['mint', 'cafe']
    },

    /** cart associated with the payment */
    cart: Waterline.isA('cart'),

    /** Many-to-one relation with user accounts, so multiple users could pay */
    user: Waterline.isMany('user_accounts'),

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

module.exports = paymentsCollection
