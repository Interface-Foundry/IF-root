// mint/react/components/Tabs/Tabs.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { numberOfItems, Timeout } from '../../utils';
import { Icon } from '../../../react-common/components';

class Tabs extends Component {

  static propTypes = {
    selectTab: PropTypes.func,
    cart: PropTypes.object,
    search: PropTypes.object,
    tab: PropTypes.string,
    history: PropTypes.object,
    clearTimeouts: PropTypes.func,
    setTimeout: PropTypes.func,
  }

  state = {
    tabs: []
  }

  clearHightlight = null


  _getTabs = ({ invoice, numItems, id, query, highlight = false }) => {
    const tabs = [{
      id: 1,
      tab: 'cart',
      icon: 'Home',
      url: `/cart/${id}`,
      display: `Cart (${numItems})`,
      highlight
    }, {
      id: 2,
      tab: 'search',
      icon: 'Search',
      url: `/cart/${id}?q=${query}`,
      display: 'Save'
    }, {
      id: 3,
      tab: 'share',
      icon: 'Person',
      url: `/cart/${id}/m/share`,
      display: 'Share'
    }, {
      id: 4,
      icon: 'PriceTag',
      tab: 'invoice',
      url: `/cart/${id}`,
      display: 'Invoice'
    }];
    if (invoice && invoice.display) {
      tabs.push({ id: 4, tab: 'invoice', display: 'Invoice', icon: 'PriceTag' });
    }
    return tabs;
  }

  componentWillMount() {
    const { invoice, cart: { items, id }, search: { query } } = this.props;
    const tabs = this._getTabs({ invoice, numItems: numberOfItems(items), id, query });

    this.setState({ tabs });
  }

  componentWillReceiveProps({ invoice, cart: { items, id }, search: { query } }) {
    const tabs = this._getTabs({ invoice, numItems: numberOfItems(items), id, query, highlight: items.length > this.props.cart.items.length });
    this.setState({ tabs });
    if (numberOfItems(items) > numberOfItems(this.props.cart.items)) {
      this.props.clearTimeouts();
      this.props.setTimeout(
        () => this.setState(({ tabs }) => ({ tabs: tabs.map((tab) => ({ ...tab, highlight: false })) })),
        3000);
    }
  }

  render() {
    const { props: { tab, selectTab, history: { push } }, state: { tabs } } = this;

    return (
      <div className='tabs'>
        {
          tabs.map((t) => (
            <h1 key={t.id} onClick={() => {push(t.url); selectTab(t.tab);}} className={`${tab === t.tab ? 'selected' : ''} ${t.highlight ? 'highlight' : ''}`}>
              <Icon icon={t.icon}/>
              <span>{t.display}</span>
            </h1>
          ))
        }
      </div>
    );
  }
}

// const tabs = kip_pay_allowed ? [{
//   tab: 'cart',
//   url: `/cart/${id}`,
//   display: `Cart (${numberOfItems(items)})`
// }, {
//   tab: 'search',
//   url: `/cart/${id}?q=${query}`,
//   display: 'Search'
// }, {
//   tab: 'invoice',
//   display: 'Invoice'
// }] : [{
//   tab: 'cart',
//   url: `/cart/${id}`,
//   display: `Cart (${numberOfItems(items)})`
// }, {
//   tab: 'search',
//   url: `/cart/${id}?q=${query}`,
//   display: 'Search'
// }];


export default Timeout(Tabs);
