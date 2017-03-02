import React from 'react';
import FlotCharts from './slackteamstats';

export default {

  path: '/slackteamstats',

  async action(context) {
    const resp = await fetch('/graphql', {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{waypoints{user_id,delivery_id, waypoint, timestamp}}',
      }),
      credentials: 'include',
    });
    const {
      data
    } = await resp.json();
    if (!data || !data.waypoints) throw new Error('Failed to load waypoints.');

    return <FlotCharts waypoints={data.waypoints} teamId={context.query.id} teamName={context.query.teamname} />;
  }

};
