const geolocation = require('../server/utilities/geolocation')
const assert = require('assert')

const test_addresses = {
  '69.250.207.231': {
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
  '192.206.151.131': {
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
  '219.75.27.16': {
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
  '185.86.151.11': {
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

describe('geolocation from ip', () => {
  Object.keys(test_addresses).map(ip => {
    const country = test_addresses[ip].country
    it(`should return country code ${country} for ${ip}`, () => {
      const res = geolocation({ip: ip})

      // test country
      assert.equal(res.country, country)

      // test ll
      const ll = test_addresses[ip].ll
      assert.equal(res.ll[0], ll[0])
      assert.equal(res.ll[1], ll[1])
    })
  })

  it('should return Washington DC as the default location', () => {
    const res = geolocation.default
    assert.equal(res.country, 'US')
    assert.equal(res.ll[0], 38.9213)
    assert.equal(res.ll[1], -77.0386)
    assert(res.isDefaultLocation)
  })

  it('should allow you to set process.env.MOCK_LOCALE', () => {
    process.env.MOCK_LOCALE = 'GB'
    const res = geolocation({ip: '127.0.0.1'})
    assert.equal(res.country, 'GB')
  })
})
