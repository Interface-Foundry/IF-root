var botkit = require('botkit')

var controller = botkit.slackbot();


/*
slackbot: slackbot_schema
message: slack message { type: 'message',
  channel: 'D0SALMKAB',
  user: 'U0R6NPHDM',
  text: 'bitch please',
  ts: '1458243631.000011',
  team: 'T0R6J00JW' }
*/
module.exports = {}
module.exports.onboard = function(slackbot, user_id) {
  var bot = controller.spawn({
    token: slackbot.bot.bot_access_token
  })

  bot.startRTM(function(err, bot, payload) {
    if (err) {
      throw new Error('Could not connect to Slack');
    }

    bot.startPrivateConversation({user: user_id}, askWhoManagesPurchases);
  });
}

/*

office location, budget, how often order from amazon. do you already have a slack channel for purchases? we will post weekly reports there?

the admin then should be able to add, remove, modify executive assistants
*/


// Apparently we are plunging headlong into the dark black void of enterprise
// organizational structure and authorization. welp, gotta make money somehow.
function askWhoManagesPurchases(response, convo) {
  convo.ask('Who manages the office purchases?', function(response, convo) {
    console.log(response);
    convo.say('Great.  This person now has one more thing to keep on top of every week, I hope you\'re happy.')
    convo.next();
  })
}

// TODO do these even matter?
function askLocation(response, convo) {
  convo.ask('What is your office address?', function(response, convo) {
    convo.say('Ok.')
    askBudget(response, convo)
    convo.next();
  })
}

function askBudget(response, convo) {
  convo.ask('What is your weekly budget?', function(response, convo) {
    convo.say('Great.')

  })
}
