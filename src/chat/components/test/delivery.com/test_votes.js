/* global describe before it  */
require('co-mocha')

var mock = require('../mock_slack_users.js')

// MMM will contain the functions
// running tally of functions to build out
var MMM = require('../../delivery.com/delivery.com/MMM.js')

var _ = require('lodash')
var expect = require('chai').expect

function checkButtonAttachment (attachment, correct) {
  if (!Array.isArray(correct)) { // just check if array
    return false
  }
  return _.isEqual(_.map(attachment.actions, 'text'), correct)
}

// describe('getting votes and selecting merchant', function () {
//   before(function * () {
//     this.timeout(5000)
//     yield mock.setup()
//   })
//   // random vars
//   var testAddress = '21 Essex St 10002'
//   var admin
//   var id
//   var res
//   var resSticker

//   describe('S1) get Address for Delivery Search', function () {
//     before('setup admin', function * () {
//       // not sure but feel like there will need to be a way to assure user has ability to initiate ordering
//       var admin = yield mock.User() // some user w/ admin credentials
//       res = yield MMM.initiateFoodOrdering(admin)
//     })

//     it('display kip eats mode sticker', function * () {
//       var resSticker = res.newMessage[0] // assuming message is [sticker, message]
//     })
//     it('asks for address or gets new address', function * () {
//       resMessage = res.newMessage[1]
//       expect(_.get(resMessage, 'text')).to.eql('Great! Which address is this for?')
//       expect(checkButtonAttachment(resMessage.attachments[0], ['Address 1', 'Address 2', 'New +'])).to.be.true
//     })
//     it('if no address auto do new address', function * () {
//       // uhhh not sure how this will functionally work
//       yield mock.fakeNewAddress(MMM.newAdminAddress(admin), testAddress)
//     })

//     describe('S2) get Delivery or Pickup selection', function () {
//       describe('click first button', function () {
//         it('should display cool you selected an address', function * () {
//           var resAddress = yield mock.tap(res, 0, 1)
//           var res = yield MMM.confirmAddress(resAddress, admin)
//           var resMessage = res.newMessage[0]
//           expect(_.get(resMessage, 'text')).to.eql('Great you selected `' + testAddress + '`.\nDelivery or Pickup?')
//           expect(checkButtonAttachment(resMessage.attachments[0], ['Delivery', 'Pickup', '< Change Address']))
//         })
//       })
//     })
//     describe('S3) Confirm polling the team', function () {
//       it('should confirm order', function * () {
//         var res = yield MMM.confirmOrder(admin)
//         var resMessage = res.newMessage[0]
//         expect(_.get(resMessage, 'text')).to.eql('Confirm Restaurant')
//         expect(_.get(resMessage, 'attachments[0].text')).to.eql('Ill collect orders for `restaurant name` ')
//         expect(checkButtonAttachment(resMessage.attachments[0], ['Confirm', 'Change Restaurant'])).to.be.true
//         yield mock.tap(res, 0, 0)
//       })
//       it('should queue up to send message to all team members at address', function * () {})
//     })
//   })
// })

// split from part above which is all admin oriented imo
describe('S4) If we DON’T already have diet of Team Member', function () {
  // setup
  before(function * () {
    var id
    var user
    this.timeout(5000)
    yield mock.setup()
  })
  describe('check if user in db and has diet', function () {
    it('should check if has asked user Preferences', function * () {
      user = yield mock.ExistingUser()
      expect(user).to.have.property('takenPreferences')
    })
    it('ask new user for dietary concerns', function * () {
      var newUser = yield mock.NewUser({id})
      var res = yield MMM.askUserForPreferences(newUser)
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
  describe('S5) If we DO already have diet of Team Member', function () {
    it('should display buttons for cuisines available', function * () {
      var res = yield MMM.getFoodOptionsFromUser(user)
      var resMessage = res.newMessage[0]
      expect(_.get(resMessage, 'text')).to.exist
      expect(_.get(resMessage, 'attachments[0].text')).to.eql('Is collecting lunch suggestions vote now!')
      expect(resMessage).to.have.lengthOf(5)
      yield mock.tap(res, 0, 0) // get first suggestion i guess for food because who cares
    })
  // what if user types own idea?  fuzzy match to cuisine types probably
  })
})

// back to admin stuff
describe('S6) Kip shows admin best choices for food based on what team wants', function () {
  // probably will need vars for these
  var votes
  var admin
  it('should display slice of 3 choices to admin', function * () {
    var res = yield MMM.getRestaurantChoice(admin, votes)
    var resMessage = res.newMessage[0]
    expect(_.get(resMessage, 'text')).to.eql('Here are 3 options based on team choice')
    expect(resMessage.attachments).to.have.lengthOf(4)
    // check first attachment
    expect(_.get(resMessage, 'attachments[0].text')).to.eql('url link or something here to picstitch thing')
    expect(checkButtonAttachment(resMessage.attachments[0], ['Confirm'])).to.be.true
    // check last attachment thing
    expect(checkButtonAttachment(resMessage.attachments[3], ['More', 'Sort Price', 'Sort Rating', 'Sort Distance'])).to.be.true
  })
})

// from peters stuff
describe('S7) confirm restaurant choice', function () {
  describe('participation prompt', function () {
    it('should display "collecting food now message" to the admin', function * () {
      var admin = yield mock.ExistingUser()
      var res = yield MMM.chooseRestaurantSomehow(admin, 'Dos Toros Taqueria')
      should.not.exist(res.replacementMessage)
      _.get(res, 'newMessages[0].text', 0).should.equal('Confirm Restaurant')
      _.get(res, 'newMessages[0].attachments[0].text', 0).should.equal("I'll collect orders for Dos Toros Taqueria")
      _.get(res, 'newMessages[0].attachments[0].actions[0].text', 0).should.equal('Confirm')
      _.get(res, 'newMessages[0].attachments[0].actions[1].text', 0).should.equal('Change Restaurant')
    })
  })
})
