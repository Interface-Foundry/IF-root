var express = require('express');
var co = require('co');
var _ = require('lodash');

var utils = require('../utilities/utils.js');

var router = express.Router();

var prototype = !!process.env.PROTOTYPE;

var db;
const dbReady = require('../../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

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
 * if they goto api/cart maybe redirect or something, possibly could use this elsewhere
 * @param {cart_id} ) cart_id to redirect to or whatever
 * redirects to cart/:cart_id
 */
router.get('/cart/:cart_id', (req, res) => co(function* () {
  console.log('GETTING CART', req.params.cart_id);
  var cart = yield db.Carts.findOne({ id: req.params.cart_id });

  if (cart) {
    res.send(cart);
  } else {
    console.log('cart doesnt exist');
    res.sendStatus(400);
  }
}));

/**
 * gets items in cart
 * @param {[type]} )             {  var cart [description]
 * @yield {[type]} [description]
 */
router.get('/cart/:cart_id/items', (req, res) => co(function* () {
  var cart = yield db.Carts.findOne({ id: req.params.cart_id });
  cart.items = [{
    "id": 1,
    "email": "mcarr0@ox.ac.uk",
    "name": "Zoolab",
    "descrip": "Multi-tiered intermediate alliance",
    "quantity": 8,
    "price": 37.15,
    "paid": false,
    "total": 297.2,
    "original_link": "https://www.amazon.com/gp/product/LEY6C35ULO/"
  }, {
    "id": 2,
    "email": "tryan1@google.pl",
    "name": "Viva",
    "descrip": "Stand-alone upward-trending initiative",
    "quantity": 6,
    "price": 55.32,
    "paid": true,
    "total": 331.92,
    "original_link": "https://www.amazon.com/gp/product/KC0ZU0V7L0/"
  }, {
    "id": 3,
    "email": "kjordan2@histats.com",
    "name": "Ronstring",
    "descrip": "Multi-lateral explicit functionalities",
    "quantity": 6,
    "price": 95.85,
    "paid": true,
    "total": 575.1,
    "original_link": "https://www.amazon.com/gp/product/VT3SK6356X/"
  }, {
    "id": 4,
    "email": "drussell3@tmall.com",
    "name": "Daltfresh",
    "descrip": "Re-engineered leading edge conglomeration",
    "quantity": 7,
    "price": 48.82,
    "paid": true,
    "total": 341.74,
    "original_link": "https://www.amazon.com/gp/product/VU0U3A5R8T/"
  }, {
    "id": 5,
    "email": "rallen4@eventbrite.com",
    "name": "Asoka",
    "descrip": "Virtual heuristic implementation",
    "quantity": 5,
    "price": 16.23,
    "paid": true,
    "total": 81.15,
    "original_link": "https://www.amazon.com/gp/product/JX44JB6DHB/"
  }, {
    "id": 6,
    "email": "ngilbert5@mapy.cz",
    "name": "Domainer",
    "descrip": "Persistent modular portal",
    "quantity": 2,
    "price": 28.54,
    "paid": false,
    "total": 57.08,
    "original_link": "https://www.amazon.com/gp/product/IEIPESB180/"
  }, {
    "id": 7,
    "email": "jhenderson6@go.com",
    "name": "Y-find",
    "descrip": "Configurable mobile instruction set",
    "quantity": 10,
    "price": 84.6,
    "paid": false,
    "total": 846.0,
    "original_link": "https://www.amazon.com/gp/product/GSLUQ7YE8Q/"
  }, {
    "id": 8,
    "email": "cmiller7@hexun.com",
    "name": "Viva",
    "descrip": "Synchronised coherent matrices",
    "quantity": 3,
    "price": 46.74,
    "paid": true,
    "total": 140.22,
    "original_link": "https://www.amazon.com/gp/product/FUWF3GD18A/"
  }, {
    "id": 9,
    "email": "hhanson8@go.com",
    "name": "Wrapsafe",
    "descrip": "Devolved tertiary attitude",
    "quantity": 6,
    "price": 2.96,
    "paid": true,
    "total": 17.76,
    "original_link": "https://www.amazon.com/gp/product/QRUWM0F4M9/"
  }, {
    "id": 10,
    "email": "trussell9@harvard.edu",
    "name": "Subin",
    "descrip": "Centralized global task-force",
    "quantity": 2,
    "price": 49.38,
    "paid": true,
    "total": 98.76,
    "original_link": "https://www.amazon.com/gp/product/JS3QM8ODX9/"
  }, {
    "id": 11,
    "email": "cgarretta@imdb.com",
    "name": "Bitwolf",
    "descrip": "User-friendly national customer loyalty",
    "quantity": 2,
    "price": 86.02,
    "paid": false,
    "total": 172.04,
    "original_link": "https://www.amazon.com/gp/product/BK9V01FAXM/"
  }, {
    "id": 12,
    "email": "lyoungb@i2i.jp",
    "name": "Matsoft",
    "descrip": "Seamless radical instruction set",
    "quantity": 8,
    "price": 84.02,
    "paid": false,
    "total": 672.16,
    "original_link": "https://www.amazon.com/gp/product/DZ3QM958GB/"
  }, {
    "id": 13,
    "email": "tphillipsc@webnode.com",
    "name": "Bamity",
    "descrip": "Secured high-level migration",
    "quantity": 10,
    "price": 94.3,
    "paid": true,
    "total": 943.0,
    "original_link": "https://www.amazon.com/gp/product/OR05AA312F/"
  }, {
    "id": 14,
    "email": "ebakerd@independent.co.uk",
    "name": "Bamity",
    "descrip": "Public-key didactic methodology",
    "quantity": 3,
    "price": 25.17,
    "paid": false,
    "total": 75.51,
    "original_link": "https://www.amazon.com/gp/product/AP5412S972/"
  }, {
    "id": 15,
    "email": "jwrighte@independent.co.uk",
    "name": "Quo Lux",
    "descrip": "Virtual multimedia process improvement",
    "quantity": 10,
    "price": 19.92,
    "paid": true,
    "total": 199.2,
    "original_link": "https://www.amazon.com/gp/product/TM323I7E31/"
  }];

  if (cart) {
    res.send(cart.items);

  } else {
    console.log(`cart ${req.params.cart_id} doesnt exist`);
    res.sendStatus(400);
  }
}));

