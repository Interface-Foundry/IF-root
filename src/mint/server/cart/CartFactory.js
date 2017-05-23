const AmazonCart = require('./AmazonCart')
const co = require('co')

/**
 * Build the correct Cart class (this is the inversion of control part)
 * @param {[type]} options
 * @return {[type]}            Returns the correct type of cart
 */
function CartFactory(options) {
  const store_type = options.store.split('_')[0]
  const store_locale = options.store.split('_')[1]
  switch(store_type) {
    case 'amazon':
      return new AmazonCart({
        store: options.store,
        store_locale: store_locale,
        user_locale: options.user_locale
      })
    case 'ypo':
      // similar to above, but probably the YpoCart constructor doesn't need store_locale since it's only available in the UK
  }
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
