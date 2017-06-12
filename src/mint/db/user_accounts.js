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
  migrate: 'safe',
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
        return uuid.v4();
      }
    },

    /**
     * User's email address, should be unique
     * @type {Object}
     */
    email_address: {
      type: 'string',
      unique: true,
      email: true,
      required: true
    },

    /**
     * User's name, if supplied (i.e. username, i.e. the first 1/2 of the email)
     * @type {Object}
     */
    name: {
      type: 'string',
      required: true
    },

    /**
     * List of user browser sessions
     * @type {Session}
     */
    sessions: Waterline.isMany('sessions'),

    /**
     * List of addresses associated with the user
     * @type {Address}
     */
    addresses: Waterline.isMany('addresses'),

    /**
     * @type {checkout_events} occasions on which this user has checked out
     */
    checkouts: Waterline.isMany('checkout_events'),

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
    paypal_id: 'string',

    /**
     * The user's account number for YPO
     * @type {String}
     */
    ypo_account_number: 'string',

    /**
     * The user's account name for YPO
     * @type {String}
     */
    ypo_account_name: 'string',

    /**
     * YPO voucher code, whatever this is
     * @type {String}
     */
    ypo_voucher_code: 'string',

    /** @type {boolean} whether or not the leader has been reminded about this cart */
    reminded: {
      type: 'boolean',
      defaultsTo: false
    },

    /** @type {carts} Carts this user has liked*/
    likes: {
      collection: 'carts',
      via: 'likes',
      dominant: true
    }
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
