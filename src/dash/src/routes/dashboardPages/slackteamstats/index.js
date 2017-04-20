import React from 'react';
import Slackteamstats from './slackteamstats';

export default {

  path: '/slackteamstats',


  async action(context) { 
      let resp;

      resp = await fetch('/graphql', {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `{teams{team_name, team_id}}`,
      }),
      credentials: 'include',
    });

    const {
      data
    } = await resp.json();
    if (!data || !data.teams) throw new Error('Failed to load teams.');
    return <Slackteamstats teams={data.teams}/>
  }

};
