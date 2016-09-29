/* global db describe before after it */
require('co-mocha')
require('kip')

var _ = require('lodash')
var fs = require('fs')
var expect = require('chai').expect
var sm = require('slack-message-builder')
var path = require('path')
var uuid = require('uuid')

var mock = require('../mock_slack_users.js')
var utils = require('../../delivery.com/utils.js')

// back to admin stuff
describe('S6) Kip shows admin best choices for food based on what team wants', function () {
  var testAddress = '21 Essex St 10002'
  var admin
  var id
  var res
  var prevMode = 'food'
  var prevAction = 'user.poll'
  var voteID = 'XYZXYZ'
  var votedTest = ['Asian', 'Sandwiches']
  // initialize vars
  // setup
  before(function * () {
    this.timeout(5000)
    yield mock.setup()
    yield utils.setPrevModeActionRoute(prevMode, prevAction)
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
    console.log(JSON.parse(res.text))
  // expect(_.get(resMessage, 'text')).to.eql('Here are 3 options based on team choice')
  // expect(resMessage.attachments).to.have.lengthOf(4)
  // check first attachment
  // expect(_.get(resMessage, 'attachments[0].text')).to.eql('url link or something here to picstitch thing')
  // expect(checkButtonAttachment(resMessage.attachments[0], ['Confirm'])).to.be.true
  // check last attachment thing
  // expect(checkButtonAttachment(resMessage.attachments[3], ['More', 'Sort Price', 'Sort Rating', 'Sort Distance'])).to.be.true
  })
  // change voteID for testing reasons
  after(function * () {
    yield db.Messages.update(
      {'data.voteID': 'XYZXYZ'},
      {$set: {'data.voteID': 'lmao-old.' + String(Date.now())}},
      {multi: true})
  })
})
