// mint/react/components/Tabs/Tabs.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { numberOfItems } from '../../utils';
import { AlertBubble } from '../../../react-common/components';
import { Icon } from '../../../react-common/components';

function addInvoiceTab(tabs, invoice) {
  if (invoice && process.env.NODE_ENV === 'development') {
    tabs.push({
      tab: 'invoice',
      display: 'Invoice'
    });
  }
}

export default class Tabs extends Component {

  static propTypes = {
    selectTab: PropTypes.func,
    fetchInvoiceByCart: PropTypes.func,
    cart: PropTypes.object,
    search: PropTypes.object,
    tab: PropTypes.string,
    history: PropTypes.object
  }

  state = {
    tabs: []
  }

  componentWillMount() {
    const { cart: { items, id  }, search: { query } } = this.props;
    // fetchInvoiceByCart(id);
    const tabs = [{
      id: 1,
      tab: 'cart',
      icon: 'Home',
      url: `/cart/${id}`,
      display: `Cart (${numberOfItems(items)})`
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

    addInvoiceTab(tabs, true);
    this.setState({ tabs });
  }
  componentDidMount() {
    const { cart } = this.props;
  }

  clearHightlight = null

  componentWillReceiveProps(nextProps) {
    const { invoice, cart: { items, id }, search: { query } } = nextProps,
    itemsChanged = items.length > this.props.cart.items.length,
      tabs = [{
        id: 1,
        tab: 'cart',
        icon: 'Home',
        url: `/cart/${id}`,
        display: `Cart (${numberOfItems(items)})`,
        highlight: itemsChanged
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
    clearTimeout(this.clearHightlight);
    addInvoiceTab(tabs, invoice);
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