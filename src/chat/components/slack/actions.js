//
// "Actions" are what slack calls buttons
//
var queue = require('../queue-mongo')
require('kip')
// var express = require('express')
var co = require('co')
// var app = express() // <-- da phuu que why t
var bodyParser = require('body-parser')
var cart = require('./cart')
var kipcart = require('../cart')
app.use(bodyParser.urlencoded())


/**
 * handle actions which can be simply translated into text commands, like "2 but cheaper"
 * TODO transform these into "execute" commands instead to avoid doing nlp 
 * 
 * @param {any} action

 */
function simple_action_handler(action) {
  kip.debug('brah what is action: ', action)
  switch (action.name) {
    //
    // Search result buttons
    //
    case 'addcart':
      return 'save ' + action.value
    case 'cheaper':
      if (action.value) {
        return action.value + ' but cheaper'
      } else {
        return 'cheaper'
      }
    case 'moreinfo':
      return action.value
    case'more':
      return 'more'
    
    //
    // Item info buttons
    //

    //
    // Other buttons
    //
    case 'home':
     kip.debug('hit home button : actions.js line 48')
     // {
     //      "id": "11",
     //      "name": "home",
     //      "text": "🐧",
     //      "type": "button",
     //      "value": "home",
     //      "style": "default"
     // }
      return 'exit'
  }
}

//incoming slack action
app.post('/slackaction', function(req, res) {
  kip.debug('incoming action')
    if (req.body && req.body.payload) {
      var parsedIn = JSON.parse(req.body.payload);
      var action = parsedIn.actions[0];
      kip.debug(action.name.cyan, action.value.yellow)
      // for things that i'm just going to parse for
      var simple_command = simple_action_handler(action)
      if (simple_command) {
        kip.debug('passing through button click as a regular text chat', simple_command.cyan)
        var message = new db.Message({
          incoming: true,
          thread_id: parsedIn.channel.id,
          original_text: simple_command,
          text: simple_command,
          user_id: parsedIn.user.id,
          origin: 'slack',
          source: parsedIn,
        });
        message.save().then(() => {
          queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
        })
      } else {
        switch (action.name) {
          case 'home':
            kip.debug('hit home button : actions.js line 87');
            var parsedIn = JSON.parse(req.body.payload);
            var action = parsedIn.actions[0];
            var message = new db.Message({
              incoming: true,
              thread_id: parsedIn.channel.id,
              original_text: 'home',
              text: 'home',
              user_id: parsedIn.user.id,
              origin: 'slack',
              source: parsedIn,
            });
            message.save().then(() => {
              queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
            })
            break;

          case 'additem':
            // adds the item to the cart the right way, but for speed we return a hacked message right away
            var updatedMessage = parsedIn.original_message;
            var priceDifference = 0;
            updatedMessage.attachments.map(a => {
              if (a.callback_id === parsedIn.callback_id) {
                priceDifference = parseFloat(a.text.match(/\$[\d.]+/)[0].substr(1))
                a.text = a.text.replace(/\d+$/, replacement => {
                  return parseInt(replacement) + 1;
                })
              } else if (a.text && a.text.indexOf('Team Cart Summary') >= 0) {
                a.text = a.text.replace(/\$[\d.]+/, function(total) {
                  return '$' + (parseFloat(total.substr(1)) + priceDifference).toFixed(2);
                })
              }
            })

            co(function * () {
              var teamCart = yield kipcart.getCart(parsedIn.team.id)
              var item = yield db.Items.findById(parsedIn.callback_id).exec()
              yield kipcart.addExtraToCart(teamCart, parsedIn.team.id, parsedIn.user.id, item)
            }).catch(console.log.bind(console))
            break;

          case 'removeitem':
            // reduces the quantity right way, but for speed we return a hacked message right away
            var index;
            var priceDifference = 0;
            var updatedMessage = parsedIn.original_message;
            updatedMessage.attachments = updatedMessage.attachments.reduce((all, a, i) => {
              if (a.callback_id === parsedIn.callback_id) {
                priceDifference = parseFloat(a.text.match(/\$[\d.]+/)[0].substr(1))
                var isZero = false;
                index = i;
                a.text = a.text.replace(/\d+$/, replacement => {
                  if (parseInt(replacement) <= 1) {
                    isZero = true;
                  }
                  return parseInt(replacement) - 1;
                })
                if (!isZero) {
                  all.push(a)
                }
              } else if (a.text && a.text.indexOf('Team Cart Summary') >= 0) {
                a.text = a.text.replace(/\$[\d.]+/, function(total) {
                  return '$' + (parseFloat(total.substr(1)) - priceDifference).toFixed(2);
                })
                all.push(a)
              } else {
                all.push(a)
              }
              return all;
            }, [])
            co(function * () {
              yield kipcart.removeFromCart(parsedIn.team.id, parsedIn.user.id, index)
            }).catch(console.log.bind(console))
            break;

          case 'removeall':
            // reduces the quantity right way, but for speed we return a hacked message right away
            var index;
            var priceDifference = 0;
            var updatedMessage = parsedIn.original_message;
            updatedMessage.attachments = updatedMessage.attachments.reduce((all, a, i) => {
              if (a.callback_id === parsedIn.callback_id) {
                var quantity = parseInt(a.text.match(/\d+$/)[0])
                priceDifference = quantity * parseFloat(a.text.match(/\$[\d.]+/)[0].substr(1))
                index = i;
              } else if (a.text && a.text.indexOf('Team Cart Summary') >= 0) {
                a.text = a.text.replace(/\$[\d.]+/, function(total) {
                  return '$' + (parseFloat(total.substr(1)) - priceDifference).toFixed(2);
                })
                all.push(a)
              } else {
                all.push(a)
              }
              return all;
            }, [])
            co(function * () {
              yield kipcart.removeAllOfItem(parsedIn.team.id, index)
            }).catch(console.log.bind(console))
            break;

          case default:
            kip.debug('\n\n\n\n', parsedIn,'\n\n\n\n'); 
            break;
        }
      }

      //sends back original chat
      if (parsedIn.original_message){
        var stringOrig = JSON.stringify(parsedIn.original_message)
        res.send(parsedIn.original_message);
      } else {
        console.error('slack buttons broke, need a response_url')
        res.sendStatus(process.env.NODE_ENV === 'production' ? 200 : 500)
        return;
      }
    } else {
      res.sendStatus(200);
    }
});

