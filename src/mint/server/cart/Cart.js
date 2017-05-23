const GetStore = require('./StoreFactory').GetStore
const _ = require('lodash')

class Cart {
  constructor(options) {
    // first set the default options
    options.user_locale = options.user_locale || 'US'
    options.items = options.items || []

    // set the properties from the options
    _.merge(this, options)

    // add the store
    this.store = GetStore(this)
  }

  // Save the cart to the db
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
