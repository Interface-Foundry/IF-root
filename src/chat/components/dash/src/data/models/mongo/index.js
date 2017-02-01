var promisify = require('promisify-node')
var mongoose = promisify(require('mongoose'))
mongoose.Promise = global.Promise
var ensureIndexes = require('mongoose-hook-ensure-indexes')
var natural = require('natural')
var nounInflector = new natural.NounInflector()
var fs = require('fs')
import {getSchema} from '@risingstack/graffiti-mongoose';


if (mongoose.connection.readyState == 0) {
  mongoose.connect('mongodb://localhost:27017/foundry')
  var db_conn = mongoose.connection
  db_conn.on('error', function (err) {
    kip.error(err)
  })
  db_conn.on('open', function () {
    console.log('connected to mongodb', 'mongodb://localhost:27017/foundry')
  })
}

/**
 * This file lets us do things like:
 * db.Users.find({})
 * var user = new db.User()
 */
var files = fs.readdirSync(__dirname)

module.exports = {
  connection: mongoose.connection,
  collection: mongoose.collection
}

/**
 * Expose all the single and plural versions
 */
files.map(function (f) {
  if (!f.match('_schema.js')) return

 console.log('loading'.gray, f.gray)

  try {
    var model = require('./' + f)
  } catch(e) {
    console.error('Error setting up schema ' + f)
    console.error(e)
    return
  }

  var name = f.replace('_schema.js', '')

  module.exports[capitalize(nounInflector.singularize(name))] = model
  module.exports[nounInflector.singularize(name)] = model
  module.exports[capitalize(nounInflector.pluralize(name))] = model
  module.exports[nounInflector.pluralize(name)] = model
  model.schema.plugin(ensureIndexes, {
    mongoose: mongoose
  })
})

function capitalize (s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Expose a function called "map" which iterates over each collection.
 */
module.exports.map = function (cb) {
  schemas.map(function (schema) {
    return module.exports[nounInflector.singularize(name)]
  }).map(cb)
}
