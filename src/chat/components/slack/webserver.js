//
// "Actions" are what slack calls buttons
//
var queue = require('../queue-mongo');
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
var uuid = require('uuid');
var processData = require('../process');
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
  switch (action.name) {
    case 'addcart':
      return 'save ' + action.value
    case 'cheaper':
      if (action.value) {
        return action.value + ' but cheaper'
      } else {
        return 'cheaper'
      }
    case 'similar':
      return 'similar ' + action.value
    case 'moreinfo':
      return action.value
    case 'more':
      return 'more'
    case 'cafe_btn':
      return 'cafe_btn';
    case 'shopping_btn':
      return 'shopping_btn';
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
  if (!req.body || !req.body.payload) {
    // probably a health check message from slack
    res.sendStatus(200)
  }

  var message;
  var parsedIn = JSON.parse(req.body.payload);

  // First reply to slack, then process the request
  if (!buttonData && simple_command !== 'channel_btn' && parsedIn.original_message) {
    res.status(200)
    res.end()
  } else if (!parsedIn.original_message) {
    console.error('slack buttons broke, need a response_url')
    res.sendStatus(process.env.NODE_ENV === 'production' ? 200 : 500)
    return
  }

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

    if (simple_command == 'cafe_btn') {
          message.mode = 'food'
          message.action = 'begin'
          message.text = 'food'
          message.save().then(() => {
            queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
          })
      }
      else if (simple_command === 'shopping_btn' || simple_command === 'shopping') {
        let team = yield db.Slackbots.findOne({
          'team_id': message.source.team
        }).exec();
        let isAdmin = yield utils.isAdmin(message.source.user, team);
        message.mode = 'shopping'
        if (isAdmin) {
          message.action = 'adminInitial';
          message.text = 'sendCollect';
        } else {
          message.action = 'initial';
          message.text = 'shopping';
        }
        message.save().then(() => {
          queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
        });
      }
      else if (simple_command == 'loading_btn') {
      	// responding with nothing means the button does nothing!
        return;
      }
      else if (simple_command == 'channel_btn') {
        var channelId = _.get(parsedIn,'actions[0].value');
        var team_id = message.source.team;
        var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
        var lastMessage = parsedIn.original_message;
        kip.debug(`😍  ${JSON.stringify(lastMessage, null, 2)}`)
        if (team.meta.cart_channels.find(id => { return (id == channelId) })) {
          // kip.debug(' \n\n\n\n\n removing channel:', team.meta.cart_channels.find(id => { return (id == channelId) }),' \n\n\n\n\n ');
          _.remove(team.meta.cart_channels, function(c) { return c == channelId });
        } else {
          team.meta.cart_channels.push(channelId);
        }
        team.meta.cart_channels = _.uniq(team.meta.cart_channels);
        team.markModified('meta.cart_channels');
        yield team.save();
        var channels = yield utils.getChannels(team);
        if (channels.length > 9) {
          channels = channels.slice(0, 9);
        }
        var attachments = [];
        var buttons = channels.map(channel => {
          var checkbox = team.meta.cart_channels.find(id => { return (id == channel.id) }) ? '✓ ' : '☐ ';
          return {
            name: 'channel_btn',
            text: checkbox + channel.name ,
            type: 'button',
            value: channel.id
          }
        });
        buttons = _.uniq(buttons);
        function sortF(a, b){
          return ((a.text.indexOf('☐ ') > -1) - (b.text.indexOf('☐ ') > -1))
        }
        buttons = buttons.sort(sortF)
        if (buttons.length > 9) {
          buttons = buttons.slice(0, 9);
        }
        var chunkedButtons = _.chunk(buttons, 5);
        chunkedButtons.forEach((ele, i) => {
          let newRow = lastMessage.attachments[i];
          newRow.actions = chunkedButtons[i];
          attachments.push(newRow);
        })
        attachments = attachments.concat(lastMessage.attachments[lastMessage.attachments.length - 2], lastMessage.attachments[lastMessage.attachments.length - 1]);
        var json = parsedIn.original_message;
        json.attachments = attachments;
        let stringOrig = JSON.stringify(json);
        let map = {
          amp: '&',
          lt: '<',
          gt: '>',
          quot: '"',
          '#039': "'"
        }
        stringOrig = stringOrig.replace(/&([^;]+);/g, (m, c) => map[c])
        request({
          method: 'POST',
          uri: message.source.response_url,
          body: stringOrig
        });
        return;
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
        message.action = 'home';
        message.text = 'send last call btn';
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
        let isAdmin = yield utils.isAdmin(message.source.user, team);
        let reply = cardTemplate.home_screen(isAdmin);
        var slackBot = slackModule.slackConnections[team];
        reply.as_user = true;
        slackBot.web.chat.postMessage(message.source.channel, '', reply);

      }
      message.save().then(() => {
        queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
      });
    }
    else if (buttonData) {
        kip.debug(' \n\n\n\n\n\n\n\n\n\n\n\n\n \n\n\n\n\n\n\n\n\n\n\n\n\n  BUTTODATA:', buttonData,'  \n\n\n\n\n\n\n\n\n\n\n\n\n \n\n\n\n\n\n\n\n\n\n\n\n\n')
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
      let cart, index;
      parsedIn.original_message.attachments.forEach((ele, id) => {
        if (ele.callback_id === parsedIn.callback_id) {
          index = id;
        }
      });
      switch (action.name) {
        case 'additem':
          parsedIn.original_message.attachments = clearCartMsg(parsedIn.original_message.attachments);
          co(function*() {
            let teamCart = yield kipcart.getCart(parsedIn.team.id);
            let item = yield db.Items.findById(parsedIn.callback_id).exec();
            cart = yield kipcart.addExtraToCart(teamCart, parsedIn.team.id, parsedIn.user.id, item);
            yield updateCartMsg(cart, parsedIn);
          }).catch(console.log.bind(console));
          break;
        case 'removeitem':
          parsedIn.original_message.attachments = clearCartMsg(parsedIn.original_message.attachments);
          co(function*() {
            cart = yield kipcart.removeFromCart(parsedIn.team.id, parsedIn.user.id, index, 'team'); //'team' assumes this is a slack command. need a way to tell
            yield updateCartMsg(cart, parsedIn);
          }).catch(console.log.bind(console));
          break;
        case 'removewarn':
          let matches = parsedIn.original_message.attachments[index].text.match(/<(.+)\|(.+)>/i); //0 is full string, 1 is url, 2 is title
          parsedIn.original_message.attachments[index] = {
            text: `Are you sure you want to remove *${matches[2]}* from your cart?`,
            actions: cardTemplate.cart_check(index),
            mrkdwn_in: ['text'],
            callback_id: parsedIn.original_message.attachments[index].callback_id
          };
          break;
        case 'emptycartwarn':
          parsedIn.original_message.attachments[index] = {
            text: `Are you sure you want to empty your cart?`,
            actions: cardTemplate.empty_cart_check,
            mrkdwn_in: ['text'],
            callback_id: parsedIn.original_message.attachments[index].callback_id
          };
          break;
        case 'cancelemptycart':
        case 'cancelremove':
          co(function * () {
            cart = yield kipcart.getCart(parsedIn.team.id); // 'team' assumes this is a slack command. need a way to tell
            yield updateCartMsg(cart, parsedIn);
          }).catch(console.log.bind(console));
          break;
        case 'removeall':
          // reduces the quantity right way, but for speed we return a hacked message right away
          co(function*() {
            cart = yield kipcart.removeAllOfItem(parsedIn.team.id, index);
            yield updateCartMsg(cart, parsedIn);
          }).catch(console.log.bind(console));

          parsedIn.original_message.attachments.splice(index, 1); // just take it off the list
          parsedIn.original_message.attachments = clearCartMsg(parsedIn.original_message.attachments);
          break;
        case 'emptycart':
          co(function*() {
            cart = yield kipcart.emptyCart(parsedIn.team.id);
            yield updateCartMsg(cart, parsedIn);
          }).catch(console.log.bind(console));
      }
      var stringOrig = JSON.stringify(parsedIn.original_message)
      let map = {
        amp: '&',
        lt: '<',
        gt: '>',
        quot: '"',
        '#039': "'"
      }
      stringOrig = stringOrig.replace(/&([^;]+);/g, (m, c) => map[c])
      request({
        method: 'POST',
        uri: parsedIn.response_url,
        body: stringOrig
      });
    }
}))

