var winston = require('winston');
var MongoDB = require('winston-mongodb').MongoDB;
var path = require('path')

var userConfigFile = require('./config');

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
if (userConfigFile.logging.debugFileLine.enabled) {
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
      var loc = path.relative(path.resolve(require.main.filename, '..'), filename) + ':' + line
      return loc.gray + ' ' + msg
    } else {
      return msg
    }
  })
}





module.exports = global.logging = logging;
