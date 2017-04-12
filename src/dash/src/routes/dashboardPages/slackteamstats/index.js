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
        query: '{teams(limit:5000){team_name, team_id, carts {_id, items{_id}}, deliveries{_id,cart}}}',
      }),
      credentials: 'include',
    });

    const {
      data
    } = await resp.json();
    if (!data || !data.teams) throw new Error('Failed to load teams.');


    //return <FlotCharts waypoints={data.waypoints} />;
    return <Slackteamstats teams={data.teams} teamId={context.query.id} teamName={context.query.teamname} />
    //return <Slackteamstats waypoints={data.waypoints} teams={data.teams} teamId={context.query.id} teamName={context.query.teamname} />;
  }

};
