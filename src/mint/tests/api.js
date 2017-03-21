const request = require('request-promise')
const co = require('co')
const assert = require('assert')

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

describe('api', () => {
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
})
