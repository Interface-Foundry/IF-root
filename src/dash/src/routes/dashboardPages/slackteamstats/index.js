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
        query: `{deliveries{time_started, team_id, item_count, cart_total, chosen_restaurant, team{team_name}, items {item_name, user}}} `,
      }),
      // {carts{created_date, team{team_name}, type, item_count, cart_total, items{title}}}
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
