var express = require('express');
var router = express.Router();
var co = require('co');

var Email = require('../../email');
var utils = require('../utilities/utils.js');

/**
 * Models loaded from the waterline ORM
 */
var db;
const dbReady = require('../../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

router.get('/', (req, res) => {
  res.render('pages/index');
});


/**
 * example of how the error logger works for time being
 */
router.get('/fail', function(req, res, next) {
  return next(new Error('This is an error and it should be logged to the console'));
});

/**
 * create new cart for user, redirect them to /cart/:cart_id which will be handled by redux
 */
router.get('/newcart', (req, res) => co(function * () {
  var session_id = req.session.session_id;
  var cart_id = yield utils.createNewCart(req, session_id);
  res.redirect(`/cart/${cart_id}`);
}));

/**
 * magic links for creator to be auto signed in, this would be specific to the admin versus a url for new members
 * @param {[cart_id]} )             {}) [description]
 * @param {string} magic_id - the magic id for the cart
 * @yield {[type]} [description]
 */
router.get('/magi/:magic_id', (req, res) => co(function * () {
  // find if magic_id exists
  var cart = db.carts.findOne({magic_link: req.params.magic_link});
  if (cart) {
    // redirect and log user in
    res.redirect(`/cart/${cart.cart_id}`);
  } else {
    return new Error('magic_id doesnt exist, probably return user to some error page where they can create new cart');
  }
}));

/**
 * Identify a user, associating a session with a user_account
 * Multiple user_accounts can be associated with one session, personal email and work email on same computer
 * Though this is a GET route, it should be used with XHR/ajax, not as a renderable page
 */
router.get('/createAccount', (req, res) => co(function * () {
  console.log('identify with email', req.query.email);

  // clean up the email TODO
  var email_address = req.query.email.toLowerCase();

  // Find an existing user or create a new one
  var user = yield db.UserAccounts.findOne()
    .where({email_address: email_address});

  // Create new one if didn't find it
  if (!user) {
    user = yield db.UserAccounts.create({
      email_address: email_address,
      sessions: [req.session.session_id]
    });
  }

  res.send('ok');

  // then also send an email
  var email = new Email({
    to: [user]
  }).newCart({
    cart_id: req.query.cart_id
  });

  yield email.send();

  // Find user_account with email in the db
  // If not exists, create a new user_account
  // Associate the session with the user account in user_to_session table
}));

module.exports = router;
