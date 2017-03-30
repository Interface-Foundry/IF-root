var Waterline = require('waterline')
var uuid = require('uuid')
var co = require('co')

/**
 * User Account Collection
 * Stores the user's email information so it can be associated with many browser and mobile sessions
 */
var userAccountCollection = Waterline.Collection.extend({
  identity: 'user_accounts',
  connection: 'default',
  attributes: {
    /**
     * Randomly-generated unique UUID
     * @type {Object}
     */
    id: {
      type: 'text',
      primaryKey: true,
      unique: true,
      defaultsTo: function () {
        return uuid.v4()
      }
    },

    /**
     * User's email address, should be unique
     * @type {Object}
     */
    email_address: {
      type: 'string',
      unique: true,
      email: true
    },

    /**
     * List of user browser sessions
     * @type {Session}
     */
    sessions: Waterline.isMany('sessions'),

    /**
     * Whether the user accepts a cash or not
     * @type {Boolean}
     */
    cash_accepted: 'boolean',

    /**
     * Whether the user accepts checks or not
     * @type {Boolean}
     */
    check_accepted: 'boolean',

    /**
     * Whether the user accpepts Venmo payments or not
     * @type {Boolean}
     */
    venmo_accepted: 'boolean',

    /**
     * The user's Venmo id
     * @type {String}
     */
    venmo_id: 'string',

    /**
     * Whether the user accpepts PayPal payments or not
     * @type {Boolean}
     */
    paypal_accepted: 'boolean',

    /**
     * The user's PayPal id
     * @type {String}
     */
    paypal_id: 'string'
  }
})

/**
 * Finds or creates a new UserAccounts for doc.email_address
 * @param  {Object} doc {email_address: <an email address>}
 * @return {Promise}    promise for the user_account object
 */
userAccountCollection.findOrCreate = function (doc) {
  return co(function * () {
    if (!doc.email) {
      throw new Error('no email address supplied in findOrCreate')
    }

    var user = yield userAccountCollection.findOne(doc)

    if (!user) {
      user = yield userAccountCollection.create(doc)
    }
  })
}

module.exports = userAccountCollection
