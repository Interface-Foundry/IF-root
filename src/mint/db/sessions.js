var Waterline = require('waterline')

var animals = ['octopus', 'beaver', 'ninetailed cat', 'pine tree']

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

    animal: {
      type: 'string',
      defaultsTo: function () {
        animals[Math.random()*animals.length|0]
      }
    },

    /** Many-to-many relation with user accounts, which is like an email or something */
    user_accounts: Waterline.isMany('user_accounts')
  }
})

module.exports = sessionsCollection
