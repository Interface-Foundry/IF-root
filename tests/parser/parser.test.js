require('co-mocha')
require('../../src/logging')
var _ = require('lodash')
var request = require('request-promise')

const HARD_PARSER = 'http://35.185.0.50:8083/parse'
var body = {
  text: 'what about socks'
}

describe('greeting', () => {
  it('hit the parser and get action response', function * () {
    var res = yield request({
      uri: HARD_PARSER,
      body: body,
      json: true
    })

    // logging.data(res)
    res.action.should.equal('initial')
  })
})
