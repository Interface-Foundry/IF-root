/**
 * Prints an error to the screen and returns true.
 * function(e, item) {
 *  if (kip.err(e)) return;
 *  }
 */
module.exports.err = function(e) {
    if (e) {
        console.error(e);
        return true;
    }
};

/**
 * Kills the process if there's an ERROR
 */
module.exports.fatal = function(e) {
    if (e) {
        console.error('FATAL ERROR 🔥💀')
        console.error(e);
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
