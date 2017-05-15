var Waterline = require('waterline')

var addressesCollection = Waterline.Collection.extend({
  identity: 'addresses',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    line_1: 'string',
    line_2: 'string',
    city: 'string',
    state: 'string',
    zip: 'string',
    country: 'string',

    /** Many-to-many relation with user accounts */
    user_account: Waterline.isA('user_accounts')
  }
})

module.exports = addressesCollection
