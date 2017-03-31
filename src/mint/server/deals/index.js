/**
 * @module Deals defines a job which gets the daily amazon deals off of the site https://camelcamelcamel.com once per day
 * @type {[type]}
 */

var Agenda = require('agenda');
var config = require('../../../config');
var agenda = new Agenda({db: {address: config.mongodb.url}});
var scrape = require('./scrapeCamel');

agenda.define('scrape camel', function (job, done) {
  scrape()
    .then(function (result) {
    })
    .catch(function (err) {
      console.error('error scraping camel', err);
    });
  done();
});

agenda.on('ready', function () {
  //clears the incomplete jobs so that they can restart if the server does
  function failGracefully() {
    agenda.stop(() => process.exit(0));
  }
  process.on('SIGTERM', failGracefully);
  process.on('SIGINT', failGracefully);
  agenda.every('1 day', 'scrape camel');
  agenda.start();
});

module.exports = agenda;
