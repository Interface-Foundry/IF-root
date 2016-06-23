var db = require('db');
var co = require('co');
var request = require('request-promise');
require('promisify-global');

var debug = process.env.NODE_ENV === 'development' ? console.log.bind(console) : function(){};

// i guess this is a lot like init_team
module.exports = function(team_id) {
  console.log('refreshing team ' + team_id);
  return co(function*() {
    var bot = yield db.Slackbots.findOne({
      team_id: team_id
    }).exec();

    var existing_users = yield db.Chatusers.find({
      team_id: team_id
    });

    debug(bot);

    var r = yield request('https://slack.com/api/users.list?token=' + bot.bot.bot_access_token);
    users = JSON.parse(r).members;

    // now collect all the DM channels for each user which doesn't have one in the db yet
    r = yield request('https://slack.com/api/im.list?token=' + bot.bot.bot_access_token);
    imlist = JSON.parse(r).ims;
    var dmhash = imlist.reduce((hash, im) => {
      hash[im.user] = im.id;
      return hash;
    }, {});

    // and finally upsert that shit 💩
    yield users.map((u) => {
      // set the dm field which for some reason isn't included in the response.
      u.dm = dmhash[u.id];

      // love thee, upsert
      return db.Chatusers.update({
          id: u.id
        },
        u, {
          upsert: true
        })
    });
    console.log('done refreshing team ' + team_id);
    return users;
  });
}

if (!module.parent) {
  module.exports('T0R6J00JW').catch(function(e) {
    console.log(e.stack);
  })
}
