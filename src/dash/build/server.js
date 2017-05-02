require("source-map-support").install();
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/assets/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  var _stringify = __webpack_require__(1);
  
  var _stringify2 = _interopRequireDefault(_stringify);
  
  var _regenerator = __webpack_require__(2);
  
  var _regenerator2 = _interopRequireDefault(_regenerator);
  
  var _toConsumableArray2 = __webpack_require__(3);
  
  var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);
  
  var _set = __webpack_require__(4);
  
  var _set2 = _interopRequireDefault(_set);
  
  var _asyncToGenerator2 = __webpack_require__(5);
  
  var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);
  
  __webpack_require__(6);
  
  var _path = __webpack_require__(7);
  
  var _path2 = _interopRequireDefault(_path);
  
  var _express = __webpack_require__(8);
  
  var _express2 = _interopRequireDefault(_express);
  
  var _cookieParser = __webpack_require__(9);
  
  var _cookieParser2 = _interopRequireDefault(_cookieParser);
  
  var _csvparse = __webpack_require__(10);
  
  var _csvparse2 = _interopRequireDefault(_csvparse);
  
  var _bodyParser = __webpack_require__(12);
  
  var _bodyParser2 = _interopRequireDefault(_bodyParser);
  
  var _expressJwt = __webpack_require__(13);
  
  var _expressJwt2 = _interopRequireDefault(_expressJwt);
  
  var _expressGraphql = __webpack_require__(14);
  
  var _expressGraphql2 = _interopRequireDefault(_expressGraphql);
  
  var _graphqlTools = __webpack_require__(15);
  
  var _jsonwebtoken = __webpack_require__(16);
  
  var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _server = __webpack_require__(18);
  
  var _server2 = _interopRequireDefault(_server);
  
  var _universalRouter = __webpack_require__(19);
  
  var _universalRouter2 = _interopRequireDefault(_universalRouter);
  
  var _prettyError = __webpack_require__(20);
  
  var _prettyError2 = _interopRequireDefault(_prettyError);
  
  var _Html = __webpack_require__(21);
  
  var _Html2 = _interopRequireDefault(_Html);
  
  var _graffiti = __webpack_require__(23);
  
  var _graffiti2 = _interopRequireDefault(_graffiti);
  
  var _graffitiMongoose = __webpack_require__(24);
  
  var _database = __webpack_require__(25);
  
  var _ErrorPage = __webpack_require__(35);
  
  var _ErrorPage2 = __webpack_require__(37);
  
  var _ErrorPage3 = _interopRequireDefault(_ErrorPage2);
  
  var _schema = __webpack_require__(44);
  
  var _schema2 = _interopRequireDefault(_schema);
  
  var _resolvers = __webpack_require__(45);
  
  var _routes = __webpack_require__(52);
  
  var _routes2 = _interopRequireDefault(_routes);
  
  var _assets = __webpack_require__(124);
  
  var _assets2 = _interopRequireDefault(_assets);
  
  var _config = __webpack_require__(22);
  
  var _multer = __webpack_require__(125);
  
  var _multer2 = _interopRequireDefault(_multer);
  
  var _graphqlServerExpress = __webpack_require__(126);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var sendgridRouter = __webpack_require__(128); // eslint-disable-line import/no-unresolved
  /**
   * @file - Setting up the server file to perform various actions upon receiving certain requests
   */
  
  var storage = _multer2.default.diskStorage({
    destination: function destination(req, file, cb) {
      cb(null, './client/csvfiles');
    },
    filename: function filename(req, file, cb) {
      cb(null, file.originalname);
    }
  });
  var upload = (0, _multer2.default)({ storage: storage });
  var app = (0, _express2.default)();
  
  //
  // Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
  // user agent is not known.
  // -----------------------------------------------------------------------------
  global.navigator = global.navigator || {};
  global.navigator.userAgent = global.navigator.userAgent || 'all';
  
  // db stuff
  (0, _database.connect)().catch(function (err) {
    return console.error(err.stack);
  }).then(function () {
    app.listen(_config.port, function () {
      console.log('The server is running at http://localhost:' + _config.port + '/');
    });
  });
  
  //
  // Register Node.js middleware
  // -----------------------------------------------------------------------------
  app.use(_express2.default.static(_path2.default.join(__dirname, 'public')));
  app.use((0, _cookieParser2.default)());
  app.use(_bodyParser2.default.urlencoded({ extended: true }));
  app.use(_bodyParser2.default.json());
  
  //
  // Sendgrid webhook
  // -----------------------------------------------------------------------------
  app.use('/sg', sendgridRouter);
  
  //
  // Authentication
  // -----------------------------------------------------------------------------
  app.use((0, _expressJwt2.default)({
    secret: _config.auth.jwt.secret,
    credentialsRequired: false,
    getToken: function getToken(req) {
      return req.cookies.id_token;
    }
  }));
  
  /**
   * graphql endpoint
   * @type
   */
  app.use('/graphql', (0, _graphqlServerExpress.graphqlExpress)({
    schema: _schema2.default,
    context: {
      loaders: (0, _resolvers.GetLoaders)()
    }
  }));
  
  /**
   * graphql interactive gui
   * @type {String}
   */
  app.use('/graphiql', (0, _graphqlServerExpress.graphiqlExpress)({
    endpointURL: '/graphql',
    // prepopulate graphql with this
    query: '{deliveries{_id, active}}'
  }));
  
  // Register server-side rendering middleware
  // -----------------------------------------------------------------------------
  app.get('*', function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res, next) {
      var css, statusCode, data, html;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              css = new _set2.default();
              statusCode = 200;
              data = { title: '', description: '', style: '', script: _assets2.default.main.js, children: '' };
              _context.next = 6;
              return _universalRouter2.default.resolve(_routes2.default, {
                path: req.path,
                query: req.query,
                context: {
                  insertCss: function insertCss() {
                    for (var _len = arguments.length, styles = Array(_len), _key = 0; _key < _len; _key++) {
                      styles[_key] = arguments[_key];
                    }
  
                    styles.forEach(function (style) {
                      return css.add(style._getCss());
                    }); // eslint-disable-line no-underscore-dangle, max-len
                  },
                  setTitle: function setTitle(value) {
                    return data.title = value;
                  },
                  setMeta: function setMeta(key, value) {
                    return data[key] = value;
                  }
                },
                render: function render(component) {
                  var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;
  
                  // console.log('inside render of UniversalRouter', component);
                  css = new _set2.default();
                  statusCode = status;
                  data.children = _server2.default.renderToString(component);
                  data.style = [].concat((0, _toConsumableArray3.default)(css)).join('');
                  return true;
                }
              });
  
            case 6:
  
              // console.log('outside render func of UniversalRouter with statusCode', statusCode);
              html = _server2.default.renderToStaticMarkup(_react2.default.createElement(_Html2.default, data));
  
  
              res.status(statusCode);
              res.send('<!doctype html>' + html);
              _context.next = 14;
              break;
  
            case 11:
              _context.prev = 11;
              _context.t0 = _context['catch'](0);
  
              // console.log('some error occured', err);
              next(_context.t0);
  
            case 14:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined, [[0, 11]]);
    }));
  
    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }());
  
  //
  // Getting the file from the dropzone, parsing its contents
  //
  app.post('/upload', upload.single('csv_file'), function (req, res, next) {
  
    var csvData = (0, _csvparse2.default)(req.file.path);
  
    var chunks = [];
    csvData.on("data", function (chunk) {
      chunks.push(chunk);
    });
    csvData.on("end", function () {
      res.end((0, _stringify2.default)(chunks));
    });
  });
  
  app.get('/health', function (req, res) {
    res.sendStatus(200);
  });
  
  //
  // Error handling
  // -----------------------------------------------------------------------------
  var pe = new _prettyError2.default();
  pe.skipNodeFiles();
  pe.skipPackage('express');
  
  app.use(function (err, req, res, next) {
    // eslint-disable-line no-unused-vars
    console.log(pe.render(err)); // eslint-disable-line no-console
    var statusCode = err.status || 500;
    var html = _server2.default.renderToStaticMarkup(_react2.default.createElement(
      _Html2.default,
      {
        title: 'Internal Server Error',
        description: err.message,
        style: _ErrorPage3.default._getCss() // eslint-disable-line no-underscore-dangle
      },
      _server2.default.renderToString(_react2.default.createElement(_ErrorPage.ErrorPageWithoutStyle, { error: err }))
    ));
    res.status(statusCode);
    res.send('<!doctype html>' + html);
  });

/***/ }),
/* 1 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/core-js/json/stringify");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/regenerator");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/helpers/toConsumableArray");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/core-js/set");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/helpers/asyncToGenerator");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

  module.exports = require("babel-polyfill");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

  module.exports = require("path");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

  module.exports = require("express");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

  module.exports = require("cookie-parser");

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

  "use strict";
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var csv = __webpack_require__(11);
  
  function csvparse(file) {
    var csvData = csv.fromPath(file, { headers: true, strictColumnHandling: true }).on("error", function (data) {
      return 'Error parsing csv';
    }).on("data", function (data) {
      console.log(data);
    }).on("end", function () {
      console.log("done");
    });
    return csvData;
  }
  exports.default = csvparse;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

  module.exports = require("fast-csv");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

  module.exports = require("body-parser");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

  module.exports = require("express-jwt");

/***/ }),
/* 14 */
/***/ (function(module, exports) {

  module.exports = require("express-graphql");

/***/ }),
/* 15 */
/***/ (function(module, exports) {

  module.exports = require("graphql-tools");

/***/ }),
/* 16 */
/***/ (function(module, exports) {

  module.exports = require("jsonwebtoken");

/***/ }),
/* 17 */
/***/ (function(module, exports) {

  module.exports = require("react");

/***/ }),
/* 18 */
/***/ (function(module, exports) {

  module.exports = require("react-dom/server");

/***/ }),
/* 19 */
/***/ (function(module, exports) {

  module.exports = require("universal-router");

/***/ }),
/* 20 */
/***/ (function(module, exports) {

  module.exports = require("pretty-error");

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _config = __webpack_require__(22);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function Html(_ref) {
    var title = _ref.title,
        description = _ref.description,
        style = _ref.style,
        script = _ref.script,
        children = _ref.children;
  
    return _react2.default.createElement(
      'html',
      { className: 'no-js', lang: 'en' },
      _react2.default.createElement(
        'head',
        null,
        _react2.default.createElement('meta', { charSet: 'utf-8' }),
        _react2.default.createElement('meta', { httpEquiv: 'x-ua-compatible', content: 'ie=edge' }),
        _react2.default.createElement(
          'title',
          null,
          title
        ),
        _react2.default.createElement('meta', { name: 'description', content: description }),
        _react2.default.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
        _react2.default.createElement('link', { rel: 'stylesheet', href: '/css/bootstrap.min.css' }),
        _react2.default.createElement('link', { rel: 'apple-touch-icon', href: 'apple-touch-icon.png' }),
        _react2.default.createElement('link', { rel: 'stylesheet', href: '/css/bootstrap-social.css' }),
        _react2.default.createElement('link', { rel: 'stylesheet', href: '/css/font-awesome.min.css' }),
        _react2.default.createElement('link', { rel: 'stylesheet', href: '/css/sb-admin.css' }),
        _react2.default.createElement('link', { rel: 'stylesheet', href: '/css/react-bootstrap-table-all.min.css' }),
        _react2.default.createElement('link', { rel: 'stylesheet', href: '/css/custom.css' }),
        _react2.default.createElement('link', { rel: 'stylesheet', href: '/css/react-datepicker.css' }),
        _react2.default.createElement('style', { id: 'css', dangerouslySetInnerHTML: { __html: style } })
      ),
      _react2.default.createElement(
        'body',
        null,
        _react2.default.createElement('div', { id: 'app', dangerouslySetInnerHTML: { __html: children } }),
        script && _react2.default.createElement('script', { src: script }),
        _config.analytics.google.trackingId && _react2.default.createElement('script', {
          dangerouslySetInnerHTML: { __html: 'window.ga=function(){ga.q.push(arguments)};ga.q=[];ga.l=+new Date;' + ('ga(\'create\',\'' + _config.analytics.google.trackingId + '\',\'auto\');ga(\'send\',\'pageview\')') }
        }),
        _config.analytics.google.trackingId && _react2.default.createElement('script', { src: 'https://www.google-analytics.com/analytics.js', async: true, defer: true })
      )
    );
  }
  
  Html.propTypes = {
    title: _react.PropTypes.string.isRequired,
    description: _react.PropTypes.string.isRequired,
    style: _react.PropTypes.string.isRequired,
    script: _react.PropTypes.string,
    children: _react.PropTypes.string
  };
  
  exports.default = Html;

/***/ }),
/* 22 */
/***/ (function(module, exports) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  /**
   * React Starter Kit (https://www.reactstarterkit.com/)
   *
   * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */
  
  /* eslint-disable max-len */
  
  var port = exports.port = process.env.PORT || 3000;
  var host = exports.host = process.env.WEBSITE_HOSTNAME || 'localhost:' + port;
  
  var databaseUrl = exports.databaseUrl = process.env.DATABASE_URL || 'sqlite:database.sqlite';
  
  var analytics = exports.analytics = {
  
    // https://analytics.google.com/
    google: {
      trackingId: process.env.GOOGLE_TRACKING_ID }
  
  };
  
  var auth = exports.auth = {
  
    jwt: { secret: process.env.JWT_SECRET || 'React Starter Kit' },
  
    // https://developers.facebook.com/
    facebook: {
      id: process.env.FACEBOOK_APP_ID || '186244551745631',
      secret: process.env.FACEBOOK_APP_SECRET || 'a970ae3240ab4b9b8aae0f9f0661c6fc'
    },
  
    // https://cloud.google.com/console/project
    google: {
      id: process.env.GOOGLE_CLIENT_ID || '251410730550-ahcg0ou5mgfhl8hlui1urru7jn5s12km.apps.googleusercontent.com',
      secret: process.env.GOOGLE_CLIENT_SECRET || 'Y8yR9yZAhm9jQ8FKAL8QIEcd'
    },
  
    // https://apps.twitter.com/
    twitter: {
      key: process.env.TWITTER_CONSUMER_KEY || 'Ie20AZvLJI2lQD5Dsgxgjauns',
      secret: process.env.TWITTER_CONSUMER_SECRET || 'KTZ6cxoKnEakQCeSpZlaUCJWGAlTEBJj0y2EMkUBujA7zWSvaQ'
    }
  
  };

/***/ }),
/* 23 */
/***/ (function(module, exports) {

  module.exports = require("@risingstack/graffiti");

/***/ }),
/* 24 */
/***/ (function(module, exports) {

  module.exports = require("@risingstack/graffiti-mongoose");

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Waypoints = exports.Chatusers = exports.Slackbots = exports.Metrics = exports.Messages = exports.Items = exports.Deliveries = exports.Carts = exports.connect = undefined;
  
  var _promise = __webpack_require__(26);
  
  var _promise2 = _interopRequireDefault(_promise);
  
  var _mongodb = __webpack_require__(27);
  
  var _index = __webpack_require__(28);
  
  var _index2 = _interopRequireDefault(_index);
  
  var _logging = __webpack_require__(32);
  
  var _logging2 = _interopRequireDefault(_logging);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var Carts, Deliveries, Items, Messages, Metrics, Slackbots, Chatusers, Waypoints; /**
                                                                                     * @file - connecting to mongo and gathering the database collections into variables to be exported
                                                                                     */
  
  function connect() {
    return new _promise2.default(function (resolve, reject) {
      _logging2.default.debug('connecting to mongo at %s', _index2.default.mongodb.url);
      _mongodb.MongoClient.connect(_index2.default.mongodb.url, function (err, db) {
        if (db == null || err != null) {
          reject(err);
        }
  
        _logging2.default.debug('connected to mongo');
        exports.Carts = Carts = db.collection('carts');
        exports.Deliveries = Deliveries = db.collection('delivery');
        exports.Items = Items = db.collection('items');
        exports.Messages = Messages = db.collection('messages');
        exports.Metrics = Metrics = db.collection('metrics');
        exports.Slackbots = Slackbots = db.collection('slackbots');
        exports.Chatusers = Chatusers = db.collection('chatusers');
        exports.Waypoints = Waypoints = db.collection('waypoints');
        resolve();
      });
    });
  }
  
  exports.connect = connect;
  exports.Carts = Carts;
  exports.Deliveries = Deliveries;
  exports.Items = Items;
  exports.Messages = Messages;
  exports.Metrics = Metrics;
  exports.Slackbots = Slackbots;
  exports.Chatusers = Chatusers;
  exports.Waypoints = Waypoints;

/***/ }),
/* 26 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/core-js/promise");

/***/ }),
/* 27 */
/***/ (function(module, exports) {

  module.exports = require("mongodb");

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

  var os = __webpack_require__(29)
  var path = __webpack_require__(7)
  
  /**
   * everyconfig reads the yaml files for the right environment. if CONFIG_DIR is
   * set, the value is assumed to be either a path relative to the location of
   * the current module, or an absolute path.
   */
  
  
  if ((process.env['CONFIG_DIR'] === undefined ) && (path.basename(process.cwd()) === 'dash')) {
      var fs = __webpack_require__(30)
      var configDirEnv = path.resolve(process.cwd(), '..', 'config')
  }
  
  var config = __webpack_require__(31)(configDirEnv || '.')
  config.host = os.hostname()
  
  /**
   * override hardcoded config values with environment vars for certain keys.
   */
  
  overrideIf('LOGGING_CONSOLE_COLORIZE', function (val) {
    config.logging.console.colorize = asBool(val)
  })
  
  overrideIf('LOGGING_CONSOLE_JSON', function (val) {
    config.logging.console.json = asBool(val)
  })
  
  overrideIf('LOGGING_CONSOLE_PRETTYPRINT', function (val) {
    config.logging.console.prettyPrint = asBool(val)
  })
  
  overrideIf('LOGGING_CONSOLE_STRINGIFY', function (val) {
    config.logging.console.stringify = asBool(val)
  })
  
  overrideIf('PROXY_LUMINATI_ADDR', function (val) {
    config.proxy.luminati.addr = val
  })
  
  function overrideIf (envKey, callback) {
    var stringVal = process.env[envKey]
    if (stringVal !== undefined) {
      callback(stringVal)
    }
  }
  
  function asBool (strVal) { return strVal === 'true' || strVal === 'TRUE' || strVal === '1' }
  function asInt (strVal) { return parseInt(strVal) }
  
  if (false) process.env.NODE_ENV = 'production'
  
  module.exports = config


/***/ }),
/* 29 */
/***/ (function(module, exports) {

  module.exports = require("os");

/***/ }),
/* 30 */
/***/ (function(module, exports) {

  module.exports = require("fs");

/***/ }),
/* 31 */
/***/ (function(module, exports) {

  module.exports = require("everyconfig");

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

  var winston = __webpack_require__(33);
  var MongoDB = __webpack_require__(34).MongoDB;
  var path = __webpack_require__(7)
  
  var userConfigFile = __webpack_require__(28);
  
  var logging;
  
  // slight fix for mongodb stuff to work with config files
  if (userConfigFile.mongodb.url.indexOf('mongodb://') < 0) {
    userConfigFile.mongodb.url = 'mongodb://' + userConfigFile.mongodb.url;
  }
  
  var levelConfig = {
    levels: {
      error: 0,
      warn: 1,
      data: 3,
      info: 4,
      verbose: 5,
      debug: 6,
      silly: 7
    },
    colors: {
      error: 'red',
      warn: 'yellow',
      data: 'grey',
      verbose: 'cyan',
      info: 'green',
      debug: 'blue',
      silly: 'magenta'
    }
  };
  
  var level_message = "You're logging at level " + userConfigFile.logging.console.level
  level_message += "\nerror < warn < data < info < verbose < debug < silly"
  level_message = level_message.replace(new RegExp(userConfigFile.logging.console.level, 'g'), userConfigFile.logging.console.level.rainbow)
  console.log(level_message);
  
  var transports = [
    new (winston.transports.Console)({
      level: userConfigFile.logging.console.level,
      json: userConfigFile.logging.console.json,
      stringify: userConfigFile.logging.console.stringify,
      colorize: userConfigFile.logging.console.colorize,
      prettyPrint: userConfigFile.logging.console.prettyPrint,
    })
  ]
  
  
  if (userConfigFile.logging.mongo.enabled) {
    transports.push(new MongoDB({
      level: 'error',
      db: userConfigFile.mongodb.url,
      options: userConfigFile.mongodb.options,
      collection: 'errors',
      label: 'winston',
      decolorize: true,
    }));
  }
  
  
  logging = new(winston.Logger)({
      transports: transports,
      colors: levelConfig.colors,
      levels: levelConfig.levels,
  })
  
  // show file:line on debug
  if (userConfigFile.logging.debugFileLine.enabled === true) {
    logging.filters.push(function(level, msg, meta) {
      if (level === 'debug') {
        var e = new Error()
        var stack = e.stack.split('\n')[6]
        try {
          var filename = stack.split(':')[0].split(/[\( ]+/).pop()
          var line = stack.split(':')[1]
        } catch (err) {
          console.log('error displaying stack in debugFileLine: ', e.stack)
          filename = '?'
          line = '?'
        }
        if (__webpack_require__.c[0].filename && filename !== '?') {
          var loc = path.relative(path.resolve(__webpack_require__.c[0].filename, '..'), filename) + ':' + line
          return loc.gray + ' ' + msg
        }
      }
      return msg
    });
  }
  
  
  
  
  
  module.exports = global.logging = logging;


/***/ }),
/* 33 */
/***/ (function(module, exports) {

  module.exports = require("winston");

/***/ }),
/* 34 */
/***/ (function(module, exports) {

  module.exports = require("winston-mongodb");

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ErrorPageWithoutStyle = undefined;
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _withStyles = __webpack_require__(36);
  
  var _withStyles2 = _interopRequireDefault(_withStyles);
  
  var _ErrorPage = __webpack_require__(37);
  
  var _ErrorPage2 = _interopRequireDefault(_ErrorPage);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function ErrorPage(_ref, context) {
    var error = _ref.error;
  
    var title = 'Error';
    var content = 'Sorry, a critical error occurred on this page.';
    var errorMessage = null;
  
    if (error.status === 404) {
      title = 'Page Not Found';
      content = 'Sorry, the page you were trying to view does not exist.';
    } else if (true) {
      errorMessage = _react2.default.createElement(
        'pre',
        null,
        error.stack
      );
    }
  
    if (context.setTitle) {
      context.setTitle(title);
    }
  
    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'h1',
        null,
        title
      ),
      _react2.default.createElement(
        'p',
        null,
        content
      ),
      errorMessage
    );
  } /**
     * React Starter Kit (https://www.reactstarterkit.com/)
     *
     * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE.txt file in the root directory of this source tree.
     */
  
  ErrorPage.propTypes = { error: _react.PropTypes.object.isRequired };
  ErrorPage.contextTypes = { setTitle: _react.PropTypes.func.isRequired };
  
  exports.ErrorPageWithoutStyle = ErrorPage;
  exports.default = (0, _withStyles2.default)(_ErrorPage2.default)(ErrorPage);

/***/ }),
/* 36 */
/***/ (function(module, exports) {

  module.exports = require("isomorphic-style-loader/lib/withStyles");

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

  
      var content = __webpack_require__(38);
      var insertCss = __webpack_require__(40);
  
      if (typeof content === 'string') {
        content = [[module.id, content, '']];
      }
  
      module.exports = content.locals || {};
      module.exports._getCss = function() { return content.toString(); };
      module.exports._insertCss = function(options) { return insertCss(content, options) };
    
      // Hot Module Replacement
      // https://webpack.github.io/docs/hot-module-replacement
      // Only activated in browser context
      if (false) {
        var removeCss = function() {};
        module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true,\"modules\":true,\"localIdentName\":\"[name]_[local]_[hash:base64:3]\",\"minimize\":false}!../../../node_modules/postcss-loader/index.js?pack=default!./ErrorPage.css", function() {
          content = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true,\"modules\":true,\"localIdentName\":\"[name]_[local]_[hash:base64:3]\",\"minimize\":false}!../../../node_modules/postcss-loader/index.js?pack=default!./ErrorPage.css");
  
          if (typeof content === 'string') {
            content = [[module.id, content, '']];
          }
  
          removeCss = insertCss(content, { replace: true });
        });
        module.hot.dispose(function() { removeCss(); });
      }
    

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

  exports = module.exports = __webpack_require__(39)();
  // imports
  
  
  // module
  exports.push([module.id, "/**\n * React Starter Kit (https://www.reactstarterkit.com/)\n *\n * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE.txt file in the root directory of this source tree.\n */\n\n* {\n  line-height: 1.2;\n  margin: 0;\n}\n\nhtml {\n  color: #888;\n  display: table;\n  font-family: sans-serif;\n  height: 100%;\n  text-align: center;\n  width: 100%;\n}\n\nbody {\n  display: table-cell;\n  vertical-align: middle;\n  /* stylelint-disable */\n  margin: 2em auto;\n  /* stylelint-enable */\n}\n\nh1 {\n  color: #555;\n  font-size: 2em;\n  font-weight: 400;\n}\n\np {\n  margin: 0 auto;\n  width: 280px;\n}\n\npre {\n  text-align: left;\n  margin-top: 32px;\n  margin-top: 2rem;\n}\n\n@media only screen and (max-width: 280px) {\n  body,\n  p {\n    width: 95%;\n  }\n\n  h1 {\n    font-size: 1.5em;\n    margin: 0 0 0.3em;\n  }\n}\n", "", {"version":3,"sources":["/./routes/error/ErrorPage.css"],"names":[],"mappings":"AAAA;;;;;;;GAOG;;AAEH;EACE,iBAAiB;EACjB,UAAU;CACX;;AAED;EACE,YAAY;EACZ,eAAe;EACf,wBAAwB;EACxB,aAAa;EACb,mBAAmB;EACnB,YAAY;CACb;;AAED;EACE,oBAAoB;EACpB,uBAAuB;EACvB,uBAAuB;EACvB,iBAAiB;EACjB,sBAAsB;CACvB;;AAED;EACE,YAAY;EACZ,eAAe;EACf,iBAAiB;CAClB;;AAED;EACE,eAAe;EACf,aAAa;CACd;;AAED;EACE,iBAAiB;EACjB,iBAAiB;EAAjB,iBAAiB;CAClB;;AAED;EACE;;IAEE,WAAW;GACZ;;EAED;IACE,iBAAiB;IACjB,kBAAkB;GACnB;CACF","file":"ErrorPage.css","sourcesContent":["/**\n * React Starter Kit (https://www.reactstarterkit.com/)\n *\n * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE.txt file in the root directory of this source tree.\n */\n\n* {\n  line-height: 1.2;\n  margin: 0;\n}\n\nhtml {\n  color: #888;\n  display: table;\n  font-family: sans-serif;\n  height: 100%;\n  text-align: center;\n  width: 100%;\n}\n\nbody {\n  display: table-cell;\n  vertical-align: middle;\n  /* stylelint-disable */\n  margin: 2em auto;\n  /* stylelint-enable */\n}\n\nh1 {\n  color: #555;\n  font-size: 2em;\n  font-weight: 400;\n}\n\np {\n  margin: 0 auto;\n  width: 280px;\n}\n\npre {\n  text-align: left;\n  margin-top: 2rem;\n}\n\n@media only screen and (max-width: 280px) {\n  body,\n  p {\n    width: 95%;\n  }\n\n  h1 {\n    font-size: 1.5em;\n    margin: 0 0 0.3em;\n  }\n}\n"],"sourceRoot":"webpack://"}]);
  
  // exports


