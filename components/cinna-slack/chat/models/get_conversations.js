var mongoose = require('mongoose');
var Message = require('./Message');
var kip = require('kip');
var _ = require('lodash');
require('colors');

//set env vars
var config = require('config');
// connect our DB
console.log('connecting to mongodb', config.mongodb.url)
mongoose.connect(config.mongodb.url);
process.on('uncaughtException', function (err) {
  console.log(err);
});

Message.aggregate([{
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
