require('colors');

/**
 * Prints an error to the screen and returns true.
 * function(e, item) {
 *  if (kip.err(e)) return;
 *  }
 */
module.exports.err = function(e) {
    if (e) {
        console.error(e.toString().red);
        return true;
    }
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

// fun alias
module.exports.ohshit = module.exports.fatal;

/**
 * Prints a nice log message
 */
module.exports.log = function(o) {
    console.log(JSON.stringify(o, null, 2));
}

// fun alias
module.exports.prettyPrint = module.exports.log

/**
 * Only prints if you have the -v flag set
 */
module.exports.debug = function(o) {
    if (process.NODE_ENV !== 'production') {
        console.log(JSON.stringify(o, null, 2));
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
