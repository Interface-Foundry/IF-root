//
// "Actions" are what slack calls buttons
//
var queue = require('../queue-mongo')
require('kip')
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
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
    case 'home':
      return 'exit'
    
    //
    // Item info buttons
    //
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

        // return res.sendStatus(200)
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