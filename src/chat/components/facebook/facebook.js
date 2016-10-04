// ┼┼┼┼┼┼┼┼┼┼┼████┼┼┼┼┼┼┼
// ████████████████████┼┼
// ██████████████████████
// ┼┼┼┼┼┼┼┼┼┼┼████┼┼┼████
// ┼┼┼┼┼┼┼┼┼┼┼████┼┼┼┼███
// ┼███████┼┼┼┼┼┼┼┼┼┼┼███
// ████████┼┼┼████┼┼┼┼┼┼┼
// ███┼┼┼██┼┼┼┼███┼┼┼┼┼┼┼
// ┼██┼┼┼██┼┼┼████┼┼┼┼┼┼┼
// ┼██████████████┼┼┼┼┼┼┼
// ██████████████┼┼┼┼┼┼┼┼
// ███┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼
// ┼┼┼██████████┼┼┼┼┼┼┼┼┼
// ┼█████████████┼┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼████┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼┼███┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼┼███┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼████┼┼┼┼┼┼┼
// ┼┼┼┼┼██████┼┼┼┼┼┼┼┼┼┼┼
// ┼█████████████┼┼┼┼┼┼┼┼
// ┼██████████████┼┼┼┼┼┼┼
// ████┼┼┼██┼┼┼███┼┼┼┼┼┼┼
// ███┼┼┼┼██┼┼┼███┼┼┼┼┼┼┼
// ████┼┼┼████████┼┼┼┼┼┼┼
// ████┼┼████████┼┼┼┼┼┼┼┼
// ┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼
// █████████████████████┼
// ██████████████████████
// ████┼┼┼┼┼┼┼████┼┼┼┼┼┼┼
// ███┼┼┼┼┼┼┼┼┼███┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼████┼┼┼┼┼┼┼
// ┼██████████████┼┼┼┼┼┼┼
// ┼┼████████████┼┼┼┼┼┼┼┼
// ┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼
// ┼┼████████████┼┼┼┼┼┼┼┼
// ┼██████████████┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼┼███┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼┼███┼┼┼┼┼┼┼
// █████┼┼┼┼┼█████┼┼┼┼┼┼┼
// ┼█████████████┼┼┼┼┼┼┼┼
// ┼┼┼┼████████┼┼┼┼┼┼┼┼┼┼
// ┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼
// ┼┼┼██████████┼┼┼┼┼┼┼┼┼
// █████████████┼┼┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼████┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼┼███┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼████┼┼┼┼┼┼┼
// ┼██████████████┼┼┼┼┼┼┼
// ┼┼███████████┼┼┼┼┼┼┼┼┼
// ┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼█┼
// █████████████████████┼
// ██████████████████████
// ┼┼┼┼┼┼┼██┼┼┼┼┼┼┼┼┼┼┼┼┼
// ┼┼┼┼████████┼┼┼┼┼┼┼┼┼┼
// ┼██████████████┼┼┼┼┼┼┼
// █████┼┼┼┼┼┼████┼┼┼┼┼┼┼
// ██┼┼┼┼┼┼┼┼┼┼┼██┼┼┼┼┼┼┼

require('kip')

var co = require('co')
var queue = require('../queue-mongo')
var db = require('../../../db')
var _ = require('lodash')
var http = require('http')
var request = require('request')
var async = require('async')
var bodyParser = require('body-parser')
var busboy = require('connect-busboy')
var fs = require('fs')
// set env vars
var config = require('../../../config')
var express = require('express')
var app = express()
var server = require('http').createServer(app)
var keyfile = process.env.NODE_ENV === 'production' ? __dirname + '/facebook-prod.pfx' : __dirname + '/facebook-dev.pfx'
var httpsServer = require('https').createServer({
  pfx: fs.readFileSync(keyfile)
}, app)
var search_results = require('./search_results')
var focus = require('./focus')
var quick_reply = require('./quick_reply')
var emojiText = require('emoji-text') // convert emoji to text
var kipcart = require('../cart')
var process_image = require('../process')
var process_emoji = require('../process_emoji').search
var Chatuser = db.Chatuser
var fbtoken
var next = require('co-next')
var fb_utility = require('./fb_utility')
var handle_postback = require('./postback')
var send_results = require('./send_results')
var send_text = require('./send_text')
var send_focus = require('./send_focus')
var send_cart = require('./send_cart')
var item_add = require('./item_add')

