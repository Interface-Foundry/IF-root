const geoip = require('geoip-lite')

/**
 * Get the geolocation from a request
 * @param  {Object} options {ip: string}
 * @return {[type]}     [description]
 */
module.exports = function (options) {
  var geoinfo = geoip.lookup(options.ip)
  if (process.env.MOCK_LOCALE) {
    if (mock_locations[process.env.MOCK_LOCALE]) {
      geoinfo = mock_locations[process.env.MOCK_LOCALE]
    } else {
      throw new Error(`No mock location defined for "${process.env.MOCK_LOCALE}"`) // make sure developers know if they mess up
    }
  }

  return geoinfo
}

/**
 * Default location if you can't tell otherwise
 * @type {Object}
 */
module.exports.default = {
  country: 'US',
  region: 'DC',
  city: 'Washington',
  ll: [
    38.9213, -77.0386
  ],
  metro: 511,
  zip: 20009,
  isDefaultLocation: true
}

/**
 * Mock locations for development.
 * @type {Object}
 */
const mock_locations = {
  US: {
    range: [
      1174063872, 1174065151
    ],
    country: 'US',
    region: 'DC',
    city: 'Washington',
    ll: [
      38.9213, -77.0386
    ],
    metro: 511,
    zip: 20009
  },
  CA: {
    range: [
      3234762752, 3234764799
    ],
    country: 'CA',
    region: 'ON',
    city: 'Toronto',
    ll: [
      43.6684, -79.3689
    ],
    metro: 0,
    zip: 0
  },
  SG: {
    range: [
      3679067136, 3679133695
    ],
    country: 'SG',
    region: '00',
    city: 'Singapore',
    ll: [
      1.2855, 103.8565
    ],
    metro: 0,
    zip: 0
  },
  GB: {
    range: [
      3109459712, 3109459771
    ],
    country: 'GB',
    region: 'H9',
    city: 'London',
    ll: [
      51.5092, -0.0955
    ],
    metro: 0,
    zip: 0
  }
}

mock_locations.UK = mock_locations.GB
