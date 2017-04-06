const co = require('co')
const request = require('request-promise')
var validUrl = require('valid-url');
var multer = require('multer');
var upload = multer();
var express = require('express');
var router = express.Router();

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

const deals = require('../deals/deals')

/**
 * TODO, etc
 */
router.post('/', upload.array(), (req, res) => co(function * () {
  yield dbReady;
  console.log('req.body', req.body)
  var email = req.body.from.split(' ');
  email = email[email.length-1];
  if (email[0] === '<') email = email.slice(1, email.length-1);
  console.log('email', email)
  var user = yield db.UserAccounts.findOne({email_address: email});

  var text = req.body.text;
  var words = text.split(/\s/);

  var uris = words.filter(function (w) {
    return validUrl.isUri(w);
  });
  console.log('URIs', uris);

  //validate uris as amazon links
  uris = uris.filter(u => /^https:\/\/www.amazon.com\//.test(u));
  console.log('amazon URIs', uris);

  if (user) {
    //TODO add uri to user's cart
    //TODO get user cart
  }
  else {
    //TODO create new user and cart and add uri to them / it
  }

  res.sendStatus(200);
}));

module.exports = router;
