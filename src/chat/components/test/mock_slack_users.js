var co = require('co')
var request = require('request-promise')
var mongodb = require('mongodb')

/**
 * creates a mock user
 */
var User = function(opts) {
  if (!opts.id) {
    throw new Error('Must supply a user id so we know what team this is for')
  }
  if (!(this instanceof User)) {
    return new User(opts)
  }
  this.id = opts.id;
  var user = this
  return co(function * () {
    var db = yield mongodb.MongoClient.connect('mongodb://localhost/foundry')
    user.chatuser = yield db.collection('chatusers').findOne({id: user.id})
    user.slackbot = yield db.collection('slackbots').findOne({team_id: user.chatuser.team_id})
  return user
  })
}

/**
 * mocks a text sent to kip from slack
 */
User.prototype.text = function * (text) {
  var user = this.chatuser
  var slackbot = this.slackbot
  return co(function * () {
    var message = {
      type: 'message',
      channel: 'asdfadsf',
      user: user.id,
      text: text,
      ts: "" + (+new Date()) + ".00000",
      team: user.team_id
    }
    return request({
      method: 'POST',
      uri: 'http://localhost:8080/text/' + slackbot.bot.bot_access_token,
      body: message,
      json: true
    })
  })
}

/**
 * mocks the user tapping on a button
 */
User.prototype.tap = function(message, attachment_index, action_index) {
  var user = this.chatuser
  var slackbot = this.slackbot
  return co(function * () {
    var body = {
      actions: [message.attachments[attachment_index].actions[action_index]],
      callback_id: message.attachments[attachment_index].callback_id,
      team: {
        id: user.team_id,
        domain: user.team_name 
      },
      channel: {
        id: 'test_channel',
        name: 'test channel name'
      },
      user: {
        id: user.id,
        name: user.id + ' name'
      },
      action_ts: "" + (+new Date()) + ".000000",
      message_ts: message.ts,
      attachment_id: attachment_index.toString(),
      token: 'blorp',
      original_message: JSON.stringify(message),
      response_url: 'http://localhost:8080/action_response/' + user.team_id + '/' + 'TODO' // TODO make delayed action responses work
    }
    var res = yield request({
      method: 'POST',
      uri: 'http://localhost:8080/incomingAction',
      body: body,
      json: true
    })
  })
}

/**
 * gets a fresh conversation for a user that we know about in the database 
 */
function * ExistingUser() {
  var user = new User({
    id: 'bamf_yolo'
  })
  
  return user;

}

function * Admin() {
  var user = new User({
    id: 'admin_yolo',
  })
  
  return user;
}

/**
 * sets up for testing:
 *  - refreshes db
 *  - runs the slack listener
 *  - runs the delivery.com mode handler
 */
function * setup () {
  process.env.NODE_ENV = 'test'
  yield require('../slack/test_team_1').reset()
  yield require('../slack/slack').start()
  require('../delivery.com/delivery.com')

  console.log('Done with setup'.green)
  console.log()
}

module.exports = {
  ExistingUser: ExistingUser,
  Admin: Admin,
  setup: setup
}
