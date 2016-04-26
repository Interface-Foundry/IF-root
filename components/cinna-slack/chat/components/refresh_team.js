var db = require('db');
var co = require('co');
var request = require('request');

// i guess this is a lot like init_team
module.exports = function(team_id) {
  return co(function*() {
    var bot = yield db.Slackbots.find({
      team_id: team_id
    }).exec();

    var r = yield request.promise('https://slack.com/api/users.list?token=' + bot.bot.bot_access_token);
    users = JSON.parse(r.body).members;

    // now collect all the DM channels for each user which doesn't have one in the db yet
    r = yield request.promise('https://slack.com/api/im.list?token=' + bot.bot.bot_access_token);
    imlist = JSON.parse(r.body).ims;
    var dmhash = imlist.reduce((hash, im) => {
      hash[im.user] = im.id;
      return hash;
    }, {});

    // and finally upsert that shit 💩
    yield users.map((u) => {
      // set the dm field which for some reason isn't included in the response.
      u.dm = dmhash[u.id];

      // love thee, upsert
      return db.Chatusers.collection.update.promise({
        id: u.id
      },
      u, {
        upsert: true
      });
    })
  });
}
