var stores = [{
    "store_img": "https://storage.googleapis.com/kip-random/kip_stores/amazon_us.png",
    "store_type": "Amazon_US",
    "store_name": "Amazon US",
    "store_domain": "amazon.com",
    "store_countries": ["US"],
    "price_locale": "US",
    "default_image": "https://storage.googleapis.com/kip-random/kip_stores/cart_images/amazon_us.png"
  }, {
    "store_img": "https://storage.googleapis.com/kip-random/kip_stores/amazon_uk.png",
    "store_type": "Amazon_GB",
    "store_name": "Amazon UK",
    "store_domain": "amazon.co.uk",
    "price_locale": 'GB',
    "store_countries": ["GB"],
    "default_image": "https://storage.googleapis.com/kip-random/kip_stores/cart_images/amazon_uk.png"
  }, {
    "store_img": "https://storage.googleapis.com/kip-random/kip_stores/amazon_ca.png",
    "store_type": "Amazon_CA",
    "store_name": "Amazon Canada",
    "store_domain": "amazon.ca",
    "store_countries": ["CA"],
    "price_locale": "CA",
    "default_image": "https://storage.googleapis.com/kip-random/kip_stores/cart_images/amazon_ca.png"
  }, {
    "store_img": "https://storage.googleapis.com/kip-random/kip_stores/ypo.png",
    "store_type": "YPO",
    "store_name": "YPO",
    "store_domain": "ypo.co.uk",
    "store_countries": ["GB"],
    "price_locale": "GB",
    "default_image": "https://storage.googleapis.com/kip-random/kip_stores/cart_images/ypo_uk.png"
  }
]

if (process.env.NODE_ENV !== 'production') {
  var urlStores = require('./UrlStoreTypes')

  Object.keys(urlStores).map(store => {
    stores.push({
      store_img: urlStores[store].image,
      store_type: store + '_' + urlStores[store].locale,
      store_name: store,
      store_domain: urlStores[store].domain,
      store_countries: [urlStores[store].locale],
      default_image: urlStores[store].default_image,
      global_direct: true,
      price_locale: "US"
    })
  })
}

const countryCoordinates = {
  'US': [37.0902, -95.7129],
  'GB': [55.3781, -3.4360],
  'CA': [56.1304, -106.3468],
  'JP': [36.2048, 138.2529],
  'KR': [35.9078, 127.7669],
  'CN': [35.8617, 104.1954]
}

module.exports = {
  stores: stores,
  countryCoordinates: countryCoordinates
}