/***/ }),
/* 39 */
/***/ (function(module, exports) {

  /*
  	MIT License http://www.opensource.org/licenses/mit-license.php
  	Author Tobias Koppers @sokra
  */
  // css base code, injected by the css-loader
  module.exports = function() {
  	var list = [];
  
  	// return the list of modules as css string
  	list.toString = function toString() {
  		var result = [];
  		for(var i = 0; i < this.length; i++) {
  			var item = this[i];
  			if(item[2]) {
  				result.push("@media " + item[2] + "{" + item[1] + "}");
  			} else {
  				result.push(item[1]);
  			}
  		}
  		return result.join("");
  	};
  
  	// import a list of modules into the list
  	list.i = function(modules, mediaQuery) {
  		if(typeof modules === "string")
  			modules = [[null, modules, ""]];
  		var alreadyImportedModules = {};
  		for(var i = 0; i < this.length; i++) {
  			var id = this[i][0];
  			if(typeof id === "number")
  				alreadyImportedModules[id] = true;
  		}
  		for(i = 0; i < modules.length; i++) {
  			var item = modules[i];
  			// skip already imported module
  			// this implementation is not 100% perfect for weird media query combinations
  			//  when a module is imported multiple times with different media queries.
  			//  I hope this will never occur (Hey this way we have smaller bundles)
  			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
  				if(mediaQuery && !item[2]) {
  					item[2] = mediaQuery;
  				} else if(mediaQuery) {
  					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
  				}
  				list.push(item);
  			}
  		}
  	};
  	return list;
  };


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  var _assign = __webpack_require__(41);
  
  var _assign2 = _interopRequireDefault(_assign);
  
  var _stringify = __webpack_require__(1);
  
  var _stringify2 = _interopRequireDefault(_stringify);
  
  var _slicedToArray2 = __webpack_require__(42);
  
  var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);
  
  var _getIterator2 = __webpack_require__(43);
  
  var _getIterator3 = _interopRequireDefault(_getIterator2);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Isomorphic CSS style loader for Webpack
   *
   * Copyright © 2015-2016 Kriasoft, LLC. All rights reserved.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */
  
  var prefix = 's';
  var inserted = {};
  
  // Base64 encoding and decoding - The "Unicode Problem"
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
  function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode('0x' + p1);
    }));
  }
  
  /**
   * Remove style/link elements for specified node IDs
   * if they are no longer referenced by UI components.
   */
  function removeCss(ids) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;
  
    try {
      for (var _iterator = (0, _getIterator3.default)(ids), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var id = _step.value;
  
        if (--inserted[id] <= 0) {
          var elem = document.getElementById(prefix + id);
          if (elem) {
            elem.parentNode.removeChild(elem);
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
  
  /**
   * Example:
   *   // Insert CSS styles object generated by `css-loader` into DOM
   *   var removeCss = insertCss([[1, 'body { color: red; }']]);
   *
   *   // Remove it from the DOM
   *   removeCss();
   */
  function insertCss(styles, options) {
    var _Object$assign = (0, _assign2.default)({
      replace: false,
      prepend: false
    }, options);
  
    var replace = _Object$assign.replace;
    var prepend = _Object$assign.prepend;
  
  
    var ids = [];
    for (var i = 0; i < styles.length; i++) {
      var _styles$i = (0, _slicedToArray3.default)(styles[i], 4);
  
      var moduleId = _styles$i[0];
      var css = _styles$i[1];
      var media = _styles$i[2];
      var sourceMap = _styles$i[3];
  
      var id = moduleId + '-' + i;
  
      ids.push(id);
  
      if (inserted[id]) {
        if (!replace) {
          inserted[id]++;
          continue;
        }
      }
  
      inserted[id] = 1;
  
      var elem = document.getElementById(prefix + id);
      var create = false;
  
      if (!elem) {
        create = true;
  
        elem = document.createElement('style');
        elem.setAttribute('type', 'text/css');
        elem.id = prefix + id;
  
        if (media) {
          elem.setAttribute('media', media);
        }
      }
  
      var cssText = css;
      if (sourceMap) {
        cssText += '\n/*# sourceMappingURL=data:application/json;base64,' + b64EncodeUnicode((0, _stringify2.default)(sourceMap)) + '*/';
        cssText += '\n/*# sourceURL=' + sourceMap.file + '*/';
      }
  
      if ('textContent' in elem) {
        elem.textContent = cssText;
      } else {
        elem.styleSheet.cssText = cssText;
      }
  
      if (create) {
        if (prepend) {
          document.head.insertBefore(elem, document.head.childNodes[0]);
        } else {
          document.head.appendChild(elem);
        }
      }
    }
  
    return removeCss.bind(null, ids);
  }
  
  module.exports = insertCss;

/***/ }),
/* 41 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/core-js/object/assign");

/***/ }),
/* 42 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/helpers/slicedToArray");

/***/ }),
/* 43 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/core-js/get-iterator");

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _graphqlTools = __webpack_require__(15);
  
  var _resolvers = __webpack_require__(45);
  
  var _type_definitions = __webpack_require__(51);
  
  var _type_definitions2 = _interopRequireDefault(_type_definitions);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var executableSchema = (0, _graphqlTools.makeExecutableSchema)({
    typeDefs: [_type_definitions2.default],
    resolvers: _resolvers.Resolvers
  }); /**
       * @file - defines the schemas, their attributes, and the attribute types
       */
  
  exports.default = executableSchema;

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Resolvers = exports.GetLoaders = undefined;
  
  var _regenerator = __webpack_require__(2);
  
  var _regenerator2 = _interopRequireDefault(_regenerator);
  
  var _asyncToGenerator2 = __webpack_require__(5);
  
  var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);
  
  /**
   * prepare graphql response for query about delivery items
   * @param  {[type]} foodSession [description]
   * @return {[type]}             [description]
   */
  // function prepareCafeCarts(foodSession) {
  
  //   var cartLength=0;
  //   foodSession.cart_total = `$0.00`;
  //   if(foodSession.cart){
  //     for(var i = 0; i<foodSession.cart.length; i++){
  //       if(foodSession.cart[i].added_to_cart){
  //         cartLength+=foodSession.cart[i].item.item_qty;
  //       }
  //     }
  //   }
  
  //   if (cartLength > 0) {
  //     foodSession.cart_total = `$${Number(foodSession.calculated_amount).toFixed(2)}`;
  //     foodSession.cart = foodSession.cart;
  //   }
  //   foodSession.item_count = cartLength;
  
  //   return foodSession;
  // }
  
  /**
   * prepare graphql response object for query about amazon carts
   * @param  {object} cart object - currently from amazon only
   * @return {object} cart object
   */
  var prepareStoreCarts = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(cart, purchasedObj) {
      var itemArgs;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              itemArgs = _lodash2.default.merge({ cart_id: cart._id }, purchasedObj);
              _context.next = 3;
              return _database.Items.find(itemArgs).sort({ added_date: -1 }).toArray();
  
            case 3:
              cart.items = _context.sent;
  
              if (!(cart.items.length === 0)) {
                _context.next = 6;
                break;
              }
  
              return _context.abrupt('return', null);
  
            case 6:
              return _context.abrupt('return', cart);
  
            case 7:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));
  
    return function prepareStoreCarts(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
  
  // Data Loaders make it possible to batch load certain queries from mongodb,
  // which can drastically reduce the number of db queries made per graphql query
  // See: https://github.com/facebook/dataloader
  //
  // If additional queries need to be tuned for performance reasons, follow the
  // example of the Waypoint resolver below and add additional loaders.
  
  /**
   * batch queries the delivery collection by the '_id' field.
   */
  var loadDeliveriesById = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ids) {
      var deliveries, byID;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _database.Deliveries.find({ '_id': { '$in': ids.map(function (i) {
                    return (0, _mongodb.ObjectId)(i);
                  }) } }).toArray();
  
            case 2:
              deliveries = _context2.sent;
              byID = {};
  
              deliveries.map(function (d) {
                byID[d._id.toHexString()] = d;
              });
  
              return _context2.abrupt('return', ids.map(function (i) {
                return byID[i] || null;
              }));
  
            case 6:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));
  
    return function loadDeliveriesById(_x3) {
      return _ref2.apply(this, arguments);
    };
  }();
  
  /**
   * batch queries the chatusers collection by the 'id' field (NOTE: not the _id
   * field)
   *
   * @param userIds - an array of user ids (e.g. ['U0PRBNLNS', 'U0PQN0T63'])
   */
  
  
  var loadUsersByUserId = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(userIds) {
      var users, usersByUserId;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _database.Chatusers.find({ id: { '$in': userIds } }).toArray();
  
            case 2:
              users = _context3.sent;
              usersByUserId = {};
  
              users.map(function (u) {
                usersByUserId[u.id] = u;
              });
  
              return _context3.abrupt('return', userIds.map(function (uid) {
                return usersByUserId[uid] || null;
              }));
  
            case 6:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));
  
    return function loadUsersByUserId(_x4) {
      return _ref3.apply(this, arguments);
    };
  }();
  
  var getUserNameById = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(userId) {
      var user;
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _database.Chatusers.findOne({ id: userId }, { name: 1, _id: 0 });
  
            case 2:
              user = _context4.sent;
              return _context4.abrupt('return', user);
  
            case 4:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));
  
    return function getUserNameById(_x5) {
      return _ref4.apply(this, arguments);
    };
  }();
  
  /**
   * sets pagination parameters on the collection query if provided, or uses
   * defaults if not.
   *
   * @param coll - a collection from the database
   * @param args - query arguments
   * @param sort - sort option for results
   */
  
  
  var pagination = function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(coll, args, sort) {
      var limit, skip, id, q;
      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              limit = args.limit || 10;
  
              delete args.limit;
  
              skip = args.offset || 0;
  
              delete args.offset;
  
              id = args._id;
  
              if (args._id) args._id = (0, _mongodb.ObjectId)(args._id);
  
              // TODO(Cameron): I'm assuming coll.find() is synchronous, and it's toArray()
              // that is asychronous?
              q = coll.find(args);
  
              if (sort) q = q.sort(sort);
              _context5.next = 10;
              return q.skip(skip).limit(limit).toArray();
  
            case 10:
              q = _context5.sent;
              return _context5.abrupt('return', q);
  
            case 12:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));
  
    return function pagination(_x6, _x7, _x8) {
      return _ref5.apply(this, arguments);
    };
  }();
  
  var _mongodb = __webpack_require__(27);
  
  var _graphqlToolsTypes = __webpack_require__(46);
  
  var _graphqlToolsTypes2 = _interopRequireDefault(_graphqlToolsTypes);
  
  var _dataloader = __webpack_require__(47);
  
  var _dataloader2 = _interopRequireDefault(_dataloader);
  
  var _lodash = __webpack_require__(48);
  
  var _lodash2 = _interopRequireDefault(_lodash);
  
  var _database = __webpack_require__(25);
  
  var _Menu = __webpack_require__(49);
  
  var _Menu2 = _interopRequireDefault(_Menu);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  // if you want to use mongoose/db.whatever uncomment this
  // import db from "../../../../../db/index.js"
  
  
  /**
   * get the date from args if using start_date and end_date in graphql query
   * @param  {object} args object with possible start and end dates
   * @param  {string} property for mongodb object that search date for
   * @return {object} args object
   */
  /**
   * @file Defines the resolvers for the different schemas being used.
   */
  
  function getDateFromArgs(args, datePropertyString) {
    var dateArgs = void 0;
    var newArgs = args;
  
    if (newArgs.start_date || newArgs.end_date) {
      dateArgs = {};
    } else {
      return newArgs;
    }
    if (newArgs.start_date) {
      dateArgs.$gt = new Date(newArgs.start_date);
      delete newArgs.start_date;
    }
    if (newArgs.end_date) {
      dateArgs.$lt = new Date(newArgs.end_date);
      delete newArgs.end_date;
    }
    newArgs[datePropertyString] = dateArgs;
  
    return newArgs;
  }function GetLoaders() {
    return {
      DeliveriesById: new _dataloader2.default(function (keys) {
        return loadDeliveriesById(keys);
      }),
      UsersByUserId: new _dataloader2.default(function (keys) {
        return loadUsersByUserId(keys);
      }),
      UserNameById: new _dataloader2.default(function (keys) {
        return getUserNameById(keys);
      })
    };
  }
  
  var Resolvers = {
  
    // Business objects
    //
    Delivery: {
      type: function type() {
        return 'slack';
      },
      cart_total: function cart_total(obj) {
        if (obj.calculated_amount) {
          return '$' + Number(obj.calculated_amount).toFixed(2);
        }
        return '$0.00';
      },
      item_count: function item_count(foodSession) {
        var cartLength = 0;
        if (foodSession.cart) {
          for (var i = 0; i < foodSession.cart.length; i++) {
            if (foodSession.cart[i].added_to_cart) {
              cartLength += foodSession.cart[i].item.item_qty;
            }
          }
        }
        return cartLength;
      },
      chosen_restaurant: function chosen_restaurant(obj) {
        return _lodash2.default.get(obj, 'chosen_restaurant.name');
      },
      items: function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(obj, args, context, info) {
          var menuObj;
          return _regenerator2.default.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  if (obj.menu) {
                    _context7.next = 2;
                    break;
                  }
  
                  return _context7.abrupt('return', []);
  
                case 2:
                  menuObj = (0, _Menu2.default)(obj.menu);
                  return _context7.abrupt('return', obj.cart.map(function () {
                    var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(i) {
                      var item, userName;
                      return _regenerator2.default.wrap(function _callee6$(_context6) {
                        while (1) {
                          switch (_context6.prev = _context6.next) {
                            case 0:
                              if (!i.item) {
                                _context6.next = 9;
                                break;
                              }
  
                              item = menuObj.flattenedMenu[i.item.item_id];
                              _context6.next = 4;
                              return context.loaders.UsersByUserId.load(i.user_id);
  
                            case 4:
                              userName = _context6.sent;
  
                              userName = userName.name;
                              return _context6.abrupt('return', {
                                item_name: item ? item.name : 'name unavail',
                                // either need to convert id to name here or with context in the resolver
                                user: userName
                              });
  
                            case 9:
                              return _context6.abrupt('return', {
                                item_name: 'name unavail',
                                userName: 'n/a'
                              });
  
                            case 10:
                            case 'end':
                              return _context6.stop();
                          }
                        }
                      }, _callee6, undefined);
                    }));
  
                    return function (_x13) {
                      return _ref7.apply(this, arguments);
                    };
                  }()));
  
                case 4:
                case 'end':
                  return _context7.stop();
              }
            }
          }, _callee7, undefined);
        }));
  
        return function items(_x9, _x10, _x11, _x12) {
          return _ref6.apply(this, arguments);
        };
      }(),
  
      team: function () {
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(_ref9) {
          var team_id = _ref9.team_id;
          return _regenerator2.default.wrap(function _callee8$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  _context8.next = 2;
                  return _database.Slackbots.findOne({ team_id: team_id });
  
                case 2:
                  return _context8.abrupt('return', _context8.sent);
  
                case 3:
                case 'end':
                  return _context8.stop();
              }
            }
          }, _callee8, undefined);
        }));
  
        return function team(_x14) {
          return _ref8.apply(this, arguments);
        };
      }()
    },
  
    Cart: {
  
      cart_total: function cart_total(obj) {
        if (_lodash2.default.get(obj, 'amazon.SubTotal')) {
          return '$' + Number(obj.amazon.SubTotal[0].Amount / 100.0).toFixed(2);
        }
        return 'No Cart Subtotal';
      },
      created_date: function created_date(obj) {
        return new Date(obj.created_date).toDateString();
      },
      items: function () {
        var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(_ref11, args) {
          var _id = _ref11._id;
          var itemArgs, items;
          return _regenerator2.default.wrap(function _callee9$(_context9) {
            while (1) {
              switch (_context9.prev = _context9.next) {
                case 0:
                  // possible to get the value per item if needed using
                  itemArgs = {
                    cart_id: (0, _mongodb.ObjectId)(_id)
                  };
  
                  if (args.purchased !== undefined) {
                    itemArgs.purchased = args.purchased;
                  }
                  _context9.next = 4;
                  return _database.Items.find(itemArgs).sort({ added_date: -1 }).toArray();
  
                case 4:
                  items = _context9.sent;
                  return _context9.abrupt('return', items);
  
                case 6:
                case 'end':
                  return _context9.stop();
              }
            }
          }, _callee9, undefined);
        }));
  
        return function items(_x15, _x16) {
          return _ref10.apply(this, arguments);
        };
      }(),
      item_count: function item_count(obj) {
        if (obj.items) {
          return obj.items.length;
        }
        return 0;
      },
      team: function () {
        var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(obj) {
          var team;
          return _regenerator2.default.wrap(function _callee10$(_context10) {
            while (1) {
              switch (_context10.prev = _context10.next) {
                case 0:
                  _context10.next = 2;
                  return _database.Slackbots.findOne({ team_id: obj.slack_id });
  
                case 2:
                  team = _context10.sent;
                  return _context10.abrupt('return', team);
  
                case 4:
                case 'end':
                  return _context10.stop();
              }
            }
          }, _callee10, undefined);
        }));
  
        return function team(_x17) {
          return _ref12.apply(this, arguments);
        };
      }(),
      type: function type() {
        return 'slack';
      }
    },
  
    Chatuser: {
      team: function () {
        var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(_ref14) {
          var team_id = _ref14.team_id;
          var team;
          return _regenerator2.default.wrap(function _callee11$(_context11) {
            while (1) {
              switch (_context11.prev = _context11.next) {
                case 0:
                  _context11.next = 2;
                  return _database.Slackbots.findOne({ 'team_id': team_id });
  
                case 2:
                  team = _context11.sent;
                  return _context11.abrupt('return', team);
  
                case 4:
                case 'end':
                  return _context11.stop();
              }
            }
          }, _callee11, undefined);
        }));
  
        return function team(_x18) {
          return _ref13.apply(this, arguments);
        };
      }()
    },
  
    Item: {
      cart: function () {
        var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(_ref16) {
          var cart_id = _ref16.cart_id;
          return _regenerator2.default.wrap(function _callee12$(_context12) {
            while (1) {
              switch (_context12.prev = _context12.next) {
                case 0:
                  _context12.next = 2;
                  return _database.Carts.findOne((0, _mongodb.ObjectId)(cart_id));
  
                case 2:
                  return _context12.abrupt('return', _context12.sent);
  
                case 3:
                case 'end':
                  return _context12.stop();
              }
            }
          }, _callee12, undefined);
        }));
  
        return function cart(_x19) {
          return _ref15.apply(this, arguments);
        };
      }()
    },
  
    Slackbot: {
  
      members: function () {
        var _ref17 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(_ref18) {
          var team_id = _ref18.team_id;
          return _regenerator2.default.wrap(function _callee13$(_context13) {
            while (1) {
              switch (_context13.prev = _context13.next) {
                case 0:
                  _context13.next = 2;
                  return _database.Chatusers.find({ team_id: team_id }).toArray();
  
                case 2:
                  return _context13.abrupt('return', _context13.sent);
  
                case 3:
                case 'end':
                  return _context13.stop();
              }
            }
          }, _callee13, undefined);
        }));
  
        return function members(_x20) {
          return _ref17.apply(this, arguments);
        };
      }(),
      carts: function () {
        var _ref19 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14(_ref20) {
          var team_id = _ref20.team_id;
          var carts;
          return _regenerator2.default.wrap(function _callee14$(_context14) {
            while (1) {
              switch (_context14.prev = _context14.next) {
                case 0:
                  _context14.next = 2;
                  return _database.Carts.find({ slack_id: team_id }).toArray();
  
                case 2:
                  carts = _context14.sent;
                  return _context14.abrupt('return', carts);
  
                case 4:
                case 'end':
                  return _context14.stop();
              }
            }
          }, _callee14, undefined);
        }));
  
        return function carts(_x21) {
          return _ref19.apply(this, arguments);
        };
      }(),
      deliveries: function () {
        var _ref21 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee15(obj, args) {
          var res;
          return _regenerator2.default.wrap(function _callee15$(_context15) {
            while (1) {
              switch (_context15.prev = _context15.next) {
                case 0:
                  _context15.next = 2;
                  return _database.Deliveries.find({ team_id: obj.team_id }, { menu: 0 }).limit(args.limit).toArray();
  
                case 2:
                  res = _context15.sent;
                  return _context15.abrupt('return', res);
  
                case 4:
                case 'end':
                  return _context15.stop();
              }
            }
          }, _callee15, undefined);
        }));
  
        return function deliveries(_x22, _x23) {
          return _ref21.apply(this, arguments);
        };
      }()
    },
  
    Waypoint: {
      user: function () {
        var _ref22 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee16(_ref23, _, context) {
          var user_id = _ref23.user_id;
          return _regenerator2.default.wrap(function _callee16$(_context16) {
            while (1) {
              switch (_context16.prev = _context16.next) {
                case 0:
                  return _context16.abrupt('return', context.loaders.UsersByUserId.load(user_id));
  
                case 1:
                case 'end':
                  return _context16.stop();
              }
            }
          }, _callee16, undefined);
        }));
  
        return function user(_x24, _x25, _x26) {
          return _ref22.apply(this, arguments);
        };
      }(),
      delivery: function () {
        var _ref24 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee17(_ref25, _, context) {
          var delivery_id = _ref25.delivery_id;
          return _regenerator2.default.wrap(function _callee17$(_context17) {
            while (1) {
              switch (_context17.prev = _context17.next) {
                case 0:
                  return _context17.abrupt('return', context.loaders.DeliveriesById.load(delivery_id));
  
                case 1:
                case 'end':
                  return _context17.stop();
              }
            }
          }, _callee17, undefined);
        }));
  
        return function delivery(_x27, _x28, _x29) {
          return _ref24.apply(this, arguments);
        };
      }()
    },
  
    // Custom types
  
    JSON: _graphqlToolsTypes2.default.JSON({ name: "Custom JSON scalar type" }),
    Date: _graphqlToolsTypes2.default.Date({ name: "Custom Date scalar type" }),
  
    // Root query
  
    Query: {
      carts: function () {
        var _ref26 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee18(root, args) {
          var newArgs, res;
          return _regenerator2.default.wrap(function _callee18$(_context18) {
            while (1) {
              switch (_context18.prev = _context18.next) {
                case 0:
                  newArgs = getDateFromArgs(args, 'created_date');
                  _context18.next = 3;
                  return pagination(_database.Carts, newArgs);
  
                case 3:
                  res = _context18.sent;
  
                  res = res.filter(function (cart) {
                    return cart.items.length > 0;
                  });
                  return _context18.abrupt('return', res);
  
                case 6:
                case 'end':
                  return _context18.stop();
              }
            }
          }, _callee18, undefined);
        }));
  
        return function carts(_x30, _x31) {
          return _ref26.apply(this, arguments);
        };
      }(),
  
      deliveries: function () {
        var _ref27 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee19(root, args) {
          var newArgs, res;
          return _regenerator2.default.wrap(function _callee19$(_context19) {
            while (1) {
              switch (_context19.prev = _context19.next) {
                case 0:
                  newArgs = getDateFromArgs(args, 'time_started');
                  _context19.next = 3;
                  return pagination(_database.Deliveries, newArgs);
  
                case 3:
                  res = _context19.sent;
                  return _context19.abrupt('return', res);
  
                case 5:
                case 'end':
                  return _context19.stop();
              }
            }
          }, _callee19, undefined);
        }));
  
        return function deliveries(_x32, _x33) {
          return _ref27.apply(this, arguments);
        };
      }(),
  
      items: function () {
        var _ref28 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee20(root, args) {
          return _regenerator2.default.wrap(function _callee20$(_context20) {
            while (1) {
              switch (_context20.prev = _context20.next) {
                case 0:
                  _context20.next = 2;
                  return pagination(_database.Items, args);
  
                case 2:
                  return _context20.abrupt('return', _context20.sent);
  
                case 3:
                case 'end':
                  return _context20.stop();
              }
            }
          }, _callee20, undefined);
        }));
  
        return function items(_x34, _x35) {
          return _ref28.apply(this, arguments);
        };
      }(),
  
      messages: function () {
        var _ref29 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee21(root, args) {
          return _regenerator2.default.wrap(function _callee21$(_context21) {
            while (1) {
              switch (_context21.prev = _context21.next) {
                case 0:
                  _context21.next = 2;
                  return pagination(_database.Messages, args);
  
                case 2:
                  return _context21.abrupt('return', _context21.sent);
  
                case 3:
                case 'end':
                  return _context21.stop();
              }
            }
          }, _callee21, undefined);
        }));
  
        return function messages(_x36, _x37) {
          return _ref29.apply(this, arguments);
        };
      }(),
  
      metrics: function () {
        var _ref30 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee22(root, args) {
          return _regenerator2.default.wrap(function _callee22$(_context22) {
            while (1) {
              switch (_context22.prev = _context22.next) {
                case 0:
                  _context22.next = 2;
                  return pagination(_database.Metrics, args);
  
                case 2:
                  return _context22.abrupt('return', _context22.sent);
  
                case 3:
                case 'end':
                  return _context22.stop();
              }
            }
          }, _callee22, undefined);
        }));
  
        return function metrics(_x38, _x39) {
          return _ref30.apply(this, arguments);
        };
      }(),
  
      teams: function () {
        var _ref31 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee23(root, args) {
          var teams;
          return _regenerator2.default.wrap(function _callee23$(_context23) {
            while (1) {
              switch (_context23.prev = _context23.next) {
                case 0:
                  _context23.next = 2;
                  return pagination(_database.Slackbots, args);
  
                case 2:
                  teams = _context23.sent;
                  return _context23.abrupt('return', teams);
  
                case 4:
                case 'end':
                  return _context23.stop();
              }
            }
          }, _callee23, undefined);
        }));
  
        return function teams(_x40, _x41) {
          return _ref31.apply(this, arguments);
        };
      }(),
  
      users: function () {
        var _ref32 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee24(root, args) {
          return _regenerator2.default.wrap(function _callee24$(_context24) {
            while (1) {
              switch (_context24.prev = _context24.next) {
                case 0:
                  _context24.next = 2;
                  return pagination(_database.Chatusers, args);
  
                case 2:
                  return _context24.abrupt('return', _context24.sent);
  
                case 3:
                case 'end':
                  return _context24.stop();
              }
            }
          }, _callee24, undefined);
        }));
  
        return function users(_x42, _x43) {
          return _ref32.apply(this, arguments);
        };
      }(),
  
      waypoints: function () {
        var _ref33 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee25(root, args) {
          return _regenerator2.default.wrap(function _callee25$(_context25) {
            while (1) {
              switch (_context25.prev = _context25.next) {
                case 0:
                  _context25.next = 2;
                  return pagination(_database.Waypoints, args);
  
                case 2:
                  return _context25.abrupt('return', _context25.sent);
  
                case 3:
                case 'end':
                  return _context25.stop();
              }
            }
          }, _callee25, undefined);
        }));
  
        return function waypoints(_x44, _x45) {
          return _ref33.apply(this, arguments);
        };
      }()
  
    },
  
    Mutation: {
      setItemAsPurchased: function () {
        var _ref34 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee26(_, _ref35) {
          var itemId = _ref35.itemId;
          var item;
          return _regenerator2.default.wrap(function _callee26$(_context26) {
            while (1) {
              switch (_context26.prev = _context26.next) {
                case 0:
                  item = _database.Items.findOne((0, _mongodb.ObjectId)(itemId));
                  _context26.next = 3;
                  return item.then(function (selectedItem) {
                    if (!selectedItem) {
                      throw new Error('Couldn\'t find item with id ' + itemId);
                    } else {
                      _database.Items.findOneAndUpdate({ _id: (0, _mongodb.ObjectId)(itemId) }, { $set: { purchased: true } }, { new: true }, function (err, doc) {
                        if (err) {
                          console.log("Something wrong when updating data!");
                        }
                      });
                      return selectedItem;
                    }
                  });
  
                case 3:
                  return _context26.abrupt('return', _context26.sent);
  
                case 4:
                case 'end':
                  return _context26.stop();
              }
            }
          }, _callee26, undefined);
        }));
  
        return function setItemAsPurchased(_x46, _x47) {
          return _ref34.apply(this, arguments);
        };
      }()
    }
  
  };
  
  exports.GetLoaders = GetLoaders;
  exports.Resolvers = Resolvers;

