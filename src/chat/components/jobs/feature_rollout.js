//
// *** TO RUN THIS SCRIPT *** 
// node feature_rollout TEAM_ID_1 TEAM_ID_2 TEAM_ID_3
// **************************

var utils = require('../slack/utils');
var _ = require('lodash');
var co = require('co');
var slack = require('@slack/client');
var argv = require('minimist')(process.argv.slice(2));
var teamIds = _.get(argv,'_')
var async = require('async');

console.log('argv is: ', argv);

runScript();

function runScript() {
	  let feature = 'oregano'
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
			let teams = [];
			if (teamIds && teamIds.length > 0) {
				yield teamIds.map( function * (id) {
					let teamz = yield db.Slackbots.find({'team_id': id});
					let team = _.get(teamz,'[0]');
					if (!team) {
						logging.error('\n\n\nYou entered an invalid team id in arguments: ', id,'\n\n\n');
						return 
					} 
					let admins = yield utils.findAdmins(team);
					teams.push({ team: team, admins: admins })
					return
				})
			} else {
				let slackbots = yield db.Slackbots.find();
				yield slackbots.map( function * (team) { 
					let admins = yield utils.findAdmins(team);
					teams.push({ team: team, admins: admins })
					return
				})
			}
	    logging.info('Starting feature rollout: ', feature, ' for ', teams.length, ' teams.');

			logging.info('\n Teams to be notified: ', teams.length,'\n');
			async.eachSeries(teams, function (obj, callback){
					co(function * () {
						let teamSeen = yield db.Metrics.find({"metric":"feature.rollout.seen","data.team": obj.team.team_id, "data.feature": feature});
						if (teamSeen && teamSeen.length >= obj.admins.length) { 
								logging.info('All admins in team ', obj.team.team_name,':', obj.team.team_id,' have been shown this feature.', obj.admins); 
								return callback()
						}	else if (teamSeen && teamSeen.length <= obj.admins.length) {
							  let left = obj.admins.length - teamSeen.length
								logging.info('Team ', obj.team.team_name,':', obj.team.team_id,' has ', left, ' admins left who haven\'nt seen the feature.'); 
						}
						let token = _.get(obj,'team.bot.bot_access_token');
						if (!token) return;
						let bot = new slack.WebClient(token);
						if (!bot) return
						async.eachSeries(obj.admins, function(admin, callback2) {
							co(function * () {
								let seen = yield db.Metrics.find({"metric":"feature.rollout.seen","data.team": obj.team.team_id ,"data.user": admin.dm, "data.feature": feature})
								if (seen && seen.length > 0) { 
									// logging.info('This user has already seen this feature.', admin.name) 
									return callback2()
								}	
								// logging.info('Showing ', admin.name, ' the new feature.');
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
				  				 				logging.info('second message sent attempt failed: ');
				  				 				return callback2();
				  				 			}
						 				  })
								 		})
								 	}
								})
							})
						}, function(err){
							if (err) console.log(err);
							setTimeout(callback, 2000)
						})
					}) // end of co
			}, function(err){
				if (err) console.log(err);
			})
		});
}
	