var Agenda = require('agenda');
var config = require('../../config');
var agenda = new Agenda({db: {address: config.mongodb.url}});

console.log('running agenda.js')

agenda.define('daily deals', function (job, done) {
  //do things TODO
  console.log('agenda!')
  done();
});

agenda.on('ready', function () {
  //clears the incomplete jobs so that they can restart if the server does
  function failGracefully() {
    agenda.stop(() => process.exit(0));
  }
  process.on('SIGTERM', failGracefully);
  process.on('SIGINT', failGracefully);
  agenda.every('10 seconds', 'daily deals');
  agenda.start();
})

module.exports = agenda;
