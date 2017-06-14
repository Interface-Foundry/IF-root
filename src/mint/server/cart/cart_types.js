const stores = [{
    "store_img": "https://storage.googleapis.com/kip-random/kip_stores/amazon_us.png",
    "store_type": "amazon_US",
    "store_name": "Amazon US",
    "store_domain": "amazon.com",
    "store_countries": ["US"]
  }, {
    "store_img": "https://storage.googleapis.com/kip-random/kip_stores/amazon_uk.png",
    "store_type": "amazon_UK",
    "store_name": "Amazon UK",
    "store_domain": "amazon.co.uk",
    "store_countries": ["GB"]
  }, {
    "store_img": "https://storage.googleapis.com/kip-random/kip_stores/amazon_ca.png",
    "store_type": "amazon_CA",
    "store_name": "Amazon Canada",
    "store_domain": "amazon.ca",
    "store_countries": ["CA"]
  }, {
    "store_img": "https://storage.googleapis.com/kip-random/kip_stores/ypo.png",
    "store_type": "ypo",
    "store_name": "YPO",
    "store_domain": "ypo.co.uk",
    "store_countries": ["GB"]
  }
]

const countryCoordinates = {
  'US': [37.0902, -95.7129],
  'GB': [55.3781, -3.4360],
  'CA': [56.1304, -106.3468]
}

module.exports = {
  stores: stores,
  countryCoordinates: countryCoordinates
}
