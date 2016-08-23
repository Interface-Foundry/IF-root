
/**
 * This function 
 * @param {Object} req incoming user auth object from Slack
 * @returns {Object} res redirect authed user to Success page
 */


// Slack app registration
var startOnboarding = function(){
    // to test this, go to https://api.slack.com/docs/slack-button and deselect "incoming webhook" and select "bot"

    //
}

/**
 * This function 
 * @param {Object} req incoming user auth object from Slack
 * @returns {Object} res redirect authed user to Success page
 */
var addNewTeam = function(){

    // omg fucking shoot me
    kip.debug('new slack integration request');
    
    if (!req.query.code) {
        ioKip.newSlack();
        return winston.debug('no code in the request, cannot process team add to slack');
    }


    var clientID = '2804113073.70750953120';
    var clientSecret = 'f551ddfc0e294e49a5ebacb8633bbd86';
    var redirect_uri = 'https://39645f46.ngrok.io/slackauth';

    var body = {
      code: req.query.code,
      redirect_uri: redirect_uri
    }


    //REF FUNCTION HERE TO GET SLACK AUTH KEY, STORES IN DB
    //FIRE ONBOARDING FOR NEW TEAM


    //ㅔㅐㄴㅅ ㄱㄷ볃ㄴㅅ 랙 
    //post request for auth token
    request({
      url: 'https://' + clientID + ':' + clientSecret + '@slack.com/api/oauth.access',
      method: 'POST',
      form: body
    }, function(e, r, b) {
        if (e) {
          winston.debug('error connecting to slack api');
          winston.debug(e);
        }
        if (typeof b === 'string') {
            b = JSON.parse(b);
        }
        if (!b.ok) {
            winston.debug('error connecting with slack, ok = false')
            winston.debug('body was', body)
            winston.debug('response was', b)
            return;
        } else if (!b.access_token || !b.scope) {
            winston.debug('error connecting with slack, missing prop')
            winston.debug('body was', body)
            winston.debug('response was', b)
            return;
        }

        winston.debug('got positive response from slack')
        winston.debug('body was', body)
        winston.debug('response was', b)


        processTeam();

    })


    if (!req.query.code) {
        ioKip.newSlack();
        return winston.debug('no code in the request, cannot process team add to slack');
    }

    //these need to be removed and stored in Vault
    var clientID = process.env.NODE_ENV === 'production' ? '2804113073.14708197459' : '52946721872.53047577702';
    var clientSecret = process.env.NODE_ENV === 'production' ? 'd4c324bf9caa887a66870abacb3d7cb5' : '7989b267194bfa98782340007c08d088';
    var redirect_uri = process.env.NODE_ENV === 'production' ? 'https://kipsearch.com/newslack' : 'https://5947ceef.ngrok.io/newslack';

    var body = {
        code: req.query.code,
        redirect_uri: redirect_uri
    }

    request({
        url: 'https://' + clientID + ':' + clientSecret + '@slack.com/api/oauth.access',
        method: 'POST',
        form: body
    }, function(e, r, b) {
        if (e) {
            kip.debug('error connecting to slack api');
            kip.debug(e);
        }
    if (typeof b === 'string') {
        b = JSON.parse(b);
    }
    if (!b.ok) {
        kip.error('error connecting with slack, ok = false')
        kip.error('body was', body)
        kip.error('response was', b)
        return;
    } else if (!b.access_token || !b.scope) {
        kip.error('error connecting with slack, missing prop')
        kip.error('body was', body)
        kip.error('response was', b)
        return;
    }

    kip.debug('got positive response from slack')
    kip.debug('body was', body)
    kip.debug('response was', b)
    db.Metrics.log('slackbutton', b);
    var bot = new db.Slackbot(b)

    db.Slackbots.findOne({
        team_id: b.team_id,
        deleted: {
            $ne: true
        }
    }, function(e, old_bot) {
      if (e) {
        kip.error(e)
      }

      if (old_bot) {
        kip.debug('already have a bot for this team', b.team_id)
        kip.debug('updating i guess')
        _.merge(old_bot, b);
        old_bot.save(e => {
            kip.err(e);
            ioKip.newSlack();
        });
      } else {
        bot.save(function(e) {
            kip.err(e);
            ioKip.newSlack();
        })
      }
    })
    });
}


