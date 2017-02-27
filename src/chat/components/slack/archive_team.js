require('../../../kip')
var co = require('co')

//
//
// This archives all of a team's stuff when they remove their chatbot
//
//


co(function * () {
  var team = yield db.Slackbots.findOne({}).exec()
  console.log(team.team_id)
  var archive = yield db.Archives.archive(team)
  console.log(archive.toObject())
  var unarchivedTeam = yield db.Archives.unarchive(archive)

}).catch(e => {
  logging.error('error archiving team', e)
})

