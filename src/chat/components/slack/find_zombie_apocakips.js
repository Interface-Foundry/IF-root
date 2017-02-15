var slack = require('@slack/client')
var argv = require('minimist')(process.argv.slice(2));
const co = require('co');
const db = require('db');
const _ = require('lodash');
let team_id = _.get(argv,'_');
var rp = require("request-promise");

co( function * () {
//query slackbot schema for team_ids
//team_id = T36KN9RJT at the moment

//get users.list in https://slack.com/api/users.list?token= with bot_access_token from channel derived from team_id
  let team = yield db.Slackbots.findOne({'team_id': team_id});
  console.log('Loaded team: ', team.bot.bot_access_token)

  let url = 'https://slack.com/api/users.list?token='
  var fullUrl = url+team.bot.bot_access_token
  fullUrl = fullUrl+'&pretty=1';

  let res;
  try {
    res = JSON.parse(yield rp({ url: fullUrl, method: "GET" }));
  } catch(err) {
    // console.log(err)
  }
  var kipUserID = res.members.find(function(member){return member.name === 'kip'}).id
  console.log('kip user id is', kipUserID);


//use https://slack.com/api/im.list?token= to find the im/dm "id" associated with the "user" id in the previous step

  //let url = 'https://slack.com/api/users.getPresence?token='
  //let url = 'https://slack.com/api/users.info?token='


  url = 'https://slack.com/api/im.list?token='
  fullUrl = url+team.bot.bot_access_token



  fullUrl = fullUrl+'&pretty=1';

  try {
    res = JSON.parse(yield rp({ url: fullUrl, method: "GET" }));
  } catch(err) {
    // console.log(err)
  }
  console.log('im channel list is', res);



//from slack test
//D35830MUG twong with twong
//D3H3RUMV0 twong with kip
//D36N1KYDC twong with twong9790-kipbot
//D3HRQL2MV twong with terrotim

//not from slack test
//D364RAWNR twong with slackbot
//D36N1KYDC twong with twong9790-kipbot
//D3GE1QBQ8 terrotim with twong9790-kipbot

//get IM history from all dm channel
/*
  url = 'https://slack.com/api/im.history?token='
  fullUrl = url+team.bot.bot_access_token
  channelArg = '&channel=D3GE1QBQ8&count=5'
  fullUrl = fullUrl + channelArg
*/

	
	// https://slack.com/api/team.info
	// token

})
