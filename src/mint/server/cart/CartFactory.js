const Cart = require('./Cart')
const co = require('co')
const GetStore = require('./StoreFactory').GetStore

/**
 * Build the correct Cart class (this is the inversion of control part)
 * @param {[type]} options
 * @return {[type]}            Returns the correct type of cart
 */
function CartFactory(options) {
  const store_type = options.store.split('_')[0]
  const store_locale = options.store.split('_')[1]
  return new Cart(options)
}

/**
 * Create a new cart in the database for a particular store and locale
 * @param  {[type]} options {store: 'amazon_us', user_locale: 'KR'}
 * @return {[type]}         [description]
 */
module.exports.CreateCart = function(options) {
  // get the correct type of cart
  const cart = CartFactory(options)

  // All carts should use the initialize method
  return cart.initialize()
}

/**
 * Retreive a cart from the database
 * @param  {[type]} id database id for the cart
 * @return {[type]}    [description]
 */
module.exports.GetCart = function(id) {
  return co(function * () {
    // get the cart db object
    const cartDoc = yield Promise.resolve({store: 'amazon_us', user_locale: 'KR'})

    // return an instance of the correct class, AmazonCart, YpoCart, etc
    return CartFactory(cartDoc)
  })
}
