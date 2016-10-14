var fs = require('fs')
var kip = require('kip')
//
// "Actions" are what slack calls buttons
//
var queue = require('../queue-mongo')
require('kip')
var refresh_team = require('../refresh_team')
var express = require('express')
var co = require('co')
var app = express()
var bodyParser = require('body-parser')
var cart = require('./cart')
var kipcart = require('../cart')
var _ = require('lodash')
app.use(express.static('public'))
app.use(bodyParser.urlencoded())
app.use(bodyParser.json())
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
  kip.debug('\nwebserver.js line 28 simple_action_handler action: ', action, '\n\n\n')
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
    case 'more':
      return 'more'

    //
      // Item info buttons
      //

    //
    // Other buttons
    //
    // case 'home':
    //   return 'home'
    case 'delivery_btn':
      return 'delivery'
    case 'pickup_btn':
      return 'pickup'
    case 'address_confirm_btn':
      return 'address_confirm_btn'
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
app.post('/slackaction', function (req, res) {
  kip.debug('incoming action')
  if (req.body && req.body.payload) {
    var message
    var parsedIn = JSON.parse(req.body.payload)
    var action = parsedIn.actions[0]
    kip.debug(action.name.cyan, action.value.yellow)
    // // check the verification token in production
    // if (process.env.NODE_ENV === 'production' && parsedIn.token !== kip.config.slack.verification_token) {
    //   kip.error('Invalid verification token')
    //   return res.sendStatus(403)
    // }
    var action = parsedIn.actions[0]
    kip.debug(action.name.cyan, action.value.yellow)
    // for things that i'm just going to parse for
    var simple_command = simple_action_handler(action)
    var buttonData = buttonCommand(action)
    if (simple_command) {
      kip.debug('passing through button click as a regular text chat', simple_command.cyan)
      var message = new db.Message({
        incoming: true,
        thread_id: parsedIn.channel.id,
        original_text: simple_command,
        text: simple_command,
        user_id: parsedIn.user.id,
        origin: 'slack',
        source: parsedIn
      })
      // inject source.team and source.user because fuck the fuck out of slack message formats
      message.source.team = message.source.team.id
      message.source.user = message.source.user.id
      message.source.channel = message.source.channel.id
      if (simple_command == 'address_confirm_btn') {
        message.mode = 'address'
        message.action = 'validate'
        var location
        try {
          location = JSON.parse(message.source.original_message.attachments[0].actions[0].value)
        } catch(err) {
          kip.error('error parsing out location: webserver.js line 103')
        }
        message.source.location = location
        // message.source.location =
        message.save().then(() => {
          queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
        })
      }
      else if (simple_command.indexOf('address.') > -1) {
        message.mode = simple_command.split('.')[0]
        message.action = simple_command.split('.')[1]
        kip.debug('\n\n\n\n webserver.js 100 : mode --> ', message.mode, ' action -->', message.action, '\n\n\n\n')
      }

      message.save().then(() => {
        queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
      })
    }
    else if (buttonData) {
      message = new db.Message({
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
    }else {
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
          var index
          var priceDifference = 0
          var updatedMessage = parsedIn.original_message
          updatedMessage.attachments = updatedMessage.attachments.reduce((all, a, i) => {
            if (a.callback_id === parsedIn.callback_id) {
              var quantity = parseInt(a.text.match(/\d+$/)[0])
              priceDifference = quantity * parseFloat(a.text.match(/\$[\d.]+/)[0].substr(1))
              index = i
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
})

var cookieParser = require('cookie-parser')
var uuid = require('uuid')
// var base = process.env.NODE_ENV !== 'production' ? __dirname + '/static' : __dirname + '/dist'
// var defaultPage = process.env.NODE_ENV !== 'production' ? __dirname + '/simpleSearch.html' : __dirname + '/dist/simpleSearch.html'
var request = require('request')

app.get('/authorize', function (req, res) {
  console.log('button click')
  res.redirect('https://slack.com/oauth/authorize?scope=commands+bot+users:read&client_id=' + kip.config.slack.client_id)
})

app.get('/newslack', function (req, res) {
  console.log('new slack integration request')
  // TODO post in our slack #dev channel
  // TODO check that "state" property matches
  res.redirect('/thanks.html')

  if (!req.query.code) {
    console.error(new Date())
    console.error('no code in the callback url, cannot proceed with new slack integration')
    return
  }

  var body = {
    code: req.query.code,
    redirect_uri: kip.config.slack.redirect_uri
  }

  request({
    url: 'https://' + kip.config.slack.client_id + ':' + kip.config.slack.client_secret + '@slack.com/api/oauth.access',
    method: 'POST',
    form: body
  }, function (e, r, b) {
    if (e) {
      console.log('error connecting to slack api')
      console.log(e)
    }
    if (typeof b === 'string') {
      b = JSON.parse(b)
    }
    if (!b.ok) {
      console.error('error connecting with slack, ok = false')
      console.error('body was', body)
      console.error('response was', b)
      return
    } else if (!b.access_token || !b.scope) {
      console.error('error connecting with slack, missing prop')
      console.error('body was', body)
      console.error('response was', b)
      return
    }

    console.log('got positive response from slack')
    console.log('body was', body)
    console.log('response was', b)
    var bot = new db.Slackbot(b)
    db.Slackbots.findOne({
      team_id: b.team_id,
      deleted: {
        $ne: true
      }
    }, function (e, old_bot) {
      if (e) {
        kip.error(e)
      }

      if (old_bot) {
        kip.debug('already have a bot for this team', b.team_id)
        kip.debug('updating i guess')
        _.merge(old_bot, b)
        old_bot.save(e => {
          kip.err(e)
          refresh_team(old_bot.team_id)
        })
      } else {
        bot.save(function (e) {
          kip.err(e)
          refresh_team(bot.team_id)
        })
      }
    })
  })
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

module.exports = {
  listen: listen
}
