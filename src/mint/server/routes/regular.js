var express = require('express');
var router = express.Router();
var co = require('co');

var utils = require('../utilities/utils.js');

/**
 * Models loaded from the waterline ORM
 */
var db;
const dbReady = require('../../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

/**
 * @api {get} / Home
 * @apiDescription renders the react web page :kip: :kip: :kip: :mudkip:
 * @apiGroup HTML
 */
router.get('/', (req, res) => co(function* () {
  const userIds = req.UserSession.user_accounts.map(a => a.id);
  let carts = [];
  if (userIds.length) {
    carts = yield db.Carts.find({
      or: [
        { leader: userIds },
        { members: userIds }
      ]
    });
  }
  res.render('pages/index', { carts: carts });
}));

/**
 * @api {get} /auth/:auth_token MagicLink
 * @apiDescription Logs someone in via link, like forgot password style, then redirects them to a cart or something
 * @apiGroup HTML
 * @apiParam {string} :auth_token the token from the auth db
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
 * @api {get} /newcart New Cart
 * @apiDescription create new cart for user, redirect them to /cart/:id and send an email
 * @apiGroup HTML
 */
router.get('/newcart', (req, res) => co(function * () {
  // create a blank cart
  const cart = yield db.Carts.create({})

  // find the user for this session
  const session = req.UserSession;

  if (session.user_accounts.length > 0) {
    // make the first user the leader
    const user = session.user_accounts[0]
    cart.leader = user.id
    yield cart.save()

    // Send an email to the user with the cart link
    var email = yield db.Emails.create({
      recipients: user.email_address,
      subject: 'Your New Cart from Kip',
      cart: cart.id
    })

    // use the new_cart email template
    email.template('new_cart', {
      id: cart.id
    })

    // remember to actually send it
    yield email.send();
  }

  res.redirect(`/cart/${cart.id}/`);
}))

module.exports = router;
