// mint/react/components/Tabs/Tabs.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { numberOfItems } from '../../utils';
import { Icon } from '../../../react-common/components';

export default class Tabs extends Component {

  static propTypes = {
    selectTab: PropTypes.func,
    fetchInvoiceByCart: PropTypes.func,
    cart: PropTypes.object,
    search: PropTypes.object,
    tab: PropTypes.string,
    history: PropTypes.object,
    invoice: PropTypes.object
  }

  state = {
    tabs: []
  }

  clearHightlight = null

  _getTabs = ({ invoice, items, id, query, highlight = false }) => {
    const tabs = [{
      id: 1,
      tab: 'cart',
      icon: 'Home',
      url: `/cart/${id}`,
      display: `Cart (${numberOfItems(items)})`,
      highlight
    }, {
      id: 2,
      tab: 'search',
      icon: 'Search',
      url: `/cart/${id}?q=${query}`,
      display: 'Save'
    }, {
      id: 3,
      tab: 'cart',
      icon: 'Person',
      url: `${id}/m/share`,
      display: 'Share'
    }];
    if (this.clearHighlight) clearTimeout(this.clearHightlight);
    if (invoice && process.env.NODE_ENV === 'development') tabs.push({ tab: 'invoice', display: 'Invoice', icon: 'PriceTag' });
    return tabs;
  }

  componentWillMount() {
    const { invoice, cart: { items, id }, search: { query } } = this.props;
    const tabs = ::this._getTabs({ invoice, items, id, query });
    this.setState({ tabs });
  }

  componentWillReceiveProps({ invoice, cart: { items, id }, search: { query } }) {
    const tabs = ::this._getTabs({ invoice, items, id, query, highlight: items.length > this.props.cart.items.length });
    this.setState({ tabs });
    this.clearHightlight = setTimeout(() => this.setState({ tabs: tabs.map((tab) => ({ ...tab, highlight: false })) }), 3000);
  }

  render() {
    const { props: { tab, selectTab, history: { push } }, state: { tabs } } = this;

    return (
      <div className='tabs'>
        {
          tabs.map((t) => (
            <h1 key={t.id} onClick={() => {push(t.url); selectTab(t.tab);}} className={`${tab === t.tab && t.id !== 3 ? 'selected' : ''} ${t.highlight ? 'highlight' : ''}`}>
              <Icon icon={t.icon}/>
              <span>{t.display}</span>
            </h1>
          ))
        }
      </div>
    );
  }
}
