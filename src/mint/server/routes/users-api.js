const co = require('co')
const _ = require('lodash')
const randomstring = require('randomstring')
const dealsDb = require('../deals/deals')
const fbConstants = require('../facebookConstants')

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy

passport.use(new FacebookStrategy({
  clientID: fbConstants.clientID,
  clientSecret: fbConstants.clientSecret,
  callbackURL: fbConstants.baseUrl + '/api/auth/facebook/callback',
  profileFields: ['name', 'email']
}, async function (accessToken, refreshToken, profile, done) {
  //create an account for our facebook user if one does not already exist
  if (!profile.emails || !profile.emails.length) {
    // throw new Error('your facebook account sucks')
    return done(null, false)
  }
  var email = profile.emails[0].value
  var name = profile.name.givenName + ' ' + profile.name.familyName
  logging.info('email', email)
  var account = await db.UserAccounts.findOne({email_address: email})
  if (!account) {
    logging.info('creating new user account for ' + email)
    await db.UserAccounts.create({
      email_address: email,
      name: name
    })
  }
  done(null, profile)
}))

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((id, done) => done(null, id))

/**
 * turn email into user name - into a function so that it could be used
 * elsewhere if need be and so could add more complex functionality later
 *
 * @param      {string}  email   the email address of the user
 * @return     {string}  name of user as gathered from email address
 */
