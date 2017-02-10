var mock = require('../mock_data/mock.slack_users.js')
var should = require('should')
require('co-mocha')
var _ = require('lodash')

describe('greeting', () => {
  before(function * () {
    this.timeout(10000)
    yield mock.setup()
  })
  it('should allow an admin to start an order for delivery', function * () {
    this.timeout(20000)
    var user = yield mock.Admin()
    user.chatuser.id.should.equal('admin_yolo')
    user.chatuser.team_id.should.equal('yolo')

    // Start the food convo with the admin
    var msg = yield user.text('food')
    yield mock.format(msg, 's1.0.confirm_new')

    // choose "Start Anyway" to go to the addresses
    msg = yield user.tap(msg, 0, 0)
    yield mock.format(msg, 's1.a.addresses')

    // tap address to go to the budget selection
    msg = yield user.tap(msg, 0, 0, {expect: 2})
    yield mock.format(msg, 's1.b.budget')

    // tap "Unlimited" to go to the Last Delivery or Pickup order screen
    msg = yield user.tap(msg[1], 0, 3)
    yield mock.format(msg, 's2.b.previous')
  })
})
