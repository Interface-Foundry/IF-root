// react/components/App/Header.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';
import { Icon } from '../../../react-common/components';
import { Share, Cart } from '../../../react-common/kipsvg';
import { calculateItemTotal, displayCost } from '../../utils';

export default class Default extends Component {

  render() {
    const { 
      user, 
      cart,
      _toggleLoginScreen,
      _toggleSidenav
    } = this.props,
    total = calculateItemTotal(cart.items);

    return (
      <span className='default'>
        <button className='yellow sub'> <div> Checkout <br/> <span> {displayCost(total)} </span> </div>  <Cart/> </button>
        <button className='blue'> Share <Share/> </button>
      </span>
    );
  }
}