var utils = require('../slack/utils');
var _ = require('lodash');
var co = require('co');
var slack = require('@slack/client');
var argv = require('minimist')(process.argv.slice(2));
var teamIds = _.get(argv,'_');
var async = require('async');

module.exports = function(agenda) {
  agenda.define('feature rollout', function (job, done) {
  	let feature = job.attrs.data.feature;
    logging.info('started job: feature rollout for ', feature);
		var message = {
		  icon_url: 'http://kipthis.com/img/kip-icon.png',
		  username: 'Kip',
		  as_user: true,
		  attachments: [{
		    text: 'Big news! We just released Kip Café! Give it a try to order lunch for your team!',
		    image_url: 'http://tidepools.co/kip/welcome_cafe.png',
		    mrkdwn_in: ['text'],
		    fallback: 'Welcome to Kip!',
		    callback_id: 'none',
		    actions: [{
		      color: '#45a5f4',
		      name: 'passthrough',
		      value: 'food',
		      text: "✓ Ok",
		      style: "primary",
		      type: "button",
		    }]
		  }]
		}
		co(function * () {
	    let slackbots = yield db.Slackbots.find();
			let teams = yield slackbots.map( function * (team) { 
				let admins = yield utils.findAdmins(team);
				return { team: team, admins: admins }
			})
			logging.info('\nfound teams in db: ', teams.length,'\n');
			async.eachSeries(teams, function (obj, callback){
					co(function * () {
						let token = _.get(obj,'team.bot.bot_access_token');
						if (!token) return;
						let bot = new slack.WebClient(token);
						if (!bot) return
						async.eachSeries(obj.admins, function(admin, callback2) {
							co(function * () {
								let seen = yield db.Metrics.find({"metric":"feature.rollout.seen","data.team": obj.team.team_id ,"data.user": admin.dm, "data.feature": feature})
								if (seen && seen.length > 0) { 
									logging.info('This user has already seen this feature.', admin.name) 
									return callback2()
								}	
								logging.info('messaging ', admin.name);
							 	bot.chat.postMessage(admin.dm,'', message, function (e,r){
							 	 	if (r.ok) {
							 	 		db.Metrics.log("feature.rollout.seen", { team: obj.team.team_id, user: admin.dm, feature: feature, ts: new Date() })
											return callback2('team: ' + obj.team.team_id + ' admin: ' + admin.name + ' has been sent the new feature.');
							 	 	} else {
								 		co(function * () {
								 			var res_dm = yield request('https://slack.com/api/im.list?token=' + obj.team.bot.bot_access_token); 
								 			res_dm = JSON.parse(res_dm);
								 			var dm = res_dm.ims.find( (d) => { return d.user == admin.name })
						 				  bot.chat.postMessage(dm,'', message, function (e,r){
						 				  	if (r.ok) {
										 	 		db.Metrics.log("feature.rollout.seen", { team: obj.team.team_id, user: dm, feature: feature, ts: new Date() })
														return callback2('team: ' + obj.team.team_id + ' admin: ' + admin.name + ' has been sent the new feature.');
										 	 	} else {
				  				 				logging.info('second message sent attempt failed: ',r);
				  				 				return callback2();
				  				 			}
						 				  })
								 		})
								 	}
								})
							})
						}, function(err){
							if (err) logging.error(err);
							setTimeout(callback, 2000)
						})
					}) // end of co
			}, function(err){
				if (err) logging.error(err);
				 done()
			})
		});
 });
}
	