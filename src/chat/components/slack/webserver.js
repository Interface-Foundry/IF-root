//
// "Actions" are what slack calls buttons
//
var queue = require('../queue-mongo');
var db = require('db');
require('kip');
var refresh_team = require('../refresh_team');
var express = require('express');
var co = require('co');
var next = require("co-next")
var bodyParser = require('body-parser');
var cart = require('./cart');
var kipcart = require('../cart');
var _ = require('lodash');
var slackModule = require('./slack')
var cardTemplate = require('./card_templates');
var utils = require('./utils');
var cookieParser = require('cookie-parser')
var uuid = require('uuid')
var sleep = require('co-sleep');
// var base = process.env.NODE_ENV !== 'production' ? __dirname + '/static' : __dirname + '/dist'
// var defaultPage = process.env.NODE_ENV !== 'production' ? __dirname + '/simpleSearch.html' : __dirname + '/dist/simpleSearch.html'
var request = require('request')
var requestPromise = require('request-promise');
// var init_team = require("../init_team.js");
var app = express();

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// app.listen(3000, function(e) {
//   if (e) { console.error(e) }
//   console.log('chat app listening on port 8000 🌏 💬')
// })

/**
 * handle actions which can be simply translated into text commands, like "2 but cheaper"
 * TODO transform these into "execute" commands instead to avoid doing nlp
 *
 * @param {any} action

 */
function simple_action_handler (action) {
  // kip.debug('\nwebserver.js line 28 simple_action_handler action: ', action, '\n\n\n')
  switch (action.name) {
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
    case 'more':
      return 'more'
    case 'cafe_btn':
      return 'cafe_btn';
    case 'shopping_btn':
      return 'shopping_btn';
    case 'home_btn':
      return 'home_btn';
    case 'back_btn':
      return 'back_btn';
    case 'help_btn':
      return 'help_btn';
    case 'view_cart_btn':
      return 'view_cart_btn';
    case 'team':
      return 'team';
    case 'channel_btn':
      return 'channel_btn';
    case 'settings':
      return 'settings';
    case 'exit':
      return 'exit';
    case 'delivery_btn':
      return 'delivery'
    case 'pickup_btn':
      return 'pickup'
    case 'address_confirm_btn':
      return 'address_confirm_btn'
    case 'send_last_call_btn':
      return 'send_last_call_btn'

    case 'passthrough':
      return action.value
  }
}

function buttonCommand (action) {
  if (_.includes(action.name, '.')) {
    return {
      mode: _.split(action.name, '.', 1)[0],
      action: _.split(action.name, '.').slice(1).join('.'),
      value: action.value
    }
  }
}

