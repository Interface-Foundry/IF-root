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

    var res = yield user.text('food', {expect: 2})
    _.get(res, '[0]attachments[0].image_url').should.equal('http://kipthis.com/kip_modes/mode_cafe.png')
    _.get(res, '[1]attachments[0].text').should.equal('Great! Which address is this for?')
  })
})
