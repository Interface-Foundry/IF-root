var mongoose = require('mongoose')

var preferenceSchema = mongoose.Schema({
  // user who this is for
  user_id: {type: String, required: true},
  //
  model_name: {type: String, required: true},

  // is this a training example
  training: {type: Boolean, default: false},
  // is this a random example from a sample
  random: {type: Boolean, default: false},
  item: {},
  result: {},
  ts: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Preference', preferenceSchema)
