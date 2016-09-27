var fs = require('fs')

//
// "Actions" are what slack calls buttons
//
var queue = require('../queue-mongo')
require('kip')
var express = require('express')
var co = require('co')
var app = express()
var bodyParser = require('body-parser')
var cart = require('./cart')
var kipcart = require('../cart')
app.use(express.static('public'))
app.use(bodyParser.urlencoded())


/**
 * handle actions which can be simply translated into text commands, like "2 but cheaper"
 * TODO transform these into "execute" commands instead to avoid doing nlp 
 * 
 * @param {any} action

 */
function simple_action_handler(action) {
  switch (action.name) {
    //
    // Search result buttons
    //
    case 'addcart':
      return 'save ' + action.value
    case 'cheaper':
      if (action.value) {
        return action.value + ' but cheaper'
      } else {
        return 'cheaper'
      }
    case 'moreinfo':
      return action.value
    case'more':
      return 'more'
    
    //
    // Item info buttons
    //

    //
    // Other buttons
    //
    case 'home':
      return 'exit'
  }
}

//incoming slack action
app.post('/slackaction', function(req, res) {
  kip.debug('incoming action')
    if (req.body && req.body.payload) {
      var parsedIn = JSON.parse(req.body.payload);
      var action = parsedIn.actions[0];
      debugger;
      kip.debug(action.name.cyan, action.value.yellow)
      // for things that i'm just going to parse for
      var simple_command = simple_action_handler(action)
      if (simple_command) {
        kip.debug('passing through button click as a regular text chat', simple_command.cyan)
        var message = new db.Message({
          incoming: true,
          thread_id: parsedIn.channel.id,
          original_text: simple_command,
          text: simple_command,
          user_id: parsedIn.user.id,
          origin: 'slack',
          source: parsedIn,
        });
        message.save().then(() => {
          queue.publish('incoming', message, ['slack', parsedIn.channel.id, parsedIn.action_ts].join('.'))
        })

      } else {
        switch (action.name) {
          case 'additem':
            // adds the item to the cart the right way, but for speed we return a hacked message right away
            var updatedMessage = parsedIn.original_message;
            var priceDifference = 0;
            updatedMessage.attachments.map(a => {
              if (a.callback_id === parsedIn.callback_id) {
                priceDifference = parseFloat(a.text.match(/\$[\d.]+/)[0].substr(1))
                a.text = a.text.replace(/\d+$/, replacement => {
                  return parseInt(replacement) + 1;
                })
              } else if (a.text && a.text.indexOf('Team Cart Summary') >= 0) {
                a.text = a.text.replace(/\$[\d.]+/, function(total) {
                  return '$' + (parseFloat(total.substr(1)) + priceDifference).toFixed(2);
                })
              }
            })

            co(function * () {
              var teamCart = yield kipcart.getCart(parsedIn.team.id)
              var item = yield db.Items.findById(parsedIn.callback_id).exec()
              yield kipcart.addExtraToCart(teamCart, parsedIn.team.id, parsedIn.user.id, item)
            }).catch(console.log.bind(console))
            break;

          case 'removeitem':
            // reduces the quantity right way, but for speed we return a hacked message right away
            var index;
            var priceDifference = 0;
            var updatedMessage = parsedIn.original_message;
            updatedMessage.attachments = updatedMessage.attachments.reduce((all, a, i) => {
              if (a.callback_id === parsedIn.callback_id) {
                priceDifference = parseFloat(a.text.match(/\$[\d.]+/)[0].substr(1))
                var isZero = false;
                index = i;
                a.text = a.text.replace(/\d+$/, replacement => {
                  if (parseInt(replacement) <= 1) {
                    isZero = true;
                  }
                  return parseInt(replacement) - 1;
                })
                if (!isZero) {
                  all.push(a)
                }
              } else if (a.text && a.text.indexOf('Team Cart Summary') >= 0) {
                a.text = a.text.replace(/\$[\d.]+/, function(total) {
                  return '$' + (parseFloat(total.substr(1)) - priceDifference).toFixed(2);
                })
                all.push(a)
              } else {
                all.push(a)
              }
              return all;
            }, [])
            co(function * () {
              yield kipcart.removeFromCart(parsedIn.team.id, parsedIn.user.id, index)
            }).catch(console.log.bind(console))
            break;

          case 'removeall':
            // reduces the quantity right way, but for speed we return a hacked message right away
            var index;
            var priceDifference = 0;
            var updatedMessage = parsedIn.original_message;
            updatedMessage.attachments = updatedMessage.attachments.reduce((all, a, i) => {
              if (a.callback_id === parsedIn.callback_id) {
                var quantity = parseInt(a.text.match(/\d+$/)[0])
                priceDifference = quantity * parseFloat(a.text.match(/\$[\d.]+/)[0].substr(1))
                index = i;
              } else if (a.text && a.text.indexOf('Team Cart Summary') >= 0) {
                a.text = a.text.replace(/\$[\d.]+/, function(total) {
                  return '$' + (parseFloat(total.substr(1)) - priceDifference).toFixed(2);
                })
                all.push(a)
              } else {
                all.push(a)
              }
              return all;
            }, [])
            co(function * () {
              yield kipcart.removeAllOfItem(parsedIn.team.id, index)
            }).catch(console.log.bind(console))
            break;
        }
      }

      //sends back original chat
      if (parsedIn.original_message){
        var stringOrig = JSON.stringify(parsedIn.original_message)
        res.send(parsedIn.original_message);
      } else {
        console.error('slack buttons broke, need a response_url')
        res.sendStatus(process.env.NODE_ENV === 'production' ? 200 : 500)
        return;
      }
    } else {
      res.sendStatus(200);
    }
});


