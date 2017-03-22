const request = require('request-promise')
const co = require('co')
const assert = require('assert')

/**
 * We will use the db to circumvent the whole email checking process
 */
var db;
const dbReady = require('../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

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
const get = function * (url) {
  url = 'http://localhost:3000' + url
  var body = yield request({
    uri: url,
    method: 'GET',
    jar: true,
    json: true
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

  it('should return anonymous session before logging in', () => co(function * () {
    const session = yield get('/api/session')
    assert(session)
    assert(session.user_accounts instanceof Array)
    assert(session.user_accounts.length === 0)
    assert(session.animal)
    assert(session.id)
    assert(session.createdAt)
  }))

  it('should return Unauthorized for anyone that tries to push an item to a cart without being signed in', () => co(function * () {
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

  it('should return 404 for a DNE cart', () => co(function * () {
    var err
    var res
    try {
      res = yield get('/api/carts/12345')
    } catch (e) {
      err = e
    }

    console.log(res)

    assert(err)
    assert.equal(err.statusCode, 404)

    // make sure it's json
    aseert(err.body)
    assert.strictEqual(err.body.ok, false)
  }))

  it('should pretend to sign in for the rest of the testing', () => co(function * () {
    const session = yield get('/api/session')
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
})
