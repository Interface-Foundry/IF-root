require('co-mocha')
var _ = require('lodash')
var should = require('should')
var path = require('path')

// SET UP AND CONSTS
// const DELIVERY_DIR = '../../../chat/components/delivery.com/'
// const SLACK_DIR = '../../src/chat/components/slack/'

var logging = require('../../src/logging.js')
var mock = require('./old/mock_slack_users.js')
// LOCAL IMPORTS
// var mock = require(path.join(SLACK_DIR, 'mock_slack_users.js'))

// TESTING

describe('greeting', () => {
  before(function * () {
    this.timeout(10000)
    yield mock.setup()
  })
  it('should allow an admin to start an order with a saved address', function * () {
    this.timeout(5000)
    var user = yield mock.Admin()
    user.chatuser.id.should.equal('admin_yolo')
    user.chatuser.team_id.should.equal('yolo')

    // Start the food convo with the admin
    var msg = yield user.text('food')
    logging.data('heres a msg', msg)
    // _.get(msg, '[0].attachments[0].text', '').should.equal("")
    // _.get(msg, '[0].attachments[0].image_url', 'default').should.equal("http://kipthis.com/kip_modes/mode_cafe.png")
    // _.get(msg, '[1].attachments[0].text', '').should.equal("Great! Which address is this for?")
    // _.get(msg, '[1].attachments[0].actions.length', 0).should.equal(2)
    // _.get(msg, '[1].attachments[0].actions[0].text', '').should.equal('21 Essex St 10002')
    // _.get(msg, '[1].attachments[0].actions[1].text', '').should.equal('New +')

    // choose a saved address
    // msg = yield user.tap(msg[1], 0, 0)

    // goes to s2
    })
})
//   })

//   it('should allow an admin to start an order with a new address', function * () {
//     this.timeout(10000)
//     var user = yield mock.Admin()
//     user.chatuser.id.should.equal('admin_yolo')
//     user.chatuser.team_id.should.equal('yolo')

//     // Start the food convo with the admin
//     var msg = yield user.text('food', { expect: 2 })

//     // choose to input a new address
//     msg = yield user.tap(msg[1], 0, 1)
//     msg.text.should.equal("What\'s the address for the order?")
//     _.get(msg, 'attachments[0].text', '').should.equal("✎ Type your address below (Example: _902 Broadway 10010_)")

//     // type the address
//     var msg = yield user.text('902 Broadway, New York, NY 10010', {expect: 2})
//     msg[0].text.should.equal("Thanks! We need to process that address real quick.")
//     _.get(msg, '[1]attachments[0].text', '').should.equal('')
//     _.get(msg, '[1]attachments[0].actions.length', 0).should.equal(3)
//     _.get(msg, '[1]attachments[0].actions[0].text', '').should.equal('✓ Confirm Address')
//     _.get(msg, '[1]attachments[0].actions[1].text', '').should.equal('Edit Address')
//     _.get(msg, '[1]attachments[0].actions[2].text', '').should.equal('⇲ Send feedback')

//     // tap on confirm
//     msg = yield user.tap(msg[1], 0, 0)

//     // goes to S2
//   })
// })
