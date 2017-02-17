import React from 'react';
import FlotCharts from './slackteamstats';

export default {

  path: '/slackteamstats',

  action() {
    return <FlotCharts />;
  },

};
