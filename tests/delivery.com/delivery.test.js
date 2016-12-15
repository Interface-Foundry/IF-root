require('co-mocha')
var _ = require('lodash')
var expect = require('chai').expect
var path = require('path')
var sleep = require('co-sleep')

// SET UP AND CONSTS
// const DELIVERY_DIR = '../../../chat/components/delivery.com/'
// const SLACK_DIR = '../../src/chat/components/slack/'

require('../../src/db/')
require('../../src/logging.js')

var mock = require('./old/mock_slack_users.js')
// LOCAL IMPORTS
// var mock = require(path.join(SLACK_DIR, 'mock_slack_users.js'))

// TESTING

describe('testing of delivery.com', () => {
  before(function * () {
    this.timeout(10000)
    yield mock.setup()
  })

  // after(function * () {
  //   // delete stuff from delivery
  //   yield db.delivery.remove({'team_id': 'yolo'})
  // })

  it('should allow an admin to start an order with a saved address', function * () {
    this.timeout(20000)
    var user = yield mock.Admin()
    expect(user.chatuser.id).to.equal('admin_yolo')

    // Start the food convo with the admin
    var msg = yield user.text('food')
    expect(msg.attachments).to.have.length(3)
    expect(msg.attachments[0].image_url).to.equal('http://kipthis.com/kip_modes/mode_cafe.png')

    // choose a saved address
    msg = yield user.tap(msg, 1, 0)

    // goes to s2
    logging.error('sleeping 10 seconds')
    yield sleep(10000)
    msg = yield user.text('food.admin_polling_options')

    logging.data(msg)
    expect(msg.attachments[1].text).to.equal('*Tip:* `✓ Start New Poll` polls your team on what type of food they want')

    // reordering for testing
    msg = yield user.tap(msg, 0, 0)
    })
})

