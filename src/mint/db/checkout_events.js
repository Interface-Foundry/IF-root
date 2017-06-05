var Waterline = require('waterline')

var checkoutEventsCollection = Waterline.Collection.extend({
  identity: 'checkout_events',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    /** @type {cart} the cart that's been checked out */
    cart: Waterline.isA('carts'),

    /** @type {user} the user that checks the cart out */
    user: Waterline.isA('user_accounts'),

    /** @type {boolean} whether or not this was a real checkout (as opposed to a clone-checkout this cart is getting vanity credit for)*/
    real_checkout: 'boolean',

    /** @type {cart} if this is a vanity checkout, the clone that was actually checked out */
    real_cart: Waterline.isA('carts')
  }
})

module.exports = checkoutEventsCollection
