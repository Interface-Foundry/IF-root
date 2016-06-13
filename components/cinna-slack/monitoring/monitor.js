var assert = require('assert');
var _ = require('lodash');
var cron = require('cron');
var co = require('co');
var config = require('config');
var prof_oak = require('./prof_oak');

var defaults = {
  cron: '0 0 0 * * *', // every hour (second, minute, hour, day of month, month, day of week)
  check: function* (){ throw new Error('Error check not implemented') }, // default to throw error.
  title: 'omg no name 😱'
};

function Monitor(options) {
  options = options || {};
  options = _.merge({}, defaults, options)

  var state = {
    okay: true,
    errors: [],
    errors_in_row: 0,
    last_error: false
  };

  var monitor = new cron.CronJob(options.cron, function() {
    console.log('checking ' + options.title);
    co(options.check).then(() => {
      console.log(options.title + ' is ok')
      state.okay = true;
      state.errors_in_row = 0;
    }).catch(e => {
      var err = {
        stack: e.stack,
        message: e.message,
        time: new Date()
      };

      console.log('error with ' + options.title);
      console.log(e.stack);

      state.last_error = err;
      state.errors.push(err);
      state.errors_in_row++;

      if (state.okay) {
        // first error, so we should do something special.
        state.okay = false;
        console.log('whoops, first alert');
        prof_oak.say('There was an error with ' + options.title + ',\n`' + e.stack + '`');
      } else {
        console.log('it happened again');
        if (state.errors_in_row % 10 === 0) {
          prof_oak.say('the error with ' + options.title + ' is still happening, @peter maybe you should fix this before it\'s too late.');
        }
      }
    })
  });

  monitor.start();
}


// check that mongodb is still up.
var mongo = Monitor({
  title: 'mongodb',
  cron: '0 * * * * *', // every effing minute
  check: function *() {
    var MongoClient = require('mongodb').MongoClient;

    var db = yield MongoClient.connect(config.mongodb.url);
    var messages = db.collection('messages');
    var m = yield messages.findOne({});
    assert(m);
    db.close();
  }
});

module.exports = Monitor;
