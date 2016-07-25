var os = require('os');

/**
 * everyconfig reads the yaml files for the right environment
 */
var config = require("everyconfig")('.');
config.host = os.hostname();

module.exports = config;