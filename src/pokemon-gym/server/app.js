const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('../../config');
const request = require('request');
const async = require('async');
const _ = require('underscore');
const auth = require('basic-auth-connect');
const axios = require('axios');

const mongoose = require('mongoose');
// connect our DBs
const db1 = mongoose.createConnection(config.mongodb.url);
const db2 = mongoose.createConnection(config.mongodb2.url);

const Message = require('../../db/message_schema');
db1.model('Message', Message);
db2.model('Message', Message);
const db1Msgs = db1.model('Message');
const db2Msgs = db2.model('Message');

const Slackbot = require('../../db/slackbot_schema');
db1.model('Slackbot', Slackbot);
db2.model('Slackbot', Slackbot);
const db1Slackbots = db1.model('Slackbot');
const db2Slackbots = db2.model('Slackbot');

const getSearchCounts = require('./queries/getSearchCounts');
const getBanterCounts = require('./queries/getBanterCounts');
const mapDayofWeekStats = require('./mapping/mapDayStats');
const mapMonthStats = require('./mapping/mapMonthStats');
const mapThirtyDayStats = require('./mapping/mapThirtyDayStats');
const mapDailyActiveUsers = require('./mapping/mapDailyActiveUsers');
const mapMonthlyActiveUsers = require('./mapping/mapMonthlyActiveUsers');
const mapMonthlySlackTeams = require('./mapping/mapMonthlySlackTeams');
const mapSlackBotTokens = require('./mapping/mapSlackBotTokens');

const results = {};
results.searchCounts = {};
results.banterCounts = {};
results.dayOfWeekStats = {};
results.monthStats = {};
results.thirtyDayStats = {};
results.dailyActiveUsers = {};
results.monthlyActiveUsers = {};
results.monthlySlackTeams = {};
results.averageSlackTeamSize = 0;
const tempMonthlySlackTeams = { users: 0, teams: 0 };

app.use(bodyParser.json());
app.use(morgan());


app.use(auth('kip', 'vampirecat1200'));
app.use(express.static(`${__dirname}/../UI/material/client`));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// the auth is username: kip, password: vampirecat1200
//
// Server status monitoring
//
const check_server = require('../status/check_server')
const servers = [
  'pikachu.internal.kipapp.co',
  'flareon.internal.kipapp.co',
  'vaporeon.internal.kipapp.co',
  'jankeon.internal.kipapp.co',
  'charmander.internal.kipapp.co',
  'elasticsearch-cerulean.internal.kipapp.co',
  'elasticsearch-vermillion.internal.kipapp.co'
]
app.get('/status', function(req, res) {
  check_server.list(servers, function(e, stats) {
    if(e) {
      res.status(500);
      res.send(e);
    } else {
      res.send(stats);
    }
  })
});



app.post('/vc/timexsearch', function(req, res) {
  console.log('zzzz ',req.body);

  //ADD IN TIME PERIODS HERE FOR QUERY, AND USER ID !!!!!!

  if(req.body.start_date && req.body.end_date){

    console.log('CHECK 1 ');
    doQuery(req.body,function(oz){
      res.send(oz);
    });

  }else {
    console.log('error: dates missing!');
  }

});

app.post('/vc/slackstats', function(req, res) {

  initSlackUsers(app.get('env'),function(rez){

    res.send(rez);
  });
});

const getData = () => {
  getSearchCounts([db1Msgs, db2Msgs]).then(searchCounts => {
    Object.assign(results.searchCounts, searchCounts);
  });
  getBanterCounts([db1Msgs, db2Msgs]).then(banterCounts => {
    Object.assign(results.banterCounts, banterCounts);
  });
  mapDayofWeekStats([db1Msgs, db2Msgs]).then(dayOfWeekStats => {
    Object.assign(results.dayOfWeekStats, dayOfWeekStats);
  });
  mapMonthStats([db1Msgs, db2Msgs]).then(monthStats => {
    Object.assign(results.monthStats, monthStats);
  });
  mapThirtyDayStats([db1Msgs, db2Msgs]).then(thirtyDayStats => {
    Object.assign(results.thirtyDayStats, thirtyDayStats);
  });
  mapDailyActiveUsers([db1Msgs, db2Msgs]).then(dailyActiveUsers => {
    Object.assign(results.dailyActiveUsers, dailyActiveUsers);
  });
  mapMonthlyActiveUsers([db1Msgs, db2Msgs]).then(monthlyActiveUsers => {
    Object.assign(results.monthlyActiveUsers, monthlyActiveUsers);
  });
  mapMonthlySlackTeams([db1Msgs, db2Msgs]).then(monthlySlackTeams => {
    Object.assign(results.monthlySlackTeams, monthlySlackTeams);
  });
};

