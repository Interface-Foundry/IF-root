require('co-mocha');
var _ = require('lodash');
var assert = require('chai').assert;
var expect = require('chai').expect;


var amazon = require('../server/cart/amazon_cart.js');

var test_item = 'https://www.amazon.com/AmazonBasics-Apple-Certified-Lightning-Cable/dp/B010S9N6OO/ref=sr_1_1?ie=UTF8&qid=1490132282&sr=8-1';

var test = {}

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

  it('should get item from ItemLookup using url ', function * () {
    var item = yield amazon.getAmazonItem(test_item);
    expect(item).to.exist;
  })


  it('create a cart', function * () {
    // var item = yield amazon.getAmazonItem(test_item);
    var cart = yield amazon.createAmazonCart({ASIN: 'B010S9N6OO'});
    expect(cart).to.exist;
    expect(cart.HMAC).to.exist;
    expect(cart.CartId).to.exist;
    expect(cart.PurchaseURL).to.exist;
    test.cart = cart;
  })


  it('get a cart', function * () {
    var cart = yield amazon.getAmazonCart(test.cart);
    expect(cart).to.exist;
    expect(cart.HMAC).to.exist;
    expect(cart.CartId).to.exist;
    expect(cart.PurchaseURL).to.exist;
    assert.equal(cart.HMAC, test.cart.HMAC);
    assert.equal(cart.CartId, test.cart.CartId);
    assert.equal(cart.PurchaseURL, test.cart.PurchaseURL);
    assert.equal(cart.CartItems.CartItem instanceof Array, false, 'CartItems.CartItem should not be an array if only one item in cart')
  })

  it('add another item to cart', function * () {
    var cart = yield amazon.addAmazonItemToCart({ASIN: 'B01BYO79UE'}, test.cart);
    expect(cart.CartItems.CartItem.length).to.equal(2);
    test.cart = cart
  })

  it('add another of an item that was already added to cart to increase quantity', function * () {
    var cart = yield amazon.addAmazonItemToCart({ASIN: 'B01BYO79UE'}, test.cart);
    expect(cart.CartItems.CartItem.length).to.equal(2); // because same item
    cart.CartItems.CartItem.map(i => {
      if (i.ASIN === 'B01BYO79UE') {
        assert.equal(i.Quantity, '2')
      } else {
        assert.equal(i.Quantity, '1')
      }
    })
    test.cart = cart
  })
  
})
