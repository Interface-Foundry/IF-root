var express = require('express');
var co = require('co');
var _ = require('lodash');
var open = require('open')

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
 * @api {get} /api/error Error
 * @apiDescription Trigger an error for testing
 * @apiGroup Testing
 */
router.get('/error', (req, res) => co(function * () {
  console.log('gonna throw an error now')
  throw new Error('omg error')
}))

/**
 * @api {get} /api/session Session
 * @apiDescription Gets the user's current session
 * @apiGroup Users
 * @apiSuccess {[UserAccount]} user_accounts list of user accounts
 * @apiSuccess {String} animal the session's randomized animal
 */
router.get('/session', (req, res) => {
  res.send(req.UserSession);
});

/**
 * @api {get} /api/identify?email=:email&cart_id=:cart_id Identify
 * @apiGroup Users
 * @apiParam {string} email the user's email
 * @apiParam {string} cart_id the cart id
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
        newAccount: false,
        status: 'USER_LOGGED_IN',
        message: 'You are already logged in with that email address on this device',
        user: user,
        cart: cart,
      });
    }
  }

  // If a user exists in the db, send them a magic link to prove it's them
  // user = yield db.UserAccounts.findOne({
  //   email_address: email
  // })
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
        newAccount: false,
        status: 'CHECK_EMAIL',
        message: 'Someone has already claimed that email. Please check your email and use the link we sent you to verify your identity.',
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

    if (process.env.NODE_ENV !== 'production') {
      console.log('http://localhost:3000/auth/' + link.id)
    }

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
      newAccount: true,
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
 * @api {get} /api/carts User Carts
 * @apiDescription Returns all the carts that the user is a member or leader of
 * @apiGroup Carts
 *
 * @apiSuccess {[Item]} items list of items
 * @apiSuccess {UserAccount} leader the cart leader
 * @apiSuccess {[UserAccount]} members users who have added something to the cart
 *
 * @apiSuccessExample Success-Response
 * [{"members":[{"email_address":"peter@interfacefoundry.com","createdAt":"2017-03-16T16:19:10.812Z","updatedAt":"2017-03-16T16:19:10.812Z","id":"bc694263-cf19-46ea-b3f1-bd463f82ce55"}],"items":[{"original_link":"watches","quantity":1,"createdAt":"2017-03-16T16:18:32.047Z","updatedAt":"2017-03-16T16:18:32.047Z","id":"58cabad83a5cd90e34b29610"}],"leader":{"email_address":"peter.m.brandt@gmail.com","createdAt":"2017-03-16T16:18:27.607Z","updatedAt":"2017-03-16T16:18:27.607Z","id":"257cd470-f19f-46cb-9201-79b8b4a95fe2"},"createdAt":"2017-03-16T16:18:23.433Z","updatedAt":"2017-03-16T16:19:10.833Z","id":"3b10fc45616e"}]
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
 * @api {get} /api/cart/:cart_id Cart
 * @apiDescription Gets a single cart, does not have to be logged in
 * @apiGroup Carts
 * @apiParam {string} cart_id the cart id
 *
 * @apiSuccess {[Item]} items list of items
 * @apiSuccess {UserAccount} leader the cart leader
 * @apiSuccess {[UserAccount]} members users who have added something to the cart
 * @apiSuccessExample Success-Response
 * {"members":[{"email_address":"peter@interfacefoundry.com","createdAt":"2017-03-16T16:19:10.812Z","updatedAt":"2017-03-16T16:19:10.812Z","id":"bc694263-cf19-46ea-b3f1-bd463f82ce55"}],"items":[{"original_link":"watches","quantity":1,"createdAt":"2017-03-16T16:18:32.047Z","updatedAt":"2017-03-16T16:18:32.047Z","id":"58cabad83a5cd90e34b29610"}],"leader":{"email_address":"peter.m.brandt@gmail.com","createdAt":"2017-03-16T16:18:27.607Z","updatedAt":"2017-03-16T16:18:27.607Z","id":"257cd470-f19f-46cb-9201-79b8b4a95fe2"},"createdAt":"2017-03-16T16:18:23.433Z","updatedAt":"2017-03-16T16:19:10.833Z","id":"3b10fc45616e"}
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
 * @api {get} /api/cart/:cart_id/items Items
 * @apiDescription Gets all items in cart
 * @apiGroup Carts
 * @apiParam {String} cart_id
 */
router.get('/cart/:cart_id/items', (req, res) => co(function* () {
  var cart = yield db.Carts.findOne({ id: req.params.cart_id }).populate('items')
  if (!cart) {
    throw new Error('Cart not found')
  }

  res.send(cart.items)
}));

/**
 * @api {post} /api/cart/:cart_id/item Add Item
 * @apiDescription Adds an item to a cart
 * @apiGroup Carts
 * @apiParam {string} :cart_id cart id
 * @apiParam {string} url of the item from amazon or office depot or whatever
 * @apiParam {string} user_id specify the identity which is adding the item (otherwise server picks the first authenticated identity)
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
  item.cart = cart.id

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
      cart.members.add(req.UserSession.user_accounts[0].id)
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
 * @api {delete} /api/cart/:cart_id/item Delete Item
 * @apiDescription Delete or subtract item from cart. The user must be a leader or a member to do this (does not have to be the person that added the item)
 * @apiGroup Carts
 * @apiParam {string} :cart_id cart to remove item from
 * @apiParam {string} item_id the item's identifier
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
 * @api {post} /api/cart/:cart_id Update Cart
 * @apiDescription Update cart settings, except for id, leader, members, and items.
 * @apiGroup Carts
 * @apiParam {string} :cart_id id of the cart to update
 * @apiParam {json} body the properties you want to set on the cart
 *
 * @apiParamExample Request
 * post /api/cart/cd08ca774445 {
 *   "name": "Office Party",
 * }
 *
 * @apiSuccessExample Response
 * {"leader":"02a20ec6-edec-46b7-9c7c-a6f36370177e","createdAt":"2017-03-28T22:59:39.134Z","updatedAt":"2017-03-28T22:59:39.662Z","id":"289e5e60a855","name":"Office Party"}
 */