function clearCartMsg(attachments) {
  //clears all but the updating message of buttons
  return attachments.reduce((all, a) => {
    if (a.callback_id && a.text && a.text.includes('Quantity:')) {
      a.actions = [{
        'name': 'passthrough',
        'text': 'Loading...',
        'style': 'default',
        'type': 'button',
        'value': 'loading_btn'
      }];
    }
    if(!(a.text && a.text.includes('Are you sure you want to remove the last'))){
      all.push(a);
    }
    return all;
  }, []);
}

function* updateCartMsg(cart, parsedIn) {
  let itemNum = 1,
    team = yield db.slackbots.findOne({
      team_id: parsedIn.team.id
    }),
    showEverything = team.meta.office_assistants.includes(parsedIn.user.id) || team.meta.office_assistants.length === 0;

  let itemData = cart.aggregate_items.reduce((all, ele) => {
    all[ele._id] = {};
    all[ele._id].quantity = ele.quantity;
    all[ele._id].showDetail = ele.added_by.includes(parsedIn.user.id);
    all[ele._id].added_by = ele.added_by;
    all[ele._id].title = ele.title;
    all[ele._id].price = ele.price;
    all[ele._id].link = ele.link;
    all[ele._id].ASIN = ele.ASIN;
    return all;
  }, {});

  cart.aggregate_items.map(function*(ele) {
    if (itemData[ele._id].showDetail || showEverything) {
      itemData[ele._id].link = yield processData.getItemLink(itemData[ele._id].link, parsedIn.user.id, ele._id.toString());
    }
  });

  let attachments = parsedIn.original_message.attachments.reduce((all, a) => {
    let item = itemData[a.callback_id];
    if (a.callback_id && item) {
      let userString;
      a.actions = (item.showDetail || showEverything) ? [{
        'name': 'additem',
        'text': '+',
        'style': 'default',
        'type': 'button',
        'value': 'add'
      }, {
        'name': item.quantity > 1 ? "removeitem" : 'removewarn',
        'text': '—',
        'style': 'default',
        'type': 'button',
        'value': item.quantity > 1 ? "removeitem" : 'removewarn',
      }] : [{
        'name': 'additem',
        'text': '+ Add',
        'style': 'default',
        'type': 'button',
        'value': 'add'
      }];

      if (showEverything && item.quantity > 1) {
        a.actions.push({
          name: "removewarn",
          text: 'Remove All',
          style: 'default',
          type: 'button',
          value: 'removewarn'
        });
      }
      userString = item.added_by.map(function(u) {
        return '<@' + u + '>';
      }).join(', ');

      a.text = [
        ((showEverything || item.showDetail) ? `<${item.link}|${item.title}>` : item.title),
        ((showEverything) ? `*Price:* ${item.price} each` : ''),
        `*Added by:* ${userString}`,
        `*Quantity:* ${item.quantity}`
      ].filter(Boolean).join('\n');

      if (item.quantity > 0) {
        all.push(a);
        itemNum++;
      }
      if (cart.error && cart.errorASIN && cart.errorASIN === item.ASIN) {
        all.push({
          text: cart.error,
          color: '#fc9600',
          callback_id: 'shrug',
          attachment_type: 'default'
        });
      }
    } else if (a.text.includes('*Total:* $')) {
      a.text = (cart.items.length > 0)
      ? `*Total:* ${cart.total}\n<${cart.link}|*➤ Click Here to Checkout*>`
      : '';
      all.push(a);
    } else if (a.text.includes('Are you sure') || a.image_url) {
      let buttons = {
        text: cart.aggregate_items.length > 0 ? 'Here\'s everything you have in your cart' : 'It looks like your cart is empty!',
        color: '#45a5f4',
        image_url: 'http://kipthis.com/kip_modes/mode_teamcart_view.png',
        callback_id: 'press me',
        actions: [{
          'name': 'passthrough',
          'text': 'Home',
          'type': 'button',
          'value': 'home'
        }]
      };
      if (showEverything) {
        buttons.actions.push({
          'name': 'bundles.home',
          'text': '+ Add Bundles',
          'type': 'button',
          'value': 'home'
        });
        if (cart.aggregate_items.length > 0) {
          buttons.actions.push({
            'name': 'emptycartwarn',
            'text': 'Empty Cart',
            'type': 'button',
            'value': 'emptycartwarn'
          });
        }
      }
      all.push(buttons);
    }
    return all;
  }, []);

  parsedIn.original_message.attachments = attachments;
  request({
    method: 'POST',
    uri: parsedIn.response_url,
    body: JSON.stringify(parsedIn.original_message)
  });
}

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
     var existingTeam = yield db.Slackbots.findOne({'team_id': _.get(res_auth,'team_id'), 'deleted': { $ne:true } }).exec();
     if ( _.get(existingTeam, 'team_id')) {
        _.merge(existingTeam, res_auth);
        yield existingTeam.save();
        yield utils.initializeTeam(existingTeam, res_auth);
        yield slackModule.loadTeam(existingTeam)
     } else {
      var bot = new db.Slackbot(res_auth);
      yield bot.save();
      yield utils.initializeTeam(bot, res_auth);
      yield slackModule.loadTeam(bot)
      var user = yield db.Chatuser.findOne({ id: _.get(res_auth,'user_id')}).exec()
      var message= new db.Message({
        incoming: false,
        thread_id: user.dm,
        resolved: true,
        user_id: user.id,
        origin: 'slack',
        text: '',
        source:  {
          team: bot.team_id,
          channel: user.dm,
          thread_id: user.dm,
          user: user.id,
          type: 'message',
        },
        mode: 'onboarding',
        action: 'home',
        user: user.id
      })
     // queue it up for processing
      message.save().then(() => {
        queue.publish('incoming', message, ['slack', user.dm, Date.now()].join('.'))
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
