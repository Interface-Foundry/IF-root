console.log('agendas.js');

var Agenda = require('agenda');
var config = require('../../config');
var agenda = new Agenda({db: {address: config.mongodb.url}});
var scrape = require('./scrapeCamel');

agenda.define('scrape camel', function (job, done) {
  scrape()
    .then(function (result) {
    })
    .catch(function (err) {
      logging.debug('error scraping camel', err);
    });
  done();
});

agenda.on('ready', function () {

  //clears the incomplete jobs so that they can restart if the server does
  function failGracefully() {
    // console.log('ugh i think i see four horsies');
    agenda.stop(() => process.exit(0));
  }
  process.on('SIGTERM', failGracefully);
  process.on('SIGINT', failGracefully);
  //delete this once it is

  // console.log('agendas ready');
  agenda.every('1 day', 'scrape camel');
  agenda.start();
});

module.exports = agenda;
