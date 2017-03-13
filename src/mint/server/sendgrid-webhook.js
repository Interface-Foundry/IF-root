const express = require('express');
const rp = require('request-promise');
const sg_const = require('../sg_const');

var router = express.Router();

//test route
router.get('/test', function (req, res) {
  console.log('my name is cupid valentino');
  res.send('my name is cupid valentino');
});

//route sg will post to
router.post('/', function (req, res) {
  console.log('req.body', req.body);
  res.send('my name is cupid valentino');
});

//~~~~~post request to send-grid api setting up the webhook~~~~~//

var options = {
  method: 'POST',
  uri: 'https://api.sendgrid.com/api/filter.setup.json',
  form: {
    api_user: sg_const.api_user,
    api_key: sg_const.api_key,
    name: "eventnotify",
    processed: 1,
    dropped: 1,
    deferred: 1,
    delivered: 1,
    bounce: 1,
    click: 1,
    open: 1,
    unsubscribe: 1,
    group_unsubscribe: 1,
    group_resubscribe: 1,
    spamreport: 1,
    url: "https://533179ca.ngrok.io/sg"
  }
};

rp(options)
  .then(function (result) {
    console.log('successfully connected to sendgrid webhook');
    console.log(result);
  })
  .catch(function (error) {
    console.log('error with sendgrid webhook', error);
  });

//~~~~~~~~~~//

module.exports = router;
