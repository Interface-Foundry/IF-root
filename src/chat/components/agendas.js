var Agenda = require('agenda');
var config = require('../../config');
var agenda = new Agenda({db: {address: config.mongodb.url}});

require('./jobs/email')(agenda);
require('./jobs/reminder')(agenda);
require('./jobs/initial_reminder')(agenda);
require('./jobs/feature_rollout')(agenda);


agenda.on('ready', function () {
	//clear and restart jobs 
	agenda.cancel({name: 'send cart status email'}, function(err, numRemoved) {
		if (err) console.log(err);
		console.log('Restarting send cart status email jobs ', numRemoved);
	});
	agenda.cancel({name: 'feature rollout'}, function(err, numRemoved) {
		if (err) console.log(err);
		console.log('Restarting feature rollout jobs ', numRemoved);
	});	
  agenda.every('43 15 * * *', 'send cart status email', {});
  agenda.every('44 15 * * *', 'feature rollout', { feature: 'oregano'});
  agenda.start();
});

module.exports = agenda;