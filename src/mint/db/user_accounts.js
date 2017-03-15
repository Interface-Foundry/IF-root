var Waterline = require('waterline')
var uuid = require('uuid')

/**
 * User Account Collection
 * Stores the user's email information so it can be associated with many browser and mobile sessions
 */
var userAccountCollection = Waterline.Collection.extend({
  identity: 'user_accounts',
  connection: 'default',
  attributes: {
    /** uniqu uuid v4 for the user, automatically generated */
    id: {
      type: 'text',
      primaryKey: true,
      unique: true,
      defaultsTo: function () {
        return uuid.v4()
      }
    },

    /** the user's submitted email address */
    email_address: {
      type: 'string',
      unique: true
    },

    /** Many-to-many relation with user session, which is the brower cookie session thing */
    sessions: Waterline.isMany('sessions'),

    // /** @type {cart_leader} many-to-many relationship with many different carts, can have multiple leaders */
    // my_carts: {
    //   collection: 'carts',
    //   via: 'leader',
    //   dominant: true
    // },
    //
    // /** @type {cart_member} many-to-many relationship with a carts members */
    // others_carts: {
    //   collection: 'carts',
    //   via: 'members',
    //   dominant: true
    // }
  }
})

module.exports = userAccountCollection