/**
 * adds item to cart based on url or possibly other ways
 * @param {cart_id} cart_id to add item to
 * @param {item_url} item url from amazon
 * @returns 200
 */
router.post('/cart/:cart_id/items', (req, res) => co(function* () {

  // const cart = yield db.Carts.findOne({id: req.query.cart_id})
  // const item = yield db.Items.create({
  //   original_link: req.query.url
  // })
  // cart.items.add(item.id)
  // yield cart.save()
  // if (prototype) {
  //   return res.redirect('/cart/' + cart.id)
  // } else {
  //   return res.send({
  //     ok: true,
  //     item: item
  //   })
  // }
  var original_url = req.body.url;
  var cartId = req.params.cart_id;

  // just get the amazon lookup results and title from that currently
  var itemTitle = yield utils.getItemByUrl(original_url);

  var itemObj = {
    cart: cartId,
    original_link: original_url,
    item_name: itemTitle
  };

  var item = yield db.Items.findOne(itemObj);

  if (item) {
    item.quantity++;
  } else {
    yield db.Items.create(itemObj);
  }

  res.send(200);
}));

/**
 * delete or subtract item from cart
 * @param {string} item identifier
 * @param {cart_id} cart_id to remove item from
 * @param {quantity} [number to subtract]
 * @yield {[type]} [description]
 */
router.delete('/cart/:cart_id/items', (req, res) => co(function* () {
  var item = req.body.itemId;
  var cartId = req.params.cart_id;
  var quantity = _.get(req, 'body.quantity') ? req.body.quantity : -1;

  // just get the amazon lookup results and title from that currently
  yield db.Items.findOneAndUpdate({ item: item, cart_id: cartId }, { $inc: { 'quantity': quantity } });
  res.send(200);
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
