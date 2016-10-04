var winston = require('winston')

var logging

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
        level: 'error'
      })]
  })
}

module.exports = global.logging = logging
