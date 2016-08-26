//
// "Actions" are what slack calls buttons
//
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
app.use(bodyParser.json())

//incoming slack action
app.post('/slackaction', function(req, res) {

    if (req.body && req.body.payload) {
      var parsedIn = JSON.parse(req.body.payload);

      /// FOR INITIAL SEARCHES

      //sends back original chat
      if (parsedIn.response_url && parsedIn.original_message){
        var stringOrig = JSON.stringify(parsedIn.original_message)
        request.post(
            parsedIn.response_url,
            { payload: stringOrig },
            function (err, res, body) {
              console.error('post err ',err)
            }
        );
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