function startOnboarding = function(){



    //co here

    //function: find all new teams

    //take results and 


    //find new teams to onboard (not initialized)
    Slackbots.find({'meta.initialized': false}).exec(function(err, users) {
        if(err){
            console.log('saved slack bot retrieval error');
        }
        else {
            loadSlackUsers(users);
        }
    });



        //load slack users into memory, adds them as slack bots
        function loadSlackUsers(users){
            console.log('loading '+users.length+' Slack users');

            async.eachSeries(users, function(user, callback) {


                var token = user.bot.bot_access_token || '';

                slackUsers[user.team_id] = new RtmClient(token);
                slackUsers_web[user.team_id] = new WebClient(token);

                slackUsers[user.team_id].start();


                //* * * Adding Botkit to Kip IO ~ ~ ~//
                //not reliable framework vs Slack SDK

                // var bot = controller.spawn({
                //     token: token
                // });
                // bot.startRTM(function(err, bot, payload) {
                //     console.log('ADDED BOTKIT ! ! ! ! ! ! !  ! ! ! ! ! ! ! ! ! ! !  ! ! ! ! ! ! ! ! !  ! ! ! !')
                //     // console.log('bot ',bot);
                //     // console.log('payload ',payload)
                //     slackUsers_botkit[user.team_id] = bot;
                // });

                // - - - - - - - - - - - - - - - - - //

                //on slack auth
                slackUsers[user.team_id].on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
                    console.log('DEBUG: checking meta initialized: ', user.meta.initialized);
                    //* * * * Welcome message * * * //
                    //send welcome to new teams – dont spam all slack people on node reboot

                    if (rtmStartData.self){
                        slackUsers[user.team_id].botId = rtmStartData.self.id;
                        slackUsers[user.team_id].botName = rtmStartData.self.name;
                    }

                    //this if here for dev testing
                    if (cinnaEnv === 'development_alyx_NAH'){
                        //
                        // Onboarding conversation
                        //

                        // var hello = {
                        //     msg: 'welcome',
                        //     source: {
                        //       origin: 'slack',
                        //       channel: 'D0H6X6TA8',
                        //       org: user.team_id,
                        //       id: user.team_id + '_' + 'D0H6X6TA8'
                        //     },
                        //     action:'sendAttachment',
                        //     client_res: [],
                        //     botId: slackUsers[user.team_id].botId, //this is the name of the bot on the channel so we can @ the bot
                        //     botName: slackUsers[user.team_id].botName //this is the name of the bot on the channel so we can @ the bot
                        // };

                        // banter.welcomeMessage(hello, function(res) {
                        //     hello.client_res.push(res);
                        //     //send attachment!
                        //     sendResponse(hello);
                        // })
                    }
                    else if (cinnaEnv === 'development_mitsu'){
                        //
                        // Onboarding conversation
                        //
                        // var hello = {
                        //     msg: 'welcome',
                        //     source: {
                        //       origin: 'slack',
                        //       channel: 'D0HLZLBDM',
                        //       org: user.team_id,
                        //       id: user.team_id + '_' + 'D0HLZLBDM'
                        //     },
                        //     action:'sendAttachment',
                        //     client_res: [],
                        //     botId: slackUsers[user.team_id].botId, //this is the name of the bot on the channel so we can @ the bot
                        //     botName: slackUsers[user.team_id].botName //this is the name of the bot on the channel so we can @ the bot
                        // };

                        // banter.welcomeMessage(hello, function(res) {
                        //     hello.client_res.push(res);
                        //     //send attachment!
                        //     sendResponse(hello);
                        // })
                    }
                    else if (user.meta && user.meta.initialized == false){

                        init_team(user, function(e, addedBy) {
                            if(cinnaEnv !== "development_alyx"){
                                user.meta.initialized = true;
                            }

                            if (typeof user.save === 'function') {
                              user.save();
                            }

                            //
                            // Onboarding conversation

                            if (cinnaEnv === 'development_alyx'){
                                var data = {
                                    msg: 'welcome',
                                    source: {
                                      origin: 'slack',
                                      channel: 'D0H6X6TA8',
                                      org: 'T02PN3B25',
                                      id: 'T02PN3B25' + '_' + 'U02PN3T5R',
                                      user: 'U02PN3T5R'
                                    },
                                    //action:'sendAttachment',
                                    client_res: [],
                                    botId: slackUsers[user.team_id].botId, //this is the name of the bot on the channel so we can @ the bot
                                    botName: slackUsers[user.team_id].botName, //this is the name of the bot on the channel so we can @ the bot,
                                    mode: 'onboarding' //start onboarding mode
                                };
                            }else {
                                var data = {
                                    msg: 'welcome',
                                    source: {
                                      origin: 'slack',
                                      channel: addedBy.dm,
                                      org: user.team_id,
                                      id: user.team_id + '_' + addedBy.id,
                                      user: addedBy.id
                                    },
                                    //action:'sendAttachment',
                                    client_res: [],
                                    botId: slackUsers[user.team_id].botId, //this is the name of the bot on the channel so we can @ the bot
                                    botName: slackUsers[user.team_id].botName, //this is the name of the bot on the channel so we can @ the bot
                                    mode: 'onboarding' //start onboarding mode
                                };
                            }

                            if(!kipUser[data.source.id]){
                               kipUser[data.source.id] = {}; //omg lol
                            }
                            kipUser[data.source.id].slack = user; //transfer conversation to global
                            updateMode(data);

                        })
                    }

                });



}

