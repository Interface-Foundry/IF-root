var winston = require('winston');
var MongoDB = require('winston-mongodb').MongoDB;

var config = require('./config');

var logging;

// slight fix for mongodb stuff to work with config files
if (config.mongodb.url.indexOf('mongodb://') < 0) {
  config.mongodb.url = 'mongodb://' + config.mongodb.url;
}

var localConfig = {
  levels: {
    error: 0,
    warn: 1,
    data: 2,
    verbose: 3,
    info: 4,
    debug: 5,
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

console.log(config.logging.console.level);

var transports = [
  new (winston.transports.Console)({
    level: config.logging.console.level,
    colorize: config.logging.console.colorize,
    prettyPrint: config.logging.console.prettyPrint,
  })
];

if (config.logging.mongo.enabled) {
  transports.push(new MongoDB({
    level: 'error',
    db: config.mongodb.url,
    options: config.mongodb.options,
    collection: 'errors',
    label: 'winston',
    decolorize: true,
  }));
}

logging = new(winston.Logger)({
    transports: transports,
    colors: localConfig.colors,
    levels: localConfig.levels
  });

module.exports = global.logging = logging;
