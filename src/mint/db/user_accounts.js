var Waterline = require('waterline')

/**
 * User Account Collection
 * Stores the user's email information so it can be associated with many browser and mobile sessions
 */
var userAccountCollection = Waterline.Collection.extend({
  identity: 'user_accounts',
  connection: 'default',
  attributes: {
    /** the user's submitted email address */
    email_address: 'string',

    /** Many-to-many relation with user session, which is the brower cookie session thing */
    sessions: {
      collection: 'sessions',
      via: 'user_accounts',
      dominant: true
    }
  }
})

module.exports = userAccountCollection

