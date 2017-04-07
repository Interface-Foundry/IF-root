var Agenda = require('agenda');
var config = require('../../config');
var agenda = new Agenda({db: {address: config.mongodb.url}});

var db;
const dbReady = require('../db');
dbReady.then((models) => { db = models; })

console.log('running agenda.js')

agenda.define('daily deals', function * (job, done) {
  yield dbReady;
  //TODO send a bullshit email to yrself
  var daily = yield db.Emails.create({
    recipients: 'hannah.katznelson@kipthis.com',
    sender: 'deals@kip.ai',
    subject: 'Daily Deals',
    message_html: '<html><body>Daily Deals; Be HUMBLE.</body></html>'
  });

  yield daily.send();

  done();
});

agenda.on('ready', function () {
  //clears the incomplete jobs so that they can restart if the server does
  function failGracefully() {
    agenda.stop(() => process.exit(0));
  }
  process.on('SIGTERM', failGracefully);
  process.on('SIGINT', failGracefully);
  agenda.every('1 minute', 'daily deals');
  agenda.start();
})

module.exports = agenda;
