const request = require('request-promise')
const co = require('co')
const assert = require('assert')
require('should')

describe('deals', () => {
  it('GET /api/deals should return some deals', () => co(function * () {
    var deals = yield request({
      uri: 'http://localhost:3000/api/deals',
      method: 'GET',
      json: true
    })
    assert(deals)
    assert(deals.length > 0, 'deals.length should be > 0')
    deals.map(d => {
      assert.equal(typeof d.original_name, 'string')
      assert.equal(typeof d.asin, 'string')
      assert.equal(typeof d.small, 'string')
      assert.equal(typeof d.medium, 'string')
      assert.equal(typeof d.large, 'string')
      assert.equal(typeof d.url, 'string')
      assert.equal(typeof d.createdAt, 'string')
      assert.equal(typeof d.updatedAt, 'string')
      assert.equal(typeof d.price, 'number')
      assert.equal(typeof d.previousPrice, 'number')
      assert.equal(typeof d.savePercent, 'number')
      assert.equal(typeof d.active, 'boolean')
    })

    // make sure the deals are recent in production
    if (process.env.NODE_ENV === 'production') {
      assert(new Date(deals[0].createdAt) > new Date(Date.now() - 1000 * 60 * 60 * 24), 'deals should be less than one day old')
    }
  }))
})
