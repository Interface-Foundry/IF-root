
import React from 'react';
import Sessions from './sessions';

export default {

  path: '/sessions',

  action(context) {
    return <Sessions context={context} />;
  },

};
