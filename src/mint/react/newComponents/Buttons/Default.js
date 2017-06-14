// react/components/App/Header.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../react-common/components';
import { Share, Cart } from '../../../react-common/kipsvg';
import { calculateItemTotal, displayCost } from '../../utils';

export default class Default extends Component {
  _handleShare = () => {
    const { push, cart } = this.props;

    // TRY THIS FIRST FOR ANY BROWSER
    if (navigator.share !== undefined) {
      navigator.share({
          title: 'Kip Cart',
          text: 'Cart Name',
          url: 'cart.kipthis.com/URL'
        })
        .then(() => console.log('Successful share'))
        .catch(error => console.log('Error sharing:', error));
    } else {
      push(`/cart/${cart.id}/m/share`)
    }
  }

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
        <button className='yellow sub'> <a href={`/api/cart/${cart.id}/checkout`}><div> Checkout <br/> <span> {displayCost(total)} </span> </div>  <Cart/></a> </button>
        <button className='blue' onClick={::this._handleShare}> Share <Icon icon='Person'/> </button>
      </span>
    );
  }
}