/***/ }),
/* 46 */
/***/ (function(module, exports) {

  module.exports = require("graphql-tools-types");

/***/ }),
/* 47 */
/***/ (function(module, exports) {

  module.exports = require("dataloader");

/***/ }),
/* 48 */
/***/ (function(module, exports) {

  module.exports = require("lodash");

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

  /* WEBPACK VAR INJECTION */(function(module) {var _ = __webpack_require__(48)
  
  /**
   * Menu class
   *
   * usage:
   * var data = yield request('https://api.delivery.com/merchant/66030/menu?client_id=brewhacks2016')
   * var menu = Menu(data)
   * console.log(menu.allItems())
   * console.log(menu.query("spring rolls"))
   *
   * @class
   * @param {Object} data the menu document returnd by the delivery.com api
   */
  function Menu (data) {
    if (!(this instanceof Menu)) {
      return new Menu(data)
    }
  
    this._data = data
  
    this.flattenedMenu = flattenMenu(data)
  }
  
  // an array of all the items, aka top-level things you can add to your cart
  Menu.prototype.allItems = function () {
    return _.values(this.flattenedMenu).filter(i => i.type === 'item')
  }
  
  // the ID needs to be a node's unique_id
  Menu.prototype.getItemById = function (id) {
    return this.flattenedMenu[Number.isInteger(id) ? String(id) : id]
  }
  
  // gets the price for a cartItem, which is one of the objects in the delivery_schema cart array
  Menu.prototype.getCartItemPrice = function (cartItem) {
    var menu = this
    var item = this.getItemById(cartItem.item.item_id)
    cartItem.item.option_qty = cartItem.item.option_qty || {}
    var basePrice
    var hasPriceGroup = item.children.map(c => c.type).includes('price group')
    if (hasPriceGroup) {
      var priceGroup = item.children.filter(c => c.type === 'price group')[0]
      var priceOption = priceGroup.children.filter(p => !!cartItem.item.option_qty[p.id])[0]
      basePrice = _.get(priceOption, 'price', item.price)
    } else {
      basePrice = item.price
    }
  
    return cartItem.item.item_qty * (basePrice + Object.keys(cartItem.item.option_qty).reduce((sum, optionId) => {
        if (!cartItem.item.option_qty.hasOwnProperty(optionId)) {
          return sum
        }
  
        if (optionId === _.get(priceOption, 'id', -1).toString()) {
          return sum
        }
  
        var optionPrice = menu.getItemById(optionId).price
        var optionQuantity = cartItem.item.option_qty[optionId]
  
        if (optionPrice && typeof optionQuantity === 'number') {
          return sum + optionQuantity * optionPrice
        }
  
        return sum
      }, 0)
    )
  }
  
  // turns the menu into a single object with keys as item ids
  function flattenMenu (data) {
    var out = {}
    var schedules = data.schedule
    var now = new Date()
    function flatten (node, out) {
      if (node.type === 'menu' && _.get(node, 'schedule[0]')) {
        var isAvailable = false
        node.schedule.map(id => _.find(schedules, {id: id}))[0].times.map(t => {
          if (now > new Date(t.from) && now < new Date(t.to)) {
            isAvailable = true
          }
        })
  
        if (!isAvailable) {
          logging.debug(node.name.cyan, 'is not available'.red)
          return
        }
      }
  
      out[node.id] = node
      _.get(node, 'children', []).map(c => {
        c.parentId = node.id
        flatten(c, out)
      })
    }
    data.menu.map(m => flatten(m, out))
    return out
  }
  
  Menu.prototype.generateJsonForItem = function (cartItem, validate, message) {
    var menu = this
    var item = this.getItemById(cartItem.item.item_id)
    cartItem.item.option_qty = cartItem.item.option_qty || {}
  
    // Price for the Add To Cart button
    var fullPrice = menu.getCartItemPrice(cartItem)
    var parentName = _.get(menu, `flattenedMenu.${item.parentId}.name`)
    var parentDescription = _.get(menu, `flattenedMenu.${item.parentId}.description`)
  
    //lol
    if (item.description) {
      var des = `- _${item.description.replace('\n', '_\n_')}_`
    } else {
      des = ''
    }
    //lol
    if(parentDescription){
      var h = '-'
    }else {
      var h = ''
    }
  
    var json = {
      text: `*${item.name}* ${des}`,
      attachments: [{
        image_url: (item.images.length>0 ? 'https://res.cloudinary.com/delivery-com/image/fetch/w_300,h_240,c_fit/' + encodeURIComponent(item.images[0].url) : ''),
        fallback: item.name + ' - ' + item.description,
        callback_id: 'quantity',
        color: 'grey',
        attachment_type: 'default',
        actions: [
          {
            name: 'food.item.quantity.subtract',
            text: '—',
            type: 'button',
            value: cartItem.item.item_id
          },
          {
            name: 'food.null',
            text: cartItem.item.item_qty,
            type: 'button',
            value: 'food.null'
          },
          {
            name: 'food.item.quantity.add',
            text: '+',
            type: 'button',
            value: cartItem.item.item_id
          }
        ]
      }]
    }
  
    // options, like radios and checkboxes
    var options = nodeOptions(item, cartItem, validate, message)
    json.attachments = json.attachments.concat(options)
  
    if (_.keys(cartItem.item.option_qty).length > 0) {
      var optionsText = _.keys(cartItem.item.option_qty).map((opt) => {
        if (this.getItemById(String(opt)).price > 0) {
          var specificItem = `${this.getItemById(String(opt)).name} - \$${this.getItemById(String(opt)).price.toFixed(2)}`
        } else {
          specificItem = this.getItemById(String(opt)).name
        }
        return specificItem
      })
      optionsText = `*Options:* _${optionsText.join(', ')}_`
      json.attachments.push({
        'text': optionsText,
        'fallback': optionsText,
        'attachment_type': 'default',
        'mrkdwn_in': ['text']
      })
    }
  
    json.attachments.push({
      'text': `*Special Instructions:* ${cartItem.item.instructions || "_None_"} \n *Total:* `+fullPrice.$,
      'fallback': 'Special Instructions: ${cartItem.item.instructions || "_None_"}',
      'callback_id': 'menu_quickpicks',
      'color': '#49d63a',
      'attachment_type': 'default',
      'mrkdwn_in': ['text'],
      'actions': [{
          'name': 'food.item.add_to_cart',
          'text': '✓ Add to Order',
          'type': 'button',
          'style': 'primary',
          'value': cartItem.item.item_id
        }, {
          'name': 'food.item.instructions',
          'text': '✎ Special Instructions',
          'type': 'button',
          'value': cartItem.item.item_id
        }, {
          'name': 'food.menu.quickpicks',
          'text': '< Back',
          'type': 'button',
          'value': 0
        }]
    })
    return json
  }
  
  function nodeOptions (node, cartItem, validate, message) {
    var attachments = node.children.filter(c => c.type.includes('group')).reduce((all, g) => {
      var a = {
        fallback: 'Meal option',
        callback_id: g.id,
        color: '#3AA3E3',
        attachment_type: 'default',
        mrkdwn_in: ['text'],
        text: ''
      }
      if (g.name === 'Meal Additions') {
        a.text = '*Would you like a meal addition?*'
        a.color = 'grey'
      } else {
        a.text = `*${g.name}*`
      }
      var optionIndices = _.get(message, 'data.value.optionIndices') ? _.get(message, 'data.value.optionIndices') : {}
      var required = false
      var allowMultiple = true
      var numSelected = g.children.filter(option => Object.keys(cartItem.item.option_qty).includes(option.id)).length
      if (g.min_selection === 0) {
        if (g.max_selection >= g.children.length) {
          a.text += '\n Optional - Choose as many as you like.'
          a.color = 'grey'
        } else {
          a.text += `
   Optional - Choose up to ${g.max_selection}.`
          if (numSelected > g.max_selection) {
            a.text += '\n`Maximum number of options exceeded`'
            a.color = '#fa951b'
          } else {
            a.color = 'grey'
          }
        }
      } else {
        required = true
        if (g.min_selection === g.max_selection) {
          allowMultiple = g.min_selection !== 1
          a.text += `
   Required - Choose exactly ${g.min_selection}.`
          if (numSelected > g.min_selection) {
            a.text += `\n\`Too many options selected\``
            a.color = '#fa951b'
          } else if (validate && numSelected < g.min_selection) {
            a.text += `\n\`${g.min_selection - numSelected} more selection(s) required\``
            a.color = '#fa951b'
          }
        } else {
          a.text += `
   Required - Choose at least ${g.min_selection} and up to ${g.max_selection}.`
          if (numSelected > g.max_selection) {
            a.text += '\n`Maximum number of options exceeded`'
            a.color = '#fa951b'
          } else if (validate && numSelected < g.min_selection) {
            a.text += '\n`Minimum number of options not met`'
            a.color = '#fa951b'
          }
        }
      }
  
      a.actions = g.children.map(option => {
        var checkbox, price
        if (g.type === 'price group') {
          // price groups are like 'small, medium or large' and so each one is the base price
          price = ' $' + option.price
        } else if (g.type === 'option group' && option.price) {
          // option groups are add-ons or required choices which can add to the item cost
          price = ' +$' + option.price
        } else {
          price = ''
        }
  
        if (cartItem.item.option_qty[option.id]) {
          checkbox = allowMultiple ? '✓ ' : '◉ '
        } else {
          checkbox = allowMultiple ? '☐ ' : '○ '
        }
        return {
          name: 'food.option.click',
          text: checkbox + option.name + price,
          type: 'button',
          value: {
            item_id: cartItem.item.item_id,
            option_id: option.id,
            optionIndices: optionIndices
          }
        }
      })
  
      all.push(a)
  
      // Submenu part
      g.children.map(option => {
        if (cartItem.item.option_qty[option.id] && _.get(option, 'children.0')) {
          var submenuAttachments = nodeOptions(option, cartItem, validate, message)
          all = all.concat(submenuAttachments)
        }
      })
  
      return all
    }, [])
  
    // spread out the buttons to multiple attachments if needed
    attachments = attachments.reduce((all, a) => {
  
      var optionIndices = _.get(message, 'data.value.optionIndices') ? _.get(message, 'data.value.optionIndices') : {}
      var groupId = Number(a.callback_id.split('-').slice(-1)[0])
      var optionIndex = optionIndices[groupId] ? optionIndices[groupId] : 1
      var isRequired = a.text ? a.text.indexOf('Required') !== -1 : false
      var rowCount = 0
      if (_.get(a, 'actions.length', 0) <= 3) {
        all.push(a)
        return all
      } else {
        var actions = a.actions
        var numActionRows = Math.ceil(actions.length/3)
        a.actions = actions.splice(0, 3)
        rowCount++
        all.push(a)
        if(isRequired) { //if option is required, show all
          while (actions.length > 0) {
            all.push({
              color: a.color,
              fallback: a.fallback,
              callback_id: 'even more actions',
              attachment_type: 'default',
              actions: actions.splice(0, 3)
            })
          }
        } else { //if option is optional, display 3 at a time.
          while (rowCount < optionIndex) {
            all.push({
              color: a.color,
              fallback: a.fallback,
              callback_id: 'even more actions',
              attachment_type: 'default',
              actions: actions.splice(0, 3)
            })
            rowCount++
          }
          if(numActionRows > optionIndex){
            all.push({
              'name': 'More Options',
              'fallback': 'More Options',
              'callback_id': 'More Options',
              'actions': [{
                'name': 'food.item.loadmore',
                'text': 'More Options',
                'type': 'button',
                'value': {
                  'item_id': cartItem.item.item_id,
                  'group_id': groupId ,
                  'optionIndices': optionIndices,
                  'row_count': numActionRows
                }
              }]
            })
          }
        }
        return all
      }
    }, [])
  
    return attachments
  }
  
  // Check a cartItem for errors
  // (a cartItem is one thing from the foodSession.cart array)
  Menu.prototype.errors = function (cartItem) {
    // the way we'll do this is to build the options with the validation flag
    // and then check the outputted json for errors.
    var submenu = this.generateJsonForItem(cartItem, true)
    var ok = !JSON.stringify(submenu).includes('fa951b')
  
    if (!ok) {
      return submenu
    }
  }
  
  module.exports = Menu
  
  if (!module.parent) {
    var fs = __webpack_require__(30)
    try {
      var json = fs.readFileSync('./merchant_66030_menu.json', 'utf8')
      var data = JSON.parse(json)
      var menu = Menu(data)
      var mock_item = {
        user_id: '12345',
        added_to_cart: false,
        item: {
          item_id: 193,
          item_qty: 1,
          option_qty: {'229': 1}
        }
      }
      console.log(menu.flattenedMenu[228])
      var json = menu.generateJsonForItem(mock_item)
      console.log(JSON.stringify(json, null, 2))
    } catch (err) {
      console.log('error in Menu.js area')
    }
  }
  
  /* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(50)(module)))

/***/ }),
/* 50 */
/***/ (function(module, exports) {

  module.exports = function(module) {
  	if(!module.webpackPolyfill) {
  		module.deprecate = function() {};
  		module.paths = [];
  		// module.parent = undefined by default
  		module.children = [];
  		module.webpackPolyfill = 1;
  	}
  	return module;
  }


/***/ }),
/* 51 */
/***/ (function(module, exports) {

  "use strict";
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  /**
   * @file - defines the schemas, their attributes, and the attribute types
   */
  
  var typeDefinition = "\n# these scalars are defined in the resolver.\nscalar JSON\nscalar Date\n#\ntype FoodItem {\n  item_name: String\n  user: String\n}\ntype Cart {\n  _id: String!\n  slack_id: String\n  purchased: Boolean\n  deleted: Boolean\n  created_date: String\n  purchased_date: String\n  type: String\n  link: String\n  amazon: JSON\n  cart_items: JSON\n  cart_total: String\n  item_count: Int\n  # Foreign refs\n  items(purchased: Boolean): [Item]\n  team: Slackbot\n}\ntype Chatuser {\n  _id: String!\n  id: String\n  platform: String\n  onboarded: Boolean\n  admin_shop_onboarded: Boolean\n  member_shop_onboarded: Boolean\n  ts: String\n  origin: String\n  type: String\n  dm: String\n  team_id: String\n  name: String\n  deleted: Boolean\n  color: String\n  real_name: String\n  tz: String\n  tz_label: String\n  tz_offset: String\n  country: String\n  is_admin: Boolean\n  is_owner: Boolean\n  is_primary_owner: Boolean\n  is_restricted: Boolean\n  is_ultra_restricted: Boolean\n  is_bot: Boolean\n  has_2fa: Boolean\n  last_call_alerts: Boolean\n  emailNotification: Boolean\n  awaiting_email_response: Boolean\n  phone_number: String\n  first_name: String\n  last_name: String\n  # Foreign refs\n  team: Slackbot\n}\ntype Delivery {\n  _id: String!\n  active: Boolean\n  session_id: String\n  team_id: String\n  onboarding: Boolean\n  chosen_restaurant: String\n  budget: String\n  user_budgets: String\n  menu: String\n  chosen_channel: String\n  fulfillment_method: String\n  instructions: String\n  time_started: String\n  mode: String\n  action: String\n  data: String\n  delivery_post: JSON\n  order: JSON\n  tip: String\n  service_fee: String\n  coupon: String\n  main_amount: String\n  calculated_amount: String\n  cart_total: String\n  discount_amount: String\n  payment_post: JSON\n  payment: JSON\n  guest_token: String\n  completed_payment: Boolean\n  delivery_error: String\n  cart: JSON\n  item_count: Int\n  # items: JSON\n  type: String\n  # Foreign refs\n  items: [FoodItem]\n  team: Slackbot\n}\ntype Item {\n  _id: String!\n  cart_id: String\n  title: String\n  image: String\n  description: String\n  price: String\n  ASIN: String\n  rating: String\n  review_count: String\n  added_by: String\n  slack_id: String\n  source_json: String\n  purchased: Boolean\n  purchased_date: String\n  deleted: Boolean\n  added_date: String\n  bundle: String\n  available: Boolean\n  asins: String\n  config: String\n  category: String\n  # Foreign refs\n  cart: Cart\n}\ntype Message {\n  _id: String!\n  thread_id: String\n  origin: String\n  mode: String\n  action: String\n  team: String\n  channel: String\n  user: String\n  user_id: String\n  cart_reference_id: String\n  incoming: Boolean\n  original_text: String\n  text: String\n  original_query: String\n  url_shorten: [String]\n  ts: String\n  source_ts: String\n  slack_ts: String\n  replace_ts: String\n  action_ts: String\n  amazon: String\n}\ntype Metric {\n  _id: String!\n  metric: String\n  data: String\n}\ntype SlackbotMeta {\n  addedBy: String\n  all_channels: JSON\n  dateAdded: String\n  deleted: Boolean\n  cart_channels: [String]\n  collect_from: String\n  initialized: Boolean\n  office_assistants: [String]\n  weekly_status_enabled: Boolean\n  weekly_status_day: String\n  weekly_status_date: String\n  weekly_status_time: String\n  weekly_status_timezone: String\n}\ntype Slackbot {\n  _id: String!\n  team_id: String\n  team_name: String\n  access_token: String\n  scope: String\n  meta: SlackbotMeta\n  incoming_webhook_url: String\n  incoming_webhook_channel: String\n  bot: JSON\n  status_interval: String\n  city: String\n  chosen_location: String\n  fulfillment_method: String\n  mock: Boolean\n  p2p: Boolean\n  used_coupons: String\n  # Foreign refs\n  carts: [Cart]\n  members: [Chatuser]\n  deliveries(limit: Int=10): [Delivery]\n}\ntype User {\n  _id: String!\n  email: String\n}\ntype Waypoint {\n  _id: String!\n  delivery_id: String\n  user_id: String\n  waypoint: String\n  data: JSON\n  timestamp: String\n  # Foreign refs\n  user: Chatuser\n  delivery: Delivery\n}\ntype Query {\n  carts(\n    limit: Int\n    offset: Int\n    start_date: String\n    end_date: String\n    _id: String\n  ): [Cart]\n  deliveries(\n    team_id: String\n    start_date: String\n    end_date: String\n    limit: Int\n    offset: Int\n    _id: String\n    completed_payment: Boolean\n  ): [Delivery]\n  items(\n    limit: Int\n    offset: Int\n    _id: String\n  ): [Item]\n  me: [User]\n  messages(\n    limit: Int\n    offset: Int\n    _id: String\n  ): [Message]\n  metrics(\n    limit: Int\n    offset: Int\n    _id: String\n  ): [Metric]\n  teams(\n    limit: Int\n    offset: Int\n    team_id: String\n  ): [Slackbot]\n  users(\n    limit: Int\n    offset: Int\n    _id: String\n  ): [Chatuser]\n  waypoints(\n    limit: Int\n    offset: Int\n    _id: String\n    user_id: String\n  ): [Waypoint]\n}\ntype Mutation{\n  setItemAsPurchased(itemId: String!): Item\n}\ntype schema {\n  query: Query\n  mutation: Mutation\n}\n";
  
  exports.default = typeDefinition;

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _regenerator = __webpack_require__(2);
  
  var _regenerator2 = _interopRequireDefault(_regenerator);
  
  var _asyncToGenerator2 = __webpack_require__(5);
  
  var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _App = __webpack_require__(53);
  
  var _App2 = _interopRequireDefault(_App);
  
  var _home = __webpack_require__(73);
  
  var _home2 = _interopRequireDefault(_home);
  
  var _login = __webpack_require__(86);
  
  var _login2 = _interopRequireDefault(_login);
  
  var _team = __webpack_require__(92);
  
  var _team2 = _interopRequireDefault(_team);
  
  var _slackteamstats = __webpack_require__(94);
  
  var _slackteamstats2 = _interopRequireDefault(_slackteamstats);
  
  var _sessions = __webpack_require__(99);
  
  var _sessions2 = _interopRequireDefault(_sessions);
  
  var _sendMessage = __webpack_require__(102);
  
  var _sendMessage2 = _interopRequireDefault(_sendMessage);
  
  var _blank = __webpack_require__(110);
  
  var _blank2 = _interopRequireDefault(_blank);
  
  var _amazoncsv = __webpack_require__(112);
  
  var _amazoncsv2 = _interopRequireDefault(_amazoncsv);
  
  var _error = __webpack_require__(123);
  
  var _error2 = _interopRequireDefault(_error);
  
  var _config = __webpack_require__(22);
  
  var _Header = __webpack_require__(62);
  
  var _Header2 = _interopRequireDefault(_Header);
  
  var _reactApollo = __webpack_require__(78);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  // Child routes
  /**
   * React Starter Kit (https://www.reactstarterkit.com/)
   *
   * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */
  
  var client = new _reactApollo.ApolloClient();
  
  exports.default = [{
    path: '/login',
    children: [_login2.default],
    action: function action(_ref) {
      var _this = this;
  
      var next = _ref.next,
          render = _ref.render,
          context = _ref.context;
      return (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        var component;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return next();
  
              case 2:
                component = _context.sent;
  
                if (!(component === undefined)) {
                  _context.next = 5;
                  break;
                }
  
                return _context.abrupt('return', component);
  
              case 5:
                return _context.abrupt('return', render(_react2.default.createElement(
                  _App2.default,
                  { context: context },
                  component
                )));
  
              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this);
      }))();
    }
  }, {
    path: '/',
  
    // keep in mind, routes are evaluated in order
    children: [_home2.default, _slackteamstats2.default, _amazoncsv2.default, _blank2.default, _sessions2.default, _team2.default, _sendMessage2.default,
    // place new routes before...
    // content,
    _error2.default],
  
    action: function action(_ref2) {
      var _this2 = this;
  
      var next = _ref2.next,
          render = _ref2.render,
          context = _ref2.context;
      return (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        var component;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return next();
  
              case 2:
                component = _context2.sent;
  
                if (!(component === undefined)) {
                  _context2.next = 5;
                  break;
                }
  
                return _context2.abrupt('return', component);
  
              case 5:
                return _context2.abrupt('return', render(_react2.default.createElement(
                  _reactApollo.ApolloProvider,
                  { client: client },
                  _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(_Header2.default, null),
                    _react2.default.createElement(
                      'div',
                      { id: 'page-wrapper', className: 'page-wrapper' },
                      _react2.default.createElement(
                        _App2.default,
                        { context: context },
                        component
                      )
                    )
                  )
                )));
  
              case 6:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this2);
      }))();
    }
  }, {
    path: '/error',
    children: [_error2.default],
    action: function action(_ref3) {
      var _this3 = this;
  
      var next = _ref3.next,
          render = _ref3.render,
          context = _ref3.context;
      return (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
        var component;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return next();
  
              case 2:
                component = _context3.sent;
  
                if (!(component === undefined)) {
                  _context3.next = 5;
                  break;
                }
  
                return _context3.abrupt('return', component);
  
              case 5:
                return _context3.abrupt('return', render(_react2.default.createElement(
                  _App2.default,
                  { context: context },
                  component
                )));
  
              case 6:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this3);
      }))();
    }
  }];

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _getPrototypeOf = __webpack_require__(54);
  
  var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
  
  var _classCallCheck2 = __webpack_require__(55);
  
  var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
  
  var _createClass2 = __webpack_require__(56);
  
  var _createClass3 = _interopRequireDefault(_createClass2);
  
  var _possibleConstructorReturn2 = __webpack_require__(57);
  
  var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
  
  var _inherits2 = __webpack_require__(58);
  
  var _inherits3 = _interopRequireDefault(_inherits2);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _emptyFunction = __webpack_require__(59);
  
  var _emptyFunction2 = _interopRequireDefault(_emptyFunction);
  
  var _App = __webpack_require__(60);
  
  var _App2 = _interopRequireDefault(_App);
  
  var _Header = __webpack_require__(62);
  
  var _Header2 = _interopRequireDefault(_Header);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  // import Feedback from '../Feedback';
  // import Footer from '../Footer';
  
  /**
   * React Starter Kit (https://www.reactstarterkit.com/)
   *
   * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */
  
  var App = function (_Component) {
    (0, _inherits3.default)(App, _Component);
  
    function App() {
      (0, _classCallCheck3.default)(this, App);
      return (0, _possibleConstructorReturn3.default)(this, (App.__proto__ || (0, _getPrototypeOf2.default)(App)).apply(this, arguments));
    }
  
    (0, _createClass3.default)(App, [{
      key: 'getChildContext',
      value: function getChildContext() {
        var context = this.props.context;
        return {
          insertCss: context.insertCss || _emptyFunction2.default,
          setTitle: context.setTitle || _emptyFunction2.default,
          setMeta: context.setMeta || _emptyFunction2.default
        };
      }
    }, {
      key: 'componentWillMount',
      value: function componentWillMount() {
        var insertCss = this.props.context.insertCss;
  
        this.removeCss = insertCss(_App2.default);
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
  
        this.removeCss();
      }
    }, {
      key: 'render',
      value: function render() {
        // console.log('\n********\n', this.props, '\n********12334\n');
        return this.props.children;
      }
    }]);
    return App;
  }(_react.Component);
  
  App.propTypes = {
    context: _react.PropTypes.shape({
      insertCss: _react.PropTypes.func,
      setTitle: _react.PropTypes.func,
      setMeta: _react.PropTypes.func
    }),
    children: _react.PropTypes.element.isRequired,
    error: _react.PropTypes.object
  };
  App.childContextTypes = {
    insertCss: _react.PropTypes.func.isRequired,
    setTitle: _react.PropTypes.func.isRequired,
    setMeta: _react.PropTypes.func.isRequired
  };
  exports.default = App;

