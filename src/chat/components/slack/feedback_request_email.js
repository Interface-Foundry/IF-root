require('../../../kip')
var _ = require('lodash')

var co = require('co')

function sendFeedbackRequestEmail(team_id) {
  logging.debug('sending feedback request email to team', team_id)
  return co(function * () {
    var team = yield db.Slackbots.findOne({
      team_id: team_id
    }).exec()

    logging.debug('found corresponding team,', team.team_name)

    // Find a person to send an email to
    var userIdsToTry = _.get(team, 'meta.office_assistants', []).concat([team.meta.addedBy])

    // Loop through the ids until we find one that is legit
    var user
    var i = userIdsToTry.length
    while (!user && i > 0) {
      user = yield getUser(userIdsToTry[i])
      i--
    }

    if (!user) {
      logging.error('Could not identify a user to send a feedback request email to, team ' + team.team_id)
      return
    }

    // Made it here, so we can send an email to the user now
    console.log(user.toObject())

  })
}

//
// Helper function to get a user and make sure we have their email address
//
function * getUser (id) {
  var user = yield db.Chatusers.findOne({
    id: id
  }).exec()

  if (!_.get(user, 'profile.email')) {
    return false
  }

  return user
}

module.exports = sendFeedbackRequestEmail

//
// testing, email peter's test team
//
if (!module.parent) {
  co(function * () {
    var team = yield db.Slackbots.findOne({
      team_name: 'Mars Vacation Condos'
    }).exec()
    
    yield module.exports(team.team_id)

    process.exit(0)
  }).catch(e => {
    logging.error(e)
  })
}