router.post('/cart/:cart_id', (req, res) => co(function * () {
  // get the cart
  var cart = yield db.Carts.findOne({id: req.params.cart_id})

  // check permissions
  var userIds = req.UserSession.user_accounts.reduce((set, a) => set.add(a.id), new Set())
  if (!userIds.has(cart.leader)) {
    throw new Error('Unauthorized')
  }

  // Can't update some fields with this route
  delete req.body.id
  delete req.body.leader
  delete req.body.members
  delete req.body.items

  _.merge(cart, req.body)
  yield cart.save()
  res.send(cart)
}))

/**
 * @api {post} /api/item/:item_id Update Item
 * @apiDescription Update item settings, except for id, leader, members, and items.
 * @apiGroup Carts
 * @apiParam {string} :item_id id of the item to update
 * @apiParam {json} body the properties you want to set on the item
 *
 * @apiParamExample Request
 * post /api/item/cd08ca774445 {
 *   "locked": true,
 * }
 *
 * @apiSuccessExample Response
 * {"leader":"02a20ec6-edec-46b7-9c7c-a6f36370177e","createdAt":"2017-03-28T22:59:39.134Z","updatedAt":"2017-03-28T22:59:39.662Z","id":"289e5e60a855","name":"Office Party"}
 */
router.post('/item/:item_id', (req, res) => co(function * () {
  // get the item
  var item = yield db.Items.findOne({id: req.params.item_id}).populate('cart')

  // get the cart, too
  var cart = item.cart

  // check permissions
  var userIds = req.UserSession.user_accounts.reduce((set, a) => set.add(a.id), new Set())
  if (!userIds.has(cart.leader) && !userIds.has(item.added_by)) {
    throw new Error('Unauthorized')
  }

  // Can't update some fields with this route
  delete req.body.id
  delete req.body.added_bys
  // TODO what should not be allowed?

  _.merge(item, req.body)
  yield item.save()
  res.send(item)
}))

/**
 * @api {get} /api/item/:item_id Item
 * @apiDescription Gets an item by id, populating the options and added_by fields
 * @apiGroup Carts
 * @apiParam {String} :item_id
 * @type {[type]}
 */
router.get('/item/:item_id', (req, res) => co(function * () {
  var item = yield db.Items.findOne({id: req.params.item_id})
    .populate('options')
    .populate('added_by')
  res.send(item)
}))

/**
 * @api {get} /api/user Get
 * @apiDescription Get user from db based on id or email
 * @apiGroup Users
 * @apiParam {string} email [optional query parameter] email addresss for the user
 * @apiParam {string} id [optional query parameter] id of the user
 *
 * @apiParamExample Request email
 * get /api/user?email=mctesty%40example.com
 *
 * @apiParamExample Request id
 * get /api/user?id=04b36891-f5ab-492b-859a-8ca3acbf856b
 *
 * @apiSuccessExample Response
 * {"email_address":"mctesty@example.com","createdAt":"2017-03-24T16:51:47.162Z","updatedAt":"2017-03-24T16:51:47.162Z","id":"04b36891-f5ab-492b-859a-8ca3acbf856b"}
 */
router.get('/user', (req, res) => co(function* () {
  var user
  if (_.get(req, 'query.email')) {
    user = yield db.UserAccounts.findOne({
      email_address: req.query.email.toLowerCase()
    });
  } else if (_.get(req, 'query.id')) {
    user = yield db.UserAccounts.findOne({
      id: req.query.id
    });
  } else {
    throw new Error('Cannot find user');
  }
  res.send(user);
}))

/**
 * @api {post} /api/user/:user_id Update
 * @apiDescription Updates a user's information
 * @apiGroup Users
 * @apiParam {string} :user_id id of the user to update
 * @apiParam {json} body the properties you want to set on the user
 *
 * @apiParamExample Request
 * post /api/user/04b36891-f5ab-492b-859a-8ca3acbf856b {
 *   "venmo_accepted": true,
 *   "venmo_id": "MoMcTesty"
 * }
 *
 * @apiSuccessExample Response
 * {"email_address":"mctesty@example.com","createdAt":"2017-03-28T18:39:31.458Z","updatedAt":"2017-03-28T18:39:32.299Z","venmo_accepted":true,"venmo_id":"MoMcTesty","id":"0f30e352-f975-400a-b7bb-e46bc38e7649"}
 */
router.post('/user/:user_id', (req, res) => co(function * () {
  // check permissions
  var userIds = req.UserSession.user_accounts.reduce((set, a) => set.add(a.id), new Set())
  if (!userIds.has(req.params.user_id)) {
    throw new Error('Unauthorized')
  }

  // Find the user in the database
  var user = yield db.UserAccounts.findOne({id: req.params.user_id})
  if (!user) {
    throw new Error('Could not find user ' + req.params.user_id)
  }

  // Can't update some fields
  delete req.body.id
  delete req.body.email_address
  delete req.body.sessions

  // update the properties that they set
  _.merge(user, req.body)

  yield user.save()

  res.send(user)
}))

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
