require('../../../kip')
var utils = require("./utils")
var co = require('co')


var TEAM_ID = 'T02PN3B25'

co(function * () {
  var slackbot = yield db.slackbots.findOne({team_id: TEAM_ID}).exec()
  if (!slackbot) {
    return console.error('No slackbot found for team_id: ' + TEAM_ID)
  }
  console.log(`found team ${TEAM_ID}, ${slackbot.team_name}`)
  var members = yield utils.getTeamMembers(slackbot)
  console.log(`refreshed ${members.length} team members`)
}).catch(e => {
  console.error('error refreshing team')
  console.error(e);
})
