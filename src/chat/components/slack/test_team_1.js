var mongodb = require('mongodb')
var uuid = require('uuid')
function ObjectId (id) { return new mongodb.ObjectId(id) }
function ISODate (d) { return new Date(d) }
var team = {}

team.slackbot = {
  '_id': ObjectId('576d982221ab4abcecfbf0ac'),
  'access_token': 'xxx', // never used, instead we use bot.bot_access_token
  'scope': 'identify,bot',
  'team_name': 'Yolo Testing Inc.',
  'team_id': 'yolo',
  'meta': {
    'cart_channels': [
      'C1JTZAENT'
    ],
    'weekly_status_timezone': 'America/New_York',
    'weekly_status_time': '4:00 PM',
    'weekly_status_day': 'Friday',
    'weekly_status_enabled': true,
    'office_assistants': [
      'admin_yolo'
    ],
    'initialized': true,
    'dateAdded': ISODate('2016-06-24T20:29:22.265Z'),
    'addedBy': 'U1JU56UG1',
    locations: [{address_1: '21 Essex St 10002'}],
    mock: true
  },
  'bot': {
    'bot_user_id': 'kip_yolo',
    'bot_access_token': 'xoxb-yolo'
  },
  '__v': 1
}

function chatusersToGroup () {
  return {
    'team_name': team.slackbot.team_name,
    'team_id': team.slackbot.team_id,
    'cart_id': uuid.v4(),
    'members': team.chatusers.map((a) => {
      return {
        'member_id': a.id,
        'admin': a.is_admin,
        'bot': a.is_bot
      }
    })
  }
}

