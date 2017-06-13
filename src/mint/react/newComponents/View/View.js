// mint/react/components/View/View.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';

import Details from './Details'
import { ResultsContainer, ButtonsContainer, CartContainer, InvoiceContainer } from '../../newContainers';

export default class App extends Component {
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
