var refresh = require('./refresh_team')
require('kip')
var co = require('co')

co(function *() {
  var teams = yield db.Slackbots.find({}).select('team_id').exec()
  for (t of teams) {
    kip.debug(t.team_id)
    yield refresh(t.team_id)
  }
}).catch(console.error.bind(console))

