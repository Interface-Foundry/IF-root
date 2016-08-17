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
  if (message.source !== 'slack') {
    return handlers['finished'](message);
  }
  return message_tools.text_reply(message, reply)
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

  // fire the gremlins because they suck at their job
  function * fireGremlins(){
    // check for mentioned users
    // for a typed message like "that would be @dan"
    // the response.text would be like  "that would be <@U0R6H9BKN>"
    var office_gremlins = message.text.match(/(\<\@[^\s]+\>|\bme\b)/ig) || [];
    message.text = response.text.replace(/(\<\@[^\s]+\>|\bme\b)/ig, '');

    // also look for users mentioned by name without the @ symbol
    var users = yield db.Chatusers.find({
      team_id: convo.slackbot.team_id,
      is_bot: {$ne: true},
      deleted: {$ne: true}
    }).select('id name')

      users.map((u) => {
        var re = new RegExp('\\b' + u.name + '\\b', 'i')
        if (response.text.match(re)) {
          office_gremlins.push('<@' + u.id + '>');
        }
      })

      if (office_gremlins && office_gremlins.length > 0 && !user_is_admin) {
        team.meta.office_assistants = office_gremlins.map(function(handle) {
          if (handle.toLowerCase() === 'me') {
            user_is_admin = true;
            return response.user;
          } else {
            return handle.replace(/(\<\@|\>)/g, '');
          }
        })

        console.log('0🔸',office_gremlins)
        office_gremlins = office_gremlins.map(function(handle) {
          if (handle.toLowerCase() === 'me') {
            return 'you';
          } else {
            return handle;
          }
        });
        console.log('1🔸',office_gremlins)

        if (office_gremlins.length > 1) {
          var last = office_gremlins.pop();
          office_gremlins[office_gremlins.length-1] += ' and ' + last;
        }

      }

      // check if we didn't get it
      if (!team.meta.office_assistants || team.meta.office_assistants.length === 0) {
        // we didn't get it... ask again.
        convo.say('I didn\'t quite understand that.  Type "skip" to skip')
        askWhoManagesPurchases(response, convo);
        return convo.next();
      }

      db.Slackbots.update({_id: convo.slackbot._id}, {$set: {'meta.office_assistants': team.meta.office_assistants}}, function(e) {
        if (e) { console.error(e) }

        // send the office admins welcome messages and show them all the welcome video
        team.meta.office_assistants.map(function(id) {
          if (id === response.user) { return; }
          console.log('starting admin welcome conversation with ' + id)
          var slackbot = convo.slackbot;

          var bot = controller.spawn({
            token: slackbot.bot.bot_access_token
          })

          bot.startRTM(function(err, bot, payload) {
            if (err) {
              throw new Error('Could not connect to Slack');
            }

            bot.startPrivateConversation({user: id}, function(response, convo) {
              // inject the slackbot into the convo so that we can save it in the db
              if (!convo) {
                return; // i guess this user doesn't exist anymore?
              }
              convo.slackbot = slackbot;
              convo.on('end', function() {

                bot.closeRTM();

                var objData = {
                  mode:'shopping',
                  source: {
                    id: convo.slackbot.team_id + "_" + id,
                  }
                }
                ioKip.updateMode(objData);
              })

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

              var resStatus = {
                username: 'Kip',
                text: "",
                attachments: attachments,
                fallback: 'Welcome'
              };

              convo.say(resStatus);

              convo.next()
              // convo.next()
              //welcomeVid(response, convo);
            });
          });

        })

        // show this user the welcome video
        //welcomeVid(response, convo);
      });
  }

  if (message.source !== 'slack') {
    kip.err(`cannot parse admins for any platform besides slack, got message.source: ${message.source}, message._id: ${message._id.toString()}`)
    admins = [message.user_id]
    user_is_admin = true;
    var reply_message = message_tools.text_reply(message, reply_success)
  } else {
    //
    // parse out all the admins in the text
    //

    // check for "me" or "i do" but no other users on slack
    if (message.text.indexOf('<@') < 0 && message.text.toLowerCase().match(/(\bme\b|\bi do\b)/) || message.text.toLowerCase().trim() === 'skip') {
      team.meta.office_assistants = [message.user_id];
      user_is_admin = true;
      specialAdminMessage();

    //contains me && <@user> but w.out 'and'
    } else if (message.text.indexOf('me ') > -1){

      fireGremlins();

      team.meta.office_assistants = [message.user];
      user_is_admin = true;

      var attachments = [
          {
            "image_url":"http://kipthis.com/kip_modes/mode_welcome.png",
            "color":"#45a5f4",
            "fallback":"Welcome",
            'text':''
          },
          {
            "text": "Great!  I'll keep you and the other admins up-to-date on what your team members are adding to the office shopping cart 😊",
            // "image_url":"http://kipthis.com/kip_modes/mode_shopping.png",
            "color":"#45a5f4",
            "fallback":"Welcome"
          }
      ];

      var resStatus = {
        username: 'Kip',
        text: "",
        attachments: attachments,
        fallback: 'Welcome'
      };


      convo.say(resStatus);
      //convo.next()
      specialAdminMessage();
    }

    // check for something like "nobody"
    else if (message.text.toLowerCase().match(/^(no one|nobody|noone)/)) {
      team.meta.office_assistants = [message.user];
      user_is_admin = true;
      specialAdminMessage();
    }

    //add slack members only, no "me"
    else if (message.text.indexOf('<@') > -1) {
      fireGremlins();
    }
    //send error
    else {
      var ask = yield handlers['get-admins.ask'](message)
      return [message_tools.default_reply(message), ask]
    }
  }

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
  var finished = 'Well done! *Kip* has been set up for your team 😊'
  var finished_message = message_tools.text_reply(message, finished)
  var tutorial = "Why don't you try searching for something? Type something like 'headphones' to search"
  var tutorial_message = message_tools.text_reply(message, tutorial)
  tutorial_message.mode = 'shopping'
  return [finished_message, tutorial_message]
}