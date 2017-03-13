// file: index.js
const fs = require('fs')
const express = require('express'),
  app = express();
const bodyParser = require('body-parser');
const sessions = require('client-sessions');
const path = require('path');
const co = require('co');
const utils = require('./utils.js');
const mintLogger = require('./mint_logging.js');
const Email = require('../email')

/**
 * Models loaded from the waterline ORM
 */
var db
const dbReady = require('../db')
dbReady.then(models => db = models).catch(e => console.error(e))

/**
 * BORING STUFF (TODO move this to a file name boilerplate.js)
 */
app.set('view engine', 'ejs');
app.use(express.static(path.resolve(__dirname, '..', 'public')));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

/**
 * Creates a cookie-based session for the client
 */
app.use(sessions({
  cookieName: 'session',
  secret: 'H68ccVhbqS5VgdB47/PdtByL983ERorw', // `openssl rand -base64 24`
  duration: 0 // never expire
}));

/**
 * Save user sessions to the database
 */
app.use(function(req, res, next) {
  // req.session will always exist, thanks to the above client-sessions middleware
  // Check to make sure we have stored this user's session in the database
  if (!req.session.session_id) {
    var sessionId = Math.random().toString(36).slice(2)
    req.session.session_id = sessionId;
    db.Sessions.create({
      session_id: sessionId
    }).catch(e => {
      console.error(e)
    })
  }

  // Now that the session_id exists, save the tracking information, like IP, user-agent, etc
  // TODO week of March 12

  console.log('session is', req.session.session_id)
  next();
});

/**
 * Add in logging after sessions have been created
 */
app.use(new mintLogger.NormalLogger());

/**
 * Identify a user, associating a session with a user_account
 * Multiple user_accounts can be associated with one session, personal email and work email on same computer
 * Though this is a GET route, it should be used with XHR/ajax, not as a renderable page
 */
app.get('/createAccount', (req, res) => co(function * () {
  console.log('identify with email', req.query.email);

  // clean up the email TODO
  var email_address = req.query.email.toLowerCase()

  // Find an existing user or create a new one
  var user = yield db.UserAccounts.findOne()
    .where({email_address: email_address})

  // Create new one if didn't find it
  if (!user) {
  var user = yield db.UserAccounts.create({
    email_address: email_address,
    sessions: [req.session.session_id]
  })
  }

  res.send('ok')
    
  // then also send an email
  var email = new Email({
    to: [user]
  }).newCart({
    cart_id: req.query.cart_id
  })

  yield email.send()

  // Find user_account with email in the db
  // If not exists, create a new user_account
  // Associate the session with the user account in user_to_session table
}))


/**
 * Add a url to a cart from an email, redirect user to the react app
 */
app.get('/addcart', (req, res) => co(function * () {
  var cartId = req.query.cart_id
  // todo add the url specified to the amazon cart // TODO
  res.redirect('/cart/' + cartId)
}))

/**
 * Landing page serves static html
 */

app.get('/', (req, res) => {
  res.render('pages/index')
})

/**
 * magic links for creator to be auto signed in, this would be specific to the admin versus a url for new members
 * @param {[cart_id]} )             {}) [description]
 * @param {string} magic_id - the magic id for the cart
 * @yield {[type]} [description]
 */
app.get('/magi/:magic_id', (req, res) => co(function * () {
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
 * create new cart for user, redirect them to /cart/:cart_id
 */
app.get('/newcart', (req, res) => co(function * () {
  var session_id = req.session.session_id;
  var cart_id = yield utils.createNewCart(req, session_id);
  res.redirect(`/cart/${cart_id}`);
}));

/**
 * example of how the error logger works for time being
 */
app.get('/fail', function(req, res, next) {
  return next(new Error('This is an error and it should be logged to the console'));
});

// Always return the main index.html, so react-router render the route in the client
// Basically, anything that's not an api gets handled by react-router
// we can pass arrays to react by embedding their strings in javascript
// or we could handle session data through fetching data with react
app.get('*', (req, res) =>
  // Get the user_accont info, if exists (might not if they are clicking a shared link)
  // Get the cart info, if doesn't exist res.render('pages/404'), views/pages/404.ejs static page, a nice 404 with a Start Shopping link to create a new cart.
  res.render('pages/cart')
);

app.use(new mintLogger.ErrorLogger());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

process.on('unhandledRejection', (reason) => {
  console.log('Unhandled Promise Rejection')
  console.log('Reason: ' + reason)
});
