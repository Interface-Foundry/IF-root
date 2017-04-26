var mongoose = require('mongoose')

var scraperSchema = mongoose.Schema({
  user_id: String, 
  team_id: String,
  team_name: String,
  real_name: String,
  name: String,
  email: String,
  deleted: Boolean,
  ts: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Scraper', scraperSchema)
