require('co-mocha');
var _ = require('lodash');
var assert = require('chai').assert;
var expect = require('chai').expect;


var amazon = require('../server/cart/amazon_cart.js');

var test_item = 'https://www.amazon.com/AmazonBasics-Apple-Certified-Lightning-Cable/dp/B010S9N6OO/ref=sr_1_1?ie=UTF8&qid=1490132282&sr=8-1';

describe('testing amazon to our cart system', () => {
  it('get item asin from various urls', function * () {
    const items = {
      B010S9N6OO: 'https://www.amazon.com/AmazonBasics-Apple-Certified-Lightning-Cable/dp/B010S9N6OO/ref=sr_1_1?ie=UTF8&qid=1490132282&sr=8-1',
      B00L8IVWQ4: 'https://www.amazon.com/dp/B00L8IVWQ4/ref=twister_B00PZKJJ5W',
      B01K1IO3QW: 'https://www.amazon.com/Acer-E5-575-33BM-15-6-Inch-Processor-Generation/dp/B01K1IO3QW/ref=sr_1_4?s=pc&ie=UTF8&qid=1491408499&sr=1-4&keywords=laptop'
    }

    Object.keys(items).map(k => {
      const item = amazon.getAsin(items[k])
      assert.equal(item, k)
    })
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
    expect(cart.CartItems.CartItem.length).to.equal(2);
  })

  it('increase quantity of item', function * () {
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
