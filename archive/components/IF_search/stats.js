var db = require('db')
var kip = require('kip')

// analytics types
db.Analytics.aggregate([
  { $group: { "_id": "$action", "count": { $sum: 1 } } }
]).exec(function(e, r) {
  kip.fatal(e);
  console.log(r[0].count, 'total searches to date');
  console.log('');
})

db.Analytics.aggregate([
  {$match: {action: 'search'}},
  { $group: { "_id": "$data.query.text", "count": { $sum: 1 } } }
]).exec(function(e, r) {
  kip.fatal(e);
  r.sort(function(a, b) {
    return a.count < b.count;
  }).map(function(r) {
    console.log(r.count, r._id)
  })

})
