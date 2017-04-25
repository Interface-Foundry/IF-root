var mongoose = require('mongoose')

var quizSchema = mongoose.Schema({
  // record quiz answer
  user_id: {type: String, required: true},
  team_id: {type: String, required: true},
  channel_id: {type: String, required: true},

  // which quiz is this for
  quiz_version: {type: String, required: true},
  answer: {type: Number, default: 0},
  question: String,
  active: {type: Boolean, default: true},
  ts: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Quiz', quizSchema)
