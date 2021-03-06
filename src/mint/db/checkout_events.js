var Waterline = require('waterline')

var checkoutEventsCollection = Waterline.Collection.extend({
  identity: 'checkout_events',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    /** @type {cart} the cart that's been checked out */
    cart: Waterline.isA('carts'),

    /** @type {user} the user that checks the cart out */
    user: Waterline.isA('user_accounts')
  }
})

module.exports = checkoutEventsCollection
