var Waterline = require('waterline')

/**
 * Collection for miscellaneous vendor-specific delivery information
 */
var deliveryDetailsCollection = Waterline.Collection.extend({
  identity: 'delivery_details',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    prime: 'boolean'
  }
})

module.exports = deliveryDetailsCollection
