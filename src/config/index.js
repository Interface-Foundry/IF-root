var os = require('os');

/**
 * everyconfig reads the yaml files for the right environment
 */
var config = require("everyconfig")('.');
config.host = os.hostname();

/**
 * override hardcoded config values with environment vars for certain keys.
 */

overrideIf('LOGGING_CONSOLE_COLORIZE', function(val) {
	config.logging.console.colorize = asBool(val);
});

overrideIf('LOGGING_CONSOLE_PRETTYPRINT', function(val) {
	config.logging.console.prettyPrint = asBool(val);
});

overrideIf('PROXY_LUMINATI_ADDR', function(val) {
	config.proxy.luminati.addr = val;
});

function overrideIf(envKey, callback) {
	var stringVal = process.env[envKey];
	if (stringVal !== undefined) {
		callback(stringVal);
	}
}

function asBool(strVal) { return strVal === 'true' || strVal === 'TRUE'; }
function asInt(strVal) { return parseInt(strVal); }

module.exports = config;