team.chatusers = [{
  '_id': ObjectId('57e133b74f94faa56ce2401e'),
  'id': 'admin_yolo',
  'dm': 'D1K8798Q4',
  'is_bot': false,
  'is_ultra_restricted': false,
  'is_restricted': false,
  'is_primary_owner': true,
  'is_owner': true,
  'is_admin': true,
  'profile': {
    'avatar_hash': 'g3a213561353',
    'real_name': 'Admin Yolo',
    'real_name_normalized': 'Admin Yolo',
    'email': 'admin.yolo@gmail.com',
    'image_24': 'https://secure.gravatar.com/avatar/3a21356135360f9e4b72ba546863d3de.jpg?s=24&d=https%3A%2F%2Fa.slack-edge.com%2F0180%2Fimg%2Favatars%2Fava_0021-24.png',
    'image_32': 'https://secure.gravatar.com/avatar/3a21356135360f9e4b72ba546863d3de.jpg?s=32&d=https%3A%2F%2Fa.slack-edge.com%2F66f9%2Fimg%2Favatars%2Fava_0021-32.png',
    'image_48': 'https://secure.gravatar.com/avatar/3a21356135360f9e4b72ba546863d3de.jpg?s=48&d=https%3A%2F%2Fa.slack-edge.com%2F3654%2Fimg%2Favatars%2Fava_0021-48.png',
    'image_72': 'https://secure.gravatar.com/avatar/3a21356135360f9e4b72ba546863d3de.jpg?s=72&d=https%3A%2F%2Fa.slack-edge.com%2F66f9%2Fimg%2Favatars%2Fava_0021-72.png',
    'image_192': 'https://secure.gravatar.com/avatar/3a21356135360f9e4b72ba546863d3de.jpg?s=192&d=https%3A%2F%2Fa.slack-edge.com%2F7fa9%2Fimg%2Favatars%2Fava_0021-192.png',
    'image_512': 'https://secure.gravatar.com/avatar/3a21356135360f9e4b72ba546863d3de.jpg?s=512&d=https%3A%2F%2Fa.slack-edge.com%2F7fa9%2Fimg%2Favatars%2Fava_0021-512.png'
  },
  'tz_offset': -14400.0,
  'tz_label': 'Eastern Daylight Time',
  'tz': 'America/Indiana/Indianapolis',
  'real_name': 'Admin Yolo',
  'color': '9f69e7',
  'deleted': false,
  'name': 'admin',
  'team_id': 'yolo',
  'takenPreferences': false
}, {
  '_id': ObjectId('57e133b74f94faa56ce2401f'),
  'id': 'bamf_yolo',
  'dm': 'D1KARK0F6',
  'is_bot': false,
  'is_ultra_restricted': false,
  'is_restricted': false,
  'is_primary_owner': false,
  'is_owner': false,
  'is_admin': false,
  'profile': {
    'avatar_hash': 'g59e19ffa349',
    'real_name': 'Bamf Member',
    'real_name_normalized': 'Bamf Member',
    'email': 'bamf.member@gmail.com',
    'image_24': 'https://secure.gravatar.com/avatar/59e19ffa34918c438cd72db588583ea4.jpg?s=24&d=https%3A%2F%2Fa.slack-edge.com%2F66f9%2Fimg%2Favatars%2Fava_0014-24.png',
    'image_32': 'https://secure.gravatar.com/avatar/59e19ffa34918c438cd72db588583ea4.jpg?s=32&d=https%3A%2F%2Fa.slack-edge.com%2F66f9%2Fimg%2Favatars%2Fava_0014-32.png',
    'image_48': 'https://secure.gravatar.com/avatar/59e19ffa34918c438cd72db588583ea4.jpg?s=48&d=https%3A%2F%2Fa.slack-edge.com%2F66f9%2Fimg%2Favatars%2Fava_0014-48.png',
    'image_72': 'https://secure.gravatar.com/avatar/59e19ffa34918c438cd72db588583ea4.jpg?s=72&d=https%3A%2F%2Fa.slack-edge.com%2F66f9%2Fimg%2Favatars%2Fava_0014-72.png',
    'image_192': 'https://secure.gravatar.com/avatar/59e19ffa34918c438cd72db588583ea4.jpg?s=192&d=https%3A%2F%2Fa.slack-edge.com%2F7fa9%2Fimg%2Favatars%2Fava_0014-192.png',
    'image_512': 'https://secure.gravatar.com/avatar/59e19ffa34918c438cd72db588583ea4.jpg?s=512&d=https%3A%2F%2Fa.slack-edge.com%2F7fa9%2Fimg%2Favatars%2Fava_0014-512.png'
  },
  'tz_offset': -14400.0,
  'tz_label': 'Eastern Daylight Time',
  'tz': 'America/Indiana/Indianapolis',
  'real_name': 'Bamf Member',
  'color': '674b1b',
  'deleted': false,
  'name': 'bamf',
  'team_id': 'yolo',
  'takenPreferences': false
}, {
  '_id': ObjectId('57e133b14f94faa56ce24015'),
  'id': 'kip_yolo',
  'dm': null,
  'is_bot': true,
  'is_ultra_restricted': false,
  'is_restricted': false,
  'is_primary_owner': false,
  'is_owner': false,
  'is_admin': false,
  'profile': {
    'avatar_hash': '585994568c39',
    'image_24': 'https://avatars.slack-edge.com/2016-06-21/52947677872_585994568c39c7b56258_24.png',
    'image_32': 'https://avatars.slack-edge.com/2016-06-21/52947677872_585994568c39c7b56258_32.png',
    'image_48': 'https://avatars.slack-edge.com/2016-06-21/52947677872_585994568c39c7b56258_48.png',
    'image_72': 'https://avatars.slack-edge.com/2016-06-21/52947677872_585994568c39c7b56258_72.png',
    'image_192': 'https://avatars.slack-edge.com/2016-06-21/52947677872_585994568c39c7b56258_192.png',
    'image_512': 'https://avatars.slack-edge.com/2016-06-21/52947677872_585994568c39c7b56258_512.png',
    'real_name': 'Kip',
    'real_name_normalized': 'Kip'
  },
  'tz_offset': -25200.0,
  'tz_label': 'Pacific Daylight Time',
  'tz': null,
  'real_name': 'Kip',
  'color': '4bbe2e',
  'deleted': false,
  'name': 'kip',
  'team_id': 'yolo',
  'takenPreferences': false
}]

team.reset = function * () {
  console.log('running reset of test_team_1')

  var db = yield mongodb.MongoClient.connect('mongodb://localhost/foundry')

  // slackbot
  yield db.collection('slackbots').remove({team_id: team.slackbot.team_id})
  yield db.collection('slackbots').insert(team.slackbot)

  // chatusers
  yield db.collection('chatusers').remove({team_id: team.slackbot.team_id})
  yield db.collection('chatusers').insert(team.chatusers)

  // group
  yield db.collection('groups').remove({team_id: team.slackbot.team_id})
  yield db.collection('groups').insert(chatusersToGroup())

  // delivery
  yield db.collection('delivery').remove({team_id: team.slackbot.team_id})
  yield db.collection('delivery').insert(require('./test_team_1_delivery'))

  // remove all the random things
  yield db.collection('messages').remove({'source.team': team.slackbot.team_id})

  console.log('done resetting test team')
}

module.exports = team

if (!module.parent) {
  var co = require('co')
  co(team.reset).catch(e => {
    console.error(e)
  })
}
