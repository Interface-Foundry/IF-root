var winston = require('winston');

var logging = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      colorize: true,
      prettyPrint: true
    })
  ]
});

module.exports = global.logging = logging