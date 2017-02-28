require('../../../kip')
var co = require('co')
var sleep = require('co-sleep')
var slack = require('@slack/client')
const fs = require('fs')

//
// Grab the batch's file of admin id's to spam
//
const filename = fs.readdirSync(__dirname)
  .filter(f => f.match(/^user.*.json$/))[0]
console.log(filename)
const batch = parseInt(filename.match(/[0-9]+/)[0])
const users = require('./' + filename)
fs.renameSync(filename, filename + '.done')

//
// We'll send this message to ppl as a marketing campaign
//
const message = {
  icon_url: 'http://kipthis.com/img/kip-icon.png',
  username: 'Kip',
  as_user: true,
  attachments: [{
    text: '*Big news!* I can order delicious food delivered for you and your team.\nTry now and get 10% off your first 5 orders',
    image_url: 'http://tidepools.co/kip/kip_fruit_twitter_sm.gif',
    mrkdwn_in: ['text'],
    fallback: 'Big news! I can order delicious food delivered for you and your team. Try now and get 10% off your first 5 orders',
    callback_id: 'none',
    color: '#f43440',
    actions: [{
      color: '#45a5f4',
      name: 'passthrough',
      value: 'food',
      text: '✓ Order Food Now',
      style: 'primary',
      type: 'button'
    }, {
      color: '#45a5f4',
      name: 'snooze',
      value: 'snooze',
      text: 'Later',
      style: 'default',
      type: 'button'
    }]
  }]
}

//
// Sends a message to a specific user
//
function sendToUser (userId) {
  console.log('running for user', userId)
  return co(function * () {
    // get the full user obj
    var user = yield db.Chatusers.findOne({id: userId}).exec()

    if (!user) {
      console.log('could not find user in db', userId)
      return
    }

    // Don't re-send to someone who we have already sent this marketing message
    var sentCount = yield db.Metrics.count({
      'data.user': user.id
    }).exec()

    if (sentCount > 0) {
      console.log('already sent to user', userId)
      return
    }

    // Only send to users that have not initiated an order in 2017
    let deliveries = yield db.Delivery.find({
      'convo_initiater.id': user.id,
      team_id: user.team_id,
      time_started: {$gte: new Date('2017-01-01')}
    }).exec()

    if (deliveries.length > 0) {
      console.log('user has deliveryies', userId)
      return // return early
    }

    // Send a message to this user who has not started a cafe session
    let slackbot = yield db.Slackbots.findOne({team_id: user.team_id}).exec()
    let bot = new slack.WebClient(slackbot.bot.bot_access_token)
    yield bot.chat.postMessage(user.dm, '', message)

    db.Metrics.log('feature.rollout.sent', {
      team: user.team_id,
      user: user.id,
      feature: 'cafe'
    })
  })
}

//
// Run it
//
function * main () {
  yield sleep(1000)
  console.log('batch', batch)
  console.log(days[batch / 10 | 0], days[batch % 10])
  console.log('Sending message to users in batch', batch)
  console.log(`there are ${users.length} users in this batch`)
  console.log('(ctrl-c if that looks wrong)')
  yield sleep(5000)
  console.log('proceeding')
  yield users.map(function * (u) {
    yield sendToUser(u)
  })
  process.exit(0)
}

const days = [
` 00000
 00   00
 00  000
 00 0 00
 000  00
 00   00
  00000

`,
  `  1111
  11111
   1111
   1111
   1111
   1111
  111111
`,
  `  2222
  222222
  2  22
    22
   22
  222222
  222222
`,
  `3333333
     33
    33
  33333
     333
    333
 3333
`,
  `    44
    444
   4444
  44 44
 44  44
44444444
     44
`,
  `5555555
 55
 5555555
     555
     555
    555
 55555
`,
  `  66
  66
 66   
 66666
 66  66
 66  66
  6666
`,
  `77777777
       77
      77
   7777
    77
   77
  77
`,
  ` 888888
 88  88 
   888
  88 88
 88   88
 88   88
  88888
`,
  `  9999
  99  99
  99  99
   99999
      99
     99
    99
`
].map(d => '\n ' + d)

co(main).catch(e => {
  console.error(e)
  process.exit(1)
})

