var co = require('co')
var request = require('request-promise')

/**
 * creates a mock user
 */
var User = function(opts) {
  if (!opts.team_id || !opts.id) {
    throw new Error('Must supply an team and user so we know what team this is for')
  }
  if (!(this instanceof User)) {
    return new User(opts)
  }
  this.id = opts.id;
  this.team_id = opts.team_id;
  this.access_token = opts.access_token;
}

/**
 * mocks a text sent to kip from slack
 */
User.prototype.text = function * (text) {
  var user = this
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
      uri: 'http://localhost:8080/text/' + user.access_token,
      body: message,
      json: true
    })
  })
}

/**
 * mocks the user tapping on a button
 */
User.prototype.tap = function(message, attachment_index, action_index) {
  var user = this;
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
  return new User({
    id: 'bamf',
    team_id: 'yolo',
    access_token: 'xoxb-53279314532-wNV7uaD3ryRfcrYdYKbvVkaz'
  })
}

function * Admin() {
  return new User({
    id: 'literallyhitler',
    team_id: 'yolo',
    access_token: 'xoxb-53279314532-wNV7uaD3ryRfcrYdYKbvVkaz'
  })
}

module.exports = {
  ExistingUser: ExistingUser,
  Admin: Admin
}
