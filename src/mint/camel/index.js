console.log('agendas.js');

var Agenda = require('agenda');
var config = require('../../config');
var agenda = new Agenda({db: {address: config.mongodb.url}});
var scrape = require('./scrapeCamel');

agenda.define('scrape camel', function (job, done) {
  console.log('scrape camel job');
  scrape()
    .then(function (result) {
      console.log('done w scrape gamal');
    });

  done();
});

agenda.define('test', function (job, done) {
  console.log('born in the bronx');
  done();
});

agenda.on('ready', function () {

  //for debugging -- because done() isn't being called
  function failGracefully() {
    console.log('ugh i think i see four horsies');
    agenda.stop(() => process.exit(0));
  }
  process.on('SIGTERM', failGracefully);
  process.on('SIGINT', failGracefully);
  //delete this once it is

  console.log('agendas ready');
  agenda.every('5 minutes', 'scrape camel');
  agenda.every('30 seconds', 'test');
  agenda.start();
});

module.exports = agenda;
