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

      //Hard coded data
  var jsonData = {
    "data": {
        "deliveries": [
          {
            "time_started": "Wed Mar 01 2017 14:01:58 GMT-0800 (PST)",
            "team_id": "T167QHT5M",
            "item_count": 1,
            "cart_total": "29.27",
            "chosen_restaurant": "Bareburger - Chelsea",
            "items": [
              {
                "item_name": "Berry Blue Salad (N,GF)",
                "user": "U166949PD"
              }
            ]
          },
          {
            "time_started": "Thu Mar 02 2017 09:12:33 GMT-0800 (PST)",
            "team_id": "T167QHT5M",
            "item_count": 1,
            "cart_total": "40.65",
            "chosen_restaurant": "Alpha Fusion",
            "items": [
              {
                "item_name": "Tartar with Wasabi Yuzu Sauce",
                "user": "U166949PD"
              }
            ]
          },
          {
            "time_started": "Thu Mar 02 2017 09:18:34 GMT-0800 (PST)",
            "team_id": "T167QHT5M",
            "item_count": 1,
            "cart_total": "45.49",
            "chosen_restaurant": "Alpha Fusion",
            "items": [
              {
                "item_name": "Thai Lettuce Wrap",
                "user": "U166949PD"
              }
            ]
          },
          {
            "time_started": "Thu Mar 02 2017 09:21:15 GMT-0800 (PST)",
            "team_id": "T167QHT5M",
            "item_count": 1,
            "cart_total": "39.17",
            "chosen_restaurant": "Alpha Fusion",
            "items": [
              {
                "item_name": "Tartar with Wasabi Yuzu Sauce",
                "user": "U166949PD"
              }
            ]
          },
          {
            "time_started": "Fri Mar 03 2017 10:24:50 GMT-0800 (PST)",
            "team_id": "T167QHT5M",
            "item_count": 1,
            "cart_total": "25.3",
            "chosen_restaurant": "Sarge's Delicatessen & Diner",
            "items": [
              {
                "item_name": "Sarge's 11 oz. \"Monster\" Coffee Mug",
                "user": "U166949PD"
              }
            ]
          },
          {
            "time_started": "Fri Mar 03 2017 10:28:47 GMT-0800 (PST)",
            "team_id": "T167QHT5M",
            "item_count": 1,
            "cart_total": "34.17",
            "chosen_restaurant": "Sarge's Delicatessen & Diner",
            "items": [
              {
                "item_name": "Sarge's 11 oz. Coffee Mug",
                "user": "U39DDQWCR"
              }
            ]
          },
          {
            "time_started": "Fri Mar 03 2017 10:37:36 GMT-0800 (PST)",
            "team_id": "T167QHT5M",
            "item_count": 1,
            "cart_total": "38.02",
            "chosen_restaurant": "Sarge's Delicatessen & Diner",
            "items": [
              {
                "item_name": "Sarge's 16 oz. Soup Mug",
                "user": "U166949PD"
              }
            ]
          },
          {
            "time_started": "Fri Mar 03 2017 12:22:46 GMT-0800 (PST)",
            "team_id": "T167QHT5M",
            "item_count": 3,
            "cart_total": "65.16",
            "chosen_restaurant": "Sarge's Delicatessen & Diner",
            "items": [
              {
                "item_name": "Sarge's 11 oz. \"Monster\" Coffee Mug",
                "user": "U39DDQWCR"
              },
              {
                "item_name": "Sarge's 11 oz. \"Monster\" Coffee Mug",
                "user": "U166949PD"
              },
              {
                "item_name": "Sarge's 16 oz. Soup Mug",
                "user": "U166949PD"
              }
            ]
          }
        ]
    }
  }

    return <Home data={jsonData} />

    // const resp = await fetch('/graphql', {
    //   method: 'post',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     query: '{teams(limit:5000){members{id,name},deliveries{order, cart, payment_post}, team_name, carts {created_date, purchased_date, amazon, items {_id,title,image,price,ASIN,added_by}}}}',
    //   }),
    //   credentials: 'include',
    // });
    // const { data } = await resp.json();

    // if (!data || !data.teams) throw new Error('Failed to load the news feed.');
    // return <Home teams={data.teams} />;

  }
};