// incoming slack action
app.post('/slackaction', next(function * (req, res) {
  if (req.body && req.body.payload) {
    var message;
    var parsedIn = JSON.parse(req.body.payload);
    var action = parsedIn.actions[0];
    kip.debug('incoming action', action);
    kip.debug(action.name.cyan, action.value.yellow);
    // // check the verification token in production
    // if (process.env.NODE_ENV === 'production' && parsedIn.token !== kip.config.slack.verification_token) {
    //   kip.error('Invalid verification token')
    //   return res.sendStatus(403)
    // }
    var action = parsedIn.actions[0];
    kip.debug(action.name.cyan, action.value.yellow);
    // for things that i'm just going to parse for
    var simple_command = simple_action_handler(action);
    var buttonData = buttonCommand(action);
    kip.debug('\n\n\nsimple_command: ', simple_command,'\n\n\n');
    if (simple_command) {
      kip.debug('passing through button click as a regular text chat', simple_command.cyan);
      var message = new db.Message({
        incoming: true,
        thread_id: parsedIn.channel.id,
        original_text: simple_command,
        text: simple_command,
        user_id: parsedIn.user.id,
        origin: 'slack',
        source: parsedIn
      });
      // inject source.team and source.user because fuck the fuck out of slack message formats
      message.source.team = message.source.team.id;
      message.source.user = message.source.user.id;
      message.source.channel = message.source.channel.id;
      if (simple_command == 'home_btn') {
        var history = yield db.Messages.find({thread_id: message.source.channel}).sort('-ts').limit(10);
        var last_message = history[0];
        var mode = _.get(last_message,'mode');
        var actions = mode == 'shopping' ? cardTemplate.slack_home : mode == 'settings' ? cardTemplate.slack_settings :  mode == 'team' ? cardTemplate.slack_team : cardTemplate.slack_home;
        var team = yield db.Slackbots.findOne({'team_id': message.source.team}).exec();
        var isAdmin = team.meta.office_assistants.find( u => { return u == message.source.user });
        if (!isAdmin) actions.splice(_.findIndex(actions, function(e) {return e.name == 'team'}),1);
        var json = parsedIn.original_message;

        json.attachments[json.attachments.length-1] = {
            fallback: 'Search Results',
            callback_id: 'search_results',
            actions: actions
        }
        request({
          method: 'POST',
          uri: message.source.response_url,
          body: JSON.stringify(json)
        });
        return res.sendStatus(200)
      }
      else if (simple_command == 'cafe_btn') {
          message.mode = 'food'
          message.action = 'begin'
          message.text = 'food'
          message.save().then(() => {
            queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
          })
      }
      else if (simple_command == 'shopping_btn') {
          message.mode = 'shopping'
          message.action = 'initial'
          message.text = 'exit'
          message.save().then(() => {
            queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
          })
      }
      else if (simple_command == 'back_btn') {
        var history = yield db.Messages.find({thread_id: message.source.channel}).sort('-ts').limit(10);
        var last_message = history[0];
        var actions = _.get(last_message,'mode') == 'shopping' ? cardTemplate.slack_home_default : cardTemplate.slack_settings_default;
        var json = parsedIn.original_message;
        json.attachments[json.attachments.length-1] = {
            fallback: 'Search Results',
            callback_id: 'search_results',
            actions: actions
        };
        request({
          method: 'POST',
          uri: message.source.response_url,
          body: JSON.stringify(json)
        })
        return res.sendStatus(200)
      }
      else if (simple_command == 'help_btn') {
          message.mode = 'banter'
          message.action = 'reply'
          message.text = 'help'
          message.save().then(() => {
            queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
          })
      }
      else if (simple_command == 'channel_btn') {
        var channelId = _.get(parsedIn,'actions[0].value');
        var team_id = message.source.team;
        var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
        if (team.meta.cart_channels.find(id => { return (id == channelId) })) {
          // kip.debug(' \n\n\n\n\n removing channel:', team.meta.cart_channels.find(id => { return (id == channelId) }),' \n\n\n\n\n ');
          _.remove(team.meta.cart_channels, function(c) { return c == channelId });
          kip.debug(' \n\n\n\n\n  channel removed, cart channels:', team.meta.cart_channels ,' \n\n\n\n\n ');
        } else {
          team.meta.cart_channels.push(channelId);
          kip.debug(' \n\n\n\n\n  added channel:', channelId, 'cart channels: ',team.meta.cart_channels ,' \n\n\n\n\n ');
        }
        team.markModified('meta.cart_channels');
        yield team.save();
        var channels = yield utils.getChannels(team);
        var buttons = channels.map(channel => {
          var checkbox = team.meta.cart_channels.find(id => { return (id == channel.id) }) ? '✓ ' : '☐ ';
          return {
            name: 'channel_btn',
            text: checkbox + channel.name ,
            type: 'button',
            value: channel.id
          }
        });
        var json = parsedIn.original_message;
        json.attachments[json.attachments.length-2] = {text: 'Channels: ', actions: buttons, callback_id: "none"}
        request({
          method: 'POST',
          uri: message.source.response_url,
          body: JSON.stringify(json)
        })
        return res.sendStatus(200)
      }
      else if (simple_command == 'view_cart_btn') {
          message.mode = 'shopping'
          message.action = 'cart.view'
          message.text = 'view cart'
          message.save().then(() => {
            queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
          })
      }
      else if (simple_command == 'address_confirm_btn') {
        message.mode = 'address'
        message.action = 'validate'
        var location
        try {
          location = JSON.parse(message.source.original_message.attachments[0].actions[0].value)
        } catch(err) {
          location = _.get(message, 'message.source.original_message.attachments[0].actions[0].value');
        }
        message.source.location = location
        message.save().then(() => {
          queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
        });
      }
      else if (simple_command == 'send_last_call_btn') {
        message.mode = 'settings';
        message.action = 'send_last_call';
        message.save().then(() => {
          queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
        })
      }
      else if (simple_command.indexOf('address.') > -1) {
        message.mode = simple_command.split('.')[0]
        message.action = simple_command.split('.')[1]
      }
      else if (simple_command == 'settings') {
        message.mode = 'settings';
        message.action = 'home';
      }
      else if (simple_command == 'team') {
        message.mode = 'team';
        message.action = 'home';
      }
      else if (simple_command == 'exit') {
        message.mode = 'exit';
        message.action = 'exit';
        message.text = ''
        var attachments = cardTemplate.slack_shopping_mode;
        var reply = {
          username: 'Kip',
          text: "",
          attachments: attachments,
          fallback: 'Shopping'
        };
        var team = message.source.team;
        var slackBot = slackModule.slackConnections[team];
        slackBot.web.chat.postMessage(message.source.channel, '', reply);
        
      }
      message.save().then(() => {
        queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
      });
    }
    else if (buttonData) {
      var message = new db.Message({
        incoming: true,
        thread_id: parsedIn.channel.id,
        action: buttonData.action,
        mode: buttonData.mode,
        data: buttonData,
        user_id: parsedIn.user.id,
        origin: 'slack',
        source: parsedIn
      })
      // inject source.team and source.user because fuck the fuck out of slack message formats
      message.source.team = message.source.team.id
      message.source.user = message.source.user.id
      message.source.channel = message.source.channel.id
      message.save().then(() => {
        queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
      })
    } else {
      //actions that do not require processing in reply_logic, skill all dat
      switch (action.name) {
        case 'additem':
          // adds the item to the cart the right way, but for speed we return a hacked message right away
          var updatedMessage = parsedIn.original_message
          var priceDifference = 0
          updatedMessage.attachments.map(a => {
            if (a.callback_id === parsedIn.callback_id) {
              priceDifference = parseFloat(a.text.match(/\$[\d.]+/)[0].substr(1))
              a.text = a.text.replace(/\d+$/, replacement => {
                return parseInt(replacement) + 1
              })
            } else if (a.text && a.text.indexOf('Team Cart Summary') >= 0) {
              a.text = a.text.replace(/\$[\d.]+/, function (total) {
                return '$' + (parseFloat(total.substr(1)) + priceDifference).toFixed(2)
              })
            }
          })
          co(function * () {
            var teamCart = yield kipcart.getCart(parsedIn.team.id)
            var item = yield db.Items.findById(parsedIn.callback_id).exec()
            yield kipcart.addExtraToCart(teamCart, parsedIn.team.id, parsedIn.user.id, item)
          }).catch(console.log.bind(console))
          break

        case 'removeitem':
          // reduces the quantity right way, but for speed we return a hacked message right away
          var index
          var priceDifference = 0
          var updatedMessage = parsedIn.original_message
          updatedMessage.attachments = updatedMessage.attachments.reduce((all, a, i) => {
            if (a.callback_id === parsedIn.callback_id) {
              priceDifference = parseFloat(a.text.match(/\$[\d.]+/)[0].substr(1))
              var isZero = false
              index = i
              a.text = a.text.replace(/\d+$/, replacement => {
                if (parseInt(replacement) <= 1) {
                  isZero = true
                }
                return parseInt(replacement) - 1
              })
              if (!isZero) {
                all.push(a)
              }
            } else if (a.text && a.text.indexOf('Team Cart Summary') >= 0) {
              a.text = a.text.replace(/\$[\d.]+/, function (total) {
                return '$' + (parseFloat(total.substr(1)) - priceDifference).toFixed(2)
              })
              all.push(a)
            } else {
              all.push(a)
            }
            return all
          }, [])
          co(function * () {
            yield kipcart.removeFromCart(parsedIn.team.id, parsedIn.user.id, index)
          }).catch(console.log.bind(console))
          break
        case 'removeall':
          // reduces the quantity right way, but for speed we return a hacked message right away
          var index;
          var priceDifference = 0;
          var updatedMessage = parsedIn.original_message;
          updatedMessage.attachments = updatedMessage.attachments.reduce((all, a, i) => {
            if (a.callback_id === parsedIn.callback_id) {;
              var quantity = parseInt(a.text.match(/\d+$/)[0])
              priceDifference = quantity * parseFloat(a.text.match(/\$[\d.]+/)[0].substr(1));
              index = i;
            } else if (a.text && a.text.indexOf('Team Cart Summary') >= 0) {
              a.text = a.text.replace(/\$[\d.]+/, function (total) {
                return '$' + (parseFloat(total.substr(1)) - priceDifference).toFixed(2)
              })
              all.push(a)
            } else {
              all.push(a)
            }
            return all
          }, [])
          co(function * () {
            yield kipcart.removeAllOfItem(parsedIn.team.id, index)
          }).catch(console.log.bind(console))
          break
      }
    }
    // sends back original chat
    if (parsedIn.original_message) {
      var stringOrig = JSON.stringify(parsedIn.original_message)
      var map = {amp: '&', lt: '<', gt: '>', quot: '"', '#039': "'"}
      stringOrig = stringOrig.replace(/&([^;]+);/g, (m, c) => map[c])
      res.send(JSON.parse(stringOrig))
    } else {
      console.error('slack buttons broke, need a response_url')
      res.sendStatus(process.env.NODE_ENV === 'production' ? 200 : 500)
      return
    }
  } else {
    res.sendStatus(200)
  }
}))


