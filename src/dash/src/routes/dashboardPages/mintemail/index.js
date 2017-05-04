import React from 'react';
import MintEmail from './mintemail';
// import fetch from '../../core/fetch';
//import router from '../../sendgrid';

export default {

  path: '/mintemail',

  async action(context) {

    return <MintEmail />
  }

};
