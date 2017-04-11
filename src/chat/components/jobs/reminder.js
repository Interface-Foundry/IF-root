var queue = require('../queue-direct');
module.exports = function(agenda) {
  // agenda.define('onboarding reminder', function(job, done) {
  //   logging.debug('running onboarding reminder')
  //   let message = JSON.parse(job.attrs.data.msg);
  //   logging.debug(message)
  //   let newMessage = new db.Message(message);
  //   newMessage.save((err, res) => {
  //     if (!err) {
  //       queue.publish('outgoing.' + newMessage.origin, newMessage, newMessage._id + '.reply.update');
  //     } else {
  //       kip.debug(`couldn't save reminder message ${JSON.stringify(err, null, 2)}\n${JSON.stringify(res, null, 2)}`)
  //     }
  //     done();
  //   });
  // });
};
