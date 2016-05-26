/*
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMNh/-.    .-+ymMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMNs.     ``     .smMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMd/   `-:////:-`   :hMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMNNMMMMMMMMMMMMMMm/   .//////////-   /dMMMMMMNMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMNdo/:-:--+ymNMMMMMMMMh`  `////////////.   odhs/--.-:+sdMMMMMMMMMMMMM
MMMMMMMMMMNs-          `:omMMMMMMh`  `/////////////`  ``          `-hNMMMMMMMMMM
MMMMMMMMMh:   `-//+//-`   :hMMMMMd/   -////////////-    `..-:::-.`   :dMMMMMMMMM
MMMMMMMMy-   :oooooooo+:   -hMMMMMy.   :///////////+:-:://///////:.   :dMMMMMMMM
MMMMMMMN+   :ooooooooooo:   +mNmhy+-   `/////+oosssss//////////////.   +MMMMMMMM
MMMMMMMd:   /oooooooooooo.  `:-`      `./ossssssssssso/////////////-   +MMMMMMMM
MMMMMMMN+   -oooooooooooo+      `..-::///sssssssssssss+///////////:   .yMMMMMMMM
MMMMMMMMd:   /oooooooooooo/..-:://///////+sssssssssssss////////::.   .sMMMMMMMMM
MMMMMMNmd+`  `+oooooooossss+//////////////osssssssssssso/::-..`    .+dMMMMMMMMMM
MMMms/-.      -oosssssssssss///////////////ssssssssssoo+-      `./odMMMMMMMMMMMM
Mmo.    ``.-::/osssssssssssso//////////////+sssso++//////`   /ydNMMMMMMMMMMMMMMM
h:   `-:////////sssssssssssss+//////////::-.:////////////:   :dMMMMMMMMMMMMMMMMM
/   -///////////+sssssssssssss////::-.``     :////////////.   /NMMNmdddhdmMMMMMM
   `/////////////ossssssssssss+..`           `/////////////`  `++:.`    `.:sdMMM
   `//////////////ssssssssooooo.              -////////////:        `..`    .+mM
/   -////////////:/sooooooooooo+`              :////////////. `.:/ossssss+-   -y
d-   `-::::::-.`   /oooooooooooo:              `/////////+ossssssssssssssss+   /
MNo.               `+oooooooooooo.              -//+ossyhhhhhyssssssssssssss-
MMMNh+--.`..-:oys   -oooooooooooo+`          .-/+yhhhhhhhhhhhhysssssssssssss.  `
MMMMMMMmdmmmNMMMd/   /oooooooooooo:    .-/+osssssyhhhhhhhhhhhhhysssssssssss:   /
MMMMMMMMMMMMMMMMMy.  `+oooooooooooy++ossssssssssssyhhhhhhhhhhhhyssssssso+-`   /d
MMMMMMMMMMMMMMdhs+-   -ooooosyhdmmmmyssssssssssssssyhhhhhhhhhhhhyo+/-.     `:yNM
MMMMMMMMMMMms-.      `-shdmmmmmmmmmmdssssssssssssssyhhhhhhhysso+/`    `.-/sdMMMM
MMMMMMMMMms`   `.:/osssymmmmmmmmmmmmmhssssssssssssssyyyso+///////:   :smMMMMMMMM
MMMMMMMMd+   .+ssssssssshmmmmmmmmmmmmmyssssssssso/:-`:////////////.   oNMMMMMMMM
MMMMMMMMo   -ssssssssssssdmmmmmmmmmmmmdssso+:-`      `/////////////`  .yMMMMMMMM
MMMMMMMd/   +ssssssssssssymmmmmmmmmmdhy/.      `.::   -////////////-   +MMMMMMMM
MMMMMMMN+   /ssssssssssssshmmmddhysoooo+`  `/shmNMh-   :///////////.  `sMMMMMMMM
MMMMMMMMy-   /sssssssssss+/osoooooooooo+/   :dMMMMMo`  `://///////.   +mMMMMMMMM
MMMMMMMMMy-   `:/+o+/:.`   `+oooooooooooo.   sMMMMMMs.   `-::::-.    +mMMMMMMMMM
MMMMMMMMMMms-           `   .oooooooooooo+   /hMMMMMMdo-          `:hMMMMMMMMMMM
MMMMMMMMMMMMNds+:---:+ydy/   /ooooooooooo+   /hMMMMMMMMNho:--:--/ymMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMy.  `/ooooooooo+.   oNMMMMMMMMMMMMMNNMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMo.   -/+oooo+:`  `+NMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMdo.    ```    `-hNMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMdo/..   `--+hNMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
*/

