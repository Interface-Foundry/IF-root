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

    // Trigger the onboarding process
    var msg = yield user.text('onboarding')
    yield mock.format(msg, 'onboard.begin')

    // Tell Kip that I am an admin, going to the choose a screen
    msg = yield user.text('me')

    // remove the emoji which changes randomly
    msg.attachments[0].text = msg.attachments[0].text.substring(2)
    msg.attachments[1].text = msg.attachments[1].text.substring(2)
    yield mock.format(msg, 'onboard.cafe.1')

    // choose "Order Food" to go to the cafe onboarding segment
    msg = yield user.tap(msg, 0, 0)
    yield mock.format(msg, 'onboard.cafe.address.1')

    // tap "New Address" to go to the new address stuff
    msg = yield user.tap(msg, 1, 0)
    yield mock.format(msg, 'onboard.cafe.address.2')

    // type "122 West 27th Street New York"
    msg = yield user.text("122 West 27th Street New York", {expect: 2})
    yield mock.format(msg, 'onboard.cafe.address.3')

    // say "yes that is my address" to go to the "searching your area for good food..." etc
    // and then it goes to the budget screen i guess
    msg = yield user.tap(msg[1], 0, 0, {expect: 2})
    yield mock.format(msg, 'onboard.cafe.searchAndBudget')
  })
})