if (process.env.NODE_ENV === 'development_alyx') {
  fbtoken = 'EAAEkPTERbfgBACRwymE64dZCRxlQ035ZBvg2ZCATLkuZB8YF4wOQBfD2M4DvUwJ52ZBIEgo43hi4LrVu7bxA9pgpZCpTi8GtIhpMETuGrxhXFb1BYjJ0EXeWEgTd6ugHe7ZAIIgSKWfVHoETvKJNujMfFqGU8AK4sWVhQuJJjhEvgZDZD'
}
else if (process.env.NODE_ENV === 'development_mitsu') {
  fbtoken = 'EAAas9IZAQHr8BANn6pvRe0N1Dbw6kbs1N9cQke6jhKoYP5xFdU4kAOryfoZB3p07lO1yS3XZBJTN6IBA0wz54II3nwxYf0vb6ZC6RqukW00ndvmuoJXxXzwnJjcJrlvpdOonPmGKiPeko78MHl2UKiHEUjDWo2pj6twp5fLKTgZDZD'
// fbtoken = 'EAAas9IZAQHr8BACZCHfo63TPh5Wo6N8uJTSQnRcBBe0OTMPDzDzJZAYJ2ChhUpIJfLr913Bq94MMZC4dIMpjVeqc2x39OcBY7NNGwvO4ZCErrAY9y8QtFJdfYhS9OT1QMhZArpCQZA2pz8OZAeS0o6Wix1Iea6BHX4kZD'
}
else if (process.env.NODE_ENV === 'development') {
  fbtoken = 'EAAYxvFCWrC8BAGWxNWMD1YPi3e3Ps4ZCUOukkcFcbTBEfUwiciklUbfRZCsUPJFZCxnTHTQJZC9WrYQVAZCAJPrg0miP62NDOAImBpOLyr7gpw6EspvKfo0iVJuhwZBdxevA6VQBK2X1HfQemCLGyC4hMbrF4tmRvrluSApFuZAnwZDZD'
} else if (process.env.NODE_ENV === 'development_nlp') {
  fbtoken = 'EAAMhCmQMAyQBAGEYDWOlZA9dSmL64h5vKqIjzZBdUbZBUjsLDXrdt17psccaZB7t1YwnBV78qyOMua3vZBDJwN1sV7mdbiWpxhfBZBGoEfOQPOk3QKmc3q8FSfsaH6QMYFArHIf7rlRSRcn1XYElHj0wuvYKiUH3mwvEqnOQWHrwZDZD'
}
else if (process.env.NODE_ENV === 'production') {
  fbtoken = 'EAAT6cw81jgoBAEb3NE2m3DNCc6ZAEs5ZBQcUxu3YzzprsBmkXayoZCJgz8orhGT4phLkz008gsH7sDzDej6Jj6mK6F9pFa7TPoHX6fAqWMpU1KTuIZAiUMMVgYzIh6bQsOotC7xD80a8GpLrFUTboZBADucyTs8Mq5aUlzdmuiwZDZD'
}

// temp. needs to be story in DB
var fb_memory = {}

app.use(express.static(__dirname + '/static'))
app.get('/healthcheck', function (req, res) {
  res.send('💬 🌏')
})
// parse incoming body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
server.listen(8000, function (e) {
  if (e) {
    logging.error(e)
  }
  logging.debug('chat app listening on port 8000 🌏 💬')
})

httpsServer.listen(4343, function (e) {
  if (kip.err(e)) return
  logging.debug('chat app listening on https port 4343')
})

app.get('/facebook', function (req, res) {
  if (req.query['hub.verify_token'] === fbtoken) {
    res.send(req.query['hub.challenge'])
  } else {
    logging.debug('Error, wrong validation token')
    res.send('Error, wrong validation token')
  }
})

//
//   -Back button state cache- *currently not in use

backCache = 0

