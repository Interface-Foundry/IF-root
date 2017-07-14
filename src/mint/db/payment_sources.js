const Waterline = require('waterline')
const uuid = require('uuid')

const constants = require('../server/constants.js')
var archive = require('./cold_storage')

/**
 * Payments collection is the collection of payment sources
 * http://schema.org/Invoice
 */
const paymentSourceCollection = Waterline.Collection.extend({
  identity: 'payment_sources',
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

    /** enter documentation here */
    payment_vendor: {
      type: 'string',
      enum: constants.PAYMENT_SOURCE
    },

    /**
     * json from stripe
     */
    source: 'json',

    /** peripheral data from source */
    data: 'json',

    /** function to archive this object */
    archive: archive
  }
})

module.exports = paymentSourceCollection
