const request = require('request-promise')
const assert = require('assert')
var db
const dbReady = require('../db')
dbReady.then((models) => { db = models })


class MockClient {
  constructor() {
    this.jar = request.jar()
    this.baseUrl = 'http://localhost:3000'
  }

  /**
   * Login in as a random user
   * @type {[type]}
   */
  static async getRandomUser() {
    const email = 'test_user_' + (Math.random() * 10000000 | 0)  + '@example.com'
    await dbReady
    const client = new MockClient()
    const session = await client.get('/api/session')
    const user = await db.UserAccounts.create({
      email_address: email,
      name: 'Test User'
    })
    client.user_account = user
    const dbSession = await db.Sessions.findOne({
      id: session.id
    })
    dbSession.user_account = user.id
    await dbSession.save()
    return client
  }

  /**
   * Run a get request as this user
   * @param  {[type]}  url      [description]
   * @param  {[type]}  extended [description]
   * @return {Promise}          [description]
   */
  async get(url, extended) {
    var body = await request({
      uri: this.baseUrl + url,
      method: 'GET',
      jar: this.jar,
      json: true,
      resolveWithFullResponse: extended
    })
    return body
  }


  async post(url, data, extended) {
    var body = await request({
      uri: this.baseUrl + url,
      method: 'POST',
      jar: this.jar,
      json: true,
      body: data,
      resolveWithFullResponse: extended
    })
    return body
  }

  async put(url, data, extended) {
    var body = await request({
      uri: this.baseUrl + url,
      method: 'PUT',
      jar: this.jar,
      json: true,
      body: data,
      resolveWithFullResponse: extended
    })
    return body
  }

  async del(url, extended) {
    var body = await request({
      uri: this.baseUrl + url,
      method: 'GET',
      jar: this.jar,
      json: true,
      resolveWithFullResponse: extended
    })
    return body
  }
}

module.exports = MockClient

//
// It even tests itself!
//
if (typeof describe === 'function') {
  require('../server')
  describe('MockClient', () => {
    before(async () => {
      await dbReady
    })

    it('should return the same session with every request', async () => {
      var client = new MockClient()
      var session1 = await client.get('/api/session')
      var session2 = await client.get('/api/session')
      assert(session1)
      assert.equal(session1.id, session2.id)
    })

    it('should return a totally random user', async () => {
      var bob = await MockClient.getRandomUser()
      assert(bob.user_account)
      assert(bob.user_account.id)
      assert(bob.user_account.email_address)
      var bob2 = await bob.get('/api/user?id=' + bob.user_account.id)
      assert.equal(bob.user_account.id, bob2.id)
    })

    it('should be capable of having multiple users going', async () => {
      var bob = await MockClient.getRandomUser()
      var sally = await MockClient.getRandomUser()
      assert(bob.user_account.id !== sally.user_account.id)
      var bobSession = await bob.get('/api/session')
      var sallySession = await sally.get('/api/session')
      assert(bobSession.id !== sallySession.id)
    })
  })
}
