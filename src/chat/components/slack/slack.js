/*
SLACKSLACKSLACKSLACKSLACKSLACKSLACKSLAh/-.    .-+ySLACKSLACKSLACKSLACKSLACKSLACK
SLACKSLACKSLACKSLACKSLACKSLACKSLACKNs.     ``     .sSLACKSLACKSLACKSLACKSLACKSLA
SLACKSLACKSLACKSLACKSLACKSLACKSLACd/   `-:////:-`   :hSLACKSLACKSLACKSLACKSLACKM
SLACKSLACKSLACKSLANSLACKSLACKSLACK/   .//////////-   /dSLACKSLSLACKSLACKSLACKSLA
SLACKSLACKSLAdo/:-:--+ymNSLACKSLAh`  `////////////.   odhs/--.-:+sdSLACKSLACKSLA
SLACKSLACKNs-          `:oSLACKSLh`  `/////////////`  ``          `-hNSLACKSLACK
SLACKSLACh:   `-//+//-`   :hSLACKd/   -////////////-    `..-:::-.`   :dSLACKSLAC
SLACKSLAy-   :oooooooo+:   -hSLACKy.   :///////////+:-:://///////:.   :dSLACKSLA
SLACKSLA+   :ooooooooooo:   +mNmhy+-   `/////+oosssss//////////////.   +SLACKSLA
SLACKSLd:   /oooooooooooo.  `:-`      `./ossssssssssso/////////////-   +SLACKSLA
SLACKSLA+   -oooooooooooo+      `..-::///sssssssssssss+///////////:   .ySLACKSLA
SLACKSLAd:   /oooooooooooo/..-:://///////+sssssssssssss////////::.   .sSLACKSLAC
SLACKSLmd+`  `+oooooooossss+//////////////osssssssssssso/::-..`    .+dSLACKSLACK
SLAms/-.      -oosssssssssss///////////////ssssssssssoo+-      `./odSLACKSLACKSL
Mmo.    ``.-::/osssssssssssso//////////////+sssso++//////`   /ydNSLACKSLACKSLACK
h:   `-:////////sssssssssssss+//////////::-.:////////////:   :dSLACKSLACKSLACKSL
/   -///////////+sssssssssssss////::-.``     :////////////.   /SLACKSLACKSLACKSL
   `/////////////ossssssssssss+..`           `/////////////`  `++:.`    `.:sdSLA
   `//////////////ssssssssooooo.              -////////////:        `..`    .+mM
/   -////////////:/sooooooooooo+`              :////////////. `.:/ossssss+-   -y
d-   `-::::::-.`   /oooooooooooo:              `/////////+ossssssssssssssss+   /
SLo.               `+oooooooooooo.              -//+ossyhhhhhyssssssssssssss-
MSLAh+--.`..-:oys   -oooooooooooo+`          .-/+yhhhhhhhhhhhhysssssssssssss.  `
SLACKSLmdmmmNSLAd/   /oooooooooooo:    .-/+osssssyhhhhhhhhhhhhhysssssssssss:   /
SLACKSLACKSLACKSLy.  `+oooooooooooy++ossssssssssssyhhhhhhhhhhhhyssssssso+-`   /d
SLACKSLACKSLACdhs+-   -ooooosyhdmmmmyssssssssssssssyhhhhhhhhhhhhyo+/-.     `:yNM
SLACKSLACKMms-.      `-shdmmmmmmmmmmdssssssssssssssyhhhhhhhysso+/`    `.-/sdSLAC
SLACKSLACKs`   `.:/osssymmmmmmmmmmmmmhssssssssssssssyyyso+///////:   :sSLACKSLAC
SLACKSLAd+   .+ssssssssshmmmmmmmmmmmmmyssssssssso/:-`:////////////.   oNSLACKSLA
SLACKSLAo   -ssssssssssssdmmmmmmmmmmmmdssso+:-`      `/////////////`  .ySLACKSLA
SLACKSLd/   +ssssssssssssymmmmmmmmmmdhy/.      `.::   -////////////-   +SLACKSLA
SLACKSLA+   /ssssssssssssshmmmddhysoooo+`  `/shmNMh-   :///////////.  `sSLACKSLA
SLACKSLAy-   /sssssssssss+/osoooooooooo+/   :dSLACKo`  `://///////.   +SLACKSLAC
SLACKSLACy-   `:/+o+/:.`   `+oooooooooooo.   sSLACKMs.   `-::::-.    +SLACKSLACK
SLACKSLACKms-           `   .oooooooooooo+   /hSLACKMdo-          `:hSLACKSLACKM
SLACKSLACKSLAds+:---:+ydy/   /ooooooooooo+   /hSLACKMSLAho:--:--/ySLACKSLACKSLAC
SLACKSLACKSLACKSLACKSLACKy.  `/ooooooooo+.   oNSLACKSLACKMSLANSLACKSLACKSLACKSLA
SLACKSLACKSLACKSLACKSLACKMo.   -/+oooo+:`  `+NSLACKSLACKSLACKSLACKSLACKSLACKSLAC
SLACKSLACKSLACKSLACKSLACKSLdo.    ```    `-hNSLACKSLACKSLACKSLACKSLACKSLACKSLACK
SLACKSLACKSLACKSLACKSLACKSLACdo/..   `--+hNSLACKSLACKSLACKSLACKSLACKSLACKSLACKSL
*/

