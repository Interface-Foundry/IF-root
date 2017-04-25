require('../../../kip')
var co = require('co')
var sleep = require('co-sleep')
var slack = require('@slack/client')
const fs = require('fs')

/**
 * File which was used to send marketing messages
 * See also gen_users.js for the code which was used to generate the lists of users
 * @module slack/feature_rollout
 */


//
// Grab the batch's file of admin id's to spam
//
// const filename = fs.readdirSync(__dirname)
//   .filter(f => f.match(/^user.*.json$/))[0]
// console.log(filename)
// const batch = parseInt(filename.match(/[0-9]+/)[0])
// const users = require('./' + filename)
// fs.renameSync(filename, filename + '.done')

//
// We'll send this message to ppl as a marketing campaign
//
const message = {
  icon_url: 'http://kipthis.com/img/kip-icon.png',
  username: 'Kip',
  as_user: true,
  attachments: [{
    text: 'Tomorrow is Admin Day! Thank team members who keep the office running smoothly\n Take this short quiz to find out what to get 🎉',
    image_url: 'https://storage.googleapis.com/kip-random/bloomthat_quiz/quiz_1.png',
    mrkdwn_in: ['text'],
    fallback: 'Tomorrow is Admin Day! Thank team members who keep the office running smoothly\n Take this short quiz to find out what to get 🎉',
    callback_id: 'none',
    color:'#52A2F0',
    author_name: "BloomThat",
    author_link: "https://www.bloomthat.com",
    author_icon: "https://storage.googleapis.com/kip-random/bloomthat_quiz/bloomthat_social_media.png",
    actions: [{
      name: 'quiz_bloomthat',
      value: 'quiz_bloomthat',
      text: '👀 Find Out Now',
      style: 'primary',
      type: 'button'
    }, {
      color: '#45a5f4',
      name: 'quiz_bloomthat_help',
      value: 'quiz_bloomthat_help',
      text: 'What\'s Admin Day?',
      style: 'default',
      type: 'button'
    }]
  }]
}

//
// Sends a message to a specific user
//
function sendToUser (userId,teamId) {
  console.log('running for user', userId)
  return co(function * () {
    // get the full user obj
    var user = yield db.Chatusers.findOne({id: userId}).exec()

    if (!user) {
      console.log('could not find user in db', userId)
      return
    }

    console.log('🌵🌵 !user! ',user)

    // Don't re-send to someone who we have already sent this marketing message
    var sentCount = yield db.Metrics.count({
      'data.user': user.id,
      'data.feature': 'bloomthat'
    }).exec()

    console.log('🌵🌵 ! ',sentCount)

    // if (sentCount > 0) {
    //   console.log('already sent to user', userId)
    //   return
    // }

    // CHECK HERE WHICH TIMEZONE THEY'RE IN, so it's 10am their time. so run it at 10am , 11am, 12pm 

    //ACTUALLY GET THREE DIFFERENT LISTS OF USERS, by timezone (when it's 10am their time)

    /////// HAND SORT WHICH TEAMS TO MESSAGE ////////
    // ----> message.io + slack + howdy + betaworks, only message 1
    // ----> 

    // Send a message to this user 
    let slackbot = yield db.Slackbots.findOne({team_id: teamId}).exec()
    let bot = new slack.WebClient(slackbot.bot.bot_access_token)
    yield bot.chat.postMessage(user.dm, '', message)

    db.Metrics.log('feature.rollout.sent', {
      team: teamId,
      user: user.id,
      feature: 'bloomthat'
    })
  })
}

//
// Run it
//
function * main () {
  // yield sleep(1000)
  // console.log('batch', batch)
  // console.log(days[batch / 10 | 0], days[batch % 10])
  // console.log('Sending message to users in batch', batch)
  // console.log(`there are ${users.length} users in this batch`)
  // console.log('(ctrl-c if that looks wrong)')
  // yield sleep(5000)
  // console.log('proceeding')
  // yield users.map(function * (u) {
  //   yield sendToUser(u)
  // })
  var userId = 'U02PN3T5R'
  var teamId = 'T02PN3B25'

  yield sendToUser(userId,teamId)
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
