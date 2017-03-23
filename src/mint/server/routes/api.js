var express = require('express');
var co = require('co');
var _ = require('lodash');

var utils = require('../utilities/utils.js');
var scrape = require('../cart/scrape_url')

var router = express.Router();

var prototype = !!process.env.PROTOTYPE;

var db;
const dbReady = require('../../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

/**
 * Hack the router for error handling
 */
['get', 'post', 'delete'].map(method => {
  var _originalHandler = router[method]
  router[method] = function (path, fn) {
    if (typeof path !== 'string' || typeof fn !== 'function') {
      return _originalHandler.apply(router, arguments)
    }

    _originalHandler.call(router, path, function (req, res, next) {
      var ret = fn(req, res, next)
      if (ret instanceof Promise) {
        ret.catch(e => {
          next(e)
        })
      }
    })
  }
})

/**
 * Testing
 */
router.get('/error', (req, res) => co(function * () {
  console.log('gonna throw an error now')
  throw new Error('omg error')
}))

/**
 * GET /api/session
 */
router.get('/session', (req, res) => {
  res.send(req.UserSession);
});

/**
 * GET /api/identify?email=peter.m.brandt%40gmail.com&cart_id=7877da92b35f
 */
router.get('/identify', (req, res) => co(function* () {
  console.log('identify');

  // Check the cart to see if there's already a leader
  var cart = yield db.Carts.findOne({ id: req.query.cart_id }).populate('leader')

  // Find the user associated with this email, if any
  var email = req.query.email.trim().toLowerCase()
  var user

  // check if the user is already identified as this email
  req.UserSession.user_accounts.map(u => {
    if (u.email_address === email) {
      user = u
    }
  })
  if (user) {
    console.log('user was logged in as that email already')
    cart.leader = user.id
    yield cart.save()

    if (prototype) {
      return res.redirect('/cart/' + cart.id)
    } else {
      return res.send({
        ok: true,
        status: 'USER_LOGGED_IN',
        message: 'You are already logged in with that email address on this device',
        user: user,
        cart: cart
      });
    }
  }

  // If a user exists in the db, send them a magic link to prove it's them
  user = yield db.UserAccounts.findOne({
    email_address: email
  })
  if (user) {
    console.log('email already exists in db')
    if (prototype) {
      res.render('pages/prototype/check_your_email_magic', {
        user,
        cart
      })
    } else {
      res.send({
        ok: false,
        status: 'CHECK_EMAIL',
        message: 'Someone has already claimed that emails. Please check your email and use the link we sent you to verify your identity.',
      });
    }

    // generate magic link here
    var link = yield db.AuthenticationLinks.create({
      user: user.id,
      cart: cart.id
    })

    link = yield db.AuthenticationLinks.findOne({
      id: link.id
    }).populate('user').populate('cart')

    var lostEmail = yield db.Emails.create({
      recipients: email,
      subject: 'Log in to Kip'
    })

    lostEmail.template('authentication_link', {
      link
    })

    yield lostEmail.send()
    return
  }

  // No user was found with the email address, so this is a new user, party!
  console.log('creating new user')
  user = yield db.UserAccounts.create({
    email_address: email
  })

  // if there is already a leader, add the user to the members list
  if (cart.leader && cart.leader.email_address !== user.email) {
    cart.members.add(user.id)
  } else {
    cart.leader = user.id
  }
  req.UserSession.user_accounts.add(user.id)
  yield [cart.save(), req.UserSession.save()]

  if (prototype) {
    res.redirect('/cart/' + cart.id)
  } else {
    res.send({
      ok: true,
      status: 'NEW_USER',
      message: 'Thanks for registering for Kip! An email was sent to you with a link for this cart.',
      user: user,
      cart: cart
    });
  }

  // Send an email to the user with the cart link
  email = yield db.Emails.create({
    recipients: user.email_address,
    subject: 'Your New Cart from Kip'
  })

  // use the new_cart email template
  email.template('new_cart', {
    id: cart.id
  })

  // remember to actually send it
  yield email.send();
}))

/**
 * For when a user adds something via email or whatever. just add the string to the list
 */
router.get('/addItem', (req, res) => co(function* () {
  const cart = yield db.Carts.findOne({ id: req.query.cart_id })
  const item = yield db.Items.create({
    original_link: req.query.url
  })
  cart.items.add(item.id)
  yield cart.save()
  if (prototype) {
    return res.redirect('/cart/' + cart.id)
  } else {
    return res.send({
      ok: true,
      item: item
    })
  }
}))

/**
 * Returns all the carts that the user is a member or leader of
 */
router.get('/carts', (req, res) => co(function * () {
  if (!_.get(req, 'UserSession.user_accounts[0]')) {
    return res.send([])
  }

  // get the list of their user ids
  const userIds = req.UserSession.user_accounts.map(a => a.id)

  // find all the carts where their user id appears in the leader or member field
  const carts = yield db.Carts.find({
    or: [
      { leader: userIds },
      { members: userIds }
    ]
  }).populate('items').populate('leader').populate('members')

  res.send(carts)
}))

/**
 * if they goto api/cart maybe redirect or something, possibly could use this elsewhere
 * @param {cart_id} ) cart_id to redirect to or whatever
 * redirects to cart/:cart_id
 */
router.get('/cart/:cart_id', (req, res) => co(function* () {
  var cart = yield db.Carts.findOne({ id: req.params.cart_id })
    .populate('leader')
    .populate('members')
    .populate('items')

  if (cart) {
    res.send(cart);
  } else {
    throw new Error('Cart not found')
  }
}));

/**
 * gets items in cart
 * @param {String}  cart_id
 * @yield {[type]} [description]
 */
router.get('/cart/:cart_id/items', (req, res) => co(function* () {
  var cart = yield db.Carts.findOne({ id: req.params.cart_id }).populate('items')
  if (!cart) {
    throw new Error('Cart not found')
  }

  res.send(cart.items)
}));

/**
 * adds item to cart. request body should contain the url
 * {
 *   url: 'some.url', // required
 *   user_id: '1234', // the user id if they have more than one account
 * }
 * @param {cart_id} cart_id to add item to
 * @returns {Item}
 */
router.post('/cart/:cart_id/item', (req, res) => co(function* () {
  // only available for logged-in Users
  if (!_.get(req, 'UserSession.user_accounts[0]')) {
    throw new Error('Unauthorized')
  }

  // if they specified the user id, verify it is them
  var userIds = req.UserSession.user_accounts.reduce((set, a) => set.add(a.id), new Set())
  if (req.body.user_id && !userIds.has(req.body.user_id)) {
    throw new Error('Unauthorized')
  }

  // Make sure the cart exists
  const cart = yield db.Carts.findOne({id: req.params.cart_id})
  if (!cart) {
    throw new Error('Cart not found')
  }

  // Create an item from the url
  const item = yield scrape(req.body.url)
  cart.items.add(item.id)

  // specify who added it
  if (req.body.user_id) {
    item.added_by = req.body.user_id
  } else {
    item.added_by = req.UserSession.user_accounts[0].id
  }
  yield item.save()

  // Add the user to the members group of the cart if they are not part of it already
  // IF they specified a specific user_account id that they want to add the cart as,
  // use that one, otherwise use the first user id in their list
  if (req.body.user_id) {
    var isLeader = cart.leader === req.body.user_id
    var isMember = cart.members.has(req.body.user_id)
    if (!isLeader && !isMember) {
      cart.members.add(req.body.user_id)
    }
  } else {
    var isLeader = userIds.has(cart.leader)
    var isMember = cart.members.reduce((isMember, id) => isMember || userIds.has(id), false)
    if (!isLeader && !isMember) {
      cart.members.add(req.UserSession.user_acconts[0].id)
    }
  }
  yield cart.save()

  if (prototype) {
    return res.redirect('/cart/' + cart.id)
  } else {
    return res.send(item)
  }
}));

/**
 * delete or subtract item from cart
 * @param {string} item identifier
 * @param {cart_id} cart_id to remove item from
 * @param {quantity} [number to subtract]
 * @yield {[type]} [description]
 */
router.delete('/cart/:cart_id/item', (req, res) => co(function* () {
  // only available for logged-in Users
  if (!_.get(req, 'UserSession.user_accounts[0]')) {
    throw new Error('Unauthorized')
  }

  // Make sure the cart exists
  const cart = yield db.Carts.findOne({id: req.params.cart_id})
  if (!cart) {
    throw new Error('Cart not found')
  }

  // Make sure they specified an item id
  if (!req.body.item_id) {
    throw new Error('Must specify item_id')
  }

  // find the item they want to delete
  var item = yield db.Items.findOne({
    id: req.body.item_id
  })
  if (!item) {
    throw new Error('Item not found')
  }

  // Make sure user has permission to delete it
  var isLeader = req.UserSession.user_accounts.map(a => a.id).includes(cart.leader)
  var isAdder = req.UserSession.user_accounts.map(a => a.id).includes(item.added_by)
  if (!isLeader && !isAdder) {
    throw new Error('Unauthorized')
  }

  // Remove the cart-item association
  cart.items.remove(item.id)
  yield cart.save()

  // Just say ok
  res.status(200).end()
}));

/**
 * get user from api based on id or email
 * @param {string} either id or email param in query
 * @yield {object} user object
 */
router.get('/user', (req, res) => co(function* () {
  var user;
  if (_.get(req, 'body.email')) {
    user = yield db.UserAccounts.findOne({
      email_address: req.body.email.toLowerCase()
    });
  } else if (_.get(req, 'body.id')) {
    user = yield db.UserAccounts.findOne({
      id: req.body.id
    });
  } else {
    return new Error('magic_id doesnt exist, probably return user to some error page where they can create new cart');
  }
  res.send(user);
}));

/**
 * magic links for creator to be auto signed in, this would be specific to the admin versus a url for new members
 * @param {[cart_id]} )             {}) [description]
 * @param {string} magic_id - the magic id for the cart
 * @yield {[type]} [description]
 */
router.get('/magiclink/:magic_id', (req, res) => co(function* () {
  // find if magic_id exists
  var magicLink = db.magiclinks.findOne({ id: req.params.magic_id });
  if (magicLink) {
    // redirect and log user in
    res.send(magicLink);
    // res.redirect(`/cart/${cart.cart_id}`);
  } else {
    return new Error('magic_id doesnt exist, probably return user to some error page where they can create new cart');
  }
}));

module.exports = router;
