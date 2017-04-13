/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Home from './Home';
// import fetch from '../../core/fetch';

export default {

  path: '/',


  async action() {
    let resp;

    resp = await fetch('/graphql', {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{deliveries{time_started, team_id, item_count, cart_total, chosen_restaurant, team{team_name}, items {item_name, user}}}',
      }),
      //
      credentials: 'include',
    });

    const data = await resp.json();
    if (!data) throw new Error('Failed to load teams.');

    return <Home data={data} />
  }
};
