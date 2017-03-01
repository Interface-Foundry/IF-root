import React from 'react';
import SendMessage from './sendMessage';

export default {
  path: '/sendmessage',

  action(context) {
    return <SendMessage context={context}/>;
  },

};
