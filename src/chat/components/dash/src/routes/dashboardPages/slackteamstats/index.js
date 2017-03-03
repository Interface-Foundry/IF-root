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
        query: '{waypoints{user_id,delivery_id, waypoint, timestamp, user{name}}, deliveries{ id, team_id},teams{team_id, team_name}}',
      }),
      credentials: 'include',
    });
    const {
      data
    } = await resp.json();
    if (!data || !data.waypoints) throw new Error('Failed to load waypoints.');

    return <FlotCharts waypoints={data.waypoints} food_sessions={data.deliveries} teams={data.teams} teamId={context.query.id} teamName={context.query.teamname} />;
  }

};
