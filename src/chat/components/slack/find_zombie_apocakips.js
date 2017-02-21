var slack = require('@slack/client')
var argv = require('minimist')(process.argv.slice(2));
const co = require('co');
const db = require('db');
const _ = require('lodash');
//let team_id = _.get(argv,'_');
var rp = require("request-promise");

co( function * () {
  //query slackbot schema for team_ids for example db.slackbots.find({}). get ALL team_ids and put into an array.
  //team_id = decided at the terminal at the moment
  var teams = yield db.Slackbots.find({}, { team_id: 1, _id: 0 })
  teams = teams.map((team) => team.team_id);

  console.log('List of zombie kips locations.');
  console.log('----------------------------------------------');

  for (var i = 0; i<teams.length; i++){
    //get users.list in https://slack.com/api/users.list?token= with bot_access_token from channel derived from team_id
    var team_id = teams[i];
    let team = yield db.Slackbots.findOne({'team_id': team_id});

    var accessToken = team.bot.bot_access_token

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
    if(res.members){
      //console.log('There is a kip user id for team', team_id)
      var kipUser = res.members.find(function(member){return member.name === 'kip'})
      if(kipUser){
        var kipUserID = kipUser.id
        //console.log('kip user id is', kipUserID);
        
        //use https://slack.com/api/im.list?token= to find the im/dm "id" associated with the "user" id in the previous step
        url = 'https://slack.com/api/im.list?token='
        fullUrl = url+accessToken
        fullUrl = fullUrl+'&pretty=1';

        try {
          res = JSON.parse(yield rp({ url: fullUrl, method: "GET" }));
        } catch(err) {
          // console.log(err)
        }
        if(res.ims){
          imChannelList = res.ims.map((channel) => channel.id)

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

            //TODO: add code for if messages is undefined
            if(res.messages){
              var senderList = res.messages.map((message) => message.username||message.user)
  
              var numKipMessages = 0;
              var numUserMessages = 0;
              senderList.map(function(sender){
                if(sender){
                  if (sender.toLowerCase().includes("kip")||sender.includes(kipUserID)){
                    return numKipMessages++;
                  } else {
                    return numUserMessages++;
                  }
                }
              })

              if(((numUserMessages>1) && (numKipMessages==0)) || (numUserMessages>numKipMessages*2)){
                console.log('past 30 messages:', res.messages);
                console.log('# kip messages: ', numKipMessages, '# user messages: ', numUserMessages)
                console.log('team_id:', team_id, 'channel_id:', imChannelList[channel])
              }
            }
          }
        }
      }
    
    } else {
      //console.log('There is no kip user id for team', team_id)
    }
  }
  console.log('Done');
})
