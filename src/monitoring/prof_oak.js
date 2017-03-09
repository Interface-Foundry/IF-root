'use strict'
// Just make sure we have some logging
if (!global.logging) {
  logging = {
    info: console.log.bind(console)
  }
}
require('colors')
var slack = require('@slack/client')
var token = 'xoxb-50573012182-9gJAJ1IBPDRjM3xrfcIFdTO1'
var web = new slack.WebClient(token)

// G06BTTZGW is back-end devs (D1GGV0CMU is peter <-> prof oak)
var channel = process.env.NODE_ENV === 'production' ? 'G06BTTZGW' : 'D1GGV0CMU'

function say (text) {
  var data = {
    username: 'Professor Oak',
    icon_url: 'https://avatars.slack-edge.com/2016-06-13/50574232438_554dfff64aed8d91939e_72.jpg'
  }
  web.chat.postMessage(channel, text, data)
}

// class to allow posting to specific channels
class Professor {
  constructor (channel) {
    this.channel = channel
    this.data = {
      username: 'Professor Oak',
      icon_url: 'https://avatars.slack-edge.com/2016-06-13/50574232438_554dfff64aed8d91939e_72.jpg'
    }
  }
  say (text) {
    logging.info(`Professor: ${text} in ${this.channel}`.magenta)
    web.chat.postMessage(this.channel, text, this.data)
  }
}

module.exports = {
  Professor: Professor,
  say: say
}

if (!module.parent) {
  module.exports.say("Hi I'm Professor Oak.")
}
