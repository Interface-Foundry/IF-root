// mint/react/components/View/View.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Details from './Details';
import { ResultsContainer, ButtonsContainer, CartContainer, InvoiceContainer } from '../../containers';

export default class App extends Component {
  static propTypes = {
    tab: PropTypes.string,
    cart: PropTypes.object,
    history: PropTypes.object,
    selectTab: PropTypes.func,
    submitQuery: PropTypes.func,
    search: PropTypes.string,
    searchLoading: PropTypes.bool
  }

  componentWillReceiveProps(nextProps) {
    const { cart, searchLoading, submitQuery, tab, selectTab, search, history: { push,location, location: { search: locSearch } } } = nextProps;
    if (cart && !cart.ok) push('/newcart');
    else if (search && cart.store && !searchLoading && !this.props.searchLoading)
      submitQuery(search, cart.store, cart.store_locale);
    else if (search) selectTab('search');
    else if (!locSearch && tab === 'search') selectTab('cart'); // probably a better way than this
  }

  render() {
    const { tab } = this.props,
      props = this.props,
      containers = {
        'search': ResultsContainer,
        'cart': CartContainer,
        'invoice': InvoiceContainer
      },
      Component = containers[tab];

    return (
      <div className='view'>
        { tab === 'cart' ? <Details {...props} /> : null }
        { Component ? <Component /> : null }
        { tab === 'cart' ? <ButtonsContainer /> : null }
      </div>
    );
  }
}
