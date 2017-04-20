/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import App from '../components/App';

// Child routes
import home from './home';
import login from './login';
import team from './dashboardPages/team';
import slackteamstats from './dashboardPages/slackteamstats';
import sessions from './dashboardPages/sessions';
import sendMessage from './dashboardPages/sendMessage';
import blank from './dashboardPages/blank';
import amazoncsv from './dashboardPages/amazoncsv'
import error from './error';

import Header from '../components/Header';


import { ApolloClient, ApolloProvider, createNetworkInterface } from 'react-apollo';

const networkInterface = createNetworkInterface({
  uri: 'http://localhost:3000/graphql'
});

const client = new ApolloClient({
  networkInterface: networkInterface
});



export default [

  {
    path: '/login',
    children: [
      login,
    ],
    async action({ next, render, context }) {
      const component = await next();
      if (component === undefined) return component;
      return render(
        <App context={context}>{component}</App>
      );
    },
  },


  {
    path: '/',

  // keep in mind, routes are evaluated in order
    children: [
      home,
      slackteamstats,
      amazoncsv,
      blank,
      sessions,
      team,
      sendMessage,
      // place new routes before...
      // content,
      error,
    ],

    async action({ next, render, context }) {
      // console.log('inside dashboard');
      const component = await next();
      // console.log('inside dasdboard component', component);
      if (component === undefined) return component;
      return render(
        <ApolloProvider client={client}>
          <div>
            <Header />
            <div id="page-wrapper" className="page-wrapper">
              <App context={context}>{component}</App>
            </div>
          </div>
        </ApolloProvider>
      );
    },
  },
  {
    path: '/error',
    children: [
      error,
    ],
    async action({ next, render, context }) {
      // console.log('inside error');
      const component = await next();
      // console.log('inside error with component', component);
      if (component === undefined) return component;
      return render(
        <App context={context}>{component}</App>
      );
    },
  },
];
