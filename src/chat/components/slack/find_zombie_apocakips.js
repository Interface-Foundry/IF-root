var slack = require('@slack/client')
var argv = require('minimist')(process.argv.slice(2));
const co = require('co');
const db = require('db');
const _ = require('lodash');
let team_id = _.get(argv,'_');
var rp = require("request-promise");

co( function * () {
//query slackbot schema for team_ids for example db.slackbots.find({})
//team_id = decided at the terminal at the moment


//get users.list in https://slack.com/api/users.list?token= with bot_access_token from channel derived from team_id
  let team = yield db.Slackbots.findOne({'team_id': team_id});

  //TODO replace with dynamic accessToken
  var accessToken = team.bot.bot_access_token
  

  console.log('Loaded team: ', accessToken)

  let url = 'https://slack.com/api/users.list?token='
  var fullUrl = url+accessToken
  fullUrl = fullUrl+'&pretty=1';

  let res;
  try {
    res = JSON.parse(yield rp({ url: fullUrl, method: "GET" }));
  } catch(err) {
    // console.log(err)
  }

  //var kipUserID = res;
  //TODO: if members is blank, do something
  if(res.members){
    console.log('There is a kip user id for team', team_id)
    var kipUserID = res.members.find(function(member){return member.name === 'kip'}).id
    console.log('kip user id is', kipUserID);


    //use https://slack.com/api/im.list?token= to find the im/dm "id" associated with the "user" id in the previous step
    url = 'https://slack.com/api/im.list?token='
    fullUrl = url+accessToken
    fullUrl = fullUrl+'&pretty=1';

    try {
      res = JSON.parse(yield rp({ url: fullUrl, method: "GET" }));
    } catch(err) {
      // console.log(err)
    }

    imChannelList = res.ims.map((channel) => channel.id)
    //console.log('im channel list is', imChannelList);
    console.log('List of zombie kips locations.');
    console.log('----------------------------------------------');

    for (var channel = 0; channel<imChannelList.length; channel++){
      url = 'https://slack.com/api/im.history?token='
      fullUrl = url+accessToken
      channelArg = '&channel='+imChannelList[channel]+'&count=30'
      fullUrl = fullUrl + channelArg
      //console.log(fullUrl)

      try {
        res = JSON.parse(yield rp({ url: fullUrl, method: "GET" }));
      } catch(err) {
        // console.log(err)
      }

     // console.log('past 30 messages:', res.messages);
    //TODO: add code for if messages is undefined
    if(res.messages){
            var senderList = res.messages.map((message) => message.username||message.user)
  
      var numKipMessages = 0;
      var numUserMessages = 0;
      senderList.map(function(sender){
        if (sender.includes("kip")||sender.includes(kipUserID)){
          return numKipMessages++;
        } else {
          return numUserMessages++;
        }
      })
/*
    console.log('# kip messages: ', numKipMessages)
    console.log('# user messages: ', numUserMessages)
    console.log(numKipMessages>=numUserMessages ? 'kip not a zombie here' : 'kip is a zombie here')
*/

      if(numUserMessages>numKipMessages){
        console.log('team_id:', team_id, 'channel_id:', imChannelList[channel])
      }
    }
    }

  } else {
  console.log('There is no kip user id for team', team_id)
  }

	
	// https://slack.com/api/team.info
	// token

})
