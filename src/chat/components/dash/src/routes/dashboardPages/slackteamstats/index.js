import React from 'react';
import FlotCharts from './slackteamstats';

export default {

  path: '/slackteamstats',

  action(context) {
    return <FlotCharts teamId={context.query.id}/>;
  },

};
