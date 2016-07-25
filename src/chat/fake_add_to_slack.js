var db = require('db');
require('colors');
var prompt = require('prompt');
var promisify = require('promisify-node');
var co = require('co');
var sleep = require('co-sleep');
var request = require('request-promise');

var cinna = `
 ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💙⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💙💙⚪💙⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💙💙💙💙💙⚪⚪⚪❤🎀⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💙💙💙💙💙💙💙💙🌚❤🎀🎀🎀🎀⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💙💙💙💙💙💙💙💙💙💙💙💙💙🎀🎀🎀👕🎀💙⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪⚪⚪⚪💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙🎀🎀💙💙👕💙💙💙⚪⚪⚪⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪⚪💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙👕💙💙💙💙💙💙💙💙💙⚪⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙⚪⚪⚪⚪
 ⚪⚪⚪⚪💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙⚪⚪⚪
 ⚪⚪⚪💙💙💙💙💙💙💙💙💙💭💭💙💭💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙⚪⚪
 ⚪⚪⚪💙💙💙💙💙💙💙⚪🌚⚪⚪⚪⚪⚪💭💭💙💙💙💙💙💙⚪⚪💭💭💭⚪⚪💙💙💙💙💙💙⚪⚪
 ⚪⚪💙💙💙💙💙💙💙⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💙💙💙💙💭⚪⚪⚪⚪⚪⚪⚪💭💙💙💙💙💙💙⚪
 ⚪⚪💙💙💙💙💙💙🌚⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💭💙💙💙⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💙💙💙💙💙⚪
 ⚪💙💙💙💙💙💙💭⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💙🌚⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💭💙💙💙💙💙
 ⚪💙💙💙💙💙⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💙💙💙💙
 ⚪💙💙💙💙💙⚪⚪⚪⚪⚫⚫⚫⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚫⚫⚫⚪⚪⚪⚪⚪💙💙💙💙
 ⚪💙💙💙💙💙⚪⚪⚪🌚⚫⚫⚫⚪⚪⚪⚪⚪⚪⚪🌚🌚⚪⚪⚪⚪⚪⚫⚫⚫⚫⚪⚪⚪⚪⚪💙💙💙💙
 ⚪💙💙💙💙💙⚪⚪⚪🌕⚫⚫⚫⚪⚪⚪⚪🍊🍊🍊🍊🍊🍊🍊⚪⚪⚪🌚⚫⚫⚫⚪⚪⚪⚪⚪💙💙💙💙
 ⚪💙💙💙💙💙⚪⚪⚪⚪🌕⚪⚪⚪⚪⚪🍊🍊🍊🍊🍊🍊🍊🍊🍊⚪⚪⚪🌕⚪⚪⚪⚪⚪⚪⚪💙💙💙💙
 ⚪💙💙💙💙💙🐙⚪⚪⚪⚪⚪⚪⚪⚪⚪💰🍊🍊🍊🍊🍊🍊🍊⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💙💙💙💙
 ⚪⚪💙💙💙💙💙⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💛⚪💛⚪🍊⚪💰⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💙💙💙💙
 ⚪⚪💙💙💙💙💙⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💙💙💙💙
 ⚪⚪⚪💙💙💙💙🐙⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💙💙💙⚪
 ⚪⚪⚪💙💙💙💙💙⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💙💙💙💙⚪
 ⚪⚪⚪⚪💙💙💙💙⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💙💙💙⚪⚪
 ⚪⚪⚪⚪⚪💙💙💙💙⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪🐙💙💙⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪⚪💙💙💙⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪💙⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪⚪⚪🌚💙⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪
 ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪
`;

console.log(cinna);

var prompt_token = function() {
  return new Promise((resolve, reject) => {
    prompt.get(['token', 'name'], (e, r) => {
      if (e) return reject(e);
      resolve(r);
    })
  })
};

// HOW TO USE:
// Go to the slack settings for your dev team and make a new integration.
// get the bot access tokena and the username
// run this file, which will prompt you for the stuff
// example xoxb-52997135047-V04YlW4Pz54pNyzclBuwsSvE

console.log('Hi I\m Kip!'.cyan);
co(function*() {
  yield sleep(1000);
  console.log('Please paste the integration api token:');
  var r = yield prompt_token();
  var token = r.token;
  var team = yield request({uri: 'https://slack.com/api/team.info?token=' + token, json: true});
  console.log(team);
  team = team.team;

  var users = yield request({uri: 'https://slack.com/api/users.list?token=' + token, json: true});
  console.log(users);

  var me;
  var admin;
  users.members.map(m => {
    if (m.is_admin) {
      admin = m;
    }

    if (m.name === r.name) {
      me = m;
    }
  });
  console.log(JSON.stringify(admin, null, 2));
  console.log(admin.id);
  console.log(JSON.stringify(me, null, 2))

  var bot = new db.Slackbot({
    team_name: team.name,
    team_id: team.id,
    deleted: false,
    meta: {
      initialized: false,
      addedBy: admin.id
    },
    bot: {
      bot_user_id: me.id,
      bot_access_token: token
    }
  });

  yield bot.save();
  console.log('saved bot to db');
  var slackbot_reload_url = process.env.NODE_ENV === 'production' ? 'http://chat.kipapp.co/newslack' : 'http://localhost:8000/newslack';
  yield request(slackbot_reload_url);
  console.log('done');
  process.exit(0);

}).catch(e => {
  console.log(e);
  console.log(e.stack);
})
