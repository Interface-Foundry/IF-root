var Agenda = require('agenda');
var config = require('../../config');
var agenda = new Agenda({db: {address: config.mongodb.url}});

require('./jobs/email')(agenda);
require('./jobs/reminder')(agenda);
require('./jobs/initial_reminder')(agenda);
require('./jobs/feature_rollout')(agenda);

let cartEmailInterval = (process.env.JOB_CART_EMAIL && typeof process.env.JOB_CART_EMAIL == 'string') ? process.env.JOB_CART_EMAIL : '00 15 * * 5';
let featureInterval = (process.env.JOB_FEATURE_ROLLOUT && typeof process.env.JOB_FEATURE_ROLLOUT == 'string') ? process.env.JOB_FEATURE_ROLLOUT : '30 17 * * *';

agenda.on('ready', function () {
	logging.info('Send cart status email jobs to run at: ', cartEmailInterval);
	logging.info('Feature rollout jobs to run at: ', featureInterval);

	//clear and restart jobs 
	agenda.cancel({name: 'send cart status email'}, function(err, numRemoved) {
		if (err) console.log(err);
	});
	agenda.cancel({name: 'feature rollout'}, function(err, numRemoved) {
		if (err) console.log(err);
	});	
	if (cartEmailInterval) { 
		agenda.every(cartEmailInterval, 'send cart status email', {});
	}
  if (featureInterval) {
		logging.info('Set up feature roll out jobs.');
  	agenda.every(featureInterval, 'feature rollout', { feature: 'oregano'});
  }
  agenda.start();
});

module.exports = agenda;
