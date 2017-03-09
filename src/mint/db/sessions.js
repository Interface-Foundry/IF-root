var Waterline = require('waterline')

var sessionsCollection = Waterline.Collection.extend({
  identity: 'sessions',
  connection: 'default',
  attributes: {
    session_id: 'string',
    user_accounts: {
      collection: 'user_accounts',
      via: 'sessions'
    }
  }
})

module.exports = sessionsCollection

