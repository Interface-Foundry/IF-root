// move this to logging.js ideally, just keeping here for now
const expressWinston = require('express-winston');
const logging = require('../../logging.js');
const winston = require('winston');

// enable google cloud logging in production and mint-dev
if (process.env.NODE_ENV === 'production') {
  require('@google/cloud-trace').start();
  require('@google/cloud-debug').start();
}

var ExpressLogger = {

  // logger that just does basics
  NormalLogger: function ExpressLogger () {
    var logger = expressWinston.logger({
      transports: [
        new winston.transports.Console({
          prettyPrint: true,
          colorize: true
        })
      ],
      skip: function(req, res) {
        if (res.statusCode >= 404) {
          return true;
        }
        return false;
      },
      winstonInstance: logging,
      meta: true,
      msg: 'HTTP {{req.method}} {{req.url}}',
      expressFormat: false,
      colorize: true
    });

    return logger;
  },

  // specialized logger for errors
  ErrorLogger: function ExpressErrorLogger () {
    var errorLogger = expressWinston.errorLogger({
      transports: [
        new winston.transports.Console({
          prettyPrint: true,
          colorize: true
        })
      ],
      winstonInstance: logging,
      msg: 'ERROR --> {{err.message}} {{res.statusCode}} {{req.method}}',
      dumpExceptions: true,
      showStack: true
    });

    return errorLogger;
  }
};

module.exports = ExpressLogger;
