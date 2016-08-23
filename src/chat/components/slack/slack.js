/*
SLACKSLACKSLACKSLACKSLACKSLACKSLACKSLAh/-.    .-+ySLACKSLACKSLACKSLACKSLACKSLACK
SLACKSLACKSLACKSLACKSLACKSLACKSLACKNs.     ``     .sSLACKSLACKSLACKSLACKSLACKSLA
SLACKSLACKSLACKSLACKSLACKSLACKSLACd/   `-:////:-`   :hSLACKSLACKSLACKSLACKSLACKM
SLACKSLACKSLACKSLANSLACKSLACKSLACK/   .//////////-   /dSLACKSLSLACKSLACKSLACKSLA
SLACKSLACKSLAdo/:-:--+ymNSLACKSLAh`  `////////////.   odhs/--.-:+sdSLACKSLACKSLA
SLACKSLACKNs-          `:oSLACKSLh`  `/////////////`  ``          `-hNSLACKSLACK
SLACKSLACh:   `-//+//-`   :hSLACKd/   -////////////-    `..-:::-.`   :dSLACKSLAC
SLACKSLAy-   :oooooooo+:   -hSLACKy.   :///////////+:-:://///////:.   :dSLACKSLA
SLACKSLA+   :ooooooooooo:   +mNmhy+-   `/////+oosssss//////////////.   +SLACKSLA
SLACKSLd:   /oooooooooooo.  `:-`      `./ossssssssssso/////////////-   +SLACKSLA
SLACKSLA+   -oooooooooooo+      `..-::///sssssssssssss+///////////:   .ySLACKSLA
SLACKSLAd:   /oooooooooooo/..-:://///////+sssssssssssss////////::.   .sSLACKSLAC
SLACKSLmd+`  `+oooooooossss+//////////////osssssssssssso/::-..`    .+dSLACKSLACK
SLAms/-.      -oosssssssssss///////////////ssssssssssoo+-      `./odSLACKSLACKSL
Mmo.    ``.-::/osssssssssssso//////////////+sssso++//////`   /ydNSLACKSLACKSLACK
h:   `-:////////sssssssssssss+//////////::-.:////////////:   :dSLACKSLACKSLACKSL
/   -///////////+sssssssssssss////::-.``     :////////////.   /SLACKSLACKSLACKSL
   `/////////////ossssssssssss+..`           `/////////////`  `++:.`    `.:sdSLA
   `//////////////ssssssssooooo.              -////////////:        `..`    .+mM
/   -////////////:/sooooooooooo+`              :////////////. `.:/ossssss+-   -y
d-   `-::::::-.`   /oooooooooooo:              `/////////+ossssssssssssssss+   /
SLo.               `+oooooooooooo.              -//+ossyhhhhhyssssssssssssss-
MSLAh+--.`..-:oys   -oooooooooooo+`          .-/+yhhhhhhhhhhhhysssssssssssss.  `
SLACKSLmdmmmNSLAd/   /oooooooooooo:    .-/+osssssyhhhhhhhhhhhhhysssssssssss:   /
SLACKSLACKSLACKSLy.  `+oooooooooooy++ossssssssssssyhhhhhhhhhhhhyssssssso+-`   /d
SLACKSLACKSLACdhs+-   -ooooosyhdmmmmyssssssssssssssyhhhhhhhhhhhhyo+/-.     `:yNM
SLACKSLACKMms-.      `-shdmmmmmmmmmmdssssssssssssssyhhhhhhhysso+/`    `.-/sdSLAC
SLACKSLACKs`   `.:/osssymmmmmmmmmmmmmhssssssssssssssyyyso+///////:   :sSLACKSLAC
SLACKSLAd+   .+ssssssssshmmmmmmmmmmmmmyssssssssso/:-`:////////////.   oNSLACKSLA
SLACKSLAo   -ssssssssssssdmmmmmmmmmmmmdssso+:-`      `/////////////`  .ySLACKSLA
SLACKSLd/   +ssssssssssssymmmmmmmmmmdhy/.      `.::   -////////////-   +SLACKSLA
SLACKSLA+   /ssssssssssssshmmmddhysoooo+`  `/shmNMh-   :///////////.  `sSLACKSLA
SLACKSLAy-   /sssssssssss+/osoooooooooo+/   :dSLACKo`  `://///////.   +SLACKSLAC
SLACKSLACy-   `:/+o+/:.`   `+oooooooooooo.   sSLACKMs.   `-::::-.    +SLACKSLACK
SLACKSLACKms-           `   .oooooooooooo+   /hSLACKMdo-          `:hSLACKSLACKM
SLACKSLACKSLAds+:---:+ydy/   /ooooooooooo+   /hSLACKMSLAho:--:--/ySLACKSLACKSLAC
SLACKSLACKSLACKSLACKSLACKy.  `/ooooooooo+.   oNSLACKSLACKMSLANSLACKSLACKSLACKSLA
SLACKSLACKSLACKSLACKSLACKMo.   -/+oooo+:`  `+NSLACKSLACKSLACKSLACKSLACKSLACKSLAC
SLACKSLACKSLACKSLACKSLACKSLdo.    ```    `-hNSLACKSLACKSLACKSLACKSLACKSLACKSLACK
SLACKSLACKSLACKSLACKSLACKSLACdo/..   `--+hNSLACKSLACKSLACKSLACKSLACKSLACKSLACKSL
*/

