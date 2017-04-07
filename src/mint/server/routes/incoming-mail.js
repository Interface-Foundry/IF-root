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

  var user = db.UserAccounts.findOrCreate({email: email});
  console.log('found or created user');

  var text = req.body.text.split(/\s/);
  var uris = text.filter(w => validUrl.isUri(w));
  uris = uris.filter(u => /^https:\/\/www.amazon.com\//.test(u));   //validate uris as amazon links
  // console.log('amazon URIs', uris);
  // console.log(req.protocol + '://' + req.get('host'));
  const cart_id = '7a43d85c928f'; //for testing

  // find all the carts where their user id appears in the leader or member field
  console.log('gonna query for carts')
  var cart = yield db.Carts.findOne({id: cart_id});
  // var carts = yield db.Carts.find({
  //   or: [
  //     { leader: user.id },
  //     { members: user.id }
  //   ]
  // }).populate('items').populate('leader').populate('members');

  if (cart) var cart = carts[0];
  else {
    //TODO if user does not have a cart, make on
  }

  //TODO add uri to user's cart

  console.log(cart);
  res.sendStatus(200);
}));

module.exports = router;