app.post('/facebook', next(function * (req, res, next) {
  // filter out echo we don't want to process.
  if (_.get(req, 'body.entry[0].messaging[0].message.is_echo')) {
    kip.debug('not processing echo message')
    return res.sendStatus(200)
  }
  // need to send this right away, then process the rest
  res.sendStatus(200)
  messaging_events = req.body.entry[0].messaging
  if (!messaging_events) {
    return logging.debug('facebook.js messaging events missing:  ', JSON.stringify(req.body.entry[0]))
  }
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    console.log('\n\n\n\n\nLE EVENT : ',event,'\n\n\n\n\n');

    sender = event.sender.id
    // Set the persistent menu for user
    fb_utility.set_menu(sender, fbtoken)
    var recipient = req.body.entry[0].messaging[i].recipient.id.toString()

    // moving from postback temporarily
    if (_.get(event, 'message.quick_reply.payload')) {
      var postback = JSON.parse(event.message.quick_reply.payload)
      if (postback.action === 'item.add') {
        outgoing = {}
        logging.debug('item_add in postback', postback)
        if (Object.keys(postback.remaining_data).length > 0) { // i
          logging.debug('need to send variety again')
          return yield item_add.send_variety_again(postback, sender, outgoing, fbtoken)
        }
        else if (Object.keys(postback.remaining_data).length == 0) {
          logging.debug('done with option picking')
          var data = {
            action: 'item.add',
            postback: postback,
            sender: sender
          }
          var message = new db.Message({
            incoming: true,
            thread_id: 'facebook_' + sender.toString(),
            original_text: text.indexOf(' but ') == -1 ? '1 but ' + text : text,
            user_id: 'facebook_' + sender.toString(),
            origin: 'facebook',
            source: {
              'origin': 'facebook',
              'channel': sender.toString(),
              'org': 'facebook_' + sender.toString(),
              'id': 'facebook_' + sender.toString(),
              'user': sender.toString()
            },
            ts: Date.now()
          })
          logging.debug('pushed to incoming')
          queue.publish('incoming', data, ['facebook', sender.toString(), message.ts].join('.'))
        }
      }
    }

    // gross, in-memory modes and story tracker
    if (!fb_memory[sender]) {
      fb_memory[sender] = {
        mode: 'shopping',
        story_pointer: 0
      }
    }
    kip.debug('\n\n\n🤖 fb_memory is : ', fb_memory[sender], '\n\n\n')
    // Process onboarding quiz
    if (event.message && event.message.text && _.get(fb_memory, '[sender].mode' == 'onboarding')) {
      // Exit quiz if user doesnt want to take it
      fb_memory[sender].exit_count = (fb_memory[sender].exit_count < 2) ? ++fb_memory[sender].exit_count : 0
      logging.debug('incremented exit_count: ', fb_memory[sender].exit_count)
      if (fb_memory[sender].exit_count >= 1) {
        fb_memory[sender] = {
          mode: 'shopping',
          story_pointer: 0
        }
        fb_utility.send_suggestions_card(sender, fbtoken)
        return
      } else {
        var x = {text: 'Please answer the question above this message, thanks 😊'}
        fb_utility.send_card(x, sender, fbtoken)
        return
      }
      res.sendStatus(200)
    }

    if (event.message) {
      fb_utility.send_typing_indicator(sender, fbtoken)
    }

    //  QUICK REPLY BUTTON PROCESSING
    if (event.message && event.message.quick_reply && event.message.quick_reply.payload) {
      yield quick_reply(event, sender, fb_memory, fbtoken, recipient)
    }
    // REGULAR INCOMING TEXT MESSAGES
    else if (event.message && event.message.text) {
      text = event.message.text
      // lel wtf
      if (text == 'illii.illelli') return
      // converting some emojis into more "product-y" results
      process_emoji(text, function (res) {
        text = res
      })
      // converting other emojis into text
      text = emojiText.convert(text, {delimiter: ' '})
      // emoji parser doesnt recognize robot emoji wtf
      if (text.indexOf('🤖') > -1) text = text.replace('🤖', 'robot')
      // Check if user is still in modify mode
      if (fb_memory[sender].mode == 'modify') {
        // Reset mode back to shopping
        fb_memory[sender].mode = 'shopping'
        // Send modify query instead of the usual
        var message = new db.Message({
          incoming: true,
          thread_id: 'facebook_' + sender.toString(),
          original_text: text.indexOf(' but ') == -1 ? '1 but ' + text : text,
          user_id: 'facebook_' + sender.toString(),
          origin: 'facebook',
          source: {
            'origin': 'facebook',
            'channel': sender.toString(),
            'org': 'facebook_' + sender.toString(),
            'id': 'facebook_' + sender.toString(),
            'user': sender.toString()
          },
          ts: Date.now()
        })
        // clean up the text
        message.text = message.original_text.trim() // remove extra spaces on edges of string
        // queue it up for processing
        message.save().then(() => {
          queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
        })
      }else {
        logging.debug(JSON.stringify(req.body))
        var message = new db.Message({
          incoming: true,
          thread_id: 'facebook_' + sender.toString(),
          original_text: text,
          user_id: 'facebook_' + sender.toString(),
          origin: 'facebook',
          source: {
            'origin': 'facebook',
            'channel': sender.toString(),
            'org': 'facebook_' + sender.toString(),
            'id': 'facebook_' + sender.toString(),
            'user': sender.toString()
          },
          ts: Date.now()
        })
        // clean up the text
        message.text = message.original_text.trim() // remove extra spaces on edges of string
        // queue it up for processing
        message.save().then(() => {
          queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
        })
      }
    }
    // user sent image
    else if (!_.get(req.body.entry[0].messaging[i], 'message.sticker_id') && _.get(req.body.entry[0].messaging[i], 'message.attachments[0].type') == 'image') {
      var data = { file: {url_private: req.body.entry[0].messaging[i].message.attachments[0].payload.url}}
      process_image.imageSearch(data, '', function (res) {
        if (res && res.length > 0) {
          var message = new db.Message({
            incoming: true,
            thread_id: 'facebook_' + sender.toString(),
            original_text: res,
            user_id: 'facebook_' + sender.toString(),
            origin: 'facebook',
            source: {
              'origin': 'facebook',
              'channel': sender.toString(),
              'org': 'facebook_' + sender.toString(),
              'id': 'facebook_' + sender.toString(),
              'user': sender.toString()
            },
            ts: Date.now()
          })
          // clean up the text
          if (!message.original_text) return
          message.text = message.original_text.trim() // remove extra spaces on edges of string
          // queue it up for processing
          message.save().then(() => {
            queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
          })
        }
      })
    }
    // user sent sticker
    else if (_.get(req.body.entry[0].messaging[i], 'message.sticker_id') || _.get(req.body.entry[0].messaging[i], 'message.attachments')) {
      var img_array = [
        'http://kipthis.com/kip_stickers/kip1.png',
        'http://kipthis.com/kip_stickers/kip2.png',
        'http://kipthis.com/kip_stickers/kip3.png',
        'http://kipthis.com/kip_stickers/kip4.png',
        'http://kipthis.com/kip_stickers/kip5.png',
        'http://kipthis.com/kip_stickers/kip6.png',
        'http://kipthis.com/kip_stickers/kip7.png',
        'http://kipthis.com/kip_stickers/kip8.png',
        'http://kipthis.com/kip_stickers/kip9.png'
      ]

      var img_card = {
        'attachment': {
          'type': 'image',
          'payload': {
            'url': img_array[Math.floor(Math.random() * img_array.length)]
          }
        }
      }

      request({
        url: 'https://graph.facebook.com/v2.7/me/messages',
        qs: {
          access_token: fbtoken
        },
        method: 'POST',
        json: {
          recipient: {
            id: sender.toString()
          },
          message: img_card
        }
      }, function (err, res, body) {
        if (err) logging.error('post err ', err)
        logging.debug(body)
      })
    }
    // Handle postback responses here
    else if (event.postback) {
      logging.debug('theres a postback__')
      yield handle_postback(event, sender, fb_memory, fbtoken, recipient)
    }
  } // end of for loop
}))

