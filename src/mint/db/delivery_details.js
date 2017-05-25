var Waterline = require('waterline')

/**
 * Collection for miscellaneous vendor-specific delivery information
 * i.e. future waterline equivalent for blob o' JSON
 */
var deliveryDetailsCollection = Waterline.Collection.extend({
  identity: 'delivery_details',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    /** @type {Boolean} is it eligible for amazon prime */
    prime: 'boolean',

    /** item whose details these are */
    item: Waterline.isA('items')
  }
})

module.exports = deliveryDetailsCollection
