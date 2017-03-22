require('co-mocha');
var _ = require('lodash');
var assert = require('chai').assert;
var expect = require('chai').expect;


var amazon = require('../server/utilities/amazon_cart.js');

var test_item = 'https://www.amazon.com/AmazonBasics-Apple-Certified-Lightning-Cable/dp/B010S9N6OO/ref=sr_1_1?ie=UTF8&qid=1490132282&sr=8-1';

describe('testing amazon to our cart system', () => {
  it('get item asin from url', function * () {
    var item = amazon.getAsin(test_item);
    expect(item).to.equal('B010S9N6OO');
  });

  it.skip('should get item from ItemLookup using url ', function * () {
    var item = yield amazon.getAmazonItem(test_item);
    expect(item).to.exist;
  })


  it.skip('create a cart', function * () {
    // var item = yield amazon.getAmazonItem(test_item);
    var cart = yield amazon.createAmazonCart({ASIN: 'B010S9N6OO'});
    console.log(cart);
    expect(cart).to.exist;
  })


  it.skip('get a cart', function * () {
    var cart = yield amazon.createAmazonCart({ASIN: 'B010S9N6OO'});
    cart = yield amazon.getAmazonCart(cart.CartId, cart.HMAC);
    expect(cart).to.exist;
  })

  it('add another of item already added to cart', function * () {
    var cart = yield amazon.createAmazonCart({ASIN: 'B010S9N6OO'});
    cart = yield amazon.addAmazonItemToCart({ASIN: 'B01BYO79UE'}, cart);
    console.log(cart.CartItems)
    expect(cart).to.exist;
  })
  // describe('test if coupon use changes', function () {
  //   before('use coupon', function * () {
  //     var c = yield db.coupons.findOne({team_id: TEAM_ID, coupon_code: SINGLE_USE_CODE})
  //     c.quantity_coupon.used += 3
  //     yield c.save()
  //   })

  //   it('coupon used', function * () {
  //     var coupon = yield db.coupons.findOne({team_id: TEAM_ID, coupon_code: SINGLE_USE_CODE})
  //     expect(coupon.available).to.be.false
  //   })
  // })

})
