var winston = require('winston')

var logging

var config = {
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
}

if (process.env.NODE_ENV !== 'test') {
  logging = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        colorize: true,
        prettyPrint: true
      })],
    colors: config.colors,
    levels: config.levels
  })
} else {
  logging = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        level: 'verbose',
        colorize: true,
        prettyPrint: true
      })],
    colors: config.colors,
    levels: config.levels
  })
}

module.exports = global.logging = logging
