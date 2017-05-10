var express = require('express');
var router = express.Router();
var co = require('co');
var _ = require('lodash');

const dealsDb = require('../deals/deals')


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
  return res.render('pages/index')
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

  // check if the user is already identified, as this email
  var currentUser = req.UserSession.user_account
  if (!currentUser) {
    // no current user defined, so we can log them in
    req.UserSession.user_account = link.user.id
    yield req.UserSession.save()
  } else if (currentUser.id === link.user.id) {
    // already logged in as this user, so don't do anything
  } else {
    // logged in as another user, so log them in as this user
    req.UserSession.user_account = link.user.id
    yield req.UserSession.save()
  }

  // redirect if the link has a redirect
  if (link.redirect_url) {
    return res.redirect(link.redirect_url)
  }

  // handle auth link for the /identify way
  if (!link.cart.leader) {
    // make the user leader if they aren't already
    link.cart.leader = link.user.id
    if (!link.cart.name) {
       link.cart.name = link.user.email_address.split('@')[0] + "'s Kip Cart"
    }
    yield link.cart.save()
  } else if (link.cart.leader !== link.user.id) {
    // if there was a different user as leader, this must be a member that is authing, add them as member
    if (!link.cart.members.includes(link.user.id)) {
      link.cart.members.add(link.user.id)
      yield link.cart.save()
    }
  }

  return res.redirect('/cart/' + link.cart.id)
}))

/**
 * @api {get} /newcart New Cart
 * @apiDescription create new cart for user, redirect them to /cart/:id and send an email
 * @apiGroup HTML
 */
router.get('/newcart', (req, res) => co(function * () {
  // create a cart
  let cart = yield cartUtils.createCart()
  // find the user for this session

  if (session.user_account) {
    // make the first user the leader
    const user = session.user_account
    cart.leader = user.id
    if (user.name) {
      cart.name = user.name + "'s Kip Cart"
    } else {
      cart.name = user.email_address.replace(/@.*/, '') + "'s Kip Cart"
    }
    yield cart.save()

    // grab the daily deals
    let allDeals = yield dealsDb.getDeals(4, 0),
      deals = [allDeals.slice(0, 2), allDeals.slice(2, 4)];

    // Send an email to the user with the cart link
    var email = yield db.Emails.create({
      recipients: user.email_address,
      subject: 'Your New Cart from Kip',
      cart: cart.id
    })

    // use the new_cart email template
    email.template('new_cart', {
      cart: cart,
      deals: deals
    })

    // remember to actually send it
    yield email.send();
  }

  res.redirect(`/cart/${cart.id}/`);
}))



/**
 * @api {get} /newcart/:store New Cart for a specific store
 * @apiDescription create new cart for user, redirect them to /cart/:id and send an email
 * @apiGroup HTML
 * @apiParam {string} : the token from the auth db
 */
router.get('/newcart/:store', (req, res) => co(function * () {
  let cart = yield cartUtils.createCart(req.params.store)

  if (session.user_account) {
    // make the first user the leader
    const user = session.user_account
    cart.leader = user.id
    if (user.name) {
      cart.name = user.name + "'s Kip Cart"
    } else {
      cart.name = user.email_address.replace(/@.*/, '') + "'s Kip Cart"
    }
    yield cart.save()
  }

  res.redirect(`/cart/${cart.id}/`);
}))



/**
 * @api {get} /testoptions Test Options
 * @apiDescription an amazon option tester, ex http://localhost:3000/testoptions?asin=B00AM3Y5ZQ
 * @apiParamExample example
 * http://localhost:3000/testoptions?asin=B00AM3Y5ZQ
 * @apiGroup Other
 */
router.get('/testoptions', (req, res) => co(function * () {
  var html = fs.readFileSync(__dirname + '/../cart/option_test.html', 'utf8')
  res.send(html)
}))

module.exports = router;