//
// Inserting outgoing messages into outgoing reply logic queue
//
kip.debug('subscribing to outgoing.facebook')
queue.topic('outgoing.facebook').subscribe(outgoing => {
  try {
    var message = outgoing.data
    var return_data = {}
    co(function * () {
      if (message.mode === 'shopping' && message.action === 'results' && message.amazon.length > 0) {
        return_data = yield search_results(message)
        return yield send_results(message.source.channel, message.text, return_data, outgoing, fbtoken)
      }
      else if (message.mode === 'item.add') { // cant remember what topic it is, add later
        logging.debug('create variational menu')
        return yield item_add.send_variety_picker_initial(message, message.source.source.channel, outgoing, fbtoken)
      }
      else if (message.mode === 'shopping' && message.action === 'focus' && message.focus) {
        return_data = yield focus(message)
        return yield send_focus(message.source.channel, message.text, return_data, outgoing, fbtoken)
      }
      else if (message.mode === 'cart' && message.action === 'view') {
        return yield send_cart(message.source.channel, message.text, outgoing, fbtoken)
      }
      else if (message.text && message.text.indexOf('_debug nlp_') == -1) {
        return yield send_text(message.source.channel, message.text, outgoing, fbtoken)
      }
      outgoing.ack()
    }).then(() => {
      outgoing.ack()
    }).catch(e => {
      logging.debug(e)
      outgoing.ack()
    })
  } catch (e ) {
    kip.err(e)
  }
})
