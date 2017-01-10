require('../../src/db')
var co = require('co')
var _ = require('lodash')
var request = require('request-promise')
var mongodb = require('mongodb')

/**
 * creates a mock user
 */
var User = function (opts) {
  if (!opts.id) {
    throw new Error('Must supply a user id so we know what team this is for')
  }
  if (!(this instanceof User)) {
    return new User(opts)
  }
  this.id = opts.id
  var user = this
  return co(function * () {
    var db = yield mongodb.MongoClient.connect('mongodb://localhost/foundry')
    user.db = db
    user.chatuser = yield db.collection('chatusers').findOne({id: user.id})
    user.slackbot = yield db.collection('slackbots').findOne({team_id: user.chatuser.team_id})
    return user
  })
}

/**
 * mocks a text sent to kip from slack
   options: {
     expect: Number, // number of messages to expect as a reply (default 1)
   }
 */
User.prototype.text = function * (text, options) {
  var user = this.chatuser
  var slackbot = this.slackbot
  options = options || {
    expect: 1
  }
  return co(function * () {
    var message = {
      type: 'message',
      channel: 'asdfadsf',
      user: user.id,
      text: text,
      ts: '' + (+new Date()) + '.00000',
      team: user.team_id
    }
    return request({
      method: 'POST',
      uri: 'http://localhost:8080/text/' + slackbot.bot.bot_access_token,
      body: {
        message: message,
        options: options
      },
      json: true
    })
  })
}

/**
 * mocks the user tapping on a button
 */
User.prototype.tap = function (message, attachment_index, action_index, options) {
  var user = this.chatuser
  var slackbot = this.slackbot
  options = options || {
    expect: 1
  }
  return co(function * () {
    if (!_.get(message, `attachments[${attachment_index}].actions[${action_index}]`)) {
      throw new Error(`No button for attachments[${attachment_index}].actions[${action_index}]`)
    }
    var body = {
      actions: [message.attachments[attachment_index].actions[action_index]],
      callback_id: message.attachments[attachment_index].callback_id,
      team: {
        id: user.team_id,
        domain: user.team_name
      },
      channel: {
        id: 'asdfadsf',
        name: 'test channel name'
      },
      user: {
        id: user.id,
        name: user.id + ' name'
      },
      action_ts: '' + (+new Date()) + '.000000',
      message_ts: message.ts,
      attachment_id: attachment_index.toString(),
      token: 'blorp',
      original_message: JSON.stringify(message),
      response_url: 'http://localhost:8080/action_response/' + user.team_id + '/' + 'TODO' // TODO make delayed action responses work
    }
    // register a listener with mock_slack.js
    return request({
      method: 'POST',
      uri: 'http://localhost:8080/tap/' + slackbot.bot.bot_access_token,
      body: {
        payload: body,
        options: options
      },
      json: true
    })
  })
}

/**
 * programatically takes a user to a specific step
 * usually this just means we add the correct messages to the
 * database and return the most recent one. sometime you have
 * to add data to the slackbot settings or chatuser settings
 * or carts
 */
