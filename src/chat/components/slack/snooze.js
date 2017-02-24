var agenda = require('agenda')


// this allows you to snooze any message for later
function * snoose(message) {
  console.log(message.toObject())
}