/***/ }),
/* 54 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/core-js/object/get-prototype-of");

/***/ }),
/* 55 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/helpers/classCallCheck");

/***/ }),
/* 56 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/helpers/createClass");

/***/ }),
/* 57 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/helpers/possibleConstructorReturn");

/***/ }),
/* 58 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/helpers/inherits");

/***/ }),
/* 59 */
/***/ (function(module, exports) {

  module.exports = require("fbjs/lib/emptyFunction");

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

  
      var content = __webpack_require__(61);
      var insertCss = __webpack_require__(40);
  
      if (typeof content === 'string') {
        content = [[module.id, content, '']];
      }
  
      module.exports = content.locals || {};
      module.exports._getCss = function() { return content.toString(); };
      module.exports._insertCss = function(options) { return insertCss(content, options) };
    
      // Hot Module Replacement
      // https://webpack.github.io/docs/hot-module-replacement
      // Only activated in browser context
      if (false) {
        var removeCss = function() {};
        module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true,\"modules\":true,\"localIdentName\":\"[name]_[local]_[hash:base64:3]\",\"minimize\":false}!../../../node_modules/postcss-loader/index.js?pack=default!./App.css", function() {
          content = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true,\"modules\":true,\"localIdentName\":\"[name]_[local]_[hash:base64:3]\",\"minimize\":false}!../../../node_modules/postcss-loader/index.js?pack=default!./App.css");
  
          if (typeof content === 'string') {
            content = [[module.id, content, '']];
          }
  
          removeCss = insertCss(content, { replace: true });
        });
        module.hot.dispose(function() { removeCss(); });
      }
    

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

  exports = module.exports = __webpack_require__(39)();
  // imports
  
  
  // module
  exports.push([module.id, "/**\n * React Starter Kit (https://www.reactstarterkit.com/)\n *\n * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE.txt file in the root directory of this source tree.\n */\n\n/*! normalize.css v4.1.1 | MIT License | github.com/necolas/normalize.css */\n\n/**\n * 1. Change the default font family in all browsers (opinionated).\n * 2. Correct the line height in all browsers.\n * 3. Prevent adjustments of font size after orientation changes in IE and iOS.\n */\n\nhtml {\n  font-family: sans-serif; /* 1 */\n  line-height: 1.15; /* 2 */\n  -ms-text-size-adjust: 100%; /* 3 */\n  -webkit-text-size-adjust: 100%; /* 3 */\n}\n\n/**\n * Remove the margin in all browsers (opinionated).\n */\n\nbody {\n  margin: 0;\n}\n\n/* HTML5 display definitions\n   ========================================================================== */\n\n/**\n * Add the correct display in IE 9-.\n * 1. Add the correct display in Edge, IE, and Firefox.\n * 2. Add the correct display in IE.\n */\n\narticle,\naside,\ndetails, /* 1 */\nfigcaption,\nfigure,\nfooter,\nheader,\nmain, /* 2 */\nmenu,\nnav,\nsection,\nsummary { /* 1 */\n  display: block;\n}\n\n/**\n * Add the correct display in IE 9-.\n */\n\naudio,\ncanvas,\nprogress,\nvideo {\n  display: inline-block;\n}\n\n/**\n * Add the correct display in iOS 4-7.\n */\n\naudio:not([controls]) {\n  display: none;\n  height: 0;\n}\n\n/**\n * Add the correct vertical alignment in Chrome, Firefox, and Opera.\n */\n\nprogress {\n  vertical-align: baseline;\n}\n\n/**\n * Add the correct display in IE 10-.\n * 1. Add the correct display in IE.\n */\n\ntemplate, /* 1 */\n[hidden] {\n  display: none;\n}\n\n/* Links\n   ========================================================================== */\n\n/**\n * 1. Remove the gray background on active links in IE 10.\n * 2. Remove gaps in links underline in iOS 8+ and Safari 8+.\n */\n\na {\n  background-color: transparent; /* 1 */\n  -webkit-text-decoration-skip: objects; /* 2 */\n}\n\n/**\n * Remove the outline on focused links when they are also active or hovered\n * in all browsers (opinionated).\n */\n\na:active,\na:hover {\n  outline-width: 0;\n}\n\n/* Text-level semantics\n   ========================================================================== */\n\n/**\n * 1. Remove the bottom border in Firefox 39-.\n * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari.\n */\n\nabbr[title] {\n  border-bottom: none; /* 1 */\n  text-decoration: underline; /* 2 */\n  text-decoration: underline dotted; /* 2 */\n}\n\n/**\n * Prevent the duplicate application of `bolder` by the next rule in Safari 6.\n */\n\nb,\nstrong {\n  font-weight: inherit;\n}\n\n/**\n * Add the correct font weight in Chrome, Edge, and Safari.\n */\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\n/**\n * Add the correct font style in Android 4.3-.\n */\n\ndfn {\n  font-style: italic;\n}\n\n/**\n * Correct the font size and margin on `h1` elements within `section` and\n * `article` contexts in Chrome, Firefox, and Safari.\n */\n\nh1 {\n  font-size: 2em;\n  margin: 0.67em 0;\n}\n\n/**\n * Add the correct background and color in IE 9-.\n */\n\nmark {\n  background-color: #ff0;\n  color: #000;\n}\n\n/**\n * Add the correct font size in all browsers.\n */\n\nsmall {\n  font-size: 80%;\n}\n\n/**\n * Prevent `sub` and `sup` elements from affecting the line height in\n * all browsers.\n */\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\nsup {\n  top: -0.5em;\n}\n\n/* Embedded content\n   ========================================================================== */\n\n/**\n * Remove the border on images inside links in IE 10-.\n */\n\nimg {\n  border-style: none;\n}\n\n/**\n * Hide the overflow in IE.\n */\n\nsvg:not(:root) {\n  overflow: hidden;\n}\n\n/* Grouping content\n   ========================================================================== */\n\n/**\n * 1. Correct the inheritance and scaling of font size in all browsers.\n * 2. Correct the odd `em` font sizing in all browsers.\n */\n\ncode,\nkbd,\npre,\nsamp {\n  font-family: monospace, monospace; /* 1 */\n  font-size: 1em; /* 2 */\n}\n\n/**\n * Add the correct margin in IE 8.\n */\n\nfigure {\n  margin: 1em 40px;\n}\n\n/**\n * 1. Add the correct box sizing in Firefox.\n * 2. Show the overflow in Edge and IE.\n */\n\nhr {\n  -webkit-box-sizing: content-box;\n          box-sizing: content-box; /* 1 */\n  height: 0; /* 1 */\n  overflow: visible; /* 2 */\n}\n\n/* Forms\n   ========================================================================== */\n\n/**\n * 1. Change font properties to `inherit` in all browsers (opinionated).\n * 2. Remove the margin in Firefox and Safari.\n */\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font: inherit; /* 1 */\n  margin: 0; /* 2 */\n}\n\n/**\n * Restore the font weight unset by the previous rule.\n */\n\noptgroup {\n  font-weight: bold;\n}\n\n/**\n * Show the overflow in IE.\n * 1. Show the overflow in Edge.\n */\n\nbutton,\ninput { /* 1 */\n  overflow: visible;\n}\n\n/**\n * Remove the inheritance of text transform in Edge, Firefox, and IE.\n * 1. Remove the inheritance of text transform in Firefox.\n */\n\nbutton,\nselect { /* 1 */\n  text-transform: none;\n}\n\n/**\n * 1. Prevent a WebKit bug where (2) destroys native `audio` and `video`\n *    controls in Android 4.\n * 2. Correct the inability to style clickable types in iOS and Safari.\n */\n\nbutton,\nhtml [type=\"button\"], /* 1 */\n[type=\"reset\"],\n[type=\"submit\"] {\n  -webkit-appearance: button; /* 2 */\n}\n\n/**\n * Remove the inner border and padding in Firefox.\n */\n\nbutton::-moz-focus-inner,\n[type=\"button\"]::-moz-focus-inner,\n[type=\"reset\"]::-moz-focus-inner,\n[type=\"submit\"]::-moz-focus-inner {\n  border-style: none;\n  padding: 0;\n}\n\n/**\n * Restore the focus styles unset by the previous rule.\n */\n\nbutton:-moz-focusring,\n[type=\"button\"]:-moz-focusring,\n[type=\"reset\"]:-moz-focusring,\n[type=\"submit\"]:-moz-focusring {\n  outline: 1px dotted ButtonText;\n}\n\n/**\n * Change the border, margin, and padding in all browsers (opinionated).\n */\n\nfieldset {\n  border: 1px solid #c0c0c0;\n  margin: 0 2px;\n  padding: 0.35em 0.625em 0.75em;\n}\n\n/**\n * 1. Correct the text wrapping in Edge and IE.\n * 2. Correct the color inheritance from `fieldset` elements in IE.\n * 3. Remove the padding so developers are not caught out when they zero out\n *    `fieldset` elements in all browsers.\n */\n\nlegend {\n  -webkit-box-sizing: border-box;\n          box-sizing: border-box; /* 1 */\n  color: inherit; /* 2 */\n  display: table; /* 1 */\n  max-width: 100%; /* 1 */\n  padding: 0; /* 3 */\n  white-space: normal; /* 1 */\n}\n\n/**\n * Remove the default vertical scrollbar in IE.\n */\n\ntextarea {\n  overflow: auto;\n}\n\n/**\n * 1. Add the correct box sizing in IE 10-.\n * 2. Remove the padding in IE 10-.\n */\n\n[type=\"checkbox\"],\n[type=\"radio\"] {\n  -webkit-box-sizing: border-box;\n          box-sizing: border-box; /* 1 */\n  padding: 0; /* 2 */\n}\n\n/**\n * Correct the cursor style of increment and decrement buttons in Chrome.\n */\n\n[type=\"number\"]::-webkit-inner-spin-button,\n[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto;\n}\n\n/**\n * 1. Correct the odd appearance in Chrome and Safari.\n * 2. Correct the outline style in Safari.\n */\n\n[type=\"search\"] {\n  -webkit-appearance: textfield; /* 1 */\n  outline-offset: -2px; /* 2 */\n}\n\n/**\n * Remove the inner padding and cancel buttons in Chrome and Safari on OS X.\n */\n\n[type=\"search\"]::-webkit-search-cancel-button,\n[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n/**\n * Correct the text style of placeholders in Chrome, Edge, and Safari.\n */\n\n::-webkit-input-placeholder {\n  color: inherit;\n  opacity: 0.54;\n}\n\n/**\n * 1. Correct the inability to style clickable types in iOS and Safari.\n * 2. Change font properties to `inherit` in Safari.\n */\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button; /* 1 */\n  font: inherit; /* 2 */\n}\n\n/*! React Starter Kit | MIT License | https://www.reactstarterkit.com/ */\n\n/**\n * React Starter Kit (https://www.reactstarterkit.com/)\n *\n * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE.txt file in the root directory of this source tree.\n */\n\n:root {\n  /*\n   * Typography\n   * ======================================================================== */\n\n  /*\n   * Layout\n   * ======================================================================== */\n\n  /*\n   * Media queries breakpoints\n   * ======================================================================== */  /* Extra small screen / phone */  /* Small screen / tablet */  /* Medium screen / desktop */ /* Large screen / wide desktop */\n}\n\n/*\n * Base styles\n * ========================================================================== */\n\nhtml {\n  color: #222;\n  font-size: 1em; /* ~16px; */\n  font-family: 'Segoe UI', 'HelveticaNeue-Light', sans-serif;\n  line-height: 1.375; /* ~22px */\n}\n\na {\n  color: #0074c2;\n}\n\n/*\n * Remove text-shadow in selection highlight:\n * https://twitter.com/miketaylr/status/12228805301\n *\n * These selection rule sets have to be separate.\n * Customize the background color to match your design.\n */\n\n::-moz-selection {\n  background: #b3d4fc;\n  text-shadow: none;\n}\n\n::selection {\n  background: #b3d4fc;\n  text-shadow: none;\n}\n\n/*\n * A better looking default horizontal rule\n */\n\nhr {\n  display: block;\n  height: 1px;\n  border: 0;\n  border-top: 1px solid #ccc;\n  margin: 1em 0;\n  padding: 0;\n}\n\n/*\n * Remove the gap between audio, canvas, iframes,\n * images, videos and the bottom of their containers:\n * https://github.com/h5bp/html5-boilerplate/issues/440\n */\n\naudio,\ncanvas,\niframe,\nimg,\nsvg,\nvideo {\n  vertical-align: middle;\n}\n\n/*\n * Remove default fieldset styles.\n */\n\nfieldset {\n  border: 0;\n  margin: 0;\n  padding: 0;\n}\n\n/*\n * Allow only vertical resizing of textareas.\n */\n\ntextarea {\n  resize: vertical;\n}\n\n/*\n * Browser upgrade prompt\n * ========================================================================== */\n\n.browserupgrade {\n  margin: 0.2em 0;\n  background: #ccc;\n  color: #000;\n  padding: 0.2em 0;\n}\n\n/*\n * Print styles\n * Inlined to avoid the additional HTTP request:\n * http://www.phpied.com/delay-loading-your-print-css/\n * ========================================================================== */\n\n@media print {\n  *,\n  *::before,\n  *::after {\n    background: transparent !important;\n    color: #000 !important; /* Black prints faster: http://www.sanbeiji.com/archives/953 */\n    -webkit-box-shadow: none !important;\n            box-shadow: none !important;\n    text-shadow: none !important;\n  }\n\n  a,\n  a:visited {\n    text-decoration: underline;\n  }\n\n  a[href]::after {\n    content: ' (' attr(href) ')';\n  }\n\n  abbr[title]::after {\n    content: ' (' attr(title) ')';\n  }\n\n  /*\n   * Don't show links that are fragment identifiers,\n   * or use the `javascript:` pseudo protocol\n   */\n\n  a[href^='#']::after,\n  a[href^='javascript:']::after {\n    content: '';\n  }\n\n  pre,\n  blockquote {\n    border: 1px solid #999;\n    page-break-inside: avoid;\n  }\n\n  /*\n   * Printing Tables:\n   * http://css-discuss.incutio.com/wiki/Printing_Tables\n   */\n\n  thead {\n    display: table-header-group;\n  }\n\n  tr,\n  img {\n    page-break-inside: avoid;\n  }\n\n  img {\n    max-width: 100% !important;\n  }\n\n  p,\n  h2,\n  h3 {\n    orphans: 3;\n    widows: 3;\n  }\n\n  h2,\n  h3 {\n    page-break-after: avoid;\n  }\n}\n", "", {"version":3,"sources":["/./components/App/App.css","/../node_modules/normalize.css/normalize.css","/./components/variables.css"],"names":[],"mappings":"AAAA;;;;;;;GAOG;;ACPH,4EAA4E;;AAE5E;;;;GAIG;;AAEH;EACE,wBAAwB,CAAC,OAAO;EAChC,kBAAkB,CAAC,OAAO;EAC1B,2BAA2B,CAAC,OAAO;EACnC,+BAA+B,CAAC,OAAO;CACxC;;AAED;;GAEG;;AAEH;EACE,UAAU;CACX;;AAED;gFACgF;;AAEhF;;;;GAIG;;AAEH;;;;;;;;;;;UAWU,OAAO;EACf,eAAe;CAChB;;AAED;;GAEG;;AAEH;;;;EAIE,sBAAsB;CACvB;;AAED;;GAEG;;AAEH;EACE,cAAc;EACd,UAAU;CACX;;AAED;;GAEG;;AAEH;EACE,yBAAyB;CAC1B;;AAED;;;GAGG;;AAEH;;EAEE,cAAc;CACf;;AAED;gFACgF;;AAEhF;;;GAGG;;AAEH;EACE,8BAA8B,CAAC,OAAO;EACtC,sCAAsC,CAAC,OAAO;CAC/C;;AAED;;;GAGG;;AAEH;;EAEE,iBAAiB;CAClB;;AAED;gFACgF;;AAEhF;;;GAGG;;AAEH;EACE,oBAAoB,CAAC,OAAO;EAC5B,2BAA2B,CAAC,OAAO;EACnC,kCAAkC,CAAC,OAAO;CAC3C;;AAED;;GAEG;;AAEH;;EAEE,qBAAqB;CACtB;;AAED;;GAEG;;AAEH;;EAEE,oBAAoB;CACrB;;AAED;;GAEG;;AAEH;EACE,mBAAmB;CACpB;;AAED;;;GAGG;;AAEH;EACE,eAAe;EACf,iBAAiB;CAClB;;AAED;;GAEG;;AAEH;EACE,uBAAuB;EACvB,YAAY;CACb;;AAED;;GAEG;;AAEH;EACE,eAAe;CAChB;;AAED;;;GAGG;;AAEH;;EAEE,eAAe;EACf,eAAe;EACf,mBAAmB;EACnB,yBAAyB;CAC1B;;AAED;EACE,gBAAgB;CACjB;;AAED;EACE,YAAY;CACb;;AAED;gFACgF;;AAEhF;;GAEG;;AAEH;EACE,mBAAmB;CACpB;;AAED;;GAEG;;AAEH;EACE,iBAAiB;CAClB;;AAED;gFACgF;;AAEhF;;;GAGG;;AAEH;;;;EAIE,kCAAkC,CAAC,OAAO;EAC1C,eAAe,CAAC,OAAO;CACxB;;AAED;;GAEG;;AAEH;EACE,iBAAiB;CAClB;;AAED;;;GAGG;;AAEH;EACE,gCAAwB;UAAxB,wBAAwB,CAAC,OAAO;EAChC,UAAU,CAAC,OAAO;EAClB,kBAAkB,CAAC,OAAO;CAC3B;;AAED;gFACgF;;AAEhF;;;GAGG;;AAEH;;;;;EAKE,cAAc,CAAC,OAAO;EACtB,UAAU,CAAC,OAAO;CACnB;;AAED;;GAEG;;AAEH;EACE,kBAAkB;CACnB;;AAED;;;GAGG;;AAEH;QACQ,OAAO;EACb,kBAAkB;CACnB;;AAED;;;GAGG;;AAEH;SACS,OAAO;EACd,qBAAqB;CACtB;;AAED;;;;GAIG;;AAEH;;;;EAIE,2BAA2B,CAAC,OAAO;CACpC;;AAED;;GAEG;;AAEH;;;;EAIE,mBAAmB;EACnB,WAAW;CACZ;;AAED;;GAEG;;AAEH;;;;EAIE,+BAA+B;CAChC;;AAED;;GAEG;;AAEH;EACE,0BAA0B;EAC1B,cAAc;EACd,+BAA+B;CAChC;;AAED;;;;;GAKG;;AAEH;EACE,+BAAuB;UAAvB,uBAAuB,CAAC,OAAO;EAC/B,eAAe,CAAC,OAAO;EACvB,eAAe,CAAC,OAAO;EACvB,gBAAgB,CAAC,OAAO;EACxB,WAAW,CAAC,OAAO;EACnB,oBAAoB,CAAC,OAAO;CAC7B;;AAED;;GAEG;;AAEH;EACE,eAAe;CAChB;;AAED;;;GAGG;;AAEH;;EAEE,+BAAuB;UAAvB,uBAAuB,CAAC,OAAO;EAC/B,WAAW,CAAC,OAAO;CACpB;;AAED;;GAEG;;AAEH;;EAEE,aAAa;CACd;;AAED;;;GAGG;;AAEH;EACE,8BAA8B,CAAC,OAAO;EACtC,qBAAqB,CAAC,OAAO;CAC9B;;AAED;;GAEG;;AAEH;;EAEE,yBAAyB;CAC1B;;AAED;;GAEG;;AAEH;EACE,eAAe;EACf,cAAc;CACf;;AAED;;;GAGG;;AAEH;EACE,2BAA2B,CAAC,OAAO;EACnC,cAAc,CAAC,OAAO;CACvB;;AD1ZD,yEAAyE;;AEXzE;;;;;;;GAOG;;AAEH;EACE;;gFAE8E;;EAI9E;;gFAE8E;;EAI9E;;gFAE8E,EAErD,gCAAgC,EAChC,2BAA2B,EAC3B,6BAA6B,CAC7B,iCAAiC;CAC3D;;AFfD;;gFAEgF;;AAEhF;EACE,YAAY;EACZ,eAAe,CAAC,YAAY;EAC5B,2DAAqC;EACrC,mBAAmB,CAAC,WAAW;CAChC;;AAED;EACE,eAAe;CAChB;;AAED;;;;;;GAMG;;AAEH;EACE,oBAAoB;EACpB,kBAAkB;CACnB;;AAED;EACE,oBAAoB;EACpB,kBAAkB;CACnB;;AAED;;GAEG;;AAEH;EACE,eAAe;EACf,YAAY;EACZ,UAAU;EACV,2BAA2B;EAC3B,cAAc;EACd,WAAW;CACZ;;AAED;;;;GAIG;;AAEH;;;;;;EAME,uBAAuB;CACxB;;AAED;;GAEG;;AAEH;EACE,UAAU;EACV,UAAU;EACV,WAAW;CACZ;;AAED;;GAEG;;AAEH;EACE,iBAAiB;CAClB;;AAED;;gFAEgF;;AAEhF;EACE,gBAAgB;EAChB,iBAAiB;EACjB,YAAY;EACZ,iBAAiB;CAClB;;AAED;;;;gFAIgF;;AAEhF;EACE;;;IAGE,mCAAmC;IACnC,uBAAuB,CAAC,+DAA+D;IACvF,oCAA4B;YAA5B,4BAA4B;IAC5B,6BAA6B;GAC9B;;EAED;;IAEE,2BAA2B;GAC5B;;EAED;IACE,6BAA6B;GAC9B;;EAED;IACE,8BAA8B;GAC/B;;EAED;;;KAGG;;EAEH;;IAEE,YAAY;GACb;;EAED;;IAEE,uBAAuB;IACvB,yBAAyB;GAC1B;;EAED;;;KAGG;;EAEH;IACE,4BAA4B;GAC7B;;EAED;;IAEE,yBAAyB;GAC1B;;EAED;IACE,2BAA2B;GAC5B;;EAED;;;IAGE,WAAW;IACX,UAAU;GACX;;EAED;;IAEE,wBAAwB;GACzB;CACF","file":"App.css","sourcesContent":["/**\n * React Starter Kit (https://www.reactstarterkit.com/)\n *\n * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE.txt file in the root directory of this source tree.\n */\n\n@import '../../../node_modules/normalize.css/normalize.css';\n\n/*! React Starter Kit | MIT License | https://www.reactstarterkit.com/ */\n\n@import '../variables.css';\n\n/*\n * Base styles\n * ========================================================================== */\n\nhtml {\n  color: #222;\n  font-size: 1em; /* ~16px; */\n  font-family: var(--font-family-base);\n  line-height: 1.375; /* ~22px */\n}\n\na {\n  color: #0074c2;\n}\n\n/*\n * Remove text-shadow in selection highlight:\n * https://twitter.com/miketaylr/status/12228805301\n *\n * These selection rule sets have to be separate.\n * Customize the background color to match your design.\n */\n\n::-moz-selection {\n  background: #b3d4fc;\n  text-shadow: none;\n}\n\n::selection {\n  background: #b3d4fc;\n  text-shadow: none;\n}\n\n/*\n * A better looking default horizontal rule\n */\n\nhr {\n  display: block;\n  height: 1px;\n  border: 0;\n  border-top: 1px solid #ccc;\n  margin: 1em 0;\n  padding: 0;\n}\n\n/*\n * Remove the gap between audio, canvas, iframes,\n * images, videos and the bottom of their containers:\n * https://github.com/h5bp/html5-boilerplate/issues/440\n */\n\naudio,\ncanvas,\niframe,\nimg,\nsvg,\nvideo {\n  vertical-align: middle;\n}\n\n/*\n * Remove default fieldset styles.\n */\n\nfieldset {\n  border: 0;\n  margin: 0;\n  padding: 0;\n}\n\n/*\n * Allow only vertical resizing of textareas.\n */\n\ntextarea {\n  resize: vertical;\n}\n\n/*\n * Browser upgrade prompt\n * ========================================================================== */\n\n:global(.browserupgrade) {\n  margin: 0.2em 0;\n  background: #ccc;\n  color: #000;\n  padding: 0.2em 0;\n}\n\n/*\n * Print styles\n * Inlined to avoid the additional HTTP request:\n * http://www.phpied.com/delay-loading-your-print-css/\n * ========================================================================== */\n\n@media print {\n  *,\n  *::before,\n  *::after {\n    background: transparent !important;\n    color: #000 !important; /* Black prints faster: http://www.sanbeiji.com/archives/953 */\n    box-shadow: none !important;\n    text-shadow: none !important;\n  }\n\n  a,\n  a:visited {\n    text-decoration: underline;\n  }\n\n  a[href]::after {\n    content: ' (' attr(href) ')';\n  }\n\n  abbr[title]::after {\n    content: ' (' attr(title) ')';\n  }\n\n  /*\n   * Don't show links that are fragment identifiers,\n   * or use the `javascript:` pseudo protocol\n   */\n\n  a[href^='#']::after,\n  a[href^='javascript:']::after {\n    content: '';\n  }\n\n  pre,\n  blockquote {\n    border: 1px solid #999;\n    page-break-inside: avoid;\n  }\n\n  /*\n   * Printing Tables:\n   * http://css-discuss.incutio.com/wiki/Printing_Tables\n   */\n\n  thead {\n    display: table-header-group;\n  }\n\n  tr,\n  img {\n    page-break-inside: avoid;\n  }\n\n  img {\n    max-width: 100% !important;\n  }\n\n  p,\n  h2,\n  h3 {\n    orphans: 3;\n    widows: 3;\n  }\n\n  h2,\n  h3 {\n    page-break-after: avoid;\n  }\n}\n","/*! normalize.css v4.1.1 | MIT License | github.com/necolas/normalize.css */\n\n/**\n * 1. Change the default font family in all browsers (opinionated).\n * 2. Correct the line height in all browsers.\n * 3. Prevent adjustments of font size after orientation changes in IE and iOS.\n */\n\nhtml {\n  font-family: sans-serif; /* 1 */\n  line-height: 1.15; /* 2 */\n  -ms-text-size-adjust: 100%; /* 3 */\n  -webkit-text-size-adjust: 100%; /* 3 */\n}\n\n/**\n * Remove the margin in all browsers (opinionated).\n */\n\nbody {\n  margin: 0;\n}\n\n/* HTML5 display definitions\n   ========================================================================== */\n\n/**\n * Add the correct display in IE 9-.\n * 1. Add the correct display in Edge, IE, and Firefox.\n * 2. Add the correct display in IE.\n */\n\narticle,\naside,\ndetails, /* 1 */\nfigcaption,\nfigure,\nfooter,\nheader,\nmain, /* 2 */\nmenu,\nnav,\nsection,\nsummary { /* 1 */\n  display: block;\n}\n\n/**\n * Add the correct display in IE 9-.\n */\n\naudio,\ncanvas,\nprogress,\nvideo {\n  display: inline-block;\n}\n\n/**\n * Add the correct display in iOS 4-7.\n */\n\naudio:not([controls]) {\n  display: none;\n  height: 0;\n}\n\n/**\n * Add the correct vertical alignment in Chrome, Firefox, and Opera.\n */\n\nprogress {\n  vertical-align: baseline;\n}\n\n/**\n * Add the correct display in IE 10-.\n * 1. Add the correct display in IE.\n */\n\ntemplate, /* 1 */\n[hidden] {\n  display: none;\n}\n\n/* Links\n   ========================================================================== */\n\n/**\n * 1. Remove the gray background on active links in IE 10.\n * 2. Remove gaps in links underline in iOS 8+ and Safari 8+.\n */\n\na {\n  background-color: transparent; /* 1 */\n  -webkit-text-decoration-skip: objects; /* 2 */\n}\n\n/**\n * Remove the outline on focused links when they are also active or hovered\n * in all browsers (opinionated).\n */\n\na:active,\na:hover {\n  outline-width: 0;\n}\n\n/* Text-level semantics\n   ========================================================================== */\n\n/**\n * 1. Remove the bottom border in Firefox 39-.\n * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari.\n */\n\nabbr[title] {\n  border-bottom: none; /* 1 */\n  text-decoration: underline; /* 2 */\n  text-decoration: underline dotted; /* 2 */\n}\n\n/**\n * Prevent the duplicate application of `bolder` by the next rule in Safari 6.\n */\n\nb,\nstrong {\n  font-weight: inherit;\n}\n\n/**\n * Add the correct font weight in Chrome, Edge, and Safari.\n */\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\n/**\n * Add the correct font style in Android 4.3-.\n */\n\ndfn {\n  font-style: italic;\n}\n\n/**\n * Correct the font size and margin on `h1` elements within `section` and\n * `article` contexts in Chrome, Firefox, and Safari.\n */\n\nh1 {\n  font-size: 2em;\n  margin: 0.67em 0;\n}\n\n/**\n * Add the correct background and color in IE 9-.\n */\n\nmark {\n  background-color: #ff0;\n  color: #000;\n}\n\n/**\n * Add the correct font size in all browsers.\n */\n\nsmall {\n  font-size: 80%;\n}\n\n/**\n * Prevent `sub` and `sup` elements from affecting the line height in\n * all browsers.\n */\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\nsup {\n  top: -0.5em;\n}\n\n/* Embedded content\n   ========================================================================== */\n\n/**\n * Remove the border on images inside links in IE 10-.\n */\n\nimg {\n  border-style: none;\n}\n\n/**\n * Hide the overflow in IE.\n */\n\nsvg:not(:root) {\n  overflow: hidden;\n}\n\n/* Grouping content\n   ========================================================================== */\n\n/**\n * 1. Correct the inheritance and scaling of font size in all browsers.\n * 2. Correct the odd `em` font sizing in all browsers.\n */\n\ncode,\nkbd,\npre,\nsamp {\n  font-family: monospace, monospace; /* 1 */\n  font-size: 1em; /* 2 */\n}\n\n/**\n * Add the correct margin in IE 8.\n */\n\nfigure {\n  margin: 1em 40px;\n}\n\n/**\n * 1. Add the correct box sizing in Firefox.\n * 2. Show the overflow in Edge and IE.\n */\n\nhr {\n  box-sizing: content-box; /* 1 */\n  height: 0; /* 1 */\n  overflow: visible; /* 2 */\n}\n\n/* Forms\n   ========================================================================== */\n\n/**\n * 1. Change font properties to `inherit` in all browsers (opinionated).\n * 2. Remove the margin in Firefox and Safari.\n */\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font: inherit; /* 1 */\n  margin: 0; /* 2 */\n}\n\n/**\n * Restore the font weight unset by the previous rule.\n */\n\noptgroup {\n  font-weight: bold;\n}\n\n/**\n * Show the overflow in IE.\n * 1. Show the overflow in Edge.\n */\n\nbutton,\ninput { /* 1 */\n  overflow: visible;\n}\n\n/**\n * Remove the inheritance of text transform in Edge, Firefox, and IE.\n * 1. Remove the inheritance of text transform in Firefox.\n */\n\nbutton,\nselect { /* 1 */\n  text-transform: none;\n}\n\n/**\n * 1. Prevent a WebKit bug where (2) destroys native `audio` and `video`\n *    controls in Android 4.\n * 2. Correct the inability to style clickable types in iOS and Safari.\n */\n\nbutton,\nhtml [type=\"button\"], /* 1 */\n[type=\"reset\"],\n[type=\"submit\"] {\n  -webkit-appearance: button; /* 2 */\n}\n\n/**\n * Remove the inner border and padding in Firefox.\n */\n\nbutton::-moz-focus-inner,\n[type=\"button\"]::-moz-focus-inner,\n[type=\"reset\"]::-moz-focus-inner,\n[type=\"submit\"]::-moz-focus-inner {\n  border-style: none;\n  padding: 0;\n}\n\n/**\n * Restore the focus styles unset by the previous rule.\n */\n\nbutton:-moz-focusring,\n[type=\"button\"]:-moz-focusring,\n[type=\"reset\"]:-moz-focusring,\n[type=\"submit\"]:-moz-focusring {\n  outline: 1px dotted ButtonText;\n}\n\n/**\n * Change the border, margin, and padding in all browsers (opinionated).\n */\n\nfieldset {\n  border: 1px solid #c0c0c0;\n  margin: 0 2px;\n  padding: 0.35em 0.625em 0.75em;\n}\n\n/**\n * 1. Correct the text wrapping in Edge and IE.\n * 2. Correct the color inheritance from `fieldset` elements in IE.\n * 3. Remove the padding so developers are not caught out when they zero out\n *    `fieldset` elements in all browsers.\n */\n\nlegend {\n  box-sizing: border-box; /* 1 */\n  color: inherit; /* 2 */\n  display: table; /* 1 */\n  max-width: 100%; /* 1 */\n  padding: 0; /* 3 */\n  white-space: normal; /* 1 */\n}\n\n/**\n * Remove the default vertical scrollbar in IE.\n */\n\ntextarea {\n  overflow: auto;\n}\n\n/**\n * 1. Add the correct box sizing in IE 10-.\n * 2. Remove the padding in IE 10-.\n */\n\n[type=\"checkbox\"],\n[type=\"radio\"] {\n  box-sizing: border-box; /* 1 */\n  padding: 0; /* 2 */\n}\n\n/**\n * Correct the cursor style of increment and decrement buttons in Chrome.\n */\n\n[type=\"number\"]::-webkit-inner-spin-button,\n[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto;\n}\n\n/**\n * 1. Correct the odd appearance in Chrome and Safari.\n * 2. Correct the outline style in Safari.\n */\n\n[type=\"search\"] {\n  -webkit-appearance: textfield; /* 1 */\n  outline-offset: -2px; /* 2 */\n}\n\n/**\n * Remove the inner padding and cancel buttons in Chrome and Safari on OS X.\n */\n\n[type=\"search\"]::-webkit-search-cancel-button,\n[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n/**\n * Correct the text style of placeholders in Chrome, Edge, and Safari.\n */\n\n::-webkit-input-placeholder {\n  color: inherit;\n  opacity: 0.54;\n}\n\n/**\n * 1. Correct the inability to style clickable types in iOS and Safari.\n * 2. Change font properties to `inherit` in Safari.\n */\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button; /* 1 */\n  font: inherit; /* 2 */\n}\n","/**\n * React Starter Kit (https://www.reactstarterkit.com/)\n *\n * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE.txt file in the root directory of this source tree.\n */\n\n:root {\n  /*\n   * Typography\n   * ======================================================================== */\n\n  --font-family-base: 'Segoe UI', 'HelveticaNeue-Light', sans-serif;\n\n  /*\n   * Layout\n   * ======================================================================== */\n\n  --max-content-width: 1000px;\n\n  /*\n   * Media queries breakpoints\n   * ======================================================================== */\n\n  --screen-xs-min: 480px;  /* Extra small screen / phone */\n  --screen-sm-min: 768px;  /* Small screen / tablet */\n  --screen-md-min: 992px;  /* Medium screen / desktop */\n  --screen-lg-min: 1200px; /* Large screen / wide desktop */\n}\n"],"sourceRoot":"webpack://"}]);
  
  // exports


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _withStyles = __webpack_require__(36);
  
  var _withStyles2 = _interopRequireDefault(_withStyles);
  
  var _reactBootstrap = __webpack_require__(63);
  
  var _Navbar = __webpack_require__(64);
  
  var _Navbar2 = _interopRequireDefault(_Navbar);
  
  var _history = __webpack_require__(65);
  
  var _history2 = _interopRequireDefault(_history);
  
  var _jquery = __webpack_require__(69);
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _Sidebar = __webpack_require__(70);
  
  var _Sidebar2 = _interopRequireDefault(_Sidebar);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var logo = __webpack_require__(72); /**
                                     * React Starter Kit (https://www.reactstarterkit.com/)
                                     *
                                     * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
                                     *
                                     * This source code is licensed under the MIT license found in the
                                     * LICENSE.txt file in the root directory of this source tree.
                                     */
  
  function Header() {
    return _react2.default.createElement(
      'div',
      { id: 'wrapper', className: 'content' },
      _react2.default.createElement(
        _Navbar2.default,
        { fluid: true, style: { margin: 0 } },
        _react2.default.createElement(
          _Navbar.Brand,
          null,
          _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement(
              'span',
              null,
              '\xA0Pokemon Gym - Escape Velocity '
            ),
            _react2.default.createElement(
              'button',
              { type: 'button', className: 'navbar-toggle', onClick: function onClick() {
                  toggleMenu();
                }, style: { position: 'absolute', right: 0, top: 0 } },
              _react2.default.createElement(
                'span',
                { className: 'sr-only' },
                'Toggle navigation'
              ),
              _react2.default.createElement('span', { className: 'icon-bar' }),
              _react2.default.createElement('span', { className: 'icon-bar' }),
              _react2.default.createElement('span', { className: 'icon-bar' })
            )
          )
        ),
        _react2.default.createElement(
          'ul',
          { className: 'nav navbar-top-links navbar-right' },
          _react2.default.createElement(
            _reactBootstrap.NavDropdown,
            { bsClass: 'dropdown', title: _react2.default.createElement(
                'span',
                null,
                _react2.default.createElement('i', { className: 'fa fa-envelope fa-fw' })
              ), id: 'navDropdown1' },
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { style: { width: 300 }, eventKey: '1' },
              _react2.default.createElement(
                'div',
                null,
                ' ',
                _react2.default.createElement(
                  'strong',
                  null,
                  'John Smith'
                ),
                ' ',
                _react2.default.createElement(
                  'span',
                  { className: 'pull-right text-muted' },
                  ' ',
                  _react2.default.createElement(
                    'em',
                    null,
                    'Yesterday'
                  ),
                  ' '
                ),
                ' '
              ),
              _react2.default.createElement(
                'div',
                null,
                ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend...'
              )
            ),
            _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '2' },
              _react2.default.createElement(
                'div',
                null,
                ' ',
                _react2.default.createElement(
                  'strong',
                  null,
                  'John Smith'
                ),
                ' ',
                _react2.default.createElement(
                  'span',
                  { className: 'pull-right text-muted' },
                  ' ',
                  _react2.default.createElement(
                    'em',
                    null,
                    'Yesterday'
                  ),
                  ' '
                ),
                ' '
              ),
              _react2.default.createElement(
                'div',
                null,
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend...'
              )
            ),
            _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '3' },
              _react2.default.createElement(
                'div',
                null,
                ' ',
                _react2.default.createElement(
                  'strong',
                  null,
                  'John Smith'
                ),
                ' ',
                _react2.default.createElement(
                  'span',
                  { className: 'pull-right text-muted' },
                  ' ',
                  _react2.default.createElement(
                    'em',
                    null,
                    'Yesterday'
                  ),
                  ' '
                ),
                ' '
              ),
              _react2.default.createElement(
                'div',
                null,
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend...'
              )
            ),
            _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '4', className: 'text-center' },
              _react2.default.createElement(
                'strong',
                null,
                'Read All Messages'
              ),
              ' ',
              _react2.default.createElement('i', { className: 'fa fa-angle-right' })
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.NavDropdown,
            { title: _react2.default.createElement(
                'span',
                null,
                _react2.default.createElement('i', { className: 'fa fa-tasks fa-fw' }),
                ' '
              ), id: 'navDropdown2222' },
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '1', style: { width: 300 } },
              _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                  'p',
                  null,
                  ' ',
                  _react2.default.createElement(
                    'strong',
                    null,
                    'Task 1'
                  ),
                  ' ',
                  _react2.default.createElement(
                    'span',
                    { className: 'pull-right text-muted' },
                    '40% Complete'
                  ),
                  ' '
                ),
                _react2.default.createElement(
                  'div',
                  null,
                  _react2.default.createElement(_reactBootstrap.ProgressBar, { bsStyle: 'success', now: 40 })
                )
              )
            ),
            _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '2' },
              _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                  'p',
                  null,
                  ' ',
                  _react2.default.createElement(
                    'strong',
                    null,
                    'Task 2'
                  ),
                  ' ',
                  _react2.default.createElement(
                    'span',
                    { className: 'pull-right text-muted' },
                    '20% Complete'
                  ),
                  ' '
                ),
                _react2.default.createElement(
                  'div',
                  null,
                  _react2.default.createElement(_reactBootstrap.ProgressBar, { bsStyle: 'info', now: 20 })
                )
              )
            ),
            _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '3' },
              _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                  'p',
                  null,
                  ' ',
                  _react2.default.createElement(
                    'strong',
                    null,
                    'Task 3'
                  ),
                  ' ',
                  _react2.default.createElement(
                    'span',
                    { className: 'pull-right text-muted' },
                    '60% Complete'
                  ),
                  ' '
                ),
                _react2.default.createElement(
                  'div',
                  null,
                  _react2.default.createElement(_reactBootstrap.ProgressBar, { bsStyle: 'warning', now: 60 })
                )
              )
            ),
            _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '4' },
              _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                  'p',
                  null,
                  ' ',
                  _react2.default.createElement(
                    'strong',
                    null,
                    'Task 4'
                  ),
                  ' ',
                  _react2.default.createElement(
                    'span',
                    { className: 'pull-right text-muted' },
                    '80% Complete'
                  ),
                  ' '
                ),
                _react2.default.createElement(
                  'div',
                  null,
                  _react2.default.createElement(_reactBootstrap.ProgressBar, { bsStyle: 'danger', now: 80 })
                )
              )
            ),
            _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '5' },
              _react2.default.createElement(
                'strong',
                null,
                'See All Tasks'
              ),
              ' ',
              _react2.default.createElement('i', { className: 'fa fa-angle-right' })
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.NavDropdown,
            { title: _react2.default.createElement('i', { className: 'fa fa-bell fa-fw' }), id: 'navDropdown3' },
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '1', style: { width: 300 } },
              _react2.default.createElement(
                'div',
                null,
                ' ',
                _react2.default.createElement('i', { className: 'fa fa-comment fa-fw' }),
                ' New Comment ',
                _react2.default.createElement(
                  'span',
                  { className: 'pull-right text-muted small' },
                  '4 minutes ago'
                ),
                ' '
              )
            ),
            _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '2' },
              _react2.default.createElement(
                'div',
                null,
                ' ',
                _react2.default.createElement('i', { className: 'fa fa-twitter fa-fw' }),
                ' 3 New Followers ',
                _react2.default.createElement(
                  'span',
                  { className: 'pull-right text-muted small' },
                  '12 minutes ago'
                ),
                ' '
              )
            ),
            _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '3' },
              _react2.default.createElement(
                'div',
                null,
                ' ',
                _react2.default.createElement('i', { className: 'fa fa-envelope fa-fw' }),
                ' Message Sent ',
                _react2.default.createElement(
                  'span',
                  { className: 'pull-right text-muted small' },
                  '4 minutes ago'
                ),
                ' '
              )
            ),
            _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '4' },
              _react2.default.createElement(
                'div',
                null,
                ' ',
                _react2.default.createElement('i', { className: 'fa fa-tasks fa-fw' }),
                ' New Task ',
                _react2.default.createElement(
                  'span',
                  { className: 'pull-right text-muted small' },
                  '4 minutes ago'
                ),
                ' '
              )
            ),
            _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '5' },
              _react2.default.createElement(
                'div',
                null,
                ' ',
                _react2.default.createElement('i', { className: 'fa fa-upload fa-fw' }),
                ' Server Rebooted ',
                _react2.default.createElement(
                  'span',
                  { className: 'pull-right text-muted small' },
                  '4 minutes ago'
                ),
                ' '
              )
            ),
            _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '6' },
              _react2.default.createElement(
                'strong',
                null,
                'See All Alerts'
              ),
              ' ',
              _react2.default.createElement('i', { className: 'fa fa-angle-right' })
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.NavDropdown,
            { title: _react2.default.createElement('i', { className: 'fa fa-user fa-fw' }), id: 'navDropdown4' },
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '1' },
              _react2.default.createElement(
                'span',
                null,
                ' ',
                _react2.default.createElement('i', { className: 'fa fa-user fa-fw' }),
                ' User Profile '
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '2' },
              _react2.default.createElement(
                'span',
                null,
                _react2.default.createElement('i', { className: 'fa fa-gear fa-fw' }),
                ' Settings '
              )
            ),
            _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '3', href: 'http://www.strapui.com' },
              _react2.default.createElement(
                'span',
                null,
                ' ',
                _react2.default.createElement('i', { className: 'fa fa-eye fa-fw' }),
                ' Premium React Themes '
              )
            ),
            _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
            _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { eventKey: '4', onClick: function onClick(event) {
                  _history2.default.push('/login');
                } },
              _react2.default.createElement(
                'span',
                null,
                ' ',
                _react2.default.createElement('i', { className: 'fa fa-sign-out fa-fw' }),
                ' Logout '
              )
            )
          )
        ),
        _react2.default.createElement(_Sidebar2.default, null)
      )
    );
  }
  function toggleMenu() {
    if ((0, _jquery2.default)(".navbar-collapse").hasClass('collapse')) {
      (0, _jquery2.default)(".navbar-collapse").removeClass('collapse');
    } else {
      (0, _jquery2.default)(".navbar-collapse").addClass('collapse');
    }
  }
  
  exports.default = Header;

/***/ }),
/* 63 */
/***/ (function(module, exports) {

  module.exports = require("react-bootstrap");

/***/ }),
/* 64 */
/***/ (function(module, exports) {

  module.exports = require("react-bootstrap/lib/Navbar");

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _createBrowserHistory = __webpack_require__(66);
  
  var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);
  
  var _createMemoryHistory = __webpack_require__(67);
  
  var _createMemoryHistory2 = _interopRequireDefault(_createMemoryHistory);
  
  var _useQueries = __webpack_require__(68);
  
  var _useQueries2 = _interopRequireDefault(_useQueries);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var history = (0, _useQueries2.default)( false ? _createBrowserHistory2.default : _createMemoryHistory2.default)(); /**
                                                                                                                                    * React Starter Kit (https://www.reactstarterkit.com/)
                                                                                                                                    *
                                                                                                                                    * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
                                                                                                                                    *
                                                                                                                                    * This source code is licensed under the MIT license found in the
                                                                                                                                    * LICENSE.txt file in the root directory of this source tree.
                                                                                                                                    */
  
  exports.default = history;

/***/ }),
/* 66 */
/***/ (function(module, exports) {

  module.exports = require("history/lib/createBrowserHistory");

/***/ }),
/* 67 */
/***/ (function(module, exports) {

  module.exports = require("history/lib/createMemoryHistory");

/***/ }),
/* 68 */
/***/ (function(module, exports) {

  module.exports = require("history/lib/useQueries");

/***/ }),
/* 69 */
/***/ (function(module, exports) {

  module.exports = require("jquery");

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _getPrototypeOf = __webpack_require__(54);
  
  var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
  
  var _classCallCheck2 = __webpack_require__(55);
  
  var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
  
  var _createClass2 = __webpack_require__(56);
  
  var _createClass3 = _interopRequireDefault(_createClass2);
  
  var _possibleConstructorReturn2 = __webpack_require__(57);
  
  var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
  
  var _inherits2 = __webpack_require__(58);
  
  var _inherits3 = _interopRequireDefault(_inherits2);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _classnames = __webpack_require__(71);
  
  var _classnames2 = _interopRequireDefault(_classnames);
  
  var _history = __webpack_require__(65);
  
  var _history2 = _interopRequireDefault(_history);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var Sidebar = function (_Component) {
    (0, _inherits3.default)(Sidebar, _Component);
  
    function Sidebar(props) {
      (0, _classCallCheck3.default)(this, Sidebar);
  
      var _this = (0, _possibleConstructorReturn3.default)(this, (Sidebar.__proto__ || (0, _getPrototypeOf2.default)(Sidebar)).call(this, props));
  
      _this.state = {
        uiElementsCollapsed: true,
        chartsElementsCollapsed: true,
        multiLevelDropdownCollapsed: true,
        thirdLevelDropdownCollapsed: true,
        samplePagesCollapsed: true
      };
      return _this;
    }
  
    (0, _createClass3.default)(Sidebar, [{
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          'div',
          { className: 'navbar-default sidebar', style: { marginLeft: '-20px' }, role: 'navigation' },
          _react2.default.createElement(
            'div',
            { className: 'sidebar-nav navbar-collapse collapse category-sidebar' },
            _react2.default.createElement(
              'ul',
              { className: 'nav in', id: 'side-menu' },
              _react2.default.createElement(
                'li',
                null,
                _react2.default.createElement(
                  'a',
                  { href: '', onClick: function onClick(e) {
                      e.preventDefault();_history2.default.push('/');
                    } },
                  _react2.default.createElement('i', { className: 'fa fa-bar-chart-o fa-fw' }),
                  ' \xA0 Paid/Unpaid Carts'
                )
              ),
              _react2.default.createElement(
                'li',
                null,
                _react2.default.createElement(
                  'a',
                  { href: '', onClick: function onClick(e) {
                      e.preventDefault();_history2.default.push('/sessions');
                    } },
                  _react2.default.createElement('i', { className: 'fa fa-table fa-fw' }),
                  ' \xA0 Cart Tracking'
                )
              ),
              _react2.default.createElement(
                'li',
                null,
                _react2.default.createElement(
                  'a',
                  { href: '', onClick: function onClick(e) {
                      e.preventDefault();_history2.default.push('/slackteamstats');
                    } },
                  _react2.default.createElement('i', { className: 'fa fa-users fa-fw' }),
                  ' \xA0 Team Stats'
                )
              ),
              _react2.default.createElement(
                'li',
                null,
                _react2.default.createElement(
                  'a',
                  { href: '', onClick: function onClick(e) {
                      e.preventDefault();_history2.default.push('/sendmessage');
                    } },
                  _react2.default.createElement('i', { className: 'fa fa-comments-o fa-fw' }),
                  ' \xA0 Send Message'
                )
              ),
              _react2.default.createElement(
                'li',
                null,
                _react2.default.createElement(
                  'a',
                  { href: '', onClick: function onClick(e) {
                      e.preventDefault();_history2.default.push('/amazoncsv');
                    } },
                  _react2.default.createElement('i', { className: 'fa fa-upload fa-fw' }),
                  ' \xA0 Upload Amazon CSV'
                )
              )
            )
          )
        );
      }
    }]);
    return Sidebar;
  }(_react.Component);
  
  exports.default = Sidebar;