// Show the user their settings
function showSettings(response, slack, flag, message, done) {
  kip.debug('showing settings');
  var isAdmin = slackbot.meta.office_assistants.indexOf(message.user_id) >= 0;

  co(function*() {
    var chatuser = yield db.Chatusers.findOne({
      id: message.user_id
    });
    // convo.chatuser = chatuser;
    // kip.debug(chatuser);
    // kip.debug(convo.slackbot)

    var attachments = [];

    //adding settings mode sticker
    attachments.push({
      image_url: 'http://kipthis.com/kip_modes/mode_settings.png',
      text: ''
    })

    //
    //http://i.imgur.com/wxoZYmI.png

    //
    // Last call alerts personal settings
    //
    if (chatuser.settings.last_call_alerts) {
      attachments.push({
        text: 'You are *receiving last-call alerts* for company orders.  \n Say `no last call` to stop this.'
      })
    } else {
      attachments.push({
        text: 'You are *not receiving last-call alerts* before the company order closes. \n Say `yes last call` to receive them.'
      })
    }

    //
    // Admins
    //
    var office_admins = slackbot.meta.office_assistants.map(function(user_id) {
      return '<@' + user_id + '>';
    })
    if (office_admins.length > 1) {
      var last = office_admins.pop();
      office_admins[office_admins.length - 1] += ' and ' + last;
    }

    kip.debug(office_admins);

    //no gremlins found! p2p mode
    if (office_admins.length < 1) {
      var adminText = 'I\'m not managed by anyone right now.\n';
    } else {
      var adminText = 'I\'m managed by ' + office_admins.join(', ') + '.\n';
    }

    if (isAdmin) {
      adminText += ' You can *add and remove admins* with `add @user` and `remove @user`.'
    } else if (slackbot.meta.office_assistants.length < 1) {
      adminText += ' You can *add admins* with `add @user`.'
    } else {
      adminText += ' Only admins can add other admins.'
    }
    attachments.push({
      text: adminText
    })

    //
    // Admin-only settings
    //
    if (isAdmin) {
      if (slackbot.meta.weekly_status_enabled) {
        // TODO convert time to the correct timezone for this user.
        // 1. Date.parse() returns something in eastern, not the job's timezone
        // 2. momenttz.tz('2016-04-01 HH:mm', meta.weekly_status_timezone) is the correct date for the job
        // 3. .tz(chatuser.tz) will convert the above to the user's timezone. whew
        var date = Date.parse(slackbot.meta.weekly_status_day + ' ' + slackbot.meta.weekly_status_time);
        var job_time_no_tz = momenttz.tz(date, 'America/New_York'); // because it's not really eastern, only the server is
        var job_time_bot_tz = momenttz.tz(job_time_no_tz.format('YYYY-MM-DD HH:mm'), slackbot.meta.weekly_status_timezone);
        var job_time_user_tz = job_time_bot_tz.tz(chatuser.tz);
        kip.debug('job time in bot timezone', job_time_bot_tz.format())
        kip.debug('job time in user timzone', job_time_user_tz.format())
        attachments.push({
          text: 'You are receiving weekly cart status updates every \n*' + job_time_user_tz.format('dddd[ at] h:mm a') + ' (' + chatuser.tz.replace(/_/g, ' ') + '*'
            + ')\nYou can turn this off by saying `no weekly status`'
            + '\nYou can change the day and time by saying `change weekly status to Monday 8:00 am`'
        })
      } else {
        attachments.push({
          text: 'You are *not receiving weekly cart* updates.  Say `yes weekly status` to receive them.'
        })
      }
    }

    kip.debug('SETTINGS ATTACHMENTS ', attachments);

    // make all the attachments markdown
    attachments.map(function(a) {
      a.mrkdwn_in = ['text'];
      a.color = '#45a5f4';
    })

     var message = new db.Message({
          incoming: true,
          thread_id: parsedIn.channel.id,
          original_text: simple_command,
          text: simple_command,
          user_id: parsedIn.user.id,
          origin: 'slack',
          source: parsedIn,
        });
    message.save().then(() => {
          queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
    })

    convo.say({
      username: 'Kip',
      text: '',
      attachments: attachments,
      fallback: 'Settings'
    })

    if (flag !== 'noAsk') {
      convo.ask({
        username: 'Kip',
        attachments: [{
          text: 'Don’t have any changes? Type `exit` to quit settings',
          color: '#49d63a',
          mrkdwn_in: ['text'],
          fallback:'Settings',
          actions: [
              {
                "name": "exit",
                "text": "Exit Settings",
                "style": "primary",
                "type": "button",
                "value": "exit"
              },              
              {
                "name": "help",
                "text": "Help",
                "style": "default",
                "type": "button",
                "value": "help"
              },
              {
                "name": "home",
                "text": "🐧",
                "style": "default",
                "type": "button",
                "value": "home"
              }
          ],
          callback_id: 'none'
        }],
        text: '',
        fallback: 'Settings'
      }, handleSettingsChange);



    }
    if (flag == 'noAsk') {

      kip.debug('NO ASK ASK ASK ASK ASK ')
      done();
    }


  }).catch(function(e) {
    kip.debug('error finding the user');
    kip.debug(e)
  })
}


var listener;
function listen(callback) {
  listener = callback;
}

app.listen(8000, function(e) {
  if (e) {
    console.dir(e)
  } else {
    console.log('slack action server listening on port 8000')
  }
})

module.exports = {
  listen: listen
}