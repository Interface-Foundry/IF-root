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
// dsx stuff so tests work
var dsxsvc = require('../../delivery.com/dsx_services.js')
var dsxutils = require('../../delivery.com/dsx_utils')
var argv = require('minimist')(process.argv.slice(2))

var yaml = require('js-yaml')
var initFilename = argv['config']
if (initFilename === null || initFilename === undefined) {
  console.log('--config parameter not found. Please invoke this script using --config=<config_filename>.')
  // process.exit(-1)
  initFilename = path.resolve(__dirname, '../../delivery.com/dsx_init_peter.local.yml')
}

var yamlDoc
try {
  yamlDoc = yaml.safeLoad(fs.readFileSync(initFilename, 'utf8'))
} catch(err) {
  console.log(err)
  process.exit(-1)
}

var loadedParams = dsxutils.ServiceObjectLoader(yamlDoc).loadServiceObjectParams('DSXClient')

var dsxClient = new dsxsvc.DSXClient(loadedParams)
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
    this.timeout(1000)
    yield mock.setup()
  })
  // S4
  describe('S4) If we DON’T already have diet of Team Member', function () {
    // setup
    before(function * () {
      this.timeout(5000)
    })
    describe('presume admin pressed "confirm"', function () {
      it('admin press confirm on mock message', function * () {
        admin = yield mock.Admin()
        res = yield admin.goto('S4')
        expect(res.text).to.equal('Here we would ask user for preferences if they didnt have it')
      // res = yield admin.tap(res, 0, 0)
      })
    })
  })
  // S5
  describe('S5) Once we ask user about their preferences', function () {
    it('should display buttons for cuisines available', function * () {
      admin = yield mock.Admin()
      res = yield admin.goto('S5')
      res = yield admin.tap(res, 0, 0)
      expect(res.attachments[0].actions).to.have.length(5)
      expect(res.attachments[0].actions[4].text.toLowerCase()).to.equal('nothing')
    })
  })
  // S6
  describe('S6) Kip shows admin best choices for food based on what team wants', function () {
    var prevMode = 'food'
    var prevAction = 'admin.restaurant.pick'
    var voteID = 'XYZXYZ'
    var votedTest = ['Asian', 'Sandwiches']
    // initialize vars
    // setup
    before(function * () {
      this.timeout(5000)
      admin = yield mock.Admin()
      // create dsx context for address
      var user2 = mock.ExistingUser()
      // going to simulate admin response in test
      var user1 = mock.Admin()
      var vote1 = new db.Message({
        incoming: true,
        thread_id: user1.dm,
        resolved: true,
        user_id: user1.id,
        origin: 'slack',
        data: {mode: prevMode, action: prevAction, value: votedTest[0], voteID: voteID},
        mode: prevMode,
        action: prevAction
      })
      vote1.save()

      // user2
      var vote2 = new db.Message({
        incoming: true,
        thread_id: user2.dm,
        resolved: true,
        user_id: user2.id,
        origin: 'slack',
        data: {mode: prevMode, action: prevAction, value: votedTest[1], voteID: voteID},
        mode: prevMode,
        action: prevAction
      })
      vote2.save()
    })

    describe.skip('make sure vote1 was saved', function () {
      it('should have voteId with user1', function * () {
        var admin = mock.Admin()
        var message = yield db.message.find({
          user_id: admin.id,
          incoming: true,
          'data.voteID': voteID
        })
        expect(message[0].data.vote).to.equal('Asian')
      })
    })

    it('make sure util works for getting votes into array format', function * () {
      var v = yield db.messages.find({mode: 'food', action: 'admin.restaurant.pick', 'data.voteID': 'XYZXYZ'})
      var votes = utils.getVotesFromMembers(v)
      expect(votes).to.have.length.of.at.least(1)
    // expect(_.isEqual(_.sortBy(votes.sort()), _.sortBy(votedTest.sort()))).to.be.true
    })

    it('should display slice of 3 choices to admin', function * () {
      this.timeout(5000)
      admin = yield mock.Admin()
      res = yield admin.goto('S6')
      logging.info('using food choice: '.blue, res.attachments[0].actions[0].value)
      res = yield admin.tap(res, 0, 0)
      expect(res).to.exist
      // not sure how to get res in format that isnt in `text`
      expect(_.get(res, 'text')).to.eql('Here are 3 restaurant suggestions based on your team vote. \n Which do you want today?')
      expect(res.attachments).to.have.lengthOf(4)
      // check first attachment
      expect(_.get(res, 'attachments[0].text')).to.exist
      expect(helper.checkButtonAttachment(res.attachments[0], ['choose'])).to.be.true
      // check last attachment thing
      expect(helper.checkButtonAttachment(res.attachments[3], ['More', 'Sort Price', 'Sort Rating', 'Sort Distance'])).to.be.true
    })
    // change voteID for testing reasons
    after(function * () {
      yield db.Messages.update(
        {'data.voteID': 'XYZXYZ'},
        {$set: {'data.voteID': 'lmao-old.' + String(Date.now())}},
        {multi: true})
    })
  })
  // from peters stuff
  describe.skip('S7) confirm restaurant choice', function () {
    var prevMode = 'food'
    var prevAction = 'admin.restaurant.pick'

    it('should check to see if mode and action are correct', function () {
      expect(process.env._PREV_MODE).to.equal(prevMode)
      expect(process.env._PREV_ACTION).to.equal(prevAction)
    })

    describe('participation prompt', function () {
      it('should display "collecting food now message" to the admin', function * () {
        admin = yield mock.Admin()

        res = yield admin.text('continue')
        expect(res).to.exist
        res = JSON.parse(res.text)
        console.log(res)
      })
    })
  })
})
