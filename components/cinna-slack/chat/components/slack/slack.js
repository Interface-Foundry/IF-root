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

var slackConnections = {};

//
// slackbots
//
co(function*() {
  var slackbots = yield db.Slackbots.find({
    delete: { $ne: true }
  }).exec();

  kip.log('found', slackbots.length, 'slackbots');

  // Just need the RTM client to listen for messages
  var slackConnections = {};
  slackbots.map((slackbot) => {
    var rtm = new slack.RtmClient(slackbot.bot.bot_access_token || '');
    rtm.start();

    slackConnections[slackbot.team_id] = rtm;

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

    rtm.on(slack.RTM_EVENTS.MESSAGE, (data) => {
      data.origin = 'slack';
      kip.debug('slack message sent to team', slackbot.team_id, 'from user', data.user, 'on channel', data.channel);
      kip.debug(data);

      //
      // ignore some messages we won't respond to 😒
      //

      // don't talk to yourself
      if (data.user === slackbot.bot.bot_user_id || data.username === 'Kip') {
        kip.debug("don't talk to yourself");
        return; // drop the message
      }

      // other random things
      if (data.type !== 'message' || data.hidden === true || data.subtype === 'channel_join' || data.subtype === 'channel_leave'){ //settings.name = kip's slack username
        kip.debug('will not handle this message');
        return;
      }

      //
      // 🖼 image search
      //
      if (data.subtype === 'file_share' && ['png', 'jpg', 'gif', 'jpeg', 'sgv'].indexOf(data.file.filetype.toLowerCase()) >= 0) {
        image_search(data.file.url_private, slackbot.bot.bot_access_token, function(res){
            data.text = res;
            data.imageTags = res;
            queue.publish('incoming', data, ['slack', data.channel, data.ts].join('.'));
        });
      }

      // clean up the text
      data.text = data.text.replace(/(<([^>]+)>)/ig, ''); //remove <user.id> tag
      if (data.text.charAt(0) == ':'){
          data.text = data.text.substr(1); //remove : from beginning of string
      }
      data.text = data.text.trim(); //remove extra spaces on edges of string

      // queue it up for processing
      queue.publish('incoming', data, ['slack', data.channel, data.ts].join('.'))
    })
  });
}).catch((e) => {
  kip.error(e, 'error loading slackbots');
})

//
// Mechanism for responding to messages
//
kip.debug('subscribing to outgoing.slack hopefully');
queue.topic('outgoing.slack').subscribe(msg => {
  console.log('outgoing message');
  console.log(msg.data);
  msg.ack();
})
