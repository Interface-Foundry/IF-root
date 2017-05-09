require('co-mocha');
const dbReady = require('../db');
const _ = require('lodash');

var expect = require('chai').expect;

var cartUtils = require('../server/cart/cart_utils');

var test_item = 'https://www.amazon.com/AmazonBasics-Apple-Certified-Lightning-Cable/dp/B010S9N6OO/ref=sr_1_1?ie=UTF8&qid=1490132282&sr=8-1';
var test_item2 = 'https://www.amazon.com/dp/B01BYO79UE';

describe('testing cart system', () => {
  before(function * () {
    yield dbReady;
  })

  it.skip('get item retailer from url', function * () {
    var retailer = cart.getRetailer(test_item);
    expect(retailer).to.equal('amazon')
  });

  it('should create a new cart for ypo', function * () {
    let cart = yield cartUtils.createCart('ypo')
    expect(cart.store).to.equal('ypo')
  })

  it('should create a new cart with no store (equal to amazon)', function * () {
    let cart = yield cartUtils.createCart()
    expect(cart.store).to.equal('amazon')
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