const getSlackTeamUserLists = tokens => {
  if (!tokens.length) {
    results.averageSlackTeamSize = tempMonthlySlackTeams.users / tempMonthlySlackTeams.teams;
    return;
  }
  axios.get(`https://slack.com/api/users.list?token=${tokens.shift()}`)
  .then(response => {
    const { ok, members } = response.data;
    if (!ok) {
      setTimeout(() => getSlackTeamUserLists(tokens), 1000);
      return;
    }
    tempMonthlySlackTeams.teams++;
    tempMonthlySlackTeams.users += members.length;
    setTimeout(() => getSlackTeamUserLists(tokens), 1000);
  })
  .catch(error => {
    console.log(error);
  });
};

const getSlackTeamSize = () => {
  mapSlackBotTokens([db1Slackbots, db2Slackbots]).then(slackbotTokens => {
    tempMonthlySlackTeams.teams = 0;
    tempMonthlySlackTeams.users = 0;
    getSlackTeamUserLists(slackbotTokens);
  });
};

getData();
getSlackTeamSize();

// update data every 30 minutes
setInterval(() => {
  getData();
}, 30 * 60 * 1000);

// update slack team size every day
setInterval(() => {
  getSlackTeamSize();
}, 24 * 60 * 60 * 1000);

app.get('/data', (req, res) => {
  res.send(results);
});

app.post('/vc/stream', function(req, res) {

  var stream = Message.find().sort({'_id': -1}).select('source').stream()
  stream.on('error', function (err) {
    console.error(err)
  })
  stream.on('data', function (doc) {
    console.log('streaming ',doc)
  })

});



//get stored slack users from mongo
function initSlackUsers(env,callback){
    console.log('loading with env: ',env);
    //load kip-pepper for testing
    if (env === 'development_alyx') {
        var testUser = [{
            team_id:'T0H72FMNK',
            bot: {
                bot_user_id: 'U0H6YHBNZ',
                bot_access_token:'xoxb-17236589781-HWvs9k85wv3lbu7nGv0WqraG'
            },
            meta: {
                initialized: false
            }
        }];
        loadSlackUsers(testUser,function(rez){
          callback(rez);
        });
    }
    else if (env === 'development_mitsu'){
        var testUser = [{
            team_id:'T0HLZP09L',
            bot: { 
                bot_user_id: 'cinnatest',
                bot_access_token:'xoxb-17713691239-K7W7AQNH6lheX2AktxSc6NQX'
            },
            meta: {
                initialized: false
            }
        }];
        loadSlackUsers(testUser,function(rez){
          callback(rez);
        });
    }
    else {
        console.log('retrieving slackbots from mongo');
        Slackbots.find().exec(function(err, users) {
            if(err){
                console.log('saved slack bot retrieval error');
            }
            else {
                loadSlackUsers(users, function(rez){
                  callback(rez);
                });
            }
        });
    }
}

//* * * * * * **  * * * **  ** * * * * *  * * * * ** *
//SHOW USER NUMBERS BY PLATFORM, UNIQUE IDS per org???


//load slack users into memory, adds them as slack bots
function loadSlackUsers(users,callbackTOP){
    console.log('loading '+users.length+' Slack teams');

    var slackTeams = [];

    async.eachSeries(users, function(user, callback2) {

        if (user.bot && !user.bot.bot_access_token && !user.bot.bot_user_id){
            console.log('ERROR: bot token and id missing from DB for ',user);
            callback2();
        }else if (!user.bot) {
          callback2();
        }

        //async parrallel:
        //
        async.series([
            function(callback){
              request('https://slack.com/api/channels.list?token='+user.bot.bot_access_token+'', function(err, res, body) {
                if(err){
                  console.log('requesting channels.list error: ',err);
                  callback(null);
                }
                else {
                  callback(null,JSON.parse(body));
                }
              });
            },
            function(callback){
              request('https://slack.com/api/team.info?token='+user.bot.bot_access_token+'', function(err, res, body) {
                if(err){
                  console.log('requesting team.info error: ',err);
                  callback(null);
                }
                else {
                  callback(null,JSON.parse(body));
                }
              });
            },
            function(callback){
              request('https://slack.com/api/users.list?token='+user.bot.bot_access_token+'', function(err, res, body) {
                if(err){
                  console.log('requesting users.list error: ',err);
                  callback(null);
                }
                else {
                  callback(null,JSON.parse(body));
                }
              });
            }
        ],
        // optional callback
        function(err, results){

          //GET LIST OF USERS SIGNED UP IN MONGO
          //REMOVE USERS OUTSIDE OF SEARCH RANGE

            var returnObj = {
              team:{
              },
              users:{
                list:[]
              },
              channels:{
                list:[]
              }
            }

            //channel
            if (results[0] && results[0].ok){
              returnObj.channels.list = results[0].channels;
              returnObj.channels.count = results[0].channels.length;
            }

            //team
            if (results[1] && results[1].ok){
              returnObj.team = results[1].team;
            }

            //users
            if (results[2] && results[2].ok){
              returnObj.users.list = results[2].members;
              returnObj.users.count = results[2].members.length;
            }

            //console.log('slackteam ',returnObj);

            slackTeams.push(returnObj);


            // * * * * * * * * * * //
            callback2();

        });

    }, function done(){
        console.log('done loading slack users');
        calcTeam();
    });

  function calcTeam(){


    var totalUserCount = 0;

    async.eachSeries(slackTeams, function(team, callback3) {

        if (!isNaN(team.users.count)){
          totalUserCount = totalUserCount + team.users.count;
        }

        callback3();
    }, function done(){

        console.log('team# ',slackTeams.length);
        console.log('total users ',totalUserCount);

        var slackObj = {
          team_count: slackTeams.length,
          total_users: totalUserCount,
          teams:slackTeams
        }

        ///* * * * * * * * * //
        // GET CHANNELS WHERE KIP IS IN THEM
        //* * * * * * * * * * *//


        console.log('done loading slack users');

        callbackTOP(slackObj);
    });
  }
}

