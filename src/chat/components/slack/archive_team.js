require('../../../kip')
var co = require('co')

//
//
// This archives all of a team's stuff when they remove their chatbot
//
//


co(function * () {
  var team = yield db.Slackbots.findOne({}).exec()
  var archive = db.Archives.archive(team)
  console.log(archive.toObject())
}).catch(e => {
  logging.error('error archiving team', e)
})

