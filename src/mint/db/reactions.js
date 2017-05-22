var Waterline = require('waterline');

var reactionsCollection = Waterline.Collection.extend({
  identity: 'reactions',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    /** @type {user_account} The user who reacted */
    user: Waterline.isA('user_accounts'),

    /** @type {string} The emoji they are reacting with */
    emoji: 'string',

    /** @type {item} The item this is a reaction to */
    item: Waterline.isA('items')
  }
})

module.exports = reactionsCollection;