var cookieParser = require('cookie-parser');
var uuid = require('uuid');
var compression = require('compression');
// var base = process.env.NODE_ENV !== 'production' ? __dirname + '/static' : __dirname + '/dist';
// var defaultPage = process.env.NODE_ENV !== 'production' ? __dirname + '/simpleSearch.html' : __dirname + '/dist/simpleSearch.html';
var request = require('request');

var canary = {
  id: '2804113073.84166691729',
  secret: '39126ac7842f6e3a010f94b9a79282f6',
  verification_token: 'b2hLV2HnBtWBmU5NFgDBG8dL'
};
var clientID = process.env.NODE_ENV === 'production' ? '2804113073.14708197459' : canary.id;
var clientSecret = process.env.NODE_ENV === 'production' ? 'd4c324bf9caa887a66870abacb3d7cb5' : canary.secret;

app.get('/newslack', function(req, res) {
    console.log('new slack integration request');
    // TODO post in our slack #dev channel
    // TODO check that "state" property matches
    res.redirect('/thanks')

    if (!req.query.code) {
        console.error(new Date())
        console.error('no code in the callback url, cannot proceed with new slack integration')
        return;
    }

    var body = {
      code: req.query.code,
      redirect_uri: '/thanks'
    }

    request({
      url: 'https://' + clientID + ':' + clientSecret + '@slack.com/api/oauth.access',
      method: 'POST',
      form: body
    }, function(e, r, b) {
        if (e) {
          console.log('error connecting to slack api');
          console.log(e);
        }
        if (typeof b === 'string') {
            b = JSON.parse(b);
        }
        if (!b.ok) {
            console.error('error connecting with slack, ok = false')
            console.error('body was', body)
            console.error('response was', b)
            return;
        } else if (!b.access_token || !b.scope) {
            console.error('error connecting with slack, missing prop')
            console.error('body was', body)
            console.error('response was', b)
            return;
        }

        console.log('got positive response from slack')
        console.log('body was', body)
        console.log('response was', b)
        var bot = new db.Slackbot(b)
        db.Slackbots.find({team_id: b.team_id}, function(e, bots) {
          if (e) { console.error(e) }

          if (bots && bots.length > 0) {
            console.log('already have a bot for this team')
            return;  
          } else {
            bot.save(function(e) {
                kip.err(e);
            })
          }
        })
    })

})

// app.get('/*', function(req, res, next) {
//     res.sendfile(defaultPage);
// });



var listener;
function listen(callback) {
  listener = callback;
}

app.listen(8000, function(e) {
  if (e) {
    console.dir(e)
  } else {
    console.log('slack action server listening on port 8000')
  }
})

module.exports = {
  listen: listen
}