app.get('/authorize', function (req, res) {
  console.log('button click')
  res.redirect('https://slack.com/oauth/authorize?scope=commands+bot+users:read&client_id=' + kip.config.slack.client_id)
})

app.get('/newslack', function (req, res) {
  console.log('new slack integration request');
    co(function * () {
     
  if (!req.query.code) {
    console.error(new Date())
    console.error('no code in the callback url, cannot proceed with new slack integration')
    return
  }
  var body = {
    code: req.query.code,
    redirect_uri: kip.config.slack.redirect_uri
  }
  var res_auth = yield requestPromise({ url: 'https://' + kip.config.slack.client_id + ':' + kip.config.slack.client_secret + '@slack.com/api/oauth.access',method: 'POST',form: body})
  res_auth = JSON.parse(res_auth);
  if (_.get(res_auth,'ok')) {
          kip.debug('lel')

     var existingTeam = yield db.Slackbots.findOne({'team_id': _.get(res_auth,'team_id'), 'deleted': { $ne:true } }).exec();
     if ( _.get(existingTeam, 'team_id')) {
        _.merge(existingTeam, res_auth);
        yield existingTeam.save();
        yield utils.initializeTeam(existingTeam, res_auth);
       co(slackModule.start);

     } else {


      var bot = new db.Slackbot(res_auth);
      yield bot.save();
      yield utils.initializeTeam(bot, res_auth);
      co(slackModule.start);
      var admins = yield utils.findAdmins(bot);
      var a = admins[0];
      var message= new db.Message({
        incoming: false,
        thread_id: a.dm,
        resolved: true,
        user_id: a.id,
        origin: 'slack',
        text: '',
        source:  {
          team: bot.team_id,
          channel: a.dm,
          thread_id: a.dm,
          user: a.id,
          type: 'message',
        },
        mode: 'onboard',
        action: 'home',
        user: a.id
      })
     // queue it up for processing
      message.save().then(() => {
        queue.publish('incoming', message, ['slack', a.dm, Date.now()].join('.'))
      })
      
     }
  } else {
    kip.debug(res_auth)
   }

  res.redirect('/thanks.html')
  
  }).catch(console.log.bind(console))
})



// app.get('/*', function(req, res, next) {
//     res.sendfile(defaultPage)
// })

var listener
function listen (callback) {
  listener = callback
}

var port = 8000
app.listen(port, function (e) {
  if (e) {
    console.dir(e)
  } else {
    console.log('slack action server listening on port ' + port)
    console.log('running NODE_ENV=' + process.env.NODE_ENV)
  }
})

module.exports.listen = listen;
