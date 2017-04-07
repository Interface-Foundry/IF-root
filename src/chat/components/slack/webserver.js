//
// "Actions" are what slack calls buttons
//
var queue = require('../queue-direct');
var agenda = require('../agendas')
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
var archiveTeam = require('./archive_team')
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

// allow webserver.js to call handlers_checkout functions
var foodHandlers = {}
var UserChannel = require('../delivery.com/UserChannel')
var replyChannel = new UserChannel(queue)
require('../delivery.com/handlers_checkout.js')(replyChannel, foodHandlers)

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
    case 'members':
      return 'team';
    case 'channel_btn':
      return 'channel_btn';
    case 'collect_select':
      return 'collect_select';
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
    logging.info('got slackaction without an action payload', req.body)
    return res.sendStatus(200)
  }

  var message;
  var parsedIn = JSON.parse(req.body.payload);

  // snooze any message by setting action.value to "snooze"
  if (_.get(parsedIn, 'actions[0].value') === 'snooze') {
    var time_ms = new Date(24 * 60 * 60 * 1000 + Date.now())

    var reminderMessage = {
      mode: 'food',
      action: 'begin',
      origin: 'slack',
      reply: {
        attachments: parsedIn.original_message.attachments
      },
      source: {
        user: parsedIn.user.id,
        team: parsedIn.team.id,
        channel: parsedIn.channel.id
      }
    }

    agenda.schedule(time_ms, 'onboarding reminder', {
      msg: JSON.stringify(reminderMessage),
      user: parsedIn.user.id
    })

    var okay = {
      text: 'Okay, I\'ll remind you tomorrow',
      replace_original: false
    }
    return res.send(okay)
  }

  // First reply to slack, then process the request
  if (!buttonData && simple_command !== 'collect_select' && simple_command !== 'channel_btn'&& parsedIn.original_message) {
    res.status(200)
    res.end()
  } else if (!parsedIn.original_message) {
    console.error('slack buttons broke, need a response_url')
    res.sendStatus(process.env.NODE_ENV === 'production' ? 200 : 500)
    return
  } else {
    res.status(200)
    res.end()
  }

    var action = parsedIn.actions[0];
    kip.debug('incoming action', action);
    // kip.debug(action.name.cyan, action.value.yellow);
    // // check the verification token in production
    // if (process.env.NODE_ENV === 'production' && parsedIn.token !== kip.config.slack.verification_token) {
    //   kip.error('Invalid verification token')
    //   return res.sendStatus(403)
    // }

    // kip.debug(action.name.cyan, action.value.yellow);
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
      var team_id = message.source.team;
      var team = yield db.Slackbots.findOne({
        'team_id': team_id
      }).exec();

    if (simple_command == 'cafe_btn') {
          message.mode = 'food'
          message.action = 'begin'
          message.text = 'food'
          message.save().then(() => {
            queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
          })
      }
    else if (simple_command === 'shopping_btn' || simple_command === 'shopping') {
      message.text = '';
      let msgData = {
        attachments: [...cardTemplate.slack_shopping_mode()],
        as_user: true
      };
      let slackBot = slackModule.slackConnections[team.team_id];
      slackBot.web.chat.postMessage(message.source.channel, message.text, msgData);
      return;
    }
      else if (simple_command == 'loading_btn') {
      	// responding with nothing means the button does nothing!
        return;
      }
      else if (simple_command === 'collect_select') {
        let selection = action.value;
        let json = parsedIn.original_message;
        json.attachments[0].actions = json.attachments[0].actions.map(button => {
          button.text = button.text.replace('◉', '○');
          return button;
        });
        json.attachments.splice(1, json.attachments.length - 2);
        let okButtonText = (json.attachments[json.attachments.length - 1].callback_id !== 'onboard_team') ? 'Collect Orders' : '✔︎ Update Members';
        switch (selection) {
          case 'everyone':
            json.attachments[0].actions[0].text = '◉ Everyone';
            team.meta.collect_from = 'all';
            break;
          case 'justme':
            json.attachments[0].actions[1].text = '◉ Just Me';
            team.meta.collect_from = 'me';
            break;
          case 'channel':

            //Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ 
            //Œ Œ Œ Œ Œ Œ Œ Œ > SLACK LAUNCH CODE < Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ 
            //Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ 
            if(message.source.team == 'T02PN3B25'){
              json.attachments[0].actions[2].text = '◉ By Channel';
              team.meta.collect_from = 'channel';
              let channelSection = [{
                text: '',
                callback_id: 'channel_buttons_idk',
                actions: [{
                  name: 'channel_btn',
                  text: 'Pick Channel',
                  type: 'select',
                  data_source: 'channels'
                }]
              }];
              channelSection.push(json.attachments.pop());
              json.attachments = [...json.attachments, ...channelSection];
              break;
            }

            //💀 KILL THIS CODE BEFORE LAUNCH 💀
            else {
              json.attachments[0].actions[2].text = '◉ By Channel';
              team.meta.collect_from = 'channel';
              let cartChannels = team.meta.cart_channels;
              let channels = yield utils.getChannels(team);
              let selectedChannels = channels.reduce((arr, channel) => {
                if (cartChannels.includes(channel.id)) {
                  arr.push({
                    name: 'channel_btn',
                    text: `✓ #${channel.name}`,
                    type: 'button',
                    value: channel.id
                  });
                }
                return arr;
              }, []);
              let unselectedChannels = channels.reduce((arr, channel) => {
                if (!cartChannels.includes(channel.id)) {
                  arr.push({
                    name: 'channel_btn',
                    text: `☐ #${channel.name}`,
                    type: 'button',
                    value: channel.id
                  });
                }
                return arr;
              }, []);
              selectedChannels = _.uniq(selectedChannels);
              unselectedChannels = _.uniq(unselectedChannels);
              let buttons = (selectedChannels.length > 8) ? selectedChannels // always show all selected channels
                : selectedChannels.concat(unselectedChannels.splice(0, 9 - selectedChannels.length));
              let chunkedButtons = _.chunk(buttons, 5);
              let channelSection = chunkedButtons.map(buttonRow => {
                return {
                  text: '',
                  callback_id: 'channel_buttons_idk',
                  actions: buttonRow
                };
              });
              channelSection.push(json.attachments.pop());
              json.attachments = [...json.attachments, ...channelSection];
              break;
            }
        }
        team.markModified('meta.collect_from');
        yield team.save();
        json.attachments[json.attachments.length - 1].actions[0].text = okButtonText;
        let stringOrig = JSON.stringify(json);
        let map = {
          amp: '&',
          lt: '<',
          gt: '>',
          quot: '"',
          '#039': '\''
        };
        stringOrig = stringOrig.replace(/&([^;]+);/g, (m, c) => map[c]);
        request({
          method: 'POST',
          uri: message.source.response_url,
          body: stringOrig
        });
        return;
      } else if (simple_command === 'channel_btn') {
        let team_id = message.source.team;
        let channelId = (action.selected_options) ? action.selected_options[0].value : action.value;
        let team = yield db.Slackbots.findOne({
          'team_id': team_id
        }).exec();
        team.meta.cart_channels = [channelId];
        team.markModified('meta.cart_channels');
        yield team.save();
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
      else if (simple_command == 'team' || simple_command === 'members') {
        message.mode = 'team';
        message.action = 'home';
      }
      else if (simple_command == 'exit') {
        logging.log('checking if user is admin')
        let isAdmin = yield utils.isAdmin(message.source.user, team);
        let couponText = yield utils.couponText(message.source.team);
        let reply = cardTemplate.home_screen(isAdmin, message.source.user, couponText);
        let slackBot = slackModule.slackConnections[team];
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
        case 'cancelremove':
          co(function * () {
            cart = yield kipcart.getCart(parsedIn.team.id); // 'team' assumes this is a slack command. need a way to tell
            yield updateCartMsg(cart, parsedIn);
          }).catch(console.log.bind(console));
          return;
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
          cart = yield kipcart.emptyCart(parsedIn.team.id);
          yield updateCartMsg(cart, parsedIn);
          return;
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

app.post('/menuorder', (req, res) => {
  // check the verification token
  if (req.body.verification_token !== kip.config.slack.verification_token) {
    res.status(403)
    return res.end()
  }

  queue.publish(req.body.topic, req.body.message, 'defaultId')
  res.status(200)
  res.end()
})

app.post('/cafeorder', (req, res) => co(function * () {
  if (req.body.status === 'new_credit_card') {
    // remove the click to pay for when user has entered new card
    logging.debug('entered their credit card and successful')
    yield foodHandlers['food.new_credit_card.success'](req.body.guest_token)
  } else if (req.body.status === 'previous_credit_card') {
    logging.debug('previously used credit card success')
    // trigger handler_checkout for when user has previously used card
    yield foodHandlers['food.previous_credit_card.success'](req.body.guest_token)
  } else {
    logging.error('didnt get expected response in /cafeorder')
    return res.sendStatus(403)
  }
  return res.sendStatus(200)
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

function * updateCartMsg(cart, parsedIn) {
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
    if (item) {
      let userString;
      a.actions = (item.showDetail || showEverything) ? [{
        'name': item.quantity > 1 ? "removeitem" : 'removewarn',
        'text': '—',
        'style': 'default',
        'type': 'button',
        'value': item.quantity > 1 ? "removeitem" : 'removewarn',
      }, {
        'name': 'additem',
        'text': '+',
        'style': 'default',
        'type': 'button',
        'value': 'add'
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
          color: '#fe9b00',
          callback_id: 'shrug',
          attachment_type: 'default'
        });
      }
    } else if (a.callback_id === 'cart_admin_summary') {
      a.text = (cart.items.length > 0)
      ? `*Total:* ${cart.total}\n<${cart.link}|*➤ Click Here to Checkout*>`
      : '';
      all.push(a);
    } else if (a.callback_id === 'cart_head') {
      let buttons = {
        text: cart.aggregate_items.length > 0 ? 'Here\'s everything you have in your cart' : 'It looks like your cart is empty!',
        color: '#45a5f4',
        image_url: 'http://kipthis.com/kip_modes/mode_teamcart_view.png',
        callback_id: 'cart_head',
        actions: [{
          'name': 'passthrough',
          'text': 'Home',
          'type': 'button',
          'value': 'home'
        }]
      };
      if (showEverything) {
        // buttons.actions.push({
        //   'name': 'bundles.home',
        //   'text': '+ Add Bundles',
        //   'type': 'button',
        //   'value': 'home'
        // });
        if (cart.aggregate_items.length > 0) {
          buttons.actions.push({
            'name': 'emptycart',
            'text': 'Empty Cart',
            'type': 'button',
            'value': 'emptycart',
            'confirm': {
              'title': 'Are you sure?',
              'text': 'Are you sure you want to empty your cart?',
              'ok_text': 'Yes',
              'dismiss_text': 'No'
            }
          });
        }
      }
      all.push(buttons);
	} else if (a.callback_id === 'cart_member_summary' || a.callback_id === 'cart_onboard_head') {
      all.push(a);
    }
    return all;
  }, []);

  parsedIn.original_message.attachments = attachments;
  request({
    method: 'POST',
    uri: parsedIn.response_url,
    body: JSON.stringify(parsedIn.original_message)
  })
}

/**
 * Authorize route, log data to database
 * @type {Any}
 */
app.get('/authorize', function (req, res) {
  logging.info('button click @ /authorize')
  db.Metrics.log('add_to_slack', {
    ip: req.ip,
    headers: req.headers
  })
  res.redirect(`https://slack.com/oauth/authorize?scope=commands+bot+users:read&client_id=${kip.config.slack.client_id}`)
})

/**
 * Route which is hit after a user selects which team they want to authorize through slack. Oauth.
 * @type {Any}
 */
app.get('/newslack', (req, res) => co(function * () {
  logging.info('new slack integration request')
  res.redirect('/thanks.html')
  if (!req.query.code) {
    logging.warn('no code in the callback url, cannot proceed with new slack integration')
    if (process.env.NODE_ENV === 'production') {
      // res.status(200).send({'Error': 'not a valid route with no code'})
      res.redirect('/add.html')
    } else {
      res.redirect('/test-button.html')
    }
    return
  }

  // request oauth tokens from slack if they are adding kip
  try {
    var body = {
      client_id: kip.config.slack.client_id,
      client_secret: kip.config.slack.client_secret,
      code: req.query.code,
      redirect_uri: kip.config.slack.redirect_uri
    }

    var res_auth = yield requestPromise({
      url: 'https://slack.com/api/oauth.access',
      method: 'POST',
      form: body,
      json: true
    })
  } catch (err) {
    logging.error('error getting res_auth from Slack', err, body)
  }

  if (_.get(res_auth, 'ok') !== true) {
    logging.error('res_auth not ok in /newslack', res_auth)
    throw new Error('Response for oauth.access not ok')
  }

  var existingTeam = yield db.Slackbots.findOne({
    'team_id': res_auth.team_id,
    'deleted': {$ne: true}
  })

  if (_.get(existingTeam, 'team_id')) {
    logging.info('team exists previously while using /newslack')

    // nuking team and strating over (see issue #820
    try {
      yield archiveTeam(existingTeam.team_id)
      yield sleep(1000) // mongodb's index needs to clear the team_id, which apparently takes time
    } catch (e) {
      logging.error({
        message: 'Error archiving team during Add to Slack button click',
        error: e,
      })
    }
  }

    // create all the things
    logging.info('creating new slackbot for team: ', res_auth.team_id)
    var slackbot = new db.Slackbot(res_auth)
    yield slackbot.save()
    yield [utils.initializeTeam(slackbot, res_auth), utils.getTeamMembers(slackbot)]
    yield slackModule.loadTeam(slackbot)
    var user = yield db.Chatuser.findOne({id: res_auth.user_id}).exec()
    var message = new db.Message({
      incoming: false,
      thread_id: user.dm,
      resolved: true,
      user_id: user.id,
      origin: 'slack',
      text: '',
      source: {
        'team': slackbot.team_id,
        'channel': user.dm,
        'thread_id': user.dm,
        'user': user.id,
        'type': 'message'
      },
      mode: 'onboarding',
      action: 'start'
    })
    // queue it up for processing
    yield message.save()
    queue.publish('incoming', message, ['slack', user.dm, Date.now()].join('.'))
}).catch(e => {
  logging.error(e)
}))

/**
 * Health check to see if the server is accepting connections
 */
app.get('/health', function (req, res) {
  res.sendStatus(200)
})

/**
 * allow messages to come in from external sources
 * you can use this with do_message.js
 */
app.post('/incoming', function (req, res) {
  logging.debug('incoming message')
  logging.debug(req.body)
  logging.debug(kip.config.queueVerificationToken)


  // verify the request
  if (_.get(req, 'body.verificationToken') !== kip.config.queueVerificationToken) {
    logging.error('bad verification token in /incoming')
    res.status(504)
    return res.end()
  }

  if (!_.get(req, 'body.message')) {
    logging.error('no body.message in /incoming')
    res.status(500)
    return res.end()
  }

  logging.debug('sending', req.body.message)
  queue.publish('incoming', req.body.message)
  res.status(200)
  res.end()
})

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
