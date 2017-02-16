require('../../kip')
var co = require('co')

// this won't work well with the queue

co(function * () {
  // find the teams to send onboarding
  var teams = db.Slackbots.find({}).exec()
  
})

function * sendOnboarding(user_id) {
  var user = yield db.Chatusers.find({id: user_id})

  var message = new db.Message({
      incoming: false,
      thread_id: user.dm,
      resolved: true,
      user_id: user.id,
      origin: 'slack',
      text: '',
      source: {
        'team': slackbot.team_id,
        'channel': user.dm,
        'thread_id': user.dm,
        'user': user.id,
        'type': 'message'
      },
      mode: 'onboarding',
      action: 'start'
    })
    // queue it up for processing
    yield message.save()
    queue.publish('incoming', message, ['slack', user.dm, Date.now()].join('.'))

}