var slack = process.env.NODE_ENV === 'test' ? require('./mock_slack') : require('@slack/client')
var co = require('co')
var _ = require('lodash')
var kip = require('kip')
var queue = require('../queue-mongo')
var image_search = require('../image_search')
var search_results = require('./search_results')
var focus = require('./focus')
var cart = require('./cart')
// var actions = require('./actions'); --> this runs an extra service not sure what for
var slackConnections = {}
var webserver = require('./webserver')

//
// slackbots
//
function * start () {
  if (process.env.NODE_ENV === 'test') {
    console.log('starting mock slack server')
    yield slack.run_chat_server()
  }

  var slackbots = yield db.Slackbots.find({
    'meta.deleted': {
      $ne: true
    }
  }).exec()

  kip.log('found', slackbots.length, 'slackbots')

  // Just need the RTM client to listen for messages
  slackbots.map((slackbot) => {
    var rtm = new slack.RtmClient(slackbot.bot.bot_access_token || '')
    rtm.start()
    var web = new slack.WebClient(slackbot.bot.bot_access_token || '')
    slackConnections[slackbot.team_id] = {
      rtm: rtm,
      web: web,
      slackbot: slackbot
    }

    // TODO figure out how to tell when auth is invalid
    // right now the library just console.log's a message and I can't figure out
    // how to intercept that event.
    // rtm.on(slack.CLIENT_EVENTS.RTM.INVALID_AUTH, (err) => {
    //   kip.log('invalid auth', slackbot.team_id, slackbot.team_name)
    // })

    rtm.on(slack.CLIENT_EVENTS.RTM.AUTHENTICATED, (startData) => {
      kip.log('loaded slack team', slackbot.team_id, slackbot.team_name)
    })

    rtm.on(slack.CLIENT_EVENTS.DISCONNECT, (reason) => {
      kip.log('slack client disconnected', slackbot.team_id)
      kip.log(reason); // is this even a thing?
    })

    //
    // Handle incoming slack messages.  Slack-specific pre-processing
    //
    rtm.on(slack.RTM_EVENTS.MESSAGE, (data) => {

      kip.debug('got slack message sent from user', data.user, 'on channel', data.channel)
      // kip.debug(data)

      var message = new db.Message({
        incoming: true,
        thread_id: data.channel,
        original_text: data.text,
        user_id: data.user,
        origin: 'slack',
        source: data
      })
      // kip.debug('\n\n\n\n\nYOLO : '.)
      // don't talk to yourself
      if (data.user === slackbot.bot.bot_user_id || data.subtype === 'bot_message' || _.get(data, 'username', '').toLowerCase().indexOf('kip') === 0) {
        kip.debug("don't talk to yourself: ")
        return; // drop the message before saving.
      }

      // other random things
      if (data.type !== 'message' || (data.hidden === true) || data.subtype === 'channel_join' || data.subtype === 'channel_leave') { // settings.name = kip's slack username
        kip.debug('will not handle this message')
        return
      }

      //
      // 🖼 image search
      //
      if (data.subtype === 'file_share' && ['png', 'jpg', 'gif', 'jpeg', 'sgv'].indexOf(data.file.filetype.toLowerCase()) >= 0) {
        return image_search(data.file.url_private, slackbot.bot.bot_access_token, function (res) {
          message.text = res
          message.save().then(() => {
            queue.publish('incoming', message, ['slack', data.channel, data.ts].join('.'))
          })
        })
      }
      // clean up the text
      message.text = data.text.replace(/(<([^>]+)>)/ig, ''); // remove <user.id> tag
      if (message.text.charAt(0) == ':') {
        message.text = message.text.substr(1); // remove : from beginning of string
      }
      message.text = message.text.trim() // remove extra spaces on edges of string

      // queue it up for processing
      message.save().then(() => {
        queue.publish('incoming', message, ['slack', data.channel, data.ts].join('.'))
      })
    })
  })
}

