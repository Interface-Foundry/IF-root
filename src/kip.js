/**
 * Convenience functions and process bootstrapping
 * @module kip
 */



require('colors')


var path = require('path')
var config = require('./config')

global.db = require('./db')
global.logging = require('./logging.js')

/**
 * Prints an error to the screen and returns true.
 * function(e, item) {
 *  if (kip.err(e)) return
 *  }
 * @member
 */
function error (e, message, data) {
  // only do stuff when there is an error`
  if (!e) {
    return false
  }

  if (typeof e === 'string') {
    if (message) {
      message = e + ', ' + message
    } else {
      message = e
    }
  } else if (e.message) {
    if (message) {
      message = e.message + ', ' + message
    } else {
      message = e.message
    }
  }

  console.error(('ERROR: ' + message).red)

  if (e.stack) {
    var stack = e.stack.split('\n').slice(1).join('\n')
  } else {
    var e = new Error()
    stack = e.stack.split('\n').slice(2).join('\n')
  }

  stack = stack.toString()
  console.error(stack.red)

  ;(new db.Error({
    message: message,
    stack: stack,
    data: data
  })).save()

  return true
}

// log all uncaught exceptions to the db
process.on('uncaughtException', e => {
  error(e, 'uncaught')
})

/**
 * Prints a nice log message
 */
function log () {
  var args = Array.prototype.slice.call(arguments).map((o) => {
    return ['string', 'number', 'boolean'].indexOf(typeof o) >= 0 ? o : JSON.stringify(o, null, 2)
  })
  console.log.apply(console, args)
}

/**
 * Does not print in production unless DEBUG=verbose
 */
function debug () {
  if ((process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') || process.env.DEBUG === 'verbose') {
    var e = new Error()
    var stack = e.stack.split('\n')[2]
    try {
      var filename = stack.split(':')[0].split(/[\( ]+/).pop()
      var line = stack.split(':')[1]
    } catch (e) {
      console.log(e.stack)
      filename = '?'
      line = '?'
    }
    var loc = path.relative(path.resolve(require.main.filename, '..'), filename) + ':' + line
    var args = ['debug'.cyan, loc.gray].concat(Array.prototype.slice.call(arguments))
    log.apply(null, args)
  }
}

/**
 * Creates a timer which can be used for performance monitoring
 * @param  {String} name name of the timer, like 'amazon search'
 * @return {Function} returns a function which can be used to print the time to the screen
 */
function timer (name) {
  name = name || ''
  var now = +new Date()
  debug(('starting timer: ' + name).green)
  return function (text) {
    text = text || ''
    debug(('timer:' + name + ':' + text).green, +new Date() - now)
  }
}

var ihazinternet
function icanhazinternet () {
  return new Promise((resolve, reject) => {
    if (typeof ihazinternet !== 'undefined') {
      return resolve(ihazinternet)
    }

    var request = require('request-promise')
    setTimeout(x => {
      console.log('timeout reached')
      if (typeof ihazinternet === 'undefined') {
        ihazinternet = false
        resolve(false)
      }
    }, 2000)

    console.log('requesting icanhazip.com')
    request('http://icanhazip.com').then(() => {
      if (typeof ihazinternet === 'undefined') {
        ihazinternet = true
        resolve(true)
      }
    }, () => {
      if (typeof ihazinternet === 'undefined') {
        ihazinternet = false
        resolve(false)
      }
    })
  })
}

/**
 * Allows you to save timestamps to the database for performance monitoring
 * @class SavedTimer
 * @param {String} name name of the timer, like "nlp"
 * @param {Object} meta any meta data that yo uwant to be saved, for monitoring and analysis
 */
var SavedTimer = function (name, meta) {
  if (!(this instanceof SavedTimer)) {
    return new SavedTimer(name, meta)
  }

  this.metric = new db.Metric({
    metric: name,
    data: meta
  })
  this.metric.data.checkpoints = []
  this.start = +new Date()
  this.last = 0
  this.tic('start')
}
/**
 * Finishes and saves all the timer data
 * @return {db.Metric}
 */
SavedTimer.prototype.stop = function () {
  this.tic('stop')
  return this.metric.save()
}

/**
 * Save the current timestamp with a label
 * @param  {String} label
 */
SavedTimer.prototype.tic = function (label) {
  var t = +new Date() - this.start
  var interval = t - this.last
  this.last = t
  console.log('timer:'.grey, this.metric.metric.yellow, label.cyan, t + 'ms', `(+${interval}ms)`.gray)
  this.metric.data.checkpoints.push({
    label: label,
    timestamp: t,
    interval: interval
  })
}

//
// let's you do total.$ to get "$2.99"
// example
//    var a = 2.5
//    console.log(a.$)
//    > "$2.50"
//
Object.defineProperty(Number.prototype, '$', {
  get: function() {
    return '$' + this.toFixed(2)
  }
})

module.exports = global.kip = {
  SavedTimer: SavedTimer,
  debug: debug,
  error: error,
  err: error,
  log: log,
  timer: timer,
  icanhazinternet: icanhazinternet,
  config: config
}
