const Waterline = require('waterline')
const uuid = require('uuid')

const constants = require('../server/constants.js')

/**
 * Payments collection is the collection of payment sources
 * http://schema.org/Invoice
 */
const paymentSourceCollection = Waterline.Collection.extend({
  identity: 'payment_source',
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
    user: Waterline.isA('user_accounts'),

    invoice: Waterline.isA('invoice'),

    /** enter documentation here */
    payment_vendor: {
      type: 'string',
      enum: constants.PAYMENT_SOURCE
    },

    customer_id: 'string',

    company_card: 'boolean',

    card_alias: 'string',

    card: 'json',

    /** peripheral data if needed */
    data: 'json'
  }
})

module.exports = paymentSourceCollection