//
// Mechanism for responding to messages
//
kip.debug('subscribing to outgoing.slack hopefully')
queue.topic('outgoing.slack').subscribe(outgoing => {

  try {
    // console.log(outgoing)
    var message = outgoing.data
    debugger
    var team = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null)
    var team = _.get(message, 'source.team')
    var bot = slackConnections[team]
    if (typeof bot === 'undefined') {
      logging.error('error with the bot thing, message:', message)
      kip.debug('\n\nslack.js line 174, message: ', message, '\n\n')
      throw new Error('rtm client not registered for slack team ', message.source.team, slackConnections)
    }

    var msgData = {
      icon_url: 'http://kipthis.com/img/kip-icon.png',
      username: 'Kip'
    }

    co(function * () {
      if (message.action === 'typing') {
        return bot.rtm.sendMessage('typing...', message.source.channel, () => {
          outgoing.ack()
        })
      }
      // console.log('outgoing message', message)

      if (message.mode === 'food') {
        // day 24: discovered strange nesting bug.. was formerly message.reply.data or message.reply.. o_0
        var reply = message.reply.data ? message.reply.data : message.reply
        return bot.web.chat.postMessage(message.source.channel, message.reply.label, reply)
      }
      if (message.mode === 'address') {
        kip.debug('slack.js line 200 message: ', message)
        // day 24: discovered strange nesting bug.. was formerly message.reply.data or message.reply.. o_0
        var reply = message.reply.data ? message.reply.data : message.reply
        return bot.web.chat.postMessage(message.source.channel, message.reply.label, reply)
      }

      if (message.mode === 'shopping' && message.action === 'results' && message.amazon.length > 0) {
        msgData.attachments = yield search_results(message)
        kip.debug('\n\nslack.js line 197: message.mode = shopping, message.action = results, msgData: ', msgData, '\n\n')
        return bot.web.chat.postMessage(message.source.channel, message.text, msgData)
      }

      if (message.mode === 'shopping' && message.action === 'focus' && message.focus) {
        msgData.attachments = yield focus(message)
        return bot.web.chat.postMessage(message.source.channel, message.text, msgData)
      }

      if (message.mode === 'cart' && message.action === 'view') {
        msgData.attachments = yield cart(message, bot.slackbot, false)
        return bot.web.chat.postMessage(message.source.channel, message.text, msgData)
      }

      if (message.mode === 'home' && message.action === 'view') {
        msgData.attachments = message.client_res[0]
        kip.debug('\n\nslack.js line 212: message.mode = home, message.action = view, msgData: ', message, '\n\n')
        return bot.web.chat.postMessage(message.source.channel, message.text, msgData)
      }

      // bot.rtm.sendMessage(message.text, message.source.channel, () => {
      //   outgoing.ack()
      // })

      bot.web.chat.postMessage(message.source.channel, message.reply.label, message.reply.data)
      outgoing.ack()
    }).then(() => {
      outgoing.ack()
    }).catch(e => {
      console.log(e.stack)
      bot.rtm.sendMessage("I'm sorry I couldn't quite understand that", message.source.channel, () => {
        outgoing.ack()
      })
    })
  } catch (e) {
    kip.err(e)
  }
})

module.exports = {
  start: start
}

if (!module.parent) {
  co(start).catch((e) => {
    kip.error(e, 'error loading slackbots')
  })
}
