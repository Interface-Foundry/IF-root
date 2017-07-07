// mint/react/components/Tabs/Tabs.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { numberOfItems } from '../../utils';
import { AlertBubble } from '../../../react-common/components';

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
    const { fetchInvoiceByCart, cart: { items, id  }, search: { query } } = this.props;
    fetchInvoiceByCart(id);
    const tabs = [{
      tab: 'cart',
      url: `/cart/${id}`,
      display: `Cart (${numberOfItems(items)})`
    }, {
      tab: 'search',
      url: `/cart/${id}?q=${query}`,
      display: 'Search'
    }];

    addInvoiceTab(tabs, true);
    this.setState({ tabs });
  }

  componentWillReceiveProps(nextProps) {
    const { invoice, cart: { items, id }, search: { query } } = nextProps,
    itemsChanged = items.length > this.props.cart.items.length,
      tabs = [{
        tab: 'cart',
        url: `/cart/${id}`,
        display: `Cart (${numberOfItems(items)})`,
        showBubble: itemsChanged
      }, {
        tab: 'search',
        url: `/cart/${id}?q=${query}`,
        display: 'Search'
      }];
    addInvoiceTab(tabs, invoice);
    this.setState({ tabs });
  }

  render() {
    const { props: { tab, selectTab, history: { push } }, state: { tabs } } = this;

    return (
      <div className='tabs'>
        {
          tabs.map((t) => (
            <h1 key={t.tab} onClick={() => {push(t.url); selectTab(t.tab);}} className={`${tab === t.tab ? 'selected' : ''}`}>
              {t.showBubble ? <AlertBubble  right={4} top={-6} /> : null}
              <span>{t.display}</span>
            </h1>

          ))
        }
      </div>
    );
  }
}