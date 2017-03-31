const co = require('co')
const _ = require('lodash')
var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

module.exports = function (router) {
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
        subject: 'Log in to Kip',
        cart: cart.id
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
      subject: 'Your New Cart from Kip',
      cart: cart.id
    })

    // use the new_cart email template
    email.template('new_cart', {
      id: cart.id
    })

    // remember to actually send it
    yield email.send();
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
}
