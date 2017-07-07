const Waterline = require('waterline')
const uuid = require('uuid')

var archive = require('./cold_storage')
const constants = require('../server/constants.js')

/**
 * Payments collection is the collection of payments
 * http://schema.org/Invoice
 */
const invoiceCollection = Waterline.Collection.extend({
  identity: 'invoices',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    /** Generated when a cart is paid */
    id: {
      type: 'string',
      primaryKey: true,
      defaultsTo: () => uuid.v4()
    },


    /**
     * ticket tracking
     */
    status: {
      type: 'string',
      enum: [
      // customer side of invoice
      'order_not_complete', 'collecting_payments', 'collecting_order_info',
      // kip admin side of invoice
      'kip_complete_order', 'kip_tracking', 'done', 'canceled'
      ],
      defaultsTo: 'order_not_complete'
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
      enum: ['split_single', 'split_equal', 'split_by_item'],
      defaultsTo: 'split_single'
    },

    /** function to archive this object */
    archive: archive,

    /** everything that would be a order in old db.payments*/
    cafe_order: {
      type: 'json'
    }

  }
})

module.exports = invoiceCollection
