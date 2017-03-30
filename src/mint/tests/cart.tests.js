require('co-mocha');
var _ = require('lodash');

var expect = require('chai').expect;

var cart = require('../server/utilities/cart_utils.js');

var test_item = 'https://www.amazon.com/AmazonBasics-Apple-Certified-Lightning-Cable/dp/B010S9N6OO/ref=sr_1_1?ie=UTF8&qid=1490132282&sr=8-1';
var test_item2 = 'https://www.amazon.com/dp/B01BYO79UE';

describe('testing amazon to our cart system', () => {
  it('get item retailer from url', function * () {
    var retailer = cart.getRetailer(test_item);
    expect(retailer).to.equal('amazon')
  });

  it('should get item from ItemLookup using url ', function * () {
    var item = yield cart.getItem(test_item);
    console.log(item)
  })

  it.skip('should create the cart with the first test_item ', function * () {
    var item = yield cart.createCart(test_item);
  })

  it.skip('should add the item to the cart', function * () {
    var cart = yield cart.createCart(test_item);
    var cart = yield cart.addItem(test_item2);
  })

  it.skip('should remove the item after adding it', function * () {
    var cart = yield cart.createCart(test_item);
    var cart = yield cart.addItem(test_item2);
    var cart = yield cart.removeItem(test_item2);
  })

  it.skip('should get item from ItemLookup using url ', function * () {
    var item = yield cart.getItem(test_item);
  })
})