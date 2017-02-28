var Agenda = require('agenda');
var config = require('../../config');
var agenda = new Agenda({db: {address: config.mongodb.url}});

require('./jobs/email')(agenda);
require('./jobs/reminder')(agenda);
require('./jobs/initial_reminder')(agenda);
require('./jobs/home_button')(agenda);
require('./jobs/clear_response_url')(agenda);
require('./jobs/mockUserMessage')(agenda);

agenda.on('ready', function () {
	agenda.cancel({name: 'send cart status email'}, function(err, numRemoved) {
		if (err) console.log(err);
	});
	agenda.cancel({name: 'feature rollout'}, function(err, numRemoved) {
		if (err) console.log(err);
	});
	// agenda.create('send cart status email', {}).schedule('17:33pm').repeatEvery('1 day', { timezone: 'America/New_York'}).save();
  	agenda.start();
});

module.exports = agenda;
