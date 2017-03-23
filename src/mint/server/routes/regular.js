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

router.get('/', (req, res) => co(function * () {
  const userIds = req.UserSession.user_accounts.map(a => a.id)
  const carts = yield db.Carts.find({
    or: [
      { leader: userIds },
      { members: userIds }
    ]
  }).populate('items').populate('leader').populate('members');
  res.render('pages/index', {carts: carts});
}));

/**
 * Non-react prototype views
 */
if (prototype) {
  router.get('/cart/:id', (req, res) => co(function * () {
    const cart = yield db.Carts.findOne({id: req.params.id}).populate('leader').populate('items')
    console.log('cart', cart)
    const session = req.UserSession; //db.Sessions.findOne({id: req.session.id}).populate('user_accounts')
    const user = session.user_accounts[0]

    // If there's no leader for this cart, respond with the page that asks for an email
    if (!cart.leader) {
      console.log('rendering new cart no leader')
      return res.render('pages/prototype/new_cart_no_leader', {
        cart,
        session
      })
    }

    // If there is a user for the cart, and the user is the leader, show the leader view
    if (user && cart.leader.id === user.id) {
      console.log('rendering cart leader view')
      return res.render('pages/prototype/cart_leader_view', {
        cart,
        session
      })
    }

    // If there is a user, but user is not a leader, make sure they're in the cart members/participants
    if (user && cart.leader.id !== user.id) {
      console.log('should render cart non-leader view')
      return res.render('pages/prototype/cart_member_view', {
        cart,
        session
      })
    }

    // Otherwise, show the anon view
    console.log('rendering cart anon view')
    res.render('pages/prototype/cart_anon_view', {
      cart,
      session
    })
  }))
}

/**
 * Logs someone in from a maaaagic link, like forgot password style
 */
router.get('/auth/:id', (req, res) => co(function * () {
  var link = yield db.AuthenticationLinks.findOne({id: req.params.id}).populate('user').populate('cart')
  if (!link || !link.user) {
    return res.status(404).end()
  }

  var user
  // check if the user is already identified as this email
  req.UserSession.user_accounts.map(u => {
    if (u.email_address === link.user.email_address) {
      user = u
    }
  })
  if (user) {
    console.log('user was logged in as that email already')
    cart.leader = user.id
    yield cart.save()
    return res.redirect('/cart/' + cart.id)
  }

  req.UserSession.user_accounts.add(link.user.id)
  yield req.UserSession.save()

  return res.redirect('/cart/' + link.cart.id)
}))


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

  res.send(user);

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
