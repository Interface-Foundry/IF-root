var mongoose = require('mongoose')

var emailTeamSchema = mongoose.Schema({
  team_id: String,
  emails: [String]
});

module.exports = mongoose.model('EmailTeam', emailTeamSchema);
