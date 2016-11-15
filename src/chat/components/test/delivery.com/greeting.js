var mock = require('../mock_slack_users.js')
var should = require('should')
var _ = require('lodash')
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

    var res = yield user.text('food')
    console.log(res)
    _.get(res, 'attachments[0].image_url').should.equal('http://kipthis.com/kip_modes/mode_cafe.png')
  })
})
