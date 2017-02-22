require('../../../kip')
var utils = require("./utils")
var co = require('co')


co(function * () {
  var slackbots = yield db.slackbots.find({
    'meta.dateAdded': {$gt: new Date('2017-02-01')}
  }).exec()

  console.log(`found ${slackbots.length} slackbots to update`)

  var i = 0;

  while (i < slackbots.length) {
    console.log(`refreshing team ${slackbots[i].team_name}`)
    var members = yield utils.getTeamMembers(slackbots[i])
    console.log(`refreshed ${members.length} members`)
    i++
  }

  console.log('successfully refreshed team DMs')
  process.exit(0)

}).catch(e => {
  console.error('error refreshing team')
  console.error(e);
})
