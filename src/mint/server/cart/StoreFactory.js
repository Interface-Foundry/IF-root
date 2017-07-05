const AmazonStore = require('./AmazonStore')
const YPOStore = require('./YPOStore')
const UrlStore = require('./UrlStore')

// create all the amazon stores
const stores = {};
(['US', 'GB', 'CA']).map(store_locale => {
  stores['Amazon_' + store_locale] = new AmazonStore(store_locale)
})

// add the YPO store
stores['YPO_GB'] = new YPOStore()

// add our first test URL store
stores['Muji_JP'] = new UrlStore()

/**
 * [description]
 * @param  {[type]} cart [description]
 * @return {[type]}      [description]
 */
module.exports.GetStore = function(cart) {
  var store = cart.store + '_' + cart.store_locale
  if (stores[store]) {
    return stores[store]
  } else {
    throw new Error(`Store ${store} not supported (cart ${cart.id})`)
  }
}
