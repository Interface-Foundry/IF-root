// file: index.js
const fs = require('fs'),
  os = require('os'),
  express = require('express'),
  compress = require('compression'),
  app = express(),
  bodyParser = require('body-parser'),
  sessions = require('client-sessions'),
  path = require('path'),
  locale = require('locale'),
  mintLogger = require('./mint_logging.js'),
  _ = require('lodash'),
  co = require('co'),
  auth = require('basic-auth');
  passport = require('passport')

// start any jobs
if (process.env.NODE_ENV !== 'production') var dailyDealsJob = require('./deals/send-daily-deals-job')
if (process.env.NODE_ENV !== 'production') var reengagementEmailsJob = require('./send-reengagement-emails-job')
if (process.env.NODE_ENV !== 'production') var invoiceReminderEmailJob = require('./invoice-reminder-email-job')

// for testing
if (typeof module.parent !== 'undefined') {
  process.env.BUILD_MODE === 'prebuilt';
}

// live reloading
if (process.env.BUILD_MODE !== 'prebuilt' && typeof describe === 'undefined') {
  const webpackConfig = require('../webpack.dev.config.js');
  const compiler = require('webpack')(webpackConfig);
  app.use(require('webpack-dev-middleware')(compiler, {
    hot: true,
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true,
    },
    historyApiFallback: true
  }));
  app.use(require('webpack-hot-middleware')(compiler, {
    reload: true,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000
  }));
} else {
  app.get('/__webpack_hmr', (req, res) => res.status(200).end())
}

require('colors');

/**
 * Models loaded from the waterline ORM
 */
var db;
const dbReady = require('../db');
dbReady.then((models) => { db = models; })
  .catch(e => console.error(e));

/**
 * BORING STUFF (TODO move this to a file name boilerplate.js)
 */
if (process.env.BASIC_AUTH_PASSWORD) {
  app.use((req, res, next) => {
    const user = auth(req)
    if (!user || user.pass !== process.env.BASIC_AUTH_PASSWORD) {
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="example"')
      return res.end('Access denied')
    }
    next()
  })
}
app.enable('trust proxy'); // req.ip gets set from x-forwarded-for headers
app.use(compress());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
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
  secret: 'H68ccVhbqS5VgdB47/PdtByL983ERorw' + process.env.NODE_ENV, // `openssl rand -base64 24 `
  duration: 10 * 365 * 24 * 60 * 60 * 1000 // expire in 10 years
}));

/**
 * Save user sessions to the database
 */
app.use((req, res, next) => co(function* () {
  // req.session will always exist, thanks to the above client-sessions middleware
  // Check to make sure we have stored this user's session in the database
  if (!req.session.id) {
    var session = yield db.Sessions.create({})
    req.session.id = session.id
    req.UserSession = session
  } else {
    req.UserSession = yield db.Sessions.findOne({ id: req.session.id })
      .populate('user_account')
  }

  if (!req.UserSession) {
    logging.info('session not in the database; creating a new session')
    yield db.Sessions.create({ id: req.session.id })
    req.UserSession = yield db.Sessions.findOne({ id: req.session.id })
      .populate('user_account')
  }

  next();
}));

/**
 * Add in logging after sessions have been created
 */
if (process.env.LOGGING_MODE === 'database') {
  app.use(new mintLogger.NormalLogger())
} else {
  app.use(function (req, res, next) {
    var methods = { GET: 'get'.cyan, HEAD: 'head'.gray, POST: 'post'.green, DELETE: 'delete'.red }
    var str = ['>'.yellow, methods[req.method] || req.method, req.originalUrl].join(' ')
    console.log(str)

    next()
  })
}

/**
 * Initialize passport.js
 */
app.use(passport.initialize())
app.use(passport.session())

/**
 * locale middleware
 */
app.use(locale())

//
// Back end routes
//
app.use('/prototype', require('./routes/global-direct-prototype.js'));
app.use('/', require('./routes/regular.js'));
app.use('/api', require('./routes/api.js'));
app.use('/sendgrid', require('./routes/incoming-mail.js'));
app.use('/sg', require('./sendgrid-webhook.js'));

