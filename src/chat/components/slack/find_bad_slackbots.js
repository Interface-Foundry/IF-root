require('../../../kip')
var co = require('co')
var request = require('request-promise')

function preen () {
  logging.info('testing auth for all the bots in the database')
  return co(function * () {
    var enabledBots = yield db.slackbots.find({'meta.deleted': {$ne: true}}).exec()
    logging.info('found', enabledBots.length, 'bots in the system')
    for (var i = 0; i < enabledBots.length; i++) {
      yield checkBot(enabledBots[i])
    }
  })
}

function * checkBot (bot) {
  logging.debug('testing', bot.team_name.cyan)
  try {
    var res = yield request('https://slack.com/api/api.test?token=' + bot.bot.bot_access_token)
  } catch (e) {
    logging.info(bot.team_name.red, 'bot is bad (to the bone)'.red)
    logging.info(e)
  }

  res = JSON.parse(res)

  if (!res.ok) {
    logging.info(bot.team_name.red, 'bot is bad (to the bone)'.red)
    logging.info('marking slackbot as deleted')
    bot.meta.deleted = true
    yield bot.save()
  }
}

module.exports = {
  checkBot,
  preen
}

if (!module.parent) {
  preen().then(process.exit)
}
