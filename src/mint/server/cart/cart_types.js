const stores = [{
    "store_img": "flag image",
    "store_type": "amazon_us",
    "store_name": "Amazon US",
    "store_domain": "amazon.com",
    "store_countries": ["US"]
  }
]

const countryCoordinates = {
  'US': [37.0902, 95.7129], //n w
  'UK': [],
  'Canada': []
}

module.exports = {
  stores: stores,
  countryCoordinates: countryCoordinates
}
