// mint/react/components/Tabs/Tabs.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { numberOfItems } from '../../utils';
import { AlertBubble } from '../../../react-common/components';
import { Icon } from '../../../react-common/components';

export default class Tabs extends Component {

  static propTypes = {
    selectTab: PropTypes.func,
    cart: PropTypes.object,
    search: PropTypes.object,
    tab: PropTypes.string,
    history: PropTypes.object
  }

  state = {
    tabs: []
  }

  componentDidMount() {
    const { cart: { items, id }, search: { query } } = this.props;
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
    },{
      id: 3,
      tab: 'cart',
      icon: 'Person',
      url: `${id}/m/share`,
      display: 'Share'
    }];
    this.setState({ tabs });
  }

  componentWillReceiveProps(nextProps) {
    const { cart: { items, id }, search: { query } } = nextProps,
    itemsChanged = items.length > this.props.cart.items.length,
      tabs = [{
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
      },{
        id: 3,
        tab: 'cart',
        icon: 'Person',
        url: `${id}/m/share`,
        display: 'Share'
      }];
    this.setState({ tabs });
  }

  render() {
    const { props: { tab, selectTab, history: { push } }, state: { tabs } } = this;

    return (
      <div className='tabs'>
        {
          tabs.map((t) => (
            <h1 key={t.id} onClick={() => {push(t.url); selectTab(t.tab);}} className={`${tab === t.tab && t.id !== 3 ? 'selected' : ''}`}>
              {t.showBubble ? <AlertBubble  right={4} top={-6} /> : null}
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
