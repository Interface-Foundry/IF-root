var Waterline = require('waterline')

/**
 * Session collection is the database side of the node-client-session cookie
 */
var sessionsCollection = Waterline.Collection.extend({
  identity: 'sessions',
  connection: 'default',
  attributes: {
    /** Generated when a session is created for the first time */
    id: {
      type: 'string',
      primaryKey: true,
      defaultsTo: function () {
        return Math.random().toString(36).slice(2)
      }
    },

    /** Many-to-many relation with user accounts, which is like an email or something */
    user_accounts: Waterline.isMany('user_accounts')
  }
})

module.exports = sessionsCollection
