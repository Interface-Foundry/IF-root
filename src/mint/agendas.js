var Agenda = require('agenda');
var config = require('../../config');
var agenda = new Agenda({db: {address: config.mongodb.url}});
var scrape = require('./camel/scrapeCamel');

agenda.define('scrape camel', function * (job, done) {
  yield scrape();
  done();
});

agenda.on('ready', function () {
  agenda.every('2 minutes', 'scrape camel');
  agenda.start();
});

module.exports = agenda;
