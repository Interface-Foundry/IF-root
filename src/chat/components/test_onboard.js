var testbot = {
  team_id:'T0R6J00JW',
  access_token: 'xoxp-25222000642-25226799463-25867504995-3fe258a2aa',
  meta: {
    // we don't know yet.  onboarding figures it out
    initialized: false
  },
  bot: {
      bot_user_id: 'U0R6H9BKN',
      bot_access_token:'xoxb-25221317668-Dxc6t3qZmLa73JuiuHGrb7iD'
  },

  save: function() {}
}

require('./onboard')(testbot);
