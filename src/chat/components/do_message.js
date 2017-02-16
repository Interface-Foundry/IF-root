var co = require('co')
require('kip')
var request = require('request-promise')

//
// Sends a message to the slack webserver for processing
// returns a promise
//
function doMessage(msg) {
  return co(function * () {
    var payload = {
      verificationToken: kip.config.queueVerificationToken,
      message: msg
    }
  })
}

module.exports = doMessage

