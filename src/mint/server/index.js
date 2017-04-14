// file: index.js
const fs = require('fs'),
  os = require('os'),
  express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  sessions = require('client-sessions'),
  path = require('path'),
  mintLogger = require('./mint_logging.js'),
  _ = require('lodash'),
  co = require('co'),
  webpackDevMiddleware = require("webpack-dev-middleware"),
  webpackHotMiddleware = require("webpack-hot-middleware"),
  webpack = require('webpack'),
  webpackConfig = require('../webpack.config.js');

// live reloading
if (!process.env.NO_LIVE_RELOAD) {
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, {
    hot: true,
    filename: '[name].js',
    publicPath: '/build/',
    stats: {
      colors: true
    },
    historyApiFallback: true
  }));

  app.use(webpackHotMiddleware(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000
  }));
}

// idk
var regularRoutes = require('./routes/regular.js');
var apiRoutes = require('./routes/api.js');

require('colors');
// require('../camel'); //uncomment to populate camel_items

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
  secret: 'H68ccVhbqS5VgdB47/PdtByL983ERorw' + os.hostname(), // `openssl rand -base64 24 `
  duration: 0 // never expire
}));

/**
 * Save user sessions to the database
 */
app.use((req, res, next) => co(function* () {
  // req.session will always exist, thanks to the above client-sessions middleware
  // Check to make sure we have stored this user's session in the database
  if (!req.session.id) {
    console.log('creating new sessionin the database')
    var session = yield db.Sessions.create({})
    req.session.id = session.id
  }

  req.UserSession = yield db.Sessions.findOne({ id: req.session.id })
    .populate('user_accounts')
    // console.log(req.UserSession)

  // Now that the id exists, save the tracking information, like IP, user-agent, etc
  // TODO week of March 12

  next();
}));

/**
 * Add in logging after sessions have been created
 */
if (process.env.NODE_ENV && process.env.NODE_ENV.includes('development')) {
  app.use(function (req, res, next) {
    var methods = { GET: 'get'.cyan, HEAD: 'head'.gray, POST: 'post'.green, DELETE: 'delete'.red }
    var str = ['>'.yellow, methods[req.method] || req.method, req.originalUrl].join(' ')
    console.log(str)

    next()
  })
} else {
  app.use(new mintLogger.NormalLogger())
}

// ROUTES
app.use('/', regularRoutes);
app.use('/api', apiRoutes);

/**
 *  Always return the main index.html, so react-router render the route in the client
 *  Basically, anything that's not an api gets handled by react-router
 *  we can pass arrays to react by embedding their strings in javascript
 *  we could handle session data through fetching data with react
 */
app.get('*', (req, res) =>
  // Get the user_accont info, if exists (might not if they are clicking a shared link)
  // Get the cart info, if doesn't exist res.render('pages/404'), views/pages/404.ejs static page, a nice 404 with a Start Shopping link to create a new cart.
  res.render('pages/cart')
);

// Log errors to the database in production
if (process.env.NODE_ENV === 'production') {
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening at http://127.0.0.1:${PORT}`);
});

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
