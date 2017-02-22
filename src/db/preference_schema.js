var mongoose = require('mongoose')

var preferenceSchema = mongoose.Schema({
  // user who
  user_id: {type: String, required: true},
  model_name: {type: String, required: true},
  training: {type: Boolean, default: false},
  item: {},
  result: {},
  ts: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Preference', preferenceSchema)