var slack = require('@slack/client');
var co = require('co');
var kip = require('kip');
var _ = require('lodash');

var queue = require('../queue-mongo');
var db = require('../../../db')
var image_search = require('../image_search');
var search_results = require('./search_results');
var slackConnections = {};

//
// slackbots
//
co(function*() {
  var slackbots = yield db.Slackbots.find({
    'meta.deleted': {
      $ne: true
    }
  }).exec();

  kip.log('found', slackbots.length, 'slackbots');

  // Just need the RTM client to listen for messages
  slackbots.map((slackbot) => {
    var rtm = new slack.RtmClient(slackbot.bot.bot_access_token || '');
    rtm.start();
    var web = new slack.WebClient(slackbot.bot.bot_access_token || '');

    slackConnections[slackbot.team_id] = {
      rtm: rtm,
      web: web
    };

    // TODO figure out how to tell when auth is invalid
    // right now the library just console.log's a message and I can't figure out
    // how to intercept that event.
    // rtm.on(slack.CLIENT_EVENTS.RTM.INVALID_AUTH, (err) => {
    //   kip.log('invalid auth', slackbot.team_id, slackbot.team_name);
    // })

    rtm.on(slack.CLIENT_EVENTS.RTM.AUTHENTICATED, (startData) => {
      kip.log('loaded slack team', slackbot.team_id, slackbot.team_name);
    })

    rtm.on(slack.CLIENT_EVENTS.DISCONNECT, (reason) => {
      kip.log('slack client disconnected', slackbot.team_id);
      kip.log(reason); // is this even a thing?
    });


    //
    // Handle incoming slack messages.  Slack-specific pre-processing
    //
    rtm.on(slack.RTM_EVENTS.MESSAGE, (data) => {

      kip.debug('got slack message sent from user', data.user, 'on channel', data.channel);
      kip.debug(data);

      var message = new db.Message({
        incoming: true,
        thread_id: data.channel,
        original_text: data.text,
        user_id: data.user,
        origin: 'slack',
        source: data,
      });

      // don't talk to yourself
      if (data.user === slackbot.bot.bot_user_id || data.username === 'Kip') {
        kip.debug("don't talk to yourself");
        return; // drop the message before saving.
      }

      // other random things
      if (data.type !== 'message' || data.hidden === true || data.subtype === 'channel_join' || data.subtype === 'channel_leave') { //settings.name = kip's slack username
        kip.debug('will not handle this message');
        return;
      }

      //
      // 🖼 image search
      //
      if (data.subtype === 'file_share' && ['png', 'jpg', 'gif', 'jpeg', 'sgv'].indexOf(data.file.filetype.toLowerCase()) >= 0) {
        return image_search(data.file.url_private, slackbot.bot.bot_access_token, function(res) {
          message.text = res;
          message.save().then(() => {
            queue.publish('incoming', message, ['slack', data.channel, data.ts].join('.'));
          });
        });
      }

      // clean up the text
      message.text = data.text.replace(/(<([^>]+)>)/ig, ''); //remove <user.id> tag
      if (message.text.charAt(0) == ':') {
        message.text = message.text.substr(1); //remove : from beginning of string
      }
      message.text = message.text.trim(); //remove extra spaces on edges of string

      // queue it up for processing
      message.save().then(() => {
        queue.publish('incoming', message, ['slack', data.channel, data.ts].join('.'))
      });
    })
  });
}).catch((e) => {
  kip.error(e, 'error loading slackbots');
})

//
// Mechanism for responding to messages
//
kip.debug('subscribing to outgoing.slack hopefully');
queue.topic('outgoing.slack').subscribe(outgoing => {
  console.log('outgoing message');
  console.log(outgoing);
  var message = outgoing.data;

  var bot = slackConnections[message.source.team];

  if (typeof bot === 'undefined') {
    throw new Error('rtm client not registered for slack team ' + message.source.team);
  }

  var msgData = {
      icon_url:'http://kipthis.com/img/kip-icon.png',
      username:'Kip'
  };
  co(function*() {

    if (message.mode === 'shopping' && message.action === 'results' && message.amazon.length > 0) {
      msgData.attachments = yield search_results(message);
      return bot.web.chat.postMessage(message.source.channel, message.text, msgData);
    }


    bot.rtm.sendMessage(message.text, message.source.channel, () => {
      outgoing.ack();
    })

  }).then(() => {
    outgoing.ack();
  }).catch(e => {
    console.log(e.stack);
    bot.rtm.sendMessage("I'm sorry I couldn't quite understand that", message.source.channel, () => {
      outgoing.ack();
    })
  })

})
