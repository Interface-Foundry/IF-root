var express = require('express');
var router = express.Router();

//establish the webhook
require('./sgWebhook');

//mounted at /sg
router.post('/', function (req, res) {
  //process incoming data from sg
  //probably save it to the db
  //replace the ngrok in sgWebook.js whenever necessary
  //Sg event webhook documentation:
  //https://sendgrid.com/docs/API_Reference/Webhooks/event.html
  res.send(200);
});

module.exports = router;
