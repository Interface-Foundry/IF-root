var mock = require('../mock_slack_users.js')
var should = require('should')
require('co-mocha')
var _ = require('lodash')

describe('greeting', () => {
  before(function * () {
    this.timeout(5000)
    yield mock.setup()
  })
  it('should allow an admin to start an order for delivery', function * () {
    var user = yield mock.Admin()
    user.chatuser.id.should.equal('admin_yolo')
    user.chatuser.team_id.should.equal('yolo')

    // Start the food convo with the admin
    var msg = yield user.text('food.begin')
    // choose a saved address
    msg = yield user.tap(msg, 1, 0)

    // S2
    _.get(msg, 'attachments[0].text', '').should.equal("Cool! You selected `21 Essex St 10002`. Delivery or Pickup?")
    _.get(msg, 'attachments[0].actions.length', 0).should.equal(2)
    _.get(msg, 'attachments[0].actions[0].text', '').should.equal('Delivery')
    _.get(msg, 'attachments[0].actions[1].text', '').should.equal('Pickup')

    // tap delivery
    msg = yield user.tap(msg, 0, 0)

    // S2B
    _.get(msg, 'attachments[0].text', '').should.equal("You ordered `Delivery` from `Lantern Thai Kitchen` last time, order again?")
    _.get(msg, 'attachments[0].actions.length', 0).should.equal(1)
    _.get(msg, 'attachments[0].actions[0].text', '').should.equal('Choose Restaurant')
    _.get(msg, 'attachments[1].text', '').should.equal('*Tip:* `✓ Start New Poll` polls your team on what type of food they want.')
    _.get(msg, 'attachments[1].actions[0].text', '').should.equal('✓ Start New Poll')
    _.get(msg, 'attachments[1].actions[1].text', '').should.equal('See More')
    _.get(msg, 'attachments[1].actions[2].text', '').should.equal('× Cancel')

  })
})
