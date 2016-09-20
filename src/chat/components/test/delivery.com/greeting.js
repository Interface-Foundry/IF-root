var mock = require('../mock_slack_users.js')
var should = require('should')
require('co-mocha')

describe('greeting', () => {
  it('should respond to "food"', function * () {
    var user = yield mock.ExistingUser()
    user.id.should.equal('bamf')
    user.team_id.should.equal('yolo')

    var res = yield user.text("food")
    res.text.should.equal("yeah let's eat! what address should i use?")
  })
})