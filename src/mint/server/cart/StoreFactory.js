const AmazonStore = require('./AmazonStore')
// const YpoStore = require('./YpoStore')

// create all the amazon stores
const stores = {};
(['US', 'UK', 'CA']).map(store_locale => {
  stores['amazon_' + store_locale.toLowerCase()] = new AmazonStore(store_locale)
})

/**
 * [description]
 * @param  {[type]} cart [description]
 * @return {[type]}      [description]
 */
module.exports.GetStore = function(cart) {
  if (stores[cart.store]) {
    return stores[cart.store]
  } else {
    throw new Error(`Store ${cart.store} not supported (cart ${cart.id})`)
  }
}
