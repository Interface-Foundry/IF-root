// mint/react/components/Tabs/Tabs.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';

const tabs = [
  'Cart',
  'Search',
  'Invoice'
]

export default class Tabs extends Component {

  render() {
    const { tab, selectTab } = this.props;

    return (
      <div className='tabs'>
        {
          tabs.map((t) => (
            <h1 key={t} onClick={() => selectTab(t.toLowerCase())} className={`${tab.toUpperCase() === t.toUpperCase() ? 'selected' : ''}`}>
              <span>{t}</span>
            </h1>
          ))
        }
      </div>
    );
  }
}


