const request = require('request-promise')
const co = require('co')
const assert = require('assert')
require('should')
require('../server/index')
const MockClient = require('./MockClient')
var client
var db
var dbReady = require('../db')

describe('YPO cart', function () {
  this.timeout(4000)

  before(async () => {
    db = await dbReady
    client = await MockClient.getRandomUser()
  })

  it('GET /newcart/store should create a new cart, redirect to /cart/:Cart_id, and send an email', () => co(function * () {
    var res = yield client.get('/newcart/YPO', true)

    // make sure it's redirect to /cart/123456
    assert.equal(res.request.uri.path.split('/')[1], 'cart')

    // make sure the cart is in the db
    var cartId = res.request.uri.path.split('/')[2]
    var cart = yield db.Carts.findOne({id: cartId}).populate('leader')
    assert(cart)
    assert(cart.store_locale)
    assert(cart.store)

    // make sure McTesty is the leader
    assert.equal(cart.leader.email_address, mcTesty.email)
    // assert.equal(cart.name, mcTesty.name + "'s Kip Cart")

    // lets save this cart id for later
    mcTesty.cart_id = cart.id

    // check that an email sent and is associated with this cart
    // var email = yield db.Emails.findOne({cart: cartId})
    // assert(email)
    // assert.equal(email.cart, cart.id)
    // assert.equal(email.recipients, mcTesty.email)
    // assert(email.message_html)
    // assert.equal(email.template_name, 'new_cart')
    // assert(email.id)
  }))

  it('GET /api/itempreview should let McTesty search items', () => co(function * () {
    var res = yield client.get('/api/itempreview?q=notebook&store=ypo&store_locale=GB')
    mcTesty.item_id = res[0].id
  }))

  it('POST /api/carts/cart_id/item should let McTesty add an item to the cart, returning the item', () => co(function * () {
    var item = yield client.post('/api/cart/' + mcTesty.cart_id + '/item', {
      item_id: mcTesty.item_id
    })

    assert(item)
  }))

  it('GET /api/cart/:cart_id should return all the info for a specific cart', () => co(function * () {
    var cart = yield client.get('/api/cart/' + mcTesty.cart_id)
    assert(cart)
    assert.equal(cart.leader.email_address, mcTesty.email)
    assert.equal(cart.items.length, 1, 'should only be one item in the cart')
  }))

  it('GET /api/cart/:cart_id/items should return all the items for a specific cart', () => co(function * () {
    var items = yield client.get('/api/cart/' + mcTesty.cart_id + '/items')
    assert(items)
    assert.equal(items.length, 1, 'should only be one item in the cart')
  }))

  it('POST /api/item/:item_id should update settings for an item', () => co(function * () {
    var settings = {
      locked: true
    }
    var item = yield client.post('/api/item/' + mcTesty.item_id, settings)
    assert(item)
    assert.equal(item.locked, settings.locked)

    // make sure settings were persisted
    item = yield client.get('/api/item/' + mcTesty.item_id)
    assert(item)
    assert.equal(item.locked, settings.locked)
  }))

  it('DELETE /api/cart/:cart_id/item/:item_id should delete a specific item', () => co(function * () {
    var ok = yield client.del('/api/cart/' + mcTesty.cart_id + '/item/' + mcTesty.item_id)

    // Check to make sure there are no more items in the cart
    var cart = yield client.get('/api/cart/' + mcTesty.cart_id)
    assert(cart)
    assert.equal(cart.leader.email_address, mcTesty.email)
    assert.equal(cart.items.length, 0, 'should not be any items in the cart now')
  }))

  it('GET /api/itempreview should return a preview of an item, but not add it to cart', () => co(function * () {
    var url = 'https://www.amazon.com/HiLetgo-Version-NodeMCU-Internet-Development/dp/B010O1G1ES/ref=sr_1_3?ie=UTF8&qid=1490217410&sr=8-3&keywords=nodemcu'
    var item = yield client.get('/api/itempreview?q=' + encodeURIComponent(url))
    assert(item)
    assert.equal(item.original_link, url)
    assert.equal(item.name, 'HiLetgo New Version NodeMCU LUA WiFi Internet ESP8266 Development')
    assert(item.thumbnail_url)
    assert(item.main_image_url)

    // save the preview item id for later
    mcTesty.previewItem = item

    // Check to make sure there are still no items in the cart
    var cart = yield client.get('/api/cart/' + mcTesty.cart_id)
    assert(cart)
    assert.equal(cart.leader.email_address, mcTesty.email)
    assert.equal(cart.items.length, 0, 'should not be any items in the cart now')
  }))

  it('POST /api/carts/:cart_id/item should allow McTesty to add a previewed item', () => co(function *() {
    var item = yield client.post('/api/cart/' + mcTesty.cart_id + '/item', {
      item_id: mcTesty.previewItem.id
    })

    assert(item)
    assert.equal(item.original_link, mcTesty.previewItem.original_link)
    assert.equal(item.name, 'HiLetgo New Version NodeMCU LUA WiFi Internet ESP8266 Development')
    assert(item.thumbnail_url)
    assert(item.main_image_url)
  }))

  it('POST /api/cart/:cart_id should update cart properties', () => co(function * () {
    var settings = {
      name: 'Office Party'
    }

    // test settings changes
    var cart = yield client.post('/api/cart/' + mcTesty.cart_id, settings)
    assert(cart)
    assert.equal(cart.name, settings.name)
    assert.equal(cart.id, mcTesty.cart_id)

    // ensure settings are persisted across requests
    cart = yield client.get('/api/cart/' + mcTesty.cart_id)
    assert(cart)
    assert.equal(cart.name, settings.name)
    assert.equal(cart.id, mcTesty.cart_id)
  }))

  it.skip('GET /api/cart/:cart_id/checkout should redirect to the amazon cart with the affiliate id', () => co(function * () {
    var res = yield client.get('/api/cart/' + mcTesty.cart_id + '/checkout', true)

    // make sure it's redirect to amazon.com/gp/cart/aws-merge.html
    assert.equal(res.request.uri.pathname, '/gp/cart/aws-merge.html')
    assert(res.request.uri.query.includes('associate-id=motorwaytoros-20'), 'should contain our affiliate id')
  }))

  it.skip('GET /api/item/:item_id/clickthrough should redirect to the amazon item with the affiliate id', () => co(function * () {
    var res = yield client.get('/api/item/' + mcTesty.item_id + '/clickthrough', true)

    // make sure it's redirect to amazon.com/some-product/......our affiliate id here
    assert(res.request.uri.query.includes('tag=motorwaytoros-20'), 'should contain our affiliate id')
  }))

  it('DELETE /api/cart/:cart_id/clear should clear all items in the cart', () => co(function * () {
    var res = yield client.del('/api/cart/' + mcTesty.cart_id + '/clear')

    // make sure the next time we get the cart all the items are really gone
    var cart = yield client.get('/api/cart/' + mcTesty.cart_id)
    assert(cart)
    assert.equal(cart.leader.email_address, mcTesty.email)
    assert.equal(cart.items.length, 0, 'should not be any items in the cart now')
  }))
})
