
var agenda = require('./agendas');
var utils = require('./slack/utils');
var _ = require('lodash');
var co = require('co');
var slack = require('@slack/client');
var argv = require('minimist')(process.argv.slice(2));
// var path = _.get(argv,'_');

console.log('argv: ', argv)

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
      name: "onboard.start.lunch",
      text: "✓ Ok",
      style: "primary",
      type: "button",
      value: "lunch"
    }]
  }]
}
// const scheduleMessageToAdmins = function(teamIds, dateString) {
	// let date = new Date(dateString);
co(function * () {
	let teams = yield ['T0HLZP09L'].map( function * (id) { 
		let team = yield db.Slackbots.findOne({'team_id':id}).exec()
		let admins = yield utils.findAdmins(team);
		return { team: team, admins: admins}})
	// console.log('teams: ', teams);
	yield teams.map( function * (obj) {
		let bot = new slack.WebClient(obj.team.bot.bot_access_token || '');
		if (!bot) return
		yield obj.admins.map( function * (admin) {
			 console.log('messaging ', admin.dm);
			 setTimeout(function() {
			 	 bot.chat.postMessage(admin.dm,'', message, function (e,r){
				 	if (!r.ok) {
				 		co(function * () {
				 			var res_dm = yield request('https://slack.com/api/im.list?token=' + obj.team.bot.bot_access_token); 
				 			res_dm = JSON.parse(res_dm);
				 			var dm = res_dm.ims.find( (d) => { return d.user == admin.name })
		 				  bot.chat.postMessage(dm,'', message, function (e,r){
  				 			console.log(r);
		 				  })
				 		})
				 	}
				 })
			 }, 1000)
			 return
		})
	})
});
	