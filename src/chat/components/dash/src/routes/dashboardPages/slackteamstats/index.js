import React from 'react';
import FlotCharts from './slackteamstats';

export default {

  path: '/slackteamstats',

    async action() {

    const resp = await fetch('/graphql', {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{waypoints{waypoint,data,food_session {id,active,mode,action,time_started,delivery_post}, user_id}}',
      }),
      credentials: 'include',
    });
    const { data } = await resp.json();
    if (!data || !data.waypoints) throw new Error('Failed to load waypoints.');
    return <FlotCharts waypoints={data.waypoints}/>;
  }

  // action(context) {
  //   return <FlotCharts teamId={context.query.id}/>;
  // },

};
