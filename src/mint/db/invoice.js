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
      enum: ['mint']
    },

    /** cart associated with the payment */
    // cart: Waterline.isA('cart'),
    cart: Waterline.isA('carts'),

    /**
     * which members are part of the cart
     */
    members: Waterline.isMany('user_accounts'),

    /** Many-to-one relation with user accounts, so multiple users could pay */
    // payments: Waterline.isMany('payments'),

    /** if the whole order has been paid for */
    paid: 'boolean',

    /** total of order */
    total: {
      type: 'float'
    },

    /**
     * how are we splitting the invoice:
     *  - single: one person pays
     *  - split_equal: each person pays total/users.length
     *  - split_per_item: each person pays for item they added
     */
    split_type: {
      type: 'string',
      enum: ['single', 'split_equal', 'split_per_item']
    },

    /** everything that would be a order in old db.payments*/
    cafe_order: {
      type: 'json',
    }
  }
})

module.exports = invoiceCollection