function normalizeEmailToName(email) {
  return email.split('@')[0]
}

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
   * @api {get} /api/login?email=:email&redirect=:redirect_url Login
   * @apiGroup Users
   * @apiDescription Logs a user in through the email authentication flow.
   *   Allows a redirect url to be specified so that if a user clicks through an email login confirmation link it takes them to the right page.
   *   Passes back `loggedIn: true` if already logged in as that user, or `loggedIn: false` if not
   *   If logged in as a different user, it logs them out of that account
   * @apiParam {string} email the user's email address
   * @apiParam {string} redirect the url to redirect to after getting logged in
   * @apiSuccessExample Authentication Link Sent
   *   {"ok":true,"loggedIn":false,"status":"Sent authentication link to peter.m.brandt@gmail.com"}
   * @apiSuccessExample Already Logged In
   *   {"ok":true,"loggedIn":true,"status":"Logged in already","user":{"email_address":"peter.m.brandt@gmail.com","createdAt":"2017-04-25T17:45:10.065Z","updatedAt":"2017-04-25T17:45:10.065Z","id":"62d8791b-3c15-4519-8fda-c3c0a3dd1e78"},"redirect":"/cart/15c0d2afa21f"}
   */
  router.get('/login', (req, res) => co(function* () {
    const currentUser = _.get(req, 'UserSession.user_account', {})
    const email = decodeURIComponent(req.query.email.trim().toLowerCase())

    // if the user is already logged in as this email address we can reply right away
    if (currentUser.email_address === req.query.email) {
      res.send({
        ok: true,
        loggedIn: true,
        status: 'Logged in already',
        user: currentUser,
        redirect: req.query.redirect
      })
    } else {
      // log out user if they are logged in
      if (currentUser.email_address) {
        delete req.UserSession.user_account
        yield req.UserSession.save()
      }

      // get or create a user for this email
      var user = yield db.UserAccounts.findOne({
        email_address: email
      }).populate('addresses')

      if (!user) {
        var user = yield db.UserAccounts.create({
          email_address: email,
          name: normalizeEmailToName(email)
        })
        // no need to verify email the first time

        req.UserSession.user_account = user.id
        yield req.UserSession.save()

        return res.json({
          ok: true,
          newAccount: true,
          status: 'LOG_IN',
          message: 'user has been logged for first time',
          user_account: user
        });
      }

      // send the user a login link
      var link = yield db.AuthenticationLinks.create({
        user: user.id,
        redirect_url: req.query.redirect || '/'
      })

      link = yield db.AuthenticationLinks.findOne({
        id: link.id
      }).populate('user')

      logging.info('created this auth link:', link)

      if (process.env.NODE_ENV !== 'production') {
        console.log('http://localhost:3000/auth/' + link.id)
      }

      console.log('inside login', currentUser.name || email)

      // check to see if this user already has auth links and if so destroy them
      yield db.AuthenticationLinks.destroy({
        id: { 'not': link.id },
        user: user.id
      });

      // generate magic code here
      var code = randomstring.generate({
        length: 6,
        charset: 'numeric'
      })
      logging.info('code:', code)

      // add code to auth link
      link.code = code;
      yield link.save();

      var loginEmail = yield db.Emails.create({
        recipients: email,
        subject: `Log in to Kip with ${code.substr(0,3)} ${code.substr(3)}` // Alyx wants spaces so it's pretty
      })

      loginEmail.template('login_email', {
        link,
        username: currentUser.name || email.split('@')[0],
        code: `${code.substr(0,3)} ${code.substr(3)}`
      })

      yield loginEmail.send()
      res.send({
        ok: true,
        loggedIn: false,
        status: 'Sent authentication link to ' + email
      })
    }
  }))

  /**
   * @api {get} /api/auth/facebook
   * @apiGroup Users
   * @apiDescription - courtesy of http://passportjs.org/docs/facebook
   * Redirect the user to Facebook for authentication.  When complete,
   * Facebook will redirect the user back to the application
   */

  router.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email'],
    successRedirect: '/',
    failureRedirect: '/newcart?toast=You couldn\'t log in :(&status=err'
  }))

  /**
   * @api {get} /api/facebook/auth/callback
   * @apiGroup Users
   * @apiDescription - from http://passportjs.org/docs/facebook
   * Facebook will redirect the user to this URL after approval.  Finish the
   * authentication process by attempting to obtain an access token.  If
   * access was granted, the user will be logged in.  Otherwise,
   * authentication has failed.
   */
  router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/api/facebook/login',
      // failureRedirect: '/api/facebook/failure',
      failureRedirect: '/newcart?toast=That didn\'t work :(&status=err',
      scope: ['email']
    })
  )

  /**
   * @api {get} /api/facebook/failure
   */
  router.get('/facebook/failure', (req, res) => function () {
    res.send('kip is sad because you did not trust kip with your email address.')
  })

  /**
   * @api {get} /api/facebook/login
   * @apiGroup Users
   * @apiDescription - logs the user in via the session, once they
   * have been authenticated by facebook
   */
  router.get('/facebook/login', (req, res) => co(function * () {
    var emails = _.get(req, 'user.emails')
    if (!emails) throw new Error('no email address associated with this user')
    var email = emails[0].value
    logging.info(email)
    // query for user id based on passport session info
    var user = yield db.UserAccounts.findOne({email_address: email})
    // add it to the UserSession
    var dbSession = yield db.Sessions.findOne({id: req.session.id})
    dbSession.user_account = user.id
    yield dbSession.save()
    req.UserSession = yield db.Sessions.findOne({id: req.session.id}).populate('user_account')
    // we're done; redirect to somewhere
    res.redirect('/newcart')
  }))

  /**
   * @api {get} /api/identify?email=:email&cart_id=:cart_id Identify
   * @apiGroup Users
   * @apiParam {string} email the user's email
   * @apiParam {string} cart_id the cart id
   */
  router.get('/identify', async (req, res) => {
    logging.info('identify', req.query)

    // Check the cart to see if there's already a leader
    var cart = await db.Carts.findOne({ id: req.query.cart_id }).populate('leader')

    // Find the user associated with this email, if any
    var email = decodeURIComponent(req.query.email.trim().toLowerCase())

    // check if the user is already identified as this email
    var currentUser = req.UserSession.user_account

    // If they are already logged in as this email, probably in a weird state to be re-identifying
    // idk maybe they have multiple tabs open or something, just roll with it
    if (currentUser && currentUser.email_address === email) {
      // make them the glorious cart leader if the cart is leaderless, otherwise a member
      if (!cart.leader) {
        cart.leader = currentUser.id
        await cart.save()
      } else if (!cart.members.includes(currentUser.id)) {
        cart.members.add(currentUser.id)
        await cart.save()
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
    var user = await db.UserAccounts.findOne({
      email_address: email
    })

    if (user) {
      logging.info('email already exists in db, need to send a verification link in an email')
      res.send({
        ok: false,
        newAccount: false,
        status: 'CHECK_EMAIL',
        message: 'Someone has already claimed that email. Please check your email and use the link we sent you to verify your identity.',
      });

      // generate magic link here
      var link = await db.AuthenticationLinks.create({
        user: user.id,
        cart: cart.id
      })

      link = await db.AuthenticationLinks.findOne({
        id: link.id
      }).populate('user').populate('cart')

      if (process.env.NODE_ENV !== 'production') {
        console.log('http://localhost:3000/auth/' + link.id)
      }

      var lostEmail = await db.Emails.create({
        recipients: email,
        subject: 'Log in to Kip',
        cart: cart.id
      })

      lostEmail.template('login_email', {
        link,
        username: user.name || email
      })

      await lostEmail.send()
      return
    }

    // No user was found with the email address, so this is a new user, party!
    logging.info('creating new user ' + email + ' 🎉')
    user = await db.UserAccounts.create({
      email_address: email,
      name: normalizeEmailToName(email)
    })

    // add them to the session
    req.UserSession.user_account = user.id
    await req.UserSession.save()

    // make them the glorious cart leader if the cart is leaderless, otherwise a member
    if (!cart.leader) {
      cart.leader = user.id
      await cart.save()

    } else if (!cart.members.includes(user.id)) {
      cart.members.add(user.id)
      await cart.save()

    }

    // Update cart name if not set
    if (!cart.name) {
      var date = new Date()
      if (cart.store_locale = 'US') var dateString = (date.getMonth() + 1) + '/' + date.getDate() + '/' + String(date.getFullYear()).slice(2)
      else var dateString = date.getDate() + '/' + (date.getMonth() + 1) + '/' + String(date.getFullYear()).slice(2)
      cart.name = dateString + ' Kip Cart'
      await cart.save()
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

    // Sending to leader
    var storeName = cart.store === 'ypo' ? 'YPO' : _.capitalize(cart.store);
    if (cart.leader == user.id) {
      var subject = `Your New ${storeName} Kip Cart`
      cart.leader = true
    }
    //Sending to member
    else {
      var subject = '[Kip] Welcome to ' + cart.name
    }

    //Send an email to the member with the cart link
    email = await db.Emails.create({
      recipients: user.email_address,
      subject: subject,
      cart: cart.id
    })

    // use the new_cart email template
    email.template('new_email', {
      cart: cart,
      username: user.name || email
    })

    // remember to actually send it
    await email.send();
  })


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
  router.get('/user', async (req, res) => {
    var user
    if (_.get(req, 'query.email')) {
      user = await db.UserAccounts.findOne({
        email_address: req.query.email.toLowerCase()
      }).populate('addresses');
    } else if (_.get(req, 'query.id')) {
      user = await db.UserAccounts.findOne({
        id: req.query.id
      }).populate('addresses');
    } else {
      throw new Error('Cannot find user');
    }
    res.send(user);
  })

  /**
   * @api {get} /api/logout Logout
   * @apiGroup Users
   * @apiDescription resets session coookie
   */
  router.get('/logout', (req, res) => {
    req.session.reset()
    res.redirect('/')
  })

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
  router.post('/user/:user_id', async (req, res) => {
    // check permissions
    var currentUser = req.UserSession.user_account
    if (!currentUser || currentUser.id !== req.params.user_id) {
      throw new Error('Unauthorized')
    }

    // Find the user in the database
    var user = await db.UserAccounts.findOne({ id: req.params.user_id }).populate('addresses')

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

    await user.save()

    res.send(user)
  })

  /**
   * @api {post} /api/user/:user_id/address Add Address
   * @apiDescription Creates a new address and associates it with a user
   * @apiGroup Users
   * @apiParam {string} :user_id id of the user to update
   * @apiParam {json} body the properties of the new address we're creating
   *
   * @apiParamExample Request
   * post /api/user/04b36891-f5ab-492b-859a-8ca3acbf856b {
   *   "full_name": 'Chris Barry',
   *   "line_1": '2222 Fredrick Douglass Blvd',
   *   "line_2": "Apt 2B",
   *   "city": "New York",
   *   "region": 'NY',
   *   "code": 94306,
   *   "country": 'USA',
   *   "user_account": user_id
   * }
   */
  router.post('/user/:user_id/address', async (req, res) => {
    // check permissions
    if (!_.get(req, 'UserSession.user_account.id')) {
      throw new Error('Unauthorized')
    }
    var currentUser = req.UserSession.user_account

    // Find the user in the database
    var user = await db.UserAccounts.findOne({ id: req.params.user_id })

    // hope nothing crazy is going on b/c like the user is obvs logged in but the account doesn't exist in the db?
    if (!user) {
      throw new Error('Could not find user ' + req.params.user_id)
    }

    // create a new address associated with this user
    var addr = await db.Addresses.create(req.body);
    addr.user_account = user.id;
    await addr.save();

    res.send(addr);
  })

 /**
   * @api {get} /api/user/address return a list of user addresses
   * @apiDescription Returns all of the addresses associated with a user
   * @apiGroup Users
   *
   * @apiParamExample Request
   * get /api/user/address
   *
   *  @apiSuccessExample Response
   * [{
   *   "full_name": 'Chris Barry',
   *   "line_1": '2222 Fredrick Douglass Blvd',
   *   "line_2": "Apt 2B",
   *   "city": "New York",
   *   "region": 'NY',
   *   "code": 94306,
   *   "country": 'USA',
   *   "user_account": user_id
   * }]
   */

  router.get('/user/address', async (req, res) => {
    var currentUser = req.UserSession.user_account

    // Find the user in the database
    var addr = await db.Addresses.find({ user_account: currentUser.id })

    // in case there isn't an address
    if (!addr) {
      res.send({});
    }

    return res.send(addr);
  })

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
   *  text: "can't add 36 oz beer bong to my cart. unacceptable." 😳
   * }
   */
  router.post('/feedback', async (req, res) => {
    var feedback = await db.Feedback.create({
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
    var feedbackEmail = await db.Emails.create({
      recipients: 'hello@kipthis.com',
      subject: '[Mint Feedback] New Feedback from Mint'
    })

    const data = _.merge(
      {},
      feedback,
      {
        user: _.get(req, 'UserSession.user_account')
      })
    await feedbackEmail.template('feedback', data)

    await feedbackEmail.send()
  })
}
