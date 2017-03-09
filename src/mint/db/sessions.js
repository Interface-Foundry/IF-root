var Waterline = require('waterline')

/**
 * Session collection is the database side of the node-client-session cookie
 */
var sessionsCollection = Waterline.Collection.extend({
  identity: 'sessions',
  connection: 'default',
  attributes: {
    /** Generated when a session is created for the first time */
    session_id: 'string',

    /** Many-to-many relation with user accounts, which is like an email or something */
    user_accounts: {
      collection: 'user_accounts',
      via: 'sessions'
    }
  }
})

module.exports = sessionsCollection

