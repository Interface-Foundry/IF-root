var express = require('express');
var router = express.Router();
var fs = require('fs');

//establish the webhook
require('./sgWebhook');

//mounted at /sg
router.post('/', function (req, res) {
  //process incoming data from sg
  //probably save it to the db
  //replace the ngrok in sgWebook.js whenever necessary
  //Sg event webhook documentation:
  //https://sendgrid.com/docs/API_Reference/Webhooks/event.html
  //console.log('request', req.body);
  fs.appendFile('sg_log.txt', JSON.stringify(req.body, null, '\t'), (err) => {
  if (err) throw err;
  //console.log('New data added to sg_log');
});
  res.send(200);
});

module.exports = router;
