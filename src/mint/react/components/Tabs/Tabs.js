// mint/react/components/Tabs/Tabs.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { numberOfItems } from '../../utils';

export default class Tabs extends Component {

  static propTypes = {
    selectTab: PropTypes.func,
    cart: PropTypes.object,
    tab: PropTypes.string
  }

  render() {
    const { tab, selectTab, cart } = this.props,
      tabs = cart.kip_pay_allowed ? [{
        tab: 'cart',
        display: `Cart (${numberOfItems(cart.items)})`
      }, {
        tab: 'search',
        display: 'Search'
      }, {
        tab: 'invoice',
        display: 'Invoice'
      }] : [{
        tab: 'cart',
        display: `Cart (${numberOfItems(cart.items)})`
      }, {
        tab: 'search',
        display: 'Search'
      }];

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
