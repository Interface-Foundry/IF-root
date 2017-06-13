// mint/react/components/View/View.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';

import Details from './Details'
import Invoice from './Invoice'
import { ResultsContainer, ButtonsContainer, CartContainer } from '../../newContainers';

export default class App extends Component {
  render() {
    const { tab, cart, user, likeCart, unlikeCart } = this.props,
          containers = {
            'search': ResultsContainer,
            'cart': CartContainer,
            'invoice': Invoice
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
