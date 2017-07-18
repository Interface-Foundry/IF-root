var express = require('express');
var router = express.Router();
var co = require('co');
var _ = require('lodash');

const cartUtils = require('../cart/cart_utils')
const dealsDb = require('../deals/deals')
const geolocation = require('../utilities/geolocation')

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
 * @api {post} /auth/quick/:code single-use login code
 * @apiDescription Logs someone in via single-use code and then redirects them to a cart or something
 * @apiGroup HTML
 * @apiParam {string} :code six-digit single-use login code
 */
router.post('/auth/quick/:code', (req, res) => co(function * () {
  var email = req.body.email;

  // verifies that an account actually exists for the email
  var realUser = yield db.UserAccounts.findOne({email_address: email});

  if (!realUser) {
    logging.info('user not found');
    return res.status(404).end()
  }

  // find the auth link that matches the user whose account we're trying to log into
  var realLink = yield db.AuthenticationLinks.findOne({
    user: realUser.id,
    code: {
      'not': null
    }
  })

  // find the auth link that matches the code that was passed in
  var link = yield db.AuthenticationLinks.findOne({code: req.params.code}).populate('user').populate('cart')

  // if there isn't one, or if it doesn't match the email, do some stuff
  if (!link || !link.user || realLink.id != link.id) {

    if (realLink) {
      // augment counter for bad log in attempts on the link actually associated w/ that email
      realLink.attempts++;
      logging.info('bad attempt');
      yield realLink.save()

      //if there have been too many attempts, scrap the log-in code and tell the front-end
      if (realLink.attempts >= 5) {
        realLink.code = null;
        realLink.attempts = 0;
        yield realLink.save();
        logging.info('too many attempts')
        return res.json({
          ok: false,
          newAccount: false,
          status: 'TOO_MANY_ATTEMPTS',
          message: 'You\'ve tried to log in too many times!',
        });
      }
    }

    logging.info('we are done here');
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
  logging.info('logged in')
  // // redirect if the link has a redirect
  // if (link.redirect_url) {
  //   return res.redirect(link.redirect_url)
  // }

  if (link.cart) {
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
  }

  // delete code from link
  link.code = null;
  yield link.save();

  // send back actual json like the other routes
  res.json({
    ok: true,
    newAccount: false,
    status: 'LOG_IN',
    message: 'user has been logged in via code',
    user_account: realUser
  });
}))

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
 * @api {get} /newcart/:store New Cart
 * @apiDescription create new cart for user, redirect them to /cart/:id and send an email
 * @apiGroup HTML
 * @apiParam {string} :store one of amazon_US, amazon_UK, amazon_CA, ypo (all defined in cart/cart_types.js)
 */
router.get('/newcart/:store', (req, res) => co(function * () {
  // cart body, used in db.Carts.create(cart) later
  var cart = {}

  // Figure out what store they are shopping at and in what locale
  console.log('req.params.store', req.params)
  if (!req.params.store) {
    cart.store = 'Amazon'
    cart.store_locale = 'US'
  } else if (req.params.store === 'YPO') {
    cart.store = 'YPO'
    cart.store_locale = 'GB'
  } else if (req.params.store.includes('Amazon')) {
    cart.store = 'Amazon'
    cart.store_locale = req.params.store.split('_')[1]
  } else {
    throw new Error('Cannot create new cart for store ' + req.params.store)
  }

  // figure out what country the user is in
  var geo = geolocation(req) || geolocation.default

  // determine if we should show the Pay with Stripe button
  // if any of these conditions are met, then kip pay is allowed
  cart.kip_pay_allowed = [
    cart.store === 'ypo',
    cart.store_locale !== geo.country
  ].filter(Boolean).length > 0

  // Add the cart leader if they are logged in
  const user_id = _.get(req, 'UserSession.user_account.id')
  if (user_id) {
    cart.leader = user_id
  }

  var date = new Date()
  if (cart.store_locale === 'US') {
    var dateString = (date.getMonth() + 1) + '/' + date.getDate() + '/' + String(date.getFullYear()).slice(2)
  } else {
    var dateString = date.getDate() + '/' + (date.getMonth() + 1) + '/' + String(date.getFullYear()).slice(2)
  }
  cart.name = cart.store + ' Kip Cart'

  // This is all we care about, creating new carts. 25 thousand carts per month is the goal
  cart = yield db.Carts.create(cart)

  // yay direct the user to their new cart
  res.redirect(`/cart/${cart.id}/`);

  // Send an email to the user with the cart link
  var email = yield db.Emails.create({
    recipients: _.get(req, 'UserSession.user_account.email_address'),
    subject: `Your New ${cart.store} Cart from Kip`,
    cart: cart.id
  })

  // use the new_cart email template
  email.template('new_cart', {
    cart: cart,
    username: _.get(req, 'UserSession.user_account.name', '')
  })

  // remember to actually send it
  yield email.send();

}).catch(e => {
  console.log(e)
}))

/**
 * @api {get} /version/:version Set A/B test version
 * @apiDescription sets the key for a/b tests, or picks a random one if invalid
 * @apiGroup HTML
 * @apiParam {string} :version key for ab testing, right now its A, B, or C
 */
router.get('/v/:version', (req, res)=> co(function *() {
  let version = req.params.version.toUpperCase();
  version = (version === 'A' || version === 'B' || version === 'C' || version === 'PRIME')
    ? version
    : res.UserSession && res.UserSession.siteVersion
      ? res.UserSession.siteVersion
      : _.sample(['A','B','C']);
  req.UserSession.siteVersion = version;
  yield req.UserSession.save();
  res.redirect('/');
}))

/**
 * @api {get} /lang/:lang Set language version
 * @apiDescription sets the key for language
 * @apiGroup HTML
 * @apiParam {string} :lang key for language, probably EN, CN, JP, GB, etc.
 */
router.get('/lang/:lang', (req, res)=> co(function *() {
  let lang = req.params.lang.toUpperCase();
  req.UserSession.siteVersion = lang;
  yield req.UserSession.save();
  res.redirect('/');
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
