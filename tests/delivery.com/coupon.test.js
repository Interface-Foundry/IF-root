require('co-mocha')

var _ = require('lodash')
var expect = require('chai').expect
var testingHelpers = require('./testing_helpers.js')

require('../../src/kip.js')
require('../../src/logging.js')

var coupon = require(testingHelpers.getModule('coupon.js', testingHelpers.COUPON_DIR))
var couponUsing = require(testingHelpers.getModule('couponUsing.js', testingHelpers.COUPON_DIR))

var TEAM_ID = 'TESTING_123'
var COUPON_TYPE = 'percentage'
var COUPON_AMOUNT = .42
var SINGLE_USE = 1
var SINGLE_USE_CODE = 'TEST_SINGLE_USE'
var MULTI_USE = 3

// TESTING
describe('testing creating admins checkout Attachments', () => {
  before('createNewMultiUseCoupon', function * () {
    yield db.coupons.remove({team_id: TEAM_ID})
    yield coupon.createNewMultiUseCoupon(TEAM_ID, COUPON_TYPE, COUPON_AMOUNT, MULTI_USE, SINGLE_USE_CODE, SINGLE_USE_CODE)
  })

  it('it should test createNewMultiUseCoupon', function * () {
    var coupon = yield db.coupons.findOne({team_id: TEAM_ID, coupon_code: SINGLE_USE_CODE})
    expect(coupon).to.be.ok
    expect(coupon.available).to.be.true
  })


  it('getlatestcoupon should work', function * () {
    var coupon = yield couponUsing.getLatestFoodCoupon(TEAM_ID)
    expect(coupon.coupon_code).to.equal(SINGLE_USE_CODE)
  })

  describe('test if coupon use changes', function () {
    before('use coupon', function * () {
      var c = yield db.coupons.findOne({team_id: TEAM_ID, coupon_code: SINGLE_USE_CODE})
      c.quantity_coupon.used += 3
      yield c.save()
    })

    it('coupon used', function * () {
      var coupon = yield db.coupons.findOne({team_id: TEAM_ID, coupon_code: SINGLE_USE_CODE})
      expect(coupon.available).to.be.false
    })
  })

})
