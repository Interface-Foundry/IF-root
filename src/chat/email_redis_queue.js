
var mongoose = require('mongoose'),
    _ = require('underscore'),
    db = require('db'),
    Chatuser = db.Chatuser,
    redis = require('redis'),
    client = redis.createClient(),
    request = require('request'),
    async = require('async'),
    preProcess = require('./components/io').preProcess,
    slackUsers = require('./components/io').slackUsers,
    mailerTransport = require('../../IF_mail/IF_mail.js');



client.on("connect", function(err) {
    console.log("Connected to email redis queue...");
});

var timer = new InvervalTimer(function() {
    client.lrange('chat_email', 0, -1, function(err, emails) {
            console.log('Email Queue: ' + emails.length)
            if (emails.length > 0) {
                console.log('Pausing timer')
                timer.pause();
                console.log(emails.length + ' email(s) for processing.')
                async.eachSeries(emails, function iterator(email_str, callback) {
                    var envelope = JSON.parse(email_str);
                    console.log('Incoming email: ', JSON.stringify(envelope));
                    Chatuser.find({'profile.email':{$regex: envelope.from_address.toString().trim(), $options:'i'}}).exec(function(err, users) {
                        console.log(0);
                        if(err){
                            console.log('saved chat user retrieval error');
                        } else {     
                            if (!users || users.length == 0) {
                                console.log(1);
                                var mailOptions = {
                                    to: envelope.from_address,
                                    from: 'Kip Bot <hello@kip.ai>',
                                    subject: 'You are not currently in a chat!',
                                    text: 'You are currently not taking part in any Kip Bot chats...'
                                };
                                mailerTransport.sendMail(mailOptions, function(err) {
                                    if (err) console.log(err);
                                    console.log('User was not found in Chatusers db. Sent notification to user.');
                                });
                            }
                            else if (users[0] && users[0].team_id ) {
                                console.log(2);
                               var emailCommand = {
                                    source: {
                                        'origin':'slack',
                                        'channel':users[0].dm,
                                        'org':slackUsers[users[0].team_id].activeTeamId,
                                        'id':users[0].team_id + "_" + users[0].dm, 
                                        'user': slackUsers[users[0].team_id].activeUserId
                                    },
                                    'msg': envelope.text.toString().trim(),
                                    'flags': {'email': true},
                                    'emailInfo': {
                                        to: envelope.from_address,
                                        from: 'Kip Bot <hello@kip.ai>',
                                        subject: 'Reply from Kip Bot!',
                                        text: ''
                                    }
                                };
                                preProcess(emailCommand);
                                client.lrem('chat_email', 1, email_str);
                                timer.resume()
                            } else {
                                console.log(3);
                                console.log('wtf mate: slackUsers: ', slackUsers, ' users: ', users);
                                client.lrem('chat_email', 1, email_str);
                                timer.resume()
                            }
                        }
                    });
                }, function complete(err, results) {
                    console.log('Resuming timer!')
                    timer.resume()
                });
            }
        }) // end of client lrange, callback)
}, 5000);


function InvervalTimer(callback, interval) {
    var timerId, startTime, remaining = 0;
    var state = 0; //  0 = idle, 1 = running, 2 = paused, 3= resumed

    this.pause = function() {
        if (state != 1) return;

        remaining = interval - (new Date() - startTime);
        clearInterval(timerId);
        state = 2;
    };

    this.resume = function() {
        if (state != 2) return;

        state = 3;
        setTimeout(this.timeoutCallback, remaining);
    };

    this.timeoutCallback = function() {
        if (state != 3) return;

        callback();

        startTime = new Date();
        timerId = setInterval(callback, interval);
        state = 1;
    };

    startTime = new Date();
    timerId = setInterval(callback, interval);
    state = 1;
}