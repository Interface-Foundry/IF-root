import React from 'react';
import SendMessage from './sendMessage';

export default {

  path: '/sendmessage',

 async action(context) {
 	const res = await fetch('/graphql', {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `{teams(team_id:"${context.query.id}") {bot_access_token, team_name members{value:dm, label:name, is_bot, is_admin, is_owner, is_primary_owner}}}`,
      }),
      credentials: 'include',
    });

    const {data} = await res.json();
    if (!data || !data.teams) throw new Error('Failed to load teams.');
    
    if (data.teams.length) {
    	let team = data.teams[0];
      return <SendMessage team_name={team.team_name} token={team.bot_access_token} members={team.members}/>;
    } else {
      return <SendMessage />
    }
  },

};
