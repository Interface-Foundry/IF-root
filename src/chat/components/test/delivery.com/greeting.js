var mock = require('../mock_slack_users.js')
var should = require('should')
require('co-mocha')

describe('greeting', () => {
  before(function * () {
    this.timeout(5000)
    yield mock.setup()
  })
  it('should respond to "food"', function * () {
    var user = yield mock.ExistingUser()
    user.chatuser.id.should.equal('bamf_yolo')
    user.chatuser.team_id.should.equal('yolo')

    var res = yield user.text("food")
    res.text.should.equal("yeah let's eat! what address should i use?")
  })
})