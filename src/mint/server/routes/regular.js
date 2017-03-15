var express = require('express');
var router = express.Router();
var co = require('co');

var utils = require('../utilities/utils.js');
var prototype = process.env.PROTOTYPE

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
 * Non-react prototype views
 */
if (prototype) {
  router.get('/cart/:id', (req, res) => co(function * () {
    const cart = yield db.Carts.findOne({id: req.params.id}).populate('leader')
    const session = req.UserSession; //db.Sessions.findOne({id: req.session.id}).populate('user_accounts')
    const user = session.user_accounts[0]

    // If there's no leader for this cart, respond with the page that asks for an email
    if (!cart.leader) {
      console.log('rendering new cart no leader')
      return res.render('pages/prototype/new_cart_no_leader', {
        cart
      })
    }

    // If there is a user for the cart, and the user is the leader, show the leader view
    if (user && cart.leader.id === user.id) {
      console.log('rendering cart leader view')
      return res.render('pages/prototype/cart_leader_view', {
        cart,
        user
      })
    }

    // If there is a user, but user is not a leader, make sure they're in the cart members/participants
    // TODO
    if (user && cart.leader.id !== user.id) {
      console.log('should render cart non-leader view')
      return res.render('pages/prototype/cart_member_view', {
        cart: cart
      })
    }

    // Otherwise, show the anon view
    console.log('rendering cart anon view')
    res.render('pages/prototype/cart_anon_view', {
      cart: cart
    })
  }))
}


/**
 * example of how the error logger works for time being
 */
router.get('/fail', function(req, res, next) {
  return next(new Error('This is an error and it should be logged to the console'));
});

/**
 * create new cart for user, redirect them to /cart/:id which will be handled by redux
 */
router.get('/newcart', (req, res) => co(function * () {
  // create a blank cart
  const cart = yield db.Carts.create({})
  console.log('new cart', cart)

  // find the user for this session
  const session = req.UserSession; // yield db.Sessions.findOne({id: req.session.id}).populate('user_accounts')

  if (session.user_accounts.length > 0) {
    // make the first user the leader
    console.log('saving leader as', cart.leader)
    cart.leader = session.user_accounts[0]
    yield cart.save()
  }

  res.redirect(`/cart/${cart.id}`);
}));

/**
 * magic links for creator to be auto signed in, this would be specific to the admin versus a url for new members
 * @param {[id]} )             {}) [description]
 * @param {string} magic_id - the magic id for the cart
 * @yield {[type]} [description]
 */
router.get('/magi/:magic_id', (req, res) => co(function * () {
  // find if magic_id exists
  var cart = db.carts.findOne({magic_link: req.params.magic_link});
  if (cart) {
    // redirect and log user in
    res.redirect(`/cart/${cart.id}`);
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

  // clean up the email TODO
  var email_address = req.query.email.toLowerCase();

  // Find an existing user or create a new one
  var user = yield db.UserAccounts.findOne()
    .where({email_address: email_address});

  // Create new one if didn't find it
  if (!user) {
    console.log('creating new user')
    user = yield db.UserAccounts.create({
      email_address: email_address,
      sessions: [req.session.id]
    });
  }

  res.send('ok');

  // then also send an email
  var email = yield db.Emails.create({
    recipients: user.email_address,
    subject: 'Your New Cart from Kip'
  })

  // use the new_cart email template
  email.template('new_cart', {
    id: req.query.id
  })

  // remember to actually send it
  yield email.send();
}));

module.exports = router;