/***/ }),
/* 71 */
/***/ (function(module, exports) {

  module.exports = require("classnames");

/***/ }),
/* 72 */
/***/ (function(module, exports) {

  module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAmCAYAAACyAQkgAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGODdGMTE3NDA3MjA2ODExODA4M0E3MjY3MTQwRTY5RSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1RTIzNTA3RUM5OEExMUU0QjRCOUUwQTIyNkYzQTlCNiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1RTIzNTA3REM5OEExMUU0QjRCOUUwQTIyNkYzQTlCNiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Rjk3RjExNzQwNzIwNjgxMTgwODNBNzI2NzE0MEU2OUUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Rjg3RjExNzQwNzIwNjgxMTgwODNBNzI2NzE0MEU2OUUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5xbRMYAAAIAklEQVR42qyZC5BNdRzH//9zd++6a1msRwi7SCrPXmZkSjU1pSmPEnrNoEQhjGEKq2xEKZRJHiEkRNIMkple8kiZyGu9GcZrsezL7tp7/n1/Z7+X47rn3mu2/8xnz7nnnP///M7v/3v9/6uNMSo3qFTOFaV8Wnk2A3A7GYem/HkEFKiba5VABo+HMcgleaWNk/p+DG55d0yQP5vzjPo6x1aB6JL2gqQTcJbOK6fBcjAd7IshYH0wALxAQaWdxZgTMOa0Ukg6vL5PtUr2HsAKaasMf4Le9ASLQXWwAMwHl8FAsAtMBIEI/SwwFGSDUXxGxpkDysBUMFKeNTG+NOGqxFCm1p7TNQ6U4OsfwnGHq+9T4AMwEjwOerm0Wwcs4PWTYDD4BhTzfj2wBWOOwXsX8pnoGo3R7gW3gbkuIaWVgVXgbjANtAWbQHvQBPxBIZeClmCeS0hFwaaCyuCRWELEI+hdPG7wuC8vHwJ6g1SwGmyk040GPcEFj76beWyj4p36KK22y3mitfkUdCp/i5bHx+hzLuwdFdJovO1W0J/nQXp42/9r8HgEzeWxRpRnAnSU5mAYp7sW+BbcEqVfatg74hDUGC9O8Jge5ZkpoAOYyvPlYChoAuYC7dGvAY/HYgWoazaqPePTQR5bq+tvJ1GTEpJep739CboBHzgE9oMnwfvgY3CZhFoLZ0ytspXSFXamw+AU6AD6gvtBK2aoFIYXaTU5/ZHaO4wMknKPg92MIk8w3+yuiNcHGN+eB9X4ew7vFYGjFE5U8SXYw+v5dCZJFFVAY6ZPSZDHGLbuAa9wLNvSesr2QrPkYlCvu2LUpZAAkrEaoga4IxBZ0FRO5SB6snzxeQq6iNN4kFMuGWUlUvWrutx6fM50loebU0pSJxKDT8bQaiiuLWZ/SQj9wAhwMVGrZ9bn2l0h2AU8N5sh7rTk6E41LAhq3eD1z1IzkzilnzLEPMj7aUyR8jETHQ0aNaKKz6l8bodfyBRuB+twfSfS8uFqPlUVxzH4LSaUychwiBqW1h2aaOb36axAgr6MwmgkyAYDpEhKpN+4Bc1iNSTTPIZT9hbT5l7wCx2jHq/Xx8vHlRpzsE9tS92VrCfiXEJSO8nzmML2df1qdGYDqxAfUhgst9NEji2z04P2v5HHTKbqN0Ap+Jxp2+fY6Hlk7P2XzYAE7aS7XfKFIDuCScg0P8wiRIqRAyzxFPqqgqBJ10rLR23l8znQwmbMWsifJee/RpMpYJyd6RQ715pEhBliTmJmGLf38VKTc7xUj7T2FJlaWwvMGL+lc3Czk4eQigXISTpBGm2tUG74IUzzZL3aVkY+5F3ej9Sy6Hz9KOBij+ckXXeBTDsg3/Ct+XYLC1LfB2OuC/uaxdDh1aSw+Irnf9OxrraGSVqE+AKMlaIYEX6hT5n0sDF+A9/xfCVNyqsVwHanwUwt2OlDbhvVccRU7TqGP1/CMCS2PV5r3R3h5ue8oEqzdMQxrJt4n/PwVk6pTEejKJ3SXLFP4uBLHs/JWioTmnji7BWTsbfIPOy/JmhH0JXnncGdUd5XhUlCYvKvFlNfFoP3GnCHR8fO9Pj57DM6lJUQR60iaE5fr+UEGTzJUsWuLC4eb9NEJAW/6PGuuuAHFtwfSeYKqV86vscv3EY7C6+WXnalw+nMMIORVdSFMpW0JtfekqC1xOBlYC1i9bo6fr2xSUCvL7Wdfj2Z6STNDnUWd+URIMn1DomtA8FOal8y3ijHBjbl2WrGaRshxtFHF1z7jBnpEh1mrmN/WMTh/hqGpuqMrzVxvVWKTx0sstVL0OwzeEayUjGc8ydEg9lVfSo/t0xVw71/cK8e64R9TjIxyH5aPcZ03IerBCkLL3IdNqsEHXukWTek0O/Bz4x3shh7k1xw1Y13sip62/kQrSbDYbpY5eeL3MWYaPKs7UTssbiXTnPZx8AeWj8tw6NVS4LGh1k4h+fGU1lnHA+FoGX46nCNhq8+O7Io6YmvD7juF1MLTVnYzGPqlYxyhfVBIqe1ASt/P4WsR0cJ7WoEsVRf+WiqXppeySlK8t1CSGHSrFL06kmE+RH8ztR5ik7XjkaewUySwimL1QqYnrOZATewbGxvGzO8TWXrWOvkitWjjWk3C+jx83ndT633ojOeZ54u4bjyoZ+AZq7CuThsySw7KA9wpXss9lLEe4khNOXx37DrpSAPzAQzQBqXI6vACtAcNAOrQSa4CIrDxtjFY/P4liKhZUjk3NTgaiD3zl3DqJVB1MwJMJmFS1/lLcVx5rhG/8dSpFocK8VimsB6CmgzTnYPea9Hy4tjhevaJIsy8y5dxKoFJA3Pdo27JGwLyHuj0CgTa5fMSXOonpyaMpIo6H82eG3TK1rrS4fJpYYH08HGRekjaVv2Zc9YMdSQ0CZFq0kZvogr5SRc21agds85YysUFg96rDKlWv+QqU9qgKc53euYlluyqjoXoW/7YgT0bmnWjpbJMaZehKkFS63pu5EqUDdS4F+mPBP1CduiSeQafjuF3MadvC2soCTsrAXPMXe/6lonhbaAhmDaC1IsJxtWbEsHQpZgsEzgB7+CRWABOABWgAwwAXTgtZB954CngAhTGcwGR8ASMBf8BW4FWbH2RuPyelTqytL2Uqs8fE1wlWYnuUqdzjDktfU/jXtQ/dm3B++dKa++zGdxVezGRHe3QgSaU6VXw2yAqdMwXhbd5KacnzssUgMcxSD58o+G2jCiVF/0jv8JMABBEldD7PKL3QAAAABJRU5ErkJggg=="

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _Home = __webpack_require__(74);
  
  var _Home2 = _interopRequireDefault(_Home);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  // import fetch from '../../core/fetch';
  
  /**
   * React Starter Kit (https://www.reactstarterkit.com/)
   *
   * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */
  
  exports.default = {
  
    path: '/',
  
    action: function action() {
      return _react2.default.createElement(_Home2.default, null);
    }
  };

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _defineProperty2 = __webpack_require__(75);
  
  var _defineProperty3 = _interopRequireDefault(_defineProperty2);
  
  var _getPrototypeOf = __webpack_require__(54);
  
  var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
  
  var _classCallCheck2 = __webpack_require__(55);
  
  var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
  
  var _createClass2 = __webpack_require__(56);
  
  var _createClass3 = _interopRequireDefault(_createClass2);
  
  var _possibleConstructorReturn2 = __webpack_require__(57);
  
  var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
  
  var _inherits2 = __webpack_require__(58);
  
  var _inherits3 = _interopRequireDefault(_inherits2);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _withStyles = __webpack_require__(36);
  
  var _withStyles2 = _interopRequireDefault(_withStyles);
  
  var _reactBootstrap = __webpack_require__(63);
  
  var _moment = __webpack_require__(76);
  
  var _moment2 = _interopRequireDefault(_moment);
  
  var _reactDatepicker = __webpack_require__(77);
  
  var _reactDatepicker2 = _interopRequireDefault(_reactDatepicker);
  
  var _reactApollo = __webpack_require__(78);
  
  var _Graphs = __webpack_require__(79);
  
  var _Table = __webpack_require__(82);
  
  var _graphqlOperations = __webpack_require__(84);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var Home = function (_Component) {
    (0, _inherits3.default)(Home, _Component);
  
    function Home(props) {
      (0, _classCallCheck3.default)(this, Home);
  
      var _this = (0, _possibleConstructorReturn3.default)(this, (Home.__proto__ || (0, _getPrototypeOf2.default)(Home)).call(this, props));
  
      _this.state = {
        view: 'Store',
        purchased: true,
        startDate: (0, _moment2.default)().subtract(6, 'month'),
        endDate: (0, _moment2.default)()
      };
      _this.changeStart = _this.changeStart.bind(_this);
      _this.changeEnd = _this.changeEnd.bind(_this);
      _this.changeCart = _this.changeCart.bind(_this);
      return _this;
    }
  
    // these could all be refactored into one vvv
  
  
    (0, _createClass3.default)(Home, [{
      key: 'changeStart',
      value: function changeStart(date) {
        this.setState({
          startDate: date
        });
      }
    }, {
      key: 'changeEnd',
      value: function changeEnd(date) {
        this.setState({
          endDate: date
        });
      }
    }, {
      key: 'changeCart',
      value: function changeCart(cart) {
        this.setState({
          view: cart
        });
      }
    }, {
      key: 'getCurrentQuery',
      value: function getCurrentQuery() {
        var queryHandler = {
          cafe: _graphqlOperations.deliveryQuery,
          store: _graphqlOperations.cartsQuery
        };
        return queryHandler[this.state.view.toLowerCase()];
      }
    }, {
      key: 'changeState',
      value: function changeState(value) {
        this.setState(value);
      }
    }, {
      key: 'render',
      value: function render() {
        var self = this;
  
        var graphqlOptions = {
          variables: (0, _defineProperty3.default)({
            startDate: self.state.startDate,
            endDate: self.state.endDate,
            purchased: self.state.purchased,
            view: self.state.view
          }, 'purchased', self.state.purchased)
        };
  
        var currentQuery = this.getCurrentQuery();
        var gqlWrapper = (0, _reactApollo.graphql)(currentQuery, {
          options: graphqlOptions
        });
  
        var TableWithData = gqlWrapper(getCurrentTable);
        var GraphWithData = gqlWrapper(getCurrentGraph);
  
        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            _reactBootstrap.ButtonToolbar,
            null,
            _react2.default.createElement(
              _reactBootstrap.Button,
              {
                bsStyle: self.state.purchased === true ? 'primary' : 'default',
                onClick: function onClick() {
                  return self.changeState({ purchased: true });
                }
              },
              'Paid Carts'
            ),
            _react2.default.createElement(
              _reactBootstrap.Button,
              {
                bsStyle: self.state.purchased === false ? 'primary' : 'default',
                onClick: function onClick() {
                  return self.changeState({ purchased: false });
                }
              },
              'Unpaid Carts'
            )
          ),
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              _reactBootstrap.ButtonToolbar,
              null,
              _react2.default.createElement(
                _reactBootstrap.Button,
                {
                  bsStyle: self.state.view.toLowerCase() === 'store' ? 'primary' : 'default',
                  onClick: function onClick() {
                    return self.changeState({ view: 'Store' });
                  } },
                'Store'
              ),
              _react2.default.createElement(
                _reactBootstrap.Button,
                {
                  bsStyle: self.state.view.toLowerCase() === 'cafe' ? 'primary' : 'default',
                  onClick: function onClick() {
                    return self.changeState({ view: 'Cafe' });
                  } },
                'Cafe'
              )
            )
          ),
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(GraphWithData, null)
          ),
          _react2.default.createElement(
            'div',
            null,
            'Start Date: ',
            _react2.default.createElement(_reactDatepicker2.default, { selected: self.state.startDate, onChange: self.changeStart }),
            'End Date: ',
            _react2.default.createElement(_reactDatepicker2.default, { selected: self.state.endDate, onChange: self.changeEnd })
          ),
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(TableWithData, null)
          )
        );
      }
    }]);
    return Home;
  }(_react.Component);
  
  var getCurrentGraph = function getCurrentGraph(_ref) {
    var data = _ref.data;
  
    if (data.loading) {
      return _react2.default.createElement(
        'p',
        null,
        ' Loading... '
      );
    }
  
    if (data.variables.view.toLowerCase() === 'cafe') {
      return _react2.default.createElement(_Graphs.CafeGraph, { data: data.deliveries });
    }
    if (data.variables.view.toLowerCase() === 'store') {
      return _react2.default.createElement(_Graphs.CartGraph, { data: data.carts.filter(function (c) {
          return c.items.length > 0;
        }) });
    }
  };
  
  var getCurrentTable = function getCurrentTable(_ref2) {
    var data = _ref2.data;
  
    if (data.loading) {
      return _react2.default.createElement(
        'p',
        null,
        ' Loading... '
      );
    }
  
    if (data.variables.view.toLowerCase() === 'cafe') {
      return _react2.default.createElement(_Table.CafeTable, { data: data.deliveries, purchased: data.variables.purchased });
    }
    if (data.variables.view.toLowerCase() === 'store') {
      return _react2.default.createElement(_Table.CartTable, { data: data.carts.filter(function (c) {
          return c.items.length > 0;
        }), purchased: data.variables.purchased });
    }
  };
  
  exports.default = Home;

/***/ }),
/* 75 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/helpers/defineProperty");

/***/ }),
/* 76 */
/***/ (function(module, exports) {

  module.exports = require("moment");

/***/ }),
/* 77 */
/***/ (function(module, exports) {

  module.exports = require("react-datepicker");

/***/ }),
/* 78 */
/***/ (function(module, exports) {

  module.exports = require("react-apollo");

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.CafeGraph = exports.CartGraph = undefined;
  
  var _keys = __webpack_require__(80);
  
  var _keys2 = _interopRequireDefault(_keys);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _lodash = __webpack_require__(48);
  
  var _lodash2 = _interopRequireDefault(_lodash);
  
  var _recharts = __webpack_require__(81);
  
  var _reactBootstrap = __webpack_require__(63);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * transform data to format for recharts graph
   * @param  {object} data - json of data from graphql
   * @param  {string} date_variable - date variable that is grouped on for graphs
   *                                  probably either 'created_date' or 'time_started'
   * @return {array} array that is plotable by recharts
   */
  function transformToArray(data, dateVariable) {
  
    // group carts/deliveries by clean date since thats x axis key
    var groupedByDate = _lodash2.default.groupBy(data, dateVariable);
  
    // keys are using to iterate through json obj
    var dates = (0, _keys2.default)(groupedByDate);
  
    return dates.map(function (d) {
      return groupedByDate[d].reduce(function (prev, curr) {
        if (curr.items.length !== curr.item_count) {
          prev.item_count += curr.items.length;
        } else {
          prev.item_count += curr.item_count;
        }
        prev.cart_total = Number(curr.cart_total.replace(/[^0-9\.]+/g, ""));
        prev.teams.push(_lodash2.default.get(curr, 'team.team_name'));
        return prev;
      }, {
        date: d,
        item_count: 0,
        cart_total: 0,
        teams: []
      });
    });
  }
  
  var CafeGraph = function CafeGraph(_ref) {
    var data = _ref.data;
  
    data = transformToArray(data, 'time_started');
    return _react2.default.createElement(
      _reactBootstrap.Panel,
      { header: _react2.default.createElement(
          'span',
          null,
          _react2.default.createElement('i', { className: 'fa fa-line-chart ' }),
          'Cafe Carts'
        ) },
      _react2.default.createElement(
        'div',
        { className: 'resizable' },
        _react2.default.createElement(
          _recharts.ResponsiveContainer,
          { width: '100%', height: '100%' },
          _react2.default.createElement(
            _recharts.LineChart,
            { data: data, margin: { top: 10, right: 30, left: 0, bottom: 0 } },
            _react2.default.createElement(_recharts.XAxis, { dataKey: 'date' }),
            _react2.default.createElement(_recharts.YAxis, null),
            _react2.default.createElement(_recharts.CartesianGrid, { stroke: '#ccc' }),
            _react2.default.createElement(_recharts.Tooltip, null),
            _react2.default.createElement(_recharts.Line, { type: 'monotone', dataKey: 'item_count', stroke: '#00FFFF', fill: '#00FFFF' })
          )
        )
      )
    );
  };
  
  var CartGraph = function CartGraph(_ref2) {
    var data = _ref2.data;
  
    data = transformToArray(data, 'created_date');
    return _react2.default.createElement(
      _reactBootstrap.Panel,
      { header: _react2.default.createElement(
          'span',
          null,
          _react2.default.createElement('i', { className: 'fa fa-line-chart ' }),
          'Store Carts'
        ) },
      _react2.default.createElement(
        'div',
        { className: 'resizable' },
        _react2.default.createElement(
          _recharts.ResponsiveContainer,
          { width: '100%', height: '100%' },
          _react2.default.createElement(
            _recharts.LineChart,
            { data: data, margin: { top: 10, right: 30, left: 0, bottom: 0 } },
            _react2.default.createElement(_recharts.XAxis, { dataKey: 'date' }),
            _react2.default.createElement(_recharts.YAxis, { yAxisId: 'left', orientation: 'left', stroke: '#00FFFF' }),
            _react2.default.createElement(_recharts.YAxis, { yAxisId: 'right', orientation: 'right', stroke: '#ff8000' }),
            _react2.default.createElement(_recharts.CartesianGrid, { stroke: '#ccc' }),
            _react2.default.createElement(_recharts.Tooltip, null),
            _react2.default.createElement(_recharts.Line, { type: 'monotone', yAxisId: 'left', dataKey: 'item_count', stroke: '#00FFFF', fill: '#00FFFF' }),
            _react2.default.createElement(_recharts.Line, { type: 'monotone', yAxisId: 'right', dataKey: 'cart_total', stroke: '#ff8000', fill: '#ff8000' })
          )
        )
      )
    );
  };
  
  exports.CartGraph = CartGraph;
  exports.CafeGraph = CafeGraph;

/***/ }),
/* 80 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/core-js/object/keys");

/***/ }),
/* 81 */
/***/ (function(module, exports) {

  module.exports = require("recharts");

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.CartTable = exports.CafeTable = undefined;
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _reactBootstrapTable = __webpack_require__(83);
  
  var _recharts = __webpack_require__(81);
  
  var _reactBootstrap = __webpack_require__(63);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function nameFormatter(cell, row, property) {
    return cell ? '<p>' + cell[property] + '</p>' : '';
  }
  
  var CafeTable = function CafeTable(_ref) {
    var data = _ref.data,
        purchased = _ref.purchased;
  
    var newData = [];
    for (var i = 0; i < data.length; i++) {
      newData.push(data[i]);
      data[i].cart.map(function (item) {
        if (data[i].order && item.added_to_cart == true) {
          var user = data[i].team.members.find(function (m) {
            return m.id == item.user_id;
          }).name;
          var matched_item = data[i].order.cart.find(function (i) {
            return i.id == item.item.item_id;
          });
          newData.push({
            user: user,
            item_name: matched_item.name,
            item_qty: item.item.item_qty
          });
        }
      });
    }
  
    var panelTitle = _react2.default.createElement(
      'h3',
      null,
      ' ',
      purchased ? 'purchased carts' : 'unpurchased carts',
      ' for cafe '
    );
  
    return _react2.default.createElement(
      _reactBootstrap.Panel,
      { header: panelTitle },
      _react2.default.createElement(
        'div',
        { className: 'resizable' },
        _react2.default.createElement(
          _reactBootstrapTable.BootstrapTable,
          { data: newData, hover: true },
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { isKey: true, dataField: 'time_started' },
            'Created Date'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'team', dataFormat: nameFormatter, formatExtraData: 'team_name' },
            'Group Name'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'type' },
            'Type'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'item_count' },
            'Total Item Count'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'cart_total' },
            'Cart Total'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'chosen_restaurant' },
            'Restaurant'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'user' },
            'User'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'item_name' },
            'Item'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'item_qty' },
            'Item Qty'
          )
        )
      )
    );
  };
  
  //carts{created_date, team{team_name}, type, item_count, cart_total, items{title}}}
  var CartTable = function CartTable(_ref2) {
    var data = _ref2.data,
        purchased = _ref2.purchased;
  
    var newData = [];
    for (var i = 0; i < data.length; i++) {
      newData.push(data[i]);
      if (data[i].items.length > 0) {
        data[i].items.map(function (item) {
          newData.push({
            title: item.title,
            purchased: item.purchased
          });
        });
      }
    }
    var panelTitle = _react2.default.createElement(
      'h3',
      null,
      ' ',
      purchased ? 'purchased carts' : 'unpurchased carts',
      ' for store '
    );
  
    return _react2.default.createElement(
      _reactBootstrap.Panel,
      { header: panelTitle },
      _react2.default.createElement(
        'div',
        { className: 'table-display' },
        _react2.default.createElement(
          _reactBootstrapTable.BootstrapTable,
          { data: newData, bordered: false, scrollTop: 'Top', hover: true },
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { isKey: true, dataField: 'created_date' },
            'Date'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'team', dataFormat: nameFormatter, formatExtraData: 'team_name' },
            'Group Name'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'type', width: '50px' },
            'Type'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'item_count', width: '150px' },
            '#Items'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'cart_total', width: '100px' },
            'Cart Total'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'title' },
            'Product Name'
          )
        )
      )
    );
  };
  // <TableHeaderColumn dataField='team.team_name'>Team ID</TableHeaderColumn>
  
  exports.CafeTable = CafeTable;
  exports.CartTable = CartTable;

/***/ }),
/* 83 */
/***/ (function(module, exports) {

  module.exports = require("react-bootstrap-table");

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.teamDeliveriesQuery = exports.teamCartsQuery = exports.deliveryQuery = exports.cartsQuery = undefined;
  
  var _taggedTemplateLiteral2 = __webpack_require__(85);
  
  var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);
  
  var _templateObject = (0, _taggedTemplateLiteral3.default)(['\nquery ($startDate: String!, $endDate: String!, $purchased: Boolean) {\n  carts(limit: 1000, start_date: $startDate, end_date: $endDate) {\n    created_date,\n    team{team_name},\n    type,\n    item_count,\n    cart_total,\n    items(purchased: $purchased) {title, purchased}\n  }\n}'], ['\nquery ($startDate: String!, $endDate: String!, $purchased: Boolean) {\n  carts(limit: 1000, start_date: $startDate, end_date: $endDate) {\n    created_date,\n    team{team_name},\n    type,\n    item_count,\n    cart_total,\n    items(purchased: $purchased) {title, purchased}\n  }\n}']),
      _templateObject2 = (0, _taggedTemplateLiteral3.default)(['\nquery ($startDate: String!, $endDate: String!, $purchased: Boolean) {\n  deliveries(limit: 10, start_date: $startDate, end_date: $endDate, completed_payment: $purchased) {\n    time_started,\n    team_id,\n    item_count,\n    cart_total,\n    chosen_restaurant,\n    team {\n      team_name,\n      members {\n        name,\n        id\n      }\n    },\n    order,\n    cart,\n    type,\n    items {\n      item_name,\n      user\n    }\n  }\n}'], ['\nquery ($startDate: String!, $endDate: String!, $purchased: Boolean) {\n  deliveries(limit: 10, start_date: $startDate, end_date: $endDate, completed_payment: $purchased) {\n    time_started,\n    team_id,\n    item_count,\n    cart_total,\n    chosen_restaurant,\n    team {\n      team_name,\n      members {\n        name,\n        id\n      }\n    },\n    order,\n    cart,\n    type,\n    items {\n      item_name,\n      user\n    }\n  }\n}']),
      _templateObject3 = (0, _taggedTemplateLiteral3.default)(['\n  query ($team_id: String!){\n    teams(team_id:$team_id){\n      members{id,name,is_admin}, meta{all_channels},carts {_id, slack_id,purchased, created_date, cart_total,item_count, items {title, purchased, price, category, added_by, }}\n    }\n  }'], ['\n  query ($team_id: String!){\n    teams(team_id:$team_id){\n      members{id,name,is_admin}, meta{all_channels},carts {_id, slack_id,purchased, created_date, cart_total,item_count, items {title, purchased, price, category, added_by, }}\n    }\n  }']),
      _templateObject4 = (0, _taggedTemplateLiteral3.default)(['\n  query ($team_id: String!){\n    teams(team_id:$team_id){\n      members{id,name,is_admin}, meta{all_channels},deliveries(limit:100){time_started,chosen_restaurant,cart_total, order, cart}\n    }\n  }'], ['\n  query ($team_id: String!){\n    teams(team_id:$team_id){\n      members{id,name,is_admin}, meta{all_channels},deliveries(limit:100){time_started,chosen_restaurant,cart_total, order, cart}\n    }\n  }']);
  
  var _reactApollo = __webpack_require__(78);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var cartsQuery = exports.cartsQuery = (0, _reactApollo.gql)(_templateObject);
  
  var deliveryQuery = exports.deliveryQuery = (0, _reactApollo.gql)(_templateObject2);
  
  var teamCartsQuery = exports.teamCartsQuery = (0, _reactApollo.gql)(_templateObject3);
  
  var teamDeliveriesQuery = exports.teamDeliveriesQuery = (0, _reactApollo.gql)(_templateObject4);

/***/ }),
/* 85 */
/***/ (function(module, exports) {

  module.exports = require("babel-runtime/helpers/taggedTemplateLiteral");

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _Login = __webpack_require__(87);
  
  var _Login2 = _interopRequireDefault(_Login);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * React Starter Kit (https://www.reactstarterkit.com/)
   *
   * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */
  
  exports.default = {
  
    path: '/',
  
    action: function action() {
      return _react2.default.createElement(_Login2.default, null);
    }
  };
  // import App from '../../components/App';

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _Button = __webpack_require__(88);
  
  var _Button2 = _interopRequireDefault(_Button);
  
  var _Panel = __webpack_require__(89);
  
  var _Panel2 = _interopRequireDefault(_Panel);
  
  var _reactBootstrap = __webpack_require__(63);
  
  var _withStyles = __webpack_require__(36);
  
  var _withStyles2 = _interopRequireDefault(_withStyles);
  
  var _Login = __webpack_require__(90);
  
  var _Login2 = _interopRequireDefault(_Login);
  
  var _history = __webpack_require__(65);
  
  var _history2 = _interopRequireDefault(_history);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  // import { Panel, Input, Button } from 'react-bootstrap';
  var title = 'Log In'; /**
                         * React Starter Kit (https://www.reactstarterkit.com/)
                         *
                         * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
                         *
                         * This source code is licensed under the MIT license found in the
                         * LICENSE.txt file in the root directory of this source tree.
                         */
  
  function submitHandler(e) {
    e.preventDefault();
    _history2.default.push('/');
  }
  
  function Login(props, context) {
    context.setTitle(title);
    return _react2.default.createElement(
      'div',
      { className: 'col-md-4 col-md-offset-4' },
      _react2.default.createElement(
        'div',
        { className: 'text-center' },
        _react2.default.createElement(
          'h1',
          { className: 'login-brand-text' },
          'Pokemon Gym - Gotta cash em all how bow dah'
        ),
        _react2.default.createElement(
          'h3',
          { className: 'text-muted' },
          'Created by ',
          _react2.default.createElement(
            'a',
            { href: 'http://startreact.com' },
            'StartReact.com'
          ),
          ' team'
        )
      ),
      _react2.default.createElement(
        _Panel2.default,
        { header: _react2.default.createElement(
            'h3',
            null,
            'Please Sign In'
          ), className: 'login-panel' },
        _react2.default.createElement(
          'form',
          { role: 'form', onSubmit: function onSubmit(e) {
              submitHandler(e);
            } },
          _react2.default.createElement(
            'fieldset',
            null,
            _react2.default.createElement(
              'div',
              { className: 'form-group' },
              _react2.default.createElement(_reactBootstrap.FormControl, {
                type: 'text',
                className: 'form-control',
                placeholder: 'Username',
                name: 'name'
              })
            ),
            _react2.default.createElement(
              'div',
              { className: 'form-group' },
              _react2.default.createElement(_reactBootstrap.FormControl, {
                className: 'form-control',
                placeholder: 'Password',
                type: 'password',
                name: 'password'
              })
            ),
            _react2.default.createElement(
              _reactBootstrap.Checkbox,
              { label: 'Remember Me' },
              ' Remember Me '
            ),
            _react2.default.createElement(
              _Button2.default,
              { type: 'submit', bsSize: 'large', bsStyle: 'success', block: true },
              'Login'
            )
          )
        )
      )
    );
  }
  
  Login.contextTypes = { setTitle: _react.PropTypes.func.isRequired };
  
  exports.default = (0, _withStyles2.default)(_Login2.default)(Login);

/***/ }),
/* 88 */
/***/ (function(module, exports) {

  module.exports = require("react-bootstrap/lib/Button");

/***/ }),
/* 89 */
/***/ (function(module, exports) {

  module.exports = require("react-bootstrap/lib/Panel");

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

  
      var content = __webpack_require__(91);
      var insertCss = __webpack_require__(40);
  
      if (typeof content === 'string') {
        content = [[module.id, content, '']];
      }
  
      module.exports = content.locals || {};
      module.exports._getCss = function() { return content.toString(); };
      module.exports._insertCss = function(options) { return insertCss(content, options) };
    
      // Hot Module Replacement
      // https://webpack.github.io/docs/hot-module-replacement
      // Only activated in browser context
      if (false) {
        var removeCss = function() {};
        module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true,\"modules\":true,\"localIdentName\":\"[name]_[local]_[hash:base64:3]\",\"minimize\":false}!../../../node_modules/postcss-loader/index.js?pack=default!./Login.css", function() {
          content = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true,\"modules\":true,\"localIdentName\":\"[name]_[local]_[hash:base64:3]\",\"minimize\":false}!../../../node_modules/postcss-loader/index.js?pack=default!./Login.css");
  
          if (typeof content === 'string') {
            content = [[module.id, content, '']];
          }
  
          removeCss = insertCss(content, { replace: true });
        });
        module.hot.dispose(function() { removeCss(); });
      }
    

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

  exports = module.exports = __webpack_require__(39)();
  // imports
  
  
  // module
  exports.push([module.id, "/**\n * React Starter Kit (https://www.reactstarterkit.com/)\n *\n * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE.txt file in the root directory of this source tree.\n */\n/**\n * React Starter Kit (https://www.reactstarterkit.com/)\n *\n * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE.txt file in the root directory of this source tree.\n */\n:root {\n  /*\n   * Typography\n   * ======================================================================== */\n\n  /*\n   * Layout\n   * ======================================================================== */\n\n  /*\n   * Media queries breakpoints\n   * ======================================================================== */  /* Extra small screen / phone */  /* Small screen / tablet */  /* Medium screen / desktop */ /* Large screen / wide desktop */\n}\n.Login_root_rQN {\n  padding-left: 20px;\n  padding-right: 20px;\n}\n.Login_container_2BV {\n  margin: 0 auto;\n  padding: 0 0 40px;\n  max-width: 380px;\n}\n.Login_lead_1mJ {\n  font-size: 1.25em;\n}\n.Login_formGroup_25T {\n  margin-bottom: 15px;\n}\n.Login_label_2G0 {\n  display: inline-block;\n  margin-bottom: 5px;\n  max-width: 100%;\n  font-weight: 700;\n}\n.Login_input_1bT {\n  display: block;\n  -webkit-box-sizing: border-box;\n          box-sizing: border-box;\n  padding: 10px 16px;\n  width: 100%;\n  height: 46px;\n  outline: 0;\n  border: 1px solid #ccc;\n  border-radius: 0;\n  background: #fff;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n          box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  color: #616161;\n  font-size: 18px;\n  line-height: 1.3333333;\n  -webkit-transition: border-color ease-in-out 0.15s, -webkit-box-shadow ease-in-out 0.15s;\n  transition: border-color ease-in-out 0.15s, -webkit-box-shadow ease-in-out 0.15s;\n  -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;\n  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;\n  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s, -webkit-box-shadow ease-in-out 0.15s;\n}\n.Login_input_1bT:focus {\n  border-color: #0074c2;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(0, 116, 194, 0.6);\n          box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(0, 116, 194, 0.6);\n}\n.Login_button_11e {\n  display: block;\n  -webkit-box-sizing: border-box;\n          box-sizing: border-box;\n  margin: 0;\n  padding: 10px 16px;\n  width: 100%;\n  outline: 0;\n  border: 1px solid #373277;\n  border-radius: 0;\n  background: #373277;\n  color: #fff;\n  text-align: center;\n  text-decoration: none;\n  font-size: 18px;\n  line-height: 1.3333333;\n  cursor: pointer;\n}\n.Login_button_11e:hover {\n  background: rgba(54, 50, 119, 0.8);\n}\n.Login_button_11e:focus {\n  border-color: #0074c2;\n  -webkit-box-shadow: 0 0 8px rgba(0, 116, 194, 0.6);\n          box-shadow: 0 0 8px rgba(0, 116, 194, 0.6);\n}\n.Login_facebook_2nZ {\n  border-color: #3b5998;\n  background: #3b5998;\n}\n.Login_facebook_2nZ:hover {\n  background: #2d4373;\n}\n.Login_google_23H {\n  border-color: #dd4b39;\n  background: #dd4b39;\n}\n.Login_google_23H:hover {\n  background: #c23321;\n}\n.Login_twitter_AJd {\n  border-color: #55acee;\n  background: #55acee;\n}\n.Login_twitter_AJd:hover {\n  background: #2795e9;\n}\n.Login_icon_34k {\n  display: inline-block;\n  margin: -2px 12px -2px 0;\n  width: 20px;\n  height: 20px;\n  vertical-align: middle;\n  fill: currentColor;\n}\n.Login_lineThrough_Upb {\n  position: relative;\n  z-index: 1;\n  display: block;\n  margin-bottom: 15px;\n  width: 100%;\n  color: #757575;\n  text-align: center;\n  font-size: 80%;\n}\n.Login_lineThrough_Upb::before {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  z-index: -1;\n  margin-top: -5px;\n  margin-left: -20px;\n  width: 40px;\n  height: 10px;\n  background-color: #fff;\n  content: '';\n}\n.Login_lineThrough_Upb::after {\n  position: absolute;\n  top: 49%;\n  z-index: -2;\n  display: block;\n  width: 100%;\n  border-bottom: 1px solid #ddd;\n  content: '';\n}\n", "", {"version":3,"sources":["/./routes/login/Login.css","/./components/variables.css"],"names":[],"mappings":"AAAA;;;;;;;GAOG;ACPH;;;;;;;GAOG;AAEH;EACE;;gFAE8E;;EAI9E;;gFAE8E;;EAI9E;;gFAE8E,EAErD,gCAAgC,EAChC,2BAA2B,EAC3B,6BAA6B,CAC7B,iCAAiC;CAC3D;ADpBD;EACE,mBAAmB;EACnB,oBAAoB;CACrB;AAED;EACE,eAAe;EACf,kBAAkB;EAClB,iBAAiB;CAClB;AAED;EACE,kBAAkB;CACnB;AAED;EACE,oBAAoB;CACrB;AAED;EACE,sBAAsB;EACtB,mBAAmB;EACnB,gBAAgB;EAChB,iBAAiB;CAClB;AAED;EACE,eAAe;EACf,+BAAuB;UAAvB,uBAAuB;EACvB,mBAAmB;EACnB,YAAY;EACZ,aAAa;EACb,WAAW;EACX,uBAAuB;EACvB,iBAAiB;EACjB,iBAAiB;EACjB,yDAAiD;UAAjD,iDAAiD;EACjD,eAAe;EACf,gBAAgB;EAChB,uBAAuB;EACvB,yFAAyE;EAAzE,iFAAyE;EAAzE,4EAAyE;EAAzE,yEAAyE;EAAzE,+GAAyE;CAC1E;AAED;EACE,sBAAsB;EACtB,yFAAiF;UAAjF,iFAAiF;CAClF;AAED;EACE,eAAe;EACf,+BAAuB;UAAvB,uBAAuB;EACvB,UAAU;EACV,mBAAmB;EACnB,YAAY;EACZ,WAAW;EACX,0BAA0B;EAC1B,iBAAiB;EACjB,oBAAoB;EACpB,YAAY;EACZ,mBAAmB;EACnB,sBAAsB;EACtB,gBAAgB;EAChB,uBAAuB;EACvB,gBAAgB;CACjB;AAED;EACE,mCAAmC;CACpC;AAED;EACE,sBAAsB;EACtB,mDAA2C;UAA3C,2CAA2C;CAC5C;AAED;EACE,sBAAsB;EACtB,oBAAoB;CAErB;AAED;EACE,oBAAoB;CACrB;AAED;EACE,sBAAsB;EACtB,oBAAoB;CAErB;AAED;EACE,oBAAoB;CACrB;AAED;EACE,sBAAsB;EACtB,oBAAoB;CAErB;AAED;EACE,oBAAoB;CACrB;AAED;EACE,sBAAsB;EACtB,yBAAyB;EACzB,YAAY;EACZ,aAAa;EACb,uBAAuB;EACvB,mBAAmB;CACpB;AAED;EACE,mBAAmB;EACnB,WAAW;EACX,eAAe;EACf,oBAAoB;EACpB,YAAY;EACZ,eAAe;EACf,mBAAmB;EACnB,eAAe;CAChB;AAED;EACE,mBAAmB;EACnB,SAAS;EACT,UAAU;EACV,YAAY;EACZ,iBAAiB;EACjB,mBAAmB;EACnB,YAAY;EACZ,aAAa;EACb,uBAAuB;EACvB,YAAY;CACb;AAED;EACE,mBAAmB;EACnB,SAAS;EACT,YAAY;EACZ,eAAe;EACf,YAAY;EACZ,8BAA8B;EAC9B,YAAY;CACb","file":"Login.css","sourcesContent":["/**\n * React Starter Kit (https://www.reactstarterkit.com/)\n *\n * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE.txt file in the root directory of this source tree.\n */\n@import '../../components/variables.css';\n\n.root {\n  padding-left: 20px;\n  padding-right: 20px;\n}\n\n.container {\n  margin: 0 auto;\n  padding: 0 0 40px;\n  max-width: 380px;\n}\n\n.lead {\n  font-size: 1.25em;\n}\n\n.formGroup {\n  margin-bottom: 15px;\n}\n\n.label {\n  display: inline-block;\n  margin-bottom: 5px;\n  max-width: 100%;\n  font-weight: 700;\n}\n\n.input {\n  display: block;\n  box-sizing: border-box;\n  padding: 10px 16px;\n  width: 100%;\n  height: 46px;\n  outline: 0;\n  border: 1px solid #ccc;\n  border-radius: 0;\n  background: #fff;\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  color: #616161;\n  font-size: 18px;\n  line-height: 1.3333333;\n  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;\n}\n\n.input:focus {\n  border-color: #0074c2;\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(0, 116, 194, 0.6);\n}\n\n.button {\n  display: block;\n  box-sizing: border-box;\n  margin: 0;\n  padding: 10px 16px;\n  width: 100%;\n  outline: 0;\n  border: 1px solid #373277;\n  border-radius: 0;\n  background: #373277;\n  color: #fff;\n  text-align: center;\n  text-decoration: none;\n  font-size: 18px;\n  line-height: 1.3333333;\n  cursor: pointer;\n}\n\n.button:hover {\n  background: rgba(54, 50, 119, 0.8);\n}\n\n.button:focus {\n  border-color: #0074c2;\n  box-shadow: 0 0 8px rgba(0, 116, 194, 0.6);\n}\n\n.facebook {\n  border-color: #3b5998;\n  background: #3b5998;\n  composes: button;\n}\n\n.facebook:hover {\n  background: #2d4373;\n}\n\n.google {\n  border-color: #dd4b39;\n  background: #dd4b39;\n  composes: button;\n}\n\n.google:hover {\n  background: #c23321;\n}\n\n.twitter {\n  border-color: #55acee;\n  background: #55acee;\n  composes: button;\n}\n\n.twitter:hover {\n  background: #2795e9;\n}\n\n.icon {\n  display: inline-block;\n  margin: -2px 12px -2px 0;\n  width: 20px;\n  height: 20px;\n  vertical-align: middle;\n  fill: currentColor;\n}\n\n.lineThrough {\n  position: relative;\n  z-index: 1;\n  display: block;\n  margin-bottom: 15px;\n  width: 100%;\n  color: #757575;\n  text-align: center;\n  font-size: 80%;\n}\n\n.lineThrough::before {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  z-index: -1;\n  margin-top: -5px;\n  margin-left: -20px;\n  width: 40px;\n  height: 10px;\n  background-color: #fff;\n  content: '';\n}\n\n.lineThrough::after {\n  position: absolute;\n  top: 49%;\n  z-index: -2;\n  display: block;\n  width: 100%;\n  border-bottom: 1px solid #ddd;\n  content: '';\n}\n","/**\n * React Starter Kit (https://www.reactstarterkit.com/)\n *\n * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE.txt file in the root directory of this source tree.\n */\n\n:root {\n  /*\n   * Typography\n   * ======================================================================== */\n\n  --font-family-base: 'Segoe UI', 'HelveticaNeue-Light', sans-serif;\n\n  /*\n   * Layout\n   * ======================================================================== */\n\n  --max-content-width: 1000px;\n\n  /*\n   * Media queries breakpoints\n   * ======================================================================== */\n\n  --screen-xs-min: 480px;  /* Extra small screen / phone */\n  --screen-sm-min: 768px;  /* Small screen / tablet */\n  --screen-md-min: 992px;  /* Medium screen / desktop */\n  --screen-lg-min: 1200px; /* Large screen / wide desktop */\n}\n"],"sourceRoot":"webpack://"}]);
  
  // exports
  exports.locals = {
  	"root": "Login_root_rQN",
  	"container": "Login_container_2BV",
  	"lead": "Login_lead_1mJ",
  	"formGroup": "Login_formGroup_25T",
  	"label": "Login_label_2G0",
  	"input": "Login_input_1bT",
  	"button": "Login_button_11e",
  	"facebook": "Login_facebook_2nZ Login_button_11e",
  	"google": "Login_google_23H Login_button_11e",
  	"twitter": "Login_twitter_AJd Login_button_11e",
  	"icon": "Login_icon_34k",
  	"lineThrough": "Login_lineThrough_Upb"
  };

/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _team = __webpack_require__(93);
  
  var _team2 = _interopRequireDefault(_team);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = {
  
    path: '/team',
  
    action: function action(context) {
      return _react2.default.createElement(_team2.default, { teamId: context.query.id });
    }
  };

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _stringify = __webpack_require__(1);
  
  var _stringify2 = _interopRequireDefault(_stringify);
  
  var _getPrototypeOf = __webpack_require__(54);
  
  var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
  
  var _classCallCheck2 = __webpack_require__(55);
  
  var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
  
  var _createClass2 = __webpack_require__(56);
  
  var _createClass3 = _interopRequireDefault(_createClass2);
  
  var _possibleConstructorReturn2 = __webpack_require__(57);
  
  var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
  
  var _inherits2 = __webpack_require__(58);
  
  var _inherits3 = _interopRequireDefault(_inherits2);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var Team = function (_Component) {
    (0, _inherits3.default)(Team, _Component);
  
    function Team(props) {
      (0, _classCallCheck3.default)(this, Team);
      return (0, _possibleConstructorReturn3.default)(this, (Team.__proto__ || (0, _getPrototypeOf2.default)(Team)).call(this, props));
    }
  
    (0, _createClass3.default)(Team, [{
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          'div',
          null,
          (0, _stringify2.default)(this.props)
        );
      }
    }]);
    return Team;
  }(_react.Component);
  
  exports.default = Team;

