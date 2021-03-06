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
    createTimeout: PropTypes.func,
    invoice: PropTypes.object
  }

  state = {
    tabs: []
  }

  clearHightlight = null

  _getTabs = ({ user, invoice, numItems, id, query, highlight = false }) => {
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
    }];
    if (invoice && invoice.display && user.id) {
      tabs.push({
        id: 4,
        tab: 'invoice',
        display: 'Invoice',
        icon: 'PriceTag',
        url: `/cart/${id}/m/invoice`
      });
    }
    return tabs;
  }

  componentWillMount() {
    const { user, invoice, cart: { items, id }, search: { query } } = this.props;
    const tabs = this._getTabs({ user, invoice, numItems: numberOfItems(items), id, query });

    this.setState({ tabs });
  }

  componentWillReceiveProps({ user, invoice, cart: { items, id }, search: { query } }) {
    const tabs = this._getTabs({ user, invoice, numItems: numberOfItems(items), id, query, highlight: items.length > this.props.cart.items.length });
    this.setState({ tabs });
    if (numberOfItems(items) > numberOfItems(this.props.cart.items)) {
      this.props.clearTimeouts();
      this.props.createTimeout(
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

export default Timeout(Tabs);