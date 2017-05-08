var Waterline = require('waterline');
var uuid = require('uuid');
var constants = require('../server/constants.js');

/**
 * Session collection is the database side of the node-client-session cookie
 */
var authenticationLinksCollection = Waterline.Collection.extend({
  identity: 'authentication_links',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    /** Generated when user is added for the first time */

    id: {
      type: 'string',
      primaryKey: true,
      unique: true,
      defaultsTo: function () {
        return uuid.v4().replace(/-/g, '').slice(0, constants.MAGIC_URL_LENGTH);
      }
    },

    /** @type {reference} cart which item belongs to */
    cart: Waterline.isA('carts'),

    redirect_url: 'string',

    user: Waterline.isA('user_accounts')
  }
});

module.exports = authenticationLinksCollection;