/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _regenerator = __webpack_require__(2);
  
  var _regenerator2 = _interopRequireDefault(_regenerator);
  
  var _stringify = __webpack_require__(1);
  
  var _stringify2 = _interopRequireDefault(_stringify);
  
  var _asyncToGenerator2 = __webpack_require__(5);
  
  var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _slackteamstats = __webpack_require__(95);
  
  var _slackteamstats2 = _interopRequireDefault(_slackteamstats);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = {
  
    path: '/slackteamstats',
  
    action: function action(context) {
      var _this = this;
  
      return (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        var resp, _ref, data;
  
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                resp = void 0;
                _context.next = 3;
                return fetch('/graphql', {
                  method: 'post',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: (0, _stringify2.default)({
                    query: '{teams{team_name, team_id}}'
                  }),
                  credentials: 'include'
                });
  
              case 3:
                resp = _context.sent;
                _context.next = 6;
                return resp.json();
  
              case 6:
                _ref = _context.sent;
                data = _ref.data;
  
                if (!(!data || !data.teams)) {
                  _context.next = 10;
                  break;
                }
  
                throw new Error('Failed to load teams.');
  
              case 10:
                return _context.abrupt('return', _react2.default.createElement(_slackteamstats2.default, { teams: data.teams }));
  
              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this);
      }))();
    }
  };

/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _getPrototypeOf = __webpack_require__(54);
  
  var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
  
  var _classCallCheck2 = __webpack_require__(55);
  
  var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
  
  var _createClass2 = __webpack_require__(56);
  
  var _createClass3 = _interopRequireDefault(_createClass2);
  
  var _possibleConstructorReturn2 = __webpack_require__(57);
  
  var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
  
  var _inherits2 = __webpack_require__(58);
  
  var _inherits3 = _interopRequireDefault(_inherits2);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _PageHeader = __webpack_require__(96);
  
  var _PageHeader2 = _interopRequireDefault(_PageHeader);
  
  var _recharts = __webpack_require__(81);
  
  var _reactBootstrap = __webpack_require__(63);
  
  var _reactApollo = __webpack_require__(78);
  
  var _reactDatepicker = __webpack_require__(77);
  
  var _reactDatepicker2 = _interopRequireDefault(_reactDatepicker);
  
  var _common = __webpack_require__(97);
  
  var _common2 = _interopRequireDefault(_common);
  
  var _vagueTime = __webpack_require__(98);
  
  var _vagueTime2 = _interopRequireDefault(_vagueTime);
  
  var _moment = __webpack_require__(76);
  
  var _moment2 = _interopRequireDefault(_moment);
  
  var _lodash = __webpack_require__(48);
  
  var _lodash2 = _interopRequireDefault(_lodash);
  
  var _graphqlOperations = __webpack_require__(84);
  
  var _Graphs = __webpack_require__(79);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var title = ' Team Stats';
  
  var COLORS = ['#FF0000', '#FF8888', '#0000FF', '#8888FF'];
  
  function sumStoreTeamOrders(teams) {
    var total = 0;
    for (var i = 0; i < teams.length; i++) {
      total += teams[i].carts.length;
    }
    return total;
  }
  
  function sumStoreTeamItems(teams) {
    var totalItems = 0;
    for (var i = 0; i < teams.length; i++) {
      for (var j = 0; j < teams[i].carts.length; j++) {
        totalItems += teams[i].carts[j].items ? teams[i].carts[j].items.length : 0;
      }
    }
    return totalItems;
  }
  
  function sumCafeTeamOrders(teams) {
    var total = 0;
    for (var i = 0; i < teams.length; i++) {
      total += teams[i].deliveries.length;
    }
    return total;
  }
  
  function sumCafeTeamItems(teams) {
    var totalItems = 0;
    for (var i = 0; i < teams.length; i++) {
      for (var j = 0; j < teams[i].deliveries.length; j++) {
        totalItems += teams[i].deliveries[j].cart ? teams[i].deliveries[j].cart.length : 0;
      }
    }
    return totalItems;
  }
  
  function getPieChartTeamStatsData(teams, teamId) {
    // [store item count, store order count, cafe item count, cafe order count]
    var data = [];
    var foundTeam = teamId ? teams.filter(function (t) {
      return t.team_id == teamId;
    }) : null;
    var numStoreItems = teamId ? sumStoreTeamItems(foundTeam) : sumStoreTeamItems(teams);
    var numStoreOrders = teamId ? foundTeam[0].carts.length : sumStoreTeamOrders(teams);
    var numCafeItems = teamId ? sumCafeTeamItems(foundTeam) : sumCafeTeamItems(teams);
    var numCafeOrders = teamId ? foundTeam[0].deliveries.length : sumCafeTeamOrders(teams);
    data.push({ name: '# Store Items', value: numStoreItems });
    data.push({ name: '# Store Orders', value: numStoreOrders });
    data.push({ name: '# Cafe Items', value: numCafeItems });
  
    data.push({ name: '# Cafe Orders', value: numCafeOrders });
    return data;
  }
  
  var displayTeamStats = function (_Component) {
    (0, _inherits3.default)(displayTeamStats, _Component);
  
    function displayTeamStats(props) {
      (0, _classCallCheck3.default)(this, displayTeamStats);
  
      var _this = (0, _possibleConstructorReturn3.default)(this, (displayTeamStats.__proto__ || (0, _getPrototypeOf2.default)(displayTeamStats)).call(this, props));
  
      _this.state = {
        view: 'Store',
        team_id: '',
        startDate: (0, _moment2.default)().subtract(1, 'month'),
        endDate: (0, _moment2.default)()
      };
      _this.changeCart = _this.changeCart.bind(_this);
      _this.changeStart = _this.changeStart.bind(_this);
      _this.changeEnd = _this.changeEnd.bind(_this);
      return _this;
    }
  
    (0, _createClass3.default)(displayTeamStats, [{
      key: 'changeStart',
      value: function changeStart(date) {
        this.setState({
          startDate: date
        });
      }
    }, {
      key: 'changeEnd',
      value: function changeEnd(date) {
        this.setState({
          endDate: date
        });
      }
    }, {
      key: 'changeCart',
      value: function changeCart(cart) {
        this.setState({
          view: cart
        });
      }
    }, {
      key: 'getCurrentQuery',
      value: function getCurrentQuery() {
        var currentQuery = void 0;
        if (this.state.view === 'Cafe') {
          currentQuery = _graphqlOperations.teamDeliveriesQuery;
        } else if (this.state.view === 'Store') {
          currentQuery = _graphqlOperations.teamCartsQuery;
        }
        return currentQuery;
      }
    }, {
      key: 'render',
      value: function render() {
        var self = this;
        var teams = self.props.teams;
        var currentTeam = teams[0];
  
        var currentQuery = this.getCurrentQuery();
        var gqlWrapper = (0, _reactApollo.graphql)(currentQuery, {
          options: {
            variables: {
              team_id: "T02PN3B25" }
          }
        });
        var ViewWithData = gqlWrapper(getCurrentData);
        var TableWithData = gqlWrapper(getCurrentTable);
        var GraphWithData = gqlWrapper(getCurrentGraph);
  
        //Replace 'kip' with currentTeam.team_name
        return _react2.default.createElement(
          'div',
          null,
          'Viewing ',
          self.state.view,
          ' stats of ',
          'kip',
          _react2.default.createElement(
            _reactBootstrap.ButtonToolbar,
            null,
            _react2.default.createElement(
              _reactBootstrap.Button,
              { bsStyle: self.state.view == 'Store' ? "primary" : "default", onClick: function onClick() {
                  return self.changeCart('Store');
                } },
              'Store'
            ),
            _react2.default.createElement(
              _reactBootstrap.Button,
              { bsStyle: self.state.view == 'Cafe' ? "primary" : "default", onClick: function onClick() {
                  return self.changeCart('Cafe');
                } },
              'Cafe'
            )
          ),
          _react2.default.createElement(
            'div',
            null,
            'Start Date: ',
            _react2.default.createElement(_reactDatepicker2.default, { selected: self.state.startDate, onChange: self.changeStart }),
            'End Date: ',
            _react2.default.createElement(_reactDatepicker2.default, { selected: self.state.endDate, onChange: self.changeEnd })
          ),
          _react2.default.createElement(ViewWithData, null),
          _react2.default.createElement(GraphWithData, null),
          _react2.default.createElement(TableWithData, null)
        );
      }
    }]);
    return displayTeamStats;
  }(_react.Component);
  
  var getCurrentGraph = function getCurrentGraph(_ref) {
    var data = _ref.data;
  
    if (data.loading) {
      return _react2.default.createElement(
        'p',
        null,
        ' Loading... '
      );
    }
  
    if (data.teams[0].carts) {
      var team_carts = data.teams[0].carts;
    } else if (data.teams[0].deliveries) {
      var team_deliveries = data.teams[0].deliveries;
    }
    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'h2',
          null,
          'Graph: '
        ),
        ' ',
        data.teams[0].carts ? _react2.default.createElement(_Graphs.CartGraph, { data: data.teams[0].carts }) : 'No graphs for deliveries yet. '
      )
    );
  };
  
  var getCurrentTable = function getCurrentTable(_ref2) {
    var data = _ref2.data;
  
    if (data.loading) {
      return _react2.default.createElement(
        'p',
        null,
        ' Loading... '
      );
    }
    var team_members = data.teams[0].members;
    var team_channels = data.teams[0].meta.all_channels;
  
    if (data.teams[0].carts) {
      var team_carts = data.teams[0].carts;
    } else if (data.teams[0].deliveries) {
      var team_deliveries = data.teams[0].deliveries;
    }
  
    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'h2',
          null,
          'Carts:'
        ),
        ' ',
        data.teams[0].carts ? listCarts(team_carts, team_members) : listDeliveries(team_deliveries, team_members)
      )
    );
  };
  
  var getCurrentData = function getCurrentData(_ref3) {
    var data = _ref3.data;
  
    if (data.loading) {
      return _react2.default.createElement(
        'p',
        null,
        ' Loading... '
      );
    }
    var team_members = data.teams[0].members;
    var team_channels = data.teams[0].meta.all_channels;
  
    if (data.teams[0].carts) {
      var team_carts = data.teams[0].carts;
    } else if (data.teams[0].deliveries) {
      var team_deliveries = data.teams[0].deliveries;
    }
  
    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'h2',
          null,
          'Users:'
        ),
        ' ',
        team_members.length
      ),
      _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'h2',
          null,
          'Admins:'
        ),
        ' ',
        listTeamAdmins(team_members)
      ),
      _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'h2',
          null,
          'Members:'
        ),
        ' ',
        listTeamMembers(team_members),
        ' '
      ),
      _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'h2',
          null,
          'Channels:'
        ),
        ' ',
        listTeamChannels(team_channels)
      )
    );
  };
  
  function listCarts(team_carts, team_members) {
    var newData = [];
    team_carts.map(function (cart) {
      var num_items = cart.item_count;
      if (cart.items && cart.item_count !== cart.items.length) {
        num_items = cart.items.length;
      }
      newData.push({
        created_date: cart.created_date,
        cart_total: cart.cart_total,
        num_items: num_items
      });
      newData = listCartItems(newData, cart.items, team_members);
    });
    return _react2.default.createElement(_common2.default, { heads: [{
        field: 'created_date',
        descrip: 'Start Time',
        allowSort: false
      }, {
        field: 'cart_total',
        descrip: 'Cart Total',
        allowSort: false
      }, {
        field: 'num_items',
        descrip: 'Cart Size',
        allowSort: false
      }, {
        field: 'title',
        descrip: 'Item Name',
        allowSort: false
      }, {
        field: 'price',
        descrip: 'Item Price',
        allowSort: false
      }, {
        field: 'added_by',
        descrip: 'Added By',
        allowSort: false
      }, {
        field: 'purchased',
        descrip: 'Purchased',
        allowSort: false
      }], data: newData });
  }
  
  function listCartItems(newData, items, team_members) {
    items.map(function (item) {
      newData.push({
        title: item.title,
        price: item.price,
        added_by: team_members.find(function (m) {
          return m.id == item.added_by;
        }).name,
        purchased: item.purchased
      });
    });
    return newData;
  }
  
  function listDeliveries(team_deliveries, team_members) {
    var newData = [];
    team_deliveries.map(function (delivery) {
      newData.push({
        time_started: delivery.time_started,
        chosen_restaurant: delivery.chosen_restaurant,
        cart_total: delivery.cart_total
      });
      newData = listDeliveryItems(newData, delivery.cart, delivery.order, team_members);
    });
    return _react2.default.createElement(_common2.default, { heads: [{
        field: 'time_started',
        descrip: 'Start Time',
        allowSort: false
      }, {
        field: 'chosen_restaurant',
        descrip: 'Restaurant',
        allowSort: false
      }, {
        field: 'cart_total',
        descrip: 'Cart Total',
        allowSort: false
      }, {
        field: 'title',
        descrip: 'Item Name',
        allowSort: false
      }, {
        field: 'price',
        descrip: 'Item Price',
        allowSort: false
      }, {
        field: 'user',
        descrip: 'Added By',
        allowSort: false
      }], data: newData });
  }
  
  function listDeliveryItems(newData, cart, order, team_members) {
    if (order) {
      cart.map(function (item) {
        var matched_item = order.cart.find(function (i) {
          return i.id == item.item.item_id || i.id.split("-").pop() == item.item.item_id;
        });
        newData.push({
          user: team_members.find(function (m) {
            return m.id == item.user_id;
          }).name,
          title: matched_item ? matched_item.name : '',
          price: matched_item ? matched_item.price : ''
        });
      });
    }
    return newData;
  }
  
  function listTeamMembers(teamMembers) {
    var memberList = '';
    teamMembers.map(function (member) {
      if (!member.is_admin == true) {
        memberList += " @" + member.name;
      }
    });
    return memberList;
  }
  
  function listTeamAdmins(teamMembers) {
    var memberList = '';
    teamMembers.map(function (member) {
      if (member.is_admin == true) {
        memberList += " @" + member.name;
      }
    });
    return memberList;
  }
  
  function listTeamChannels(teamChannels) {
    var channelList = teamChannels.reduce(function (list, channel) {
      return list + " #" + channel.name;
    }, '');
    return channelList;
  }
  
  exports.default = displayTeamStats;

/***/ }),
/* 96 */
/***/ (function(module, exports) {

  module.exports = require("react-bootstrap/lib/PageHeader");

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _getPrototypeOf = __webpack_require__(54);
  
  var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
  
  var _classCallCheck2 = __webpack_require__(55);
  
  var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
  
  var _createClass2 = __webpack_require__(56);
  
  var _createClass3 = _interopRequireDefault(_createClass2);
  
  var _possibleConstructorReturn2 = __webpack_require__(57);
  
  var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
  
  var _inherits2 = __webpack_require__(58);
  
  var _inherits3 = _interopRequireDefault(_inherits2);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _reactBootstrapTable = __webpack_require__(83);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  // creates a table based on an array of arrays
  // Additionally, if there is a 'colorBy' prop
  // tries to create unique colors
  var Table = function (_React$Component) {
    (0, _inherits3.default)(Table, _React$Component);
  
    function Table() {
      (0, _classCallCheck3.default)(this, Table);
      return (0, _possibleConstructorReturn3.default)(this, (Table.__proto__ || (0, _getPrototypeOf2.default)(Table)).apply(this, arguments));
    }
  
    (0, _createClass3.default)(Table, [{
      key: 'createTableHeaders',
  
  
      // componentDidMount() {
      //   var self = this;
      // }
  
      value: function createTableHeaders(heads) {
        return heads.map(function (head, i) {
          return _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            {
              dataField: head.field,
              isKey: i == 1,
              trClassName: 'table-row',
              dataSort: head.allowSort || head.allowSort === undefined,
              dataFormat: head.dataFormat, sortFunc: head.sort, key: i, search: true, bordered: false },
            head.descrip
          );
        });
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          _reactBootstrapTable.BootstrapTable,
          { ref: 'table', height: '500px', scrollTop: 'Top', data: this.props.data, hover: true },
          this.createTableHeaders(this.props.heads)
        );
      }
    }]);
    return Table;
  }(_react2.default.Component);
  
  exports.default = Table;

