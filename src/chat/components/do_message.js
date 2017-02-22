var co = require('co')
require('../../kip')
var request = require('request-promise')

//
// Sends a message to the slack webserver for processing
// returns a promise
//
function doMessage(msg) {
  logging.debug('sending message', msg.toObject())
  return co(function * () {
    yield msg.save()
    var payload = {
      verificationToken: kip.config.queueVerificationToken,
      message: msg.toObject()
    }

    logging.debug('token', kip.config.queueVerificationToken)

    logging.debug('sending message to', kip.config.slack.internal_host)
    yield request({
      uri: kip.config.slack.internal_host + '/incoming',
      method: 'POST',
      body: payload,
      json: true
    })
  })
}

module.exports = doMessage

