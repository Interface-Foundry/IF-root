var _ = require('lodash')
var message_tools = require('../message_tools')
module.exports = {}
var handlers = module.exports.handlers = {}

/**
 * Main handler which decides what part of the onbaording process the user is at 
 * 
 * @param {any} message
 */
function * handle(message) {
  var last_action = _.get(message, 'history[0].action')
  if (!last_action) {
    return yield handlers['start'](message)
  } else if (last_action === 'get-admins.ask') {
    return yield handlers['get-admins.response'](message)
  }
}

module.exports.handle = handle;

/**
 * Starts the onboarding conversation
 * 
 * @param message a fake message that has the source information about the origin of the conversation (slack, facebook, etc)
 */
handlers['start'] = function * (message) {
  var welcome = 'Well done! *Kip* has been enabled for your team 😊'
  var welcome_message = message_tools.text_reply(message, welcome)
  var next_message = yield handlers['get-admins.ask'](message);
  return [welcome_message, next_message]
}

/**
 * Handles asking the user who manages office purchases.
 * This is only for slack right now.
 * 
 * @param message the latest message from the user
 */
handlers['get-admins.ask'] = function * (message) {
  var reply = 'Who manages the office purchases? Type something like `me` or `me and @jane`'
  
  // if not slack, move on to the next part of the onboarding convo
  if (message.origin !== 'slack') {
    kip.err('not slack showing up in slack-only onboarding')
    return handlers['finished'](message);
  }
  var msg = message_tools.text_reply(message, reply)
  msg.mode = 'onboarding'
  msg.action = 'get-admins.ask'
  return msg;
}

/**
 * Handles the user response after the user says who hanldes purchases
 * 
 * @param message the latest message from the user
 */
handlers['get-admins.response'] = function * (message) {
  var reply_success = 'Great! I\'ll keep $ADMINS up-to-date on what your team members are adding to the office shopping cart 😊'
  var reply_failure = "I'm sorry, I couldn't quite understand that, can you clarify for me who manages office purchases? If you want to skip this part, just type 'skip' and we can move on."
  var special_admin_message = message_tools.text_reply(message, 'special instructions for admins') // TODO
  var admins = []
  var user_is_admin = false
  var team = yield db.Slackbots.findOne({
    'source.team_id': message.source.team_id
  }).exec()

  // check for mentioned users
  // for a typed message like "that would be @dan"
  // the response.text would be like  "that would be <@U0R6H9BKN>"
  var office_gremlins = message.original_text.match(/(\<\@[^\s]+\>|\bme\b)/ig) || [];
  
  // replace "me" with the user's id, and <@U12345> with just U12345
  office_gremlins = office_gremlins.map(g => {
    if (g === 'me') {
      return message.user_id
    } else {
      return g.replace(/(\<\@|\>)/g, '')
    }
  })


  // also look for users mentioned by name without the @ symbol
  var users = yield db.Chatusers.find({
    team_id: team.team_id,
    is_bot: {$ne: true},
    deleted: {$ne: true}
  }).select('id name')

  users.map((u) => {
    var re = new RegExp('\\b' + u.name + '\\b', 'i')
    if (message.original_text.match(re)) {
      office_gremlins.push(u.id);
    }
  })

  office_gremlins = _.uniq(office_gremlins)

  // add the admin strings into the reply message
  reply_success = reply_success.replace('$ADMINS', office_gremlins.map(g => {
    return '<@' + g + '>'
  }).join(', ').replace(/,([^,]*)$/, ' and $1'))

  // TODO send special message to admins

/*
              var attachments = [
                  {
                    // "pretext": "Ok thanks! Done with cart members 😊",
                    "image_url":"http://kipthis.com/kip_modes/mode_welcome.png",
                    "text":"",
                    "color":"#45a5f4",
                    "fallback":"Welcome"
                  },
                  {
                      "text": "Hi I'm *Kip*, your shopping helper bot! <@$user> made you an admin, so I'll keep you updated on what other members are adding to your Team Shopping Cart 😊".replace('$user', user_id),
                      "mrkdwn_in": [
                          "text",
                          "pretext"
                      ],
                      "color":"#45a5f4",
                      "image_url":"http://kipthis.com/kip_modes/mode_howtousekip.png",
                      "fallback":"Welcome"
                  },
                  {
                      "text": "• Type `settings` to add other admins, edit standing orders and reminders",
                      "mrkdwn_in": [
                          "text",
                          "pretext"
                      ],
                      "color":"#49d63a",
                      "fallback":"Welcome"
                  },
                  {
                      "text": "• Type `cart` to view Team Cart",
                      "mrkdwn_in": [
                          "text",
                          "pretext"
                      ],
                      "color":"#49d63a",
                      "fallback":"Welcome"
                  },
                  {
                      "text": "• Type `members` to add Slack channels and emails for Team Cart. Kip will ping team members via email to collect orders if they are not on Slack",
                      "mrkdwn_in": [
                          "text",
                          "pretext"
                      ],
                      "color":"#49d63a",
                      "fallback":"Welcome"
                  },
                  {
                      "text": "• If you want to make sure everyone gets the memo, feel free to post this message in a channel where everyone will see it:",
                      "mrkdwn_in": [
                          "text"
                      ],
                      "color":"#49d63a",
                      "fallback":"Welcome"
                  },
                  {
                    "mrkdwn_in": [
                        "fields"
                    ],
                    "fields": [
                        {
                            "value": "_Hey <@channel>, I just enabled <@"+convo.slackbot.bot.bot_user_id+"> for our team, so you can search for things we need and save to Team Cart_ \n\n\n _Tell *Kip* what you\'re looking for, like `headphones`, and you\'ll see three options: :one: :two: or :three:_\n\n _See more results with `more`. Type `save 1` to add item :one: to Team Cart_ \n\n _Type `help` to <@"+convo.slackbot.bot.bot_user_id+"> for more info_",
                            "short": false
                        }
                    ],
                    "fallback":"Welcome"
                  }
              ];
              */

  // if (message.origin !== 'slack') {
  //   kip.err(`cannot parse admins for any platform besides slack, got message.source: ${message.origin}, message._id: ${message._id.toString()}`)
  //   admins = [message.user_id]
  //   var reply_message = message_tools.text_reply(message, reply_success)
  // } else {


  //   // check for something like "nobody"
  //   else if (message.text.toLowerCase().match(/^(no one|nobody|noone)/)) {
  //     team.meta.office_assistants = [message.user];
  //     user_is_admin = true;
  //     specialAdminMessage();
  //   }

  //   //add slack members only, no "me"
  //   else if (message.text.indexOf('<@') > -1) {
  //     fireGremlins();
  //   }
  //   //send error
  //   else {
  //     var ask = yield handlers['get-admins.ask'](message)
  //     return [message_tools.default_reply(message), ask]
  //   }
  // }

  var reply_message = message_tools.text_reply(message, reply_success)
  var next_message = yield handlers['finished'](message)
  return [reply_message, next_message]
}



/**
 * Finishes the onboarding convo with the quick tutorial blurb
 * changes the mode to shopping
 *  
 * @param message the latest message from the user
 */
handlers['finished'] = function * (message) {
  var finished = "Thanks for the info! Why don't you try searching for something? Type something like 'headphones' to search"
  var finished_message = message_tools.text_reply(message, finished)
  finished_message.mode = 'shopping'
  return finished_message
}