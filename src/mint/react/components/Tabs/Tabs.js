// mint/react/components/Tabs/Tabs.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { numberOfItems } from '../../utils';
import { AlertBubble } from '../../../react-common/components';

export default class Tabs extends Component {

  static propTypes = {
    selectTab: PropTypes.func,
    cart: PropTypes.object,
    tab: PropTypes.string
  }

  state = {
    tabs: []
  }

  componentDidMount() {
    const { cart: { kip_pay_allowed, items } } = this.props;
    const tabs = kip_pay_allowed ? [{
      tab: 'cart',
      display: `Cart (${numberOfItems(items)})`
    }, {
      tab: 'search',
      display: 'Search'
    }, {
      tab: 'invoice',
      display: 'Invoice'
    }] : [{
      tab: 'cart',
      display: `Cart (${numberOfItems(items)})`
    }, {
      tab: 'search',
      display: 'Search'
    }];
    this.setState({ tabs });
  }

  componentWillReceiveProps(nextProps) {
    const { cart: { kip_pay_allowed, items } } = nextProps,
    itemsChanged = items.length > this.props.cart.items.length,
      tabs = kip_pay_allowed ? [{
        tab: 'cart',
        display: `Cart (${numberOfItems(items)})`,
        showBubble: itemsChanged
      }, {
        tab: 'search',
        display: 'Search'
      }, {
        tab: 'invoice',
        display: 'Invoice'
      }] : [{
        tab: 'cart',
        display: `Cart (${numberOfItems(items)})`,
        showBubble: itemsChanged
      }, {
        tab: 'search',
        display: 'Search'
      }];
    this.setState({ tabs });
  }

  render() {
    const { props: { tab, selectTab }, state: { tabs } } = this;

    return (
      <div className='tabs'>
        {
          tabs.map((t) => (
            <h1 key={t.tab} onClick={() => selectTab(t.tab)} className={`${tab === t.tab ? 'selected' : ''}`}>
              {t.showBubble ? <AlertBubble  right={4} top={-6} />:null}
              <span>{t.display}</span>
            </h1>
            
          ))
        }
      </div>
    );
  }
}