var slack = require('@slack/client');
var co = require('co');
var _ = require('lodash');
var winston = require('winston');

var kip = require('kip');
var queue = require('../queue-mongo');
var image_search = require('../image_search');
var search_results = require('./search_results');
var focus = require('./focus');
var cart = require('./cart');
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
      web: web,
      slackbot: slackbot
    };

    // TODO figure out how to tell when auth is invalid
    // right now the library just winston.debug's a message and I can't figure out
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
  try {
    winston.debug('outgoing message');
    winston.debug(outgoing);
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

      if (message.action === 'typing') {
        return bot.rtm.sendMessage('typing...', message.source.channel, () => {
          outgoing.ack();
        })
      }

      if (message.mode === 'shopping' && message.action === 'results' && message.amazon.length > 0) {
        msgData.attachments = yield search_results(message);
        return bot.web.chat.postMessage(message.source.channel, message.text, msgData);
      }

      if (message.mode === 'shopping' && message.action === 'focus' && message.focus) {
        msgData.attachments = yield focus(message);
        return bot.web.chat.postMessage(message.source.channel, message.text, msgData);
      }

      if (message.mode === 'cart' && message.action === 'view') {
        msgData.attachments = yield cart(message, bot.slackbot, false);
        return bot.web.chat.postMessage(message.source.channel, message.text, msgData);
      }


      bot.rtm.sendMessage(message.text, message.source.channel, () => {
        outgoing.ack();
      })

    }).then(() => {
      outgoing.ack();
    }).catch(e => {
      winston.debug(e.stack);
      bot.rtm.sendMessage("I'm sorry I couldn't quite understand that", message.source.channel, () => {
        outgoing.ack();
      })
    })
  } catch (e) {
    kip.err(e);
  }
})




// slack auth server 🌏
var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var server = require('http').createServer(app);
app.use(express.static(__dirname + '/static'))
app.get('/healthcheck', function (req, res) {
  res.send('💬 🌏')
})

//parse incoming body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


server.listen(8000, function(e) {
  if (e) { winston.debug(e) }
  winston.debug('chat app listening on port 8000 🌏 💬')
})
//* * * * * //



/**
 * This /slackaction POST function handles Slack actions (i.e. button taps)
 * @param {Object} req incoming message object from Slack
 * @returns {Object} res send same, modified, or no message object back to Slack
 */
app.post('/slackaction', function(req, res) {

    co(function* () {

        //handle incoming slack buttons
        if (req.body && req.body.payload){

          var parsedIn = JSON.parse(req.body.payload);  



          if (!req.body || !req.body.payload) {
            kip.err('slack action did not have a body or payload');
            res.sendStatus(500);
          }

          var parsedIn = JSON.parse(req.body.payload);
          kip.debug('got slack action', parsedIn.actions[0].name);

          //validating real button call
          if (parsedIn.token !== 'FMdYRIajPq9BdVztkGRpgSEP') {
            kip.debug('slack action token did not match 👻 ', parsedIn.token)
          }

          if (!parsedIn.response_url || !parsedIn.original_message) {
            kip.error('slack buttons broke, need a response_url and original_message');
            res.sendStatus(500);
            return;
          }

          var navId = parsedIn.team.id + '_' + parsedIn.channel.id + '_' + parsedIn.user.id;

          //penguin nav button
          if (parsedIn.actions[0].name == 'home') {

            navHistory[navId] = JSON.stringify(parsedIn.original_message); //saving current nav

            var reformattedArray = parsedIn.original_message.attachments.map(function(obj) {
              if (obj.actions) {

                //DONT SHOW MEMBERS LIST BUTTON TO NON ADMINS
                obj.actions.map(function(obj2) {
                  if (obj2.name == 'home') {
                    obj.actions = buttonTemplate.slack_home;
                  }
                })
              }
              return obj;
            });


            var newRes = parsedIn.original_message;

            newRes.attachments = reformattedArray;

            kip.debug('PARSE OUT ', newRes)

            res.json(newRes);

          } else if (parsedIn.actions[0].name == 'back') {

            if (navHistory[navId]) {
              res.json(JSON.parse(navHistory[navId]));
            }

          } else {

            // var stringOrig = JSON.stringify(parsedIn.original_message);

            // kip.debug('STRING ORG22222 ', stringOrig)
            // request.post(
            //   parsedIn.response_url,
            //   {
            //     payload: stringOrig
            //   },
            //   function(err, res, body) {
            //     kip.err(err, 'error posting to slack api in response to the slack action');
            //   }
            // );

            res.send(parsedIn.original_message);

            ioKip.incomingMsgAction(req.body, 'slack');

          }


          //* * * *  **  * * * * * * *//

          // response_url {String} 
          if (parsedIn.response_url && parsedIn.original_message){
            var stringOrig = JSON.stringify(parsedIn.original_message);
            //send back original message using reponse_url
            request.post(
                parsedIn.response_url,
                { payload: stringOrig },
                function (err, res, body) {
                  winston.debug('post err ',err)
                }
            );
          }else {
            winston.debug('slack buttons broke, need a response_url');
            return;
          }
        }else {
          res.sendStatus(200);
        }
    }).catch(function(err){
        winston.debug('co err ',err);
    });

});