/***/ }),
/* 98 */
/***/ (function(module, exports) {

  module.exports = require("vague-time");

/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _regenerator = __webpack_require__(2);
  
  var _regenerator2 = _interopRequireDefault(_regenerator);
  
  var _stringify = __webpack_require__(1);
  
  var _stringify2 = _interopRequireDefault(_stringify);
  
  var _asyncToGenerator2 = __webpack_require__(5);
  
  var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _sessions = __webpack_require__(100);
  
  var _sessions2 = _interopRequireDefault(_sessions);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = {
  
    path: '/sessions',
  
    action: function action(context) {
      var _this = this;
  
      return (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        var resp, _ref, data;
  
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                resp = void 0;
                _context.next = 3;
                return fetch('/graphql', {
                  method: 'post',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: (0, _stringify2.default)({
                    query: '{waypoints(limit:5000){ user_id, delivery_id, waypoint, timestamp, data, user { name, team { team_name, team_id }}}}'
                  }),
                  credentials: 'include'
                });
  
              case 3:
                resp = _context.sent;
                _context.next = 6;
                return resp.json();
  
              case 6:
                _ref = _context.sent;
                data = _ref.data;
  
                if (!(!data || !data.waypoints)) {
                  _context.next = 10;
                  break;
                }
  
                throw new Error('Failed to load waypoints.');
  
              case 10:
                return _context.abrupt('return', _react2.default.createElement(_sessions2.default, { waypoints: data.waypoints, teams: data.teams, teamId: context.query.id, teamName: context.query.teamname }));
  
              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this);
      }))();
    }
  };

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _toConsumableArray2 = __webpack_require__(3);
  
  var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);
  
  var _getPrototypeOf = __webpack_require__(54);
  
  var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
  
  var _classCallCheck2 = __webpack_require__(55);
  
  var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
  
  var _createClass2 = __webpack_require__(56);
  
  var _createClass3 = _interopRequireDefault(_createClass2);
  
  var _possibleConstructorReturn2 = __webpack_require__(57);
  
  var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
  
  var _inherits2 = __webpack_require__(58);
  
  var _inherits3 = _interopRequireDefault(_inherits2);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _recharts = __webpack_require__(81);
  
  var _reactBootstrap = __webpack_require__(63);
  
  var _common = __webpack_require__(97);
  
  var _common2 = _interopRequireDefault(_common);
  
  var _vagueTime = __webpack_require__(98);
  
  var _vagueTime2 = _interopRequireDefault(_vagueTime);
  
  var _lodash = __webpack_require__(48);
  
  var _lodash2 = _interopRequireDefault(_lodash);
  
  var _cafe_waypoints = __webpack_require__(101);
  
  var cafe_waypoints = _interopRequireWildcard(_cafe_waypoints);
  
  var _reactDatepicker = __webpack_require__(77);
  
  var _reactDatepicker2 = _interopRequireDefault(_reactDatepicker);
  
  var _moment = __webpack_require__(76);
  
  var _moment2 = _interopRequireDefault(_moment);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var WaypointHover = function (_Component) {
    (0, _inherits3.default)(WaypointHover, _Component);
  
    function WaypointHover() {
      (0, _classCallCheck3.default)(this, WaypointHover);
      return (0, _possibleConstructorReturn3.default)(this, (WaypointHover.__proto__ || (0, _getPrototypeOf2.default)(WaypointHover)).apply(this, arguments));
    }
  
    (0, _createClass3.default)(WaypointHover, [{
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          'div',
          null,
          this.props.waypoints.map(function (waypoint) {
            if (waypoint.input) {
              return _react2.default.createElement(
                _reactBootstrap.OverlayTrigger,
                { trigger: 'click', rootClose: true, placement: 'top', overlay: createOverlay(waypoint.input) },
                _react2.default.createElement(
                  'a',
                  { href: '#' },
                  waypoint.action
                )
              );
            } else {
              return waypoint.action;
            }
          }).reduce(function (accu, elem) {
            return accu === null ? [elem] : [].concat((0, _toConsumableArray3.default)(accu), [' \u27A1 ', elem]);
          }, null)
        );
      }
    }]);
    return WaypointHover;
  }(_react.Component);
  
  function createOverlay(text) {
    return _react2.default.createElement(
      _reactBootstrap.Popover,
      { id: text.original_text },
      text.original_text
    );
  }
  
  var Session = function (_Component2) {
    (0, _inherits3.default)(Session, _Component2);
  
    function Session(props) {
      (0, _classCallCheck3.default)(this, Session);
  
      var _this2 = (0, _possibleConstructorReturn3.default)(this, (Session.__proto__ || (0, _getPrototypeOf2.default)(Session)).call(this, props));
  
      _this2.state = {
        view: 'Store',
        currentTeam: 'All Team',
        rows: [],
        startDate: (0, _moment2.default)().subtract(1, 'month'),
        endDate: (0, _moment2.default)()
      };
      _this2.renderSessionsLineGraph = _this2.renderSessionsLineGraph.bind(_this2);
      _this2.renderWaypointTable = _this2.renderWaypointTable.bind(_this2);
      _this2.changeCart = _this2.changeCart.bind(_this2);
      _this2.changeStart = _this2.changeStart.bind(_this2);
      _this2.changeEnd = _this2.changeEnd.bind(_this2);
      return _this2;
    }
  
    (0, _createClass3.default)(Session, [{
      key: 'changeStart',
      value: function changeStart(date) {
        this.setState({
          startDate: date
        });
      }
    }, {
      key: 'changeEnd',
      value: function changeEnd(date) {
        this.setState({
          endDate: date
        });
      }
    }, {
      key: 'changeCart',
      value: function changeCart(cart) {
        this.setState({
          view: cart
        });
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        var self = this;
        var rows = [];
        var waypoints = nextProps.waypoints;
        var teamWaypoints = nextProps.teamId ? waypoints.filter(function (waypoint) {
          return waypoint.user ? waypoint.user.team.team_id == nextProps.teamId : false;
        }) : waypoints;
  
        var waypointPaths = self.getWaypointPaths(teamWaypoints);
        for (var i = 0; i < waypointPaths.length; i++) {
          var teamName = waypointPaths[i].team_name;
          rows.push({ time_stamp: new Date(waypointPaths[i].time_stamp.split('.')[0]).toLocaleString(), time_stamp_end: new Date(waypointPaths[i].time_stamp_end.split('.')[0]).toLocaleString(), user_id: waypointPaths[i].user_id, team_name: teamName, actions: self.getWaypointActions(waypointPaths[i]) });
        }
        var currentTeam = nextProps.teamName ? nextProps.teamName : 'All Team';
  
        self.setState({
          view: 'Store',
          currentTeam: currentTeam,
          rows: rows
        });
      }
    }, {
      key: 'componentDidMount',
      value: function componentDidMount() {
        var self = this;
        var rows = [];
        var waypoints = self.props.waypoints;
        var teamWaypoints = self.props.teamId ? waypoints.filter(function (waypoint) {
          return waypoint.user ? waypoint.user.team.team_id == self.props.teamId : false;
        }) : waypoints;
  
        var waypointPaths = self.getWaypointPaths(teamWaypoints);
        for (var i = 0; i < waypointPaths.length; i++) {
          var teamName = waypointPaths[i].team_name;
          rows.push({ time_stamp: new Date(waypointPaths[i].time_stamp.split('.')[0]).toLocaleString(), time_stamp_end: new Date(waypointPaths[i].time_stamp_end.split('.')[0]).toLocaleString(), user_id: waypointPaths[i].user_id, team_name: teamName, actions: self.getWaypointActions(waypointPaths[i]) });
        }
        var currentTeam = self.props.teamName ? self.props.teamName : 'All Team';
  
        self.setState({
          view: 'Store',
          currentTeam: currentTeam,
          rows: rows
        });
      }
    }, {
      key: 'renderSessionsLineGraph',
      value: function renderSessionsLineGraph(rows) {
        var dataPlot = []; //name:time_range #sessions, #teams
        var weekRanges = [];
  
        for (var i = 0; i < 10; i++) {
          weekRanges.push({ index: i, startDate: new Date((0, _moment2.default)().subtract(10 - i, 'week')), endDate: new Date((0, _moment2.default)().subtract(9 - i, 'week')), numSessions: 0, teams: [] });
        }
        rows.map(function (row) {
          var week = weekRanges.find(function (w) {
            return new Date(row.time_stamp) > new Date(w.startDate) && new Date(row.time_stamp) <= new Date(w.endDate);
          });
          if (week) {
            week.numSessions++;
            if (week.teams.length < 1 || !week.teams.includes(row.team_name)) {
              week.teams.push(row.team_name);
            }
          }
        });
  
        for (var i = 0; i < 10; i++) {
          var currentWeek = weekRanges.find(function (x) {
            return x.index == i;
          });
          if (currentWeek) {
            dataPlot.push({ name: currentWeek.endDate.toLocaleDateString(), numSessions: currentWeek.numSessions, numTeams: currentWeek.teams.length });
          }
        }
  
        return _react2.default.createElement(
          _reactBootstrap.Panel,
          {
            header: _react2.default.createElement(
              'span',
              null,
              _react2.default.createElement('i', { className: 'fa fa-line-chart ' }),
              'Cart Tracking'
            ) },
          _react2.default.createElement(
            'div',
            { className: 'resizable' },
            _react2.default.createElement(
              _recharts.ResponsiveContainer,
              { width: '100%', height: '100%' },
              _react2.default.createElement(
                _recharts.LineChart,
                { data: dataPlot, margin: { top: 10, right: 30, left: 0, bottom: 0 } },
                _react2.default.createElement(_recharts.XAxis, { dataKey: 'name' }),
                _react2.default.createElement(_recharts.YAxis, { yAxisId: 'left', orientation: 'left', stroke: '#00FFFF' }),
                _react2.default.createElement(_recharts.YAxis, { yAxisId: 'right', orientation: 'right', stroke: '#ff8000' }),
                _react2.default.createElement(_recharts.CartesianGrid, { stroke: '#ccc' }),
                _react2.default.createElement(_recharts.Tooltip, null),
                _react2.default.createElement(_recharts.Line, { type: 'monotone', yAxisId: 'left', dataKey: 'numSessions', stroke: '#00FFFF' }),
                _react2.default.createElement(_recharts.Line, { type: 'monotone', yAxisId: 'right', dataKey: 'numTeams', stroke: '#ff8000' })
              )
            )
          )
        );
      }
    }, {
      key: 'getWaypointPaths',
      value: function getWaypointPaths(waypoints) {
        var userWaypoints = _lodash2.default.groupBy(waypoints, function (waypoint) {
          return waypoint.user_id + '#' + waypoint.delivery_id;
        });
  
        var data = _lodash2.default.map(userWaypoints, function (waypointArray) {
          waypointArray = _lodash2.default.sortBy(waypointArray, [function (o) {
            return o.timestamp;
          }]);
          var pathLength = waypointArray.length;
          return {
            user_id: waypointArray[0].user ? waypointArray[0].user.name : '',
            time_stamp: waypointArray[0].timestamp,
            time_stamp_end: waypointArray[pathLength - 1].timestamp,
            delivery_id: waypointArray[0].delivery_id,
            team_name: waypointArray[0].user ? waypointArray[0].user.team.team_name : '',
            inputs: waypointArray.map(function (waypoint) {
              return waypoint.data;
            }),
            waypoints: waypointArray.map(function (waypoint) {
              return waypoint.waypoint;
            })
          };
        });
        return data;
      }
    }, {
      key: 'getWaypointActions',
      value: function getWaypointActions(waypointPaths) {
        var inputs = waypointPaths.inputs;
        var waypoints = waypointPaths.waypoints;
  
        return waypoints.map(function (waypoint, index) {
          return {
            action: cafe_waypoints[Number(waypoint)],
            input: inputs[index] || ''
          };
        });
      }
    }, {
      key: 'renderWaypointTable',
      value: function renderWaypointTable(rows, startDate, endDate) {
        var filteredRows = rows.filter(function (row) {
          return new Date(row.time_stamp) >= new Date(startDate) && new Date(row.time_stamp) <= new Date(endDate);
        });
  
        return _react2.default.createElement(_common2.default, { heads: [{
            field: 'time_stamp',
            descrip: 'Session Time Started',
            allowSort: true,
            sort: function sort(a, b, order) {
              return order == 'desc' ? new Date(b.time_stamp) - new Date(a.time_stamp) : new Date(a.time_stamp) - new Date(b.time_stamp);
            }
          }, {
            field: 'time_stamp_end',
            descrip: 'Session Time of Last Activity',
            allowSort: true,
            sort: function sort(a, b, order) {
              return order == 'desc' ? new Date(b.time_stamp_end) - new Date(a.time_stamp_end) : new Date(a.time_stamp_end) - new Date(b.time_stamp_end);
            }
          }, {
            field: 'user_id',
            descrip: 'User ID',
            allowSort: true
          }, {
            field: 'team_name',
            descrip: 'Team Name',
            allowSort: true
          }, {
            field: 'actions',
            descrip: 'User Actions',
            allowSort: true,
            dataFormat: function dataFormat(cell, row) {
              return _react2.default.createElement(WaypointHover, { waypoints: cell });
            }
          }], data: filteredRows });
      }
    }, {
      key: 'render',
      value: function render() {
        var self = this;
        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'div',
            { className: 'row' },
            _react2.default.createElement(
              'div',
              { className: 'col-lg-12' },
              _react2.default.createElement(
                _reactBootstrap.PageHeader,
                null,
                self.state.currentTeam,
                ' Sessions'
              )
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'container-fluid data-display' },
            _react2.default.createElement(
              'div',
              null,
              self.renderSessionsLineGraph(self.state.rows)
            ),
            _react2.default.createElement(
              _reactBootstrap.ButtonToolbar,
              null,
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: self.state.view == 'Store' ? "primary" : "default", onClick: function onClick() {
                    return self.changeCart('Store');
                  } },
                'Store'
              ),
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: self.state.view == 'Cafe' ? "primary" : "default", onClick: function onClick() {
                    return self.changeCart('Cafe');
                  } },
                'Cafe'
              )
            ),
            _react2.default.createElement(
              'div',
              null,
              'Start Date: ',
              _react2.default.createElement(_reactDatepicker2.default, { selected: self.state.startDate, onChange: self.changeStart }),
              'End Date: ',
              _react2.default.createElement(_reactDatepicker2.default, { selected: self.state.endDate, onChange: self.changeEnd })
            ),
            _react2.default.createElement(
              'div',
              { className: 'panel panel-default fillSpace' },
              _react2.default.createElement(
                _reactBootstrap.Panel,
                { header: _react2.default.createElement(
                    'span',
                    null,
                    _react2.default.createElement('i', { className: 'fa fa-table fa-fw' }),
                    self.state.view,
                    ' Waypoint Routes'
                  ) },
                self.state.view == 'Store' ? 'Placeholder for store waypoints stuff.' : self.renderWaypointTable(self.state.rows, self.state.startDate, self.state.endDate)
              )
            )
          )
        );
      }
    }]);
    return Session;
  }(_react.Component);
  
  exports.default = Session;

/***/ }),
/* 101 */
/***/ (function(module, exports) {

  //missing: payment, which will be 14--
  //missing: edit team members (waiting for the email UX to be more polished), which will be 111-
  
  module.exports = {
    1000: "cafe start",
    1001: "confirm interruption of previous order",
    1010: "select location",
    1011: "edit locations",
    1012: "add new location",
    1013: "confirm new location",
    1020: "select budget",
    1100: "'Start New Order' view",
    1101: "confirm re-order",
    1102: "confirm new poll",
    1110: "edit team members",
    1111: "edit slack channels",
    1112: "edit email members",
    1120: "vote on cuisine",
    1121: "admin chooses cuisine",
    1130: "close cuisine poll early",
    1140: "admin select restaurant",
    1200: "user opt-in to order",
    1210: "menu quickpicks view",
    1211: "menu search",
    1220: "item details",
    1221: "item special instructions",
    1230: "user cart",
    1240: "waiting for orders admin view",
    1300: "team cart",
    1301: "team delivery special instructions",
    1310: "apartment number /floor",
    1311: "checkout name",
    1312: "feedback for kip",
    1313: "phone number",
    1320: "confirm delivery information",
    1321: "edit address",
    1322: "edit name",
    1323: "edit phone number",
    1330: "checkout",
    1331: "add new credit card",
    1332: "done"
  }


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _regenerator = __webpack_require__(2);
  
  var _regenerator2 = _interopRequireDefault(_regenerator);
  
  var _stringify = __webpack_require__(1);
  
  var _stringify2 = _interopRequireDefault(_stringify);
  
  var _asyncToGenerator2 = __webpack_require__(5);
  
  var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _sendMessage = __webpack_require__(103);
  
  var _sendMessage2 = _interopRequireDefault(_sendMessage);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = {
  
    path: '/sendmessage',
  
    action: function action(context) {
      var _this = this;
  
      return (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        var res, _ref, data, members, member, token;
  
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                res = void 0;
  
                if (!(context.query.id && context.query.id != 'undefined')) {
                  _context.next = 7;
                  break;
                }
  
                _context.next = 4;
                return fetch('/graphql', {
                  method: 'post',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: (0, _stringify2.default)({
                    query: '{teams(limit:5000, team_id:"' + context.query.id + '") {bot, team_name members{value:dm, label:name, is_bot, is_admin, is_owner, is_primary_owner}}}'
                  }),
                  credentials: 'include'
                });
  
              case 4:
                res = _context.sent;
                _context.next = 10;
                break;
  
              case 7:
                _context.next = 9;
                return fetch('/graphql', {
                  method: 'post',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: (0, _stringify2.default)({
                    query: '{teams(limit:5000){bot, team_name, members {value: dm, label: name, is_bot, is_admin, is_owner, is_primary_owner}}}'
                  }),
                  credentials: 'include'
                });
  
              case 9:
                res = _context.sent;
  
              case 10:
                _context.next = 12;
                return res.json();
  
              case 12:
                _ref = _context.sent;
                data = _ref.data;
                members = data.teams.reduce(function (mems, team) {
                  var teamMems = team.members.map(function (member) {
                    member.token = team.bot.bot_access_token;
                    return member;
                  });
                  return mems.concat(teamMems);
                }, []);
                member = context.query.member ? context.query.member : '';
                token = context.query.token ? context.query.token : '';
                return _context.abrupt('return', _react2.default.createElement(_sendMessage2.default, { members: members, member: member, token: token }));
  
              case 18:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this);
      }))();
    }
  };

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _assign = __webpack_require__(41);
  
  var _assign2 = _interopRequireDefault(_assign);
  
  var _regenerator = __webpack_require__(2);
  
  var _regenerator2 = _interopRequireDefault(_regenerator);
  
  var _asyncToGenerator2 = __webpack_require__(5);
  
  var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);
  
  var _getPrototypeOf = __webpack_require__(54);
  
  var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
  
  var _classCallCheck2 = __webpack_require__(55);
  
  var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
  
  var _createClass2 = __webpack_require__(56);
  
  var _createClass3 = _interopRequireDefault(_createClass2);
  
  var _possibleConstructorReturn2 = __webpack_require__(57);
  
  var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
  
  var _inherits2 = __webpack_require__(58);
  
  var _inherits3 = _interopRequireDefault(_inherits2);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _fetch = __webpack_require__(104);
  
  var _fetch2 = _interopRequireDefault(_fetch);
  
  var _TeamMemberSidebar = __webpack_require__(107);
  
  var _TeamMemberSidebar2 = _interopRequireDefault(_TeamMemberSidebar);
  
  var _SlackPreview = __webpack_require__(109);
  
  var _SlackPreview2 = _interopRequireDefault(_SlackPreview);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var SendMessage = function (_Component) {
    (0, _inherits3.default)(SendMessage, _Component);
  
    function SendMessage(props) {
      (0, _classCallCheck3.default)(this, SendMessage);
  
      var _this = (0, _possibleConstructorReturn3.default)(this, (SendMessage.__proto__ || (0, _getPrototypeOf2.default)(SendMessage)).call(this, props));
  
      _this.state = {
        member: {},
        attachments: '',
        members: [],
        text: '',
        error: '',
        sent: false
      };
      _this.handleSubmit = _this.handleSubmit.bind(_this);
      _this.processMembers = _this.processMembers.bind(_this);
      _this.userSelected = _this.userSelected.bind(_this);
      _this.navToMember = _this.navToMember.bind(_this);
      return _this;
    }
  
    (0, _createClass3.default)(SendMessage, [{
      key: 'handleSubmit',
      value: function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(e) {
          var attachments, res, json;
          return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  e.preventDefault();
                  this.setState({
                    error: ''
                  });
                  attachments = this.state.attachments ? encodeURIComponent(this.state.attachments) : '';
                  _context.next = 5;
                  return (0, _fetch2.default)('https://slack.com/api/chat.postMessage?token=' + this.state.member.token + '&channel=' + this.state.member.value + '&attachments=' + attachments + '&text=' + this.state.text, {
                    method: 'post'
                  });
  
                case 5:
                  res = _context.sent;
                  _context.next = 8;
                  return res.json();
  
                case 8:
                  json = _context.sent;
  
                  if (!json.ok) {
                    this.setState({
                      error: json.error
                    });
                  } else {
                    this.setState({
                      sent: true
                    });
                  }
  
                case 10:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));
  
        function handleSubmit(_x) {
          return _ref.apply(this, arguments);
        }
  
        return handleSubmit;
      }()
    }, {
      key: 'componentDidMount',
      value: function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
          var members;
          return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  members = this.processMembers(this.props.members);
  
                  this.setState({
                    members: members
                  });
  
                case 2:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));
  
        function componentDidMount() {
          return _ref2.apply(this, arguments);
        }
  
        return componentDidMount;
      }()
    }, {
      key: 'componentWillReceiveProps',
      value: function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(newProps) {
          var members;
          return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  members = this.processMembers(newProps.members);
  
                  this.setState({
                    members: members,
                    member: newProps.member,
                    sent: false
                  });
  
                case 2:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));
  
        function componentWillReceiveProps(_x2) {
          return _ref3.apply(this, arguments);
        }
  
        return componentWillReceiveProps;
      }()
    }, {
      key: 'processMembers',
      value: function processMembers(members) {
        members = members.map(function (member) {
          var mem = (0, _assign2.default)({}, member);
          if (member.is_bot == 'true') {
            mem.label = member.label + ' (\uD83E\uDD16)';
          } else if (member.is_admin == 'true') {
            mem.label = member.label + ' (\uD83D\uDE0E)';
          } else {
            mem.label = member.label + ' (\uD83D\uDE42)';
          }
          if (member.is_owner == 'true' || member.is_primary_owner == 'true') {
            mem.label = mem.label.replace(')', ', 🤠)');
          }
          return mem;
        });
        return members.filter(function (member) {
          return Boolean(member.value);
        });
      }
    }, {
      key: 'userSelected',
      value: function userSelected(val) {
        this.setState({
          sent: false,
          member: val ? val : {}
        });
      }
    }, {
      key: 'navToMember',
      value: function navToMember(member) {
        this.setState({
          member: member
        });
      }
    }, {
      key: 'render',
      value: function render() {
        var _this2 = this;
  
        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(_TeamMemberSidebar2.default, { members: this.state.members, navToMember: this.navToMember }),
          _react2.default.createElement(
            'form',
            { className: 'container-fluid data-display', onSubmit: this.handleSubmit },
            this.state.error ? _react2.default.createElement(
              'div',
              { className: 'form-group' },
              _react2.default.createElement(
                'div',
                { className: 'alert alert-danger', role: 'alert' },
                'Hmm looks like Slack didn\'t like that. Error: ',
                this.state.error
              )
            ) : '',
            _react2.default.createElement(
              'div',
              { className: 'form-group' },
              _react2.default.createElement(
                'label',
                { htmlFor: 'memberSelect' },
                this.state.member.label !== undefined ? 'Sending to ' + this.state.member.label : 'Select a member'
              ),
              _react2.default.createElement(
                'span',
                { id: 'helpBlock', className: 'help-block' },
                '\uD83E\uDD16=Bot, \uD83D\uDE0E=Admin, \uD83D\uDE42=Member, \uD83E\uDD20=Owner'
              )
            ),
            _react2.default.createElement(
              'div',
              { className: 'form-group' },
              _react2.default.createElement(
                'label',
                { htmlFor: 'textInput' },
                'Text (optional)'
              ),
              _react2.default.createElement('input', {
                name: 'textInput',
                className: 'form-control',
                id: 'textInput',
                type: 'text',
                placeholder: 'Text',
                onBlur: function onBlur(e) {
                  return _this2.setState({
                    text: e.target.value,
                    sent: false
                  });
                }
              })
            ),
            _react2.default.createElement(
              'div',
              { className: 'form-group' },
              _react2.default.createElement(
                'label',
                { htmlFor: 'attachmentInput' },
                'Attachments (optional)'
              ),
              _react2.default.createElement('textarea', {
                className: 'form-control',
                rows: '20',
                placeholder: 'Message Attachments',
                onBlur: function onBlur(e) {
                  return _this2.setState({
                    attachments: e.target.value,
                    sent: false
                  });
                },
                id: 'attachmentInput' })
            ),
            this.state.sent ? _react2.default.createElement(
              'div',
              { className: 'form-group' },
              _react2.default.createElement(
                'div',
                { className: 'alert alert-success', role: 'alert' },
                _react2.default.createElement(
                  'strong',
                  null,
                  'Sent!'
                )
              )
            ) : '',
            _react2.default.createElement(
              'button',
              { type: 'submit', className: 'btn btn-default' },
              'Send Message'
            ),
            _react2.default.createElement(_SlackPreview2.default, { text: this.state.text, attachments: this.state.attachments, username: 'Kip', photoUrl: 'http://lorempixel.com/50/50/cats/' })
          )
        );
      }
    }]);
    return SendMessage;
  }(_react.Component);
  
  exports.default = SendMessage;

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Response = exports.Headers = exports.Request = exports.default = undefined;
  
  var _bluebird = __webpack_require__(105);
  
  var _bluebird2 = _interopRequireDefault(_bluebird);
  
  var _nodeFetch = __webpack_require__(106);
  
  var _nodeFetch2 = _interopRequireDefault(_nodeFetch);
  
  var _config = __webpack_require__(22);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  _nodeFetch2.default.Promise = _bluebird2.default; /**
                                                     * React Starter Kit (https://www.reactstarterkit.com/)
                                                     *
                                                     * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
                                                     *
                                                     * This source code is licensed under the MIT license found in the
                                                     * LICENSE.txt file in the root directory of this source tree.
                                                     */
  
  _nodeFetch.Response.Promise = _bluebird2.default;
  
  function localUrl(url) {
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
  
    if (url.startsWith('http')) {
      return url;
    }
  
    return 'http://' + _config.host + url;
  }
  
  function localFetch(url, options) {
    return (0, _nodeFetch2.default)(localUrl(url), options);
  }
  
  exports.default = localFetch;
  exports.Request = _nodeFetch.Request;
  exports.Headers = _nodeFetch.Headers;
  exports.Response = _nodeFetch.Response;

/***/ }),
/* 105 */
/***/ (function(module, exports) {

  module.exports = require("bluebird");

/***/ }),
/* 106 */
/***/ (function(module, exports) {

  module.exports = require("node-fetch");

/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _getPrototypeOf = __webpack_require__(54);
  
  var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
  
  var _classCallCheck2 = __webpack_require__(55);
  
  var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
  
  var _createClass2 = __webpack_require__(56);
  
  var _createClass3 = _interopRequireDefault(_createClass2);
  
  var _possibleConstructorReturn2 = __webpack_require__(57);
  
  var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
  
  var _inherits2 = __webpack_require__(58);
  
  var _inherits3 = _interopRequireDefault(_inherits2);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _history = __webpack_require__(65);
  
  var _history2 = _interopRequireDefault(_history);
  
  var _fetch = __webpack_require__(104);
  
  var _fetch2 = _interopRequireDefault(_fetch);
  
  var _co = __webpack_require__(108);
  
  var _co2 = _interopRequireDefault(_co);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var TeamMemberSidebar = function (_Component) {
    (0, _inherits3.default)(TeamMemberSidebar, _Component);
  
    function TeamMemberSidebar(props) {
      (0, _classCallCheck3.default)(this, TeamMemberSidebar);
  
      var _this = (0, _possibleConstructorReturn3.default)(this, (TeamMemberSidebar.__proto__ || (0, _getPrototypeOf2.default)(TeamMemberSidebar)).call(this, props));
  
      _this.state = {
        uiElementsCollapse: true,
        chartsElementsCollapsed: true,
        multiLevelDropdownCollapsed: true,
        thirdLevelDropdownCollapsed: true,
        samplePagesCollapsed: true,
        searchTerm: '',
        selectedMember: ''
      };
      _this.handleSearchInput = _this.handleSearchInput.bind(_this);
      _this.filterData = _this.filterData.bind(_this);
      _this.navToMember = _this.navToMember.bind(_this);
      return _this;
    }
  
    (0, _createClass3.default)(TeamMemberSidebar, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var self = this;
        this.setState({
          members: this.props.members
        });
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(newProps) {
        this.setState({
          members: newProps.members
        });
      }
    }, {
      key: 'handleSearchInput',
      value: function handleSearchInput(event) {
        this.setState({
          searchString: event.target.value
        });
      }
    }, {
      key: 'navToMember',
      value: function navToMember(e, member) {
        e.preventDefault();
        this.props.navToMember(member);
      }
    }, {
      key: 'filterData',
      value: function filterData(members, filter) {
        if (filter === "" || !filter) {
          return members;
        };
        return members.filter(function (member) {
          return member.label.toLowerCase().includes(filter.toLowerCase());
        });
      }
    }, {
      key: 'render',
      value: function render() {
        var self = this;
        var members = this.state.members;
  
        var filteredData = this.filterData(members, this.state.searchString);
        var displayMembers = filteredData ? filteredData.map(function (member) {
          return _react2.default.createElement(
            'li',
            { key: member.value },
            ' ',
            _react2.default.createElement(
              'a',
              { href: '', onClick: function onClick(e) {
                  return self.navToMember(e, member);
                } },
              ' ',
              member.label
            )
          );
        }) : [];
  
        return _react2.default.createElement(
          'div',
          { className: 'navbar-default sidebar page-sidebar' },
          _react2.default.createElement(
            'div',
            { className: 'sidebar-nav navbar-collapse collapse' },
            _react2.default.createElement(
              'ul',
              { className: 'nav in', id: 'side-menu' },
              _react2.default.createElement(
                'li',
                { className: 'sidebar-search' },
                _react2.default.createElement(
                  'div',
                  { className: 'input-group custom-search-form' },
                  _react2.default.createElement('input', { type: 'text', className: 'form-control', onChange: this.handleSearchInput, placeholder: 'Search...' }),
                  _react2.default.createElement(
                    'span',
                    { className: 'input-group-btn' },
                    _react2.default.createElement(
                      'button',
                      { className: 'btn btn-default', type: 'button' },
                      _react2.default.createElement('i', { className: 'fa fa-search' })
                    )
                  )
                )
              ),
              displayMembers
            )
          )
        );
      }
    }]);
    return TeamMemberSidebar;
  }(_react.Component);
  
  TeamMemberSidebar.propTypes = {
    selectedMember: _react.PropTypes.string
  };
  
  exports.default = TeamMemberSidebar;

/***/ }),
/* 108 */
/***/ (function(module, exports) {

  module.exports = require("co");

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _getPrototypeOf = __webpack_require__(54);
  
  var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
  
  var _classCallCheck2 = __webpack_require__(55);
  
  var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
  
  var _createClass2 = __webpack_require__(56);
  
  var _createClass3 = _interopRequireDefault(_createClass2);
  
  var _possibleConstructorReturn2 = __webpack_require__(57);
  
  var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
  
  var _inherits2 = __webpack_require__(58);
  
  var _inherits3 = _interopRequireDefault(_inherits2);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _classnames = __webpack_require__(71);
  
  var _classnames2 = _interopRequireDefault(_classnames);
  
  var _co = __webpack_require__(108);
  
  var _co2 = _interopRequireDefault(_co);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var SlackPreivew = function (_Component) {
    (0, _inherits3.default)(SlackPreivew, _Component);
  
    function SlackPreivew(props) {
      (0, _classCallCheck3.default)(this, SlackPreivew);
  
      var _this = (0, _possibleConstructorReturn3.default)(this, (SlackPreivew.__proto__ || (0, _getPrototypeOf2.default)(SlackPreivew)).call(this, props));
  
      _this.displayAttachments = _this.displayAttachments.bind(_this);
      _this.displayActions = _this.displayActions.bind(_this);
      _this.state = {
        text: '',
        attachments: []
      };
      return _this;
    }
  
    (0, _createClass3.default)(SlackPreivew, [{
      key: 'displayActions',
      value: function displayActions(attachment) {
        console.log(attachment);
        if (attachment.actions) {
          return attachment.actions.map(function (action) {
            return _react2.default.createElement(
              'li',
              { className: 'slackAction slackList' },
              _react2.default.createElement(
                'p',
                null,
                action.text
              )
            );
          });
        }
      }
    }, {
      key: 'displayAttachments',
      value: function displayAttachments(attachments) {
        var _this2 = this;
  
        return attachments.map(function (attachment) {
          return _react2.default.createElement(
            'li',
            { className: 'slackAttachment slackList' },
            _react2.default.createElement(
              'p',
              null,
              attachment.text
            ),
            _react2.default.createElement(
              'ul',
              null,
              _this2.displayActions(attachment)
            )
          );
        });
      }
    }, {
      key: 'getAttachments',
      value: function getAttachments(attachmentString) {
        console.log(attachmentString);
        attachmentString = attachmentString ? attachmentString : '[]';
        var attachments = void 0;
        try {
          attachments = JSON.parse(attachmentString);
        } catch (e) {
          attachments = [];
        }
        return attachments;
      }
    }, {
      key: 'componentDidMount',
      value: function componentDidMount() {
        this.setState({
          text: this.props.text,
          attachments: this.getAttachments(this.props.attachments),
          photoUrl: this.props.photoUrl,
          username: this.props.username
        });
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(newProps) {
        this.setState({
          text: newProps.text,
          attachments: this.getAttachments(newProps.attachments),
          photoUrl: newProps.photoUrl,
          username: newProps.username
        });
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          'div',
          { className: 'slackPreivew' },
          _react2.default.createElement('img', { src: this.state.photoUrl }),
          _react2.default.createElement(
            'div',
            { className: 'slackMessage' },
            _react2.default.createElement(
              'p',
              { className: 'slackUsername' },
              _react2.default.createElement(
                'strong',
                null,
                this.state.username
              )
            ),
            _react2.default.createElement(
              'p',
              { className: 'slackText' },
              this.state.text
            ),
            _react2.default.createElement(
              'ul',
              { className: 'slackAttachments' },
              this.displayAttachments(this.state.attachments)
            )
          )
        );
      }
    }]);
    return SlackPreivew;
  }(_react.Component);
  
  exports.default = SlackPreivew;

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _blank = __webpack_require__(111);
  
  var _blank2 = _interopRequireDefault(_blank);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = {
    path: '/blank',
  
    action: function action() {
      return _react2.default.createElement(_blank2.default, null);
    }
  };

/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _reactBootstrap = __webpack_require__(63);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var title = 'Blank';
  
  function displayBlank(props, context) {
    context.setTitle(title);
    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'div',
        { className: 'row' },
        _react2.default.createElement(
          'div',
          { className: 'col-lg-12' },
          _react2.default.createElement(
            _reactBootstrap.PageHeader,
            null,
            'Blank'
          )
        )
      )
    );
  }
  
  displayBlank.contextTypes = { setTitle: _react.PropTypes.func.isRequired };
  exports.default = displayBlank;

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _amazoncsv = __webpack_require__(113);
  
  var _amazoncsv2 = _interopRequireDefault(_amazoncsv);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = {
    path: '/amazoncsv',
  
    action: function action() {
      return _react2.default.createElement(_amazoncsv2.default, null);
    }
  };

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _reactBootstrap = __webpack_require__(63);
  
  var _CSVDrop = __webpack_require__(114);
  
  var _CSVDrop2 = _interopRequireDefault(_CSVDrop);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var title = 'Amazon CSV';
  
  function displayAmazonCSV(props, context) {
    context.setTitle(title);
    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'div',
        { className: 'row' },
        _react2.default.createElement(
          'div',
          { className: 'col-lg-12' },
          _react2.default.createElement(
            _reactBootstrap.PageHeader,
            null,
            'Amazon CSV'
          ),
          _react2.default.createElement(_CSVDrop2.default, null)
        )
      )
    );
  }
  
  displayAmazonCSV.contextTypes = { setTitle: _react.PropTypes.func.isRequired };
  exports.default = displayAmazonCSV;

