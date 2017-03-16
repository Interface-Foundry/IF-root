var Waterline = require('waterline');

/**
 * Session collection is the database side of the node-client-session cookie
 */
var authenticationLinksCollection = Waterline.Collection.extend({
  identity: 'authentication_links',
  connection: 'default',
  attributes: {
    /** Generated when an item is added for the first time */

    /** @type {reference} cart which item belongs to */
    cart: Waterline.isA('carts'),

    user: Waterline.isA('user_accounts')
  }
});

module.exports = authenticationLinksCollection;