User.prototype.goto = function (step) {
  var user = this
  var res
  var printData

  if (process.env.PRINT_DATA) {
    printData = true
  } else {
    logging.warn('not printing responses in goto, set PRINT_DATA env to do so'.toUpperCase())
  }

  var steps = {
    // no clue how s4 should be
    S4: function * () {
      var msg = require('./confirm_user_poll')
      var message = {
        incoming: false,
        thread_id: user.dm,
        user_id: user.id,
        origin: 'slack',
        source: _.merge({}, msg, {
          type: 'message',
          user: 'kip_yolo',
          team: 'yolo',
          ts: (+new Date()).toString()
        }),
        mode: 'food',
        action: 'user.preferences'
      }
      yield user.db.collection('messages').insert(message)
      res = yield user.text('food.user.preferences')
      if (printData) {
        logging.data('res-s3', res)
      }
      return res
    },

    S5: function * () {
      var res = yield steps.S4()
      res = yield user.tap(res, 0, 0)
      if (printData) {
        logging.data('res-s4', res)
      }
      return res
    },

    S6: function * () {
      // setup multiple votes in before, so not sure what this will entail
      res = yield steps.S5()
      logging.data('using food choice: '.blue, res.attachments[0].actions[0].value)
      res = yield user.tap(res, 0, 0)
      if (printData) {
        logging.data('res-s5', res)
      }
      return res
    },

    S7: function * () {
      res = yield steps.S6()

      if (printData) {
        logging.data('res-s6', res)
      }
      res = yield user.tap(res, 0, 0)
      return res
    },

    S9: function * () {
      // add the selected restaurant to the team cart
      yield user.db.collection('carts').insert({
        team: user.slackbot.team_id,
        restaurant: {}
      })

      // replicate the message that would be sent to the user after the admin confirms order.
      // this way i don't have to simulate the admin's entire convo
      var message = {
        incoming: false,
        thread_id: 'D1KARK0F6',
        user_id: 'kip_yolo',
        origin: 'slack',
        source: _.merge({}, require('./menu_summary'), {
          type: 'message',
          user: 'kip_yolo',
          team: 'yolo',
          ts: (+new Date()).toString()
        }),
        mode: 'food',
        action: 'menu.summary'
      }
      yield user.db.collection('messages').insert(message)
      return message
    },

    S10: function * () {
      var menu = yield steps.S9()
      // choose some item
      return user.text('burrito')
    },

    S11: function * () {
      var options = yield steps.S10()

      // just add it to cart via tapping whichever button says "Add to Cart"
      var ind = {}
      options.attachments.map((a, ai) => {
        a.actions.map((x, xi) => {
          if (x.text.indexOf('Add to Cart') === 0) {
            ind.attachment = ai
            ind.action = xi
          }
        })
      })
      return user.tap(options, ind.attachment, ind.action)
    },
    S12: function * () {
      var foodSessions = yield db.Delivery.find({team_id: user.chatuser.team_id, active: true}).exec()
      if (foodSessions) {
        yield foodSessions.map((session) => {
          session.active = false
          session.save()
        })
      }
      var foodSession = require('../../../src/chat/components/slack/test_team_1_delivery.js')
      var newSession = new db.Delivery({
        active: foodSession.active,
        team_id: foodSession.team_id,
        chosen_location: foodSession.chosen_location,
        votes: foodSession.votes,
        time_started: foodSession.time_started,
        convo_initiater: foodSession.convo_initiater,
        confirmed_orders: _.map(foodSession.team_members, 'id'),
        cart: foodSession.cart,
        cuisines: foodSession.cuisines,
        merchants: foodSession.merchants,
        team_members: foodSession.team_members,
        chosen_restaurant: foodSession.chosen_restaurant,
        menu: foodSession.menu,
        data: {}
      })

      newSession.save()
      var res = yield user.text('food.admin.order.confirm')
      return res
    }
  }

  return steps[step]()
}

/**
 * gets a fresh conversation for a user that we know about in the database
 */
function * ExistingUser () {
  var user = new User({
    id: 'bamf_yolo'
  })
  return user
}

function * Admin () {
  var user = new User({
    id: 'admin_yolo'
  })
  return user
}

/**
 * sets up for testing:
 *  - refreshes db
 *  - runs the slack listener
 *  - runs the delivery.com mode handler
 */
function * setup () {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('must run as NODE_ENV=test')
  }

  yield require('../../src/chat/components/slack/test_team_1').reset()
  yield require('../../src/chat/components/slack/slack').startMockSlack()
  yield require('../../src/chat/components/reply_logic.js')

  console.log('Done with setup'.green)
  console.log()
}

module.exports = {
  ExistingUser: ExistingUser,
  Admin: Admin,
  setup: setup
}
