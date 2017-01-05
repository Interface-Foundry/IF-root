var Agenda = require('agenda')
var config = require('../../config');
var agenda = new Agenda({db: {address: config.mongodb.url}});
var co = require('co');
var _ = require('lodash');

var createJob = function * (jobName, jobFunc) {
	agenda.define(jobName, function * (job, done) {
		yield jobFunc();
		done();
	});
}	

// var createEmailJob = function * (data) {
// 	 agenda.define('send email to ' + data.to, {priority: 'high', concurrency: 10}, function(job, done) {
// 	  emailClient.send({
// 	    to: data.to,
// 	    from: 'example@example.com',
// 	    subject: 'Email Report',
// 	    body: '...'
// 	  }, done);
// 	});
// }




agenda.on('ready', function * () {
  // let teams = yield db.Slackbots.find({'meta.weekly_status_enabled': true});
  // yield teams.map( function * (team) {
  // 	  let admins = yield db.Chatusers.find({'team_id' : team.team_id, 'is_admin': true});
  // 	  yield admins.map( function * (admin) {
  // 	  	  if (_.get(admin,'profile.email')) {
  // 	  	  	 var weeklyReport = agenda.create('send email report', {to: _.get(admin,'profile.email')});
  // 	  	     weeklyReport.repeatEvery('1 week').save();
  // 	  	  }

  // 	  })
  // })

  agenda.start();
});

module.exports = {
	createJob: createJob
}