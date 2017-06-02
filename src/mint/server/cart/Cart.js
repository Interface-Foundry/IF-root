const GetStore = require('./StoreFactory').GetStore
const _ = require('lodash')

class Cart {
  /**
   * Build a cart class from a cart database model, or settings for a new model
   * @param  {db.Cart} cart cart database object, or what you want it to be
   */
  constructor(cart) {
    // first set the default cart options if unset
    cart.user_locale = cart.user_locale || 'US'
    cart.items = cart.items || []

    // set the properties from the cart
    _.merge(this, cart)

    // add the store
    this.store = GetStore(this)
  }

  /**
   * Saves a new cart to the database
   * @return {this} returns this instance of the cart class
   */
  initialize() {
    return Promise.resolve(this)
  }

  add(item) {
    this.items.push(item.id)
    return Promise.resolve(this)
  }

  checkout() {
    this.store.checkout(this)
  }
}

module.exports = Cart
