var Waterline = require('waterline');

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
    },

    /** @type {cart_leader} many-to-many relationship with many different carts, can have multiple leaders */
    cart_leader: {
      collection: 'carts',
      via: 'cart_leader',
      dominant: true
    },

    /** @type {cart_member} many-to-many relationship with a carts members */
    cart_member: {
      collection: 'carts',
      via: 'cart_members',
      dominant: true
    }
  }
});

module.exports = userAccountCollection;
