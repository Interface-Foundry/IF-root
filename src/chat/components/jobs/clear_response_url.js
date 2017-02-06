var co = require('co');
var ObjectId = require('mongodb').ObjectID;

module.exports = function(agenda) {
  agenda.define('clear response', function(job, done) {
    let message_id = job.attrs.data.msgId;
    kip.debug(`😜  Deleting response_url from ${JSON.stringify(job.attrs.data, null, 2)}`);
    co(function * () {
      var prevMessage = yield db.Message.findOne({
        '_id': new ObjectId(message_id)
      }).exec();
      kip.debug(`🍔  trying to delete from ${JSON.stringify(prevMessage, null, 2)}`);
      if (prevMessage != null) {
        delete prevMessage.source.response_url;
        prevMessage.markModified('source.response_url');
        yield prevMessage.save();
      }
      done();
    });
  });
};
