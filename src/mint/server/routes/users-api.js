const co = require('co')
const _ = require('lodash')
const dealsDb = require('../deals/deals')
var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

module.exports = function (router) {
  /**
   * @api {get} /api/session Session
   * @apiDescription Gets the user's current session
   * @apiGroup Users
   * @apiSuccess {UserAccount} user_account the user account
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

    // check if the user is already identified as this email
    // Koh: This returns undefined if no user_account present. Breaks subsequent code
    var currentUser = req.UserSession.user_account

    // IF they are already logged in as this email, probably in a weird state to be re-identifying
    // idk maybe they have multiple tabs open or something, just roll with it
    if (currentUser && currentUser.email_address === email) {
      // make them the glorious cart leader if the cart is leaderless, otherwise a member
      if (!cart.leader) {
        cart.leader = currentUser.id
        yield cart.save()
      } else if (!cart.members.includes(currentUser.id)) {
        cart.members.add(currentUser.id)
        yield cart.save()
      }

      // assert that everything is okay, even though like this is kind of a weird thing that just happened
      return res.send({
        ok: true,
        newAccount: false,
        status: 'USER_LOGGED_IN',
        message: 'You are already logged in with that email address on this device',
        user: currentUser,
        cart: cart
      });
    }

    // If a user exists in the db, send them a magic link to prove it's them
    var user = yield db.UserAccounts.findOne({
      email_address: email
    })

    if (user) {
      console.log('email already exists in db, need to send a verification link in an email')
      res.send({
        ok: false,
        newAccount: false,
        status: 'CHECK_EMAIL',
        message: 'Someone has already claimed that email. Please check your email and use the link we sent you to verify your identity.',
      });

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
    console.log('creating new user ' + email + ' 🎉')
    user = yield db.UserAccounts.create({
      email_address: email
    })

    // add them to the session
    req.UserSession.user_account = user.id
    yield req.UserSession.save()

    // make them the glorious cart leader if the cart is leaderless, otherwise a member
    if (!cart.leader) {
      cart.leader = user.id
      yield cart.save()
    } else if (!cart.members.includes(user.id)) {
      cart.members.add(user.id)
      yield cart.save()
    }

    // Tell the front end that everything worked out pretty okay and we're happy to have a new user
    res.send({
      ok: true,
      newAccount: true,
      status: 'NEW_USER',
      message: 'Thanks for registering for Kip! An email was sent to you with a link for this cart.',
      user: user,
      cart: cart
    });

    // Send an email to the user with the cart link
    email = yield db.Emails.create({
      recipients: user.email_address,
      subject: 'Your New Cart from Kip',
      cart: cart.id
    })

    // grab the daily deals
    let allDeals = yield dealsDb.getDeals(4, 0),
      deals = [allDeals.slice(0, 2), allDeals.slice(2, 4)];

    // use the new_cart email template
    email.template('new_cart', {
      cart: cart,
      deals: deals
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
   * @api {get} /api/logout Get
   * @apiDescription resets session coookie
   */
  router.get('/logout', (req, res) => {
    req.session.reset();
    res.send(200);
  });

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
    var currentUser = req.UserSession.user_account
    if (!currentUser || currentUser.id !== req.params.user_id) {
      throw new Error('Unauthorized')
    }

    // Find the user in the database
    var user = yield db.UserAccounts.findOne({id: req.params.user_id})

    // hope nothing crazy is going on b/c like the user is obvs logged in but the account doesn't exist in the db?
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
   * @api {post} /api/feedback Feedback
   * @apiDescription logging user feedback
   * @apiGroup Users
   * @apiParam {string} rating one of ['good', 'ok', 'bad']
   * @apiParam {string} text general feedback text
   *
   * @apiParamExample Request
   * post /api/feedback {
   *  rating: "bad",
   *  text: "can't add 36 oz beer bong to my cart. unacceptable."
   * }
   */
  router.post('/feedback', (req, res) => co(function * () {
    var feedback = yield db.Feedback.create({
      user: _.get(req, 'UserSession.user_account.id'),
      session: req.UserSession.id,
      request_json: JSON.stringify({
        ip: req.ip,
        body: req.body,
        cookies: req.cookies,
        hostname: req.hostname,
        protocol: req.protocol,
        path: req.path,
        query: req.query,
        route: req.route,
        signedCookies: req.signedCookies,
        headers: req.headers,
        originalUrl: req.originalUrl
      }),
      rating: req.body.rating,
      text: req.body.text
    })

    // done with the http request, will move on to sending an email to hello@kipthis.com
    res.status(200).end()

    // Now send an email message to us if we have one
    var feedbackEmail = yield db.Emails.create({
      recipients: 'hello@kipthis.com',
      subject: '[Mint Feedback] New Feedback from Mint'
    })

    const data = _.merge(
      {},
      feedback,
      {
        user: _.get(req, 'UserSession.user_account')
      })
    yield feedbackEmail.template('feedback', data)

    yield feedbackEmail.send()
  }))
}
