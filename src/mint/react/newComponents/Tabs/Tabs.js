// mint/react/components/Tabs/Tabs.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';

export default class Tabs extends Component {

  render() {
    const { tab, selectTab, cart } = this.props,
          tabs = [
            { 
              tab: 'cart',
              display: `Cart (${cart.items.length})`
            },
            {
              tab: 'search',
              display: 'Search'
            },
            {
              tab: 'invoice',
              display: 'Invoice'
            }
          ];

    return (
      <div className='tabs'>
        {
          tabs.map((t) => (
            <h1 key={t.tab} onClick={() => selectTab(t.tab)} className={`${tab === t.tab ? 'selected' : ''}`}>
              <span>{t.display}</span>
            </h1>
          ))
        }
      </div>
    );
  }
}


