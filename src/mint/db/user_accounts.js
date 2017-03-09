var Waterline = require('waterline')

var userAccountCollection = Waterline.Collection.extend({
  identity: 'user_accounts',
  connection: 'default',
  attributes: {
    email_address: 'string',
    sessions: {
      collection: 'sessions',
      via: 'user_accounts'
    }
  }
})

module.exports = userAccountCollection

