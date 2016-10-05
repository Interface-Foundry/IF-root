var mock = require('../mock_slack_users.js')
var should = require('should')
require('co-mocha')
var _ = require('lodash')

describe('greeting', () => {
  before(function * () {
    this.timeout(5000)
    yield mock.setup()
  })
  it('should allow an admin to start an order with a saved address', function * () {
    var user = yield mock.Admin()
    user.chatuser.id.should.equal('admin_yolo')
    user.chatuser.team_id.should.equal('yolo')

    // Start the food convo with the admin
    var msg = yield user.text('food.begin')
    _.get(msg, 'attachments[0].text', '').should.equal("")
    _.get(msg, 'attachments[0].image_url', 'default').should.equal("http://kipthis.com/kip_modes/mode_cafe.png")
    _.get(msg, 'attachments[1].text', '').should.equal("Great! Which address is this for?")
    _.get(msg, 'attachments[1].actions.length', 0).should.equal(2)
    _.get(msg, 'attachments[1].actions[0].text', '').should.equal('21 Essex St 10002')
    _.get(msg, 'attachments[1].actions[1].text', '').should.equal('New +')

    // choose a saved address
    msg = yield user.tap(msg, 1, 0)
    _.get(msg, 'attachments[0].text', '').should.equal("Cool! You selected `21 Essex St 10002`. Delivery or Pickup?")
    _.get(msg, 'attachments[0].actions.length', 0).should.equal(2)
    _.get(msg, 'attachments[0].actions[0].text', '').should.equal('Delivery')
    _.get(msg, 'attachments[0].actions[1].text', '').should.equal('Pickup')

    // goes to s2

  })

  it('should allow an admin to start an order with a new address', function * () {
    var user = yield mock.Admin()
    user.chatuser.id.should.equal('admin_yolo')
    user.chatuser.team_id.should.equal('yolo')

    // Start the food convo with the admin
    var msg = yield user.text('food.begin')

    // choose to input a new address
    msg = yield user.tap(msg, 1, 1)
    msg.text.should.equal("What's the delivery address?")
    _.get(msg, 'attachments[0].text', '').should.equal("Type your address below")

    // type the address
    var msg = yield user.text('902 Broadway, New York, NY 10010')
    msg.text.should.equal("Is `902 Broadway, New York, NY 10010` your address?")
    _.get(msg, 'attachments[0].text', '').should.equal('')
    _.get(msg, 'attachments[0].actions.length', 0).should.equal(2)
    _.get(msg, 'attachments[0].actions[0].text', '').should.equal('Confirm')
    _.get(msg, 'attachments[0].actions[1].text', '').should.equal('Edit')

    // tap on confirm
    msg = yield user.tap(msg, 0, 0)

    // goes to S2
  })
})
