const request = require('request-promise')
const co = require('co')
const assert = require('assert')

/**
 * We will use the db to circumvent the whole email checking process
 */
var db
const dbReady = require('../db')
dbReady.then((models) => { db = models }).catch(e => console.error(e))

/**
 * mcTesty is our demo user. This is just some generic info about mcTesty, not their db record or anything real.
 * @type {Object}
 */
const mcTesty = {
  thingsTestyLikes: ['cat pics', 'dog pics', 'food pics', 'k-drama', 'the beach'],
  thingsTestyIsShoppingFor: ['vacuum', 'roomba', 'sunscreen', 'photo album', 'shutterfly frame'],
  email: 'mctesty@example.com',
  name: 'M McTesty'
}

/**
 * Convenience function to make a get request with the cookies intact
 * @param  {string}    url the path, like /api/session
 * @return {Generator}     yields with the body
 */
const get = function * (url, extended) {
  url = 'http://localhost:3000' + url
  var body = yield request({
    uri: url,
    method: 'GET',
    jar: true,
    json: true,
    resolveWithFullResponse: extended
  })
  return body
}

const post = function * (url, data) {
  url = 'http://localhost:3000' + url
  var body = yield request({
    uri: url,
    method: 'POST',
    jar: true,
    json: true,
    body: data
  })
}

const del = function * (url, data) {
  url = 'http://localhost:3000' + url
  var body = yield request({
    uri: url,
    method: 'DELETE',
    jar: true,
    json: true,
    body: data
  })
}

describe('api', () => {
  before(() => co(function * () {
    // clean up the db
    yield dbReady
    yield db.UserAccounts.destroy({
      email_address: mcTesty.email
    })
  }))

  it('should keep track of user sessions', () => co(function * () {
    const me = yield get('/api/session')
    const me2 = yield get('/api/session')
    assert(me.id)
    assert(me.id === me2.id, 'ID must remain the same for same session')
  }))

  it('GET /api/session should return anonymous session before logging in', () => co(function * () {
    const session = yield get('/api/session')
    assert(session)
    assert(session.user_accounts instanceof Array)
    assert(session.user_accounts.length === 0)
    assert(session.animal)
    assert(session.id)
    assert(session.createdAt)
  }))

  it('POST /api/carts/:cart_id/items should return Unauthorized for anyone that tries to push an item to a cart without being signed in', () => co(function * () {
    var err
    try {
      yield post('/api/carts/12345/items', {
        url: 'https://www.amazon.com/Onitsuka-Tiger-Mexico-Classic-Running/dp/B00L8IXMN0/ref=sr_1_11?s=apparel&ie=UTF8&qid=1490047374&sr=1-11&nodeID=679312011&psd=1&keywords=asics%2Bshoes&th=1&psc=1'
      })
    } catch (e) {
      err = e
    }
    assert(err)
    assert.equal(err.statusCode, 401, 'Should be Unauthorized 401')

    // make sure it's json
    aseert(err.body)
    assert.strictEqual(err.body.ok, false)
  }))

  it('GET /api/carts/[Bad Id] should return 404 for a DNE cart', () => co(function * () {
    var err
    var res
    try {
      res = yield get('/api/carts/12345')
    } catch (e) {
      err = e
    }

    assert(err)
    assert.equal(err.statusCode, 404)

    // make sure it's json
    aseert(err.body)
    assert.strictEqual(err.body.ok, false)
  }))

  it('GET /api/session should return the user_account if signed in', () => co(function * () {
    // not signed in yet, just getting the session id
    const session = yield get('/api/session')

    // pretend to sign in here
    const user = yield db.UserAccounts.create({
      email_address: mcTesty.email
    })
    var dbsession = yield db.Sessions.findOne({
      id: session.id
    }).populate('user_accounts')
    dbsession.user_accounts.add(user.id)
    yield dbsession.save()

    // now the user should be logged in
    const session2 = yield get('/api/session')
    assert(session2)
    assert(session2.user_accounts instanceof Array)
    assert(session2.user_accounts.length === 1)
    assert(session2.user_accounts[0].email_address === mcTesty.email)
  }))

  it('GET /newcart should create a new cart and redirect to /cart/:Cart_id', () => co(function * () {
    var res = yield get('/newcart', true)

    // make sure it's redirect to /cart/123456
    assert.equal(res.request.uri.path.split('/')[1], 'cart')

    // make sure the cart is in the db
    var cartId = res.request.uri.path.split('/')[2]
    var cart = yield db.Carts.findOne({id: cartId}).populate('leader')
    assert(cart)

    // make sure McTesty is the leader
    assert.equal(cart.leader.email_address, mcTesty.email)

    // lets save this cart id for later
    mcTesty.cart_id = cart.id
  }))

  it('GET /api/carts should return all the users carts', () => co(function * () {
    var carts = yield get('/api/carts')
    assert(carts instanceof Array, 'should return an array of carts, not ' + typeof carts)
    assert.equal(carts.length, 1, 'should only be one cart because we have only created one')
    assert.equal(carts[0].id, mcTesty.cart_id)
    assert(carts[0].leader)
    assert.equal(carts[0].leader.email_address, mcTesty.email)
  }))

  it('POST /api/carts/cart_id/item should let McTesty add an item to the cart, returning the cart', () => co(function * () {
    var url = 'https://www.amazon.com/HiLetgo-Version-NodeMCU-Internet-Development/dp/B010O1G1ES/ref=sr_1_3?ie=UTF8&qid=1490217410&sr=8-3&keywords=nodemcu'
    var cart = yield post('/api/cart/' + mcTesty.cart_id + '/item', {
      url: url
    })

    assert(cart)
    assert(cart.items instanceof Array)
    assert.equal(cart.items.length, 1, 'should only be one item in the cart')
    assert.equal(cart.items[0].original_link, url)

    // save item id for later
    mcTesty.item_id = cart.items[0].id
  }))

  it('GET /api/cart/:cart_id should return all the info for a specific cart', () => co(function * () {
    var cart = yield get('/api/cart/' + mcTesty.cart_id)
    assert(cart)
    assert.equal(cart.leader.email_address, mcTesty.email)
    assert.equal(cart.items.length, 1, 'should only be one item in the cart')
  }))

  it('DELETE /api/cart/:cart_id/item should delete a specific item', () => co(function * () {
    var cart = yield del('/api/cart/' + mcTesty.cart_id + '/item', {
      id: mcTesty.item_id
    })

    assert(cart)
    assert.equal(cart.leader.email_address, mcTesty.email)
    assert.equal(cart.items.length, 0, 'should not be any items in the cart now')
  }))
})
