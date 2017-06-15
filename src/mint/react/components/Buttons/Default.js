// react/components/App/Header.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Icon } from '../../../react-common/components';
import { Cart } from '../../../react-common/kipsvg';
import { calculateItemTotal, displayCost } from '../../utils';

export default class Default extends Component {
  static propTypes = {
    push: PropTypes.func,
    cart: PropTypes.object,
    reorderCart: PropTypes.func,
    updateCart: PropTypes.func
  }

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
      push(`/cart/${cart.id}/m/share`);
    }
  }

  render() {
    const {
      cart,
      reorderCart,
      updateCart
    } = this.props,
      total = calculateItemTotal(cart.items);

    return (
      <div className='default'>
        {
          cart.locked ? <span>
            <button className='yellow sub' onClick={() => reorderCart(cart.id)}> Re-Order <br/> <span> {displayCost(total, cart.store_locale)} </span> </button>
            <button className='locked' onClick={() => updateCart({ ...cart, locked: false })}> <Icon icon='Locked'/> Unlock </button>
          </span> : <span>
            {cart.items.length === 0 ? <button className='yellow sub' disabled={true}> <div> Checkout <br/> <span> {displayCost(total, cart.store_locale)} </span> </div>  <Cart/> </button> : <button className='yellow sub'> <a href={`/api/cart/${cart.id}/checkout`}><div> Checkout <br/> <span> {displayCost(total, cart.store_locale)} </span> </div>  <Cart/></a> </button> }
            <button className='blue' onClick={::this._handleShare}> Share Cart <Icon icon='Person'/> </button>
          </span>
        }
      </div>
    );
  }
}
