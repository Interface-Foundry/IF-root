var Agenda = require('agenda');
var config = require('../../config');
var agenda = new Agenda({db: {address: config.mongodb.url}});

var db;
const dbReady = require('../db');
dbReady.then((models) => { db = models; })

console.log('running agenda.js')

agenda.define('daily deals', function (job, done) {
  console.log('daily deals called');
  dbReady.then(function () {
    console.log('db ready')
  })
  .then(function () {
    return db.Emails.create({
      recipients: 'hannah.katznelson@kipthis.com',
      sender: 'deals@kip.ai',
      subject: 'Daily Deals',
      message_html: '<html><body>Daily Deals; Be HUMBLE.</body></html>'
    })
  })
  .then(function () {
    console.log('daily deal created');
  })

  // //TODO send a bullshit email to yrself
  var daily = yield
  //
  // console.log('daily deal created');

  // yield daily.send();
  // console.log('sent email');

  done();
});

agenda.on('ready', function () {
  console.log('ready, woohoo')
  //clears the incomplete jobs so that they can restart if the server does
  function failGracefully() {
    agenda.stop(() => process.exit(0));
  }
  process.on('SIGTERM', failGracefully);
  process.on('SIGINT', failGracefully);
  agenda.every('20 seconds', 'daily deals');
  agenda.start();
});

module.exports = agenda;