/**
 * This /slackauth GET function handles Slack app auth requests 
 * @param {Object} req incoming user auth object from Slack
 * @returns {Object} res redirect authed user to Success page
 */
app.get('/slackauth', function(req, res) {


    //test auth with this URL:
    //https://slack.com/oauth/pick_reflow?scope=commands+bot+users%3Aread&client_id=2804113073.70750953120

    winston.debug('incoming Slack action BODY: ',req.body);

    //redirect user after Slack auth
    res.redirect('/thanks')



    //save team to DB 
    //start onboarding for team


});

app.get('/thanks', function(req, res) {
  //var thanks = fs.readFileSync(__dirname + '/thanks.html', 'utf8');
  res.send('<html>ok</html>');
})



// app.get('/newslack', function(req, res) {

// });


//
// incoming slack action
//
app.post('/slackaction', function(req, res) {
  if (!req.body || !req.body.payload) {
    kip.err('slack action did not have a body or payload');
    res.sendStatus(500);
  }

  var parsedIn = JSON.parse(req.body.payload);
  kip.debug('got slack action', parsedIn.actions[0].name);

  //validating real button call
  if (parsedIn.token !== 'FMdYRIajPq9BdVztkGRpgSEP') {
    kip.debug('slack action token did not match 👻 ', parsedIn.token)
  }

  if (!parsedIn.response_url || !parsedIn.original_message) {
    kip.error('slack buttons broke, need a response_url and original_message');
    res.sendStatus(500);
    return;
  }

  var navId = parsedIn.team.id + '_' + parsedIn.channel.id + '_' + parsedIn.user.id;

  //penguin nav button
  if (parsedIn.actions[0].name == 'home') {

    navHistory[navId] = JSON.stringify(parsedIn.original_message); //saving current nav

    var reformattedArray = parsedIn.original_message.attachments.map(function(obj) {
      if (obj.actions) {

        //DONT SHOW MEMBERS LIST BUTTON TO NON ADMINS
        obj.actions.map(function(obj2) {
          if (obj2.name == 'home') {
            obj.actions = buttonTemplate.slack_home;
          }
        })
      }
      return obj;
    });


    var newRes = parsedIn.original_message;

    newRes.attachments = reformattedArray;

    kip.debug('PARSE OUT ', newRes)

    res.json(newRes);

  } else if (parsedIn.actions[0].name == 'back') {

    if (navHistory[navId]) {
      res.json(JSON.parse(navHistory[navId]));
    }

  } else {

    // var stringOrig = JSON.stringify(parsedIn.original_message);

    // kip.debug('STRING ORG22222 ', stringOrig)
    // request.post(
    //   parsedIn.response_url,
    //   {
    //     payload: stringOrig
    //   },
    //   function(err, res, body) {
    //     kip.err(err, 'error posting to slack api in response to the slack action');
    //   }
    // );

    res.send(parsedIn.original_message);

    ioKip.incomingMsgAction(req.body, 'slack');

  }
});




// incoming email from sendgrid
// In development we're currently using peter's sendgrid api key etc
app.post('/emailincoming', busboy({
  immediate: true
}), function(req, res) {
  kip.debug('hitting /emailincoming')
  req.body = {};
  req.busboy.on('field', (k, v) => {
    req.body[k] = v;
  })

  req.busboy.on('finish', () => {
    db.Metrics.log('email.incoming', req.body);
    email.process(req.body).catch((e) => {
      kip.error(e.stack);
    })
    res.sendStatus(200);
  })
})

//user hit unsubsctibe link in email
app.get('/unsubscribe/:email', function(req, res) {
  var email = req.params.email.slice(0, req.params.email.length-1).replace('-at-','@');
  console.log('hitting /unsubscribe ', email);
  db.Metrics.log('email.unsubscribe', {email: email});

    var post_body = {
        "recipient_emails": [
          email
        ]
      }

    request({
          url: 'https://api.sendgrid.com/v3/asm/suppressions/global',
          headers: {
            'Authorization': 'Bearer EAAT6cw81jgoBAFtp7OBG0gO100ObFqKsoZAIyrtClnNuUZCpWtzoWhNVZC1OI2jDBKXhjA0qPB58Dld1VrFiUjt9rKMemSbWeZCsbuAECZCQaom2P0BtRyTzpdKhrIh8HAw55skgYbwZCqLBSj6JVqHRB6O3nwGsx72AwpaIovTgZDZD'
          },
          method: 'DELETE',
          json: post_body
      }, function(err, res, body) {
          if (err) console.error('post err ', err);
          console.log(body);
      });

});
