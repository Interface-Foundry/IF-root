require('colors');

/**
 * Prints an error to the screen and returns true.
 * function(e, item) {
 *  if (kip.err(e)) return;
 *  }
 */
module.exports.err = function(e, message) {
  // only do stuff when there is an error`
  if (!e) {
    return false;
  }

  if (message) {
    console.error(('ERROR: ' + message).red);
  }

  if (e.stack) {
    console.error(e.stack.toString().red);
  } else {
    console.error(JSON.stringify(e).red);
  }

  return true;
};
module.exports.error = module.exports.err;


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
      arguments = ['debug:'.cyan].concat(Array.prototype.slice.call(arguments));
      module.exports.log.apply(null, arguments)
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
