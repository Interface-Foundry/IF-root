// file: index.js
const express = require('express');

const _ = require('lodash');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const sessions = require('client-sessions');
const passport = require('passport');
const uuid = require('uuid');
const passportJWT = require('passport-jwt'),
  ExtractJwt = passportJWT.ExtractJwt,
  JwtStrategy = passportJWT.Strategy;

const app = express();

const co = require('co');
const utils = require('./helpers.js');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
  secretOrKey: uuid.v4()
};
/**
 * JWT authentication strategy
 * Determines whether to allow a person to view a page
 * @param  {Object} jwtOptions    set of options for the token
 */
const strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
  const userIndex = _.findIndex(users, {
    id: jwt_payload.id
  });
  const user = users[userIndex];
  if (user) {
    users[userIndex].password = uuid.v4();
    next(null, user);
  } else next(null, true);
});

passport.use(strategy);
app.use(passport.initialize());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

/**
 * Mock the user_account collection
 * @type {Array}
 */
const users = [{
  id: 1,
  email: 'me@chrisb.me',
  password: uuid.v4()
}, {
  id: 2,
  email: 'me@chrisb.xyz',
  password: uuid.v4()
}];

/**
 * Mock the session collection
 */
const mock_sessions = [{
  session_id: Math.random().toString(36).slice(2),
}]

/**
 * Mock the tracking data
 */
const mock_tracking_data = [{
  session_id: 'asdfg',
  user_agent: 'Chrome [like Gecko] Version 100....]',
  ip_address: '127.0.0.1'
}]

/**
 * Mock the user_account_session collection
 */
const mock_user_account_sessions = [{
  user_id: 1,
  session_id: 'asdfghrwedfg'
}]


/**
 * Creates a cookie-based session for the client
 */
app.use(sessions({
  cookieName: 'session',
  secret: 'H68ccVhbqS5VgdB47/PdtByL983ERorw', // `openssl rand -base64 24`
  duration: 0, // never expire
}));

/**
 * Save user sessions to the database
 */
app.use(function (req, res, next) {
  // req.session will always exist, thanks to the above client-sessions middleware
  console.log('session is', req.session)

  // Check to make sure we have stored this user's session in the database
  if (!req.session.user_session_id) {
    // 
    // Create a user_session record in the database
    // - generate a new user_session_id wih Math.random().toString(36).slice(2)
  }

  // Now that the session_id exists, save the tracking information, like IP, user-agent, etc
  // TODO week of March 12
})

/**
 * Setting cookies after load
 * Note to Chris: we can delete this :)
 */
app.use((req, res, next) => {
  if (req.session.seenyou) {
    res.setHeader('X-Seen-You', 'true');
  } else {
    req.session.seenyou = true;
    res.setHeader('X-Seen-You', 'false');
  }
  req.carts = {
    'carts': ['a', 'b', 'c']
  };
  next();
});

/**
 * Identify a user, associating a session with a user_account
 * Multiple user_accounts can be associated with one session, personal email and work email on same computer
 * Though this is a GET route, it should be used with XHR/ajax, not as a renderable page
 */
app.get('/identify/:email', function (req, res) {
  console.log('identify with email', req.params.email)
  // Find user_account with email in the db
  // If not exists, create a new user_account
  // Associate the session with the user account in user_to_session table
})

/**
 * Login Page
 * Used for getting emails
 * Generates a url for authentication
 * Eventually this should trigger an email to send instead of displaying url
 * 
 * Notes for Chris:
 *  - we can get rid of this
 */
app.post('/login', function(req, res) {
  let email = req.body.email;
  // usually this would be a database call:
  let user = users[_.findIndex(users, {email: email})];
  if (!user) {
    res.status(401).json({
      message: 'no such user found'
    });
  } else {
    let payload = {
      id: user.id
    };
    let token = jwt.sign(payload, jwtOptions.secretOrKey, {
      expiresIn: '1m'
    });
    res.send(`You can log in with http://localhost:3000?token=${token}`);
  }
});

app.get('/login', function(req, res) {
  // display a form to post to /createaccount or /login for adding emails
});

/**
 * Home
 * Redirects to login without a token
 * should check for cookies too
 *
 * Notes for Chris:
 *  - get rid of JWT here and elsewhere for now
 *  - Send the landing page here, the one with just one button [Start Group Shopping]
 */
app.get('/', passport.authenticate('jwt', {
  session: false,
  successRedirect: '/',
  failureRedirect: '/login'
}), function(req, res) {
  res.json('Success! You can not see this without a token');
});

/**
 * view cart/forwarding url - cart should be like 10 letters or something small
 * @param {cart_id}
 */
app.get('/cart/:cart_id', (req, res) => co(function * () {
  // check if we are in a session

  // if not check for cart
  var cart = yield utils.getCart(req.params.cart_id);

  // no cart exists
  if (cart === undefined) {
    res.redirect('/newcart');
  }

  // ask user for email to tie to session
}));

/**
 * create new cart for user, redirect them to /cart/:cart_id
 *
 * @param {[type]}
 * @yield {[type]} [description]
 */
app.get('/newcart', (req, res) => co(function * () {
}));

app.listen(3000, function() {
  console.log('Express running');
});
