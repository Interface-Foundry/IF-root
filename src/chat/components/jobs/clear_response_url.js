var co = require('co');
var ObjectId = require('mongodb').ObjectID;

module.exports = function(agenda) {
  // agenda.define('clear response', function(job, done) {
  //   let message_id = job.attrs.data.msgId;
  //   co(function * () {
  //     var prevMessage = yield db.Message.findOne({
  //       '_id': new ObjectId(message_id)
  //     }).exec();
  //     if (prevMessage != null) {
  //       delete prevMessage.source.response_url;
  //       prevMessage.markModified('source.response_url');
  //       yield prevMessage.save();
  //     }
  //     done();
  //   });
  // });
};
