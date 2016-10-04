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
  // S1
  describe.skip('S1) get Address for Delivery Search', function () {
    it('should get address', function * () {
      var user = yield mock.ExistingUser()
      user.chatuser.id.should.equal('bamf_yolo')
      user.chatuser.team_id.should.equal('yolo')

      var res = yield user.text('food')
      res.text.should.equal("yeah let's eat! what address should i use?")

      res = yield user.text('21 Essex St 10002')
      res.text.should.equal('Select your order method.')
      console.log('r1', res)
      res = yield user.tap(res, 0, 0)
      res.text.should.equal('delivery context updated.')
      console.log('r2', res)
    })

    it.skip('display kip eats mode sticker', function * () {
      var resSticker = res.newMessage[0] // assuming message is [sticker, message]
    })
    it.skip('asks for address or gets new address', function * () {
      resMessage = res.newMessage[1]
      expect(_.get(resMessage, 'text')).to.eql('Great! Which address is this for?')
      expect(helper.checkButtonAttachment(resMessage.attachments[0], ['Address 1', 'Address 2', 'New +'])).to.be.true
    })
    it.skip('if no address auto do new address', function * () {
      // uhhh not sure how this will functionally work
      yield mock.fakeNewAddress(helper.newAdminAddress(admin), testAddress)
    })
  })
  // S2
  describe.skip('S2) get Delivery or Pickup selection', function () {
    describe('click first button', function () {
      it('should display cool you selected an address', function * () {
        var resAddress = yield mock.tap(res, 0, 1)
        var res = yield helper.confirmAddress(resAddress, admin)
        var resMessage = res.newMessage[0]
        expect(_.get(resMessage, 'text')).to.eql('Great you selected `' + testAddress + '`.\nDelivery or Pickup?')
        expect(helper.checkButtonAttachment(resMessage.attachments[0], ['Delivery', 'Pickup', '< Change Address']))
      })
    })
  })
  // S3
  describe.skip('S3) Confirm polling the team', function () {
    it('should confirm order', function * () {
      var res = yield helper.confirmOrder(admin)
      var resMessage = res.newMessage[0]
      expect(_.get(resMessage, 'text')).to.eql('Confirm Restaurant')
      expect(_.get(resMessage, 'attachments[0].text')).to.eql('Ill collect orders for `restaurant name` ')
      expect(checkButtonAttachment(resMessage.attachments[0], ['Confirm', 'Change Restaurant'])).to.be.true
      yield mock.tap(res, 0, 0)
    })
    it('should queue up to send message to all team members at address', function * () {})
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
      describe.skip('check if user in db and has diet', function () {
        it('should check if user has been asked diet Preferences', function * () {
          admin = yield mock.Admin()
          user = yield mock.ExistingUser()
          expect(_.get(user, 'chatuser.takenPreferences')).to.be.false
          expect(_.get(admin, 'chatuser.takenPreferences')).to.be.false
        })
        describe.skip('if user hasnt been asked preferences', function () {
          it('ask new user for dietary concerns', function * () {
            var res = yield helper.askUserForPreferences(newUser)
            var newUser = yield mock.NewUser({id})
            var resMessage = res.newMessages
            // diet prefs
            expect(_.get(resMessage, 'text')).to.exist
            expect(_.get(resMessage, 'attachments[0].text')).to.eql('Type or tap any dietary concerns you may have')
            expect(checkButtonAttachment(resMessage.attachments[0], ['Vegetarian', 'Vegan', 'Pescetarian', 'Paleo', 'None'])).to.be.true
            expect(_.includes(_.map(resMessage.attachments[0].actions, 'style'))).to.be.true // checking for red button
            res = yield mock.tap(res, 0, 1)
            // allergies
            resMessage = res.newMessages
            expect(_.get(resMessage, 'text')).to.exist
            expect(_.get(resMessage, 'attachments[0].text')).to.eql('Type or tap any allergy concerns you may have')
            expect(checkButtonAttachment(resMessage.attachments[0], ['Peanut', 'Gluten', 'Shellfish', 'Chicken', 'None'])).to.be.true
            expect(_.includes(_.map(resMessage.attachments[0].actions, 'style'))).to.be.true // checking for red button
            expect(newUser).to.have.property('takenPreferences')
            res = yield mock.tap(res)
            // confirm
            resMessage = res.newMessages
            expect(_.get(resMessage, 'text')).to.exist
            expect(_.get(resMessage, 'attachments[0].text')).to.eql('Ok I have your dietary concerns')
            expect(checkButtonAttachment(resMessage.attachments[0], ['Confirm', 'Edit Diet'])).to.be.true
            expect(_.includes(_.map(resMessage.attachments[0].actions, 'style'))).to.be.true // checking for green button
          })
        })

        describe('if user has been asked preferences/continue', function () {
          it('should continue', function * () {
            // var res = yield admin.tap('continue') // should be admin confirming
          })
        })
      })
    })
  })
  // S5
  describe('S5) Once we ask user about their preferences', function () {
    it('should display buttons for cuisines available', function * () {
      admin = yield mock.Admin()
      res = yield admin.goto('S5')
      res = yield admin.tap(res, 0, 0)
    // var resMessage = msg
    // expect(_.get(resMessage, 'text')).to.exist
    // expect(_.includes(resMessage.text, 'collecting lunch suggestions vote now!')).to.be.true
    // expect(resMessage.attachments[0].actions).to.have.lengthOf(5)
    // expect(resMessage.attachments[0].actions[4].text).to.equal('Nothing')
    })
  })
  // S6
  describe.skip('S6) Kip shows admin best choices for food based on what team wants', function () {
    var prevMode = 'food'
    var prevAction = 'user.poll'
    var voteID = 'XYZXYZ'
    var votedTest = ['Asian', 'Sandwiches']
    // initialize vars
    // setup
    before(function * () {
      this.timeout(5000)
      var user1 = mock.Admin()
      var user2 = mock.ExistingUser()
      var vote1 = new db.Message({
        incoming: true,
        thread_id: user1.dm,
        resolved: true,
        user_id: user1.id,
        origin: 'slack',
        data: {vote: votedTest[0], voteID: voteID},
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
        data: {vote: votedTest[1], voteID: voteID},
        mode: prevMode,
        action: prevAction
      })
      vote2.save()
    })

    it('should check to see if mode and action are correct', function () {
      expect(process.env._PREV_MODE).to.equal(prevMode)
      expect(process.env._PREV_ACTION).to.equal(prevAction)
    })

    describe('make sure vote1 was saved', function () {
      it('should have voteId with user1', function * () {
        var user1 = mock.Admin()
        var message = yield db.message.find({
          user_id: user1.id,
          incoming: true,
          'data.voteID': voteID
        })
        expect(message[0].data.vote).to.equal('Asian')
      })
    })

    it('make sure util works for getting votes into array format', function * () {
      var v = yield db.messages.find({mode: 'food', action: 'user.poll', 'data.voteID': 'XYZXYZ'})
      var votes = utils.getVotesFromMembers(v)
      expect(votes).to.have.length(2)
      expect(_.isEqual(_.sortBy(votes.sort()), _.sortBy(votedTest.sort()))).to.be.true
    })

    it('make sure util works for getting results only with specific cuisine types', function * () {
      var extrasPath = path.resolve(__dirname, '../../delivery.com/extra/')
      var merchants = JSON.parse(fs.readFileSync(path.join(extrasPath, 'results.json'), 'utf8'))
      var merchantsFittingOpts = utils.createSearchRanking(merchants, votedTest)
      expect(merchantsFittingOpts.length).to.equal(52)
    })

    it('should display slice of 3 choices to admin', function * () {
      admin = yield mock.Admin()
      res = yield admin.text('continue')
      expect(res).to.exist
      // not sure how to get res in format that isnt in `text`
      res = JSON.parse(res.text)
      expect(_.get(res, 'text')).to.eql('Here are 3 restaurant suggestions based on your team vote')
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