/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _regenerator = __webpack_require__(2);
  
  var _regenerator2 = _interopRequireDefault(_regenerator);
  
  var _stringify = __webpack_require__(1);
  
  var _stringify2 = _interopRequireDefault(_stringify);
  
  var _getPrototypeOf = __webpack_require__(54);
  
  var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
  
  var _classCallCheck2 = __webpack_require__(55);
  
  var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
  
  var _createClass2 = __webpack_require__(56);
  
  var _createClass3 = _interopRequireDefault(_createClass2);
  
  var _possibleConstructorReturn2 = __webpack_require__(57);
  
  var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
  
  var _inherits2 = __webpack_require__(58);
  
  var _inherits3 = _interopRequireDefault(_inherits2);
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _reactDropzone = __webpack_require__(115);
  
  var _reactDropzone2 = _interopRequireDefault(_reactDropzone);
  
  var _reactBootstrap = __webpack_require__(63);
  
  var _classnames = __webpack_require__(71);
  
  var _classnames2 = _interopRequireDefault(_classnames);
  
  var _fetch = __webpack_require__(104);
  
  var _fetch2 = _interopRequireDefault(_fetch);
  
  var _co = __webpack_require__(108);
  
  var _co2 = _interopRequireDefault(_co);
  
  var _mintdata = __webpack_require__(116);
  
  var mintdata = _interopRequireWildcard(_mintdata);
  
  var _lodash = __webpack_require__(48);
  
  var _lodash2 = _interopRequireDefault(_lodash);
  
  var _check_asin = __webpack_require__(117);
  
  var _check_asin2 = _interopRequireDefault(_check_asin);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  //import csv from 'csvtojson';
  var request = __webpack_require__(122);
  //import { Metrics } from '../api/metrics.js';
  //import subMonths from 'date-fns/sub_months';
  //import addMonths from 'date-fns/add_months';
  
  var propz;
  var csv = __webpack_require__(11);
  
  var CSVDrop = function (_Component) {
    (0, _inherits3.default)(CSVDrop, _Component);
  
    function CSVDrop(props) {
      (0, _classCallCheck3.default)(this, CSVDrop);
  
      var _this = (0, _possibleConstructorReturn3.default)(this, (CSVDrop.__proto__ || (0, _getPrototypeOf2.default)(CSVDrop)).call(this, props));
  
      propz = props;
      _this.state = {
        view: 'Store',
        files: '',
        checkedRows: [],
        ready: false
      };
      _this.onDrop = _this.onDrop.bind(_this);
      _this.processCheckedRow = _this.processCheckedRow.bind(_this);
      _this.processCheckedRows = _this.processCheckedRows.bind(_this);
      return _this;
    }
  
    (0, _createClass3.default)(CSVDrop, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var self = this;
        (0, _co2.default)(_regenerator2.default.mark(function _callee() {
          var resp, _ref, data;
  
          return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return (0, _fetch2.default)('/graphql', {
                    method: 'post',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json'
                    },
                    body: (0, _stringify2.default)({
                      query: '{items(limit: 10000){_id,cart_id,title,image,description,price,ASIN,rating,review_count,added_by,slack_id,source_json,purchased,purchased_date,deleted,added_date,bundle,available,asins,config,}}'
                    }),
                    credentials: 'include'
                  });
  
                case 2:
                  resp = _context.sent;
                  _context.next = 5;
                  return resp.json();
  
                case 5:
                  _ref = _context.sent;
                  data = _ref.data;
  
                  if (!(!data || !data.items)) {
                    _context.next = 11;
                    break;
                  }
  
                  throw new Error('Failed to load the items');
  
                case 11:
                  self.setState({
                    items: data.items,
                    mintitems: mintdata.items,
                    ready: true
                  });
  
                case 12:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));
      }
    }, {
      key: 'changeState',
      value: function changeState(value) {
        this.setState(value);
      }
    }, {
      key: 'onDrop',
      value: function onDrop(acceptedFiles, rejectedFiles) {
        var file = new FormData();
        var self = this;
        var view = self.state.view;
        var items = self.state.items;
        var mintitems = self.state.mintitems;
  
        file.append('csv_file', acceptedFiles[0]);
        request.post('/upload').send(file).end(function (err, resp) {
          if (err) {
            console.error(err);
          }
          //Put check_asin code here
          var matchedRows = (0, _check_asin2.default)(resp.text, items, mintitems, view);
          console.log(matchedRows);
          //var matchedRows = resp.text;
          self.setState({
            files: acceptedFiles,
            data: matchedRows
          });
        });
      }
    }, {
      key: 'processCheckedRow',
      value: function processCheckedRow(checkedRow) {
        var self = this;
        var items = self.state.items;
  
        var matchedItem = items.find(function (i) {
          return i._id == checkedRow._id;
        });
        var query = 'mutation {setItemAsPurchased(itemId:"' + matchedItem._id + '"){ _id,cart_id,title,image,description,price,ASIN,rating,review_count,added_by,slack_id,source_json,purchased,purchased_date,deleted,added_date,bundle,available,asins,config}}';
        (0, _co2.default)(_regenerator2.default.mark(function _callee2() {
          var resp, _ref2, data;
  
          return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return (0, _fetch2.default)('/graphql', {
                    method: 'post',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json'
                    },
                    body: (0, _stringify2.default)({
                      query: query
                    }),
                    credentials: 'include'
                  });
  
                case 2:
                  resp = _context2.sent;
                  _context2.next = 5;
                  return resp.json();
  
                case 5:
                  _ref2 = _context2.sent;
                  data = _ref2.data;
  
                case 7:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));
      }
    }, {
      key: 'processCheckedRows',
      value: function processCheckedRows(checkedRows) {
        //for each checked row, set the associated cart purchased = true
        var self = this;
  
        if (self.state.view == 'Store') {
          checkedRows.map(function (checkedRow) {
            return self.processCheckedRow(checkedRow);
          });
          alert("Items confirmed.");
          self.changeState({ data: [], files: '' });
        }
      }
    }, {
      key: 'addToCheckedRows',
      value: function addToCheckedRows(checkedRow) {
        var self = this;
        var checkedRows = self.state.checkedRows;
        var view = self.state.view;
  
        if (view == 'Store') {
          if (checkedRows) {
            var rowIndex = checkedRows.findIndex(function (row) {
              return row.ASIN == checkedRow.ASIN && row.added_date == checkedRow.added_date;
            });
            if (rowIndex != -1) {
              checkedRows.splice(rowIndex, 1);
              self.setState({ checkedRows: checkedRows });
            } else {
              checkedRows.push(checkedRow);
              self.setState({ checkedRows: checkedRows });
            }
          }
        } else {
          if (checkedRows) {
            var rowIndex = checkedRows.findIndex(function (row) {
              return row.id == checkedRow.id;
            });
            if (rowIndex != -1) {
              checkedRows.splice(rowIndex, 1);
              self.setState({ checkedRows: checkedRows });
            } else {
              checkedRows.push(checkedRow);
              self.setState({ checkedRows: checkedRows });
            }
          }
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var self = this;
        var files = self.state.files;
  
        var fname = files ? files[0].name : 'No ' + self.state.view + ' CSV file';
        var data = self.state.data;
        var view = self.state.view;
  
        var dataText = data ? data : '';
        var checkedRows = self.state.checkedRows;
  
        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              _reactBootstrap.ButtonToolbar,
              null,
              _react2.default.createElement(
                _reactBootstrap.Button,
                {
                  bsStyle: self.state.view.toLowerCase() === 'store' ? 'primary' : 'default',
                  onClick: function onClick() {
                    return self.changeState({ view: 'Store', data: [], files: '' });
                  } },
                'Store'
              ),
              _react2.default.createElement(
                _reactBootstrap.Button,
                {
                  bsStyle: self.state.view.toLowerCase() === 'mint' ? 'primary' : 'default',
                  onClick: function onClick() {
                    return self.changeState({ view: 'Mint', data: [], files: '' });
                  } },
                'Mint'
              )
            )
          ),
          this.state.ready == true ? _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              _reactDropzone2.default,
              { multiple: false, accept: 'text/csv', onDrop: this.onDrop },
              _react2.default.createElement(
                'div',
                null,
                'Try dropping some files here, or click to select files to upload. '
              )
            ),
            fname,
            ' uploaded.'
          ) : 'Loading...',
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              'div',
              null,
              dataText.length > 0 ? _react2.default.createElement(
                _reactBootstrap.Button,
                { onClick: function onClick() {
                    return self.processCheckedRows(checkedRows);
                  } },
                'Confirm'
              ) : ''
            ),
            _react2.default.createElement(
              'div',
              { className: 'col-lg-8' },
              _react2.default.createElement(
                _reactBootstrap.Panel,
                { header: "Item Matches" },
                view == 'Store' ? _react2.default.createElement(
                  'div',
                  { className: 'col-lg-6' },
                  dataText ? dataText.map(function (row) {
                    return _react2.default.createElement(
                      _reactBootstrap.Checkbox,
                      { key: row[0]._id + row[0].ASIN + row[0].added_date + row[1].Date, onChange: function onChange() {
                          return self.addToCheckedRows(row[0]);
                        } },
                      _react2.default.createElement(
                        'div',
                        null,
                        'Item Name: ',
                        row[0].title.length > 30 ? row[0].title.substr(0, 30) + '...' : row[0].title
                      ),
                      _react2.default.createElement(
                        'div',
                        null,
                        'ASIN: ',
                        row[0].ASIN
                      ),
                      _react2.default.createElement(
                        'div',
                        null,
                        'Date Added: ',
                        row[0].added_date
                      ),
                      _react2.default.createElement(
                        'div',
                        null,
                        'Slack ID: ',
                        row[0].slack_id
                      ),
                      _react2.default.createElement(
                        'div',
                        null,
                        'Added by: ',
                        row[0].added_by
                      ),
                      _react2.default.createElement('hr', null)
                    );
                  }) : ''
                ) : _react2.default.createElement(
                  'div',
                  { className: 'col-lg-6' },
                  dataText ? dataText.map(function (row) {
                    return _react2.default.createElement(
                      _reactBootstrap.Checkbox,
                      { key: row[0].id + row[0].cart + row[0].added_by, onChange: function onChange() {
                          return self.addToCheckedRows(row[0]);
                        } },
                      _react2.default.createElement(
                        'div',
                        null,
                        'Item Name: ',
                        row[0].name.length > 30 ? row[0].name.substr(0, 30) + '...' : row[0].name
                      ),
                      _react2.default.createElement(
                        'div',
                        null,
                        'ASIN: ',
                        row[0].asin
                      ),
                      _react2.default.createElement(
                        'div',
                        null,
                        'Date Added: ',
                        row[0].createdAt
                      ),
                      _react2.default.createElement(
                        'div',
                        null,
                        'Cart ID: ',
                        row[0].cart
                      ),
                      _react2.default.createElement(
                        'div',
                        null,
                        'Added by: ',
                        row[0].added_by
                      ),
                      _react2.default.createElement('hr', null)
                    );
                  }) : ''
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'col-lg-6' },
                  dataText ? dataText.map(function (row) {
                    return _react2.default.createElement(
                      _reactBootstrap.Checkbox,
                      { disabled: true },
                      _react2.default.createElement(
                        'div',
                        null,
                        'Item Name: ',
                        row[1].Name.length > 30 ? row[1].Name.substr(0, 30) + '...' : row[1].Name
                      ),
                      _react2.default.createElement(
                        'div',
                        null,
                        'ASIN: ',
                        row[1].ASIN
                      ),
                      _react2.default.createElement(
                        'div',
                        null,
                        'Date Added: ',
                        row[1].Date
                      ),
                      _react2.default.createElement(
                        'div',
                        null,
                        'Category: ',
                        row[1].Category
                      ),
                      _react2.default.createElement(
                        'div',
                        null,
                        'Quantity: ',
                        row[1].Qty
                      ),
                      _react2.default.createElement('hr', null)
                    );
                  }) : ''
                )
              )
            )
          )
        );
      }
    }]);
    return CSVDrop;
  }(_react.Component);
  
  ;
  
  exports.default = CSVDrop;
  
  /*
  CSVDrop.propTypes = {
    getMetrics: PropTypes.func.isRequired
  }
  */

/***/ }),
/* 115 */
/***/ (function(module, exports) {

  module.exports = require("react-dropzone");

/***/ }),
/* 116 */
/***/ (function(module, exports) {

  "use strict";
  
  module.exports = {
     "members": [{
        "email_address": "twong9790@gmail.com",
        "createdAt": "2017-04-27T20:21:07.779Z",
        "updatedAt": "2017-04-27T20:21:07.779Z",
        "id": "cfd72cf9-57e4-4f05-8ecd-c7482e5568e1"
     }],
     "items": [{
        "store": "amazon",
        "name": "Pepperidge Farm Goldfish Variety Pack Bold Mix, (Box of 30 bags)",
        "asin": "B01GQ5GQHS",
        "description": "14 pouches of 0.9oz Goldish Xtra Cheddar,8 pouches of 0.9oz Goldish Xplosive Pizza,8 pouches of 1.2oz Goldfish Grahams Vanilla Cupcake,Baked with real cheddar cheese (Xtra Cheddar & Xplosive Pizza)Baked with Whole Grain (Vanilla Cupcake),No Artificial Flavors or Preservatives",
        "price": 9.98,
        "thumbnail_url": "https://images-na.ssl-images-amazon.com/images/I/61lk0RSdDjL._SL75_.jpg",
        "main_image_url": "https://images-na.ssl-images-amazon.com/images/I/91YktG5dmmL.jpg",
        "quantity": 1,
        "locked": false,
        "createdAt": "2017-04-27T20:23:35.657Z",
        "updatedAt": "2017-04-27T20:24:12.057Z",
        "original_link": "https://www.amazon.com/Pepperidge-Farm-Goldfish-Variety-Pack/dp/tech-data/B01GQ5GQHS?SubscriptionId=AKIAIQWK3QCI5BOJTT5Q&tag=motorwaytoros-20&linkCode=xm2&camp=2025&creative=386001&creativeASIN=B01GQ5GQHS",
        "added_by": "cfd72cf9-57e4-4f05-8ecd-c7482e5568e1",
        "cart": "c09cdf9c3a10",
        "id": "240d6c3c-8eb3-4f8d-99fd-563f53e10478"
     }, {
        "store": "amazon",
        "name": "Yogi Honey Lavender Stress Relief Tea, 16 Tea Bags",
        "asin": "B007M8FRV0",
        "description": "Natural Certified,Only Natural Ingredients,Organic,Relax and enjoy this delicious blend specifically formulated to help calm your mind and body,Lemon balm leaf and passion flower extract are used to promote relaxation by soothing the nerves,Relax and enjoy this delicious blend specifically formulated to help calm your mind and body,Lemon balm leaf and passion flower extract are used to promote relaxation by soothing the nerves,Organic chamomile and lavender comfort for a deliciously intriguing blend that promotes a sense of calm,Honey and spearmint help calm during a stressful day or to ease you into a restful night,100% all natural herbal supplement made with non-GMO ingredients",
        "price": 3.39,
        "thumbnail_url": "https://images-na.ssl-images-amazon.com/images/I/51lm6thrYhL._SL75_.jpg",
        "main_image_url": "https://images-na.ssl-images-amazon.com/images/I/71-NQIXoVZL.jpg",
        "quantity": 1,
        "locked": false,
        "createdAt": "2017-04-27T20:24:51.969Z",
        "updatedAt": "2017-04-27T20:25:29.315Z",
        "original_link": "https://www.amazon.com/Yogi-Honey-Lavender-Stress-Relief/dp/tech-data/B007M8FRV0?SubscriptionId=AKIAIQWK3QCI5BOJTT5Q&tag=motorwaytoros-20&linkCode=xm2&camp=2025&creative=386001&creativeASIN=B007M8FRV0",
        "added_by": "cfd72cf9-57e4-4f05-8ecd-c7482e5568e1",
        "cart": "c09cdf9c3a10",
        "id": "4421b0d9-1df0-4480-8545-baa3b5fa9e6c"
     }, {
        "store": "amazon",
        "name": "MSI GAMING Radeon RX 480 GDDR5 8GB CrossFire VR Ready FinFET DirectX 12 Graphics Card (RX 480 GAMING X 8G)",
        "asin": "B01K1JTT8S",
        "description": "Chipset: AMD Radeon RX 480,Video Memory: 8GB GDDR5,Max. Resolution: n/a, supports 4x Display monitors,Input: 8Pin PCI-E power connector, output: DVI-D Dual Link, 2x HDMI, 2x DisplayPort,500W system power supply requirement",
        "price": 421.8,
        "thumbnail_url": "https://images-na.ssl-images-amazon.com/images/I/41OTGSAA2PL._SL75_.jpg",
        "main_image_url": "https://images-na.ssl-images-amazon.com/images/I/81WK17JO-aL.jpg",
        "quantity": 1,
        "locked": false,
        "createdAt": "2017-04-27T20:27:14.861Z",
        "updatedAt": "2017-04-27T20:27:55.731Z",
        "original_link": "https://www.amazon.com/MSI-GAMING-RX-480-8G/dp/tech-data/B01K1JTT8S?SubscriptionId=AKIAIQWK3QCI5BOJTT5Q&tag=motorwaytoros-20&linkCode=xm2&camp=2025&creative=386001&creativeASIN=B01K1JTT8S",
        "added_by": "cfd72cf9-57e4-4f05-8ecd-c7482e5568e1",
        "cart": "c09cdf9c3a10",
        "id": "99fee389-7045-4af3-a204-3a05b966ae9a"
     }],
     "leader": {
        "email_address": "twong9790@gmail.com",
        "createdAt": "2017-04-27T20:21:07.779Z",
        "updatedAt": "2017-04-27T20:21:07.779Z",
        "id": "cfd72cf9-57e4-4f05-8ecd-c7482e5568e1"
     },
     "createdAt": "2017-04-27T20:20:46.794Z",
     "updatedAt": "2017-04-27T20:27:55.739Z",
     "id": "c09cdf9c3a10"
  };

/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  var differenceInDays = __webpack_require__(118);
  
  module.exports = function check_asin(rows, items, mintitems, view) {
          var entries = JSON.parse(rows);
          var results = [];
          if (view == 'Store') {
                  entries.map(function (row) {
                          var matches = items.filter(function (i) {
                                  return i.ASIN == row.ASIN;
                          });
                          for (var i = 0; i < row.Qty; i++) {
                                  var closestMatch = 0;
                                  var closestDistance;
                                  if (matches[0] && matches[0].added_date) {
                                          closestDistance = Math.abs(differenceInDays(row.Date, matches[0].added_date));
                                  } else {
                                          closestDistance = 1000;
                                  }
  
                                  for (var j = 0; j < matches.length; j++) {
                                          if (matches[j] && matches[j].added_date) {
                                                  if (Math.abs(differenceInDays(row.Date, matches[j].added_date) < closestDistance)) {
                                                          closestDistance = Math.abs(differenceInDays(row.Date, matches[j].added_date));
                                                          closestMatch = j;
                                                  }
                                          }
                                  }
                                  if (matches[closestMatch]) {
                                          results.push([matches[closestMatch], row]); // match refers to the entry from kip,row refers to amazon's csv entry
                                          matches.splice(closestMatch, 1);
                                  }
                          }
                  });
                  return results;
          } else {
                  entries.map(function (row) {
                          var matches = mintitems.filter(function (i) {
                                  return i.asin == row.ASIN;
                          });
                          for (var i = 0; i < row.Qty; i++) {
                                  var closestMatch = 0;
                                  var closestDistance;
                                  if (matches[0] && matches[0].createdAt) {
                                          closestDistance = Math.abs(differenceInDays(row.Date, matches[0].createdAt));
                                  } else {
                                          closestDistance = 1000;
                                  }
  
                                  for (var j = 0; j < matches.length; j++) {
                                          if (matches[j] && matches[j].createdAt) {
                                                  if (Math.abs(differenceInDays(row.Date, matches[j].createdAt) < closestDistance)) {
                                                          closestDistance = Math.abs(differenceInDays(row.Date, matches[j].createdAt));
                                                          closestMatch = j;
                                                  }
                                          }
                                  }
                                  if (matches[closestMatch]) {
                                          results.push([matches[closestMatch], row]); // match refers to the entry from kip,row refers to amazon's csv entry
                                          matches.splice(closestMatch, 1);
                                  }
                          }
                  });
                  return results;
          }
  };

/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

  var startOfDay = __webpack_require__(119)
  
  var MILLISECONDS_IN_MINUTE = 60000
  var MILLISECONDS_IN_DAY = 86400000
  
  /**
   * @category Day Helpers
   * @summary Get the number of calendar days between the given dates.
   *
   * @description
   * Get the number of calendar days between the given dates.
   *
   * @param {Date|String|Number} dateLeft - the later date
   * @param {Date|String|Number} dateRight - the earlier date
   * @returns {Number} the number of calendar days
   *
   * @example
   * // How many calendar days are between
   * // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
   * var result = differenceInCalendarDays(
   *   new Date(2012, 6, 2, 0, 0),
   *   new Date(2011, 6, 2, 23, 0)
   * )
   * //=> 366
   */
  function differenceInCalendarDays (dirtyDateLeft, dirtyDateRight) {
    var startOfDayLeft = startOfDay(dirtyDateLeft)
    var startOfDayRight = startOfDay(dirtyDateRight)
  
    var timestampLeft = startOfDayLeft.getTime() -
      startOfDayLeft.getTimezoneOffset() * MILLISECONDS_IN_MINUTE
    var timestampRight = startOfDayRight.getTime() -
      startOfDayRight.getTimezoneOffset() * MILLISECONDS_IN_MINUTE
  
    // Round the number of days to the nearest integer
    // because the number of milliseconds in a day is not constant
    // (e.g. it's different in the day of the daylight saving time clock shift)
    return Math.round((timestampLeft - timestampRight) / MILLISECONDS_IN_DAY)
  }
  
  module.exports = differenceInCalendarDays


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

  var parse = __webpack_require__(120)
  
  /**
   * @category Day Helpers
   * @summary Return the start of a day for the given date.
   *
   * @description
   * Return the start of a day for the given date.
   * The result will be in the local timezone.
   *
   * @param {Date|String|Number} date - the original date
   * @returns {Date} the start of a day
   *
   * @example
   * // The start of a day for 2 September 2014 11:55:00:
   * var result = startOfDay(new Date(2014, 8, 2, 11, 55, 0))
   * //=> Tue Sep 02 2014 00:00:00
   */
  function startOfDay (dirtyDate) {
    var date = parse(dirtyDate)
    date.setHours(0, 0, 0, 0)
    return date
  }
  
  module.exports = startOfDay


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

  var isDate = __webpack_require__(121)
  
  var MILLISECONDS_IN_HOUR = 3600000
  var MILLISECONDS_IN_MINUTE = 60000
  var DEFAULT_ADDITIONAL_DIGITS = 2
  
  var parseTokenDateTimeDelimeter = /[T ]/
  var parseTokenPlainTime = /:/
  
  // year tokens
  var parseTokenYY = /^(\d{2})$/
  var parseTokensYYY = [
    /^([+-]\d{2})$/, // 0 additional digits
    /^([+-]\d{3})$/, // 1 additional digit
    /^([+-]\d{4})$/ // 2 additional digits
  ]
  
  var parseTokenYYYY = /^(\d{4})/
  var parseTokensYYYYY = [
    /^([+-]\d{4})/, // 0 additional digits
    /^([+-]\d{5})/, // 1 additional digit
    /^([+-]\d{6})/ // 2 additional digits
  ]
  
  // date tokens
  var parseTokenMM = /^-(\d{2})$/
  var parseTokenDDD = /^-?(\d{3})$/
  var parseTokenMMDD = /^-?(\d{2})-?(\d{2})$/
  var parseTokenWww = /^-?W(\d{2})$/
  var parseTokenWwwD = /^-?W(\d{2})-?(\d{1})$/
  
  // time tokens
  var parseTokenHH = /^(\d{2}([.,]\d*)?)$/
  var parseTokenHHMM = /^(\d{2}):?(\d{2}([.,]\d*)?)$/
  var parseTokenHHMMSS = /^(\d{2}):?(\d{2}):?(\d{2}([.,]\d*)?)$/
  
  // timezone tokens
  var parseTokenTimezone = /([Z+-].*)$/
  var parseTokenTimezoneZ = /^(Z)$/
  var parseTokenTimezoneHH = /^([+-])(\d{2})$/
  var parseTokenTimezoneHHMM = /^([+-])(\d{2}):?(\d{2})$/
  
  /**
   * @category Common Helpers
   * @summary Convert the given argument to an instance of Date.
   *
   * @description
   * Convert the given argument to an instance of Date.
   *
   * If the argument is an instance of Date, the function returns its clone.
   *
   * If the argument is a number, it is treated as a timestamp.
   *
   * If an argument is a string, the function tries to parse it.
   * Function accepts complete ISO 8601 formats as well as partial implementations.
   * ISO 8601: http://en.wikipedia.org/wiki/ISO_8601
   *
   * If all above fails, the function passes the given argument to Date constructor.
   *
   * @param {Date|String|Number} argument - the value to convert
   * @param {Object} [options] - the object with options
   * @param {0 | 1 | 2} [options.additionalDigits=2] - the additional number of digits in the extended year format
   * @returns {Date} the parsed date in the local time zone
   *
   * @example
   * // Convert string '2014-02-11T11:30:30' to date:
   * var result = parse('2014-02-11T11:30:30')
   * //=> Tue Feb 11 2014 11:30:30
   *
   * @example
   * // Parse string '+02014101',
   * // if the additional number of digits in the extended year format is 1:
   * var result = parse('+02014101', {additionalDigits: 1})
   * //=> Fri Apr 11 2014 00:00:00
   */
  function parse (argument, dirtyOptions) {
    if (isDate(argument)) {
      // Prevent the date to lose the milliseconds when passed to new Date() in IE10
      return new Date(argument.getTime())
    } else if (typeof argument !== 'string') {
      return new Date(argument)
    }
  
    var options = dirtyOptions || {}
    var additionalDigits = options.additionalDigits
    if (additionalDigits == null) {
      additionalDigits = DEFAULT_ADDITIONAL_DIGITS
    } else {
      additionalDigits = Number(additionalDigits)
    }
  
    var dateStrings = splitDateString(argument)
  
    var parseYearResult = parseYear(dateStrings.date, additionalDigits)
    var year = parseYearResult.year
    var restDateString = parseYearResult.restDateString
  
    var date = parseDate(restDateString, year)
  
    if (date) {
      var timestamp = date.getTime()
      var time = 0
      var offset
  
      if (dateStrings.time) {
        time = parseTime(dateStrings.time)
      }
  
      if (dateStrings.timezone) {
        offset = parseTimezone(dateStrings.timezone)
      } else {
        // get offset accurate to hour in timezones that change offset
        offset = new Date(timestamp + time).getTimezoneOffset()
        offset = new Date(timestamp + time + offset * MILLISECONDS_IN_MINUTE).getTimezoneOffset()
      }
  
      return new Date(timestamp + time + offset * MILLISECONDS_IN_MINUTE)
    } else {
      return new Date(argument)
    }
  }
  
  function splitDateString (dateString) {
    var dateStrings = {}
    var array = dateString.split(parseTokenDateTimeDelimeter)
    var timeString
  
    if (parseTokenPlainTime.test(array[0])) {
      dateStrings.date = null
      timeString = array[0]
    } else {
      dateStrings.date = array[0]
      timeString = array[1]
    }
  
    if (timeString) {
      var token = parseTokenTimezone.exec(timeString)
      if (token) {
        dateStrings.time = timeString.replace(token[1], '')
        dateStrings.timezone = token[1]
      } else {
        dateStrings.time = timeString
      }
    }
  
    return dateStrings
  }
  
  function parseYear (dateString, additionalDigits) {
    var parseTokenYYY = parseTokensYYY[additionalDigits]
    var parseTokenYYYYY = parseTokensYYYYY[additionalDigits]
  
    var token
  
    // YYYY or ±YYYYY
    token = parseTokenYYYY.exec(dateString) || parseTokenYYYYY.exec(dateString)
    if (token) {
      var yearString = token[1]
      return {
        year: parseInt(yearString, 10),
        restDateString: dateString.slice(yearString.length)
      }
    }
  
    // YY or ±YYY
    token = parseTokenYY.exec(dateString) || parseTokenYYY.exec(dateString)
    if (token) {
      var centuryString = token[1]
      return {
        year: parseInt(centuryString, 10) * 100,
        restDateString: dateString.slice(centuryString.length)
      }
    }
  
    // Invalid ISO-formatted year
    return {
      year: null
    }
  }
  
  function parseDate (dateString, year) {
    // Invalid ISO-formatted year
    if (year === null) {
      return null
    }
  
    var token
    var date
    var month
    var week
  
    // YYYY
    if (dateString.length === 0) {
      date = new Date(0)
      date.setUTCFullYear(year)
      return date
    }
  
    // YYYY-MM
    token = parseTokenMM.exec(dateString)
    if (token) {
      date = new Date(0)
      month = parseInt(token[1], 10) - 1
      date.setUTCFullYear(year, month)
      return date
    }
  
    // YYYY-DDD or YYYYDDD
    token = parseTokenDDD.exec(dateString)
    if (token) {
      date = new Date(0)
      var dayOfYear = parseInt(token[1], 10)
      date.setUTCFullYear(year, 0, dayOfYear)
      return date
    }
  
    // YYYY-MM-DD or YYYYMMDD
    token = parseTokenMMDD.exec(dateString)
    if (token) {
      date = new Date(0)
      month = parseInt(token[1], 10) - 1
      var day = parseInt(token[2], 10)
      date.setUTCFullYear(year, month, day)
      return date
    }
  
    // YYYY-Www or YYYYWww
    token = parseTokenWww.exec(dateString)
    if (token) {
      week = parseInt(token[1], 10) - 1
      return dayOfISOYear(year, week)
    }
  
    // YYYY-Www-D or YYYYWwwD
    token = parseTokenWwwD.exec(dateString)
    if (token) {
      week = parseInt(token[1], 10) - 1
      var dayOfWeek = parseInt(token[2], 10) - 1
      return dayOfISOYear(year, week, dayOfWeek)
    }
  
    // Invalid ISO-formatted date
    return null
  }
  
  function parseTime (timeString) {
    var token
    var hours
    var minutes
  
    // hh
    token = parseTokenHH.exec(timeString)
    if (token) {
      hours = parseFloat(token[1].replace(',', '.'))
      return (hours % 24) * MILLISECONDS_IN_HOUR
    }
  
    // hh:mm or hhmm
    token = parseTokenHHMM.exec(timeString)
    if (token) {
      hours = parseInt(token[1], 10)
      minutes = parseFloat(token[2].replace(',', '.'))
      return (hours % 24) * MILLISECONDS_IN_HOUR +
        minutes * MILLISECONDS_IN_MINUTE
    }
  
    // hh:mm:ss or hhmmss
    token = parseTokenHHMMSS.exec(timeString)
    if (token) {
      hours = parseInt(token[1], 10)
      minutes = parseInt(token[2], 10)
      var seconds = parseFloat(token[3].replace(',', '.'))
      return (hours % 24) * MILLISECONDS_IN_HOUR +
        minutes * MILLISECONDS_IN_MINUTE +
        seconds * 1000
    }
  
    // Invalid ISO-formatted time
    return null
  }
  
  function parseTimezone (timezoneString) {
    var token
    var absoluteOffset
  
    // Z
    token = parseTokenTimezoneZ.exec(timezoneString)
    if (token) {
      return 0
    }
  
    // ±hh
    token = parseTokenTimezoneHH.exec(timezoneString)
    if (token) {
      absoluteOffset = parseInt(token[2], 10) * 60
      return (token[1] === '+') ? -absoluteOffset : absoluteOffset
    }
  
    // ±hh:mm or ±hhmm
    token = parseTokenTimezoneHHMM.exec(timezoneString)
    if (token) {
      absoluteOffset = parseInt(token[2], 10) * 60 + parseInt(token[3], 10)
      return (token[1] === '+') ? -absoluteOffset : absoluteOffset
    }
  
    return 0
  }
  
  function dayOfISOYear (isoYear, week, day) {
    week = week || 0
    day = day || 0
    var date = new Date(0)
    date.setUTCFullYear(isoYear, 0, 4)
    var fourthOfJanuaryDay = date.getUTCDay() || 7
    var diff = week * 7 + day + 1 - fourthOfJanuaryDay
    date.setUTCDate(date.getUTCDate() + diff)
    return date
  }
  
  module.exports = parse


/***/ }),
/* 121 */
/***/ (function(module, exports) {

  /**
   * @category Common Helpers
   * @summary Is the given argument an instance of Date?
   *
   * @description
   * Is the given argument an instance of Date?
   *
   * @param {*} argument - the argument to check
   * @returns {Boolean} the given argument is an instance of Date
   *
   * @example
   * // Is 'mayonnaise' a Date?
   * var result = isDate('mayonnaise')
   * //=> false
   */
  function isDate (argument) {
    return argument instanceof Date
  }
  
  module.exports = isDate


/***/ }),
/* 122 */
/***/ (function(module, exports) {

  module.exports = require("superagent");

/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _react = __webpack_require__(17);
  
  var _react2 = _interopRequireDefault(_react);
  
  var _App = __webpack_require__(53);
  
  var _App2 = _interopRequireDefault(_App);
  
  var _ErrorPage = __webpack_require__(35);
  
  var _ErrorPage2 = _interopRequireDefault(_ErrorPage);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = {
  
    path: '/error',
  
    action: function action(_ref) {
      var render = _ref.render,
          context = _ref.context,
          error = _ref.error;
  
      // console.log('error obj inside error index.js', error);
      return render(_react2.default.createElement(
        _App2.default,
        { context: context, error: error },
        _react2.default.createElement(_ErrorPage2.default, { error: error })
      ), error.status || 500);
    }
  }; /**
      * React Starter Kit (https://www.reactstarterkit.com/)
      *
      * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
      *
      * This source code is licensed under the MIT license found in the
      * LICENSE.txt file in the root directory of this source tree.
      */

/***/ }),
/* 124 */
/***/ (function(module, exports) {

  module.exports = require("./assets");

/***/ }),
/* 125 */
/***/ (function(module, exports) {

  module.exports = require("multer");

/***/ }),
/* 126 */
/***/ (function(module, exports) {

  module.exports = require("graphql-server-express");

/***/ }),
/* 127 */,
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  var express = __webpack_require__(8);
  var router = express.Router();
  
  //establish the webhook
  __webpack_require__(129);
  
  //mounted at /sg
  router.post('/', function (req, res) {
    //process incoming data from sg
    //probably save it to the db
    //replace the ngrok in sgWebook.js whenever necessary
    //Sg event webhook documentation:
    //https://sendgrid.com/docs/API_Reference/Webhooks/event.html
    res.send(200);
  });
  
  module.exports = router;

/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

  'use strict';
  
  var rp = __webpack_require__(130);
  var sg_const = __webpack_require__(131);
  // //test route
  // router.get('/test', function (req, res) {
  //   console.log('this is a test');
  //   res.send('this is a test');
  // });
  //route sg will post to
  // router.post('/', function (req, res) {
  //   console.log('req.body', req.body);
  //   res.send('posted at by sendgrid');
  // });
  //~~~~~post request to send-grid api setting up the webhook~~~~~//
  var options = {
    method: 'POST',
    uri: 'https://api.sendgrid.com/api/filter.setup.json',
    form: {
      api_user: sg_const.api_user,
      api_key: sg_const.api_key,
      name: "eventnotify",
      processed: 1,
      dropped: 1,
      deferred: 1,
      delivered: 1,
      bounce: 1,
      click: 1,
      open: 1,
      unsubscribe: 1,
      group_unsubscribe: 1,
      group_resubscribe: 1,
      spamreport: 1,
      url: "https://44c3b93d.ngrok.io/sg"
    }
  };
  rp(options).then(function (result) {
    logging.info('successfully connected to sendgrid webhook');
    console.log(result);
  }).catch(function (error) {
    logging.error('error with sendgrid webhook', error);
  });
  // //~~~~~~~~~~//
  // module.exports = router;

/***/ }),
/* 130 */
/***/ (function(module, exports) {

  module.exports = require("request-promise");

/***/ }),
/* 131 */
/***/ (function(module, exports) {

  "use strict";
  
  module.exports.api_user = "IF_mail";
  module.exports.api_key = "yLh6_foodistasty_q!WfT]7a";

/***/ })
/******/ ]);
//# sourceMappingURL=server.js.map