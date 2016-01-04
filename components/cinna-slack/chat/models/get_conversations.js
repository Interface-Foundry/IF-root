var kip = require('kip');
var _ = require('lodash');
require('colors');
var db = require('db');

//set env vars
var config = require('config');

db.Message.aggregate([{
  $group: {
    _id: '$source.id',
    count: {$sum: 1},
    messages: {$push: '$tokens'}
  }
}, {
  $match: {count: {$gt: 2}}
}, {
  $sort: {count: -1}
}], function(e, r) {
  kip.fatal(e);
  console.log(r);
  r.map(function(conversation) {
    console.log(conversation._id.cyan)
    console.log(_.flatten(conversation.messages))
  })
})
