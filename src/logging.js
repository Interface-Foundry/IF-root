var winston = require('winston');
var MongoDB = require('winston-mongodb').MongoDB;
var path = require('path')
require('colors')

var logging;

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

var level = process.env.LOGGING_LEVEL || 'info'

var level_message = "You're logging at level " + level
level_message += "\nerror < warn < data < info < verbose < debug < silly"
level_message = level_message.replace(new RegExp(level, 'g'), level.rainbow)
console.log(level_message);

var transports = [
  new (winston.transports.Console)({
    level: level,
    json: false,
    stringify: true,
    colorize: true,
    prettyPrint: true,
  })
]


var gcpTransport = (require('@google-cloud/logging-winston'))
if (typeof gcpTransport.log === 'function') {
  transports.push(gcpTransport)
}


if (process.env.LOGGING_MODE === 'database') {
  transports.push(new MongoDB({
    level: 'error',
    db: process.env.MONGODB_URL || 'mongodb://localhost:27017/mint',
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
if (true) {
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
