var mock = require('../mock_data/mock.slack_users.js')
var should = require('should')
var _ = require('lodash')
require('co-mocha')

describe('greeting', () => {
  before(function * () {
    this.timeout(10000)
    yield mock.setup()
  })
  it('should respond to "food"', function * () {
    this.timeout(5000)
    var user = yield mock.ExistingUser()
    user.chatuser.id.should.equal('bamf_yolo')
    user.chatuser.team_id.should.equal('yolo')

    var res = yield user.text('food', {expect: 1})
    console.log(res)
    _.get(res, 'text', '').should.endWith('Start a new order anyway?')
  })
})
