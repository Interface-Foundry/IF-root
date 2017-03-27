
import React from 'react';
import Sessions from './sessions';

export default {

  path: '/sessions',

  async action(context) {
    const resp = await fetch('/graphql', {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{waypoints(limit:5000){ user_id, delivery_id, waypoint, timestamp, data, user { name, team { team_name, team_id }}, delivery { _id, team { team_name } }}, teams(limit:5000){team_name, team_id, carts {_id}}}',
      }),
      credentials: 'include',
    });
    const {
      data
    } = await resp.json();
    if (!data || !data.waypoints) throw new Error('Failed to load waypoints.');

    //return <FlotCharts waypoints={data.waypoints} />;
    return <Sessions waypoints={data.waypoints} teams={data.teams} teamId={context.query.id} teamName={context.query.teamname} />;
  }

};
