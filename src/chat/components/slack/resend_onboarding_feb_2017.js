require('../../../kip')
var co = require('co')
var doMessage = require('../do_message')

var ids = ['T403RB08H']

co(function * () {
  // find the teams to send onboarding
  var teams = yield db.Slackbots.find({team_id: {$in: ids}}).exec()
  yield teams.map(function * (t) {
    console.log('sending onboarding for team', t.team_name)
    return yield sendOnboarding(t.meta.addedBy)
  })
}).catch(e => {
  logging.error(e)
})

function * sendOnboarding(user_id) {
  logging.debug('user_id', user_id)
  var user = yield db.Chatusers.findOne({id: user_id}).exec()
  if (user.id !== user_id) {
    throw new Error('u made bad')
  }
  logging.debug(user.toObject())

  var message = new db.Message({
      incoming: false,
      thread_id: user.dm,
      resolved: true,
      user_id: user.id,
      origin: 'slack',
      text: '',
      source: {
        'team': user.team_id,
        'channel': user.dm,
        'thread_id': user.dm,
        'user': user.id,
        'type': 'message'
      },
      mode: 'onboarding',
      action: 'start'
    })

  console.log(message.toObject)
    // queue it up for processing
    yield message.save()
    yield doMessage(message)
}

