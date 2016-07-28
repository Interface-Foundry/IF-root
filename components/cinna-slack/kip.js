var path = require('path');
var db = require('./db');
require('colors');

/**
 * Prints an error to the screen and returns true.
 * function(e, item) {
 *  if (kip.err(e)) return;
 *  }
 */
module.exports.err = function(e, message, data) {
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
module.exports.error = module.exports.err;

// log all uncaught exceptions to the db
process.on('uncaughtException', e => {
  module.exports.error(e, 'uncaught');
});


/**
 * Kills the process if there's an ERROR
 */
module.exports.fatal = function(e) {
  if (e) {
    console.error('FATAL ERROR 🔥💀'.red)
    console.error(e.toString().red);
    process.exit(1);
  }
}

/**
 * Prints a nice log message
 */
module.exports.log = function() {
  var args = Array.prototype.slice.call(arguments).map((o) => {
    return ['string', 'number', 'boolean'].indexOf(typeof o) >= 0 ? o : JSON.stringify(o, null, 2);
  });
  console.log.apply(console, args);
}

// fun alias
module.exports.prettyPrint = module.exports.log

/**
 * Does not print in production unless DEBUG=verbose
 */
module.exports.debug = function() {
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
    module.exports.log.apply(null, args)
  }
}

/**
 * GTFO
 */
module.exports.exit = function(code) {
  if (code && code > 0) {
    console.error(('kip exiting with code ' + code).red);
    process.exit(code);
  } else {
    console.log('kip exited successfully'.green);
    process.exit();
  }
}

module.exports.assert = function(val) {
  if (!val) {
    throw new Error('assertion failed');
  }
  return true;
}

module.exports.assertProperties = function() {
  var args = Array.prototype.slice.call(arguments);
  var obj = args[0];
  args.slice(1).map(p => {
    if (!obj.hasOwnProperty(p)) {
      throw new Error('assertProperties failed, property ' + p + ' does not exist');
    }
  })
  return true;
}

/**
 * Timer
 */
module.exports.timer = function(name) {
  name = name || '';
  var now = +new Date()
  module.exports.debug(('starting timer: ' + name).green);
  return function(text) {
    text = text || '';
    module.exports.debug(('timer:' + name + ':' + text).green, +new Date() - now);
  }
}
module.exports.time = module.exports.timer;

//
// A timer that saves timestamp information to the database.
// var search_timer = new kip.SavedTimer('search.timer', {query: 'arduino'}); (the meta data can be anything)
// search_timer.tic('hitting amazn api')
// search_timer.tic('got amazon api results')
// search_timer.stop();
// 
//
var SavedTimer = function(name, meta) {
  if (!(this instanceof SavedTimer)) {
    return new SavedTimer(name, meta);
  }

  this.metric = new db.Metric({
    metric: name,
    data: meta
  });
  this.metric.data.checkpoints = [];
  this.start = +new Date();
  this.last = 0;
  this.tic('start');
}

SavedTimer.prototype.stop = function() {
  this.tic('stop');
  return this.metric.save();
}


SavedTimer.prototype.tic = function(label) {
  var t = +new Date() - this.start;
  var interval = t - this.last;
  this.last = t;
  console.log('timer:'.grey, this.metric.metric.yellow, label.cyan, t + 'ms', `(+${interval}ms)`.gray)
  this.metric.data.checkpoints.push({
    label: label,
    timestamp: t,
    interval: interval
  })
}

module.exports.SavedTimer = SavedTimer;