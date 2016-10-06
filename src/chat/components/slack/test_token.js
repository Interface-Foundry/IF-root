var slack = require('@slack/client');
var tokens_to_test = ['xoxp-81388179574-81339176883-81402657543-16dadcbcad'];

tokens_to_test.map(t => {
  var rtm = new slack.RtmClient(t);
  rtm.on(slack.CLIENT_EVENTS.RTM.AUTHENTICATED, (startData) => {
    console.log('yay this slack team is all right!', t);
  })
  rtm.start();
});

/*
{
	"access_token" : "xoxp-81388179574-81339176883-81402657543-16dadcbcad",
	"scope" : "identify,bot,commands,users:read",
	"team_name" : "Kip Test Bot",
	"team_id" : "T2DBE59GW",
	"meta" : {
		"cart_channels" : [],
		"weekly_status_timezone" : "America/New_York",
		"weekly_status_time" : "4:00 PM",
		"weekly_status_day" : "Friday",
		"weekly_status_enabled" : true,
		"office_assistants" : [
			"U2D9Z56RZ"
		],
		"initialized" : true,
		"dateAdded" : ISODate("2016-06-22T01:45:22.809Z"),
		"addedBy" : "U2D9Z56RZ"
	},
	"bot" : {
		"bot_user_id" : "U2D9Z56RZ",
		"bot_access_token" : "xoxb-53104853728-c8sIZh4ylRGtbgJQqaGTsEGw"
	}
	}

{
	"_id" : ObjectId("56fbf8938405cf2f098e1d5c"),
	"access_token" : "xoxp-25222000642-25226799463-30590811828-e8247d4608",
	"scope" : "identify,bot,commands,users:read",
	"team_name" : "midwestfurries",
	"team_id" : "T0R6J00JW",
	"meta" : {
		"initialized" : true,
		"dateAdded" : ISODate("2016-03-30T16:02:27.104Z"),
		"addedBy" : "U0R6NPHDM",
		"office_assistants" : [
			"U0R6NPHDM"
		]
	},
	"bot" : {
		"bot_user_id" : "U0R6H9BKN",
		"bot_access_token" : "xoxb-25221317668-SJ9jQ3uBnHsTOS49jtTZy879"
	},
	"__v" : 1
}
*/
