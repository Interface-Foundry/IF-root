var Agenda = require('agenda')
var config = require('../../config');
var agenda = new Agenda({db: {address: config.mongodb.url}});
var co = require('co');
var _ = require('lodash');

// var jobTypes = ['email'];
// jobTypes.forEach(function(type) {
require('./jobs/email')(agenda);
require('./jobs/reminder')(agenda);
// })

// if(jobTypes.length) {
  // agenda.start();
// }

agenda.on('ready', function () {
  agenda.start();
});

module.exports = agenda