const request = require('request-promise')
const co = require('co')
const assert = require('assert')
require('should')

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
 * mcFriend is another demo user
 * @type {Object}
 */
const mcFriend = {
  thingsFriendLikes: ['late night ice cream', 'my university', 'serendipitous meetings'],
  thingsFriendIsShoppingFor: ['hydroflask', 'checkered tablecloth', 'warby parker'],
  email: 'friend@example.com',
  name: 'F McFriend'
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

const post = function * (url, data, extended) {
  url = 'http://localhost:3000' + url
  var body = yield request({
    uri: url,
    method: 'POST',
    jar: true,
    json: true,
    body: data,
    resolveWithFullResponse: extended
  })
  return body
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
  return body
}

describe('api', function () {
  this.timeout(4000)
  before(() => co(function * () {
    // clean up the db
    yield dbReady
    yield db.UserAccounts.destroy({
      email_address: mcTesty.email
    })
    yield db.UserAccounts.destroy({
      email_address: mcFriend.email
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
    assert(!session.user_account)
    assert(session.animal)
    assert(session.id)
    assert(session.createdAt)
  }))

  it('POST /api/cart/:cart_id/item should return Unauthorized for anyone that tries to push an item to a cart without being signed in', () => co(function * () {
    var err
    try {
      yield post('/api/cart/12345/item', {
        url: 'https://www.amazon.com/Onitsuka-Tiger-Mexico-Classic-Running/dp/B00L8IXMN0/ref=sr_1_11?s=apparel&ie=UTF8&qid=1490047374&sr=1-11&nodeID=679312011&psd=1&keywords=asics%2Bshoes&th=1&psc=1'
      })
    } catch (e) {
      err = e
    }
    assert(err)
    assert.equal(err.statusCode, 500, 'Should be 500 Unauthorized')
    err.response.body.should.startWith('Unauthorized')
  }))

  it('GET /api/cart/[Bad Id] should return 500 for a DNE cart', () => co(function * () {
    var err
    var res
    try {
      res = yield get('/api/cart/12345')
    } catch (e) {
      err = e
    }

    assert(err)
    assert.equal(err.statusCode, 500)
    err.response.body.should.startWith('Cart not found')
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
    }).populate('user_account')
    dbsession.user_account = user.id
    yield dbsession.save()

    // save the id for later
    mcTesty.id = user.id

    // now the user should be logged in
    const session2 = yield get('/api/session')
    assert(session2)
    assert(session2.user_account)
    assert(session2.user_account.email_address === mcTesty.email)
  }))

  it('GET /newcart should create a new cart, redirect to /cart/:Cart_id, and send an email', () => co(function * () {
    var res = yield get('/newcart', true)

    // make sure it's redirect to /cart/123456
    assert.equal(res.request.uri.path.split('/')[1], 'cart')

    // make sure the cart is in the db
    var cartId = res.request.uri.path.split('/')[2]
    var cart = yield db.Carts.findOne({id: cartId}).populate('leader')
    assert(cart)

    // make sure McTesty is the leader
    assert.equal(cart.leader.email_address, mcTesty.email)
    assert.equal(cart.name, mcTesty.email.replace(/@.*/, '') + "'s Kip Cart")

    // lets save this cart id for later
    mcTesty.cart_id = cart.id

    // check that an email sent and is associated with this cart
    var email = yield db.Emails.findOne({cart: cartId})
    assert(email)
    assert.equal(email.cart, cart.id)
    assert.equal(email.recipients, mcTesty.email)
    assert(email.message_html)
    assert.equal(email.template_name, 'new_email')
    assert(email.id)
  }))

  it('GET /api/carts should return all the users carts', () => co(function * () {
    // McTesty should already be leader of one cart, but lets make mcTesty a member of a new cart, too
    var memberCart = yield db.Carts.create({
      name: 'Test Member Cart'
    })
    memberCart.members.add(mcTesty.id)
    yield memberCart.save()

    // Get them all
    var carts = yield get('/api/carts')
    assert(carts instanceof Array, 'should return an array of carts, not ' + typeof carts)
    assert.equal(carts.length, 2, 'should have two carts')
    assert.equal(carts[0].id, mcTesty.cart_id)
    assert(carts[0].leader)
    assert.equal(carts[0].leader.email_address, mcTesty.email)
  }))

  it('POST /api/carts/cart_id/item should let McTesty add an item to the cart, returning the item', () => co(function * () {
    var url = 'https://www.amazon.com/HiLetgo-Version-NodeMCU-Internet-Development/dp/B010O1G1ES/ref=sr_1_3?ie=UTF8&qid=1490217410&sr=8-3&keywords=nodemcu'
    var item = yield post('/api/cart/' + mcTesty.cart_id + '/item', {
      url: url
    })

    assert(item)
    assert.equal(item.original_link, url)
    assert.equal(item.name, 'HiLetgo New Version NodeMCU LUA WiFi Internet ESP8266 Development')
    assert.equal(item.thumbnail_url, 'https://images-na.ssl-images-amazon.com/images/I/51yZrDeRUCL._SL75_.jpg')
    assert.equal(item.main_image_url, 'https://images-na.ssl-images-amazon.com/images/I/71FKRFAIT8L.jpg')

    // save item id for later
    mcTesty.item_id = item.id
  }))

  it('GET /api/cart/:cart_id should return all the info for a specific cart', () => co(function * () {
    var cart = yield get('/api/cart/' + mcTesty.cart_id)
    assert(cart)
    assert.equal(cart.leader.email_address, mcTesty.email)
    assert.equal(cart.items.length, 1, 'should only be one item in the cart')
  }))

  it('GET /api/cart/:cart_id/items should return all the items for a specific cart', () => co(function * () {
    var items = yield get('/api/cart/' + mcTesty.cart_id + '/items')
    assert(items)
    assert.equal(items.length, 1, 'should only be one item in the cart')
  }))

  it('POST /api/item/:item_id should update settings for an item', () => co(function * () {
    var settings = {
      locked: true
    }
    var item = yield post('/api/item/' + mcTesty.item_id, settings)
    assert(item)
    assert.equal(item.locked, settings.locked)

    // make sure settings were persisted
    item = yield get('/api/item/' + mcTesty.item_id)
    assert(item)
    assert.equal(item.locked, settings.locked)
  }))

  it('DELETE /api/cart/:cart_id/item/:item_id should delete a specific item', () => co(function * () {
    var ok = yield del('/api/cart/' + mcTesty.cart_id + '/item/' + mcTesty.item_id)

    // Check to make sure there are no more items in the cart
    var cart = yield get('/api/cart/' + mcTesty.cart_id)
    assert(cart)
    assert.equal(cart.leader.email_address, mcTesty.email)
    assert.equal(cart.items.length, 0, 'should not be any items in the cart now')
  }))

  it('GET /api/itempreview should return a preview of an item, but not add it to cart', () => co(function * () {
    var url = 'https://www.amazon.com/HiLetgo-Version-NodeMCU-Internet-Development/dp/B010O1G1ES/ref=sr_1_3?ie=UTF8&qid=1490217410&sr=8-3&keywords=nodemcu'
    var item = yield get('/api/itempreview?q=' + encodeURIComponent(url))
    assert(item)
    assert.equal(item.original_link, url)
    assert.equal(item.name, 'HiLetgo New Version NodeMCU LUA WiFi Internet ESP8266 Development')
    assert(item.thumbnail_url)
    assert(item.main_image_url)

    // save the preview item id for later
    mcTesty.previewItem = item

    // Check to make sure there are still no items in the cart
    var cart = yield get('/api/cart/' + mcTesty.cart_id)
    assert(cart)
    assert.equal(cart.leader.email_address, mcTesty.email)
    assert.equal(cart.items.length, 0, 'should not be any items in the cart now')
  }))

  it('POST /api/carts/:cart_id/item should allow McTesty to add a previewed item', () => co(function *() {
    var item = yield post('/api/cart/' + mcTesty.cart_id + '/item', {
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
    var cart = yield post('/api/cart/' + mcTesty.cart_id, settings)
    assert(cart)
    assert.equal(cart.name, settings.name)
    assert.equal(cart.id, mcTesty.cart_id)

    // ensure settings are persisted across requests
    cart = yield get('/api/cart/' + mcTesty.cart_id)
    assert(cart)
    assert.equal(cart.name, settings.name)
    assert.equal(cart.id, mcTesty.cart_id)
  }))

  it('GET /api/user should return a user for an email address', () => co(function * () {
    var user = yield get('/api/user?email=' + encodeURIComponent(mcTesty.email))
    assert(user)
    assert.equal(user.email_address, mcTesty.email)
    mcTesty.id = user.id
  }))

  it('GET /api/user should return a user for an id', () => co(function * () {
    var user = yield get('/api/user?id=' + encodeURIComponent(mcTesty.id))
    assert(user)
    assert.equal(user.email_address, mcTesty.email)
    assert.equal(user.id, mcTesty.id)
  }))

  it('POST /api/user/:user_id should update user properties if the user is logged in', () => co(function * () {
    var settings = {
      venmo_accepted: true,
      venmo_id: "MoMcTesty"
    }
    var user = yield post('/api/user/' + encodeURIComponent(mcTesty.id), settings)
    assert(user)
    assert.equal(user.email_address, mcTesty.email)
    assert.equal(user.id, mcTesty.id)
    assert.equal(user.venmo_id, settings.venmo_id)

    // and double check that when we get it again, the settings persist
    user = yield get('/api/user?id=' + encodeURIComponent(mcTesty.id))
    assert(user)
    assert.equal(user.email_address, mcTesty.email)
    assert.equal(user.id, mcTesty.id)
    assert.equal(user.venmo_id, settings.venmo_id)
  }))

  it('POST /api/user/:user_id should not allow a user to update a different user', () => co(function * () {
    var settings = {
      venmo_accepted: true,
      venmo_id: "MoMcTesty"
    }
    var err
    try {
      var user = yield post('/api/user/123456', settings)
    } catch (e) {
      err = e;
    }
    assert(err)
  }))

  it('GET /api/cart/:cart_id/checkout should redirect to the amazon cart with the affiliate id', () => co(function * () {
    var res = yield get('/api/cart/' + mcTesty.cart_id + '/checkout', true)

    // make sure it's redirect to amazon.com/gp/cart/aws-merge.html
    assert.equal(res.request.uri.pathname, '/gp/cart/aws-merge.html')
    assert(res.request.uri.query.includes('associate-id=motorwaytoros-20'), 'should contain our affiliate id')
  }))


  it('GET /api/cart/:cart_id/checkout should fix messed up carts and redirect to the amazon cart with the affiliate id', () => co(function * () {
    // let's mess up the cart!
    var cart = yield db.Carts.findOne({id: mcTesty.cart_id}).populate('items')
    cart.items[0].quantity++
    yield cart.items[0].save()

    var res = yield get('/api/cart/' + mcTesty.cart_id + '/checkout', true)

    // make sure it's redirect to amazon.com/gp/cart/aws-merge.html
    assert.equal(res.request.uri.pathname, '/gp/cart/aws-merge.html')
    assert(res.request.uri.query.includes('associate-id=motorwaytoros-20'), 'should contain our affiliate id')
  }))

  it('GET /api/item/:item_id/clickthrough should redirect to the amazon item with the affiliate id', () => co(function * () {
    var res = yield get('/api/item/' + mcTesty.item_id + '/clickthrough', true)

    // make sure it's redirect to amazon.com/some-product/......our affiliate id here
    assert(res.request.uri.query.includes('tag=motorwaytoros-20'), 'should contain our affiliate id')
  }))

  it('GET /api/cart/:cart_id/clear should clear all items in the cart', () => co(function * () {
    var res = yield get('/api/cart/' + mcTesty.cart_id + '/clear')

    // make sure the next time we get the cart all the items are really gone
    var cart = yield get('/api/cart/' + mcTesty.cart_id)
    assert(cart)
    assert.equal(cart.leader.email_address, mcTesty.email)
    assert.equal(cart.items.length, 0, 'should not be any items in the cart now')
  }))

  it('DELETE /api/cart/:cart_id should archive the cart so that it cannot be found', () => co(function * () {
    var res = yield del('/api/cart/' + mcTesty.cart_id)

    // make sure it's gone
    try {
      var cart = yield get('/api/cart/' + mcTesty.cart_id)
    } catch (e) {
      assert(e)
    }

    // make sure it doesn't show up in the user's cart list
    var carts = yield get('/api/carts')
    assert.equal(carts.filter(c => c.id === mcTesty.cart_id).length, 0, 'should not be able to get this cart anymore for the cart list')
  }))

  it('POST /api/feedback should save feedback to the db', () => co(function * () {
    var text = 'wow what a neat app. ' + Date.now()
    var res = yield post('/api/feedback', {
      rating: 'good',
      text: text
    })

    var feedback = yield db.Feedback.find({
      where: {},
      limit: 1,
      sort: 'createdAt DESC'
    }).populate('user')

    feedback = feedback[0]

    assert.equal(feedback.rating, 'good')
    assert.equal(feedback.text, text)
    assert.equal(feedback.user.id, mcTesty.id)
  }))
})
