import React from 'react';
import Team from './team';

export default {

  path: '/team',

  action(context) {
    return <Team teamId={context.query.id}/>;
  },

};