function doQuery(params,callback){
  Message.find({"ts": {"$gte": new Date(params.start_date), "$lt": new Date(params.end_date)}})
    .select({"ts":1,"source": 1,"bucket":1,"action":1})
    .sort({'_id': 1})
    .exec(function(err, msg) {
    if(err){
        console.log('Error: Cannot find initial search for recallHistory');
    }
    else {
      if(msg.length > 0){

        var collectData = [];

        async.eachSeries(msg, function(item, callback2) {

            var date = item.ts.getDate();
            var month = item.ts.getMonth()+1;
            var year = item.ts.getFullYear();

            item.ts_simple = year + '/' + month + '/' + date;

            collectData.push(item);

            setTimeout(function() {
              callback2();
            }, 0);
        }, function done(){

            var arr = _.chain(msg)
              .groupBy(function(item) {
                return item.ts_simple;
              })
              .map(function(value, index) {
                  //return [index, value.length, value];
                  return [index, value.length];
              })
              .value();

              callback(arr);
        });

      }
      else {
        console.log('error: no data found in msg db response');
        callback('error');
      }
    }
  });

}

//
// Query testing
//
// var search = require('../../IF_search/newsearch')
// var searchterms = require('../../IF_search/searchterms');
// app.post('/query', function(req, res) {
//   var q = search.getQuery(req.body, 0)
//   var terms = searchterms.parse(req.body.text);
//   request({
//     method: 'POST',
//     url: 'https://kipapp.co/styles/api/items/search',
//     body: req.body,
//     json: true
//   }, function(e, r, b) {
//     if (e) {
//       console.error('error', e);
//     }
//
//     res.send({
//       fashionTerms: terms,
//       elasticsearchQuery: q,
//       results: r.body.results.map(function(r) {
//         return {
//           mongoDoc: r
//         }
//       })
//     })
//   })
// })

//
// Error monitoring
//
var elasticsearch = require('elasticsearch')
// logs elasticsearch stuff, flesh out later once we know what's useful
var ESLogger = function(config) {
    var defaultLogger = function() {};

    this.error = defaultLogger;
    this.warning = defaultLogger;
    this.info = defaultLogger;
    this.debug = defaultLogger;
    this.trace = defaultLogger;
    this.close = defaultLogger;
};
var es = new elasticsearch.Client({
    host: config.elasticsearchElk.url,
    log: ESLogger
});
console.log('elasticserach on', config.elasticsearchElk.url)
app.get('/errors/node', function(req, res) {
  var query = {
    index: 'logstash-node',
    type: 'app.js',
    body: {
      size: 20,
      sort: [{
        "@timestamp": {
          order: 'desc'
        }
      }],
      query: {
        match_all: {}
      }
    }
  }

  es.search(query).then(function(results) {
    res.send(results.hits.hits.map(function(doc) {
      return doc._source;
    }));
  });
})

app.get('/errors/front-end', function(req, res) {
  var query = {
    index: 'logstash-node',
    type: 'kippsearch.com',
    body: {
      size: 20,
      sort: [{
        "@timestamp": {
          order: 'desc'
        }
      }],
      query: {
        match_all: {}
      }
    }
  }

  es.search(query).then(function(results) {
    res.send(results.hits.hits.map(function(doc) {
      return doc._source;
    }));
  });
})

app.get('/errors/processing', function(req, res) {
  res.send([{
    "@timestamp": (new Date()).toISOString(),
    message: 'example ERROR: type error',
    stack: 'example at line 33:12',
    niceMessage: 'example nice message \\(^ヮ^)/',
    devMessage: 'example dev message, like "TODO was no time to handle multiple shopify stores"'
  }])
})

app.get('/tests/nlp', function(req, res) {
  res.send('NLP tests not in place yet')
  // this is what the code will look like
})

const port = 9999;
app.listen(port, err => {
  if (err) {
    console.error(err);
  } else {
    console.log(`🏆 pokemon gym back end listening on port ${port} 🏆`);
  }
});
