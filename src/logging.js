var winston = require('winston')

var logging

var testConfig = {
  levels: {
    error: 0,
    warn: 1,
    data: 2,
    debug: 3,
    log: 4,
    info: 5,
    verbose: 6,
    silly: 9
  },
  colors: {
    error: 'red',
    debug: 'blue',
    warn: 'yellow',
    data: 'grey',
    info: 'green',
    log: 'green',
    verbose: 'cyan',
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
      })
    ]
  })
} else {
  logging = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        level: 'data',
        levels: testConfig.levels,
        colors: testConfig.colors,
        colorize: true,
        prettyPrint: true
      })]
  })
}

module.exports = global.logging = logging
