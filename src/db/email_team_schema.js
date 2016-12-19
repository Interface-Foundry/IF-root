var emailTeamSchema = mongoose.schema({
  team_id: String,
  emails: [String]
});

module.exports = mongoose.model('EmailTeam', emailTeamSchema);
