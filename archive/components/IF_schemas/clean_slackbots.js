var db = require('db')
var config = require('config')
var _ = require('lodash')

console.log('running clean on ' + config.mongodb.url);

db.Slackbots.find({}, function(err, bots) {
  console.log(bots)
  var dupes = _.groupBy(bots, 'team_id');
  Object.keys(dupes)
    .filter(function(k) {
      return dupes[k].length > 1;
    }).map(function(k) {
      var clones = dupes[k];
      console.log('processing ' + dupes[k][0].team_name);

      clones.sort(function(a, b) {
        return b.meta.dateAdded - a.meta.dateAdded;
      }).map(function(c) {
        console.log(c);
        return c;
      }).slice(1).map(function(c) {
        console.log('deleting ' + c._id);
        db.Slackbots.remove({_id: c._id}).exec(function(e) {
          if (e) console.log(e);
        })
      })
    })


})
