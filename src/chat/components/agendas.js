
var Agenda = require('agenda')
var config = require('../../config');
var agenda = new Agenda({db: {address: config.mongodb.url}});
var co = require('co');
var _ = require('lodash');

require('./jobs/email')(agenda);
require('./jobs/reminder')(agenda);

agenda.on('ready', function () {
  agenda.start();
});

module.exports = agenda