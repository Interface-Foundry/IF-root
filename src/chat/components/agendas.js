var Agenda = require('agenda');
var config = require('../../config');
var agenda = new Agenda({db: {address: config.mongodb.url}});

require('./jobs/email')(agenda);
require('./jobs/reminder')(agenda);
require('./jobs/initial_reminder')(agenda);
// require('./jobs/message_admins')(agenda);
agenda.on('ready', function () {
  agenda.start();
});

module.exports = agenda;
