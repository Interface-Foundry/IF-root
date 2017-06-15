// mint/react/components/View/View.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Details from './Details';
import Empty from './Empty';
import { ResultsContainer, ButtonsContainer, CartContainer, InvoiceContainer } from '../../newContainers';

export default class App extends Component {
  static propTypes = {
    tab: PropTypes.string,
    cart: PropTypes.object,
    user: PropTypes.object,
    likeCart: PropTypes.func,
    unlikeCart: PropTypes.func
  }

  render() {
    const { tab, cart, user, likeCart, unlikeCart } = this.props,
      containers = {
        'search': ResultsContainer,
        'cart': CartContainer,
        'invoice': InvoiceContainer
      },
      Component = containers[tab];

    return (
      <div className='view'>
        { tab === 'cart' ? <Details {...cart} user={user} likeCart={likeCart} unlikeCart={unlikeCart}/> : null }
        { Component ? <Component /> : null }
        { tab === 'cart' ? <ButtonsContainer /> : null }
      </div>
    );
  }
}
