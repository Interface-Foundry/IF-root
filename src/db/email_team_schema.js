var mongoose = require('mongoose')

var emailTeamSchema = mongoose.Schema({
  team_id: String,
  emails: []
});

module.exports = mongoose.model('EmailTeam', emailTeamSchema);
