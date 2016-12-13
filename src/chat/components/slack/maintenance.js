//
// This server responds to all chats with "Kip is under maintenance right now, check back in a minute"
//

var kip = require('../../../kip')
var co = require('co')
var slack = require('@slack/client')
var _ = require('lodash')

function * start () {

    var slackbots = yield db.Slackbots.find({
      'meta.deleted': {
        $ne: true
      },
      'meta.mock': process.env.NODE_ENV === 'test' ? true : {$ne: true}
    }).exec()

    kip.log('found', slackbots.length, 'slackbots')

    slackbots.map(slackbot => {
      var rtm = new slack.RtmClient(slackbot.bot.bot_access_token || '')
      rtm.on(slack.RTM_EVENTS.MESSAGE, data => {

        kip.debug('got slack message sent from user', data.user, 'on channel', data.channel)

        // For channels that are not DM's, only respond if kip is called out by name
        if ('CG'.includes(data.channel[0])) {
          if (data.text.includes(slackbot.bot.bot_user_id)) {
            // strip out the bot user id, like "<@U13456> find me socks" -> "find me socks"
            var regex = new RegExp('<@' + slackbot.bot.bot_user_id + '>[:]*', 'g')
            data.text = data.text.replace(regex, '').trim()
          } else {
            // if not mentioned by name, do nothing
            return;
          }
        }

        // don't talk to yourself
        if (data.user === slackbot.bot.bot_user_id || data.subtype === 'bot_message' || _.get(data, 'username', '').toLowerCase().indexOf('kip') === 0) {
          kip.debug("don't talk to yourself: data: ",data);
          return; // drop the message before sa ving.
        }

        // other random things
        if (data.type !== 'message' || (data.hidden === true) || data.subtype === 'channel_join' || data.subtype === 'channel_leave') { // settings.name = kip's slack username
          kip.debug('\n\n\n will not handle this message, message: ', message, ' \n\n\n')
          return
        }

        rtm.sendMessage('Kip is under maintenance right now, check back in a minute :smile:', data.channel)
      })
      rtm.start()
    })
}

co(start).catch(e => {
  console.log('error starting server')
  console.log(e)
})
