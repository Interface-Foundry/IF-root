var winston = require('winston')
var MongoDB = require('winston-mongodb').MongoDB

var configFiles = require('./config')

var logging

// slight fix for mongodb stuff to work with config files
if (configFiles.mongodb.url.indexOf('mongodb://') < 0) {
  configFiles.mongodb.url = `mongodb://` + configFiles.mongodb.url
}

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
      // console logger
      new (winston.transports.Console)({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        colorize: true,
        prettyPrint: true
      }),
      // log errors to mongodb
      new MongoDB({
        level: 'error',
        db: configFiles.mongodb.url,
        options: configFiles.mongodb.options,
        collection: 'errors',
        label: 'winston',
        decolorize: true
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
