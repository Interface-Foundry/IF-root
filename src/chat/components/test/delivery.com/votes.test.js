require('co-mocha')
var db = require('db')
var _ = require('lodash')
var path = require('path')
var fs = require('fs')
var expect = require('chai').expect
var uuid = require('uuid')

// utils will contain the functions
var helper = require('../testHelper.js')
var utils = require('../../delivery.com/utils.js')
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
  var voteID = uuid.v4()
  var resSticker = 'https://storage.googleapis.com/kip-random/laCroix.gif'

  before(function * () {
    this.timeout(5000)
    yield mock.setup()
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
      expect(res.attachments[0].actions[4].text.toLowerCase()).to.equal('nothing')
    // res = yield admin.tap(res, 0, 0)
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
      expect(helper.checkButtonAttachment(res.attachments[0], ['choose'])).to.be.true
      // check last attachment thing
      expect(helper.checkButtonAttachment(res.attachments[3], ['More', 'Sort Price', 'Sort Rating', 'Sort Distance'])).to.be.true
    })
  })
  // from peters stuff
  describe('S7) confirm restaurant choice', function () {
    describe('participation prompt', function () {
      it('should display "collecting food now message" to the admin', function * () {
        this.timeout(10000)
        admin = yield mock.Admin()
        res = yield admin.goto('S6')
        logging.data('using restaurant choice: '.blue, res.attachments[0].text)
        res = yield admin.tap(res, 0, 0)
        logging.data('res-s7', res)
        res = yield admin.tap(res, 0, 0)
        logging.data('res-s8', res)
      })
    })
  })
})
