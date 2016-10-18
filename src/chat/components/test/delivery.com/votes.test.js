require('co-mocha')

var _ = require('lodash')
var expect = require('chai').expect

var helper = require('../testHelper.js')
var mock = require('../mock_slack_users.js')
// -----------------------------

describe('getting votes and selecting merchant', function () {
  // INITIALIZE THIS ISH
  var testAddress = '21 Essex St 10002'
  var admin
  var user
  var id
  var res
  var msg
  var prevMode
  var prevAction
  var resSticker = 'https://storage.googleapis.com/kip-random/laCroix.gif'

  before(function * () {
    this.timeout(5000)
    yield mock.setup()
  })
  describe('S1-2) initiate food order ', function () {
    it('typing food should initiate food ordering', function * () {
      var user = yield mock.Admin()
      user.chatuser.id.should.equal('admin_yolo')
      user.chatuser.team_id.should.equal('yolo')

      // Start the food convo with the admin
      var msg = yield user.text('food')
      // choose a saved address
      logging.data('selecting address at: ', msg.attachments[1].actions[0].text)
      msg = yield user.tap(msg, 1, 0)
      // S2
      logging.data('selecting delivery', msg)
      _.get(msg, 'attachments[1].text', '').should.equal('Cool! You selected `21 Essex St 10002`. Delivery or Pickup?')
      // _.get(msg, 'attachments[0].actions.length', 0).should.equal(2)
      _.get(msg, 'attachments[1].actions[0].text', '').should.equal('Delivery')
      _.get(msg, 'attachments[1].actions[1].text', '').should.equal('Pickup')

      // tap delivery
      msg = yield user.tap(msg, 1, 0)
      logging.data('convo2', msg)

      // // S2B
      _.get(msg, 'attachments[0].text', '').should.equal('You ordered `Delivery` from `Lantern Thai Kitchen` last time, order again?')
      _.get(msg, 'attachments[0].actions.length', 0).should.equal(1)
      _.get(msg, 'attachments[0].actions[0].text', '').should.equal('Choose Restaurant')
      _.get(msg, 'attachments[1].text', '').should.equal('*Tip:* `✓ Start New Poll` polls your team on what type of food they want.')
      _.get(msg, 'attachments[1].actions[0].text', '').should.equal('✓ Start New Poll')
      _.get(msg, 'attachments[1].actions[1].text', '').should.equal('See More')
      _.get(msg, 'attachments[1].actions[2].text', '').should.equal('× Cancel')
    })
  })

  // S4
  describe.skip('S4) If we DON’T already have diet of Team Member', function () {
    // setup
    before(function * () {
      this.timeout(5000)
    })
    describe('presume admin pressed "confirm"', function () {
      it('admin press confirm on mock message', function * () {
        this.timeout(5000)
        admin = yield mock.Admin()
        res = yield admin.goto('S4')
        expect(res.text).to.equal('Here we would ask user for preferences if they didnt have it')
      // res = yield admin.tap(res, 0, 0)
      })
    })
  })
  // S5
  describe.skip('S5) Once we ask user about their preferences', function () {
    it('should display buttons for cuisines available', function * () {
      this.timeout(10000)
      admin = yield mock.Admin()
      res = yield admin.goto('S5')
      logging.data('using food choice: '.blue, res.attachments[0].actions[0].value)
      expect(res.attachments[0].actions).to.have.length(5)
      expect(res.attachments[0].actions[4].text.toLowerCase()).to.equal('× no lunch for me')
    // res = yield admin.text('Mexican')
    })
  })
  // S6
  describe.skip('S6) Kip shows admin best choices for food based on what team wants', function () {
    var votedTest = ['Asian', 'Sandwiches']
    // setup
    it('should display slice of 3 choices to admin', function * () {
      this.timeout(10000)
      admin = yield mock.Admin()
      res = yield admin.goto('S6')
      expect(_.get(res, 'text')).to.eql('Here are 3 restaurant suggestions based on your team vote. \n Which do you want today?')
      expect(res).to.exist
      // not sure how to get res in format that isnt in `text`
      expect(res.attachments).to.have.lengthOf(4)
      // check first attachment
      expect(_.get(res, 'attachments[0].text')).to.exist
    // check last attachment thing
    // expect(helper.checkButtonAttachment(res.attachments[3], ['More', 'Sort Price', 'Sort Rating', 'Sort Distance'])).to.be.true
    })
  })
  // from peters stuff
  describe.skip('S7) confirm restaurant choice', function () {
    describe('participation prompt', function () {
      it('should display "collecting food now message" to the admin', function * () {
        this.timeout(10000)
        admin = yield mock.Admin()
        res = yield admin.goto('S6')
        logging.data('using restaurant choice: '.blue, res.attachments[0].text)
        res = yield admin.tap(res, 0, 0)
        logging.data('res-s8', res)
        res = yield admin.tap(res, 0, 0)
        logging.data('res-s8-2', res)
      })
    })
  })
})
