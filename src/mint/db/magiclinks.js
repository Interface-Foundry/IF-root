var Waterline = require('waterline');
var uuid = require('uuid');
var constants = require('../server/constants.js');

/**
 * Session collection is the database side of the node-client-session cookie
 */
var magiclinksCollection = Waterline.Collection.extend({
  identity: 'magiclinks',
  connection: 'default',
  migrate: 'safe',
  attributes: {

    /** string magic link that ties a user account into a cart */
    id: {
      type: 'string',
      primaryKey: true,
      unique: true,
      defaultsTo: function () {
        return uuid.v4().replace(/-/g, '').slice(0, constants.MAGIC_URL_LENGTH);
      }
    },

    // probably will need to make these references in the future
    cart: Waterline.isA('carts'),
    user: Waterline.isA('user_accounts')
  }
});

module.exports = magiclinksCollection;
