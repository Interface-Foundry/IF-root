var mock = require('../mock_slack_users.js')
var should = require('should')
require('co-mocha')
var _ = require('lodash')

describe('greeting', () => {
  before(function * () {
    this.timeout(10000)
    yield mock.setup()
  })
  it('should allow an admin to start an order for delivery', function * () {
    this.timeout(10000)
    var user = yield mock.Admin()
    user.chatuser.id.should.equal('admin_yolo')
    user.chatuser.team_id.should.equal('yolo')

    // Start the food convo with the admin
    var msg = yield user.text('food', {expect: 2})

    // choose a saved address
    msg = yield user.tap(msg[1], 0, 0)

    // S2A
    _.get(msg, 'attachments[0].text', '').should.equal('Cool! You selected `21 Essex St 10002`. Delivery or Pickup?')
    _.get(msg, 'attachments[0].actions.length', 0).should.equal(3)
    _.get(msg, 'attachments[0].actions[0].text', '').should.equal('Delivery')
    _.get(msg, 'attachments[0].actions[1].text', '').should.equal('Pickup')
    _.get(msg, 'attachments[0].actions[2].text', '').should.equal('< Change Address')

    // tap delivery trigger S2B
    msg = yield user.tap(msg, 0, 0, {expect: 2})

    _.get(msg, '[0].text', '').should.equal('Searching your area for good food...')
    _.get(msg, '1.attachments.0.text', '').replace(/goo.gl\/[A-Z]+/i, '').should.equal('You ordered `Delivery` from <https://|*Lily\'s*> recently, order again?')
    _.get(msg, '1.attachments.1.text', '').should.equal('*Tip:* `✓ Start New Poll` polls your team on what type of food they want.')

    _.get(msg, '1.attachments[0].actions.length', 0).should.equal(1)
    _.get(msg, '1.attachments[1].actions.length', 0).should.equal(2)

    _.get(msg, '1.attachments.0.actions.0.text', '').should.equal('✓ Choose')
    _.get(msg, '1.attachments.1.actions.0.text', '').should.equal('✓ Start New Poll')
    _.get(msg, '1.attachments.1.actions.1.text', '').should.equal('× Cancel')

  })
})
