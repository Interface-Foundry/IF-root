require('co-mocha');
const _ = require('lodash');
const expect = require('chai').expect;


const dbReady = require('../db');
const cartUtils = require('../server/cart/cart_utils');

const amazonTestItems = [
  {
    id: 'B010S9N6OO',
    item: 'https://www.amazon.com/AmazonBasics-Apple-Certified-Lightning-Cable/dp/B010S9N6OO/ref=sr_1_1?ie=UTF8&qid=1490132282&sr=8-1'
  }, {
    id: 'B01BYO79UE',
    item: 'https://www.amazon.com/dp/B01BYO79UE'
  }
]

const ypoTestItems = [
  {
    id: '100013'
  }
]

describe('testing cart system', () => {
  before(function * () {
    yield dbReady;
  })

  it.skip('get item retailer from url', function * () {
    var retailer = cart.getRetailer(amazonTestItems[1].item);
    expect(retailer).to.equal('amazon')
  });

  it.skip('should create a new cart for ypo', function * () {
    let cart = yield cartUtils.createCart('ypo')
    expect(cart.store).to.equal('ypo')
  })

  it.skip('should create a new cart with no store (equal to amazon)', function * () {
    let cart = yield cartUtils.createCart()
    expect(cart.store).to.equal('amazon')
  })

  it.skip('should add the item to the cart for an amazon cart', function * () {
    var cart = yield cart.createCart();
    var cart = yield cart.addItem(amazonTestItems[1].item);
  })

  it.skip('should remove the item after adding it', function * () {
    var cart = yield cart.createCart(amazonTestItems);
    var cart = yield cart.addItem(amazonTestItems);
    var cart = yield cart.removeItem(amazonTestItems);
  })

  it.skip('should get item from ItemLookup using url ', function * () {
    var item = yield cart.getItem(amazonTestItems);
  })
})
