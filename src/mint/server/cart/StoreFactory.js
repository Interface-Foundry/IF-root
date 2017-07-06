const AmazonStore = require('./AmazonStore')
const YPOStore = require('./YPOStore')
const UrlStore = require('./UrlStore')
const UrlStoreTypes = require('./UrlStoreTypes')

// create all the amazon stores
const stores = {};
(['US', 'GB', 'CA']).map(store_locale => {
  stores['Amazon_' + store_locale] = new AmazonStore(store_locale)
})

// add the YPO store
stores['YPO_GB'] = new YPOStore()

// add our supported URL stores
Object.keys(UrlStoreTypes).map(name => {
  var store = UrlStoreTypes[name]
  stores[name + '_' + store.locale] = new UrlStore(name, store.domain, store.locale)
})

/**
 * [description]
 * @param  {[type]} cart [description]
 * @return {[type]}      [description]
 */
module.exports.GetStore = function(cart) {
  var store = cart.store + '_' + cart.store_locale
  if (stores[store]) {
    logging.info('stores[store]', stores[store])
    return stores[store]
  } else {
    throw new Error(`Store ${store} not supported (cart ${cart.id})`)
  }
}