//
// Front end routes
//

/**
 *  Always return the main index.html, so react-router render the route in the client
 *  Basically, anything that's not an api gets handled by react-router
 *  we can pass arrays to react by embedding their strings in javascript
 *  we could handle session data through fetching data with react
 */
const default_cart = {
  name: 'Kip Cart',
  description: 'Shared Kip Cart',
  thumbnail_url: '/favicon/social_image_main.png'
}
app.get('/cart/:cart_id*', (req, res) => co(function* () {
  // for rendering meta tags, if anyone has a better way, let me know!
  var cart = yield db.Carts.findOne({ id: req.params.cart_id })
  cart = Object.assign({}, default_cart, cart)
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.render('pages/cart', { cart, url })
}))
app.get('/m/:route*', (req, res) => {
  // allow modal routes
  const cart = Object.assign({}, default_cart, { name: 'Shop on Kip', description: _.capitalize(req.params.route) })
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.render('pages/cart', { cart, url })
});
app.get('/newcart', (req, res) => {
  const cart = Object.assign({}, default_cart, { name: 'Create a New Cart', description: 'Create your own cart on Kip!' })
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.render('pages/cart', { cart, url }) // render cart selection screen on server
});
app.get('/404', (req, res) => {
  const cart = Object.assign({}, default_cart, { name: 'Oops!', description: 'Why are you sharing our 404 page?' })
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.render('pages/cart', { cart, url })
});
app.get('/legal', (_, res) => {
  res.render('pages/index');
});
app.get('/blog', (_, res) => {
  res.render('pages/index');
});
app.get('/howitworks', (_, res) => {
  res.render('pages/index');
});
app.get('/compare', (_, res) => {
  res.render('pages/index');
});
app.get('/about', (_, res) => {
  res.render('pages/index');
});
app.get('/s/*', (_, res) => {
  res.render('pages/index');
});

// Log errors to the database in production
if (process.env.LOGGING_MODE === 'database') {
  app.use(new mintLogger.ErrorLogger());
}

// Show an error page for non-json request, and the error for json requests
app.use(function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  if (req.headers.accept === 'application/json') {
    printNiceError(err)
    res.status(500)

    if (process.env.NODE_ENV !== 'production') {
      var body = ''
      if (err.message) body += err.message
      if (err.stack) {
        var lines = err.stack.split('\n')
        var i = 0
        var line
        while (!line && i < lines.length) {
          if (lines[i].includes('src/mint/')) {
            line = ` (${lines[i].replace(/.*src\/mint/, 'mint').trim()})`
          }
          i++
        }

        if (line) body += line
      }
      res.send(body)
    } else {
      res.send('Internal Server Error - email hello@kipthis.com if you would like to help :)')
    }
  } else {
    // TODO render nice error pages res.render('error', err)
    next(err)
  }
})

if (process.env.LETSENCRYPT_DOMAIN) {
  require('letsencrypt-express').create({
    server: 'production',
    email: 'peter@interfacefoundry.com',
    agreeTos: true,
    approveDomains: [ process.env.LETSENCRYPT_DOMAIN ],
    app: app
  }).listen(80, 443);
} else {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`App listening at http://127.0.0.1:${PORT}`);
  });
}

function printNiceError(err) {
  if (!err) {
    return console.log('No error :P')
  }

  /** Nicely print waterline errors */
  if (err.failedTransactions) {
    err.failedTransactions.map(e => {
      console.log('error:', e.type, e.collection, e.values)
      if (_.get(e, 'err.originalError.message')) {
        console.log(e.err.originalError.message)
      } else {
        console.log(e.err)
      }
    })
  }

  /** help the user know where to look */
  if (err.stack) {
    console.log(err.stack)
  } else {
    console.log(err)
  }
}

/**
 * To scrape or not to scrape, that is the question 💀
 */
if (process.env.SCRAPE_DEALS) {
  require('./deals')
}

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Promise Rejection');
  printNiceError(err)
});
