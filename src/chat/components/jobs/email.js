var send = require('../../../mail/IF_mail.js').send
var fs = require('fs');
var template = fs.readFileSync(__dirname + '/template.html', 'utf8');
var co = require('co');
module.exports = function(agenda) {
  agenda.define('send email', function (job, done) {
    db.Chatusers.find(job.attrs.data.userId, function(err, user) {
      if(err) return done(err);
      var payload = {
          to: job.attrs.data.to,
          from: `Kip <${'kip@kip.ai'}>`,
          subject: job.attrs.data.subject
        }
      payload.html = template;
      var result = co(send(payload));
      // kip.debug(' \n\n\n\n\n\n\n\n\n\n AYYYYYYYYY sent email: ', result, ' \n\n\n\n\n\n\n\n\n\n ')
      done();
     });
  });
  // More email related jobs
}