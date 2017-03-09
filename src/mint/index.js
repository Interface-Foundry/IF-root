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
 * This should be replaced by a db of users
 * Just an example for now
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
 * Defines a cookie
 */
app.use(sessions({
  cookieName: 'session',
  secret: uuid.v4(),
  duration: 24 * 60 * 60 * 1000,
  activeDuration: 1000 * 60 * 5
}));

/**
 * Setting cookies after load
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
 * Login Page
 * Used for getting emails
 * Generates a url for authentication
 * Eventually this should trigger an email to send instead of displaying url
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
