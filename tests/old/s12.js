require('co-mocha')
var _ = require('lodash')
var should = require('should')
var expect = require('chai').expect

var mock = require('../mock_slack_users')
var helper = require('../testHelper.js')

// -----------------------------

/*
   _____________________
 /   _____/_   \_____  \
 \_____  \ |   |/  ____/
 /        \|   /       \
/_______  /|___\_______ \
        \/             \/
*/
describe('admin confirms team order after all orders are finished or time is up', () => {

  before(function * () {
    this.timeout(5000)
    yield mock.setup()
  })

  describe('kip pings admin with team order', function () {
    it('should send a DM message to admin with the team order ', function * () {
      this.timeout(5000)
      var admin = yield mock.Admin()
      var res = yield admin.goto('S12')
      // logging.data('s12)', res)
    })
  })
})
