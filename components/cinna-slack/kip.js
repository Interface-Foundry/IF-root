var path = require('path');
require('colors');
global.db = require('./db');

/**
 * Prints an error to the screen and returns true.
 * function(e, item) {
 *  if (kip.err(e)) return;
 *  }
 */
function error(e, message, data) {
  // only do stuff when there is an error`
  if (!e) {
    return false;
  }

  if (typeof e === 'string') {
    if (message) {
      message = e + ', ' + message;
    } else {
      message = e;
    }
  } else if (e.message) {
    if (message) {
      message = e.message + ', ' + message;
    } else {
      message = e.message;
    }
  }

  console.error(('ERROR: ' + message).red);

  if (e.stack) {
    var stack = e.stack.split('\n').slice(1).join('\n');
  } else {
    var e = new Error();
    stack = e.stack.split('\n').slice(2).join('\n');
  }

  stack = stack.toString();
  console.error(stack.red);

  (new db.Error({
    message: message,
    stack: stack,
    data: data
  })).save();

  return true;
};

// log all uncaught exceptions to the db
process.on('uncaughtException', e => {
  error(e, 'uncaught');
});

/**
 * Prints a nice log message
 */
function log() {
  var args = Array.prototype.slice.call(arguments).map((o) => {
    return ['string', 'number', 'boolean'].indexOf(typeof o) >= 0 ? o : JSON.stringify(o, null, 2);
  });
  console.log.apply(console, args);
}

/**
 * Does not print in production unless DEBUG=verbose
 */
function debug() {
  if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'verbose') {
    var e = new Error();
    var stack = e.stack.split('\n')[2];
    try {
      var filename = stack.split(':')[0].split(/[\( ]+/).pop();
      var line = stack.split(':')[1];
    } catch (e) {
      console.log(e.stack);
      filename = '?';
      line = '?';
    }
    var loc = path.relative(path.resolve(require.main.filename, '..'), filename) + ':' + line;
    var args = ['debug'.cyan, loc.gray].concat(Array.prototype.slice.call(arguments));
    log.apply(null, args)
  }
}

/**
 * Timer
 */
function timer(name) {
  name = name || '';
  var now = +new Date()
  debug(('starting timer: ' + name).green);
  return function(text) {
    text = text || '';
    debug(('timer:' + name + ':' + text).green, +new Date() - now);
  }
}

module.exports = global.kip = {
  debug: debug,
  error: error,
  err: error,
  log: log,
  timer: timer
}
