require('../../../kip')
var co = require('co')

/**
 * Archive all of a team's stuff to the archive collection
 * @module
 * @param  {}    team_id team id string for the team to archive
 * @return {Promise}         Promise retuning nothing after operation completes
 */
function archiveTeam (team_id) {
  return co(function * () {
    var team = yield db.Slackbots.findOne({team_id: team_id}).exec()

    if (!team) {
      logging.debug(`team ${team_id} does not exist`)
      return
    }

    logging.debug('searching for this team\'s data')

    // Get the chatusers, deliveries, items, and carts
    var users = yield db.Chatusers.find({team_id: team_id}).exec()
    var deliveries = yield db.Deliveries.find({team_id: team_id}).exec()
    var items = yield db.Items.find({slack_id: team_id}).exec()
    var carts = yield db.Carts.find({slack_id: team_id}).exec()

    logging.debug('archiving all data...')

    // Archive all of them
    try {
    yield [
      db.Archive.archive(team),
      Promise.all(users.map(u => db.Archive.archive(u))),
      Promise.all(deliveries.map(d => db.Archive.archive(d))),
      Promise.all(items.map(i => db.Archive.archive(i))),
      Promise.all(carts.map(c => db.Archive.archive(c)))
    ]
    } catch (e) {
      logging.error('omfg wat the heck')
      logging.error(e)
    }

    logging.debug('done archiving all data')
  })
}

module.exports = archiveTeam

if (!module.parent) {
  co(function * () {
    var team = yield db.Slackbots.findOne({}).exec()
    console.log(team.team_id)
    yield archiveTeam(team.team_id)
    console.log('done')
    process.exit(0)
  }).catch(e => {
    logging.error('error archiving team', e)
  })
}
